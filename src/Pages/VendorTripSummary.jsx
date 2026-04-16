
// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { Wallet, ReceiptText, ArrowLeft, Truck, Briefcase, ChevronDown } from "lucide-react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import LoadingSpinner from "../Component/LoadingSpinner";
// import CarRentDetailsModal from "../Component/CarRentDetailsModal";

// const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// const fmt = (n) => n == null ? "—" : "৳ " + Number(n).toLocaleString("en-IN");

// /* ── Multi-select ── */
// const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const ref = useRef(null);
//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);
//   const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
//   const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} sel`;
//   const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
//   return (
//     <div ref={ref} className="relative w-full">
//       <button type="button" onClick={() => setOpen(o => !o)}
//         className={`w-full flex items-center justify-between gap-1 px-1.5 py-0.5 text-[10px] rounded border transition text-left
//           ${selected.length > 0 ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-200 bg-white text-gray-400"}`}>
//         <span className="truncate flex-1">{label}</span>
//         <span className="flex items-center gap-0.5 shrink-0">
//           {selected.length > 0 && <span className="text-gray-400 hover:text-gray-700 cursor-pointer" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
//           <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
//         </span>
//       </button>
//       {open && (
//         <div className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] w-max max-w-[220px] overflow-hidden"
//           style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? ref.current.getBoundingClientRect().left : 0 }}>
//           {options.length > 5 && (
//             <div className="p-1.5 border-b border-gray-100">
//               <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
//             </div>
//           )}
//           <div className="max-h-40 overflow-y-auto">
//             {filtered.length === 0
//               ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
//               : filtered.map(opt => (
//                 <label key={opt} className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs hover:bg-gray-50 ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
//                   <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-gray-800 shrink-0" />
//                   <span className="truncate">{opt}</span>
//                 </label>
//               ))}
//           </div>
//           {selected.length > 0 && (
//             <div className="border-t border-gray-100 p-1">
//               <button onClick={() => onChange([])} className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-0.5 hover:text-gray-700">Clear all</button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const SimpleSelect = ({ value, onChange, options }) => (
//   <select value={value} onChange={e => onChange(e.target.value)}
//     className={`w-full px-1.5 py-0.5 text-[10px] rounded border outline-none ${value ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-200 bg-white text-gray-400"}`}>
//     {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//   </select>
// );

// /* ── Payment badge helper ── */
// const PayBadge = ({ ps, bill }) => {
//   if (!ps || bill === 0) return null;
//   if (ps.status === "paid")    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">✓ Paid</span>;
//   if (ps.status === "partial") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Partial</span>;
//   return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">Unpaid</span>;
// };

// /* ── Mobile Trip Card ── */
// const TripCard = ({ t, idx, ps, onView }) => {
//   const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
//   const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
//   return (
//     <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//       <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
//         <div className="flex items-center gap-1.5 min-w-0 flex-1">
//           <span className="text-[10px] font-bold text-gray-400 shrink-0">#{idx + 1}</span>
//           <span className="text-[10px] bg-gray-800 text-white rounded px-1.5 py-0.5 font-mono shrink-0">{t.tripNumber}</span>
//           <PayBadge ps={ps} bill={bill} />
//         </div>
//         <div className="flex items-center gap-1.5 shrink-0">
//           <span className="text-[10px] text-gray-400 hidden xs:block">{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
//           <button onClick={() => onView(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-semibold rounded transition">View</button>
//         </div>
//       </div>
//       <div className="px-3 py-2.5">
//         <div className="flex items-center justify-between gap-2 mb-2">
//           <div>
//             <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Driver</p>
//             <p className="text-xs font-semibold text-gray-800">{t.driverName}</p>
//           </div>
//           <div className="text-center">
//             <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Point</p>
//             <p className="text-xs font-bold text-emerald-700">{t.challans ? t.challans.filter(c => !c.isReturn).length : (t.totalChallan ?? "—")}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Vehicle</p>
//             <p className="text-xs font-semibold text-gray-700 uppercase">{t.vehicleNumber}</p>
//           </div>
//         </div>
//         <div className="grid grid-cols-4 gap-1 pt-2 border-t border-gray-100">
//           {[
//             { l: "Rent",    v: t.rent,     fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-red-400",    ok: "text-green-700" },
//             { l: "Lebor",   v: t.leborBill, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-orange-400", ok: "text-green-700" },
//             { l: "Advance", v: t.advance,  fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300",  ok: "text-orange-600", allowNull: true },
//             { l: "Total",   v: t.rent != null || t.leborBill != null ? tripTotal : null, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300", ok: "text-indigo-700", bg: "bg-indigo-50 rounded-lg px-0.5" },
//           ].map((item, i) => (
//             <div key={i} className={`text-center ${item.bg || ""}`}>
//               <p className={`text-[8px] uppercase font-bold tracking-wider ${i === 3 ? "text-indigo-400" : "text-gray-400"}`}>{item.l}</p>
//               {item.v != null
//                 ? <p className={`text-[11px] font-bold ${item.ok}`}>{item.fmt(item.v)}</p>
//                 : <p className={`text-[9px] font-bold mt-0.5 ${item.miss}`}>—</p>}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ════════════════════════════════════════ */
// const VendorTripSummary = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const axiosSecure = useAxiosSecure();

