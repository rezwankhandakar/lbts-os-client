import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ITEMS_PER_PAGE = 100;
const now = new Date();

/* ── Multi-select dropdown ── */
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
  const label    = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  const toggle   = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${
          selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
        }`}>
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
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[160px] w-max max-w-[240px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 245) : 0 }}>
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-3 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-orange-500 flex-shrink-0" />
                  <span className="truncate text-slate-700">{opt}</span>
                </label>
              ))
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

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const LaborBillPage = () => {
  const axiosSecure = useAxiosSecure();
  const navigate    = useNavigate();
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [year,       setYear]       = useState(now.getFullYear());
  const [isMobile,   setIsMobile]   = useState(false);
  const [clientPage, setClientPage] = useState(1);

  /* Column filters */
  const [dateFilter,     setDateFilter]     = useState([]);
  const [tripFilter,     setTripFilter]     = useState([]);
  const [customerFilter, setCustomerFilter] = useState([]);
  const [zoneFilter,     setZoneFilter]     = useState([]);
  const [addressFilter,  setAddressFilter]  = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [thanaFilter,    setThanaFilter]    = useState([]);
  const [receiverFilter, setReceiverFilter] = useState([]);
  const [productFilter,  setProductFilter]  = useState([]);
  const [modelFilter,    setModelFilter]    = useState([]);
  const [floorFilter,    setFloorFilter]    = useState([]);
  const [carryingFilter, setCarryingFilter] = useState([]);
  const [noteFilter,     setNoteFilter]     = useState([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/labor-bill?month=${month}&year=${year}`);
      if (res.data.success) setRows(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [month, year, axiosSecure]);

  useEffect(() => { setClientPage(1); fetchData(); }, [fetchData]);

  // window focus — TripDetailsModal থেকে ফিরে আসলে re-fetch
  useEffect(() => {
    window.addEventListener("focus", fetchData);
    return () => window.removeEventListener("focus", fetchData);
  }, [fetchData]);

  const setFilter = setter => val => { setter(val); setClientPage(1); };

  // flat rows — প্রতিটা product আলাদা row
  const flatRows = useMemo(() => {
    const result = [];
    rows.forEach(r => {
      const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "—";
      const products = r.products?.length ? r.products : [{ productName: "—", model: "—", quantity: 0 }];
      products.forEach(p => {
        result.push({ ...r, _date: dateStr, _product: p });
      });
    });
    return result;
  }, [rows]);

  const filteredRows = useMemo(() => {
    return flatRows.filter(r => {
      const check = (filter, val) => filter.length === 0 || filter.some(f => (val || "").toLowerCase() === f.toLowerCase());
      return (
        check(dateFilter,     r._date) &&
        check(tripFilter,     r.tripNumber) &&
        check(customerFilter, r.customerName) &&
        check(zoneFilter,     r.zone) &&
        check(addressFilter,  r.address) &&
        check(districtFilter, r.district) &&
        check(thanaFilter,    r.thana) &&
        check(receiverFilter, r.receiverNumber) &&
        check(productFilter,  r._product.productName) &&
        check(modelFilter,    r._product.model) &&
        check(floorFilter,    r.floor ? String(r.floor) + " তলা" : "—") &&
        check(carryingFilter, r.carrying || "—") &&
        check(noteFilter,     r.note || "—")
      );
    });
  }, [flatRows, dateFilter, tripFilter, customerFilter, zoneFilter, addressFilter,
      districtFilter, thanaFilter, receiverFilter, productFilter, modelFilter,
      floorFilter, carryingFilter, noteFilter]);

  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(
    () => filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE),
    [filteredRows, clientPage]
  );
  const totalQty = useMemo(
    () => filteredRows.reduce((s, r) => s + (Number(r._product.quantity) || 0), 0),
    [filteredRows]
  );

  const getOptionsFor = useCallback((field) => {
    const map = new Map();
    flatRows.forEach(r => {
      let val = "";
      if      (field === "date")     val = r._date;
      else if (field === "trip")     val = r.tripNumber || "";
      else if (field === "customer") val = r.customerName || "";
      else if (field === "zone")     val = r.zone || "";
      else if (field === "address")  val = r.address || "";
      else if (field === "district") val = r.district || "";
      else if (field === "thana")    val = r.thana || "";
      else if (field === "receiver") val = r.receiverNumber || "";
      else if (field === "product")  val = r._product.productName || "";
      else if (field === "model")    val = r._product.model || "";
      else if (field === "floor")    val = r.floor ? String(r.floor) + " তলা" : "—";
      else if (field === "carrying") val = r.carrying || "—";
      else if (field === "note")     val = r.note || "—";
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [flatRows]);

  const activeFilterGroups = [
    { label: "Date",     values: dateFilter,     clear: () => { setDateFilter([]);     setClientPage(1); } },
    { label: "Trip",     values: tripFilter,     clear: () => { setTripFilter([]);     setClientPage(1); } },
    { label: "Customer", values: customerFilter, clear: () => { setCustomerFilter([]); setClientPage(1); } },
    { label: "Zone",     values: zoneFilter,     clear: () => { setZoneFilter([]);     setClientPage(1); } },
    { label: "Address",  values: addressFilter,  clear: () => { setAddressFilter([]);  setClientPage(1); } },
    { label: "District", values: districtFilter, clear: () => { setDistrictFilter([]); setClientPage(1); } },
    { label: "Thana",    values: thanaFilter,    clear: () => { setThanaFilter([]);    setClientPage(1); } },
    { label: "Receiver", values: receiverFilter, clear: () => { setReceiverFilter([]); setClientPage(1); } },
    { label: "Product",  values: productFilter,  clear: () => { setProductFilter([]);  setClientPage(1); } },
    { label: "Model",    values: modelFilter,    clear: () => { setModelFilter([]);    setClientPage(1); } },
    { label: "Floor",    values: floorFilter,    clear: () => { setFloorFilter([]);    setClientPage(1); } },
    { label: "Carrying", values: carryingFilter, clear: () => { setCarryingFilter([]); setClientPage(1); } },
    { label: "Note",     values: noteFilter,     clear: () => { setNoteFilter([]);     setClientPage(1); } },
  ].filter(f => f.values.length > 0);

  const totalActiveFilters = activeFilterGroups.reduce((s, f) => s + f.values.length, 0);

  const handleResetAll = () => {
    setDateFilter([]); setTripFilter([]); setCustomerFilter([]); setZoneFilter([]);
    setAddressFilter([]); setDistrictFilter([]); setThanaFilter([]); setReceiverFilter([]);
    setProductFilter([]); setModelFilter([]); setFloorFilter([]); setCarryingFilter([]);
    setNoteFilter([]); setClientPage(1);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const YEARS = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

const handleExport = async () => {
  if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });

  const { isConfirmed } = await Swal.fire({
    title: "Export করবেন?",
    html: `<p style="font-size:13px;color:#6b7280">${filteredRows.length} rows export হবে — <b>${MONTHS_FULL[month-1]} ${year}</b></p>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#10b981",
    confirmButtonText: "Export করুন",
    cancelButtonText: "Cancel",
  });
  if (!isConfirmed) return;

  const data = filteredRows.map(r => ({
      Date:      r._date,
      "Trip No": r.tripNumber || "",
      Customer:  r.customerName,
      Zone:      r.zone,
      Address:   r.address,
      District:  r.district,
      Thana:     r.thana,
      Receiver:  r.receiverNumber,
      Product:   r._product.productName,
      Model:     r._product.model,
      Qty:       Number(r._product.quantity) || 0,
      Floor:     r.floor || "",
      Carrying:  r.carrying || "",
      Note:      r.note || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labor Bill");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `LaborBill_${MONTHS_FULL[month-1]}_${year}.xlsx`
    );
    Swal.fire({ icon: "success", title: "Exported!", text: `${data.length} rows`, timer: 1500, showConfirmButton: false });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">

          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-sm shadow-sm shadow-emerald-200">🏢</div>
            <h2 className="text-sm font-black text-slate-800">Labor Bill</h2>
          </div>

          {/* Counts */}
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 shrink-0">
              {new Set(filteredRows.map(r => r.tripNumber)).size} <span className="font-semibold text-emerald-500">trips</span>
            </span>
          )}
          {totalQty > 0 && (
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
              Qty: {totalQty.toLocaleString()}
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

          {/* Month / Year */}
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
            {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
          </select>
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none w-20`}
            value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Reset */}
          <button onClick={handleResetAll}
            className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export */}
          <button onClick={handleExport} className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span><span className="sm:hidden">XLS</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">🏢</div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">{MONTHS_FULL[month-1]} {year}-তে কোনো Floor/Carrying entry নেই</p>
              <p className="text-sm mt-1 text-slate-400">Delivered page-এ 🏢 button দিয়ে entry করো</p>
            </div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
            <p className="font-semibold text-slate-600">Filter অনুযায়ী কোনো entry নেই</p>
            <button onClick={handleResetAll} className="text-xs text-orange-500 underline">Filters clear করো</button>
          </div>
        ) : isMobile ? (
          /* ── Mobile cards ── */
          <div className="h-full overflow-y-auto p-2 space-y-2">
            {paginatedRows.map((r, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{r.customerName}</p>
                    <p className="text-[10px] text-slate-400">
                      {r._date} ·{" "}
                      <button onClick={() => r.tripId && navigate(`/trip/${r.tripId}`)}
                        className="font-mono text-indigo-500 hover:text-indigo-700 underline decoration-dotted">
                        {r.tripNumber}
                      </button>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {r.floor && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">{r.floor} তলা</span>
                    )}
                    {r.carrying && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold truncate max-w-[100px]">🚐 {r.carrying}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2 text-[10px]">
                  {[["Zone", r.zone],["District", r.district],["Thana", r.thana],["Receiver", r.receiverNumber]].map(([l,v]) => (
                    <div key={l}><span className="text-slate-400 font-bold uppercase text-[9px]">{l}: </span>
                      <span className="text-slate-600">{v || "—"}</span></div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-700 font-medium">{r._product.productName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{r._product.model}</span>
                    <span className="text-xs font-black text-slate-800">{r._product.quantity} pcs</span>
                  </div>
                </div>
                {r.note && <p className="mt-1.5 text-[10px] text-amber-600 italic">📝 {r.note}</p>}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                <span className="text-xs text-slate-500 font-medium">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
              </div>
            )}
          </div>
        ) : (
          /* ── Desktop table ── */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse text-[12px]" style={{ minWidth: "1100px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {["Date","Trip","Customer","Zone","Address","District","Thana","Receiver","Product","Model","Qty","Floor","Carrying","Note"].map(h => (
                        <th key={h} className="px-2 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("date")}     selected={dateFilter}     onChange={setFilter(setDateFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("trip")}     selected={tripFilter}     onChange={setFilter(setTripFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("customer")} selected={customerFilter} onChange={setFilter(setCustomerFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}     selected={zoneFilter}     onChange={setFilter(setZoneFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("address")}  selected={addressFilter}  onChange={setFilter(setAddressFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("district")} selected={districtFilter} onChange={setFilter(setDistrictFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("thana")}    selected={thanaFilter}    onChange={setFilter(setThanaFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("receiver")} selected={receiverFilter} onChange={setFilter(setReceiverFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("product")}  selected={productFilter}  onChange={setFilter(setProductFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}    selected={modelFilter}    onChange={setFilter(setModelFilter)} /></th>
                      <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQty.toLocaleString()}</th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("floor")}    selected={floorFilter}    onChange={setFilter(setFloorFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("carrying")} selected={carryingFilter} onChange={setFilter(setCarryingFilter)} /></th>
                      <th className="p-1"><MultiSelect options={getOptionsFor("note")} selected={noteFilter} onChange={setFilter(setNoteFilter)} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((r, idx) => (
                      <tr key={idx} className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/20 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                        <td className="px-2 py-1.5 text-black whitespace-nowrap">{r._date}</td>
                        <td className="px-2 py-1.5">
                          {/* Trip number → trip details (rows-এ tripId আগে থেকেই ছিল, ব্যবহার হতো না) */}
                          <button
                            onClick={() => r.tripId && navigate(`/trip/${r.tripId}`)}
                            title="Open trip details"
                            className="font-mono text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline transition"
                          >
                            {r.tripNumber}
                          </button>
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-slate-800 max-w-[100px]" title={r.customerName}><span className="block truncate">{r.customerName}</span></td>
                        <td className="px-2 py-1.5 text-black"><span className="block truncate">{r.zone}</span></td>
                        <td className="px-2 py-1.5 text-black max-w-[100px]" title={r.address}><span className="block truncate">{r.address}</span></td>
                        <td className="px-2 py-1.5 text-black"><span className="block truncate">{r.district}</span></td>
                        <td className="px-2 py-1.5 text-black"><span className="block truncate">{r.thana}</span></td>
                        <td className="px-2 py-1.5 text-black"><span className="block truncate">{r.receiverNumber}</span></td>
                        <td className="px-2 py-1.5"><span className="block truncate">{r._product.productName}</span></td>
                        <td className="px-2 py-1.5 font-mono text-[11px] text-black uppercase"><span className="block truncate">{r._product.model}</span></td>
                        <td className="px-2 py-1.5 text-center font-black text-slate-700">{r._product.quantity}</td>
                        <td className="px-2 py-1.5 text-center">
                          {r.floor
                            ? <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">{r.floor}F</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-2 py-1.5 max-w-[90px]">
                          {r.carrying
                            ? <span className="block truncate text-[11px] font-semibold text-amber-600">{r.carrying}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-2 py-1.5 max-w-[80px]">
                          {r.note
                            ? <span className="block truncate text-[10px] text-amber-600 italic">{r.note}</span>
                            : <span className="text-slate-300">—</span>}
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
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? <span key={i} className="px-1.5 text-slate-400 text-xs">…</span> : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-3 py-1.5 text-xs border rounded-lg font-semibold ${clientPage === p ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 bg-white hover:bg-slate-100"}`}>
                          {p}
                        </button>
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
    </div>
  );
};

export default LaborBillPage;