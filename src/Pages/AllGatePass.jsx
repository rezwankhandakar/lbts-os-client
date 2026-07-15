import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import usePageParam from "../hooks/usePageParam";
import { useSearch } from "../hooks/SearchContext";
import ActionDropdown from "../Component/ActionDropdown";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import { computeGatePassStatus, STATUS_META } from "../utils/gatePassMatch";

const ITEMS_PER_PAGE = 100;
// Stock carry-forward পেছনের কত মাস পর্যন্ত দেখবে — return-আসা বা
// undelivered gate-pass item delivery না হওয়া পর্যন্ত প্রতি মাসে
// forward হতে থাকে (এই window-এর মধ্যে)।
const STOCK_LOOKBACK_MONTHS = 6;
// Sentinel used inside MultiSelect dropdowns to mean "rows where this
// column is empty / blank".  Distinctive string so it can't collide
// with a real data value.
const BLANK_OPTION = "(Blank)";

/**
 * Format a gate-pass tripDate into a stable dd/mm/yyyy label.  Used both
 * as the Date-column filter option value and for matching, so the Date
 * column behaves like the other text columns (MultiSelect with All /
 * Blank) instead of a calendar picker.
 */
const formatTripDate = (gp) =>
  gp?.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : null;
/**
 * Month label for a table row — stock rows carry their origin month
 * (__stockLabel, e.g. "Jun" / "Dec 2025"); regular rows show the
 * currently selected month. Used by the Month column + its filter.
 */
const rowMonthLabel = (gp, currentLabel) => gp.__stockLabel || currentLabel;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Multi-select ── */
const MultiSelect = ({ options, selected, onChange, placeholder = "All" }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const label    = selected.length === 0 ? placeholder
    : selected.length === 1 ? selected[0]
    : selected.length === options.length ? "All"
    : `${selected.length} selected`;
  const toggle   = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  // "All" master toggle — picks every option, or clears all.  Active
  // only when literally every option is selected.
  const allSelected = options.length > 0 && selected.length === options.length;
  const toggleAll = () => onChange(allSelected ? [] : [...options]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && <span className="text-slate-400 hover:text-white px-0.5 cursor-pointer" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[160px] w-max max-w-[260px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 270) : 0 }}>
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {/* "All" master toggle — hidden while searching */}
            {!search && options.length > 0 && (
              <label
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs font-bold border-b border-slate-100 hover:bg-slate-50 ${allSelected ? "bg-orange-50/50 text-orange-600" : "text-slate-600"}`}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3 h-3 accent-orange-500 flex-shrink-0" />
                <span className="truncate">All</span>
              </label>
            )}
            {filtered.length === 0
              ? <div className="px-3 py-3 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => {
                const isBlank = opt === BLANK_OPTION;
                return (
                <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-orange-500 flex-shrink-0" />
                  <span className={`truncate ${isBlank ? "italic text-slate-400" : "text-slate-700"}`}>{opt}</span>
                </label>
                );
              })
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => onChange([])} className="w-full text-[10px] text-slate-400 uppercase tracking-widest py-1 hover:text-slate-700">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Mobile Card ── */
const MobileCard = ({ gp, p, st, isStock, remaining, stockLabel, axiosSecure, refetchGatePasses }) => {
  const meta = STATUS_META[st?.status || "unbooked"];
  return (
  <div className={`border rounded-2xl p-3 mb-2 shadow-sm hover:shadow-md transition-all ${
    isStock ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200 hover:border-sky-200"
  }`}>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`text-[10px] rounded-lg px-2 py-0.5 font-mono font-black flex-shrink-0 border ${
          isStock ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-700"
        }`}>{gp.tripDo}</span>
        {isStock && (
          <span className="text-[8px] font-black bg-amber-500 text-white rounded px-1 py-0.5 shrink-0 whitespace-nowrap">📦 {stockLabel}</span>
        )}
        <span className="text-[10px] text-slate-500 font-semibold truncate">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[8px] font-black rounded-full px-1.5 py-0.5 border ${meta.cls}`}>
          {meta.dot} {meta.label}{st && st.status !== "unbooked" ? ` ${st.netDeliveredQty ?? st.deliveredQty}/${st.gpQty}` : ""}{st?.returnQty > 0 ? ` ·↩${st.returnQty}` : ""}
        </span>
        <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} currentUser={gp.currentUser} />
      </div>
    </div>
    <p className="text-xs font-bold text-slate-800 mb-1.5 truncate">{gp.customerName}</p>
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mb-2">
      <span>{gp.csd?.toUpperCase()}</span>
      <span>{gp.unit?.toUpperCase() || "—"}</span>
      <span>{gp.vehicleNo?.toUpperCase()}</span>
      <span><span className="text-orange-500">Z-</span>{gp.zone}</span>
    </div>
    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] text-slate-800 font-semibold">{p.productName}</span>
        <span className="text-[10px] text-slate-800 ml-1.5">{p.model?.toUpperCase()}</span>
      </div>
      <div className="ml-2 flex-shrink-0 text-right">
        <span className="text-[11px] font-black text-orange-500">{p.quantity}</span>
        {isStock && remaining !== Number(p.quantity) && (
          <span className="block text-[8px] font-bold text-amber-600">{remaining} left</span>
        )}
      </div>
    </div>
  </div>
  );
};

