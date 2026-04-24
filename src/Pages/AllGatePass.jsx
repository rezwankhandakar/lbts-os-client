import React, { useEffect, useState, useRef } from "react";
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

/* ── Multi-select dropdown ── */
const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
          ${selected.length > 0 ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
      >
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <span className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
              onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
          )}
          <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
          </svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[150px] w-max max-w-[240px] overflow-hidden" style={{
          zIndex: 9999,
          top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
          left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 250) : 0,
        }}>
          {options.length > 5 && (
            <div className="p-1.5 border-b border-gray-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
                  <span className="truncate">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <button onClick={() => onChange([])} className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Mobile Card ── */
const MobileCard = ({ gp, p, axiosSecure, setGatePasses }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-2.5 mb-1.5 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono font-semibold shrink-0">{gp.tripDo}</span>
        <span className="text-[10px] text-gray-400 truncate">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}</span>
      </div>
      <div className="shrink-0 ml-1">
        <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser} />
      </div>
    </div>
    <div className="text-xs font-semibold text-gray-800 leading-tight mb-1 truncate">{gp.customerName}</div>
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500 mb-1.5">
      <span><span className="text-gray-400">CSD </span>{gp.csd?.toUpperCase()}</span>
      <span><span className="text-gray-400">Unit </span>{gp.unit?.toUpperCase() || "—"}</span>
      <span><span className="text-gray-400">Veh </span>{gp.vehicleNo?.toUpperCase()}</span>
      <span><span className="text-gray-400">Zone </span>{gp.zone}</span>
    </div>
    <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 border border-gray-100">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium text-gray-800">{p.productName}</span>
        <span className="text-[9px] text-gray-400 ml-1.5">{p.model?.toUpperCase()}</span>
      </div>
      <div className="text-right ml-2 shrink-0">
        <span className="text-[9px] text-gray-400 mr-1">Qty</span>
        <span className="text-xs font-bold text-gray-800">{p.quantity}</span>
      </div>
    </div>
  </div>
);

