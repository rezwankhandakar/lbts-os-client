// ════════════════════════════════════════════════════════════════════════
// Rate Matcher — central logic for resolving capacity + rate from a
// challan product row + the saved Location.
// ────────────────────────────────────────────────────────────────────────
// Two data sources:
//   1. WITH_MODEL_DATA      — products that need a model match
//                              (Refrigerator, Air Conditioner, Television,
//                               Oven, Washing Machine).
//      Match rule: user-typed product name must match a known product
//      (case-insensitive), AND any of the model keys must appear as a
//      SUBSTRING of the submitted model string (case-insensitive).
//      Example: submitted model "WFA-2A3-GDEL-XX" contains "2A3"
//               → matches Refrigerator row with model "2A3".
//
//   2. WITHOUT_MODEL_DATA   — products that don't need a model match.
//      Match rule: product name (case-insensitive) + location.
//      A few items (Gas Stove, Air Cooler, Weight Machine) have
//      multiple capacity rows.  When that's the case AND no capacity
//      is yet selected, the matcher returns needsCapacity so the
//      Delivered page can prompt the user to pick the right capacity.
//
// ── FIX #55 — DB-backed custom entries ─────────────────────────────────
// উপরের দুটো file (withModelData.js / withoutModelData.js) এখন **baseline**।
// Admin "Product Rates" page থেকে যোগ করা row গুলো rateStore.js-এ থাকে আর
// এখানে baseline-এর **আগে** বসে। ফলে:
//   • নতুন product/model → কোনো code edit ছাড়াই কাজ করে
//   • একই product+model দিয়ে row বানালে baseline rate override হয়
// Overlay load না হলে (offline / প্রথম render) baseline দিয়েই আগের মতো চলে।
//
// Public API (অপরিবর্তিত — সব page আগের মতোই কাজ করবে):
//   findRate({ productName, model, location, capacity })
//     → { capacity, rate, source, needsCapacity }
//        - capacity:       resolved capacity string or "" if unknown
//        - rate:           resolved rate number or 0 if no match
//        - source:         "with-model" | "without-model" | "none"
//        - needsCapacity:  true when product is in without-model AND
//                          has multiple capacity rows AND user hasn't
//                          picked one yet
//
//   suggestProducts(query, limit = 8)   → [{ name, hasModel, isCustom }]
//   getCapacityOptions(productName)     → [string]
//   suggestCapacities(productName, query, limit)
//   productNeedsCapacityPick(productName)
//
// নতুন helper (Product Rates page + model typeahead এর জন্য):
//   getAllProducts()                          → [{ name, hasModel, isCustom }]
//   getModelOptions / suggestModels(product, query, limit)
//   describeMatch({ productName, model })     → কোন row-এ match হচ্ছে
//   countModelCollisions({ productName, model })
// ════════════════════════════════════════════════════════════════════════

import {
  WITH_MODEL_DATA,
  WITH_MODEL_PRODUCTS,
  WITH_MODEL_MODELS_BY_PRODUCT,
} from "./withModelData";
import {
  WITHOUT_MODEL_DATA,
  WITHOUT_MODEL_PRODUCTS,
  WITHOUT_MODEL_CAPACITY_BY_PRODUCT,
} from "./withoutModelData";
import {
  getCustomWithModel,
  getCustomWithoutModel,
  getRateVersion,
} from "./rateStore";

// Allowed location keys in the rate tables
const LOCATION_KEYS = ["ISD", "OSD-Metro", "OSD-Thana"];

/* ── helpers ───────────────────────────────────────────────────────── */

const norm = (s) => (s == null ? "" : String(s).trim().toLowerCase());

// Does big-string contain small-string (case insensitive)?
const includesCI = (big, small) => {
  const b = norm(big);
  const s = norm(small);
  return !!s && b.includes(s);
};

// Match product names liberally — user might type plural / extra spaces.
// We accept exact-match OR either-side substring (3+ char) to forgive
// minor typos on common products.
const productMatches = (typed, candidate) => {
  const a = norm(typed);
  const b = norm(candidate);
  if (!a || !b) return false;
  if (a === b) return true;
  // Allow substring match in either direction so "Refrigerator " or
  // "fridge" (no, won't match) handles small variants.
  if (a.length >= 3 && b.includes(a)) return true;
  if (b.length >= 3 && a.includes(b)) return true;
  return false;
};

/* ── merged tables (baseline + custom), memoised by overlay version ── */

let _cache = null;
let _cacheVersion = -1;