//   const [vendor,       setVendor]       = useState(null);
//   const [vendorLoading, setVendorLoading] = useState(true);
//   const [tripMonth,    setTripMonth]    = useState(new Date().getMonth() + 1);
//   const [tripYear,     setTripYear]     = useState(new Date().getFullYear());
//   const [trips,        setTrips]        = useState([]);
//   const [tripLoading,  setTripLoading]  = useState(false);
//   const [selectedRental, setSelectedRental] = useState(null);
//   const [accountTxs,   setAccountTxs]  = useState([]);

//   const [tripFilter,      setTripFilter]      = useState([]);
//   const [driverFilter,    setDriverFilter]    = useState([]);
//   const [vehicleFilter,   setVehicleFilter]   = useState([]);
//   const [dateFilter,      setDateFilter]      = useState("");
//   const [rentFilter,      setRentFilter]      = useState("");
//   const [leborBillFilter, setLeborBillFilter] = useState("");
//   const [showFilters,     setShowFilters]     = useState(false);

//   useEffect(() => {
//     axiosSecure.get(`/vendors/${id}`)
//       .then(r => setVendor(r.data))
//       .catch(console.error)
//       .finally(() => setVendorLoading(false));
//   }, [id]);

//   useEffect(() => {
//     if (!vendor?.vendorName) return;
//     setTripLoading(true);
//     axiosSecure.get(`/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`)
//       .then(r => setTrips((r.data.data || []).filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())))
//       .catch(console.error)
//       .finally(() => setTripLoading(false));
//   }, [tripMonth, tripYear, vendor]);

//   useEffect(() => {
//     if (!vendor?.vendorName) return;
//     axiosSecure.get(`/accounts?month=${tripMonth}&year=${tripYear}`)
//       .then(r => setAccountTxs((r.data.data || []).filter(t => t.type === "vendor_payment" && t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())))
//       .catch(() => setAccountTxs([]));
//   }, [tripMonth, tripYear, vendor]);

//   const handleRentalUpdate = (u) => {
//     setTrips(prev => prev.map(t => t._id === u._id ? { ...u } : t));
//     setSelectedRental(prev => prev ? { ...prev, ...u } : prev);
//   };

//   const rowMatch = (t, ex = null) => {
//     const chk = (f, fil, v) => f === ex || fil.length === 0 || fil.some(x => v?.toLowerCase() === x.toLowerCase());
//     return chk("tripNumber", tripFilter, t.tripNumber)
//       && chk("driverName", driverFilter, t.driverName)
//       && chk("vehicleNumber", vehicleFilter, t.vehicleNumber)
//       && (ex === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter)
//       && (!rentFilter || (rentFilter === "missing" ? t.rent == null : t.rent != null))
//       && (!leborBillFilter || (leborBillFilter === "missing" ? t.leborBill == null : t.leborBill != null));
//   };

//   const filteredTrips = trips.filter(t => rowMatch(t));
//   const getOpts = (field) => {
//     const map = new Map();
//     trips.forEach(t => {
//       if (!rowMatch(t, field)) return;
//       const v = t[field]?.toString().trim();
//       if (v && !map.has(v.toLowerCase())) map.set(v.toLowerCase(), v);
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   const hasFilter = tripFilter.length > 0 || driverFilter.length > 0 || vehicleFilter.length > 0 || dateFilter || rentFilter || leborBillFilter;

//   const handleReset = () => {
//     setTripMonth(new Date().getMonth() + 1); setTripYear(new Date().getFullYear());
//     setTripFilter([]); setDriverFilter([]); setVehicleFilter([]);
//     setDateFilter(""); setRentFilter(""); setLeborBillFilter("");
//     Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1000 });
//   };

//   const handleExport = async () => {
//     const { value: et } = await Swal.fire({
//       title: "Export to Excel",
//       html: `<div style="text-align:left;padding:8px 0">
//         <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:13px">
//           <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
//           <span><b>Filtered</b> (${filteredTrips.length} rows)</span>
//         </label>
//         <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
//           <input type="radio" name="et" value="full">
//           <span><b>Full month</b> — ${MONTHS[tripMonth - 1]} ${tripYear}</span>
//         </label>
//       </div>`,
//       showCancelButton: true, confirmButtonColor: "#374151", confirmButtonText: "Export", cancelButtonText: "Cancel",
//       preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
//     });
//     if (!et) return;
//     try {
//       let src = et === "filtered" ? filteredTrips : [];
//       if (et === "full") {
//         Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//         const r = await axiosSecure.get(`/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`);
//         src = (r.data.data || []).filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase());
//         Swal.close();
//       }
//       if (!src.length) return Swal.fire({ icon: "warning", title: "No Data" });
//       const rows = src.map((t, i) => ({
//         "#": i + 1, Date: new Date(t.createdAt).toLocaleDateString("en-GB"),
//         Trip: t.tripNumber, Driver: t.driverName, Vehicle: t.vehicleNumber,
//         Point: t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
//         Rent: t.rent != null ? Number(t.rent) : "",
//         Lebor: t.leborBill != null ? Number(t.leborBill) : "",
//         Advance: t.advance != null ? Number(t.advance) : "",
//         Total: (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0),
//       }));
//       const ws = XLSX.utils.json_to_sheet(rows);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Trips");
//       saveAs(
//         new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
//         `${vendor?.vendorName}_${et === "filtered" ? "Filtered" : "Full"}_${tripMonth}_${tripYear}.xlsx`
//       );
//       Swal.fire({ icon: "success", title: "Exported!", text: `${rows.length} rows`, timer: 1800, showConfirmButton: false });
//     } catch { Swal.fire("Error", "Export failed", "error"); }
//   };