/* ── Mobile filter sheet ── */
const MobileFilterSheet = ({ onClose, getOptionsFor, tripDoFilter, setTripDoFilter, tripDateFilter, setTripDateFilter,
  monthFilter, setMonthFilter,
  customerFilter, setCustomerFilter, csdFilter, setCsdFilter, unitFilter, setUnitFilter,
  vehicleFilter, setVehicleFilter, zoneFilter, setZoneFilter, productFilter, setProductFilter, modelFilter, setModelFilter }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:hidden" onClick={onClose}>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Filters</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">✕</button>
      </div>
      <div className="overflow-y-auto flex-1 p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Trip DO",  el: <MultiSelect options={getOptionsFor("tripDo")}       selected={tripDoFilter}   onChange={setTripDoFilter} /> },
            { label: "Month",    el: <MultiSelect options={getOptionsFor("month")}        selected={monthFilter}    onChange={setMonthFilter} /> },
            { label: "Date",     el: <MultiSelect options={getOptionsFor("date")} selected={tripDateFilter} onChange={setTripDateFilter} /> },
            { label: "Customer", el: <MultiSelect options={getOptionsFor("customerName")} selected={customerFilter} onChange={setCustomerFilter} /> },
            { label: "CSD",      el: <MultiSelect options={getOptionsFor("csd")}          selected={csdFilter}      onChange={setCsdFilter} /> },
            { label: "Unit",     el: <MultiSelect options={getOptionsFor("unit")}         selected={unitFilter}     onChange={setUnitFilter} /> },
            { label: "Vehicle",  el: <MultiSelect options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={setVehicleFilter} /> },
            { label: "Zone",     el: <MultiSelect options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setZoneFilter} /> },
            { label: "Product",  el: <MultiSelect options={getOptionsFor("productName")}  selected={productFilter}  onChange={setProductFilter} /> },
            { label: "Model",    el: <MultiSelect options={getOptionsFor("model")}        selected={modelFilter}    onChange={setModelFilter} /> },
          ].map((f, i) => (
            <div key={i}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">{f.label}</p>
              {f.el}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 border-t border-slate-100">
        <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white text-sm rounded-xl font-bold">Apply Filters</button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const AllGatePass = () => {
  const axiosSecure = useAxiosSecure();
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientPage, setClientPage] = usePageParam("page");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { searchText, setSearchText } = useSearch();
  const { role } = useRole();

  const [tripDoFilter,   setTripDoFilter]   = useState([]);
  const [customerFilter, setCustomerFilter] = useState([]);
  const [csdFilter,      setCsdFilter]      = useState([]);
  const [unitFilter,     setUnitFilter]     = useState([]);
  const [vehicleFilter,  setVehicleFilter]  = useState([]);
  const [zoneFilter,     setZoneFilter]     = useState([]);
  const [productFilter,  setProductFilter]  = useState([]);
  const [modelFilter,    setModelFilter]    = useState([]);
  const [tripDateFilter, setTripDateFilter] = useState([]);
  const [monthFilter,    setMonthFilter]    = useState([]);   // NEW: Month column (stock rows show origin month)
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // current month/year/search ref — window focus এ use হয়
  const monthRef  = useRef(month);
  const yearRef   = useRef(year);
  const searchRef = useRef(searchText);
  const fetchSeqRef = useRef(0);
  useEffect(() => { monthRef.current  = month;      }, [month]);
  useEffect(() => { yearRef.current   = year;       }, [year]);
  useEffect(() => { searchRef.current = searchText; }, [searchText]);

  const fetchGatePasses = useCallback(async (m, y, search) => {
    // Race guard — টাইপের সময় পুরনো slow response পরে এসে নতুন result
    // overwrite করত; sequence number দিয়ে শুধু শেষ request apply হয়
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    try {
      const url = search
        ? `/gate-pass?search=${encodeURIComponent(search)}`
        : `/gate-pass?month=${m}&year=${y}`;
      const res = await axiosSecure.get(url);
      if (seq !== fetchSeqRef.current) return; // stale
      setGatePasses(res.data.data || []);
    } catch (err) { if (seq === fetchSeqRef.current) console.error(err); }
    if (seq === fetchSeqRef.current) setLoading(false);
  }, [axiosSecure]);

  // month / year / search change হলে re-fetch
  useEffect(() => {
    setClientPage(1);
    fetchGatePasses(month, year, searchText);
  }, [month, year, searchText, fetchGatePasses]);

  // নতুন gate pass add করে ফিরে আসলে (window focus) re-fetch
  useEffect(() => {
    const onFocus = () => fetchGatePasses(monthRef.current, yearRef.current, searchRef.current);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchGatePasses]);

  // edit / delete এর পরে re-fetch করার callback
  const refetchGatePasses = useCallback(() => {
    fetchGatePasses(monthRef.current, yearRef.current, searchRef.current);
  }, [fetchGatePasses]);

  /* ══════════ Gate Pass ↔ Challan linkage ══════════
     Trip Do দিয়ে All-Challan / Delivered page-এর challan-গুলোর সাথে
     connect হয়। Fuzzy customer+model verify-র পর প্রতিটা gate-pass
     product-এর delivery status বের হয়, আর আগের মাসের undelivered
     item গুলো এ মাসের "Stock" হিসেবে দেখা যায়। */
  const [linkedChallans, setLinkedChallans] = useState([]);
  const [prevGatePasses, setPrevGatePasses] = useState([]);
  const [gpStatusFilter, setGpStatusFilter] = useState("");   // "" | delivered | partial | pending | return | unbooked
  const [showStock,      setShowStock]      = useState(true);   // stock rows টেবিলে দেখানো হবে কিনা
  const [syncing,        setSyncing]        = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // আগের মাসগুলো — stock carry-forward-এর উৎস (search mode-এ দরকার নেই)।
        // শুধু গত এক মাস নয়: return-আসা বা undelivered product পরের মাসে
        // deliver না হলে তার পরের মাসেও forward হতে থাকবে — তাই পেছনের
        // STOCK_LOOKBACK_MONTHS মাস পর্যন্ত দেখা হয়, delivery না হওয়া
        // পর্যন্ত প্রতিটা মাসের gate pass-এ item টা stock হিসেবে থাকে।
        let prev = [];
        if (!searchText) {
          const months = [];
          let pm = month, py = year;
          for (let i = 0; i < STOCK_LOOKBACK_MONTHS; i++) {
            if (pm === 1) { pm = 12; py -= 1; } else { pm -= 1; }
            months.push({ pm, py });
          }
          const results = await Promise.all(
            months.map(({ pm, py }) =>
              axiosSecure.get(`/gate-pass?month=${pm}&year=${py}`)
                .then(r => ({ pm, py, data: r.data?.data || [] }))
                .catch(() => ({ pm, py, data: [] }))
            )
          );
          prev = results.flatMap(({ pm, py, data }) =>
            data.map(gp => ({
              ...gp,
              __stockLabel: `${MONTHS_SHORT[pm - 1]}${py !== year ? ` ${py}` : ""}`,
              __stockMonth: pm, __stockYear: py,
            }))
          );
        }
        if (cancelled) return;
        setPrevGatePasses(prev);

        // দুই মাসের সব tripDo → linked challans এক request-এ
        const tripDos = [...new Set(
          [...gatePasses, ...prev].map(gp => String(gp.tripDo ?? "").trim()).filter(Boolean)
        )];
        if (tripDos.length === 0) { setLinkedChallans([]); return; }
        const res = await axiosSecure.post("/challans/by-trip-do", { tripDos });
        if (!cancelled) setLinkedChallans(res.data?.data || []);
      } catch (err) {
        // Linkage optional — fail করলে টেবিল স্বাভাবিকভাবেই চলে
        if (!cancelled) { setLinkedChallans([]); console.error("gate-pass linkage failed", err); }
      }
    })();
    return () => { cancelled = true; };
  }, [gatePasses, month, year, searchText, axiosSecure]);

  // বর্তমান মাসের প্রতিটা row-এর status + sync assignments
  const matchResult = useMemo(
    () => computeGatePassStatus(gatePasses, linkedChallans),
    [gatePasses, linkedChallans]
  );

  // আগের মাসের rows-এর status — stock নির্ণয় ও stock rows-এর live
  // status দুটোতেই লাগে। Trip Do entry হলে linkedChallans বদলায়,
  // ফলে stock row-এর status-ও সাথে সাথে update হয়।
  const prevStatusResult = useMemo(
    () => computeGatePassStatus(prevGatePasses, linkedChallans),
    [prevGatePasses, linkedChallans]
  );

  // Stock — আগের মাসের যেসব gate-pass product এখনো পুরো deliver হয়নি।
  // এগুলো আলাদা panel-এ নয়, নিচের টেবিলেই regular row হিসেবে মেশে
  // (amber tint + "STOCK · <month>" badge দিয়ে চেনা যায়)।
  const prevMonthNum  = month === 1 ? 12 : month - 1;
  const prevYearNum   = month === 1 ? year - 1 : year;
  const stockLabel    = `${MONTHS_SHORT[prevMonthNum - 1]}${prevYearNum !== year ? ` ${prevYearNum}` : ""}`;
  const stockRows = useMemo(() => {
    if (!prevGatePasses.length || searchText) return [];
    const rows = [];
    prevGatePasses.forEach(gp => (gp.products || []).forEach((p, pi) => {
      const st = prevStatusResult.rowStatus.get(`${gp._id}|${p._id || pi}`);
      if (!st) return;
      // Net delivered — return হয়ে ফেরত-আসা qty বাদ। ফলে returned
      // product-ও stock হিসেবে পরের মাসগুলোতে forward হতে থাকে,
      // re-delivery হয়ে গেলে net পূর্ণ হয় আর row টা বাদ পড়ে।
      const delivered = st.netDeliveredQty ?? st.deliveredQty;
      const remaining = Math.max(0, st.gpQty - delivered);
      if (st.status === "delivered" || remaining <= 0) return;
      rows.push({ gp, p, pi, isStock: true, remaining, stockLabel: gp.__stockLabel || stockLabel });
    }));
    return rows;
  }, [prevGatePasses, prevStatusResult, searchText, stockLabel]);
  const stockQtyTotal = useMemo(() => stockRows.reduce((s, r) => s + r.remaining, 0), [stockRows]);

  // Row → তার status (stock row হলে prev month-এর map থেকে)
  const getRowStatus = useCallback((row) =>
    (row.isStock ? prevStatusResult : matchResult).rowStatus.get(`${row.gp._id}|${row.p._id || row.pi}`),
    [matchResult, prevStatusResult]
  );

  const canSync = ["admin", "manager", "operator"].includes(role);

  /* Matched challan-গুলোতে gate pass-এর CSD ও Unit বসানো — current
     month + stock rows দুটোরই matches sync হয়; দুই collection-এই
     লেখে, তাই All-Challan আর Delivered page-এর CSD/Unit column-এ
     সাথে সাথে দেখা যায়। */
  const handleSyncCsdUnit = async () => {
    const seen = new Set();
    const assignments = [...matchResult.assignments, ...prevStatusResult.assignments]
      .filter(a => { if (seen.has(a.challanId)) return false; seen.add(a.challanId); return true; });
    if (!assignments.length) {
      return Swal.fire({ icon: "info", title: "Nothing to sync", text: "No verified matches with CSD/Unit found in this month." });
    }
    const { isConfirmed } = await Swal.fire({
      title: "Sync CSD & Unit?",
      html: `<p style="font-size:13px;color:#475569">Gate pass-এর CSD/Unit <b>${assignments.length}</b>টা matched challan-এ বসবে — All-Challan ও Delivered page দুটোতেই দেখা যাবে।</p>`,
      icon: "question", showCancelButton: true,
      confirmButtonColor: "#7c3aed", confirmButtonText: "Yes, Sync",
    });
    if (!isConfirmed) return;
    setSyncing(true);
    try {
      const res = await axiosSecure.patch("/challans/bulk-gate-sync", { assignments });
      if (res.data?.warning) {
        Swal.fire({ icon: "warning", title: `Synced with warnings (${res.data?.touched ?? 0} updates)`,
          text: (res.data.errors || []).join(" | ").slice(0, 300) });
      } else {
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: `CSD/Unit synced (${res.data?.touched ?? assignments.length} updates)`, showConfirmButton: false, timer: 2200 });
      }
    } catch (err) {
      // Server এখন আসল কারণটা detail-এ পাঠায় — সেটাই দেখানো হয়।
      // detail না থাকা মানে পুরনো server code চলছে (restart লাগবে)।
      const d = err?.response?.data;
      Swal.fire("Error", d?.detail
        ? `${d.message}: ${String(d.detail).slice(0, 300)}`
        : (d?.message ? `${d.message} — server restart/redeploy করা হয়েছে কিনা check করুন (old code running)` : "Sync failed"),
        "error");
    } finally { setSyncing(false); }
  };

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setTripDoFilter([]); setCustomerFilter([]); setCsdFilter([]);
    setUnitFilter([]); setVehicleFilter([]); setZoneFilter([]);
    setProductFilter([]); setModelFilter([]); setTripDateFilter([]); setMonthFilter([]);
    setGpStatusFilter("");
    setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const currentMonthLabel = MONTHS_SHORT[month - 1];

  const rowMatchesAll = useCallback((gp, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model].some(v => v?.toLowerCase().includes(s));
    // Generic column check with "(Blank)" sentinel support: when the
    // sentinel is selected, rows whose value is empty/missing match.
    const check = (field, filter, val) => {
      if (field === excludeField || filter.length === 0) return true;
      const isEmpty = !val || !val.toString().trim();
      return filter.some(f =>
        f === BLANK_OPTION
          ? isEmpty
          : !isEmpty && val.toString().toLowerCase() === f.toLowerCase()
      );
    };
    return matchesSearch &&
      check("month",        monthFilter,    rowMonthLabel(gp, currentMonthLabel)) &&
      check("date",         tripDateFilter, formatTripDate(gp)) &&
      check("tripDo",       tripDoFilter,   gp.tripDo)       &&
      check("customerName", customerFilter, gp.customerName) &&
      check("csd",          csdFilter,      gp.csd)          &&
      check("unit",         unitFilter,     gp.unit)         &&
      check("vehicleNo",    vehicleFilter,  gp.vehicleNo)    &&
      check("zone",         zoneFilter,     gp.zone)         &&
      check("productName",  productFilter,  p.productName)   &&
      check("model",        modelFilter,    p.model);
  }, [searchText, tripDoFilter, customerFilter, csdFilter, unitFilter, vehicleFilter, zoneFilter, productFilter, modelFilter, tripDateFilter, monthFilter, currentMonthLabel]);

  const filteredRows  = useMemo(() => {
    // Current month rows + (optionally) previous month-এর undelivered
    // stock rows — দুটোই একই টেবিলে, একই filter/search/sort-এর নিয়মে।
    // Stock rows-এ isStock: true থাকে, তাই badge + tint দিয়ে চেনা যায়।
    const current = gatePasses.flatMap(gp => (gp.products || [])
      .map((p, pi) => ({ gp, p, pi, isStock: false })));
    const all = showStock ? [...stockRows, ...current] : current;   // stock আগে (পুরনো bakeya আগে চোখে পড়ুক)
    return all
      .filter(({ gp, p }) => rowMatchesAll(gp, p))
      .filter((row) => {
        if (!gpStatusFilter) return true;
        const st = getRowStatus(row);
        return (st?.status || "unbooked") === gpStatusFilter;
      });
  }, [gatePasses, stockRows, showStock, rowMatchesAll, gpStatusFilter, getRowStatus]);
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(
    () => filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE),
    [filteredRows, clientPage]
  );
  // Filter দিলে page সংখ্যা কমে গেলে URL-এর পুরনো বড় page-এ আটকে খালি
  // টেবিল দেখাত — এখন শেষ valid page-এ নেমে আসে
  useEffect(() => {
    if (totalPages > 0 && clientPage > totalPages) setClientPage(totalPages);
  }, [totalPages, clientPage, setClientPage]);
  const totalQtyAll = useMemo(
    // Stock row-এ পুরো gate-pass qty নয়, যতটা এখনো বাকি (remaining) সেটাই গোনা হয়
    () => filteredRows.reduce((sum, r) => sum + (r.isStock ? r.remaining : (Number(r.p.quantity) || 0)), 0),
    [filteredRows]
  );
  // Unique gate pass সংখ্যা (row নয় — একটা pass-এ একাধিক product row থাকে)
  const uniquePassCount = useMemo(
    () => new Set(filteredRows.map(({ gp }) => gp._id)).size,
    [filteredRows]
  );

  // Status chip-এর count — টেবিলে যা দেখা যাচ্ছে (stock rows সহ) তার
  // উপর ভিত্তি করে, কিন্তু status filter বাদ দিয়ে (নাহলে filter করলে
  // বাকি chip-গুলো 0 হয়ে হারিয়ে যেত)।
  const statusSummary = useMemo(() => {
    const base = { delivered: 0, partial: 0, pending: 0, return: 0, unbooked: 0, totalRows: 0 };
    const current = gatePasses.flatMap(gp => (gp.products || []).map((p, pi) => ({ gp, p, pi, isStock: false })));
    const all = showStock ? [...stockRows, ...current] : current;
    for (const row of all) {
      if (!rowMatchesAll(row.gp, row.p)) continue;
      const k = getRowStatus(row)?.status || "unbooked";
      base[k] += 1;
      base.totalRows += 1;
    }
    return base;
  }, [gatePasses, stockRows, showStock, rowMatchesAll, getRowStatus]);

  const getOptionsFor = useCallback((field) => {
    const map = new Map();
    let hasBlank = false;
    // Stock rows-ও টেবিলে থাকে, তাই তাদের value-ও dropdown option-এ
    // আসা উচিত — নাহলে filter করলে stock row হারিয়ে যেত।
    const sources = showStock
      ? [...stockRows.map(r => ({ gp: r.gp, p: r.p })),
         ...gatePasses.flatMap(gp => (gp.products || []).map(p => ({ gp, p })))]
      : gatePasses.flatMap(gp => (gp.products || []).map(p => ({ gp, p })));
    sources.forEach(({ gp, p }) => {
      if (!rowMatchesAll(gp, p, field)) return;
      let val;
      if (field === "productName" || field === "model") val = p[field]?.toString().trim();
      else if (field === "date") val = formatTripDate(gp);
      else if (field === "month") val = rowMonthLabel(gp, currentMonthLabel);
      else val = gp[field]?.toString().trim();
      if (val) {
        if (!map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      } else {
        hasBlank = true;
      }
    });
    const sorted = Array.from(map.values()).sort((a, b) => {
      if (field === "date") {
        const toTs = (d) => { const [dd, mm, yy] = d.split("/"); return new Date(`${yy}-${mm}-${dd}`).getTime(); };
        return toTs(b) - toTs(a);   // newest first
      }
      return a.localeCompare(b);
    });
    if (hasBlank) sorted.push(BLANK_OPTION);
    return sorted;
  }, [gatePasses, stockRows, showStock, rowMatchesAll, currentMonthLabel]);

  const activeFilterGroups = [
    { label: "Month",    values: monthFilter,     clear: () => setMonthFilter([]) },
    { label: "Date",     values: tripDateFilter,  clear: () => setTripDateFilter([]) },
    { label: "Trip DO",  values: tripDoFilter,   clear: () => setTripDoFilter([]) },
    { label: "Customer", values: customerFilter,  clear: () => setCustomerFilter([]) },
    { label: "CSD",      values: csdFilter,       clear: () => setCsdFilter([]) },
    { label: "Unit",     values: unitFilter,      clear: () => setUnitFilter([]) },
    { label: "Vehicle",  values: vehicleFilter,   clear: () => setVehicleFilter([]) },
    { label: "Zone",     values: zoneFilter,      clear: () => setZoneFilter([]) },
    { label: "Product",  values: productFilter,   clear: () => setProductFilter([]) },
    { label: "Model",    values: modelFilter,     clear: () => setModelFilter([]) },
  ].filter(f => f.values.length > 0);
  const totalActiveFilters = activeFilterGroups.reduce((s, f) => s + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#f97316">
          <span><b>Filtered data</b> (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${MONTHS_FULL[month - 1]} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#f97316",
      confirmButtonText: "Export",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      const toRow = (gp, p, pi, isStock = false, remaining = null, rowStockLabel = null) => {
        const st = (isStock ? prevStatusResult : matchResult).rowStatus.get(`${gp._id}|${p._id || pi}`);
        const meta = STATUS_META[st?.status || "unbooked"];
        const netDelivered = st ? (st.netDeliveredQty ?? st.deliveredQty) : 0;
        return {
          Source: isStock ? `Stock (${rowStockLabel || gp.__stockLabel || stockLabel})` : "Current",
          Month: isStock ? (rowStockLabel || gp.__stockLabel || stockLabel) : MONTHS_SHORT[month - 1],
          "Trip Do": gp.tripDo,
          "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "",
          Customer: gp.customerName, CSD: gp.csd, Unit: gp.unit || "",
          "Vehicle No": gp.vehicleNo, Zone: gp.zone,
          Product: p.productName, Model: p.model,
          Qty: Number(p.quantity) || 0,
          "Delivery Status": meta.label,
          "Delivered Qty": netDelivered,
          "Return Qty": st ? (st.returnQty || 0) : 0,
          "Remaining Qty": isStock ? remaining : (st ? Math.max(0, st.gpQty - netDelivered) : Number(p.quantity) || 0),
          User: gp.currentUser,
        };
      };
      let exportData = [];
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(r => toRow(r.gp, r.p, r.pi, r.isStock, r.remaining, r.stockLabel));
      } else {
        // Full month — search active থাকলে state-এ search result থাকে
        // (max 500), পুরো month না। তখন month data আলাদা করে আনতে হয়।
        let monthData = gatePasses;
        if (searchText) {
          const res = await axiosSecure.get(`/gate-pass?month=${month}&year=${year}`);
          monthData = res.data.data || [];
        }
        exportData = monthData.flatMap(gp => (gp.products || []).map((p, pi) => toRow(gp, p, pi)));
        // Stock rows দেখানো থাকলে export-এও যাবে (উপরে, যেমন টেবিলে দেখায়)
        if (showStock && stockRows.length) {
          exportData = [...stockRows.map(r => toRow(r.gp, r.p, r.pi, true, r.remaining, r.stockLabel)), ...exportData];
        }
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GatePass");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `GatePass_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/30">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Gate Pass Inventory</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <>
              <span className="text-[10px] font-black text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5 shrink-0">
                {uniquePassCount} pass{uniquePassCount > 1 ? "es" : ""}
              </span>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
                Qty: {totalQtyAll.toLocaleString()}
              </span>
            </>
          )}
          {/* ── Delivery status chips — click করলে filter হয় ── */}
          {statusSummary.totalRows > 0 && (
            <div className="flex items-center gap-1 flex-wrap shrink-0">
              {["delivered","partial","pending","return","unbooked"].map(k => {
                const count = statusSummary[k];
                if (!count) return null;
                const meta = STATUS_META[k];
                const active = gpStatusFilter === k;
                return (
                  <button key={k}
                    onClick={() => { setGpStatusFilter(active ? "" : k); setClientPage(1); }}
                    title={`${meta.label} — click to ${active ? "clear" : "filter"}`}
                    className={`text-[10px] font-black rounded-lg px-2 py-0.5 border transition-all
                      ${active ? "ring-2 ring-slate-400 " : ""}${meta.cls}`}>
                    {meta.dot} {count}
                  </button>
                );
              })}
            </div>
          )}
          {/* ── Stock toggle — আগের মাসের undelivered rows টেবিলে দেখাবে কিনা ── */}
          {stockRows.length > 0 && !searchText && (
            <button onClick={() => { setShowStock(s => !s); setClientPage(1); }}
              title={`${stockRows.length} undelivered / returned items carried forward from the last ${STOCK_LOOKBACK_MONTHS} months — click to ${showStock ? "hide" : "show"} in table`}
              className={`text-[10px] font-black rounded-lg px-2 py-0.5 border shrink-0 transition-all
                ${showStock ? "bg-amber-500 text-white border-amber-500" : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"}`}>
              📦 Stock: {stockRows.length} <span className="font-semibold opacity-70">({stockQtyTotal.toLocaleString()} pcs)</span>
            </button>
          )}
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
              <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
            </span>
          ))}
          {totalActiveFilters > 0 && (
            <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">Clear all</button>
          )}
          <div className="hidden sm:block flex-1" />
          {isMobile && (
            <button onClick={() => setShowMobileFilters(true)}
              className={`${tbtn} ${totalActiveFilters > 0 ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
            </button>
          )}
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
            {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
          </select>
          <input type="number" className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none focus:border-orange-400`}
            value={year} onChange={e => { const y = parseInt(e.target.value); if (!Number.isNaN(y)) { setYear(y); setClientPage(1); } }} />
          <button onClick={handleResetAll} className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
        
          {canSync && (
            <button onClick={handleSyncCsdUnit} disabled={syncing}
              title="Matched challan-গুলোতে gate pass-এর CSD ও Unit বসাও (All-Challan + Delivered page)"
              className={`${tbtn} bg-violet-600 text-white border-violet-600 hover:bg-violet-700 disabled:opacity-60`}>
              {syncing
                ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>}
              <span className="hidden sm:inline">Sync CSD/Unit</span><span className="sm:hidden">SYNC</span>
            </button>
          )}

            <button onClick={handleExportExcel} className={`${tbtn} bg-sky-600 text-white border-sky-600 hover:bg-sky-700`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="hidden sm:inline">Export</span><span className="sm:hidden">XLS</span>
            </button>
          
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 m-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <p className="font-semibold text-slate-600">No gate passes found</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : isMobile ? (
          <div className="h-full overflow-y-auto p-2">
            {paginatedRows.map((row, idx) => (
              <MobileCard key={`${row.isStock ? "s" : "c"}-${row.gp._id}-${row.p._id || idx}`}
                gp={row.gp} p={row.p} st={getRowStatus(row)}
                isStock={row.isStock} remaining={row.remaining} stockLabel={row.stockLabel || stockLabel}
                axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-1">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                <span className="text-xs text-slate-500 font-medium">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse" style={{ minWidth: "1010px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {["Trip DO","Month","Trip Date","Customer","CSD","Unit","Vehicle No","Zone","Product","Model","Qty","Delivery","Action"].map(h => (
                        <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("tripDo")}       selected={tripDoFilter}   onChange={val => { setTripDoFilter(val);   setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("month")}        selected={monthFilter}    onChange={val => { setMonthFilter(val);    setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("date")} selected={tripDateFilter} onChange={val => { setTripDateFilter(val); setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("customerName")} selected={customerFilter} onChange={val => { setCustomerFilter(val); setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("csd")}          selected={csdFilter}      onChange={val => { setCsdFilter(val);      setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("unit")}         selected={unitFilter}     onChange={val => { setUnitFilter(val);     setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={val => { setVehicleFilter(val);  setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={val => { setZoneFilter(val);     setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("productName")}  selected={productFilter}  onChange={val => { setProductFilter(val);  setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}        selected={modelFilter}    onChange={val => { setModelFilter(val);    setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQtyAll.toLocaleString()}</th>
                      <th className="p-1 border-r border-slate-200">
                        <select value={gpStatusFilter} onChange={e => { setGpStatusFilter(e.target.value); setClientPage(1); }}
                          className={`w-full px-1.5 py-1 text-[11px] rounded-lg border outline-none ${gpStatusFilter ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                          <option value="">All</option>
                          <option value="delivered">Delivered</option>
                          <option value="partial">Partial</option>
                          <option value="pending">Pending</option>
                          <option value="return">Return</option>
                          <option value="unbooked">Not Booked</option>
                        </select>
                      </th>
                      <th className="p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => {
                      const { gp, p, pi, isStock, remaining } = row;
                      const st = getRowStatus(row);
                      const meta = STATUS_META[st?.status || "unbooked"];
                      return (
                      <tr key={`${isStock ? "s" : "c"}-${gp._id}-${p._id || idx}`}
                        className={`border-b text-[12px] transition-colors ${
                          isStock
                            ? "border-amber-100 bg-amber-50/50 hover:bg-amber-50"
                            : "border-slate-100 hover:bg-sky-50/30 even:bg-slate-50/40"
                        }`}>
                        <td className="px-2.5 py-2">
                          <span className={`text-[10px] rounded-lg px-2 py-0.5 font-mono font-bold border ${
                            isStock ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-sky-50 border-sky-200 text-sky-700"
                          }`}>{gp.tripDo}</span>
                        </td>
                        {/* Month — regular row: বর্তমান মাস; stock row: যে মাসের gate pass থেকে forward হয়েছে */}
                        <td className="px-2.5 py-2 whitespace-nowrap">
                          {isStock ? (
                            <span title={`Undelivered / returned stock carried forward from ${row.stockLabel || stockLabel} — ${remaining} pcs still pending`}
                              className="text-[9px] font-black bg-amber-500 text-white rounded px-1.5 py-0.5 whitespace-nowrap">
                              📦 {row.stockLabel || stockLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500">{currentMonthLabel}</span>
                          )}
                        </td>
                        <td className="px-2.5 py-2 text-black whitespace-nowrap">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-2.5 py-2 font-semibold text-slate-800">{gp.customerName}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{gp.csd?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-black">{gp.unit?.toUpperCase() || "—"}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{gp.vehicleNo?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-black">{gp.zone}</td>
                        <td className="px-2.5 py-2 text-black">{p.productName}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{p.model?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-center font-black text-slate-700">
                          {p.quantity}
                          {isStock && remaining !== Number(p.quantity) && (
                            <span className="block text-[8px] font-bold text-amber-600">{remaining} left</span>
                          )}
                        </td>
                        <td className="px-2.5 py-2 whitespace-nowrap"
                          title={st?.matches?.length
                            ? st.matches.map(m => `${m.tripNumber || "trip"} · ${m.status} · ${m.qty} pcs`).join("\n")
                            : "No matching challan found (Trip Do + customer + model verify)"}>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${meta.cls}`}>
                            {meta.dot} {meta.label}
                          </span>
                          {st && st.status !== "unbooked" && (
                            <span className="ml-1 text-[9px] font-black text-slate-400">
                              {st.netDeliveredQty ?? st.deliveredQty}/{st.gpQty}
                              {st.returnQty > 0 && <span className="text-orange-500"> ·↩{st.returnQty}</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-2.5 py-2">
                          <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} currentUser={gp.currentUser} />
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                  <p className="text-xs text-slate-500 font-medium">{(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? <span key={i} className="px-1.5 text-slate-400 text-xs">…</span> : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-3 py-1.5 text-xs border rounded-lg font-semibold ${clientPage === p ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 bg-white hover:bg-slate-100"}`}>{p}</button>
                      )
                    )}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showMobileFilters && (
        <MobileFilterSheet
          onClose={() => setShowMobileFilters(false)}
          getOptionsFor={getOptionsFor}
          tripDoFilter={tripDoFilter} setTripDoFilter={setTripDoFilter}
          tripDateFilter={tripDateFilter} setTripDateFilter={setTripDateFilter}
          monthFilter={monthFilter} setMonthFilter={setMonthFilter}
          customerFilter={customerFilter} setCustomerFilter={setCustomerFilter}
          csdFilter={csdFilter} setCsdFilter={setCsdFilter}
          unitFilter={unitFilter} setUnitFilter={setUnitFilter}
          vehicleFilter={vehicleFilter} setVehicleFilter={setVehicleFilter}
          zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
          productFilter={productFilter} setProductFilter={setProductFilter}
          modelFilter={modelFilter} setModelFilter={setModelFilter}
        />
      )}
    </div>
  );
};

export default AllGatePass;