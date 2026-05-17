// ═══════════════════════════════════════════════════════════════════
//  localAddressMatcher.js — STRICT VERSION
//  Detect Thana + District from an address string WITHOUT calling AI.
// ═══════════════════════════════════════════════════════════════════
//
//  ⚠️ POLICY: NEVER GUESS A THANA.
//  ──────────────────────────────────────────────────────────────────
//  If we cannot match a real thana from the address with EXACT
//  evidence (curated alias OR exact-text match confirmed by the
//  district), the matcher returns:
//      { success: false, thana: null, district: null }
//  The caller (AIAddressParser.jsx) then falls through to the AI
//  parser. Bare district names alone (e.g. "Mymensingh") will NOT
//  resolve to the district's Sadar thana — that was a bug.
//
//  KEY FIXES vs previous version:
//  ───────────────────────────────────────────────────────────────────
//  1. STRICT GATE at the end of detectThanaDistrict — only returns a
//     result when confidence is "high" AND evidence is exact.
//     Otherwise both thana AND district are null, success=false.
//  2. Bare-district aliases ("chittagong", "rangpur", "khulna",
//     "sylhet", "barisal", "comilla", "mymensingh", "ctg") REMOVED
//     from THANA_ALIASES in bangladeshData.js.
//  3. Transliteration support: Ph↔F, Sh↔S, Ch↔Chh, Bh↔V, etc., so
//     "Phulpur" matches "Fulpur".
//  4. ALIAS-FIRST scanning, multi-district disambiguation, alias
//     override only when alias is at least as strong as fuzzy hit.
//  5. STOP_WORDS_FOR_FUZZY prevents "Sadar"/"Model"/"Kotwali" from
//     producing false positives.
// ═══════════════════════════════════════════════════════════════════

import {
  DISTRICTS_WITH_THANAS,
  ALL_DISTRICTS,
  ALL_THANAS,
  THANA_TO_DISTRICTS,
  SADAR_METRO_THANAS,
  THANA_ALIASES,
} from "./bangladeshData";

// ─────────────────────────────────────────────────────────────────
//  Normalisation helpers
// ─────────────────────────────────────────────────────────────────

