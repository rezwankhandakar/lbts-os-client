


import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ChallanActionDropdown from "../Component/ChallanActionDropdown";
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
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                    className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
                  <span className="truncate">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <button onClick={() => onChange([])}
                className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Status Badge ── */
const StatusBadge = ({ status, tripNumber, small = false }) => {
  if (status === "delivered") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full border border-green-200 whitespace-nowrap ${small ? "text-[9px]" : "text-[10px]"}`}>
          ✓ Delivered
        </span>
        {tripNumber && <span className="text-[9px] text-green-600 font-mono font-semibold pl-1">{tripNumber}</span>}
      </div>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-600 font-bold rounded-full border border-amber-200 whitespace-nowrap ${small ? "text-[9px]" : "text-[10px]"}`}>
      ● Pending
    </span>
  );
};

/* ── Mobile Card ── */
const MobileCard = ({ c, p, axiosSecure, setChallans }) => (
  <div className={`border rounded-lg p-2.5 mb-1.5 shadow-sm ${c.status === "delivered" ? "bg-green-50/60 border-green-200" : "bg-white border-gray-200"}`}>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}</span>
        <StatusBadge status={c.status} tripNumber={c.tripNumber} small />
      </div>
      <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} setChallans={setChallans} />
    </div>
    <div className="text-xs font-semibold text-gray-800 leading-tight mb-1 truncate">{c.customerName}</div>
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500 mb-1.5">
      <span className="truncate max-w-[140px]"><span className="text-gray-400">Addr </span>{c.address}</span>
      <span><span className="text-gray-400">Thana </span>{c.thana || "—"}</span>
      <span><span className="text-gray-400">Dist </span>{c.district || "—"}</span>
      <span><span className="text-gray-400">Zone </span>{c.zone}</span>
      <span><span className="text-gray-400">Ph </span>{c.receiverNumber}</span>
    </div>
    <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 border border-gray-100">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium text-gray-800">{p.productName || "—"}</span>
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
  customerFilter, setCustomerFilter, addressFilter, setAddressFilter,
  thanaFilter, setThanaFilter, districtFilter, setDistrictFilter,
  receiverFilter, setReceiverFilter, zoneFilter, setZoneFilter,
  productNameFilter, setProductNameFilter, modelFilter, setModelFilter,
  dateFilter, setDateFilter, statusFilter, setStatusFilter, setClientPage }) => {

  const setF = setter => val => { setter(val); setClientPage(1); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[78vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Filters</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 w-6 h-6 flex items-center justify-center">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Date</div>
              <input type="date" className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-gray-500 bg-white"
                value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }} />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Status</div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                className={`w-full px-2 py-1 text-xs rounded border outline-none transition-all ${statusFilter ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}>
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
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{f.label}</div>
                <MultiSelectFilter options={getOptionsFor(f.opts)} selected={f.sel} onChange={setF(f.set)} placeholder="All" />
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
const AllChallan = () => {
  const axiosSecure = useAxiosSecure();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientPage, setClientPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const setFilter = (setter) => (val) => { setter(val); setClientPage(1); };

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
      (excludeField === "date" || !dateFilter || (c.createdAt && new Date(c.createdAt).toISOString().slice(0, 10) === dateFilter));
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

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  /* ════════════════════════════════════════════════════════════════
     RENDER — full height, no double scroll (CarRentPage style)
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ══ COMPACT HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">

          {/* Title */}
          <h2 className="text-sm font-bold text-gray-800 shrink-0">Challan Inventory</h2>

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
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all shrink-0 relative
                ${totalActiveFilters > 0 ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters{totalActiveFilters > 0 && ` (${totalActiveFilters})`}
            </button>
          )}

          {/* Month */}
          <select className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 focus:outline-none shrink-0"
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
            {MONTHS_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>
            ))}
          </select>

          {/* Year */}
          <input type="number"
            className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 w-16 focus:outline-none shrink-0"
            value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }} />

          {/* Reset */}
          <button onClick={handleResetAll}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shrink-0 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export */}
          <button onClick={handleExportExcel}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-700 transition-all shrink-0 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
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
          <div className="flex items-center justify-center h-full text-gray-400 italic text-sm border border-dashed border-gray-200 rounded-lg m-3 bg-white">
            No challans found.
          </div>
        ) : isMobile ? (

          /* ════ MOBILE ════ */
          <div className="h-full overflow-y-auto p-2">
            {paginatedRows.map(({ c, p }, idx) => (
              <MobileCard key={`${c._id}-${idx}`} c={c} p={p} axiosSecure={axiosSecure} setChallans={setChallans} />
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
                <table className="w-full border-collapse text-xs" style={{ minWidth: "900px" }}>
                  <thead className="sticky top-0 z-20">
                    {/* Column headers */}
                    <tr className="bg-gray-800 text-white text-left">
                      {["Date","Status","Customer","Address","Thana","District","Receiver No","Zone","Product","Model","Qty","Action"].map(h => (
                        <th key={h} className="px-2 lg:px-3 py-2 font-normal text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                    {/* Filter row — always visible */}
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-1 border-r border-gray-200">
                        <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white" />
                      </th>
                      <th className="p-1 border-r border-gray-200">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                          className={`w-full px-1.5 py-1 text-xs rounded border outline-none transition-all
                            ${statusFilter ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}>
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")}   selected={customerFilter}    onChange={setFilter(setCustomerFilter)}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("address")}        selected={addressFilter}     onChange={setFilter(setAddressFilter)}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("thana")}          selected={thanaFilter}       onChange={setFilter(setThanaFilter)}       placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("district")}       selected={districtFilter}    onChange={setFilter(setDistrictFilter)}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("receiverNumber")} selected={receiverFilter}    onChange={setFilter(setReceiverFilter)}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}           selected={zoneFilter}        onChange={setFilter(setZoneFilter)}        placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}    selected={productNameFilter} onChange={setFilter(setProductNameFilter)} placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}          selected={modelFilter}       onChange={setFilter(setModelFilter)}       placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200 text-center text-xs font-semibold text-gray-700">{totalQtyAll}</th>
                      <th className="p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map(({ c, p }, idx) => (
                      <tr key={`${c._id}-${idx}`} className={`border-b border-gray-100 transition-colors
                        ${c.status === "delivered" ? "bg-green-50/40 hover:bg-green-50" : "hover:bg-amber-50 even:bg-gray-50/50"}`}>
                        <td className="px-2 py-1.5 text-gray-500 text-[9px] lg:text-[10px] whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-2 py-1.5"><StatusBadge status={c.status} tripNumber={c.tripNumber} /></td>
                        <td className="px-2 py-1.5 font-medium text-gray-800 text-[9px] lg:text-[10px] whitespace-nowrap">{c.customerName}</td>
                        <td className="px-2 py-1.5 text-gray-600 text-[9px] lg:text-[10px] max-w-[110px] truncate" title={c.address}>{c.address}</td>
                        <td className="px-2 py-1.5 text-gray-500 text-[9px] lg:text-[10px]">{c.thana || "—"}</td>
                        <td className="px-2 py-1.5 text-gray-500 text-[9px] lg:text-[10px]">{c.district || "—"}</td>
                        <td className="px-2 py-1.5 text-[9px] lg:text-[10px]">{c.receiverNumber}</td>
                        <td className="px-2 py-1.5 text-gray-600 text-[9px] lg:text-[10px]">{c.zone}</td>
                        <td className="px-2 py-1.5 text-[9px] lg:text-[10px] whitespace-nowrap">{p.productName || "—"}</td>
                        <td className="px-2 py-1.5 text-gray-500 text-[9px] lg:text-[10px] whitespace-nowrap font-mono">{p.model?.toUpperCase()}</td>
                        <td className="px-2 py-1.5 text-center font-semibold text-[9px] lg:text-[10px]">{p.quantity}</td>
                        <td className="px-2 lg:px-3 py-1.5">
                          <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} setChallans={setChallans} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination — fixed at bottom, scroll এর বাইরে */}
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