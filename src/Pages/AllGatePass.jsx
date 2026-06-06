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

const ITEMS_PER_PAGE = 100;
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
const MobileCard = ({ gp, p, axiosSecure, refetchGatePasses }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2 shadow-sm">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5 font-mono font-bold text-sky-700 flex-shrink-0">{gp.tripDo}</span>
        <span className="text-[10px] text-black truncate">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}</span>
      </div>
      <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} currentUser={gp.currentUser} />
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
      <div className="ml-2 flex-shrink-0">
        <span className="text-[11px] font-black text-orange-500">{p.quantity}</span>
      </div>
    </div>
  </div>
);

/* ── Mobile filter sheet ── */
const MobileFilterSheet = ({ onClose, getOptionsFor, tripDoFilter, setTripDoFilter, tripDateFilter, setTripDateFilter,
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
  useEffect(() => { monthRef.current  = month;      }, [month]);
  useEffect(() => { yearRef.current   = year;       }, [year]);
  useEffect(() => { searchRef.current = searchText; }, [searchText]);

  const fetchGatePasses = useCallback(async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/gate-pass?search=${encodeURIComponent(search)}`
        : `/gate-pass?month=${m}&year=${y}`;
      const res = await axiosSecure.get(url);
      setGatePasses(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
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

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setTripDoFilter([]); setCustomerFilter([]); setCsdFilter([]);
    setUnitFilter([]); setVehicleFilter([]); setZoneFilter([]);
    setProductFilter([]); setModelFilter([]); setTripDateFilter([]);
    setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

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
      check("date",         tripDateFilter, formatTripDate(gp)) &&
      check("tripDo",       tripDoFilter,   gp.tripDo)       &&
      check("customerName", customerFilter, gp.customerName) &&
      check("csd",          csdFilter,      gp.csd)          &&
      check("unit",         unitFilter,     gp.unit)         &&
      check("vehicleNo",    vehicleFilter,  gp.vehicleNo)    &&
      check("zone",         zoneFilter,     gp.zone)         &&
      check("productName",  productFilter,  p.productName)   &&
      check("model",        modelFilter,    p.model);
  }, [searchText, tripDoFilter, customerFilter, csdFilter, unitFilter, vehicleFilter, zoneFilter, productFilter, modelFilter, tripDateFilter]);

  const filteredRows  = useMemo(
    () => gatePasses.flatMap(gp => (gp.products || []).filter(p => rowMatchesAll(gp, p)).map(p => ({ gp, p }))),
    [gatePasses, rowMatchesAll]
  );
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(
    () => filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE),
    [filteredRows, clientPage]
  );
  const totalQtyAll = useMemo(
    () => filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0),
    [filteredRows]
  );

  const getOptionsFor = useCallback((field) => {
    const map = new Map();
    let hasBlank = false;
    gatePasses.forEach(gp => {
      (gp.products || []).forEach(p => {
        if (!rowMatchesAll(gp, p, field)) return;
        let val;
        if (field === "productName" || field === "model") val = p[field]?.toString().trim();
        else if (field === "date") val = formatTripDate(gp);
        else val = gp[field]?.toString().trim();
        if (val) {
          if (!map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        } else {
          hasBlank = true;
        }
      });
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
  }, [gatePasses, rowMatchesAll]);

  const activeFilterGroups = [
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
      const toRow = (gp, p) => ({ "Trip Do": gp.tripDo, "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "", Customer: gp.customerName, CSD: gp.csd, Unit: gp.unit || "", "Vehicle No": gp.vehicleNo, Zone: gp.zone, Product: p.productName, Model: p.model, Qty: Number(p.quantity) || 0, User: gp.currentUser });
      let exportData = [];
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(({ gp, p }) => toRow(gp, p));
      } else {
        // Full month — already in state (no limit), extra API call নেই
        exportData = gatePasses.flatMap(gp => (gp.products || []).map(p => toRow(gp, p)));
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
            <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Gate Pass Inventory</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
              Qty: {totalQtyAll.toLocaleString()}
            </span>
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
            value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }} />
          <button onClick={handleResetAll} className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
        
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
            {paginatedRows.map(({ gp, p }, idx) => (
              <MobileCard key={`${gp._id}-${p._id || idx}`} gp={gp} p={p} axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} />
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
                <table className="w-full border-collapse" style={{ minWidth: "820px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {["Trip DO","Trip Date","Customer","CSD","Unit","Vehicle No","Zone","Product","Model","Qty","Action"].map(h => (
                        <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("tripDo")}       selected={tripDoFilter}   onChange={val => { setTripDoFilter(val);   setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("date")} selected={tripDateFilter} onChange={val => { setTripDateFilter(val); setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("customerName")} selected={customerFilter} onChange={val => { setCustomerFilter(val); setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("csd")}          selected={csdFilter}      onChange={val => { setCsdFilter(val);      setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("unit")}         selected={unitFilter}     onChange={val => { setUnitFilter(val);     setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={val => { setVehicleFilter(val);  setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={val => { setZoneFilter(val);     setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("productName")}  selected={productFilter}  onChange={val => { setProductFilter(val);  setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}        selected={modelFilter}    onChange={val => { setModelFilter(val);    setClientPage(1); }} /></th>
                      <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQtyAll.toLocaleString()}</th>
                      <th className="p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map(({ gp, p }, idx) => (
                      <tr key={`${gp._id}-${p._id || idx}`} className="border-b border-slate-100 hover:bg-sky-50/30 even:bg-slate-50/40 transition-colors text-[12px]">
                        <td className="px-2.5 py-2">
                          <span className="text-[10px] bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5 font-mono font-bold text-sky-700">{gp.tripDo}</span>
                        </td>
                        <td className="px-2.5 py-2 text-black whitespace-nowrap">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-2.5 py-2 font-semibold text-slate-800">{gp.customerName}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{gp.csd?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-black">{gp.unit?.toUpperCase() || "—"}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{gp.vehicleNo?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-black">{gp.zone}</td>
                        <td className="px-2.5 py-2 text-black">{p.productName}</td>
                        <td className="px-2.5 py-2 text-black font-mono text-[11px]">{p.model?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-center font-black text-slate-700">{p.quantity}</td>
                        <td className="px-2.5 py-2">
                          <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} refetchGatePasses={refetchGatePasses} currentUser={gp.currentUser} />
                        </td>
                      </tr>
                    ))}
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