function buildTables() {
  const customWith = getCustomWithModel();
  const customWithout = getCustomWithoutModel();

  // custom আগে → একই product+model থাকলে custom row জিতবে (override)
  const withModel = [...customWith, ...WITH_MODEL_DATA];
  const withoutModel = [...customWithout, ...WITHOUT_MODEL_DATA];

  // ── product name list ──
  const pushName = (list, seen, name, hasModel, isCustom) => {
    const clean = String(name || "").trim();
    if (!clean) return;
    const key = norm(clean);
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ name: clean, hasModel, isCustom });
  };

  const seen = new Set();
  const allProducts = [];
  WITH_MODEL_PRODUCTS.forEach((n) => pushName(allProducts, seen, n, true, false));
  WITHOUT_MODEL_PRODUCTS.forEach((n) => pushName(allProducts, seen, n, false, false));
  customWith.forEach((r) => pushName(allProducts, seen, r.product, true, true));
  customWithout.forEach((r) => pushName(allProducts, seen, r.product, false, true));

  // ── capacity options per without-model product ──
  // আগে এটা হাতে লেখা map ছিল (WITHOUT_MODEL_CAPACITY_BY_PRODUCT)। এখন
  // merged row থেকেই derive করি, তাই নতুন capacity variant যোগ করলে
  // Delivered page-এর dropdown-এ অটোমেটিক আসে। হাতে-লেখা map-ও union
  // করা হয় যাতে কোনো পুরনো entry বাদ না পড়ে।
  const capacityByProduct = {};
  const addCapacity = (product, capacity) => {
    const p = String(product || "").trim();
    const c = String(capacity || "").trim();
    if (!p || !c) return;
    const key = Object.keys(capacityByProduct).find((k) => norm(k) === norm(p)) || p;
    if (!capacityByProduct[key]) capacityByProduct[key] = [];
    if (!capacityByProduct[key].some((x) => norm(x) === norm(c))) {
      capacityByProduct[key].push(c);
    }
  };
  Object.entries(WITHOUT_MODEL_CAPACITY_BY_PRODUCT).forEach(([p, list]) =>
    list.forEach((c) => addCapacity(p, c))
  );
  withoutModel.forEach((r) => addCapacity(r.product, r.capacity));

  // ── model list per with-model product ──
  const modelsByProduct = {};
  const addModel = (product, model) => {
    const p = String(product || "").trim();
    const m = String(model || "").trim();
    if (!p || !m) return;
    const key = Object.keys(modelsByProduct).find((k) => norm(k) === norm(p)) || p;
    if (!modelsByProduct[key]) modelsByProduct[key] = [];
    if (!modelsByProduct[key].some((x) => norm(x) === norm(m))) {
      modelsByProduct[key].push(m);
    }
  };
  Object.entries(WITH_MODEL_MODELS_BY_PRODUCT).forEach(([p, list]) =>
    list.forEach((m) => addModel(p, m))
  );
  withModel.forEach((r) => addModel(r.product, r.model));

  return { withModel, withoutModel, allProducts, capacityByProduct, modelsByProduct };
}

function tables() {
  const v = getRateVersion();
  if (!_cache || _cacheVersion !== v) {
    _cache = buildTables();
    _cacheVersion = v;
  }
  return _cache;
}

/* ── main rate-finder ──────────────────────────────────────────────── */

/**
 * @param  {Object} args
 * @param  {string} args.productName  user-typed product name
 * @param  {string} args.model        user-typed model string
 * @param  {string} args.location     "ISD" | "OSD-Metro" | "OSD-Thana"
 * @param  {string} [args.capacity]   optional pre-selected capacity (for
 *                                    Delivered-page capacity column)
 * @return {Object} { capacity, rate, source, needsCapacity }
 */
export function findRate({ productName, model, location, capacity }) {
  const empty = { capacity: "", rate: 0, source: "none", needsCapacity: false };

  if (!productName || !location || !LOCATION_KEYS.includes(location)) {
    return empty;
  }

  const { withModel, withoutModel } = tables();

  // ── 1. Try WITH-MODEL first (more specific). ──
  // We try every with-model row; first hit wins.  Custom rows sit at the
  // front of the list, so an admin-added row overrides the built-in one.
  if (model) {
    for (const row of withModel) {
      if (!productMatches(productName, row.product)) continue;
      if (!includesCI(model, row.model)) continue;
      return {
        capacity: row.capacity || "",
        rate: Number(row[location]) || 0,
        source: "with-model",
        needsCapacity: false,
      };
    }
  }

  // ── 2. WITHOUT-MODEL. ──
  // Collect every row matching the product name.
  const rows = withoutModel.filter((row) => productMatches(productName, row.product));
  if (rows.length === 0) return empty;

  // 2a. If user explicitly passed a capacity, use the row that matches it.
  if (capacity && capacity.trim()) {
    const exact = rows.find((r) => norm(r.capacity) === norm(capacity));
    if (exact) {
      return {
        capacity: exact.capacity || "",
        rate: Number(exact[location]) || 0,
        source: "without-model",
        needsCapacity: false,
      };
    }
    // Capacity supplied but doesn't match → still flag needsCapacity so
    // caller knows the supplied capacity is invalid.
    return {
      capacity: "",
      rate: 0,
      source: "without-model",
      needsCapacity: rows.length > 1,
    };
  }

  // 2b. Single row → no ambiguity.  Use its capacity (likely null) & rate.
  if (rows.length === 1) {
    const r = rows[0];
    return {
      capacity: r.capacity || "",
      rate: Number(r[location]) || 0,
      source: "without-model",
      needsCapacity: false,
    };
  }

  // 2c. Multiple capacity variants and none picked yet — caller must
  //     prompt the user.  We return no rate; capacity stays empty.
  return {
    capacity: "",
    rate: 0,
    source: "without-model",
    needsCapacity: true,
  };
}

