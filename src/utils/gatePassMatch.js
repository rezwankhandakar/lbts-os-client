/* ══════════════════════════════════════════════════════════════════
   Gate Pass ↔ Challan matching engine
   ──────────────────────────────────────────────────────────────────
   Gate pass আর challan আলাদা মানুষ আলাদা সময়ে entry করে, তাই
   Customer name / Model letter-by-letter না-ও মিলতে পারে
   ("Rahim Traders" vs "RAHIM TRADER", "RT-2020" vs "RT 2020")।
   এখানে normalize + fuzzy similarity দিয়ে verify করা হয়:

   ১. Trip Do হুবহু match করতেই হবে (এটাই primary key)
   ২. Customer name fuzzy-match করতে হবে (থ্রেশহোল্ড 0.72)
   ৩. Model fuzzy-match করতে হবে; model ফাঁকা হলে productName দিয়ে

   Similarity = exact(1.0) > contains(0.9) > bigram-dice coefficient
══════════════════════════════════════════════════════════════════ */

const MATCH_THRESHOLD = 0.72;

/* Model-এর জন্য আলাদা, কড়া threshold।
   Customer name-এ 0.72 ঠিক আছে ("Rahim Traders" vs "RAHIM TRADER"),
   কিন্তু model code-এ একই family-র sibling model গুলো মাত্র ১–২ অক্ষরে
   আলাদা হয় (WFA-2D4 / WFD-1D4 / WFD-1B6 / WFA-2A3) — এদের bigram
   similarity ~0.73 আসে, ফলে 0.72 threshold-এ এক gate-pass row একাধিক
   ভুল challan row-এর সাথে match হয়ে Delivered Qty ফুলে যেত (2-এর
   জায়গায় 6/2)। 0.85-এ sibling-রা আলাদা থাকে, অথচ prefix-হারানো split
   row ("2D4-GDEL-XX" vs "WFA-2D4-GDEL-XX") contains-rule-এ 0.9 পেয়ে
   ঠিকই match করে। */
const MODEL_MATCH_THRESHOLD = 0.85;

/** Lowercase + শুধু অক্ষর-সংখ্যা রাখা — space/dash/dot সব বাদ */
export const normalizeText = (s) =>
  String(s ?? "").toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, "");

/** Character-bigram Dice coefficient (0..1) */
const bigramDice = (a, b) => {
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const grams = (s) => {
    const m = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      m.set(g, (m.get(g) || 0) + 1);
    }
    return m;
  };
  const ga = grams(a), gb = grams(b);
  let overlap = 0;
  for (const [g, n] of ga) overlap += Math.min(n, gb.get(g) || 0);
  return (2 * overlap) / (a.length - 1 + b.length - 1);
};

/** 0..1 similarity between two raw strings */
export const textSimilarity = (rawA, rawB) => {
  const a = normalizeText(rawA), b = normalizeText(rawB);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  return bigramDice(a, b);
};

export const isFuzzyMatch = (a, b, threshold = MATCH_THRESHOLD) =>
  textSimilarity(a, b) >= threshold;

/**
 * Gate-pass product row কে challan product row-এর সাথে match করা যায় কিনা।
 * gp = gate pass doc, gpProduct = তার product; ch = challan doc, chProduct = তার product
 */
export const productMatches = (gp, gpProduct, ch, chProduct) => {
  // Trip Do exact (trim করা string হিসেবে)
  const gpDo = String(gp.tripDo ?? "").trim();
  const chDo = String(chProduct.tripDo ?? "").trim();
  if (!gpDo || gpDo !== chDo) return false;
  // Customer fuzzy
  if (!isFuzzyMatch(gp.customerName, ch.customerName)) return false;
  // Model fuzzy — দুই পাশেই model থাকলে model দিয়ে, নাহলে productName দিয়ে
  const gpModel = String(gpProduct.model ?? "").trim();
  const chModel = String(chProduct.model ?? "").trim();
  if (gpModel && chModel) return isFuzzyMatch(gpModel, chModel, MODEL_MATCH_THRESHOLD);
  return isFuzzyMatch(
    gpModel || gpProduct.productName,
    chModel || chProduct.productName
  );
};

/**
 * পুরো month-এর gate passes আর তাদের tripDo-linked challans নিয়ে
 * প্রতিটা gate-pass product row-এর delivery status বের করে।
 *
 * @returns {
 *   rowStatus:   Map<`${gp._id}|${productIdx}`, {
 *     status: 'delivered'|'partial'|'return'|'pending'|'unbooked',
 *     gpQty, deliveredQty, pendingQty, returnQty, bookedQty,
 *     matches: [{ challanId, tripNumber, status, qty, csd, unit }]
 *   }>,
 *   assignments: [{ challanId, csd, unit }]   // gp → matched challan-এ যা sync হবে
 *   summary:     { delivered, partial, pending, return: n, unbooked, totalRows }
 * }
 */
