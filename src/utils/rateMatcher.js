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
//      is yet selected, the matcher returns the FIRST row's rate as a
//      provisional value with `capacity: ""` so the Delivered page can
//      prompt the user to pick the right capacity.  Once a capacity is
//      passed in, the exact row is used.
//
// Public API:
//   findRate({ productName, model, location, capacity })
//     → { capacity, rate, source, needsCapacity }
//        - capacity:       resolved capacity string or "" if unknown
//        - rate:           resolved rate number or 0 if no match
//        - source:         "with-model" | "without-model" | "none"
//        - needsCapacity:  true when product is in without-model AND
//                          has multiple capacity rows AND user hasn't
//                          picked one yet
//
//   suggestProducts(query, limit = 8)
//     → [{ name, hasModel }] for product-name typeahead
//
//   getCapacityOptions(productName)
//     → [string]  — capacity variants for a without-model product
// ════════════════════════════════════════════════════════════════════════

import { WITH_MODEL_DATA, WITH_MODEL_PRODUCTS } from "./withModelData";
import {
  WITHOUT_MODEL_DATA,
  WITHOUT_MODEL_PRODUCTS,
  WITHOUT_MODEL_CAPACITY_BY_PRODUCT,
} from "./withoutModelData";

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

  // ── 1. Try WITH-MODEL first (more specific). ──
  // We try every with-model row; first hit wins.  Because the same
  // product+model substring uniquely keys to a single capacity row, this
  // is fine.
  if (model) {
    for (const row of WITH_MODEL_DATA) {
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
  const rows = WITHOUT_MODEL_DATA.filter(
    (row) => productMatches(productName, row.product)
  );
  if (rows.length === 0) return empty;

  // 2a. If user explicitly passed a capacity, use the row that matches it.
  if (capacity && capacity.trim()) {
    const exact = rows.find(
      (r) => norm(r.capacity) === norm(capacity)
    );
    if (exact) {
      return {
        capacity: exact.capacity || "",
        rate: Number(exact[location]) || 0,
        source: "without-model",
        needsCapacity: false,
      };
    }
    // Capacity supplied but doesn't match → still return first row but
    // flag needsCapacity so caller knows the supplied capacity is invalid.
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

// Build a single unified list once.  `hasModel` lets the UI hint the
// user whether a Model is required.
const ALL_PRODUCTS = [
  ...WITH_MODEL_PRODUCTS.map((name) => ({ name, hasModel: true })),
  ...WITHOUT_MODEL_PRODUCTS.map((name) => ({ name, hasModel: false })),
];

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
  for (const p of ALL_PRODUCTS) {
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
  }));
}

/* ── capacity options (for Delivered-page capacity column) ─────────── */

/**
 * Return capacity choices for a without-model product (Gas Stove, Air
 * Cooler, etc.) or null/[] when the product doesn't need one.
 */
export function getCapacityOptions(productName) {
  if (!productName) return [];
  // Try direct map first
  const direct = WITHOUT_MODEL_CAPACITY_BY_PRODUCT[productName];
  if (direct) return direct;
  // Fallback — case-insensitive lookup
  const key = Object.keys(WITHOUT_MODEL_CAPACITY_BY_PRODUCT).find(
    (k) => norm(k) === norm(productName)
  );
  return key ? WITHOUT_MODEL_CAPACITY_BY_PRODUCT[key] : [];
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
  return opts
    .filter((c) => norm(c).includes(q))
    .slice(0, limit);
}

/**
 * Convenience predicate — does this product need a capacity pick on the
 * Delivered page (i.e. without-model + multiple capacity variants)?
 */
export function productNeedsCapacityPick(productName) {
  return getCapacityOptions(productName).length > 1;
}