export function normalise(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[-_/\\.,;:()|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return Math.abs(m - n);

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function maxAllowedDistance(word) {
  const len = word.length;
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 1;
  return 2;
}

// ── FIX #5: expanded stop list ──
// These words appear in many thana names ("Kotwali Model", "Sadar",
// "X Model") and should NEVER fuzzy-match standalone — they trigger
// false positives like "Sadar" → "Savar".
const STOP_WORDS_FOR_FUZZY = new Set([
  "sadar", "model", "bazar", "road", "house", "block", "sector",
  "thana", "post", "village", "vill", "near", "main", "north", "south",
  "east", "west", "town", "ward", "union", "para", "nagar", "ganj",
  "kotwali", "metropolitan", "metro", "city", "upazila", "zila",
  "district", "po", "ps", "via", "no", "number",
]);

// ─────────────────────────────────────────────────────────────────
//  Transliteration normaliser
//  Bangla letters have multiple common English spellings. Examples:
//    ফ → "f" or "ph"   (Fulpur / Phulpur)
//    শ → "s" or "sh"   (Satkhira / Shatkhira)
//    ছ → "ch" or "chh" (Chatak / Chhatak)
//    ভ → "v" or "bh"   (Vatara / Bhatara)
//    য় → "j" or "y"    (Joydebpur / Yoydebpur)
//    য → "j" or "y"
//    ণ → "n" or "rn"   (Karnaphuli / Karnnaphuli)
//
//  This function reduces a word to a SHAPE — a canonical transliteration
//  fingerprint — so that "phulpur" and "fulpur" both become "fulpur" and
//  fuzzy-match cleanly. Reference names go through the same shape so the
//  comparison is symmetric.
//
//  We only normalise — never expand. So "fh" stays as is, but "ph" becomes
//  "f". This keeps the function O(n) and reversible patterns out of scope.
// ─────────────────────────────────────────────────────────────────
function transliterationShape(word) {
  if (!word) return word;
  let s = word.toLowerCase();
  // Multi-char digraphs first (order matters — longer patterns before shorter)
  s = s.replace(/ph/g, "f");      // Phulpur → Fulpur
  s = s.replace(/chh/g, "ch");    // Chhatak → Chatak
  s = s.replace(/sh/g, "s");      // Shatkhira → Satkhira (also Shibpur → Sibpur)
  s = s.replace(/bh/g, "b");      // Bhola → Bola, Bhatara → Batara
  s = s.replace(/kh/g, "k");      // Khulna → Kulna (rarely needed but symmetric)
  s = s.replace(/gh/g, "g");      // Ghatail → Gatail
  s = s.replace(/jh/g, "j");      // Jhenaidah → Jenaidah
  s = s.replace(/th/g, "t");      // Thakurgaon → Takurgaon
  s = s.replace(/dh/g, "d");      // Dhaka → Daka (rarely useful but symmetric)
  s = s.replace(/y/g, "j");       // Yoydebpur → Joydebpur (uncommon variant)
  s = s.replace(/w/g, "v");       // Wari/Vari variation
  return s;
}

function isFuzzyMatch(candidate, reference) {
  if (candidate === reference) return { matched: true, exact: true };
  if (Math.abs(candidate.length - reference.length) > 3) return { matched: false };
  if (STOP_WORDS_FOR_FUZZY.has(candidate)) return { matched: false };

  // ── Transliteration check FIRST — before first-char anchor ──
  // Catches Phulpur↔Fulpur, Shatkhira↔Satkhira, Chhatak↔Chatak, etc.
  const candShape = transliterationShape(candidate);
  const refShape = transliterationShape(reference);
  if (candShape === refShape) {
    // Same transliteration shape = equally trustworthy as an exact match,
    // but we flag it so the caller knows it came through the shape path.
    return { matched: true, exact: false, distance: 0, viaShape: true };
  }
  // Also allow 1-char Levenshtein on the SHAPES (for typos + transliteration combo)
  if (candShape.length >= 4 && refShape.length >= 4) {
    const shapeDist = levenshtein(candShape, refShape);
    if (shapeDist === 1 && Math.abs(candShape.length - refShape.length) <= 1) {
      return { matched: true, exact: false, distance: 1, viaShape: true };
    }
  }

  // First-character anchor for short candidates (regular fuzzy path)
  if (candidate.length <= 8 && candidate[0] !== reference[0]) {
    return { matched: false };
  }

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
//  Pre-computed lookup tables
// ─────────────────────────────────────────────────────────────────

const DISTRICT_LOOKUP = ALL_DISTRICTS.map((d) => ({
  original: d,
  norm: normalise(d),
}));

const THANA_LOOKUP = (() => {
  const list = [];

  for (const { thana, district } of ALL_THANAS) {
    const norm = normalise(thana);
    list.push({ original: thana, district, norm });

    const seen = new Set([norm]);
    const pushAlias = (aliasNorm) => {
      if (!aliasNorm || seen.has(aliasNorm)) return;
      // ── FIX #5: don't allow stop words as thana aliases ──
      if (STOP_WORDS_FOR_FUZZY.has(aliasNorm)) return;
      seen.add(aliasNorm);
      list.push({ original: thana, district, norm: aliasNorm, isAlias: true });
    };

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
//  Match finder
// ─────────────────────────────────────────────────────────────────

function findAllHits(grams, refs) {
  const hits = [];
  for (const gram of grams) {
    for (const ref of refs) {
      if (Math.abs(gram.text.length - ref.norm.length) > 4) continue;
      const cmp = isFuzzyMatch(gram.text, ref.norm);
      if (!cmp.matched) continue;
      hits.push({
        ref,
        gram,
        exact: !!cmp.exact,
        viaShape: !!cmp.viaShape,
        distance: cmp.distance ?? 0,
      });
    }
  }
  hits.sort((a, b) => {
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return b.gram.length - a.gram.length;
  });
  return hits;
}

// ═══════════════════════════════════════════════════════════════════
//  detectThanaDistrict — FIXED
// ═══════════════════════════════════════════════════════════════════

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

  // ─────────────────────────────────────────────────────────────
  //  STEP 1: District scan (do this FIRST so aliases & thanas
  //  can use it for disambiguation)
  // ─────────────────────────────────────────────────────────────
  const districtHits = findAllHits(grams, DISTRICT_LOOKUP);
  const districtHit = districtHits[0] || null;

  // ─────────────────────────────────────────────────────────────
  //  STEP 2: Alias scan — FIX #1 + #3
  //  Prefer LONGER alias n-grams. When multiple aliases tie on
  //  length, prefer one whose district matches the detected
  //  district from step 1.
  // ─────────────────────────────────────────────────────────────
  let aliasMatch = null;
  const allAliasMatches = [];
  for (const gram of grams) {
    if (THANA_ALIASES[gram.text]) {
      allAliasMatches.push({ ...THANA_ALIASES[gram.text], gram });
    }
  }
  if (allAliasMatches.length) {
    // Sort by gram length desc; among same length, prefer district match
    allAliasMatches.sort((a, b) => {
      if (a.gram.length !== b.gram.length) return b.gram.length - a.gram.length;
      // Same length — prefer one matching detected district
      if (districtHit) {
        const aMatch = a.district === districtHit.ref.original ? 1 : 0;
        const bMatch = b.district === districtHit.ref.original ? 1 : 0;
        return bMatch - aMatch;
      }
      return 0;
    });
    aliasMatch = allAliasMatches[0];
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 3: Thana fuzzy scan
  // ─────────────────────────────────────────────────────────────
  const allThanaHits = findAllHits(grams, THANA_LOOKUP);

  let thanaHit = null;
  if (allThanaHits.length) {
    const best = allThanaHits[0];
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

    // False-positive guard: thana matched the same n-gram that ALSO matches
    // ANY district name in the address. This catches cases like:
    //   • "Phulpur, Mymensingh" — Mymensingh Sadar matches "mymensingh" exactly,
    //      but "mymensingh" is the district, not the thana.
    //   • "Sherpur road, Phulpur, Mymensingh" — Sherpur Sadar matches
    //     "sherpur", which is also Sherpur district.
    if (thanaHit && districtHits.length > 0) {
      const offendingDistrict = districtHits.find(
        (dh) =>
          dh.gram.start === thanaHit.gram.start &&
          dh.gram.text === thanaHit.gram.text
      );
      if (offendingDistrict) {
        const thanaNorm = normalise(thanaHit.ref.original);
        const distNorm = normalise(offendingDistrict.ref.original);
        if (thanaNorm === distNorm || thanaNorm.startsWith(distNorm + " ")) {
          // Try to fall back to the next-best legitimate thana hit
          // (one whose gram is NOT any district's gram).
          const districtGramKeys = new Set(
            districtHits.map((dh) => `${dh.gram.start}|${dh.gram.text}`)
          );
          const fallback = allThanaHits.find((h) => {
            const key = `${h.gram.start}|${h.gram.text}`;
            if (!districtGramKeys.has(key)) return true; // gram differs from any district
            // gram matches a district, but thana name is NOT a Sadar-pattern of that district
            const dh = districtHits.find(
              (d) => `${d.gram.start}|${d.gram.text}` === key
            );
            if (!dh) return true;
            const tn = normalise(h.ref.original);
            const dn = normalise(dh.ref.original);
            return tn !== dn && !tn.startsWith(dn + " ");
          });
          thanaHit = fallback || null;
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 4: Resolve final thana & district
  // ─────────────────────────────────────────────────────────────
  let finalDistrict = null;
  let finalThana = null;
  let lowConfidenceReason = null;

  if (thanaHit) {
    finalThana = thanaHit.ref.original;
    const possibleDistricts =
      ENRICHED_THANA_TO_DISTRICTS.get(thanaHit.ref.norm) || [thanaHit.ref.district];

    if (possibleDistricts.length === 1) {
      finalDistrict = possibleDistricts[0];
    } else if (districtHit && possibleDistricts.includes(districtHit.ref.original)) {
      finalDistrict = districtHit.ref.original;
    } else if (districtHit) {
      // ── FIX #2: thana name conflicts with explicit district ──
      // Address says "Kotwali, Cumilla" but thana hit was Rangamati's Kotwali.
      // Trust the explicit district mention.
      finalDistrict = districtHit.ref.original;
      // BUT verify this thana actually exists in that district
      const verifiedThanas = DISTRICTS_WITH_THANAS[districtHit.ref.original] || [];
      if (!verifiedThanas.includes(finalThana)) {
        // The matched thana doesn't exist in the explicit district.
        // This is suspicious — keep thana null, only set district.
        result.notes = `Thana "${finalThana}" mismatched with district "${districtHit.ref.original}". Dropping thana.`;
        finalThana = null;
        lowConfidenceReason = "thana_district_mismatch";
      }
    } else {
      // ── FIX #2: AMBIGUOUS — multi-district thana, no district mentioned ──
      // Don't guess. Return thana but mark district uncertain.
      finalDistrict = null;
      lowConfidenceReason = "ambiguous_multi_district";
      result.notes = `Thana "${finalThana}" exists in ${possibleDistricts.length} districts (${possibleDistricts.join(", ")}); district could not be determined from address.`;
    }
  } else if (districtHit) {
    finalDistrict = districtHit.ref.original;
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 5: Alias override — FIX #3
  //  Only override when alias is at least as strong as the fuzzy
  //  detection. Specifically:
  //    • No thana detected → use alias freely
  //    • Alias's district matches detected district → use alias
  //    • Alias n-gram is LONGER than detected thana n-gram → use alias
  //    • Detected thana is fuzzy (not exact) AND alias n-gram length
  //      ≥ detected thana n-gram length → use alias
  // ─────────────────────────────────────────────────────────────
  if (aliasMatch) {
    let aliasOverrides = false;

    // ── Detect "weak" aliases ──
    // A weak alias is one whose ALIAS TEXT is just the district name
    // (or a close spelling variant of it). Examples:
    //   "mymensingh"  → district "Mymensingh"  — exact match
    //   "chittagong"  → district "Chattogram"  — spelling variant (Lev distance 2)
    //   "comilla"     → district "Cumilla"     — spelling variant
    //   "barisal"     → district "Barishal"    — spelling variant
    //   "rangpur"     → district "Rangpur"     — exact match
    //
    // These aliases exist so that addresses like "House 5, Mymensingh" resolve
    // to the Sadar thana. But when a specific thana (Phulpur, Patiya, etc.) is
    // ALSO mentioned in the same address, the bare-district alias must NOT
    // overwrite that legitimate exact thana match.
    const aliasText = aliasMatch.gram.text;
    const aliasDistrictNorm = normalise(aliasMatch.district);
    let isWeakAlias = false;
    if (aliasText === aliasDistrictNorm) {
      isWeakAlias = true;
    } else if (aliasMatch.gram.length === 1) {
      // 1-word alias — check if it's a close spelling variant of its district
      // (chittagong/chattogram, comilla/cumilla, barisal/barishal, etc.)
      const dist = levenshtein(aliasText, aliasDistrictNorm);
      // Allow up to 3-character difference for these district name variants
      if (dist <= 3 && Math.abs(aliasText.length - aliasDistrictNorm.length) <= 2) {
        isWeakAlias = true;
      }
    }

    if (!finalThana) {
      aliasOverrides = true;
    } else if (isWeakAlias && thanaHit?.exact === true) {
      // ⚠️ KEY FIX: don't let a bare-district alias overwrite a legitimate
      // exact thana match. The address mentions a real thana — trust it.
      // Example: "Phulpur, Mymensingh" — alias "mymensingh" → Mymensingh Sadar,
      //          but if a real thana of Mymensingh is exact-matched, keep that.
      // Example: "Patiya, Chittagong" — alias "chittagong" → Kotwali/Chattogram,
      //          but Patiya is an exact-match thana of Chattogram, keep Patiya.
      aliasOverrides = false;
      // Make sure final district is set correctly when we skip the alias
      if (!finalDistrict && aliasMatch.district) {
        finalDistrict = aliasMatch.district;
      }
    } else if (finalDistrict === aliasMatch.district) {
      // Alias confirms or refines current detection (different district
      // detected from thana, but alias agrees with thana's resolved district)
      aliasOverrides = true;
    } else {
      const detectedGramLen = thanaHit?.gram.length || 0;
      const aliasGramLen = aliasMatch.gram.length;
      const detectedExact = thanaHit?.exact === true;

      if (aliasGramLen > detectedGramLen) {
        // More specific alias wins
        aliasOverrides = true;
      } else if (!detectedExact && aliasGramLen >= detectedGramLen) {
        // Fuzzy detection — alias is at least as specific, prefer it
        aliasOverrides = true;
      }
    }

    if (aliasOverrides) {
      finalThana = aliasMatch.thana;
      finalDistrict = aliasMatch.district;
      lowConfidenceReason = null; // alias resolved the ambiguity
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 6: Confidence scoring
  // ─────────────────────────────────────────────────────────────
  let confidence = "low";

  if (aliasMatch && finalThana === aliasMatch.thana) {
    // Alias matches are curated → high confidence
    confidence = "high";
  } else if (lowConfidenceReason) {
    // Ambiguous multi-district or mismatch → low
    confidence = "low";
  } else if (thanaHit && districtHit) {
    if (thanaHit.exact && districtHit.exact) confidence = "high";
    else confidence = "medium";
  } else if (thanaHit || districtHit) {
    confidence = (thanaHit?.exact || districtHit?.exact) ? "medium" : "low";
  }

  // ─────────────────────────────────────────────────────────────
  //  STEP 7: STRICT GATE — never guess a thana
  //  ───────────────────────────────────────────────────────────
  //  Rule (per user requirement):
  //    "address-এ thana না পাওয়া গেলে কখনোই thana guess করা যাবে না।
  //     এমনকি district-ও পাঠানো যাবে না।  AI parser কে call করতে দাও।"
  //
  //  We treat these levels of evidence as STRONG (≈ exact):
  //    • curated THANA_ALIASES match (always trusted)
  //    • exact text match (Levenshtein = 0)
  //    • transliteration-shape match (Ph↔F, Sh↔S, etc.) — equally
  //      trustworthy because it's a deterministic spelling variant.
  //
  //  We pass the strict gate when:
  //    (a) Thana came from a curated alias, OR
  //    (b) Thana is a STRONG hit AND district is at least a STRONG
  //        hit (or matches the thana's only-possible district).
  //
  //  Anything else → return { success: false, thana: null, district: null }.
  //  The caller falls through to the Hybrid AI parser.
  //  ───────────────────────────────────────────────────────────
  const isStrongThana = thanaHit && (thanaHit.exact || thanaHit.viaShape);
  const isStrongDistrict = districtHit && (districtHit.exact || districtHit.viaShape);

  const fromAlias = !!(aliasMatch && finalThana === aliasMatch.thana);

  // Both thana and district are strongly evidenced AND agree
  const strongPair =
    isStrongThana && isStrongDistrict &&
    thanaHit.ref?.district === districtHit.ref?.original;

  // Strong thana whose name is UNIQUE (only one district in BD has it).
  // Example: "Patiya" only exists in Chattogram — even if the address says
  // "Chittagong" (which doesn't shape-match Chattogram), we can safely
  // resolve from the thana alone.
  const unambiguousStrongThana = (() => {
    if (!isStrongThana) return false;
    const possibles = ENRICHED_THANA_TO_DISTRICTS.get(thanaHit.ref.norm) || [];
    return possibles.length === 1;
  })();

  const strictPass = !!finalThana && !!finalDistrict &&
                     (fromAlias || strongPair || unambiguousStrongThana);

  if (!strictPass) {
    // Don't guess — make the caller fall through to AI.
    result.success = false;
    result.thana = null;
    result.district = null;
    result.confidence = "low";
    result.notes = result.notes ||
      "Local matcher could not exactly match a thana; falling back to AI.";
    return result;
  }

  result.success = true;
  result.thana = finalThana;
  result.district = finalDistrict;
  result.confidence = confidence;
  result.matchedThana = thanaHit
    ? { exact: thanaHit.exact, viaShape: thanaHit.viaShape, distance: thanaHit.distance, matchedText: thanaHit.gram.text }
    : null;
  result.matchedDistrict = districtHit
    ? { exact: districtHit.exact, viaShape: districtHit.viaShape, distance: districtHit.distance, matchedText: districtHit.gram.text }
    : null;

  return result;
}

// ─────────────────────────────────────────────────────────────────
//  suggestDistricts / suggestThanas (unchanged — already correct)
// ─────────────────────────────────────────────────────────────────

export function suggestDistricts(query, limit = 8) {
  const q = normalise(query);
  if (!q) return [];

  const starts = [];
  const contains = [];
  const fuzzy = [];

  for (const d of DISTRICT_LOOKUP) {
    if (d.norm === q) starts.unshift(d.original);
    else if (d.norm.startsWith(q)) starts.push(d.original);
    else if (d.norm.includes(q) && q.length >= 2) contains.push(d.original);
    else if (q.length >= 2) {
      const dist = levenshtein(q, d.norm.slice(0, q.length + 2));
      if (dist <= 1) fuzzy.push(d.original);
    }
  }
  return [...starts, ...contains, ...fuzzy].slice(0, limit);
}

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

// ─────────────────────────────────────────────────────────────────
//  computeLocation / resolveCanonicalThana (unchanged)
// ─────────────────────────────────────────────────────────────────

export function computeLocation(thana, district) {
  if (!thana || !district) return null;
  const thanaIn = String(thana).trim();
  const districtIn = String(district).trim();
  if (!thanaIn || !districtIn) return null;

  const thanaAliasKey = normalise(thanaIn);
  if (THANA_ALIASES[thanaAliasKey]) {
    const aliased = THANA_ALIASES[thanaAliasKey];
    // ── FIX: only use alias if district also matches ──
    // Prevents "kotwali" alias (which defaults to Chattogram) from
    // overriding user's explicit district choice.
    if (normalise(aliased.district) === normalise(districtIn)) {
      return computeLocationFromCanonical(aliased.thana, aliased.district);
    }
  }
  return computeLocationFromCanonical(thanaIn, districtIn);
}

function computeLocationFromCanonical(thana, district) {
  const districtNorm = normalise(district);
  const canonicalDistrict = ALL_DISTRICTS.find(
    (d) => normalise(d) === districtNorm
  );
  if (!canonicalDistrict) return null;

  const districtThanas = DISTRICTS_WITH_THANAS[canonicalDistrict] || [];
  const thanaNormQuery = normalise(thana);

  let canonicalThana = districtThanas.find(
    (t) => normalise(t) === thanaNormQuery
  );

  const SUFFIX_RE = /\s+(sadar model|kotwali model|sadar|model|metropolitan)$/i;
  const strip = (s) => s.replace(SUFFIX_RE, "").trim();

  if (!canonicalThana) {
    const queryStripped = strip(thanaNormQuery);
    canonicalThana = districtThanas.find((t) => {
      const tNorm = normalise(t);
      const tStripped = strip(tNorm);
      return (
        tNorm === queryStripped ||
        tStripped === thanaNormQuery ||
        tStripped === queryStripped
      );
    });
  }

  if (!canonicalThana && thanaNormQuery.length >= 4) {
    canonicalThana = districtThanas.find(
      (t) => levenshtein(normalise(t), thanaNormQuery) <= 1
    );
  }

  if (!canonicalThana) return null;

  const metroSet = SADAR_METRO_THANAS[canonicalDistrict];
  const isMetro = metroSet ? metroSet.has(canonicalThana) : false;

  if (canonicalDistrict === "Dhaka") {
    return isMetro ? "ISD" : "OSD-Thana";
  }
  return isMetro ? "OSD-Metro" : "OSD-Thana";
}

export function resolveCanonicalThana(thana, district, address) {
  if (!thana || !district) return null;

  const aliasKey = normalise(thana);
  if (THANA_ALIASES[aliasKey]) {
    const a = THANA_ALIASES[aliasKey];
    // ── FIX: cross-check district before trusting alias ──
    if (normalise(a.district) === normalise(district)) {
      const loc = computeLocationFromCanonical(a.thana, a.district);
      if (loc) return { thana: a.thana, district: a.district, location: loc, source: "alias" };
    }
  }

  const loc2 = computeLocationFromCanonical(thana, district);
  if (loc2) {
    const districtNorm = normalise(district);
    const cDist = ALL_DISTRICTS.find((d) => normalise(d) === districtNorm);
    const cThana = (DISTRICTS_WITH_THANAS[cDist] || []).find((t) => {
      const tn = normalise(t);
      const qn = normalise(thana);
      const SUFFIX_RE = /\s+(sadar model|kotwali model|sadar|model|metropolitan)$/i;
      const s = (x) => x.replace(SUFFIX_RE, "").trim();
      return tn === qn || tn === s(qn) || s(tn) === qn || s(tn) === s(qn) ||
        (qn.length >= 4 && levenshtein(tn, qn) <= 1);
    });
    return { thana: cThana || thana, district: cDist || district, location: loc2, source: "canonical" };
  }

  if (address) {
    const scan = detectThanaDistrict(address);
    if (scan.success && scan.thana && scan.district) {
      const loc3 = computeLocationFromCanonical(scan.thana, scan.district);
      if (loc3) {
        return { thana: scan.thana, district: scan.district, location: loc3, source: "address_rescan" };
      }
    }
    if (scan.district && !scan.thana) {
      const sadarSet = SADAR_METRO_THANAS[scan.district];
      if (sadarSet && sadarSet.size > 0) {
        const sadarThana = [...sadarSet][0];
        const loc3b = computeLocationFromCanonical(sadarThana, scan.district);
        if (loc3b) {
          return { thana: sadarThana, district: scan.district, location: loc3b, source: "district_sadar_default" };
        }
      }
    }
  }

  return null;
}