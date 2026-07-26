// ════════════════════════════════════════════════════════════════════════
// rateStore — server থেকে আসা custom product/model rate গুলোর overlay
// ────────────────────────────────────────────────────────────────────────
// withModelData.js / withoutModelData.js এখনো **baseline** (built-in) table
// হিসেবে থাকছে — কিছুই সরানো হয়নি। এখানে শুধু DB থেকে আসা extra row গুলো
// রাখা হয়, আর rateMatcher.js এই দুটো merge করে (custom আগে → override
// সম্ভব, baseline পরে)।
//
// কেন module-level cache (React state নয়):
//   rateMatcher-এর findRate/suggestProducts গুলো pure sync function হিসেবে
//   ৮টা page + modal থেকে call হয়। সবগুলোকে async/context-এ বদলালে অনেক
//   কিছু ভাঙবে। তাই cache module-level রেখে API একই রাখা হয়েছে; যেসব UI
//   list-কে live re-render দরকার তারা useRateVersion() hook ব্যবহার করবে।
//
// Load কখন হয়:
//   RootLayout mount হলে একবার (useRateOverrides hook) — approved user হলে।
//   Admin কোনো entry add/edit/delete করলে refreshRateOverrides() আবার টানে।
// ════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

const LOCATION_KEYS = ["ISD", "OSD-Metro", "OSD-Thana"];

let customWithModel = [];
let customWithoutModel = [];
let version = 0;          // প্রতিবার data বদলালে bump — memo invalidation এর key
let loaded = false;        // অন্তত একবার সফল fetch হয়েছে?
let lastError = null;
let inflight = null;

const subscribers = new Set();

function notify() {
  version += 1;
  subscribers.forEach((fn) => {
    try { fn(version); } catch { /* subscriber error যেন store না ভাঙে */ }
  });
}

/** server row → matcher row (দুর্বল/ভাঙা row বাদ দেয়) */
function sanitize(row, { needsModel }) {
  if (!row || typeof row !== "object") return null;
  const product = String(row.product || "").trim();
  if (!product) return null;

  const out = {
    product,
    capacity: row.capacity ? String(row.capacity).trim() : null,
    _custom: true,
    _id: row._id ? String(row._id) : undefined,
  };

  if (needsModel) {
    const model = String(row.model || "").trim();
    if (model.length < 2) return null;   // ১ অক্ষরের model সবকিছুতে match করে
    out.model = model;
  }

  for (const k of LOCATION_KEYS) out[k] = Number(row[k]) || 0;
  return out;
}

/* ── read API (rateMatcher এটা ব্যবহার করে) ────────────────────────── */

export const getCustomWithModel = () => customWithModel;
export const getCustomWithoutModel = () => customWithoutModel;
export const getRateVersion = () => version;
export const isRateOverridesLoaded = () => loaded;
export const getRateOverrideError = () => lastError;

/* ── write API ──────────────────────────────────────────────────────── */

export function setRateOverrides({ withModel = [], withoutModel = [] } = {}) {
  customWithModel = withModel
    .map((r) => sanitize(r, { needsModel: true }))
    .filter(Boolean)
    // লম্বা model string আগে — substring match এ বেশি নির্দিষ্টটা জিতবে
    .sort((a, b) => b.model.length - a.model.length);

  customWithoutModel = withoutModel
    .map((r) => sanitize(r, { needsModel: false }))
    .filter(Boolean);

  loaded = true;
  lastError = null;
  notify();
}

/**
 * GET /rate-table থেকে overlay টানে।
 * ব্যর্থ হলে throw করে না — baseline table দিয়েই app চলবে (আগের behaviour)।
 * @param {import('axios').AxiosInstance} axios  useAxiosSecure() এর instance
 */
export async function loadRateOverrides(axios, { force = false } = {}) {
  if (!axios) return { success: false, skipped: true };
  if (loaded && !force) return { success: true, cached: true };
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await axios.get("/rate-table");
      const custom = res?.data?.custom;
      setRateOverrides({
        withModel: custom?.withModel || [],
        withoutModel: custom?.withoutModel || [],
      });
      return { success: true, degraded: !!res?.data?.degraded };
    } catch (err) {
      lastError = err?.response?.data?.message || err?.message || "Rate table fetch failed";
      // loaded=false রেখে দিই যাতে পরে আবার চেষ্টা হয়, কিন্তু app চলতে থাকে
      if (import.meta.env.DEV) {
        console.warn("[rateStore] overlay load failed — baseline table ব্যবহার হবে:", lastError);
      }
      return { success: false, error: lastError };
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Admin কিছু বদলানোর পর — জোর করে আবার টানে */
export const refreshRateOverrides = (axios) => loadRateOverrides(axios, { force: true });

/* ── React glue ─────────────────────────────────────────────────────── */

export function subscribeRates(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Overlay বদলালে component re-render করানোর hook।
 * শুধু ওই জায়গাগুলোতে দরকার যেখানে suggestion list / table render হচ্ছে
 * (rate calculation তো keystroke/submit-এর সময় হয়, তাই সেখানে লাগে না)।
 */
export function useRateVersion() {
  const [v, setV] = useState(version);
  useEffect(() => subscribeRates(setV), []);
  return v;
}