//   const payStatus = (() => {
//     const sorted = [...trips].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//     let rem = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
//     const map = {};
//     for (const t of sorted) {
//       const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
//       const due  = Math.max(0, bill - Number(t.advance || 0));
//       if (due === 0)           { map[t._id] = { status: "paid",    paidAmount: bill }; }
//       else if (rem >= due)     { map[t._id] = { status: "paid",    paidAmount: due  }; rem -= due; }
//       else if (rem > 0)        { map[t._id] = { status: "partial", paidAmount: rem  }; rem = 0; }
//       else                     { map[t._id] = { status: "unpaid",  paidAmount: 0    }; }
//     }
//     return map;
//   })();

//   const totalPaid  = accountTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
//   const totalRent  = filteredTrips.reduce((s, t) => s + (t.rent      != null ? Number(t.rent)      : 0), 0);
//   const totalLebor = filteredTrips.reduce((s, t) => s + (t.leborBill != null ? Number(t.leborBill) : 0), 0);
//   const totalAdv   = filteredTrips.reduce((s, t) => s + (t.advance   != null ? Number(t.advance)   : 0), 0);
//   const totalBill  = totalRent + totalLebor;
//   const totalDue   = Math.max(0, totalBill - totalAdv - totalPaid);

//   if (vendorLoading) return <LoadingSpinner text="Loading vendor..." />;
//   if (!vendor) return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;

//   const summaryItems = [
//     { label: "Rent",    value: fmt(totalRent),  color: "text-indigo-300" },
//     { label: "Lebor",   value: fmt(totalLebor), color: "text-sky-300" },
//     { label: "Total",   value: fmt(totalBill),  color: "text-emerald-300" },
//     { label: "Advance", value: fmt(totalAdv),   color: "text-orange-300" },
//     { label: "Paid",    value: fmt(totalPaid),  color: "text-indigo-300" },
//     { label: "Due",     value: totalDue > 0 ? fmt(totalDue) : "✓ Cleared", color: totalDue > 0 ? "text-rose-400" : "text-emerald-400" },
//   ];

//   return (
//     <div className="flex flex-col h-full">

//       {/* ══ TOP BAR ══ */}
//       <div className="flex-shrink-0 pb-3 space-y-2">

//         {/* Row 1: back + vendor info */}
//         <div className="flex items-center gap-2">
//           <button onClick={() => navigate(-1)}
//             className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition shrink-0">
//             <ArrowLeft size={15} />
//           </button>
//           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm flex-1 min-w-0">
//             <div className="w-7 h-7 rounded-md bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
//               {vendor.vendorImg
//                 ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
//                 : <Briefcase size={13} className="text-white" />}
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="text-xs font-black text-slate-800 truncate">{vendor.vendorName}</p>
//               <p className="text-[9px] text-slate-400">
//                 Trip Summary · <span className="font-bold">{filteredTrips.length}/{trips.length}</span> trips
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Row 2: month/year + filter/reset/export */}
//         <div className="flex items-center gap-1.5 flex-wrap">
//           <select
//             className="border border-gray-200 px-2 py-1.5 rounded text-xs bg-white text-gray-700 focus:outline-none flex-1 min-w-[90px] max-w-[140px]"
//             value={tripMonth} onChange={e => setTripMonth(parseInt(e.target.value))}>
//             {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
//           </select>
//           <input
//             type="number"
//             className="border border-gray-200 px-2 py-1.5 rounded text-xs bg-white text-gray-700 w-16 focus:outline-none"
//             value={tripYear} onChange={e => setTripYear(parseInt(e.target.value))}
//           />
//           <button
//             onClick={() => setShowFilters(f => !f)}
//             className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded border transition ${hasFilter ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 text-gray-600 bg-white"}`}>
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
//             <span className="hidden xs:inline">{hasFilter ? "Active" : "Filter"}</span>
//             <ChevronDown size={10} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
//           </button>
//           <button
//             onClick={handleReset}
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition">
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
//             <span className="hidden xs:inline">Reset</span>
//           </button>
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-gray-800 text-white hover:bg-gray-700 transition ml-auto">
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
//             <span className="hidden xs:inline">Export</span>
//           </button>
//         </div>

//         {/* Filter panel */}
//         {showFilters && (
//           <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//               <div>
//                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
//                 <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
//                   className="w-full px-2 py-1 border border-gray-200 rounded text-[10px] outline-none bg-white" />
//               </div>
//               <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trip</p><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></div>
//               <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Driver</p><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></div>
//               <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle</p><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></div>
//               <div>
//                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rent</p>
//                 <SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} />
//               </div>
//               <div>
//                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lebor Bill</p>
//                 <SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ══ SUMMARY BAR ══ */}
//       {filteredTrips.length > 0 && (
//         <div className="flex-shrink-0 bg-slate-800 rounded-xl px-4 py-3 mb-3">
//           {/* Mobile 2×3 compact grid */}
//           <div className="grid grid-cols-3 gap-x-2 gap-y-2 sm:hidden">
//             {summaryItems.map((item, i) => (
//               <div key={i} className="text-center">
//                 <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
//                 <p className={`text-[10px] font-black ${item.color} leading-none`}>{item.value}</p>
//               </div>
//             ))}
//           </div>
//           {/* Desktop inline row */}
//           <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-2">
//             <div className="flex items-center gap-3">
//               {summaryItems.slice(0, 3).map((item, i) => (
//                 <React.Fragment key={i}>
//                   <div>
//                     <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
//                     <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
//                   </div>
//                   {i < 2 && <span className="text-slate-500 font-bold">{i === 1 ? "=" : "+"}</span>}
//                 </React.Fragment>
//               ))}
//             </div>
//             <div className="h-7 w-px bg-slate-600" />
//             <div className="flex items-center gap-3 ml-auto">
//               {summaryItems.slice(3).map((item, i) => (
//                 <React.Fragment key={i}>
//                   {i > 0 && <span className="text-slate-500">→</span>}
//                   <div>
//                     <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
//                     <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
//                   </div>
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ TRIPS CONTAINER ══ */}
//       <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

