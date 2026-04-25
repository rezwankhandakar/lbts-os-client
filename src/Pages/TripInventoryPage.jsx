
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import TripDetailsModal from "../Component/TripDetailsModal";
import LoadingSpinner from "../Component/LoadingSpinner";

const ITEMS_PER_PAGE = 400;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Multi-select ── */
const MultiSelect = ({ options, selected, onChange, placeholder = "All" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const label    = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} sel`;
  const toggle   = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && <span className="text-slate-400 hover:text-white cursor-pointer" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[150px] w-max max-w-[240px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 250) : 0 }}>
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
              <button onClick={() => onChange([])} className="w-full text-[10px] text-slate-400 uppercase py-1 hover:text-slate-700">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SimpleSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`w-full px-2 py-1 text-[11px] rounded-lg border outline-none transition-all ${value ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ── Mobile Trip Card ── */
const MobileTripCard = ({ t, onView }) => {
  const challans = t.challans || [];
  const normalChallans  = challans.filter(c => !c.isReturn);
  const allDelivered    = normalChallans.length > 0 && normalChallans.every(c => c.deliveryStatus === "confirmed");
  const allReceived     = normalChallans.length > 0 && normalChallans.every(c => c.challanReturnStatus === "received");

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] bg-slate-900 text-white rounded-lg px-2 py-0.5 font-mono font-bold flex-shrink-0">{t.tripNumber}</span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
        </div>
        <button onClick={() => onView(t)}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition flex-shrink-0">
          View
        </button>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: "Vendor",  value: t.vendorName    },
            { label: "Driver",  value: t.driverName    },
            { label: "Vehicle", value: t.vehicleNumber },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
              <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
            Points: <span className="text-emerald-600 font-black text-xs">{t.challanQty ?? t.totalChallan}</span>
          </span>
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${allDelivered ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {allDelivered ? "✓ Delivered" : "Not Delivered"}
            </span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${allReceived ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {allReceived ? "✓ Challan" : "Challan Pend."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const TripInventoryPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries,    setDeliveries]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [selectedTrip,  setSelectedTrip]  = useState(null);
  const [clientPage,    setClientPage]    = useState(1);
  const [isMobile,      setIsMobile]      = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const [tripFilter,     setTripFilter]     = useState([]);
  const [vendorFilter,   setVendorFilter]   = useState([]);
  const [driverFilter,   setDriverFilter]   = useState([]);
  const [vehicleFilter,  setVehicleFilter]  = useState([]);
  const [dateFilter,     setDateFilter]     = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [challanFilter,  setChallanFilter]  = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchDeliveries = async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/deliveries?search=${encodeURIComponent(search)}&page=1&limit=5000`
        : `/deliveries?month=${m}&year=${y}&page=1&limit=5000`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchDeliveries(month, year, searchText); }, [month, year, searchText]);

  const tripRows = deliveries.map(t => ({
    _id: t._id, tripNumber: t.tripNumber, vendorName: t.vendorName,
    vendorNumber: t.vendorNumber, driverName: t.driverName, driverNumber: t.driverNumber,
    vehicleNumber: t.vehicleNumber,
    totalChallan: t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
    challanQty:   t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
    createdAt: t.createdAt, createdBy: t.createdBy, currentUser: t.currentUser,
    challans: t.challans, advance: t.advance ?? null,
    advanceSavedBy: t.advanceSavedBy ?? null,
    lastUpdatedBy: t.lastUpdatedBy ?? null, lastUpdatedAt: t.lastUpdatedAt ?? null,
  }));

  const handleTripUpdate = (updatedTrip) => {
    setDeliveries(prev => prev.map(d => d._id === updatedTrip._id ? { ...d, ...updatedTrip } : d));
    setSelectedTrip(prev => prev ? { ...prev, ...updatedTrip } : prev);
  };

  const rowMatchesAll = (t, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const challans       = t.challans || [];
    const normalChallans = challans.filter(c => !c.isReturn);
    const allDelivered   = normalChallans.length > 0 && normalChallans.every(c => c.deliveryStatus === "confirmed");
    const allReceived    = normalChallans.length > 0 && normalChallans.every(c => c.challanReturnStatus === "received");
    const matchesSearch  = !searchText || [t.tripNumber, t.vendorName, t.driverName, t.vehicleNumber].some(v => v?.toLowerCase().includes(s));
    const check = (field, filter, val) => field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
    return matchesSearch &&
      check("tripNumber",    tripFilter,    t.tripNumber) &&
      check("vendorName",    vendorFilter,  t.vendorName) &&
      check("driverName",    driverFilter,  t.driverName) &&
      check("vehicleNumber", vehicleFilter, t.vehicleNumber) &&
      (excludeField === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
      (!deliveryFilter || (deliveryFilter === "delivered" && allDelivered) || (deliveryFilter === "notDelivered" && !allDelivered)) &&
      (!challanFilter  || (challanFilter  === "received"  && allReceived)  || (challanFilter  === "notReceived" && !allReceived));
  };

  const filteredRows  = tripRows.filter(t => rowMatchesAll(t));
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE);

  const getOptionsFor = (field) => {
    const map = new Map();
    tripRows.forEach(t => {
      if (!rowMatchesAll(t, field)) return;
      const val = t[field]?.toString().trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const hasFilter = tripFilter.length > 0 || vendorFilter.length > 0 || driverFilter.length > 0 ||
    vehicleFilter.length > 0 || dateFilter || deliveryFilter || challanFilter;

  const handleReset = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
    setVehicleFilter([]); setDateFilter(""); setDeliveryFilter(""); setChallanFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const activeFilterGroups = [
    { label: "Trip",     values: tripFilter,    clear: () => setTripFilter([]) },
    { label: "Vendor",   values: vendorFilter,  clear: () => setVendorFilter([]) },
    { label: "Driver",   values: driverFilter,  clear: () => setDriverFilter([]) },
    { label: "Vehicle",  values: vehicleFilter, clear: () => setVehicleFilter([]) },
    ...(dateFilter     ? [{ label: "Date",     values: [dateFilter],     clear: () => setDateFilter("") }] : []),
    ...(deliveryFilter ? [{ label: "Delivery", values: [deliveryFilter], clear: () => setDeliveryFilter("") }] : []),
    ...(challanFilter  ? [{ label: "Challan",  values: [challanFilter],  clear: () => setChallanFilter("") }] : []),
  ].filter(f => f.values.length > 0);

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
      showCancelButton: true, confirmButtonColor: "#f97316", confirmButtonText: "Export",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      const toRow = (t) => ({
        Date: new Date(t.createdAt).toLocaleDateString(), Trip: t.tripNumber, Vendor: t.vendorName,
        "Vendor Number": t.vendorNumber || "", Driver: t.driverName,
        "Driver Number": t.driverNumber || "", Vehicle: t.vehicleNumber,
        Points: t.challanQty ?? t.totalChallan,
        "Delivery Status": (t.challans || []).filter(c => !c.isReturn).every(c => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
        "Challan Status":  (t.challans || []).filter(c => !c.isReturn).every(c => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
      });
      let exportData = [];
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(toRow);
      } else {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}&page=1&limit=5000`);
        exportData = (res.data.data || []).map(toRow);
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
        Swal.close();
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Trips");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `TripInventory_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 2)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Trip Inventory</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} trips{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
              <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
            </span>
          ))}
          {hasFilter && <button onClick={handleReset} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">Clear all</button>}
          <div className="hidden sm:block flex-1" />
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); }}>
            {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
          </select>
          <input type="number" className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none`}
            value={year} onChange={e => setYear(parseInt(e.target.value))} />
          <button onClick={handleReset} className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={handleExportExcel} className={`${tbtn} bg-amber-600 text-white border-amber-600 hover:bg-amber-700`}>
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <p className="font-semibold text-slate-600">No trips found</p>
            <p className="text-sm mt-1">Try adjusting filters or date range</p>
          </div>
        ) : isMobile ? (
          <div className="h-full overflow-y-auto p-2">
            {/* Mobile filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2 shadow-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Date</p>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-orange-400 bg-white" />
              </div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Trip</p><MultiSelect options={getOptionsFor("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Vendor</p><MultiSelect options={getOptionsFor("vendorName")} selected={vendorFilter} onChange={setVendorFilter} /></div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Driver</p><MultiSelect options={getOptionsFor("driverName")} selected={driverFilter} onChange={setDriverFilter} /></div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Vehicle</p><MultiSelect options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Delivery</p>
                <SimpleSelect value={deliveryFilter} onChange={setDeliveryFilter}
                  options={[{ value: "", label: "All" }, { value: "delivered", label: "Delivered" }, { value: "notDelivered", label: "Not Delivered" }]} />
              </div>
              <div className="col-span-2"><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Challan</p>
                <SimpleSelect value={challanFilter} onChange={setChallanFilter}
                  options={[{ value: "", label: "All" }, { value: "received", label: "All Received" }, { value: "notReceived", label: "Not Received" }]} />
              </div>
            </div>
            <div className="space-y-2">
              {paginatedRows.map((t, i) => <MobileTripCard key={i} t={t} onView={setSelectedTrip} />)}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse text-xs" style={{ minWidth: "700px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {["Date","Trip Number","Vendor","Driver","Vehicle","Point","Delivery","Challan","Action"].map(h => (
                        <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200">
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-orange-400 bg-white" />
                      </th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("tripNumber")}    selected={tripFilter}    onChange={setTripFilter} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("vendorName")}   selected={vendorFilter}  onChange={setVendorFilter} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("driverName")}   selected={driverFilter}  onChange={setDriverFilter} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
                      <th className="p-1 border-r border-slate-200" />
                      <th className="p-1 border-r border-slate-200">
                        <SimpleSelect value={deliveryFilter} onChange={setDeliveryFilter}
                          options={[{ value: "", label: "All" }, { value: "delivered", label: "All Delivered" }, { value: "notDelivered", label: "Not Delivered" }]} />
                      </th>
                      <th className="p-1 border-r border-slate-200">
                        <SimpleSelect value={challanFilter} onChange={setChallanFilter}
                          options={[{ value: "", label: "All" }, { value: "received", label: "All Received" }, { value: "notReceived", label: "Not Received" }]} />
                      </th>
                      <th className="p-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((t, i) => {
                      const challans       = t.challans || [];
                      const normalChallans = challans.filter(c => !c.isReturn);
                      const allDelivered   = normalChallans.length > 0 && normalChallans.every(c => c.deliveryStatus === "confirmed");
                      const allReceived    = normalChallans.length > 0 && normalChallans.every(c => c.challanReturnStatus === "received");
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-amber-50/30 even:bg-slate-50/40 transition-colors text-center">
                          <td className="px-2.5 py-2 text-slate-500 whitespace-nowrap text-left">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-2.5 py-2">
                            <span className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-mono font-bold">{t.tripNumber}</span>
                          </td>
                          <td className="px-2.5 py-2 text-slate-700 text-left max-w-[130px] truncate">{t.vendorName}</td>
                          <td className="px-2.5 py-2 text-slate-700 text-left max-w-[110px] truncate">{t.driverName}</td>
                          <td className="px-2.5 py-2 text-slate-600 uppercase font-mono text-[11px]">{t.vehicleNumber}</td>
                          <td className="px-2.5 py-2 font-black text-slate-700">{t.challanQty}</td>
                          <td className="px-2.5 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${allDelivered ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                              {allDelivered ? "✓ Delivered" : "Not Delivered"}
                            </span>
                          </td>
                          <td className="px-2.5 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${allReceived ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                              {allReceived ? "✓ Received" : "Not Received"}
                            </span>
                          </td>
                          <td className="px-2.5 py-2">
                            <button onClick={() => setSelectedTrip(t)}
                              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition">
                              View
                            </button>
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
                    {pageNumbers.map((p, i) => p === "..." ? <span key={i} className="px-1.5 text-slate-400 text-xs">…</span> : (
                      <button key={i} onClick={() => setClientPage(p)}
                        className={`px-3 py-1.5 text-xs border rounded-lg font-semibold ${clientPage === p ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 bg-white hover:bg-slate-100"}`}>{p}</button>
                    ))}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <TripDetailsModal selectedTrip={selectedTrip} setSelectedTrip={setSelectedTrip} onTripUpdate={handleTripUpdate} />
    </div>
  );
};

export default TripInventoryPage;
