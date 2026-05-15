// ═══════════════════════════════════════════════════════════════════
//  localAddressMatcher.js
//  Detect Thana + District from an address string WITHOUT calling AI.
// ═══════════════════════════════════════════════════════════════════
//
//  Strategy:
//    1. Tokenize the address (handles commas, "-", "/", numbers, etc.)
//    2. Build sliding n-grams (1..3 words) from the tokens.
//    3. For every district name, try to find it in the n-grams using:
//         a) Exact case-insensitive match
//         b) Normalised match (strip apostrophe, hyphens)
//         c) Fuzzy match (Levenshtein ≤ 1 for words ≤5 letters,
//                                       ≤ 2 for longer words)
//    4. Same for every thana name.
//    5. If a thana is found but its district disagrees with the
//       detected district, prefer the district that matches the thana
//       (multi-district thanas like "Kotwali" resolve to whichever
//       district was also spotted in the address).
//    6. Return { thana, district, confidence, matchSource }.
//
//  Designed to be FAST (synchronous, no network) and forgiving of
//  small/big letter casing and 1–2 letter typos.
// ═══════════════════════════════════════════════════════════════════

import {
  DISTRICTS_WITH_THANAS,
  ALL_DISTRICTS,
  ALL_THANAS,
  THANA_TO_DISTRICTS,
} from "./bangladeshData";

// ─────────────────────────────────────────────────────────────────
//  Normalisation helpers
// ─────────────────────────────────────────────────────────────────

