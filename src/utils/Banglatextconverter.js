// ═══════════════════════════════════════════════════════════════════════
//  Bangla paste-normalizer
//  ───────────────────────────────────────────────────────────────────────
//  PDF (বা যেকোনো জায়গা) থেকে কপি করা টেক্সট সবসময় Unicode হয় না।
//  হতে পারে:
//    • SutonnyMJ (ANSI)
//    • Bijoy
//    • অন্য কোনো Bijoy-ভিত্তিক ANSI ফন্ট
//    • ইতিমধ্যে Unicode
//    • সাধারণ English/ASCII টেক্সট
//
//  এই ফাইলটা প্রতিটা paste event-এর টেক্সট পরীক্ষা করে —
//    1) যদি টেক্সটে ইতিমধ্যে Unicode বাংলা অক্ষর থাকে → হুবহু রেখে দেয়।
//    2) যদি ANSI/Bijoy/SutonnyMJ প্যাটার্ন শনাক্ত হয়      → Unicode-এ কনভার্ট করে।
//    3) অন্য কিছু হলে (plain English ইত্যাদি)              → হুবহু রেখে দেয়।
//
//  ফলে ইউজার যেখান থেকেই কপি করে পেস্ট করুক না কেন, ডাটাবেসে সবসময়
//  Unicode বাংলা টেক্সট-ই সংরক্ষিত হবে।
//
//  Conversion engine: `bijoy2unicode` (covers both classic Bijoy AND
//  SutonnyMJ byte-mappings — SutonnyMJ is itself a Bijoy-keyboard-layout
//  ANSI font, so the same glyph-reorder rules apply).
// ═══════════════════════════════════════════════════════════════════════

import {
  convertBijoyToUnicode,
  looksLikeBijoy,
  hasBengaliUnicode,
} from "bijoy2unicode";

/**
 * Detect the likely encoding of a pasted chunk of text.
 * @param {string} text
 * @returns {"unicode" | "ansi" | "plain"}
 */
export const detectBanglaEncoding = (text) => {
  if (!text) return "plain";
  if (hasBengaliUnicode(text)) return "unicode";
  if (looksLikeBijoy(text)) return "ansi";
  return "plain";
};

/**
 * Normalize any pasted text into Unicode Bangla (when applicable).
 * - Unicode বাংলা থাকলে অপরিবর্তিত থাকে।
 * - ANSI/Bijoy/SutonnyMJ শনাক্ত হলে Unicode-এ কনভার্ট হয়।
 * - অন্য যেকোনো কিছু (English/ASCII) অপরিবর্তিত থাকে।
 *
 * Also collapses newlines/tabs to single spaces, since this is meant for
 * single-line inputs (addresses copied out of a PDF often carry line
 * breaks from wrapped paragraphs).
 *
 * @param {string} rawText
 * @returns {string}
 */
export const normalizeBanglaPaste = (rawText) => {
  if (!rawText) return rawText ?? "";

  const encoding = detectBanglaEncoding(rawText);
  const converted = encoding === "ansi" ? convertBijoyToUnicode(rawText) : rawText;

  // Single-line inputs: flatten line-breaks/tabs from PDF paragraph wraps.
  return converted.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
};