/* ── Mobile Filter Bottom Sheet ── */
const MobileFilterPanel = ({ onClose, getOptionsFor,
  tripDoFilter, setTripDoFilter, tripDateFilter, setTripDateFilter,
  customerFilter, setCustomerFilter, csdFilter, setCsdFilter,
  unitFilter, setUnitFilter, vehicleFilter, setVehicleFilter,
  zoneFilter, setZoneFilter, productFilter, setProductFilter,
  modelFilter, setModelFilter, setClientPage }) => {

  const setF = setter => val => { setter(val); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Filters</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 w-6 h-6 flex items-center justify-center">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Trip DO",  el: <MultiSelectFilter options={getOptionsFor("tripDo")}       selected={tripDoFilter}   onChange={setF(setTripDoFilter)}   placeholder="All" /> },
              { label: "Date",     el: <input type="date" className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-gray-500 bg-white" value={tripDateFilter} onChange={e => { setTripDateFilter(e.target.value); }} /> },
              { label: "Customer", el: <MultiSelectFilter options={getOptionsFor("customerName")} selected={customerFilter}  onChange={setF(setCustomerFilter)}  placeholder="All" /> },
              { label: "CSD",      el: <MultiSelectFilter options={getOptionsFor("csd")}          selected={csdFilter}      onChange={setF(setCsdFilter)}      placeholder="All" /> },
              { label: "Unit",     el: <MultiSelectFilter options={getOptionsFor("unit")}         selected={unitFilter}     onChange={setF(setUnitFilter)}     placeholder="All" /> },
              { label: "Vehicle",  el: <MultiSelectFilter options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={setF(setVehicleFilter)}  placeholder="All" /> },
              { label: "Zone",     el: <MultiSelectFilter options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setF(setZoneFilter)}     placeholder="All" /> },
              { label: "Product",  el: <MultiSelectFilter options={getOptionsFor("productName")}  selected={productFilter}  onChange={setF(setProductFilter)}  placeholder="All" /> },
              { label: "Model",    el: <MultiSelectFilter options={getOptionsFor("model")}        selected={modelFilter}    onChange={setF(setModelFilter)}    placeholder="All" /> },
            ].map((f, i) => (
              <div key={i}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{f.label}</div>
                {f.el}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-800 text-white text-sm rounded-xl font-medium">Done</button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
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
  const [tripDateFilter, setTripDateFilter] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const setFilter = (setter) => (val) => { setter(val); };

  const fetchGatePasses = async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/gate-pass?search=${encodeURIComponent(search)}&page=1&limit=5000`
        : `/gate-pass?month=${m}&year=${y}&page=1&limit=5000`;
      const res = await axiosSecure.get(url);
      setGatePasses(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchGatePasses(month, year, searchText); }, [month, year, searchText]);

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setTripDoFilter([]); setCustomerFilter([]); setCsdFilter([]);
    setUnitFilter([]); setVehicleFilter([]); setZoneFilter([]);
    setProductFilter([]); setModelFilter([]); setTripDateFilter("");
    setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = (gp, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model].some(v => v?.toLowerCase().includes(s));
    const check = (field, filter, val) => field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
    return matchesSearch &&
      check("tripDo",       tripDoFilter,   gp.tripDo)       &&
      check("customerName", customerFilter, gp.customerName) &&
      check("csd",          csdFilter,      gp.csd)          &&
      check("unit",         unitFilter,     gp.unit)         &&
      check("vehicleNo",    vehicleFilter,  gp.vehicleNo)    &&
      check("zone",         zoneFilter,     gp.zone)         &&
      check("productName",  productFilter,  p.productName)   &&
      check("model",        modelFilter,    p.model)         &&
      (excludeField === "date" || !tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter);
  };

  const filteredRows  = gatePasses.flatMap(gp => (gp.products || []).filter(p => rowMatchesAll(gp, p)).map(p => ({ gp, p })));
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE);
  const totalQtyAll   = filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0);

  const getOptionsFor = (field) => {
    const map = new Map();
    gatePasses.forEach(gp => {
      (gp.products || []).forEach(p => {
        if (!rowMatchesAll(gp, p, field)) return;
        const val = (field === "productName" || field === "model") ? p[field]?.toString().trim() : gp[field]?.toString().trim();
        if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Trip DO",  values: tripDoFilter,   clear: () => { setTripDoFilter([]); } },
    { label: "Customer", values: customerFilter,  clear: () => { setCustomerFilter([]); } },
    { label: "CSD",      values: csdFilter,       clear: () => { setCsdFilter([]); } },
    { label: "Unit",     values: unitFilter,      clear: () => { setUnitFilter([]); } },
    { label: "Vehicle",  values: vehicleFilter,   clear: () => { setVehicleFilter([]); } },
    { label: "Zone",     values: zoneFilter,      clear: () => { setZoneFilter([]); } },
    { label: "Product",  values: productFilter,   clear: () => { setProductFilter([]); } },
    { label: "Model",    values: modelFilter,     clear: () => { setModelFilter([]); } },
    ...(tripDateFilter ? [{ label: "Date", values: [tripDateFilter], clear: () => { setTripDateFilter(""); } }] : []),
  ].filter(f => f.values.length > 0);

  const totalActiveFilters = activeFilterGroups.reduce((s, f) => s + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
          <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#374151", confirmButtonText: "Export", cancelButtonText: "Cancel",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      let exportData = [];
      const toRow = (gp, p) => ({ "Trip Do": gp.tripDo, "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "", Customer: gp.customerName, CSD: gp.csd, Unit: gp.unit || "", "Vehicle No": gp.vehicleNo, Zone: gp.zone, Product: p.productName, Model: p.model, Qty: Number(p.quantity) || 0, User: gp.currentUser });
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(({ gp, p }) => toRow(gp, p));
      } else {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axiosSecure.get(`/gate-pass?month=${month}&year=${year}&page=1&limit=5000`);
        (res.data.data || []).forEach(gp => gp.products?.forEach(p => exportData.push(toRow(gp, p))));
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
        Swal.close();
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

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  /* ════════════════════════════════════════════════════════════════
     RENDER — CarRentPage style: full height, no double scroll
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ══ COMPACT HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">

          {/* Title */}
          <h2 className="text-sm font-bold text-gray-800 shrink-0">Gate Pass Inventory</h2>

          {/* Count + qty */}
          <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 shrink-0">
              Qty: {totalQtyAll}
            </span>
          )}

          {/* Active filter chips */}
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 text-white text-[9px] rounded shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
              <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
            </span>
          ))}
          {totalActiveFilters > 0 && (
            <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0">Clear all</button>
          )}

          {/* Spacer */}
          <div className="hidden sm:block flex-1" />

          {/* Mobile filter toggle */}
          {isMobile && (
            <button onClick={() => setShowMobileFilters(true)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all shrink-0
                ${totalActiveFilters > 0 ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters{totalActiveFilters > 0 && ` (${totalActiveFilters})`}
            </button>
          )}

          {/* Month */}
          <select className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 focus:outline-none shrink-0"
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); }}>
            {MONTHS_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>
            ))}
          </select>

          {/* Year */}
          <input type="number"
            className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 w-16 focus:outline-none shrink-0"
            value={year} onChange={e => { setYear(parseInt(e.target.value)); }} />

          {/* Reset */}
          <button onClick={handleResetAll}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shrink-0 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export — শুধু admin */}
          {role === "admin" && (
            <button onClick={handleExportExcel}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-700 transition-all shrink-0 whitespace-nowrap">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">XLS</span>
            </button>
          )}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 italic text-sm border border-dashed border-gray-200 rounded-lg m-3 bg-white">
            No gate pass found.
          </div>
        ) : isMobile ? (

          /* ════ MOBILE ════ */
          <div className="h-full overflow-y-auto p-2">
            {paginatedRows.map(({ gp, p }, idx) => (
              <MobileCard key={`${gp._id}-${p._id || idx}`} gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-2">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 bg-white">← Prev</button>
                <span className="text-xs text-gray-500">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 bg-white">Next →</button>
              </div>
            )}
          </div>

        ) : (

          /* ════ DESKTOP — single scroll, pagination fixed ════ */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">

              {/* Table */}
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse text-xs lg:text-sm" style={{ minWidth: "820px" }}>
                  <thead className="sticky top-0 z-20">
                    {/* Column headers */}
                    <tr className="bg-gray-800 text-white text-left">
                      {["Trip DO","Trip Date","Customer","CSD","Unit","Vehicle No","Zone","Product","Model","Qty","Action"].map(h => (
                        <th key={h} className="px-2 lg:px-3 py-2 font-normal text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                    {/* Filter row — always visible */}
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-1 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("tripDo")} selected={tripDoFilter} onChange={setFilter(setTripDoFilter)} placeholder="All" />
                      </th>
                      <th className="p-1 border-r border-gray-200">
                        <input type="date" className="w-full px-1 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                          value={tripDateFilter} onChange={e => { setTripDateFilter(e.target.value); }} />
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")} selected={customerFilter} onChange={setFilter(setCustomerFilter)} placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("csd")}          selected={csdFilter}      onChange={setFilter(setCsdFilter)}      placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("unit")}         selected={unitFilter}     onChange={setFilter(setUnitFilter)}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={setFilter(setVehicleFilter)}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setFilter(setZoneFilter)}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}  selected={productFilter}  onChange={setFilter(setProductFilter)}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}        selected={modelFilter}    onChange={setFilter(setModelFilter)}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200 text-center text-xs font-semibold text-gray-700">{totalQtyAll}</th>
                      <th className="p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map(({ gp, p }, idx) => (
                      <tr key={`${gp._id}-${p._id || idx}`} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
                        <td className="px-2 lg:px-3 py-1.5 whitespace-nowrap">
                          <span className="text-[10px] lg:text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{gp.tripDo}</span>
                        </td>
                        <td className="px-2 lg:px-3 py-1.5 text-gray-500 whitespace-nowrap text-[10px] lg:text-xs">
                          {gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-2 lg:px-3 py-1.5 font-medium text-gray-800 text-xs">{gp.customerName}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-gray-500 text-[10px] lg:text-xs">{gp.csd?.toUpperCase()}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-gray-500 text-[10px] lg:text-xs">{gp.unit?.toUpperCase() || "—"}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-[10px] lg:text-xs">{gp.vehicleNo?.toUpperCase()}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-gray-600 text-[10px] lg:text-xs">{gp.zone}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-xs">{p.productName}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-gray-500 text-[10px] lg:text-xs">{p.model?.toUpperCase()}</td>
                        <td className="px-2 lg:px-3 py-1.5 text-center font-semibold text-xs">{p.quantity}</td>
                        <td className="px-2 lg:px-3 py-1.5">
                          <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination — fixed at bottom */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
                  <p className="text-xs text-gray-500">
                    {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} / {filteredRows.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors">← Prev</button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="px-1 text-gray-400 text-xs">…</span>
                      ) : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-2.5 py-1 text-xs border rounded transition-colors ${clientPage === p ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 hover:bg-gray-100"}`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showMobileFilters && (
        <MobileFilterPanel
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
          setClientPage={setClientPage}
        />
      )}
    </div>
  );
};

export default AllGatePass;