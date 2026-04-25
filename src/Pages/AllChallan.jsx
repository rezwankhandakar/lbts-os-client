
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ChallanActionDropdown from "../Component/ChallanActionDropdown";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const ITEMS_PER_PAGE = 100;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ══════════════════════════════════════════════════════════════
   Multi-select dropdown
══════════════════════════════════════════════════════════════ */
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
    : `${selected.length} selected`;
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${
          selected.length > 0
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
        }`}
      >
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && (
            <span className="text-slate-400 hover:text-white px-0.5 cursor-pointer leading-none"
              onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
          )}
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
          </svg>
        </span>
      </button>

      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[160px] w-max max-w-[260px] overflow-hidden"
          style={{
            zIndex: 9999,
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
            left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 270) : 0,
          }}>
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-3 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 transition-colors ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                    className="w-3 h-3 accent-orange-500 cursor-pointer flex-shrink-0" />
                  <span className="truncate text-slate-700">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => onChange([])}
                className="w-full text-[10px] text-slate-400 uppercase tracking-widest py-1 hover:text-slate-700 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Status badge
══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status, tripNumber }) => {
  if (status === "delivered") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 whitespace-nowrap">
          ✓ Delivered
        </span>
        {tripNumber && <span className="text-[9px] text-emerald-600 font-mono font-semibold pl-1">{tripNumber}</span>}
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-200 whitespace-nowrap">
      ● Pending
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Mobile card
══════════════════════════════════════════════════════════════ */
const MobileCard = ({ c, p, axiosSecure, setChallans }) => (
  <div className={`border rounded-xl p-3 mb-2 shadow-sm ${c.status === "delivered" ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-slate-200"}`}>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}</span>
        <StatusBadge status={c.status} tripNumber={c.tripNumber} />
      </div>
      <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} setChallans={setChallans} />
    </div>
    <p className="text-xs font-bold text-slate-800 mb-1 truncate">{c.customerName}</p>
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mb-2">
      <span className="truncate max-w-[140px]"><span className="text-slate-400">Addr </span>{c.address}</span>
      <span><span className="text-slate-400">Thana </span>{c.thana || "—"}</span>
      <span><span className="text-slate-400">Dist </span>{c.district || "—"}</span>
      <span><span className="text-slate-400">Zone </span>{c.zone}</span>
      <span><span className="text-slate-400">Ph </span>{c.receiverNumber}</span>
    </div>
    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold text-slate-800">{p.productName || "—"}</span>
        <span className="text-[9px] text-slate-400 ml-1.5">{p.model?.toUpperCase()}</span>
      </div>
      <div className="ml-2 flex-shrink-0">
        <span className="text-[9px] text-slate-400 mr-1">Qty</span>
        <span className="text-xs font-black text-slate-800">{p.quantity}</span>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Mobile filter bottom sheet