/** Lowercase + drop punctuation that breaks word matching. */
export function normalise(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/['’`]/g, "")              // Cox's → coxs
    .replace(/[-_/\\.,;:()|]+/g, " ")   // hyphens / commas / slashes → space
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance (iterative, O(n*m) memory-light). */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const m = a.length;
  const n = b.length;
  // Quick exit when length gap is already too big
  if (Math.abs(m - n) > 3) return Math.abs(m - n);

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,         // insert
        prev[j] + 1,             // delete
        prev[j - 1] + cost       // substitute
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Acceptable edit distance based on word length. */
function maxAllowedDistance(word) {
  const len = word.length;
  if (len <= 3) return 0;     // too short — exact only
  if (len <= 5) return 1;     // 1 typo allowed
  if (len <= 8) return 1;     // still 1 typo (avoid false positives)
  return 2;                   // long words: 2 typos
}

/** Compare a candidate n-gram to a reference name (both already normalised). */
function isFuzzyMatch(candidate, reference) {
  if (candidate === reference) return { matched: true, exact: true };

  // Length sanity check
  if (Math.abs(candidate.length - reference.length) > 3) return { matched: false };

  const dist = levenshtein(candidate, reference);
  const maxAllowed = maxAllowedDistance(reference);
  if (dist <= maxAllowed) {
    return { matched: true, exact: false, distance: dist };
  }
  return { matched: false };
}

// ─────────────────────────────────────────────────────────────────
//  N-gram generator
// ─────────────────────────────────────────────────────────────────

/** Pull every 1–3 word window from a normalised address. */
function buildNGrams(normalisedAddr) {
  const tokens = normalisedAddr.split(" ").filter(Boolean);
  const grams = [];
  for (let i = 0; i < tokens.length; i++) {
    grams.push({ text: tokens[i], start: i, length: 1 });
    if (i + 1 < tokens.length) {
      grams.push({ text: tokens[i] + " " + tokens[i + 1], start: i, length: 2 });
    }
    if (i + 2 < tokens.length) {
      grams.push({
        text: tokens[i] + " " + tokens[i + 1] + " " + tokens[i + 2],
        start: i,
        length: 3,
      });
    }
  }
  return grams;
}

// ─────────────────────────────────────────────────────────────────
//  Pre-computed lookup tables (build once)
// ─────────────────────────────────────────────────────────────────

const DISTRICT_LOOKUP = ALL_DISTRICTS.map((d) => ({
  original: d,
  norm: normalise(d),
}));

const THANA_LOOKUP = (() => {
  const list = [];
  const seenForCanonical = new Map(); // canonical norm → Set of alias norms

  for (const { thana, district } of ALL_THANAS) {
    const norm = normalise(thana);
    list.push({ original: thana, district, norm });

    const seen = new Set([norm]);
    const pushAlias = (aliasNorm) => {
      if (!aliasNorm || seen.has(aliasNorm)) return;
      seen.add(aliasNorm);
      list.push({ original: thana, district, norm: aliasNorm, isAlias: true });
    };

    // Strip trailing modifiers one at a time, in cascading layers, so that
    //   "Cox's Bazar Sadar Model" yields aliases:
    //     "coxs bazar sadar"   (strip "model")
    //     "coxs bazar"         (strip "sadar model")
    //   "Mirpur Model"         → "mirpur"
    //   "Kotwali Model"        → "kotwali"
    //   "Kushtia Model (Sadar)" → "kushtia"
    const strippings = [
      norm.replace(/\s+model$/i, "").trim(),
      norm.replace(/\s+sadar model$/i, "").trim(),
      norm.replace(/\s+kotwali model$/i, "").trim(),
      norm.replace(/\s+sadar$/i, "").trim(),
      norm.replace(/\s+(sadar|model|metropolitan)(\s+(sadar|model))?$/i, "").trim(),
    ];
    for (const alt of strippings) {
      if (alt && alt !== norm) pushAlias(alt);
    }
  }
  return list;
})();

/**
 *  Enriched thana→districts map including alias forms so that
 *  detectThanaDistrict can disambiguate even after a fuzzy/alias hit.
 *  Key: normalised thana / alias.  Value: array of districts.
 */
const ENRICHED_THANA_TO_DISTRICTS = (() => {
  const map = new Map();
  for (const t of THANA_LOOKUP) {
    if (!map.has(t.norm)) map.set(t.norm, []);
    const arr = map.get(t.norm);
    if (!arr.includes(t.district)) arr.push(t.district);
  }
  return map;
})();

// ─────────────────────────────────────────────────────────────────
//  Match a list of references against the n-grams.
//  Returns ALL hits sorted by quality (best first), so the caller can
//  apply additional context (e.g. district preference) on top.
// ─────────────────────────────────────────────────────────────────
function findAllHits(grams, refs) {
  const hits = [];

  for (const gram of grams) {
    for (const ref of refs) {
      // First gate by length similarity to skip obvious mismatches fast
      if (Math.abs(gram.text.length - ref.norm.length) > 4) continue;

      const cmp = isFuzzyMatch(gram.text, ref.norm);
      if (!cmp.matched) continue;

      hits.push({
        ref,
        gram,
        exact: !!cmp.exact,
        distance: cmp.distance ?? 0,
      });
    }
  }

  // Sort: exact first, then shorter distance, then longer n-gram (more specific)
  hits.sort((a, b) => {
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return b.gram.length - a.gram.length;
  });

  return hits;
}

/** Backward-compatible single-best wrapper. */
function findBestHit(grams, refs) {
  const all = findAllHits(grams, refs);
  return all.length ? all[0] : null;
}

// ─────────────────────────────────────────────────────────────────
//  Public API: detectThanaDistrict
// ─────────────────────────────────────────────────────────────────

/**
 *  detectThanaDistrict(addressString)
 *    → {
 *        success      : boolean,
 *        thana        : string | null,
 *        district     : string | null,
 *        confidence   : 'high' | 'medium' | 'low',
 *        matchedThana : { exact, distance } | null,
 *        matchedDistrict: { exact, distance } | null,
 *        notes        : string,
 *      }
 *
 *  Designed to be called BEFORE the AI parser.  If both thana and
 *  district resolve confidently, the caller can skip the AI call.
 */
export function detectThanaDistrict(rawAddress) {
  const result = {
    success: false,
    thana: null,
    district: null,
    confidence: "low",
    matchedThana: null,
    matchedDistrict: null,
    notes: "",
  };

  if (!rawAddress || typeof rawAddress !== "string") return result;
  const normAddr = normalise(rawAddress);
  if (normAddr.length < 3) return result;

  const grams = buildNGrams(normAddr);
  if (!grams.length) return result;

  // 1) District scan — pick the best district hit
  const districtHits = findAllHits(grams, DISTRICT_LOOKUP);
  const districtHit = districtHits[0] || null;

  // 2) Thana scan — collect ALL hits, then disambiguate using district
  const allThanaHits = findAllHits(grams, THANA_LOOKUP);

  // Among equally-good thana hits, prefer one whose district matches
  // the address-level district (e.g. "Mirpur, Dhaka" → Mirpur Model/Dhaka,
  // not Mirpur/Kushtia).
  let thanaHit = null;
  if (allThanaHits.length) {
    const best = allThanaHits[0];

    // Find all hits that tie on quality with the best one.
    const tied = allThanaHits.filter(
      (h) =>
        h.exact === best.exact &&
        h.distance === best.distance &&
        h.gram.length === best.gram.length
    );

    if (districtHit) {
      const preferred = tied.find(
        (h) => h.ref.district === districtHit.ref.original
      );
      thanaHit = preferred || best;
    } else {
      thanaHit = best;
    }

    // ── False-positive guard ──
    // If the only evidence for the thana is the same n-gram that
    // already matched the district (e.g. "Bogura" → district Bogura
    // AND alias for "Bogura Sadar"), don't promote it to a thana
    // unless the n-gram is actually >1 word OR the thana's full
    // canonical name doesn't contain the district name.
    if (
      thanaHit &&
      districtHit &&
      thanaHit.gram.start === districtHit.gram.start &&
      thanaHit.gram.text === districtHit.gram.text
    ) {
      const thanaNorm = normalise(thanaHit.ref.original);
      const distNorm = normalise(districtHit.ref.original);
      // If the canonical thana name STARTS WITH the district name
      // (e.g. "Bogura Sadar" starts with "Bogura"), the match is
      // probably just the district being re-interpreted.
      if (thanaNorm === distNorm || thanaNorm.startsWith(distNorm + " ")) {
        thanaHit = null;
      }
    }
  }

  // ── Decide final district ──
  let finalDistrict = null;
  let finalThana = null;

  if (thanaHit) {
    finalThana = thanaHit.ref.original;

    // Multi-district thana? Look up every district it can belong to
    // (using the alias-aware map so "mirpur" returns BOTH Dhaka and Kushtia).
    const possibleDistricts = ENRICHED_THANA_TO_DISTRICTS.get(
      thanaHit.ref.norm
    ) || [thanaHit.ref.district];

    if (possibleDistricts.length === 1) {
      finalDistrict = possibleDistricts[0];
    } else if (districtHit && possibleDistricts.includes(districtHit.ref.original)) {
      // Address mentions a district that fits this thana — pick it.
      finalDistrict = districtHit.ref.original;
    } else if (districtHit) {
      // District mentioned but doesn't host this thana — trust the address-level
      // district more than the thana's first listing.
      finalDistrict = districtHit.ref.original;
    } else {
      // Ambiguous — fall back to the thana's first registered district.
      finalDistrict = thanaHit.ref.district;
      result.notes = `Thana "${finalThana}" exists in multiple districts; defaulted to ${finalDistrict}.`;
    }
  } else if (districtHit) {
    finalDistrict = districtHit.ref.original;
  }

  // ── Confidence scoring ──
  let confidence = "low";
  if (thanaHit && districtHit) {
    if (thanaHit.exact && districtHit.exact) confidence = "high";
    else confidence = "medium";
  } else if (thanaHit || districtHit) {
    confidence = (thanaHit?.exact || districtHit?.exact) ? "medium" : "low";
  }

  result.success = !!(finalThana || finalDistrict);
  result.thana = finalThana;
  result.district = finalDistrict;
  result.confidence = confidence;
  result.matchedThana = thanaHit
    ? { exact: thanaHit.exact, distance: thanaHit.distance, matchedText: thanaHit.gram.text }
    : null;
  result.matchedDistrict = districtHit
    ? { exact: districtHit.exact, distance: districtHit.distance, matchedText: districtHit.gram.text }
    : null;

  return result;
}

// ─────────────────────────────────────────────────────────────────
//  Public API: thana / district typeahead suggestions
// ─────────────────────────────────────────────────────────────────

/**
 *  suggestDistricts(query, limit=8)
 *    Returns districts whose name starts with / contains / is close to
 *    the user-typed query.  Useful from 1 character.
 */
export function suggestDistricts(query, limit = 8) {
  const q = normalise(query);
  if (!q) return [];

  const starts = [];
  const contains = [];
  const fuzzy = [];

  for (const d of DISTRICT_LOOKUP) {
    if (d.norm === q) {
      // exact — bubble to top
      starts.unshift(d.original);
    } else if (d.norm.startsWith(q)) {
      starts.push(d.original);
    } else if (d.norm.includes(q) && q.length >= 2) {
      contains.push(d.original);
    } else if (q.length >= 2) {
      const dist = levenshtein(q, d.norm.slice(0, q.length + 2));
      if (dist <= 1) fuzzy.push(d.original);
    }
  }
  return [...starts, ...contains, ...fuzzy].slice(0, limit);
}

/**
 *  suggestThanas(query, limit=10, filterDistrict=null)
 *    Returns thana suggestions.  If filterDistrict is provided,
 *    only thanas of that district are returned (helps disambiguate
 *    Kotwali/Sadar style names).
 *
 *  Each result: { thana, district }
 */
export function suggestThanas(query, limit = 10, filterDistrict = null) {
  const q = normalise(query);
  if (!q) return [];

  const source = filterDistrict
    ? THANA_LOOKUP.filter((t) => t.district === filterDistrict)
    : THANA_LOOKUP;

  const starts = [];
  const contains = [];
  const fuzzy = [];

  for (const t of source) {
    if (t.norm === q) starts.unshift({ thana: t.original, district: t.district });
    else if (t.norm.startsWith(q))
      starts.push({ thana: t.original, district: t.district });
    else if (t.norm.includes(q) && q.length >= 2)
      contains.push({ thana: t.original, district: t.district });
    else if (q.length >= 2) {
      const dist = levenshtein(q, t.norm.slice(0, q.length + 2));
      if (dist <= 1) fuzzy.push({ thana: t.original, district: t.district });
    }
  }
  const combined = [...starts, ...contains, ...fuzzy];

  // De-duplicate by thana+district (aliases of the same thana would otherwise
  // appear twice — once via canonical name, once via stripped alias).
  const seen = new Set();
  const unique = [];
  for (const item of combined) {
    const key = `${item.thana}|${item.district}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}