/* ── product-name typeahead suggestions ───────────────────────────── */

/** Full product list — { name, hasModel, isCustom } */
export function getAllProducts() {
  return tables().allProducts;
}

/**
 * Suggest product names matching `query` (1-2 letters is enough).
 * Returns up to `limit` items, sorted by:
 *   1. prefix match (best)
 *   2. substring match
 *   3. alphabetical
 */
export function suggestProducts(query, limit = 8) {
  const q = norm(query);
  if (!q) return [];
  const scored = [];
  for (const p of tables().allProducts) {
    const n = norm(p.name);
    let score = -1;
    if (n.startsWith(q)) score = 2;
    else if (n.includes(q)) score = 1;
    if (score >= 0) scored.push({ ...p, _score: score });
  }
  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return a.name.localeCompare(b.name);
  });
  return scored.slice(0, limit).map((item) => ({
    name: item.name,
    hasModel: item.hasModel,
    isCustom: !!item.isCustom,
  }));
}

/* ── capacity options (for Delivered-page capacity column) ─────────── */

/**
 * Return capacity choices for a without-model product (Gas Stove, Air
 * Cooler, etc.) or [] when the product doesn't need one.
 */
export function getCapacityOptions(productName) {
  if (!productName) return [];
  const map = tables().capacityByProduct;
  // Try direct map first
  const direct = map[productName];
  if (direct) return direct;
  // Fallback — case-insensitive lookup
  const key = Object.keys(map).find((k) => norm(k) === norm(productName));
  return key ? map[key] : [];
}

/**
 * Suggest capacity strings matching `query` for the given product.
 * Used by the Delivered-page capacity cell typeahead.
 */
export function suggestCapacities(productName, query, limit = 8) {
  const opts = getCapacityOptions(productName);
  if (!opts || opts.length === 0) return [];
  const q = norm(query);
  if (!q) return opts.slice(0, limit);
  return opts.filter((c) => norm(c).includes(q)).slice(0, limit);
}

/**
 * Convenience predicate — does this product need a capacity pick on the
 * Delivered page (i.e. without-model + multiple capacity variants)?
 */
export function productNeedsCapacityPick(productName) {
  return getCapacityOptions(productName).length > 1;
}

/* ── model typeahead (Product Rates page + future model fields) ────── */

/** Known model strings for a with-model product */
export function getModelOptions(productName) {
  if (!productName) return [];
  const map = tables().modelsByProduct;
  const direct = map[productName];
  if (direct) return direct;
  const key = Object.keys(map).find((k) => norm(k) === norm(productName));
  return key ? map[key] : [];
}

export function suggestModels(productName, query, limit = 10) {
  const opts = getModelOptions(productName);
  if (!opts.length) return [];
  const q = norm(query);
  if (!q) return opts.slice(0, limit);
  return opts.filter((m) => norm(m).includes(q)).slice(0, limit);
}

/* ── match explainer (admin preview / conflict warning) ────────────── */

/**
 * কোন row-এ match হচ্ছে সেটা ফেরত দেয় — Product Rates page-এ নতুন entry
 * সেভ করার আগে দেখানোর জন্য: "এটা এখন Refrigerator/2A3 (built-in) এ
 * match করছে — override করতে চান?"
 *
 * @return {null | { row, source, isCustom, matchedOn, variantCount? }}
 */
export function describeMatch({ productName, model }) {
  if (!productName) return null;
  const { withModel, withoutModel } = tables();

  if (model) {
    for (const row of withModel) {
      if (!productMatches(productName, row.product)) continue;
      if (!includesCI(model, row.model)) continue;
      return { row, source: "with-model", isCustom: !!row._custom, matchedOn: row.model };
    }
  }

  const rows = withoutModel.filter((r) => productMatches(productName, r.product));
  if (rows.length) {
    return {
      row: rows[0],
      source: "without-model",
      isCustom: !!rows[0]._custom,
      matchedOn: rows[0].product,
      variantCount: rows.length,
    };
  }
  return null;
}

/**
 * একটা model string কতগুলো ভিন্ন with-model row-এ match করে — খুব ছোট
 * model string (যেমন "A") দিলে ambiguity ধরার জন্য।
 */
export function countModelCollisions({ productName, model }) {
  if (!productName || !model) return 0;
  return tables().withModel.filter(
    (row) => productMatches(productName, row.product) && includesCI(model, row.model)
  ).length;
}