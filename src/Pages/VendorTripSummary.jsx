
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Wallet, ReceiptText, ArrowLeft, Truck, Briefcase, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => n == null ? "—" : "৳ " + Number(n).toLocaleString("en-IN");

/* ── Multi-select ── */
const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
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
        className={`w-full flex items-center justify-between gap-1 px-1.5 py-0.5 text-[10px] rounded-lg border transition text-left ${selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-0.5 flex-shrink-0">
          {selected.length > 0 && <span className="text-slate-400 hover:text-white cursor-pointer" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[140px] w-max max-w-[220px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? ref.current.getBoundingClientRect().left : 0 }}>
          {options.length > 5 && (
            <div className="p-1.5 border-b border-slate-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
          )}
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs hover:bg-slate-50 ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
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
    className={`w-full px-1.5 py-0.5 text-[10px] rounded-lg border outline-none transition ${value ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ── Payment badge ── */
const PayBadge = ({ ps, bill }) => {
  if (!ps || bill === 0) return null;
  if (ps.status === "paid")    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">✓ Paid</span>;
  if (ps.status === "partial") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Partial</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">Unpaid</span>;
};

/* ── Mobile Trip Card ── */
const TripCard = ({ t, idx, ps, onView }) => {
  const bill      = Number(t.rent || 0) + Number(t.leborBill || 0);
  const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">#{idx + 1}</span>
          <span className="text-[10px] bg-slate-900 text-white rounded-lg px-1.5 py-0.5 font-mono font-bold flex-shrink-0">{t.tripNumber}</span>
          <PayBadge ps={ps} bill={bill} />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-slate-400 hidden xs:block">{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
          <button onClick={() => onView(t)} className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition">View</button>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="grid grid-cols-3 gap-1 mb-2">
          {[
            { label: "Driver",  value: t.driverName },
            { label: "Point",   value: t.challans ? t.challans.filter(c => !c.isReturn).length : (t.totalChallan ?? "—"), color: "text-emerald-600 font-black" },
            { label: "Vehicle", value: t.vehicleNumber, upper: true },
          ].map(({ label, value, color, upper }) => (
            <div key={label} className={label === "Vehicle" ? "text-right" : ""}>
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
              <p className={`text-xs font-semibold text-slate-800 truncate ${color || ""} ${upper ? "uppercase" : ""}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100">
          {[
            { l: "Rent",    v: t.rent,      fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-red-400",    ok: "text-emerald-700" },
            { l: "Lebor",   v: t.leborBill, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-amber-400",  ok: "text-emerald-700" },
            { l: "Advance", v: t.advance,   fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300",  ok: "text-orange-600" },
            { l: "Total",   v: t.rent != null || t.leborBill != null ? tripTotal : null, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300", ok: "text-indigo-700", bg: "bg-indigo-50 rounded-lg px-0.5" },
          ].map((item, i) => (
            <div key={i} className={`text-center ${item.bg || ""}`}>
              <p className={`text-[8px] uppercase font-black tracking-wider ${i === 3 ? "text-indigo-400" : "text-slate-400"}`}>{item.l}</p>
              {item.v != null
                ? <p className={`text-[11px] font-black ${item.ok}`}>{item.fmt(item.v)}</p>
                : <p className={`text-[9px] font-bold mt-0.5 ${item.miss}`}>—</p>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const VendorTripSummary = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vendor,        setVendor]        = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [tripMonth,     setTripMonth]     = useState(new Date().getMonth() + 1);
  const [tripYear,      setTripYear]      = useState(new Date().getFullYear());
  const [trips,         setTrips]         = useState([]);
  const [tripLoading,   setTripLoading]   = useState(false);
  const [selectedRental,setSelectedRental]= useState(null);
  const [accountTxs,    setAccountTxs]   = useState([]);

  const [tripFilter,      setTripFilter]      = useState([]);
  const [driverFilter,    setDriverFilter]    = useState([]);
  const [vehicleFilter,   setVehicleFilter]   = useState([]);
  const [dateFilter,      setDateFilter]      = useState("");
  const [rentFilter,      setRentFilter]      = useState("");
  const [leborBillFilter, setLeborBillFilter] = useState("");
  const [showFilters,     setShowFilters]     = useState(false);

  useEffect(() => {
    axiosSecure.get(`/vendors/${id}`)
      .then(r => setVendor(r.data))
      .catch(console.error)
      .finally(() => setVendorLoading(false));
  }, [id]);

  useEffect(() => {
    if (!vendor?.vendorName) return;
    setTripLoading(true);
    axiosSecure.get(`/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`)
      .then(r => setTrips((r.data.data || []).filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())))
      .catch(console.error)
      .finally(() => setTripLoading(false));
  }, [tripMonth, tripYear, vendor]);

  useEffect(() => {
    if (!vendor?.vendorName) return;
    axiosSecure.get(`/accounts?month=${tripMonth}&year=${tripYear}`)
      .then(r => setAccountTxs((r.data.data || []).filter(t => t.type === "vendor_payment" && t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())))
      .catch(() => setAccountTxs([]));
  }, [tripMonth, tripYear, vendor]);

  const handleRentalUpdate = (u) => {
    setTrips(prev => prev.map(t => t._id === u._id ? { ...u } : t));
    setSelectedRental(prev => prev ? { ...prev, ...u } : prev);
  };

  const rowMatch = (t, ex = null) => {
    const chk = (f, fil, v) => f === ex || fil.length === 0 || fil.some(x => v?.toLowerCase() === x.toLowerCase());
    return chk("tripNumber",   tripFilter,    t.tripNumber)
      && chk("driverName",     driverFilter,  t.driverName)
      && chk("vehicleNumber",  vehicleFilter, t.vehicleNumber)
      && (ex === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter)
      && (!rentFilter      || (rentFilter      === "missing" ? t.rent      == null : t.rent      != null))
      && (!leborBillFilter || (leborBillFilter === "missing" ? t.leborBill == null : t.leborBill != null));
  };

  const filteredTrips = trips.filter(t => rowMatch(t));

  const getOpts = (field) => {
    const map = new Map();
    trips.forEach(t => {
      if (!rowMatch(t, field)) return;
      const v = t[field]?.toString().trim();
      if (v && !map.has(v.toLowerCase())) map.set(v.toLowerCase(), v);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const hasFilter = tripFilter.length > 0 || driverFilter.length > 0 || vehicleFilter.length > 0 || dateFilter || rentFilter || leborBillFilter;

  const handleReset = () => {
    setTripMonth(new Date().getMonth() + 1); setTripYear(new Date().getFullYear());
    setTripFilter([]); setDriverFilter([]); setVehicleFilter([]);
    setDateFilter(""); setRentFilter(""); setLeborBillFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1000 });
  };

  const handleExport = async () => {
    const { value: et } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:13px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#f97316">
          <span><b>Filtered</b> (${filteredTrips.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${MONTHS[tripMonth - 1]} ${tripYear}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#f97316", confirmButtonText: "Export",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!et) return;
    try {
      let src = et === "filtered" ? filteredTrips : [];
      if (et === "full") {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const r = await axiosSecure.get(`/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`);
        src = (r.data.data || []).filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase());
        Swal.close();
      }
      if (!src.length) return Swal.fire({ icon: "warning", title: "No Data" });
      const rows = src.map((t, i) => ({
        "#": i + 1, Date: new Date(t.createdAt).toLocaleDateString("en-GB"),
        Trip: t.tripNumber, Driver: t.driverName, Vehicle: t.vehicleNumber,
        Point:   t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
        Rent:    t.rent      != null ? Number(t.rent)      : "",
        Lebor:   t.leborBill != null ? Number(t.leborBill) : "",
        Advance: t.advance   != null ? Number(t.advance)   : "",
        Total:   (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Trips");
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `${vendor?.vendorName}_${et === "filtered" ? "Filtered" : "Full"}_${tripMonth}_${tripYear}.xlsx`
      );
      Swal.fire({ icon: "success", title: "Exported!", text: `${rows.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const payStatus = (() => {
    const sorted = [...trips].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let rem = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
    const map = {};
    for (const t of sorted) {
      const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
      const due  = Math.max(0, bill - Number(t.advance || 0));
      if (due === 0)       { map[t._id] = { status: "paid",    paidAmount: bill }; }
      else if (rem >= due) { map[t._id] = { status: "paid",    paidAmount: due  }; rem -= due; }
      else if (rem > 0)    { map[t._id] = { status: "partial", paidAmount: rem  }; rem = 0; }
      else                 { map[t._id] = { status: "unpaid",  paidAmount: 0    }; }
    }
    return map;
  })();

  const totalPaid  = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalRent  = filteredTrips.reduce((s, t) => s + (t.rent      != null ? Number(t.rent)      : 0), 0);
  const totalLebor = filteredTrips.reduce((s, t) => s + (t.leborBill != null ? Number(t.leborBill) : 0), 0);
  const totalAdv   = filteredTrips.reduce((s, t) => s + (t.advance   != null ? Number(t.advance)   : 0), 0);
  const totalBill  = totalRent + totalLebor;
  const totalDue   = Math.max(0, totalBill - totalAdv - totalPaid);

  if (vendorLoading) return <LoadingSpinner text="Loading vendor..." />;
  if (!vendor)       return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;

  const summaryItems = [
    { label: "Rent",    value: fmt(totalRent),  color: "text-indigo-300" },
    { label: "Lebor",   value: fmt(totalLebor), color: "text-sky-300" },
    { label: "Total",   value: fmt(totalBill),  color: "text-emerald-300" },
    { label: "Advance", value: fmt(totalAdv),   color: "text-orange-300" },
    { label: "Paid",    value: fmt(totalPaid),  color: "text-indigo-300" },
    { label: "Due",     value: totalDue > 0 ? fmt(totalDue) : "✓ Cleared", color: totalDue > 0 ? "text-rose-400" : "text-emerald-400" },
  ];

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold";

  return (
    <div className="flex flex-col h-full page-enter">

      {/* ── TOP BAR ── */}
      <div className="flex-shrink-0 pb-2 space-y-1.5">

        {/* Row 1: back + vendor + export */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition flex-shrink-0">
            <ArrowLeft size={14} />
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center flex-shrink-0">
              {vendor.vendorImg
                ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                : <Briefcase size={14} className="text-white" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate leading-tight">{vendor.vendorName}</p>
              <p className="text-[10px] text-slate-400">
                <span className="font-bold">{filteredTrips.length}/{trips.length}</span> trips · {MONTHS[tripMonth - 1]} {tripYear}
              </p>
            </div>
          </div>

          <button onClick={handleExport}
            className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Row 2: month + year + filter + reset */}
        <div className="flex items-center gap-2">
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none flex-1 min-w-0`}
            value={tripMonth} onChange={e => setTripMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none`}
            value={tripYear} onChange={e => setTripYear(parseInt(e.target.value))} />
          <button onClick={() => setShowFilters(f => !f)}
            className={`${tbtn} ${hasFilter ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 text-slate-600 bg-white"}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <ChevronDown size={10} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button onClick={handleReset}
            className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-200 rounded-xl text-[10px] outline-none focus:border-orange-400 bg-white" /></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip</p><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Driver</p><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rent</p><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} /></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lebor Bill</p><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} /></div>
            </div>
          </div>
        )}
      </div>

      {/* ── SUMMARY BAR ── */}
      {filteredTrips.length > 0 && (
        <div className="flex-shrink-0 bg-slate-900 rounded-2xl px-4 py-2.5 mb-2">
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            {summaryItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                <p className={`text-[11px] font-black ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-3">
              {summaryItems.slice(0, 3).map((item, i) => (
                <React.Fragment key={i}>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                    <p className={`text-xs font-black ${item.color}`}>{item.value}</p>
                  </div>
                  {i < 2 && <span className="text-slate-600 font-bold">{i === 1 ? "=" : "+"}</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-3 ml-auto">
              {summaryItems.slice(3).map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-600">→</span>}
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                    <p className={`text-xs font-black ${item.color}`}>{item.value}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TRIPS CONTAINER ── */}
      <div className="flex-1 min-h-0 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText size={13} className="text-slate-600" />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Trip Records</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{MONTHS[tripMonth - 1]} {tripYear}</span>
        </div>

        {tripLoading ? (
          <div className="flex-1 flex items-center justify-center"><LoadingSpinner text="Loading trips…" /></div>
        ) : trips.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300">
            <Truck size={32} />
            <p className="text-xs font-black uppercase tracking-widest">No trips found</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="flex-1 min-h-0 overflow-auto sm:hidden">
              <div className="p-3 space-y-2.5">
                {filteredTrips.length === 0
                  ? <div className="py-12 text-center text-slate-400 text-sm">No trips match the filter.</div>
                  : filteredTrips.map((t, idx) => (
                    <TripCard key={t._id} t={t} idx={idx} ps={payStatus[t._id]} onView={setSelectedRental} />
                  ))
                }
                {filteredTrips.length > 0 && (
                  <div className="bg-slate-900 rounded-2xl px-4 py-3 grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: "Rent",  v: `৳${totalRent.toLocaleString()}`,  c: "text-indigo-300" },
                      { l: "Lebor", v: `৳${totalLebor.toLocaleString()}`, c: "text-indigo-300" },
                      { l: "Adv",   v: `৳${totalAdv.toLocaleString()}`,   c: "text-orange-300" },
                      { l: "Total", v: `৳${totalBill.toLocaleString()}`,  c: "text-emerald-300" },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.l}</p>
                        <p className={`text-[10px] font-black ${item.c}`}>{item.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop table */}
            <div className="flex-1 min-h-0 overflow-auto hidden sm:block">
              {filteredTrips.length === 0
                ? <div className="py-12 text-center text-slate-400 italic text-sm">No trips match the filter.</div>
                : (
                  <table className="w-full border-collapse text-xs" style={{ minWidth: "720px" }}>
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-slate-900 text-left">
                        {["#","Date","Trip","Driver","Vehicle","Pt","Rent","Lebor Bill","Advance","Total","Payment","View"].map((h, i) => (
                          <th key={i} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="p-1 border-r border-slate-200 w-8" />
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "108px" }}>
                          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                            className="w-full px-1.5 py-0.5 border border-slate-200 rounded-lg text-[9px] outline-none focus:border-orange-400 bg-white" />
                        </th>
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("tripNumber")}    selected={tripFilter}    onChange={setTripFilter} /></th>
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "96px" }}><MultiSelectFilter options={getOpts("driverName")}    selected={driverFilter}  onChange={setDriverFilter} /></th>
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
                        <th className="p-1 border-r border-slate-200 w-8" />
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "70px" }}><SimpleSelect value={rentFilter}      onChange={setRentFilter}      options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                        <th className="p-1 border-r border-slate-200" style={{ minWidth: "78px" }}><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                        <th className="p-1 border-r border-slate-200 w-20" />
                        <th className="p-1 border-r border-slate-200 w-20" />
                        <th className="p-1 border-r border-slate-200 w-20" />
                        <th className="p-1 w-14" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map((t, idx) => {
                        const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
                        const ps   = payStatus[t._id];
                        const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
                        return (
                          <tr key={t._id} className="border-b border-slate-100 hover:bg-amber-50/30 even:bg-slate-50/40 transition-colors">
                            <td className="px-2.5 py-2 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
                            <td className="px-2.5 py-2 text-[10px] text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
                            <td className="px-2.5 py-2"><span className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 font-mono font-bold">{t.tripNumber}</span></td>
                            <td className="px-2.5 py-2 text-[11px] text-slate-700 max-w-[110px] truncate">{t.driverName}</td>
                            <td className="px-2.5 py-2 text-[10px] text-slate-600 uppercase font-mono">{t.vehicleNumber}</td>
                            <td className="px-2.5 py-2 text-center font-black text-slate-700 text-[11px]">{t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}</td>
                            <td className="px-2.5 py-2 text-center">
                              {t.rent != null
                                ? <span className="text-[11px] font-semibold text-emerald-700">৳{Number(t.rent).toLocaleString()}</span>
                                : <span className="text-[9px] text-red-400 bg-red-50 border border-red-200 rounded-lg px-1.5 py-0.5">Missing</span>
                              }
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              {t.leborBill != null
                                ? <span className="text-[11px] font-semibold text-emerald-700">৳{Number(t.leborBill).toLocaleString()}</span>
                                : <span className="text-[9px] text-amber-500 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-0.5">Missing</span>
                              }
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              {t.advance != null ? <span className="text-[11px] font-semibold text-orange-600">৳{Number(t.advance).toLocaleString()}</span> : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              {t.rent != null || t.leborBill != null ? <span className="text-[11px] font-black text-indigo-700">৳{tripTotal.toLocaleString()}</span> : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-2.5 py-2 text-center"><PayBadge ps={ps} bill={bill} /></td>
                            <td className="px-2.5 py-2 text-center">
                              <button onClick={() => setSelectedRental(t)}
                                className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-lg transition">
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-10">
                      <tr className="bg-slate-900 text-white">
                        <td colSpan={6} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest">Total ({filteredTrips.length} trips)</td>
                        <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalRent.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalLebor.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center font-black text-orange-300 whitespace-nowrap">৳{totalAdv.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-center font-black text-emerald-300 whitespace-nowrap">৳{totalBill.toLocaleString()}</td>
                        <td /><td />
                      </tr>
                    </tfoot>
                  </table>
                )
              }
            </div>
          </>
        )}
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
