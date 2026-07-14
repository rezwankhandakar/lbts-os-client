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
  if (gpModel && chModel) return isFuzzyMatch(gpModel, chModel);
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

  const rowStatus = new Map();
  const assignMap = new Map(); // challanId → { csd, unit }
  const summary = { delivered: 0, partial: 0, pending: 0, return: 0, unbooked: 0, totalRows: 0 };

  for (const gp of gatePasses || []) {
    (gp.products || []).forEach((p, idx) => {
      const key = `${gp._id}|${p._id || idx}`;
      const gpQty = Number(p.quantity) || 0;
      const candidates = byDo.get(String(gp.tripDo ?? "").trim()) || [];

      let deliveredQty = 0, pendingQty = 0, returnQty = 0;
      const matches = [];
      const claimedRows = new Set(); // একই challan-row দুইবার গোনা এড়াতে

      for (const { ch, cp } of candidates) {
        const rowKey = `${ch._id}|${cp._id}`;
        if (claimedRows.has(rowKey)) continue;
        if (!productMatches(gp, p, ch, cp)) continue;
        claimedRows.add(rowKey);
        const qty = Number(cp.quantity) || 0;
        const st  = ch.status || "pending";
        if (st === "delivered" || st === "re-delivered") deliveredQty += qty;
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

      const bookedQty = deliveredQty + pendingQty + returnQty;
      let status;
      if (matches.length === 0)             status = "unbooked";
      else if (deliveredQty >= gpQty && gpQty > 0) status = "delivered";
      else if (deliveredQty > 0)            status = "partial";
      else if (returnQty > 0)               status = "return";
      else                                  status = "pending";

      rowStatus.set(key, { status, gpQty, deliveredQty, pendingQty, returnQty, bookedQty, matches });
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