//         {/* Section header */}
//         <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <ReceiptText size={14} className="text-slate-600" />
//             <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Trips</span>
//           </div>
//           <span className="text-[10px] text-slate-400">{MONTHS[tripMonth - 1]} {tripYear}</span>
//         </div>

//         {tripLoading ? (
//           <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">Loading trips…</div>
//         ) : trips.length === 0 ? (
//           <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
//             <Truck size={36} />
//             <p className="text-xs font-black uppercase tracking-widest italic">No trips found</p>
//           </div>
//         ) : (
//           <>
//             {/* ── MOBILE card list (< sm) ── */}
//             <div className="flex-1 min-h-0 overflow-auto sm:hidden">
//               <div className="p-3 space-y-2.5">
//                 {filteredTrips.length === 0 ? (
//                   <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
//                 ) : filteredTrips.map((t, idx) => (
//                   <TripCard key={t._id} t={t} idx={idx} ps={payStatus[t._id]} onView={setSelectedRental} />
//                 ))}
//                 {/* Mobile totals footer */}
//                 {filteredTrips.length > 0 && (
//                   <div className="bg-slate-800 rounded-xl px-4 py-3 grid grid-cols-4 gap-2 text-center">
//                     {[
//                       { l: "Rent",    v: `৳${totalRent.toLocaleString()}`,  c: "text-indigo-300" },
//                       { l: "Lebor",   v: `৳${totalLebor.toLocaleString()}`, c: "text-indigo-300" },
//                       { l: "Advance", v: `৳${totalAdv.toLocaleString()}`,   c: "text-orange-300" },
//                       { l: "Total",   v: `৳${totalBill.toLocaleString()}`,  c: "text-emerald-300" },
//                     ].map((item, i) => (
//                       <div key={i}>
//                         <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.l}</p>
//                         <p className={`text-[10px] font-black ${item.c}`}>{item.v}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* ── SMALL LAPTOP card list (sm → lg) ── */}
//             {/* Shows a condensed card/row layout better than full table but richer than mobile */}
//             <div className="flex-1 min-h-0 overflow-auto hidden sm:block lg:hidden">
//               {filteredTrips.length === 0 ? (
//                 <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
//               ) : (
//                 <table className="w-full border-collapse text-xs">
//                   <thead className="sticky top-0 z-20">
//                     <tr className="bg-gray-800 text-white">
//                       {["#", "Date", "Trip", "Driver", "Vehicle", "Rent", "Lebor", "Advance", "Total", "Status", ""].map((h, i) => (
//                         <th key={i} className="px-2 py-2 font-normal text-[9px] uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0 text-left">{h}</th>
//                       ))}
//                     </tr>
//                     {/* Inline filters */}
//                     <tr className="bg-gray-50 border-b-2 border-gray-200">
//                       <th className="px-1 py-1 border-r border-gray-100 w-6" />
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "96px" }}>
//                         <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-1 py-0.5 border border-gray-200 rounded text-[9px] outline-none bg-white" />
//                       </th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "80px" }}><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "90px" }}><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "80px" }}><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "62px" }}><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "62px" }}><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100 w-16" />
//                       <th className="px-1 py-1 border-r border-gray-100 w-16" />
//                       <th className="px-1 py-1 border-r border-gray-100 w-16" />
//                       <th className="px-1 py-1 w-12" />
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTrips.map((t, idx) => {
//                       const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
//                       const ps = payStatus[t._id];
//                       const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
//                       return (
//                         <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/30 transition-colors">
//                           <td className="px-2 py-2 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
//                           <td className="px-2 py-2 text-[10px] text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
//                           <td className="px-2 py-2"><span className="text-[9px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">{t.tripNumber}</span></td>
//                           <td className="px-2 py-2 text-[10px] text-slate-700 max-w-[100px] truncate">{t.driverName}</td>
//                           <td className="px-2 py-2 text-[10px] text-slate-600 uppercase whitespace-nowrap">{t.vehicleNumber}</td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">{t.rent != null ? <span className="text-[10px] font-semibold text-green-700">৳{Number(t.rent).toLocaleString()}</span> : <span className="text-[9px] text-red-400">—</span>}</td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">{t.leborBill != null ? <span className="text-[10px] font-semibold text-green-700">৳{Number(t.leborBill).toLocaleString()}</span> : <span className="text-[9px] text-orange-400">—</span>}</td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">{t.advance != null ? <span className="text-[10px] font-semibold text-orange-600">৳{Number(t.advance).toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">{t.rent != null || t.leborBill != null ? <span className="text-[10px] font-bold text-indigo-700">৳{tripTotal.toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
//                           <td className="px-2 py-2 text-center"><PayBadge ps={ps} bill={bill} /></td>
//                           <td className="px-2 py-2 text-center"><button onClick={() => setSelectedRental(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[9px] font-semibold rounded transition">View</button></td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                   <tfoot className="sticky bottom-0 z-10">
//                     <tr className="bg-slate-800 text-white">
//                       <td colSpan={5} className="px-2 py-2 text-[9px] font-black uppercase tracking-widest">Total ({filteredTrips.length})</td>
//                       <td className="px-2 py-2 text-center font-black text-indigo-300 whitespace-nowrap text-[10px]">৳{totalRent.toLocaleString()}</td>
//                       <td className="px-2 py-2 text-center font-black text-indigo-300 whitespace-nowrap text-[10px]">৳{totalLebor.toLocaleString()}</td>
//                       <td className="px-2 py-2 text-center font-black text-orange-300 whitespace-nowrap text-[10px]">৳{totalAdv.toLocaleString()}</td>
//                       <td className="px-2 py-2 text-center font-black text-emerald-300 whitespace-nowrap text-[10px]">৳{totalBill.toLocaleString()}</td>
//                       <td /><td />
//                     </tr>
//                   </tfoot>
//                 </table>
//               )}
//             </div>

//             {/* ── DESKTOP full table (>= lg) ── */}
//             <div className="flex-1 min-h-0 overflow-auto hidden lg:block">
//               {filteredTrips.length === 0 ? (
//                 <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
//               ) : (
//                 <table className="w-full border-collapse text-xs" style={{ minWidth: "720px" }}>
//                   <thead className="sticky top-0 z-20">
//                     <tr className="bg-gray-800 text-white">
//                       {["#", "Date", "Trip", "Driver", "Vehicle", "Pt", "Rent", "Lebor Bill", "Advance", "Total", "Payment", "View"].map((h, i) => (
//                         <th key={i} className="px-3 py-2.5 font-normal text-[10px] uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0 text-left">{h}</th>
//                       ))}
//                     </tr>
//                     <tr className="bg-gray-50 border-b-2 border-gray-200">
//                       <th className="px-1 py-1 border-r border-gray-100 w-7" />
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "108px" }}><input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-1 py-0.5 border border-gray-200 rounded text-[9px] outline-none bg-white" /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "96px" }}><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100 w-8" />
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "70px" }}><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "78px" }}><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
//                       <th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 w-14" />
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTrips.map((t, idx) => {
//                       const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
//                       const ps = payStatus[t._id];
//                       const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
//                       return (
//                         <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/40 transition-colors">
//                           <td className="px-3 py-2 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
//                           <td className="px-3 py-2 text-[10px] text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
//                           <td className="px-3 py-2"><span className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono whitespace-nowrap">{t.tripNumber}</span></td>
//                           <td className="px-3 py-2 text-[11px] text-slate-700 max-w-[110px] truncate">{t.driverName}</td>
//                           <td className="px-3 py-2 text-[10px] text-slate-600 uppercase whitespace-nowrap">{t.vehicleNumber}</td>
//                           <td className="px-3 py-2 text-[11px] font-semibold text-slate-700 text-center">{t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}</td>
//                           <td className="px-3 py-2 text-center whitespace-nowrap">{t.rent != null ? <span className="text-[11px] font-semibold text-green-700">৳{Number(t.rent).toLocaleString()}</span> : <span className="text-[9px] text-red-400 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Missing</span>}</td>
//                           <td className="px-3 py-2 text-center whitespace-nowrap">{t.leborBill != null ? <span className="text-[11px] font-semibold text-green-700">৳{Number(t.leborBill).toLocaleString()}</span> : <span className="text-[9px] text-orange-400 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">Missing</span>}</td>
//                           <td className="px-3 py-2 text-center whitespace-nowrap">{t.advance != null ? <span className="text-[11px] font-semibold text-orange-600">৳{Number(t.advance).toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
//                           <td className="px-3 py-2 text-center whitespace-nowrap">{t.rent != null || t.leborBill != null ? <span className="text-[11px] font-bold text-indigo-700">৳{tripTotal.toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
//                           <td className="px-3 py-2 text-center"><PayBadge ps={ps} bill={bill} /></td>
//                           <td className="px-3 py-2 text-center"><button onClick={() => setSelectedRental(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-semibold rounded transition whitespace-nowrap">View</button></td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                   <tfoot className="sticky bottom-0 z-10">
//                     <tr className="bg-slate-800 text-white">
//                       <td colSpan={6} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest">Total ({filteredTrips.length} trips)</td>
//                       <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalRent.toLocaleString()}</td>
//                       <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalLebor.toLocaleString()}</td>
//                       <td className="px-3 py-2.5 text-center font-black text-orange-300 whitespace-nowrap">৳{totalAdv.toLocaleString()}</td>
//                       <td className="px-3 py-2.5 text-center font-black text-emerald-300 whitespace-nowrap">৳{totalBill.toLocaleString()}</td>
//                       <td /><td />
//                     </tr>
//                   </tfoot>
//                 </table>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       <CarRentDetailsModal
//         selectedRental={selectedRental}
//         setSelectedRental={setSelectedRental}
//         onRentalUpdate={handleRentalUpdate}
//         readOnly={true}
//       />
//     </div>
//   );
// };

// export default VendorTripSummary;







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
  const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} sel`;
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-1.5 py-0.5 text-[10px] rounded border transition text-left
          ${selected.length > 0 ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-200 bg-white text-gray-400"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-0.5 shrink-0">
          {selected.length > 0 && <span className="text-gray-400 hover:text-gray-700 cursor-pointer" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] w-max max-w-[220px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? ref.current.getBoundingClientRect().left : 0 }}>
          {options.length > 5 && (
            <div className="p-1.5 border-b border-gray-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
            </div>
          )}
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs hover:bg-gray-50 ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-gray-800 shrink-0" />
                  <span className="truncate">{opt}</span>
                </label>
              ))}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <button onClick={() => onChange([])} className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-0.5 hover:text-gray-700">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SimpleSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`w-full px-1.5 py-0.5 text-[10px] rounded border outline-none ${value ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-200 bg-white text-gray-400"}`}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ── Payment badge helper ── */
const PayBadge = ({ ps, bill }) => {
  if (!ps || bill === 0) return null;
  if (ps.status === "paid")    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">✓ Paid</span>;
  if (ps.status === "partial") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Partial</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">Unpaid</span>;
};

/* ── Mobile Trip Card ── */
const TripCard = ({ t, idx, ps, onView }) => {
  const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
  const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-bold text-gray-400 shrink-0">#{idx + 1}</span>
          <span className="text-[10px] bg-gray-800 text-white rounded px-1.5 py-0.5 font-mono shrink-0">{t.tripNumber}</span>
          <PayBadge ps={ps} bill={bill} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-gray-400 hidden xs:block">{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
          <button onClick={() => onView(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-semibold rounded transition">View</button>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Driver</p>
            <p className="text-xs font-semibold text-gray-800">{t.driverName}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Point</p>
            <p className="text-xs font-bold text-emerald-700">{t.challans ? t.challans.filter(c => !c.isReturn).length : (t.totalChallan ?? "—")}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Vehicle</p>
            <p className="text-xs font-semibold text-gray-700 uppercase">{t.vehicleNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 pt-2 border-t border-gray-100">
          {[
            { l: "Rent",    v: t.rent,     fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-red-400",    ok: "text-green-700" },
            { l: "Lebor",   v: t.leborBill, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-orange-400", ok: "text-green-700" },
            { l: "Advance", v: t.advance,  fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300",  ok: "text-orange-600", allowNull: true },
            { l: "Total",   v: t.rent != null || t.leborBill != null ? tripTotal : null, fmt: v => `৳${Number(v).toLocaleString()}`, miss: "text-slate-300", ok: "text-indigo-700", bg: "bg-indigo-50 rounded-lg px-0.5" },
          ].map((item, i) => (
            <div key={i} className={`text-center ${item.bg || ""}`}>
              <p className={`text-[8px] uppercase font-bold tracking-wider ${i === 3 ? "text-indigo-400" : "text-gray-400"}`}>{item.l}</p>
              {item.v != null
                ? <p className={`text-[11px] font-bold ${item.ok}`}>{item.fmt(item.v)}</p>
                : <p className={`text-[9px] font-bold mt-0.5 ${item.miss}`}>—</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════ */
const VendorTripSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vendor,       setVendor]       = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [tripMonth,    setTripMonth]    = useState(new Date().getMonth() + 1);
  const [tripYear,     setTripYear]     = useState(new Date().getFullYear());
  const [trips,        setTrips]        = useState([]);
  const [tripLoading,  setTripLoading]  = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [accountTxs,   setAccountTxs]  = useState([]);

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
    return chk("tripNumber", tripFilter, t.tripNumber)
      && chk("driverName", driverFilter, t.driverName)
      && chk("vehicleNumber", vehicleFilter, t.vehicleNumber)
      && (ex === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter)
      && (!rentFilter || (rentFilter === "missing" ? t.rent == null : t.rent != null))
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
          <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
          <span><b>Filtered</b> (${filteredTrips.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${MONTHS[tripMonth - 1]} ${tripYear}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#374151", confirmButtonText: "Export", cancelButtonText: "Cancel",
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
        Point: t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
        Rent: t.rent != null ? Number(t.rent) : "",
        Lebor: t.leborBill != null ? Number(t.leborBill) : "",
        Advance: t.advance != null ? Number(t.advance) : "",
        Total: (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0),
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
      if (due === 0)           { map[t._id] = { status: "paid",    paidAmount: bill }; }
      else if (rem >= due)     { map[t._id] = { status: "paid",    paidAmount: due  }; rem -= due; }
      else if (rem > 0)        { map[t._id] = { status: "partial", paidAmount: rem  }; rem = 0; }
      else                     { map[t._id] = { status: "unpaid",  paidAmount: 0    }; }
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
  if (!vendor) return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;

  const summaryItems = [
    { label: "Rent",    value: fmt(totalRent),  color: "text-indigo-300" },
    { label: "Lebor",   value: fmt(totalLebor), color: "text-sky-300" },
    { label: "Total",   value: fmt(totalBill),  color: "text-emerald-300" },
    { label: "Advance", value: fmt(totalAdv),   color: "text-orange-300" },
    { label: "Paid",    value: fmt(totalPaid),  color: "text-indigo-300" },
    { label: "Due",     value: totalDue > 0 ? fmt(totalDue) : "✓ Cleared", color: totalDue > 0 ? "text-rose-400" : "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ══ TOP BAR — single compact row ══ */}
      <div className="flex-shrink-0 pb-2 space-y-1.5">

        {/* Single row: back + vendor + month/year + controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition shrink-0">
            <ArrowLeft size={14} />
          </button>

          {/* Vendor info — compact pill */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 flex-1 max-w-[220px] sm:max-w-xs">
            <div className="w-6 h-6 rounded-md bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
              {vendor.vendorImg
                ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                : <Briefcase size={11} className="text-white" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{vendor.vendorName}</p>
              <p className="text-[9px] text-slate-400 leading-none">
                <span className="font-bold">{filteredTrips.length}/{trips.length}</span> trips
              </p>
            </div>
          </div>

          {/* Month + Year */}
          <select
            className="border border-gray-200 px-2 py-1 rounded text-xs bg-white text-gray-700 focus:outline-none shrink-0"
            value={tripMonth} onChange={e => setTripMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input
            type="number"
            className="border border-gray-200 px-2 py-1 rounded text-xs bg-white text-gray-700 w-16 focus:outline-none shrink-0"
            value={tripYear} onChange={e => setTripYear(parseInt(e.target.value))}
          />

          {/* Filter / Reset / Export */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition shrink-0 ${hasFilter ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 text-gray-600 bg-white"}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            <ChevronDown size={9} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-700 transition ml-auto shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            <span className="hidden sm:inline text-[10px]">Export</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-2 py-0.5 border border-gray-200 rounded text-[10px] outline-none bg-white" />
              </div>
              <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trip</p><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></div>
              <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Driver</p><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></div>
              <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle</p><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></div>
              <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rent</p><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} /></div>
              <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lebor Bill</p><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓ Added" }, { value: "missing", label: "✗ Missing" }]} /></div>
            </div>
          </div>
        )}
      </div>

      {/* ══ SUMMARY BAR ══ */}
      {filteredTrips.length > 0 && (
        <div className="flex-shrink-0 bg-slate-800 rounded-xl px-3 py-2 mb-2">
          {/* Mobile 3-col grid */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 sm:hidden">
            {summaryItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                <p className={`text-[10px] font-black ${item.color} leading-none`}>{item.value}</p>
              </div>
            ))}
          </div>
          {/* Desktop inline — compact */}
          <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              {summaryItems.slice(0, 3).map((item, i) => (
                <React.Fragment key={i}>
                  <div>
                    <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                    <p className={`text-xs font-black ${item.color}`}>{item.value}</p>
                  </div>
                  {i < 2 && <span className="text-slate-600 font-bold text-xs">{i === 1 ? "=" : "+"}</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="h-5 w-px bg-slate-600" />
            <div className="flex items-center gap-2 ml-auto">
              {summaryItems.slice(3).map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-600 text-xs">→</span>}
                  <div>
                    <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">{item.label}</p>
                    <p className={`text-xs font-black ${item.color}`}>{item.value}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TRIPS CONTAINER ══ */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Section header */}
        <div className="flex-shrink-0 px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ReceiptText size={13} className="text-slate-600" />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Trips</span>
          </div>
          <span className="text-[9px] text-slate-400">{MONTHS[tripMonth - 1]} {tripYear}</span>
        </div>

        {tripLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">Loading trips…</div>
        ) : trips.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
            <Truck size={36} />
            <p className="text-xs font-black uppercase tracking-widest italic">No trips found</p>
          </div>
        ) : (
          <>
            {/* ── MOBILE card list (< sm) ── */}
            <div className="flex-1 min-h-0 overflow-auto sm:hidden">
              <div className="p-3 space-y-2.5">
                {filteredTrips.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
                ) : filteredTrips.map((t, idx) => (
                  <TripCard key={t._id} t={t} idx={idx} ps={payStatus[t._id]} onView={setSelectedRental} />
                ))}
                {/* Mobile totals footer */}
                {filteredTrips.length > 0 && (
                  <div className="bg-slate-800 rounded-xl px-4 py-3 grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: "Rent",    v: `৳${totalRent.toLocaleString()}`,  c: "text-indigo-300" },
                      { l: "Lebor",   v: `৳${totalLebor.toLocaleString()}`, c: "text-indigo-300" },
                      { l: "Advance", v: `৳${totalAdv.toLocaleString()}`,   c: "text-orange-300" },
                      { l: "Total",   v: `৳${totalBill.toLocaleString()}`,  c: "text-emerald-300" },
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

            {/* ── SMALL LAPTOP card list (sm → lg) ── */}
            {/* Shows a condensed card/row layout better than full table but richer than mobile */}
            <div className="flex-1 min-h-0 overflow-auto hidden sm:block lg:hidden">
              {filteredTrips.length === 0 ? (
                <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-800 text-white">
                      {["#", "Date", "Trip", "Driver", "Vehicle", "Rent", "Lebor", "Advance", "Total", "Status", ""].map((h, i) => (
                        <th key={i} className="px-2 py-2 font-normal text-[9px] uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0 text-left">{h}</th>
                      ))}
                    </tr>
                    {/* Inline filters */}
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-1 py-1 border-r border-gray-100 w-6" />
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "96px" }}>
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-1 py-0.5 border border-gray-200 rounded text-[9px] outline-none bg-white" />
                      </th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "80px" }}><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "90px" }}><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "80px" }}><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "62px" }}><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "62px" }}><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                      <th className="px-1 py-1 border-r border-gray-100 w-16" />
                      <th className="px-1 py-1 border-r border-gray-100 w-16" />
                      <th className="px-1 py-1 border-r border-gray-100 w-16" />
                      <th className="px-1 py-1 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((t, idx) => {
                      const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
                      const ps = payStatus[t._id];
                      const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
                      return (
                        <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/30 transition-colors">
                          <td className="px-2 py-2 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-2 py-2"><span className="text-[9px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">{t.tripNumber}</span></td>
                          <td className="px-2 py-2 text-[10px] text-slate-700 max-w-[100px] truncate">{t.driverName}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-600 uppercase whitespace-nowrap">{t.vehicleNumber}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">{t.rent != null ? <span className="text-[10px] font-semibold text-green-700">৳{Number(t.rent).toLocaleString()}</span> : <span className="text-[9px] text-red-400">—</span>}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">{t.leborBill != null ? <span className="text-[10px] font-semibold text-green-700">৳{Number(t.leborBill).toLocaleString()}</span> : <span className="text-[9px] text-orange-400">—</span>}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">{t.advance != null ? <span className="text-[10px] font-semibold text-orange-600">৳{Number(t.advance).toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">{t.rent != null || t.leborBill != null ? <span className="text-[10px] font-bold text-indigo-700">৳{tripTotal.toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="px-2 py-2 text-center"><PayBadge ps={ps} bill={bill} /></td>
                          <td className="px-2 py-2 text-center"><button onClick={() => setSelectedRental(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[9px] font-semibold rounded transition">View</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10">
                    <tr className="bg-slate-800 text-white">
                      <td colSpan={5} className="px-2 py-2 text-[9px] font-black uppercase tracking-widest">Total ({filteredTrips.length})</td>
                      <td className="px-2 py-2 text-center font-black text-indigo-300 whitespace-nowrap text-[10px]">৳{totalRent.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center font-black text-indigo-300 whitespace-nowrap text-[10px]">৳{totalLebor.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center font-black text-orange-300 whitespace-nowrap text-[10px]">৳{totalAdv.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center font-black text-emerald-300 whitespace-nowrap text-[10px]">৳{totalBill.toLocaleString()}</td>
                      <td /><td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── DESKTOP full table (>= lg) ── */}
            <div className="flex-1 min-h-0 overflow-auto hidden lg:block">
              {filteredTrips.length === 0 ? (
                <div className="py-12 text-center text-gray-400 italic text-sm">No trips match the filter.</div>
              ) : (
                <table className="w-full border-collapse text-xs" style={{ minWidth: "720px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-800 text-white">
                      {["#", "Date", "Trip", "Driver", "Vehicle", "Pt", "Rent", "Lebor Bill", "Advance", "Total", "Payment", "View"].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 font-normal text-[10px] uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0 text-left">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-1 py-1 border-r border-gray-100 w-7" />
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "108px" }}><input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-1 py-0.5 border border-gray-200 rounded text-[9px] outline-none bg-white" /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "96px" }}><MultiSelectFilter options={getOpts("driverName")} selected={driverFilter} onChange={setDriverFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "88px" }}><MultiSelectFilter options={getOpts("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
                      <th className="px-1 py-1 border-r border-gray-100 w-8" />
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "70px" }}><SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                      <th className="px-1 py-1 border-r border-gray-100" style={{ minWidth: "78px" }}><SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "✓" }, { value: "missing", label: "✗" }]} /></th>
                      <th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 border-r border-gray-100 w-20" /><th className="px-1 py-1 w-14" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((t, idx) => {
                      const tripTotal = (t.rent != null ? Number(t.rent) : 0) + (t.leborBill != null ? Number(t.leborBill) : 0);
                      const ps = payStatus[t._id];
                      const bill = Number(t.rent || 0) + Number(t.leborBill || 0);
                      return (
                        <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/40 transition-colors">
                          <td className="px-3 py-2 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
                          <td className="px-3 py-2 text-[10px] text-slate-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-3 py-2"><span className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono whitespace-nowrap">{t.tripNumber}</span></td>
                          <td className="px-3 py-2 text-[11px] text-slate-700 max-w-[110px] truncate">{t.driverName}</td>
                          <td className="px-3 py-2 text-[10px] text-slate-600 uppercase whitespace-nowrap">{t.vehicleNumber}</td>
                          <td className="px-3 py-2 text-[11px] font-semibold text-slate-700 text-center">{t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}</td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">{t.rent != null ? <span className="text-[11px] font-semibold text-green-700">৳{Number(t.rent).toLocaleString()}</span> : <span className="text-[9px] text-red-400 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Missing</span>}</td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">{t.leborBill != null ? <span className="text-[11px] font-semibold text-green-700">৳{Number(t.leborBill).toLocaleString()}</span> : <span className="text-[9px] text-orange-400 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">Missing</span>}</td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">{t.advance != null ? <span className="text-[11px] font-semibold text-orange-600">৳{Number(t.advance).toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">{t.rent != null || t.leborBill != null ? <span className="text-[11px] font-bold text-indigo-700">৳{tripTotal.toLocaleString()}</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-2 text-center"><PayBadge ps={ps} bill={bill} /></td>
                          <td className="px-3 py-2 text-center"><button onClick={() => setSelectedRental(t)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-semibold rounded transition whitespace-nowrap">View</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10">
                    <tr className="bg-slate-800 text-white">
                      <td colSpan={6} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest">Total ({filteredTrips.length} trips)</td>
                      <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalRent.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center font-black text-indigo-300 whitespace-nowrap">৳{totalLebor.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center font-black text-orange-300 whitespace-nowrap">৳{totalAdv.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-300 whitespace-nowrap">৳{totalBill.toLocaleString()}</td>
                      <td /><td />
                    </tr>
                  </tfoot>
                </table>
              )}
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