══════════════════════════════════════════════════════════════ */
const MobileFilterSheet = ({ onClose, getOptionsFor,
  customerFilter, setCustomerFilter, addressFilter, setAddressFilter,
  thanaFilter, setThanaFilter, districtFilter, setDistrictFilter,
  receiverFilter, setReceiverFilter, zoneFilter, setZoneFilter,
  productNameFilter, setProductNameFilter, modelFilter, setModelFilter,
  dateFilter, setDateFilter, statusFilter, setStatusFilter, setClientPage }) => {

  const setF = setter => val => { setter(val); setClientPage(1); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Filters</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Date</p>
              <input type="date" className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-400 bg-white"
                value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Status</p>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 outline-none bg-white focus:border-orange-400">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            {[
              { label: "Customer", opts: "customerName",   sel: customerFilter,    set: setCustomerFilter },
              { label: "Address",  opts: "address",        sel: addressFilter,     set: setAddressFilter },
              { label: "Thana",    opts: "thana",          sel: thanaFilter,       set: setThanaFilter },
              { label: "District", opts: "district",       sel: districtFilter,    set: setDistrictFilter },
              { label: "Receiver", opts: "receiverNumber", sel: receiverFilter,    set: setReceiverFilter },
              { label: "Zone",     opts: "zone",           sel: zoneFilter,        set: setZoneFilter },
              { label: "Product",  opts: "productName",    sel: productNameFilter, set: setProductNameFilter },
              { label: "Model",    opts: "model",          sel: modelFilter,       set: setModelFilter },
            ].map((f, i) => (
              <div key={i}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">{f.label}</p>
                <MultiSelect options={getOptionsFor(f.opts)} selected={f.sel} onChange={setF(f.set)} />
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white text-sm rounded-xl font-bold">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const AllChallan = () => {
  const axiosSecure = useAxiosSecure();
  const [challans,          setChallans]          = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [clientPage,        setClientPage]        = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile,          setIsMobile]          = useState(false);

  const { searchText, setSearchText } = useSearch();

  const [customerFilter,    setCustomerFilter]    = useState([]);
  const [addressFilter,     setAddressFilter]     = useState([]);
  const [thanaFilter,       setThanaFilter]       = useState([]);
  const [districtFilter,    setDistrictFilter]    = useState([]);
  const [receiverFilter,    setReceiverFilter]    = useState([]);
  const [zoneFilter,        setZoneFilter]        = useState([]);
  const [modelFilter,       setModelFilter]       = useState([]);
  const [productNameFilter, setProductNameFilter] = useState([]);
  const [dateFilter,        setDateFilter]        = useState("");
  const [statusFilter,      setStatusFilter]      = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const setFilter = setter => val => { setter(val); setClientPage(1); };

  const fetchChallans = async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/challans?search=${encodeURIComponent(search)}&page=1&limit=5000`
        : `/challans?month=${m}&year=${y}&page=1&limit=5000`;
      const res = await axiosSecure.get(url);
      setChallans(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { setClientPage(1); fetchChallans(month, year, searchText); }, [month, year, searchText]);

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear()); setClientPage(1);
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setAddressFilter([]); setThanaFilter([]);
    setDistrictFilter([]); setReceiverFilter([]); setZoneFilter([]);
    setModelFilter([]); setProductNameFilter([]); setDateFilter(""); setStatusFilter("");
    setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = (c, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [
      c.customerName, c.address, c.thana, c.district,
      c.receiverNumber, c.zone, c.currentUser, p.productName, p.model
    ].some(v => v?.toLowerCase().includes(s));
    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
    const matchesStatus = !statusFilter ||
      (statusFilter === "delivered" && c.status === "delivered") ||
      (statusFilter === "pending"   && c.status !== "delivered");
    return matchesSearch && matchesStatus &&
      check("customerName",   customerFilter,    c.customerName) &&
      check("address",        addressFilter,     c.address) &&
      check("thana",          thanaFilter,       c.thana) &&
      check("district",       districtFilter,    c.district) &&
      check("receiverNumber", receiverFilter,    c.receiverNumber) &&
      check("zone",           zoneFilter,        c.zone) &&
      check("productName",    productNameFilter, p.productName) &&
      check("model",          modelFilter,       p.model) &&
      (excludeField === "date" || !dateFilter ||
        (c.createdAt && new Date(c.createdAt).toISOString().slice(0, 10) === dateFilter));
  };

  const filteredRows  = challans.flatMap(c => (c.products || []).filter(p => rowMatchesAll(c, p)).map(p => ({ c, p })));
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE);
  const totalQtyAll   = filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0);

  const getOptionsFor = (field) => {
    const map = new Map();
    challans.forEach(c => {
      (c.products || []).forEach(p => {
        if (!rowMatchesAll(c, p, field)) return;
        const val = (field === "productName" || field === "model") ? p[field]?.toString().trim() : c[field]?.toString().trim();
        if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Customer", values: customerFilter,    clear: () => { setCustomerFilter([]);    setClientPage(1); } },
    { label: "Address",  values: addressFilter,     clear: () => { setAddressFilter([]);     setClientPage(1); } },
    { label: "Thana",    values: thanaFilter,       clear: () => { setThanaFilter([]);       setClientPage(1); } },
    { label: "District", values: districtFilter,    clear: () => { setDistrictFilter([]);    setClientPage(1); } },
    { label: "Receiver", values: receiverFilter,    clear: () => { setReceiverFilter([]);    setClientPage(1); } },
    { label: "Zone",     values: zoneFilter,        clear: () => { setZoneFilter([]);        setClientPage(1); } },
    { label: "Product",  values: productNameFilter, clear: () => { setProductNameFilter([]); setClientPage(1); } },
    { label: "Model",    values: modelFilter,       clear: () => { setModelFilter([]);       setClientPage(1); } },
    ...(dateFilter   ? [{ label: "Date",   values: [dateFilter],   clear: () => { setDateFilter("");   setClientPage(1); } }] : []),
    ...(statusFilter ? [{ label: "Status", values: [statusFilter], clear: () => { setStatusFilter(""); setClientPage(1); } }] : []),
  ].filter(f => f.values.length > 0);

  const totalActiveFilters = activeFilterGroups.reduce((s, f) => s + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#f97316">
          <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#f97316",
      confirmButtonText: "Export", cancelButtonText: "Cancel",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      let exportData = [];
      const toRow = (c, p) => ({
        Date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
        Status: c.status === "delivered" ? "Delivered" : "Pending",
        "Trip No": c.tripNumber || "",
        Customer: c.customerName, Address: c.address,
        Thana: c.thana || "", District: c.district || "",
        "Receiver No": c.receiverNumber, Zone: c.zone,
        "Product Name": p.productName, Model: p.model,
        Qty: Number(p.quantity) || 0, User: c.currentUser || "N/A",
      });
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(({ c, p }) => toRow(c, p));
      } else {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axiosSecure.get(`/challans?month=${month}&year=${year}&page=1&limit=5000`);
        (res.data.data || []).forEach(c => c.products?.forEach(p => exportData.push(toRow(c, p))));
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
        Swal.close();
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ChallanReport");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `Challan_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  /* ── btn helpers ── */
  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

      {/* ══ HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">

          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Challan Inventory</h2>
          </div>

          {/* Counts */}
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
              Qty: {totalQtyAll.toLocaleString()}
            </span>
          )}

          {/* Active filter chips */}
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
              <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
            </span>
          ))}
          {totalActiveFilters > 0 && (
            <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">
              Clear all
            </button>
          )}

          <div className="hidden sm:block flex-1" />

          {/* Mobile filter toggle */}
          {isMobile && (
            <button onClick={() => setShowMobileFilters(true)}
              className={`${tbtn} relative ${totalActiveFilters > 0 ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
            </button>
          )}

          {/* Month selector */}
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
            {MONTHS_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>
            ))}
          </select>

          {/* Year */}
          <input type="number"
            className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none focus:border-orange-400`}
            value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }} />

          {/* Reset */}
          <button onClick={handleResetAll}
            className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export */}
          <button onClick={handleExportExcel}
            className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">XLS</span>
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 m-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="font-semibold text-slate-600">No challans found</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : isMobile ? (

          /* ── MOBILE ── */
          <div className="h-full overflow-y-auto p-2">
            {paginatedRows.map(({ c, p }, idx) => (
              <MobileCard key={`${c._id}-${idx}`} c={c} p={p} axiosSecure={axiosSecure} setChallans={setChallans} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-1">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">
                  ← Prev
                </button>
                <span className="text-xs text-slate-500 font-medium">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">
                  Next →
                </button>
              </div>
            )}
          </div>

        ) : (

          /* ── DESKTOP ── */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="border-collapse w-full" style={{ minWidth: "900px" }}>
                  <thead className="sticky top-0 z-20">
                    {/* Column headers */}
                    <tr className="bg-slate-900 text-left">
                      {["Date","Status","Customer","Address","Thana","District","Receiver No","Zone","Product","Model","Qty","Action"].map(h => (
                        <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">
                          {h}
                        </th>
                      ))}
                    </tr>

                    {/* Filter row */}
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200">
                        <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-orange-400 bg-white" />
                      </th>
                      <th className="p-1 border-r border-slate-200">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                          className={`w-full px-1.5 py-1 text-[11px] rounded-lg border outline-none ${statusFilter ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("customerName")}   selected={customerFilter}    onChange={setFilter(setCustomerFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("address")}        selected={addressFilter}     onChange={setFilter(setAddressFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("thana")}          selected={thanaFilter}       onChange={setFilter(setThanaFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("district")}       selected={districtFilter}    onChange={setFilter(setDistrictFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("receiverNumber")} selected={receiverFilter}    onChange={setFilter(setReceiverFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}           selected={zoneFilter}        onChange={setFilter(setZoneFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("productName")}    selected={productNameFilter} onChange={setFilter(setProductNameFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}          selected={modelFilter}       onChange={setFilter(setModelFilter)} /></th>
                      <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQtyAll.toLocaleString()}</th>
                      <th className="p-1" />
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRows.map(({ c, p }, idx) => (
                      <tr key={`${c._id}-${idx}`}
                        className={`border-b border-slate-100 text-[12px] transition-colors ${
                          c.status === "delivered"
                            ? "bg-emerald-50/40 hover:bg-emerald-50"
                            : "hover:bg-orange-50/30 even:bg-slate-50/40"
                        }`}>
                        <td className="px-2.5 py-2 text-slate-500 whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-2.5 py-2"><StatusBadge status={c.status} tripNumber={c.tripNumber} /></td>
                        <td className="px-2.5 py-2 font-semibold text-slate-800 whitespace-nowrap">{c.customerName}</td>
                        <td className="px-2.5 py-2 text-slate-600 max-w-[140px] truncate" title={c.address}>{c.address}</td>
                        <td className="px-2.5 py-2 text-slate-500">{c.thana || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-500">{c.district || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-500">{c.receiverNumber}</td>
                        <td className="px-2.5 py-2 text-slate-600">{c.zone}</td>
                        <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">{p.productName || "—"}</td>
                        <td className="px-2.5 py-2 text-slate-700 font-mono font-semibold whitespace-nowrap">{p.model?.toUpperCase()}</td>
                        <td className="px-2.5 py-2 text-center font-black text-slate-700">{p.quantity}</td>
                        <td className="px-2.5 py-2">
                          <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} setChallans={setChallans} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                  <p className="text-xs text-slate-500 font-medium">
                    {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold transition-colors">
                      ← Prev
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="px-1.5 text-slate-400 text-xs">…</span>
                      ) : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-3 py-1.5 text-xs border rounded-lg transition-colors font-semibold ${
                            clientPage === p
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-slate-200 bg-white hover:bg-slate-100"
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      {showMobileFilters && (
        <MobileFilterSheet
          onClose={() => setShowMobileFilters(false)}
          getOptionsFor={getOptionsFor}
          customerFilter={customerFilter} setCustomerFilter={setCustomerFilter}
          addressFilter={addressFilter} setAddressFilter={setAddressFilter}
          thanaFilter={thanaFilter} setThanaFilter={setThanaFilter}
          districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
          receiverFilter={receiverFilter} setReceiverFilter={setReceiverFilter}
          zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
          productNameFilter={productNameFilter} setProductNameFilter={setProductNameFilter}
          modelFilter={modelFilter} setModelFilter={setModelFilter}
          dateFilter={dateFilter} setDateFilter={setDateFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          setClientPage={setClientPage}
        />
      )}
    </div>
  );
};

export default AllChallan;