export const computeGatePassStatus = (gatePasses, challans) => {
  // tripDo → matching challan-product rows index (দ্রুত lookup-এর জন্য)
  const byDo = new Map();
  for (const ch of challans || []) {
    for (const cp of ch.products || []) {
      const key = String(cp.tripDo ?? "").trim();
      if (!key) continue;
      if (!byDo.has(key)) byDo.set(key, []);
      byDo.get(key).push({ ch, cp });
    }
  }

  /* Exact-model reservation index ──────────────────────────────────
     একই tripDo-তে কোন কোন gate-pass model (normalized) আছে তার set।
     কোনো challan row-এর model যদি এই set-এর কোনো GP model-এর সাথে
     হুবহু মিলে যায়, তাহলে সেই challan row-টা শুধু তার exact GP twin-ই
     claim করতে পারবে — অন্য কোনো GP row fuzzy দিয়ে সেটাকে টেনে নিয়ে
     নিজের Delivered Qty ফুলাতে পারবে না। (WFD-1D4 challan-টা GP-র
     WFD-1D4 row-এর, WFA-2D4 row fuzzy-তে ওটা গুনবে না।) */
  const gpModelsByDo = new Map(); // tripDo → Set<normalized model>
  for (const gp of gatePasses || []) {
    const doKey = String(gp.tripDo ?? "").trim();
    if (!doKey) continue;
    if (!gpModelsByDo.has(doKey)) gpModelsByDo.set(doKey, new Set());
    for (const p of gp.products || []) {
      const nm = normalizeText(p.model);
      if (nm) gpModelsByDo.get(doKey).add(nm);
    }
  }

  const rowStatus = new Map();
  const assignMap = new Map(); // challanId → { csd, unit }
  const summary = { delivered: 0, partial: 0, pending: 0, return: 0, unbooked: 0, totalRows: 0 };

  for (const gp of gatePasses || []) {
    (gp.products || []).forEach((p, idx) => {
      const key = `${gp._id}|${p._id || idx}`;
      const gpQty = Number(p.quantity) || 0;
      const gpDoKey = String(gp.tripDo ?? "").trim();
      const candidates = byDo.get(gpDoKey) || [];
      const exactSet = gpModelsByDo.get(gpDoKey);
      const gpNorm = normalizeText(p.model);

      let origDeliveredQty = 0, redeliveredQty = 0, pendingQty = 0, returnQty = 0;
      const matches = [];
      const claimedRows = new Set(); // একই challan-row দুইবার গোনা এড়াতে

      for (const { ch, cp } of candidates) {
        const rowKey = `${ch._id}|${cp._id}`;
        if (claimedRows.has(rowKey)) continue;
        // Reservation rule: challan model-টা অন্য কোনো GP row-এর সাথে
        // EXACT মিললে, fuzzy দিয়ে এই row-এ আনা যাবে না।
        const chNorm = normalizeText(cp.model);
        if (chNorm && exactSet?.has(chNorm) && chNorm !== gpNorm) continue;
        if (!productMatches(gp, p, ch, cp)) continue;
        claimedRows.add(rowKey);
        const qty = Number(cp.quantity) || 0;
        const st  = ch.status || "pending";
        if (st === "delivered") origDeliveredQty += qty;
        else if (st === "re-delivered") redeliveredQty += qty;
        else if (st === "return-pending") returnQty += qty;
        else pendingQty += qty;
        matches.push({
          challanId: ch._id, tripNumber: ch.tripNumber || "",
          status: st, qty, csd: ch.csd || "", unit: ch.unit || "",
        });
        // Sync assignment: gp-এর csd/unit matched challan-এ বসবে
        // (একই challan একাধিক gp-এ match হলে প্রথমটাই থাকে)
        if ((gp.csd || gp.unit) && !assignMap.has(String(ch._id))) {
          assignMap.set(String(ch._id), {
            challanId: String(ch._id),
            csd: gp.csd || "", unit: gp.unit || "",
          });
        }
      }

      const deliveredQty = origDeliveredQty + redeliveredQty;
      const bookedQty = deliveredQty + pendingQty + returnQty;
      /* Net delivered — কতগুলো এখন সত্যিই customer-এর কাছে আছে।
         প্রতিটা re-delivery তার আগের return-এর সমান qty cancel করে
         (ফেরত এসেছিল → আবার গেছে), তাই re-delivered qty-কে delivered-এ
         আলাদা করে যোগ করলে double-count হয়। জোড়া কাটাকাটির পর যা থাকে:
             net = original delivered − এখনো pending return
         উদাহরণ: 5 delivered, 2 return, 1 re-delivered, 1 return-pending
             → net = 5 − 1 = 4  (customer-এর কাছে ৪টা, ১টা এখনো ফেরার পথে)
         সব re-deliver হয়ে গেলে return-pending 0 → net আবার পূর্ণ। */
      const netDeliveredQty = Math.max(0, origDeliveredQty - returnQty);
      let status;
      if (matches.length === 0)                        status = "unbooked";
      else if (netDeliveredQty >= gpQty && gpQty > 0)  status = "delivered";
      else if (returnQty > 0)                          status = "return";
      else if (deliveredQty > 0)                       status = "partial";
      else                                             status = "pending";

      rowStatus.set(key, { status, gpQty, deliveredQty, netDeliveredQty, pendingQty, returnQty, redeliveredQty, bookedQty, matches });
      summary[status === "return" ? "return" : status] += 1;
      summary.totalRows += 1;
    });
  }

  return { rowStatus, assignments: [...assignMap.values()], summary };
};

export const STATUS_META = {
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "✓" },
  partial:   { label: "Partial",   cls: "bg-indigo-50 text-indigo-700 border-indigo-200",   dot: "◐" },
  return:    { label: "Return",    cls: "bg-orange-50 text-orange-600 border-orange-200",   dot: "↩" },
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-600 border-amber-200",      dot: "●" },
  unbooked:  { label: "Not Booked",cls: "bg-slate-100 text-slate-500 border-slate-200",     dot: "◌" },
};