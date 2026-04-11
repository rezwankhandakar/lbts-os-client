import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Wallet, ReceiptText, ArrowLeft, Truck, Briefcase } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";
 
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
        <div
          className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[150px] w-max max-w-[240px] overflow-hidden"
          style={{
            zIndex: 9999,
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
            left: ref.current ? ref.current.getBoundingClientRect().left : 0,
          }}
        >
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
 
/* ── Simple select filter ── */
const SimpleSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`w-full px-2 py-1 text-xs rounded border outline-none transition-all
      ${value ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
 
/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const VendorTripSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
 
  const [vendor, setVendor] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);
 
  const [tripMonth, setTripMonth] = useState(new Date().getMonth() + 1);
  const [tripYear, setTripYear] = useState(new Date().getFullYear());
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
 
  const [selectedRental,  setSelectedRental]  = useState(null);
  const [accountTxs,      setAccountTxs]      = useState([]); // vendor payments from accounts
 
  /* ── filters ── */
  const [tripFilter,      setTripFilter]      = useState([]);
  const [driverFilter,    setDriverFilter]    = useState([]);
  const [vehicleFilter,   setVehicleFilter]   = useState([]);
  const [dateFilter,      setDateFilter]      = useState("");
  const [rentFilter,      setRentFilter]      = useState("");
  const [leborBillFilter, setLeborBillFilter] = useState("");
 
  /* ── fetch vendor ── */
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axiosSecure.get(`/vendors/${id}`);
        setVendor(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setVendorLoading(false);
      }
    };
    fetchVendor();
  }, [id]);
 
  /* ── fetch trips ── */
  useEffect(() => {
    if (!vendor?.vendorName) return;
    const fetchTrips = async () => {
      setTripLoading(true);
      try {
        const res = await axiosSecure.get(
          `/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`
        );
        const all = res.data.data || [];
        setTrips(
          all.filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())
        );
      } catch (err) {
        console.error(err);
      }
      setTripLoading(false);
    };
    fetchTrips();
  }, [tripMonth, tripYear, vendor]);
 
  /* ── fetch vendor payments for this month ── */
  useEffect(() => {
    if (!vendor?.vendorName) return;
    const fetchPayments = async () => {
      try {
        const res = await axiosSecure.get(`/accounts?month=${tripMonth}&year=${tripYear}`);
        const txs = res.data.data || [];
        setAccountTxs(txs.filter(t =>
          t.type === "vendor_payment" &&
          t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase()
        ));
      } catch { setAccountTxs([]); }
    };
    fetchPayments();
  }, [tripMonth, tripYear, vendor]);
 
  /* ── modal update sync ── */
  const handleRentalUpdate = (updatedRental) => {
    setTrips(prev => prev.map(t => t._id === updatedRental._id ? { ...updatedRental } : t));
    setSelectedRental(prev => prev ? { ...prev, ...updatedRental } : prev);
  };
 
  /* ── filtering logic ── */
  const rowMatchesAll = (t, excludeField = null) => {
    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
 
    return (
      check("tripNumber",    tripFilter,    t.tripNumber) &&
      check("driverName",    driverFilter,  t.driverName) &&
      check("vehicleNumber", vehicleFilter, t.vehicleNumber) &&
      (excludeField === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
      (!rentFilter ||
        (rentFilter === "missing" && t.rent == null) ||
        (rentFilter === "added"   && t.rent != null)) &&
      (!leborBillFilter ||
        (leborBillFilter === "missing" && t.leborBill == null) ||
        (leborBillFilter === "added"   && t.leborBill != null))
    );
  };
 
  const filteredTrips = trips.filter(t => rowMatchesAll(t));
 
  const getOptionsFor = (field) => {
    const map = new Map();
    trips.forEach(t => {
      if (!rowMatchesAll(t, field)) return;
      const val = t[field]?.toString().trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };
 
  /* ── reset ── */
  const handleReset = () => {
    setTripMonth(new Date().getMonth() + 1);
    setTripYear(new Date().getFullYear());
    setTripFilter([]);
    setDriverFilter([]);
    setVehicleFilter([]);
    setDateFilter("");
    setRentFilter("");
    setLeborBillFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };
 
  /* ── active filter chips ── */
  const activeFilterGroups = [
    { label: "Trip",       values: tripFilter,    clear: () => setTripFilter([]) },
    { label: "Driver",     values: driverFilter,  clear: () => setDriverFilter([]) },
    { label: "Vehicle",    values: vehicleFilter, clear: () => setVehicleFilter([]) },
    ...(dateFilter      ? [{ label: "Date",       values: [dateFilter],      clear: () => setDateFilter("") }]      : []),
    ...(rentFilter      ? [{ label: "Rent",       values: [rentFilter],      clear: () => setRentFilter("") }]      : []),
    ...(leborBillFilter ? [{ label: "Lebor Bill", values: [leborBillFilter], clear: () => setLeborBillFilter("") }] : []),
  ].filter(f => f.values.length > 0);
 
  /* ── export excel ── */
const handleExportExcel = async () => {
  const { value: exportType } = await Swal.fire({
    title: "Export to Excel",
    html: `<div style="text-align:left;padding:8px 0">
      <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
        <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
        <span><b>Filtered data</b> — currently visible (${filteredTrips.length} rows)</span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
        <input type="radio" name="et" value="full">
        <span><b>Full month</b> — ${new Date(0, tripMonth - 1).toLocaleString("default", { month: "long" })} ${tripYear}</span>
      </label>
    </div>`,
    showCancelButton: true,
    confirmButtonColor: "#374151",
    confirmButtonText: "Export",
    cancelButtonText: "Cancel",
    preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
  });
  if (!exportType) return;
 
  try {
    let sourceData = [];
 
    if (exportType === "filtered") {
      if (!filteredTrips.length) return Swal.fire({ icon: "warning", title: "No Data" });
      sourceData = filteredTrips;
    } else {
      Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await axiosSecure.get(
        `/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`
      );
      sourceData = (res.data.data || []).filter(
        t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase()
      );
      if (!sourceData.length) return Swal.fire({ icon: "warning", title: "No Data" });
      Swal.close();
    }
 
    const exportData = sourceData.map((t, idx) => ({
      "#":              idx + 1,
      Date:             new Date(t.createdAt).toLocaleDateString("en-GB"),
      "Trip Number":    t.tripNumber,
      Driver:           t.driverName,
      Vehicle:          t.vehicleNumber,
      Point:            t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
      "Rent (৳)":       t.rent      != null ? Number(t.rent)      : "",
      "Lebor Bill (৳)": t.leborBill != null ? Number(t.leborBill) : "",
      "Advance (৳)":    t.advance   != null ? Number(t.advance)   : "",
      "Total (৳)":
        (t.rent      != null ? Number(t.rent)      : 0) +
        (t.leborBill != null ? Number(t.leborBill) : 0),
    }));
 
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trips");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `${vendor?.vendorName}_${exportType === "filtered" ? "Filtered" : "Full"}_${tripMonth}_${tripYear}.xlsx`
    );
    Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
  } catch {
    Swal.fire("Error", "Export failed", "error");
  }
};
 
  /* ── Payment status per trip ── */
  // Trips oldest first দিয়ে cumulative payment settle করো
  const tripPaymentStatus = (() => {
    const sorted = [...trips].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const totalPaid = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
    let remaining = totalPaid;
    const statusMap = {};
    for (const t of sorted) {
      const bill    = Number(t.rent || 0) + Number(t.leborBill || 0);
      const advance = Number(t.advance || 0);
      const due     = Math.max(0, bill - advance);
      if (due === 0) {
        statusMap[t._id] = { status: "paid", paidAmount: bill };
      } else if (remaining >= due) {
        statusMap[t._id] = { status: "paid", paidAmount: due };
        remaining -= due;
      } else if (remaining > 0) {
        statusMap[t._id] = { status: "partial", paidAmount: remaining };
        remaining = 0;
      } else {
        statusMap[t._id] = { status: "unpaid", paidAmount: 0 };
      }
    }
    return statusMap;
  })();
 
  const totalVendorPaid = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
 
  /* ── summary calculations (filtered) ── */
  const totalRent      = filteredTrips.reduce((s, t) => s + (t.rent      != null ? Number(t.rent)      : 0), 0);
  const totalLeborBill = filteredTrips.reduce((s, t) => s + (t.leborBill != null ? Number(t.leborBill) : 0), 0);
  const totalAdvance   = filteredTrips.reduce((s, t) => s + (t.advance   != null ? Number(t.advance)   : 0), 0);
  const totalBill      = totalRent + totalLeborBill;
  const totalDue       = totalBill - totalAdvance;
 
  if (vendorLoading) return <LoadingSpinner text="Loading vendor..." />;
  if (!vendor) return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;
 
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
 
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
 
            {/* Vendor mini card */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                {vendor.vendorImg
                  ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                  : <Briefcase size={16} className="text-white" />
                }
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none">{vendor.vendorName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Trip Summary</p>
              </div>
            </div>
          </div>
 
          {/* Month/Year + reset + export */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 rounded px-2 py-1 shadow-sm">
              {filteredTrips.length} / {trips.length} trips
            </span>
            <select
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-sm"
              value={tripMonth}
              onChange={e => setTripMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-sm"
              value={tripYear}
              onChange={e => setTripYear(parseInt(e.target.value))}
            />
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              Reset All
            </button>
            <button onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Excel
            </button>
          </div>
        </div>
 
        {/* ── Active filter chips ── */}
        {activeFilterGroups.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Filters:</span>
            {activeFilterGroups.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded">
                {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} selected`}
                <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
              </span>
            ))}
          </div>
        )}
 
        {/* ── Summary Cards ── */}
        {filteredTrips.length > 0 && (
          <div className="bg-slate-800 rounded-2xl px-6 py-5 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <span className="text-[9px] text-indigo-300 uppercase font-black tracking-widest leading-none mb-1">Rent</span>
                <span className="text-sm font-black text-indigo-300">৳ {totalRent.toLocaleString()}</span>
              </div>
              <span className="text-slate-500 font-bold text-lg">+</span>
              <div className="flex flex-col px-4 py-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                <span className="text-[9px] text-sky-300 uppercase font-black tracking-widest leading-none mb-1">Lebor Bill</span>
                <span className="text-sm font-black text-sky-300">৳ {totalLeborBill.toLocaleString()}</span>
              </div>
              <span className="text-slate-500 font-bold text-lg">=</span>
              <div className="flex flex-col px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[9px] text-emerald-300 uppercase font-black tracking-widest leading-none mb-1">Total Bill</span>
                <span className="text-sm font-black text-emerald-300">৳ {totalBill.toLocaleString()}</span>
              </div>
 
              <div className="ml-auto flex items-center gap-3">
                <div className="flex flex-col px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <span className="text-[9px] text-orange-300 uppercase font-black tracking-widest leading-none mb-1 flex items-center gap-1">
                    <Wallet size={9} /> Advance
                  </span>
                  <span className="text-sm font-black text-orange-300">৳ {totalAdvance.toLocaleString()}</span>
                </div>
                <span className="text-slate-500 font-bold text-lg">→</span>
                <div className="flex flex-col px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <span className="text-[9px] text-indigo-300 uppercase font-black tracking-widest leading-none mb-1">Paid</span>
                  <span className="text-sm font-black text-indigo-300">৳ {totalVendorPaid.toLocaleString()}</span>
                </div>
                <span className="text-slate-500 font-bold text-lg">→</span>
                <div className="flex flex-col px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-[9px] text-rose-300 uppercase font-black tracking-widest leading-none mb-1">Due</span>
                  <span className="text-sm font-black text-rose-300">৳ {Math.max(0, totalDue - totalVendorPaid).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* ── Trip Table ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText size={16} className="text-slate-600" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Trips</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {new Date(0, tripMonth - 1).toLocaleString("default", { month: "long" })} {tripYear}
            </span>
          </div>
 
          {tripLoading ? (
            <div className="py-16 text-center text-slate-400 italic text-sm">Loading trips…</div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2 opacity-30">
                <Truck size={40} />
                <p className="text-sm font-black uppercase tracking-widest italic">No trips found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-420px)]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
                    {["#", "Date", "Trip", "Driver", "Vehicle", "Point", "Rent", "Lebor Bill", "Advance", "Total", "Payment", "View"].map(h => (
                      <th key={h} className="px-4 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                  {/* ── Filter row ── */}
                  <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
                    <th className="p-1 border-r border-gray-200"></th>
                    {/* Date */}
                    <th className="p-1 border-r border-gray-200">
                      <input type="date"
                        className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                        value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                    </th>
                    {/* Trip */}
                    <th className="p-1 border-r border-gray-200">
                      <MultiSelectFilter options={getOptionsFor("tripNumber")} selected={tripFilter} onChange={setTripFilter} placeholder="All" />
                    </th>
                    {/* Driver */}
                    <th className="p-1 border-r border-gray-200">
                      <MultiSelectFilter options={getOptionsFor("driverName")} selected={driverFilter} onChange={setDriverFilter} placeholder="All" />
                    </th>
                    {/* Vehicle */}
                    <th className="p-1 border-r border-gray-200">
                      <MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} placeholder="All" />
                    </th>
                    {/* Point — no filter */}
                    <th className="p-1 border-r border-gray-200"></th>
                    {/* Rent filter */}
                    <th className="p-1 border-r border-gray-200">
                      <SimpleSelect value={rentFilter} onChange={setRentFilter} options={[
                        { value: "",        label: "All" },
                        { value: "added",   label: "Added" },
                        { value: "missing", label: "Missing" },
                      ]} />
                    </th>
                    {/* Lebor Bill filter */}
                    <th className="p-1 border-r border-gray-200">
                      <SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[
                        { value: "",        label: "All" },
                        { value: "added",   label: "Added" },
                        { value: "missing", label: "Missing" },
                      ]} />
                    </th>
                    {/* Advance, Total, Payment, View — no filter */}
                    <th className="p-1 border-r border-gray-200"></th>
                    <th className="p-1 border-r border-gray-200"></th>
                    <th className="p-1 border-r border-gray-200"></th>
                    <th className="p-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((t, idx) => {
                    const tripTotal =
                      (t.rent      != null ? Number(t.rent)      : 0) +
                      (t.leborBill != null ? Number(t.leborBill) : 0);
                    return (
                      <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] font-bold text-slate-400 text-center">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{t.tripNumber}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-700">{t.driverName}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 uppercase">{t.vehicleNumber}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700 text-center">
                          {t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.rent != null
                            ? <span className="text-green-700">৳ {Number(t.rent).toLocaleString()}</span>
                            : <span className="text-[10px] text-red-400 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Missing</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.leborBill != null
                            ? <span className="text-green-700">৳ {Number(t.leborBill).toLocaleString()}</span>
                            : <span className="text-[10px] text-orange-400 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">Missing</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.advance != null
                            ? <span className="text-orange-600">৳ {Number(t.advance).toLocaleString()}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold">
                          {t.rent != null || t.leborBill != null
                            ? <span className="text-indigo-700">৳ {tripTotal.toLocaleString()}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {(() => {
                            const ps = tripPaymentStatus[t._id];
                            const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
                            if (!ps || bill === 0) return <span className="text-gray-300 text-xs">—</span>;
                            if (ps.status === "paid") return (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 uppercase tracking-wide">
                                ✓ Paid
                              </span>
                            );
                            if (ps.status === "partial") return (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-amber-700 bg-amber-50 border-amber-200 uppercase tracking-wide whitespace-nowrap">
                                Partial
                              </span>
                            );
                            return (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-red-600 bg-red-50 border-red-200 uppercase tracking-wide">
                                Unpaid
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setSelectedRental(t)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
 
                {/* Footer total row */}
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-black text-sm sticky bottom-0">
                    <td colSpan={6} className="px-4 py-3 text-xs text-slate-500 uppercase tracking-widest">
                      Total ({filteredTrips.length} trips)
                    </td>
                    <td className="px-4 py-3 text-center text-indigo-700">৳ {totalRent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-indigo-700">৳ {totalLeborBill.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-orange-600">৳ {totalAdvance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-emerald-700">৳ {totalBill.toLocaleString()}</td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
 
      <CarRentDetailsModal
        selectedRental={selectedRental}
        setSelectedRental={setSelectedRental}
        onRentalUpdate={handleRentalUpdate}
        readOnly={true}
      />
    </div>
  );
};
 
export default VendorTripSummary;