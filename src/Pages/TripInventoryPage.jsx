

// import React, { useEffect, useState, useRef } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import TripDetailsModal from "../Component/TripDetailsModal";
// import LoadingSpinner from "../Component/LoadingSpinner";

// const ITEMS_PER_PAGE = 400;

// /* ── Multi-select dropdown ── */
// const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
//   const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
//   const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

//   return (
//     <div ref={ref} className="relative w-full">
//       <button
//         type="button"
//         onClick={() => setOpen(o => !o)}
//         className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
//           ${selected.length > 0 ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
//       >
//         <span className="truncate flex-1">{label}</span>
//         <span className="flex items-center gap-1 shrink-0">
//           {selected.length > 0 && (
//             <span className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
//               onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
//           )}
//           <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
//           </svg>
//         </span>
//       </button>

//       {open && (
//         <div
//           className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[150px] w-max max-w-[240px] overflow-hidden"
//           style={{
//             zIndex: 9999,
//             top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
//             left: ref.current ? ref.current.getBoundingClientRect().left : 0,
//           }}
//         >
//           {options.length > 5 && (
//             <div className="p-1.5 border-b border-gray-100">
//               <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
//                 placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
//             </div>
//           )}
//           <div className="max-h-44 overflow-y-auto">
//             {filtered.length === 0
//               ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
//               : filtered.map(opt => (
//                 <label key={opt}
//                   className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
//                   <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
//                     className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
//                   <span className="truncate">{opt}</span>
//                 </label>
//               ))
//             }
//           </div>
//           {selected.length > 0 && (
//             <div className="border-t border-gray-100 p-1">
//               <button onClick={() => onChange([])}
//                 className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">
//                 Clear all
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ── Simple select filter ── */
// const SimpleSelect = ({ value, onChange, options }) => (
//   <select
//     value={value}
//     onChange={e => onChange(e.target.value)}
//     className={`w-full px-2 py-1 text-xs rounded border outline-none transition-all
//       ${value ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
//   >
//     {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//   </select>
// );

// /* ════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ════════════════════════════════════════════════════════════════ */
// const TripInventoryPage = () => {
//   const axiosSecure = useAxiosSecure();
//   const { searchText, setSearchText } = useSearch();

//   const [deliveries, setDeliveries]     = useState([]);
//   const [loading, setLoading]           = useState(false);
//   const [selectedTrip, setSelectedTrip] = useState(null);
//   const [clientPage, setClientPage]     = useState(1);

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year,  setYear]  = useState(new Date().getFullYear());

//   const [tripFilter,     setTripFilter]     = useState([]);
//   const [vendorFilter,   setVendorFilter]   = useState([]);
//   const [driverFilter,   setDriverFilter]   = useState([]);
//   const [vehicleFilter,  setVehicleFilter]  = useState([]);
//   const [dateFilter,     setDateFilter]     = useState("");
//   const [deliveryFilter, setDeliveryFilter] = useState("");
//   const [challanFilter,  setChallanFilter]  = useState("");

//   /* ── filter setter wrapper — resets page ── */
//   const setFilter = (setter) => (val) => {
//     setter(val);
//     setClientPage(1);
//   };

//   /* ── fetch ── */
//   const fetchDeliveries = async (m, y, search) => {
//     setLoading(true);
//     try {
//       const url = search
//         ? `/deliveries?search=${encodeURIComponent(search)}&page=1&limit=5000`
//         : `/deliveries?month=${m}&year=${y}&page=1&limit=5000`;
//       const res = await axiosSecure.get(url);
//       setDeliveries(res.data.data || []);
//     } catch (err) { console.error(err); }
//     setLoading(false);
//   };

//   useEffect(() => {
//     setClientPage(1);
//     fetchDeliveries(month, year, searchText);
//   }, [month, year, searchText]);

//   /* ── tripRows ── */
//   const tripRows = deliveries.map(t => ({
//     _id:            t._id,
//     tripNumber:     t.tripNumber,
//     vendorName:     t.vendorName,
//     vendorNumber:   t.vendorNumber,
//     driverName:     t.driverName,
//     driverNumber:   t.driverNumber,
//     vehicleNumber:  t.vehicleNumber,
//     totalChallan:   t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
//     challanQty:     t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
//     createdAt:      t.createdAt,
//     createdBy:      t.createdBy,
//     currentUser:    t.currentUser,
//     challans:       t.challans,
//     advance:        t.advance        ?? null,
//     advanceSavedBy: t.advanceSavedBy ?? null,
//     lastUpdatedBy:  t.lastUpdatedBy  ?? null,
//     lastUpdatedAt:  t.lastUpdatedAt  ?? null,
//   }));

//   /* ── modal sync ── */
//   const handleTripUpdate = (updatedTrip) => {
//     setDeliveries(prev =>
//       prev.map(d => d._id === updatedTrip._id ? { ...d, ...updatedTrip } : d)
//     );
//     setSelectedTrip(prev => prev ? { ...prev, ...updatedTrip } : prev);
//   };

//   /* ── filtering ── */
//   const rowMatchesAll = (t, excludeField = null) => {
//     const s = searchText?.toLowerCase() || "";
//     const challans = t.challans || [];
//     const allDelivered = challans.length > 0 && challans.every(c => c.deliveryStatus === "confirmed");
//     const allReceived  = challans.length > 0 && challans.every(c => c.challanReturnStatus === "received");

//     const matchesSearch = !searchText ||
//       [t.tripNumber, t.vendorName, t.driverName, t.vehicleNumber].some(v => v?.toLowerCase().includes(s));

//     const check = (field, filter, val) =>
//       field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

//     return matchesSearch &&
//       check("tripNumber",    tripFilter,    t.tripNumber) &&
//       check("vendorName",    vendorFilter,  t.vendorName) &&
//       check("driverName",    driverFilter,  t.driverName) &&
//       check("vehicleNumber", vehicleFilter, t.vehicleNumber) &&
//       (excludeField === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
//       (!deliveryFilter ||
//         (deliveryFilter === "delivered"    && allDelivered) ||
//         (deliveryFilter === "notDelivered" && !allDelivered)) &&
//       (!challanFilter ||
//         (challanFilter === "received"    && allReceived) ||
//         (challanFilter === "notReceived" && !allReceived));
//   };

//   const filteredRows = tripRows.filter(t => rowMatchesAll(t));

//   /* ── Client-side pagination ── */
//   const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
//   const paginatedRows = filteredRows.slice(
//     (clientPage - 1) * ITEMS_PER_PAGE,
//     clientPage * ITEMS_PER_PAGE
//   );

//   const getOptionsFor = (field) => {
//     const map = new Map();
//     tripRows.forEach(t => {
//       if (!rowMatchesAll(t, field)) return;
//       const val = t[field]?.toString().trim();
//       if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   /* ── reset ── */
//   const handleReset = () => {
//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());
//     setClientPage(1);
//     if (setSearchText) setSearchText("");
//     setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
//     setVehicleFilter([]); setDateFilter(""); setDeliveryFilter(""); setChallanFilter("");
//     Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
//   };

//   const activeFilterGroups = [
//     { label: "Trip",     values: tripFilter,    clear: () => { setTripFilter([]);    setClientPage(1); } },
//     { label: "Vendor",   values: vendorFilter,  clear: () => { setVendorFilter([]);  setClientPage(1); } },
//     { label: "Driver",   values: driverFilter,  clear: () => { setDriverFilter([]);  setClientPage(1); } },
//     { label: "Vehicle",  values: vehicleFilter, clear: () => { setVehicleFilter([]); setClientPage(1); } },
//     ...(dateFilter     ? [{ label: "Date",     values: [dateFilter],     clear: () => { setDateFilter("");     setClientPage(1); } }] : []),
//     ...(deliveryFilter ? [{ label: "Delivery", values: [deliveryFilter], clear: () => { setDeliveryFilter(""); setClientPage(1); } }] : []),
//     ...(challanFilter  ? [{ label: "Challan",  values: [challanFilter],  clear: () => { setChallanFilter("");  setClientPage(1); } }] : []),
//   ].filter(f => f.values.length > 0);

//   /* ── export ── */
//   const handleExportExcel = async () => {
//     const { value: exportType } = await Swal.fire({
//       title: "Export to Excel",
//       html: `<div style="text-align:left;padding:8px 0">
//         <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
//         <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
//           <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
//           <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
//         </label>
//         <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
//           <input type="radio" name="et" value="full">
//           <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
//         </label>
//       </div>`,
//       showCancelButton: true,
//       confirmButtonColor: "#374151",
//       confirmButtonText: "Export",
//       cancelButtonText: "Cancel",
//       preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
//     });
//     if (!exportType) return;

//     try {
//       let exportData = [];
//       const toRow = (t) => ({
//         Date: new Date(t.createdAt).toLocaleDateString(),
//         Trip: t.tripNumber, Vendor: t.vendorName,
//         "Vendor Number": t.vendorNumber || "", Driver: t.driverName,
//         "Driver Number": t.driverNumber || "", Vehicle: t.vehicleNumber,
//         Points: t.challanQty ?? t.totalChallan,
//         "Delivery Status": (t.challans || []).every(c => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
//         "Challan Status":  (t.challans || []).every(c => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
//       });

//       if (exportType === "filtered") {
//         if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         exportData = filteredRows.map(toRow);
//       } else {
//         Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//         const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}&page=1&limit=5000`);
//         exportData = (res.data.data || []).map(toRow);
//         if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         Swal.close();
//       }

//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Trips");
//       saveAs(
//         new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
//         `TripInventory_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`
//       );
//       Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
//     } catch { Swal.fire("Error", "Export failed", "error"); }
//   };

//   /* ── Page numbers ── */
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
//     .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 2)
//     .reduce((acc, p, i, arr) => {
//       if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
//       acc.push(p);
//       return acc;
//     }, []);

//   /* ════════════════════════════════════════════════════════════════
//      RENDER
//   ════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto">

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">Trip Inventory</h2>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {filteredRows.length} trips
//               {totalPages > 1 && ` — page ${clientPage} of ${totalPages}`}
//             </p>
//           </div>
//           <div className="flex flex-wrap items-center gap-2">
//             <select
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//               ))}
//             </select>
//             <input type="number"
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }} />
//             <button onClick={handleReset}
//               className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//               Reset All
//             </button>
//             <button onClick={handleExportExcel}
//               className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all">
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//               Export Excel
//             </button>
//           </div>
//         </div>

//         {/* Active filter chips */}
//         {activeFilterGroups.length > 0 && (
//           <div className="flex flex-wrap items-center gap-1.5 mb-3">
//             <span className="text-[10px] text-gray-400 uppercase tracking-widest">Filters:</span>
//             {activeFilterGroups.map((f, i) => (
//               <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded">
//                 {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} selected`}
//                 <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : filteredRows.length === 0 ? (
//           <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
//             No trips found.
//           </div>
//         ) : (
//           <>
//             <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
//               <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-260px)]">
//                 <table className="w-full border-collapse text-sm">
//                   <thead>
//                     <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
//                       {["Date", "Trip Number", "Vendor", "Driver", "Vehicle", "Point", "Delivery", "Challan", "View"].map(h => (
//                         <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
//                       ))}
//                     </tr>
//                     <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
//                       <th className="p-1 border-r border-gray-200">
//                         <input type="date"
//                           className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
//                           value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }} />
//                       </th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("tripNumber")}    selected={tripFilter}    onChange={setFilter(setTripFilter)}    placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vendorName")}    selected={vendorFilter}  onChange={setFilter(setVendorFilter)}  placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("driverName")}    selected={driverFilter}  onChange={setFilter(setDriverFilter)}  placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setFilter(setVehicleFilter)} placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"></th>
//                       <th className="p-1 border-r border-gray-200">
//                         <SimpleSelect value={deliveryFilter} onChange={setFilter(setDeliveryFilter)} options={[
//                           { value: "", label: "All" },
//                           { value: "delivered", label: "All Delivered" },
//                           { value: "notDelivered", label: "Not Delivered" },
//                         ]} />
//                       </th>
//                       <th className="p-1 border-r border-gray-200">
//                         <SimpleSelect value={challanFilter} onChange={setFilter(setChallanFilter)} options={[
//                           { value: "", label: "All" },
//                           { value: "received", label: "All Received" },
//                           { value: "notReceived", label: "Not Received" },
//                         ]} />
//                       </th>
//                       <th className="p-1"></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedRows.map((t, i) => {
//                       const date = new Date(t.createdAt);
//                       const challans = t.challans || [];
//                       const allDelivered = challans.length > 0 && challans.every(c => c.deliveryStatus === "confirmed");
//                       const allReceived  = challans.length > 0 && challans.every(c => c.challanReturnStatus === "received");
//                       return (
//                         <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors text-center">
//                           <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
//                           <td className="px-3 py-2">
//                             <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{t.tripNumber}</span>
//                           </td>
//                           <td className="px-3 py-2 text-gray-700 text-sm">{t.vendorName}</td>
//                           <td className="px-3 py-2 text-gray-700 text-sm">{t.driverName}</td>
//                           <td className="px-3 py-2 text-xs text-gray-600 uppercase">{t.vehicleNumber}</td>
//                           <td className="px-3 py-2 font-semibold">{t.challanQty}</td>
//                           <td className="px-3 py-2">
//                             <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
//                               {allDelivered ? "All Delivered" : "Not Delivered"}
//                             </span>
//                           </td>
//                           <td className="px-3 py-2">
//                             <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allReceived ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
//                               {allReceived ? "All Received" : "Not Received"}
//                             </span>
//                           </td>
//                           <td className="px-3 py-2">
//                             <button onClick={() => setSelectedTrip(t)}
//                               className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors">
//                               View
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* ── Client-side Pagination ── */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mt-2 shadow-sm">
//                 <p className="text-xs text-gray-500">
//                   Showing {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length} trips
//                 </p>
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={() => setClientPage(p => Math.max(1, p - 1))}
//                     disabled={clientPage === 1}
//                     className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                   >
//                     ← Prev
//                   </button>
//                   {pageNumbers.map((p, i) =>
//                     p === "..." ? (
//                       <span key={i} className="px-2 text-gray-400 text-xs">…</span>
//                     ) : (
//                       <button key={i}
//                         onClick={() => setClientPage(p)}
//                         className={`px-3 py-1 text-xs border rounded transition-colors
//                           ${clientPage === p
//                             ? "bg-gray-800 text-white border-gray-800"
//                             : "border-gray-300 hover:bg-gray-100"}`}
//                       >
//                         {p}
//                       </button>
//                     )
//                   )}
//                   <button
//                     onClick={() => setClientPage(p => Math.min(totalPages, p + 1))}
//                     disabled={clientPage === totalPages}
//                     className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Next →
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <TripDetailsModal
//         selectedTrip={selectedTrip}
//         setSelectedTrip={setSelectedTrip}
//         onTripUpdate={handleTripUpdate}
//       />
//     </div>
//   );
// };

// export default TripInventoryPage;







// import React, { useEffect, useState, useRef } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import TripDetailsModal from "../Component/TripDetailsModal";
// import LoadingSpinner from "../Component/LoadingSpinner";

// /* ── Multi-select dropdown ── */
// const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
//   const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
//   const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

//   return (
//     <div ref={ref} className="relative w-full">
//       <button
//         type="button"
//         onClick={() => setOpen(o => !o)}
//         className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
//           ${selected.length > 0 ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
//       >
//         <span className="truncate flex-1">{label}</span>
//         <span className="flex items-center gap-1 shrink-0">
//           {selected.length > 0 && (
//             <span className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
//               onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
//           )}
//           <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
//           </svg>
//         </span>
//       </button>

//       {open && (
//         <div
//           className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[150px] w-max max-w-[240px] overflow-hidden"
//           style={{
//             zIndex: 9999,
//             top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
//             left: ref.current ? ref.current.getBoundingClientRect().left : 0,
//           }}
//         >
//           {options.length > 5 && (
//             <div className="p-1.5 border-b border-gray-100">
//               <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
//                 placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
//             </div>
//           )}
//           <div className="max-h-44 overflow-y-auto">
//             {filtered.length === 0
//               ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
//               : filtered.map(opt => (
//                 <label key={opt}
//                   className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
//                   <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
//                     className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
//                   <span className="truncate">{opt}</span>
//                 </label>
//               ))
//             }
//           </div>
//           {selected.length > 0 && (
//             <div className="border-t border-gray-100 p-1">
//               <button onClick={() => onChange([])}
//                 className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">
//                 Clear all
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ── Simple select filter ── */
// const SimpleSelect = ({ value, onChange, options }) => (
//   <select
//     value={value}
//     onChange={e => onChange(e.target.value)}
//     className={`w-full px-2 py-1 text-xs rounded border outline-none transition-all
//       ${value ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
//   >
//     {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//   </select>
// );

// /* ════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ════════════════════════════════════════════════════════════════ */
// const TripInventoryPage = () => {
//   const axiosSecure = useAxiosSecure();
//   const { searchText, setSearchText } = useSearch();

//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [selectedTrip, setSelectedTrip] = useState(null);

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year,  setYear]  = useState(new Date().getFullYear());

//   const [tripFilter,     setTripFilter]     = useState([]);
//   const [vendorFilter,   setVendorFilter]   = useState([]);
//   const [driverFilter,   setDriverFilter]   = useState([]);
//   const [vehicleFilter,  setVehicleFilter]  = useState([]);
//   const [dateFilter,     setDateFilter]     = useState("");
//   const [deliveryFilter, setDeliveryFilter] = useState("");
//   const [challanFilter,  setChallanFilter]  = useState("");

//   /* ── fetch ── */
//   const fetchDeliveries = async (m, y, search) => {
//     setLoading(true);
//     try {
//       let url = `/deliveries?month=${m}&year=${y}&page=1&limit=5000`;
//       if (search) url += `&search=${encodeURIComponent(search)}`;
//       const res = await axiosSecure.get(url);
//       setDeliveries(res.data.data || []);
//     } catch (err) { console.error(err); }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchDeliveries(month, year, searchText);
//   }, [month, year, searchText]);

//   /* ── FIX 1: _id included in tripRows ── */
//   const tripRows = deliveries.map(t => ({
//     _id:          t._id,          // ← was missing before
//     tripNumber:   t.tripNumber,
//     vendorName:   t.vendorName,
//     vendorNumber: t.vendorNumber,
//     driverName:   t.driverName,
//     driverNumber: t.driverNumber,
//     vehicleNumber:t.vehicleNumber,
// totalChallan: t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
// challanQty:   t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
//     createdAt:    t.createdAt,
//     createdBy:    t.createdBy,
//     currentUser:  t.currentUser,
//     challans:     t.challans,
//     advance:       t.advance ?? null,
//     advanceSavedBy: t.advanceSavedBy ?? null,  // ← নতুন
//   lastUpdatedBy:  t.lastUpdatedBy ?? null,   // ← নতুন
//   lastUpdatedAt:  t.lastUpdatedAt ?? null,   // ← নতুন
//   }));

//   /* ── FIX 2: callback so modal edits sync back to parent deliveries array ── */
//   const handleTripUpdate = (updatedTrip) => {
//     setDeliveries(prev =>
//       prev.map(d => d._id === updatedTrip._id ? { ...d, ...updatedTrip } : d)
//     );
//     // also keep selectedTrip in sync so modal shows fresh data without close/reopen
//     setSelectedTrip(prev => prev ? { ...prev, ...updatedTrip } : prev);
//   };

//   /* ── filtering ── */
//   const rowMatchesAll = (t, excludeField = null) => {
//     const s = searchText?.toLowerCase() || "";
//     const challans = t.challans || [];
//     const allDelivered = challans.length > 0 && challans.every(c => c.deliveryStatus === "confirmed");
//     const allReceived  = challans.length > 0 && challans.every(c => c.challanReturnStatus === "received");

//     const matchesSearch = !searchText ||
//       [t.tripNumber, t.vendorName, t.driverName, t.vehicleNumber].some(v => v?.toLowerCase().includes(s));

//     const check = (field, filter, val) =>
//       field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

//     return matchesSearch &&
//       check("tripNumber",    tripFilter,    t.tripNumber) &&
//       check("vendorName",    vendorFilter,  t.vendorName) &&
//       check("driverName",    driverFilter,  t.driverName) &&
//       check("vehicleNumber", vehicleFilter, t.vehicleNumber) &&
//       (excludeField === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
//       (!deliveryFilter ||
//         (deliveryFilter === "delivered"    && allDelivered) ||
//         (deliveryFilter === "notDelivered" && !allDelivered)) &&
//       (!challanFilter ||
//         (challanFilter === "received"    && allReceived) ||
//         (challanFilter === "notReceived" && !allReceived));
//   };

//   const filteredRows = tripRows.filter(t => rowMatchesAll(t));

//   const getOptionsFor = (field) => {
//     const map = new Map();
//     tripRows.forEach(t => {
//       if (!rowMatchesAll(t, field)) return;
//       const val = t[field]?.toString().trim();
//       if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   /* ── reset ── */
//   const handleReset = () => {
//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());
//     if (setSearchText) setSearchText("");
//     setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
//     setVehicleFilter([]); setDateFilter(""); setDeliveryFilter(""); setChallanFilter("");
//     Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
//   };

//   const activeFilterGroups = [
//     { label: "Trip",     values: tripFilter,    clear: () => setTripFilter([]) },
//     { label: "Vendor",   values: vendorFilter,  clear: () => setVendorFilter([]) },
//     { label: "Driver",   values: driverFilter,  clear: () => setDriverFilter([]) },
//     { label: "Vehicle",  values: vehicleFilter, clear: () => setVehicleFilter([]) },
//     ...(dateFilter     ? [{ label: "Date",     values: [dateFilter],     clear: () => setDateFilter("") }]     : []),
//     ...(deliveryFilter ? [{ label: "Delivery", values: [deliveryFilter], clear: () => setDeliveryFilter("") }] : []),
//     ...(challanFilter  ? [{ label: "Challan",  values: [challanFilter],  clear: () => setChallanFilter("") }]  : []),
//   ].filter(f => f.values.length > 0);

//   /* ── export ── */
//   const handleExportExcel = async () => {
//     const { value: exportType } = await Swal.fire({
//       title: "Export to Excel",
//       html: `<div style="text-align:left;padding:8px 0">
//         <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
//         <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
//           <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
//           <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
//         </label>
//         <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
//           <input type="radio" name="et" value="full">
//           <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
//         </label>
//       </div>`,
//       showCancelButton: true,
//       confirmButtonColor: "#374151",
//       confirmButtonText: "Export",
//       cancelButtonText: "Cancel",
//       preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
//     });
//     if (!exportType) return;

//     try {
//       let exportData = [];
//       const toRow = (t) => ({
//         Date: new Date(t.createdAt).toLocaleDateString(),
//         Trip: t.tripNumber, Vendor: t.vendorName,
//         "Vendor Number": t.vendorNumber || "", Driver: t.driverName,
//         "Driver Number": t.driverNumber || "", Vehicle: t.vehicleNumber,
//         Points: t.challanQty ?? t.totalChallan,
//         "Delivery Status": (t.challans || []).every(c => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
//         "Challan Status":  (t.challans || []).every(c => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
//       });

//       if (exportType === "filtered") {
//         if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         exportData = filteredRows.map(toRow);
//       } else {
//         Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//         const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}&page=1&limit=5000`);
//         exportData = (res.data.data || []).map(toRow);
//         if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         Swal.close();
//       }

//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Trips");
//       saveAs(
//         new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
//         `TripInventory_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`
//       );
//       Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
//     } catch { Swal.fire("Error", "Export failed", "error"); }
//   };

//   /* ════════════════════════════════════════════════════════════════
//      RENDER
//   ════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto">

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">Trip Inventory</h2>
//             <p className="text-xs text-gray-400 mt-0.5">{filteredRows.length} trips</p>
//           </div>
//           <div className="flex flex-wrap items-center gap-2">
//             <select
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={month} onChange={e => setMonth(parseInt(e.target.value))}>
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//               ))}
//             </select>
//             <input type="number"
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={year} onChange={e => setYear(parseInt(e.target.value))} />
//             <button onClick={handleReset}
//               className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//               Reset All
//             </button>
//             <button onClick={handleExportExcel}
//               className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all">
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//               Export Excel
//             </button>
//           </div>
//         </div>

//         {/* Active filter chips */}
//         {activeFilterGroups.length > 0 && (
//           <div className="flex flex-wrap items-center gap-1.5 mb-3">
//             <span className="text-[10px] text-gray-400 uppercase tracking-widest">Filters:</span>
//             {activeFilterGroups.map((f, i) => (
//               <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded">
//                 {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} selected`}
//                 <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : filteredRows.length === 0 ? (
//           <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
//             No trips found.
//           </div>
//         ) : (
//           <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
//             <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
//               <table className="w-full border-collapse text-sm">
//                 <thead>
//                   <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
//                     {["Date", "Trip Number", "Vendor", "Driver", "Vehicle", "Point", "Delivery", "Challan", "View"].map(h => (
//                       <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
//                     ))}
//                   </tr>
//                   <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
//                     <th className="p-1 border-r border-gray-200">
//                       <input type="date"
//                         className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
//                         value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
//                     </th>
//                     <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("tripNumber")}    selected={tripFilter}    onChange={setTripFilter}    placeholder="All" /></th>
//                     <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vendorName")}    selected={vendorFilter}  onChange={setVendorFilter}  placeholder="All" /></th>
//                     <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("driverName")}    selected={driverFilter}  onChange={setDriverFilter}  placeholder="All" /></th>
//                     <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} placeholder="All" /></th>
//                     <th className="p-1 border-r border-gray-200"></th>
//                     <th className="p-1 border-r border-gray-200">
//                       <SimpleSelect value={deliveryFilter} onChange={setDeliveryFilter} options={[
//                         { value: "", label: "All" },
//                         { value: "delivered", label: "All Delivered" },
//                         { value: "notDelivered", label: "Not Delivered" },
//                       ]} />
//                     </th>
//                     <th className="p-1 border-r border-gray-200">
//                       <SimpleSelect value={challanFilter} onChange={setChallanFilter} options={[
//                         { value: "", label: "All" },
//                         { value: "received", label: "All Received" },
//                         { value: "notReceived", label: "Not Received" },
//                       ]} />
//                     </th>
//                     <th className="p-1"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRows.map((t, i) => {
//                     const date = new Date(t.createdAt);
//                     const challans = t.challans || [];
//                     const allDelivered = challans.length > 0 && challans.every(c => c.deliveryStatus === "confirmed");
//                     const allReceived  = challans.length > 0 && challans.every(c => c.challanReturnStatus === "received");
//                     return (
//                       <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors text-center">
//                         <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
//                         <td className="px-3 py-2">
//                           <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{t.tripNumber}</span>
//                         </td>
//                         <td className="px-3 py-2 text-gray-700 text-sm">{t.vendorName}</td>
//                         <td className="px-3 py-2 text-gray-700 text-sm">{t.driverName}</td>
//                         <td className="px-3 py-2 text-xs text-gray-600 uppercase">{t.vehicleNumber}</td>
//                         <td className="px-3 py-2 font-semibold">{t.challanQty}</td>
//                         <td className="px-3 py-2">
//                           <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
//                             {allDelivered ? "All Delivered" : "Not Delivered"}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2">
//                           <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allReceived ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
//                             {allReceived ? "All Received" : "Not Received"}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2">
//                           <button onClick={() => setSelectedTrip(t)}
//                             className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors">
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* FIX 3: pass onTripUpdate so modal edits bubble back up */}
//       <TripDetailsModal
//         selectedTrip={selectedTrip}
//         setSelectedTrip={setSelectedTrip}
//         onTripUpdate={handleTripUpdate}
//       />
//     </div>
//   );
// };

// export default TripInventoryPage;





import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import TripDetailsModal from "../Component/TripDetailsModal";
import LoadingSpinner from "../Component/LoadingSpinner";

const ITEMS_PER_PAGE = 400;

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
const TripInventoryPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [clientPage, setClientPage]     = useState(1);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const [tripFilter,     setTripFilter]     = useState([]);
  const [vendorFilter,   setVendorFilter]   = useState([]);
  const [driverFilter,   setDriverFilter]   = useState([]);
  const [vehicleFilter,  setVehicleFilter]  = useState([]);
  const [dateFilter,     setDateFilter]     = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [challanFilter,  setChallanFilter]  = useState("");

  /* ── filter setter wrapper — resets page ── */
  const setFilter = (setter) => (val) => {
    setter(val);
    setClientPage(1);
  };

  /* ── fetch ── */
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

  useEffect(() => {
    setClientPage(1);
    fetchDeliveries(month, year, searchText);
  }, [month, year, searchText]);

  /* ── tripRows ── */
  const tripRows = deliveries.map(t => ({
    _id:            t._id,
    tripNumber:     t.tripNumber,
    vendorName:     t.vendorName,
    vendorNumber:   t.vendorNumber,
    driverName:     t.driverName,
    driverNumber:   t.driverNumber,
    vehicleNumber:  t.vehicleNumber,
    totalChallan:   t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
    challanQty:     t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan,
    createdAt:      t.createdAt,
    createdBy:      t.createdBy,
    currentUser:    t.currentUser,
    challans:       t.challans,
    advance:        t.advance        ?? null,
    advanceSavedBy: t.advanceSavedBy ?? null,
    lastUpdatedBy:  t.lastUpdatedBy  ?? null,
    lastUpdatedAt:  t.lastUpdatedAt  ?? null,
  }));

  /* ── modal sync ── */
  const handleTripUpdate = (updatedTrip) => {
    setDeliveries(prev =>
      prev.map(d => d._id === updatedTrip._id ? { ...d, ...updatedTrip } : d)
    );
    setSelectedTrip(prev => prev ? { ...prev, ...updatedTrip } : prev);
  };

  /* ── filtering ── */
  const rowMatchesAll = (t, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const challans = t.challans || [];
    const normalChallans = challans.filter(c => !c.isReturn);
    const allDelivered = normalChallans.length > 0 && normalChallans.every(c => c.deliveryStatus === "confirmed");
    const allReceived  = normalChallans.length > 0 && normalChallans.every(c => c.challanReturnStatus === "received");

    const matchesSearch = !searchText ||
      [t.tripNumber, t.vendorName, t.driverName, t.vehicleNumber].some(v => v?.toLowerCase().includes(s));

    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

    return matchesSearch &&
      check("tripNumber",    tripFilter,    t.tripNumber) &&
      check("vendorName",    vendorFilter,  t.vendorName) &&
      check("driverName",    driverFilter,  t.driverName) &&
      check("vehicleNumber", vehicleFilter, t.vehicleNumber) &&
      (excludeField === "date" || !dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
      (!deliveryFilter ||
        (deliveryFilter === "delivered"    && allDelivered) ||
        (deliveryFilter === "notDelivered" && !allDelivered)) &&
      (!challanFilter ||
        (challanFilter === "received"    && allReceived) ||
        (challanFilter === "notReceived" && !allReceived));
  };

  const filteredRows = tripRows.filter(t => rowMatchesAll(t));

  /* ── Client-side pagination ── */
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice(
    (clientPage - 1) * ITEMS_PER_PAGE,
    clientPage * ITEMS_PER_PAGE
  );

  const getOptionsFor = (field) => {
    const map = new Map();
    tripRows.forEach(t => {
      if (!rowMatchesAll(t, field)) return;
      const val = t[field]?.toString().trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  /* ── reset ── */
  const handleReset = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setClientPage(1);
    if (setSearchText) setSearchText("");
    setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
    setVehicleFilter([]); setDateFilter(""); setDeliveryFilter(""); setChallanFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const activeFilterGroups = [
    { label: "Trip",     values: tripFilter,    clear: () => { setTripFilter([]);    setClientPage(1); } },
    { label: "Vendor",   values: vendorFilter,  clear: () => { setVendorFilter([]);  setClientPage(1); } },
    { label: "Driver",   values: driverFilter,  clear: () => { setDriverFilter([]);  setClientPage(1); } },
    { label: "Vehicle",  values: vehicleFilter, clear: () => { setVehicleFilter([]); setClientPage(1); } },
    ...(dateFilter     ? [{ label: "Date",     values: [dateFilter],     clear: () => { setDateFilter("");     setClientPage(1); } }] : []),
    ...(deliveryFilter ? [{ label: "Delivery", values: [deliveryFilter], clear: () => { setDeliveryFilter(""); setClientPage(1); } }] : []),
    ...(challanFilter  ? [{ label: "Challan",  values: [challanFilter],  clear: () => { setChallanFilter("");  setClientPage(1); } }] : []),
  ].filter(f => f.values.length > 0);

  /* ── export ── */
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
      showCancelButton: true,
      confirmButtonColor: "#374151",
      confirmButtonText: "Export",
      cancelButtonText: "Cancel",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;

    try {
      let exportData = [];
      const toRow = (t) => ({
        Date: new Date(t.createdAt).toLocaleDateString(),
        Trip: t.tripNumber, Vendor: t.vendorName,
        "Vendor Number": t.vendorNumber || "", Driver: t.driverName,
        "Driver Number": t.driverNumber || "", Vehicle: t.vehicleNumber,
        Points: t.challanQty ?? t.totalChallan,
        "Delivery Status": (t.challans || []).filter(c => !c.isReturn).every(c => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
        "Challan Status":  (t.challans || []).filter(c => !c.isReturn).every(c => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
      });

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
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `TripInventory_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`
      );
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  /* ── Page numbers ── */
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 2)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Trip Inventory</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredRows.length} trips
              {totalPages > 1 && ` — page ${clientPage} of ${totalPages}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <input type="number"
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={year} onChange={e => { setYear(parseInt(e.target.value)); setClientPage(1); }} />
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Reset All
            </button>
            <button onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterGroups.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Filters:</span>
            {activeFilterGroups.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded">
                {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} selected`}
                <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
            No trips found.
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-260px)]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
                      {["Date", "Trip Number", "Vendor", "Driver", "Vehicle", "Point", "Delivery", "Challan", "View"].map(h => (
                        <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
                      <th className="p-1 border-r border-gray-200">
                        <input type="date"
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                          value={dateFilter} onChange={e => { setDateFilter(e.target.value); setClientPage(1); }} />
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("tripNumber")}    selected={tripFilter}    onChange={setFilter(setTripFilter)}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vendorName")}    selected={vendorFilter}  onChange={setFilter(setVendorFilter)}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("driverName")}    selected={driverFilter}  onChange={setFilter(setDriverFilter)}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setFilter(setVehicleFilter)} placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"></th>
                      <th className="p-1 border-r border-gray-200">
                        <SimpleSelect value={deliveryFilter} onChange={setFilter(setDeliveryFilter)} options={[
                          { value: "", label: "All" },
                          { value: "delivered", label: "All Delivered" },
                          { value: "notDelivered", label: "Not Delivered" },
                        ]} />
                      </th>
                      <th className="p-1 border-r border-gray-200">
                        <SimpleSelect value={challanFilter} onChange={setFilter(setChallanFilter)} options={[
                          { value: "", label: "All" },
                          { value: "received", label: "All Received" },
                          { value: "notReceived", label: "Not Received" },
                        ]} />
                      </th>
                      <th className="p-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((t, i) => {
                      const date = new Date(t.createdAt);
                      const challans = t.challans || [];
                      const normalChallans = challans.filter(c => !c.isReturn);
                      const allDelivered = normalChallans.length > 0 && normalChallans.every(c => c.deliveryStatus === "confirmed");
                      const allReceived  = normalChallans.length > 0 && normalChallans.every(c => c.challanReturnStatus === "received");
                      return (
                        <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors text-center">
                          <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
                          <td className="px-3 py-2">
                            <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{t.tripNumber}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-700 text-sm">{t.vendorName}</td>
                          <td className="px-3 py-2 text-gray-700 text-sm">{t.driverName}</td>
                          <td className="px-3 py-2 text-xs text-gray-600 uppercase">{t.vehicleNumber}</td>
                          <td className="px-3 py-2 font-semibold">{t.challanQty}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {allDelivered ? "All Delivered" : "Not Delivered"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${allReceived ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {allReceived ? "All Received" : "Not Received"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => setSelectedTrip(t)}
                              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Client-side Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mt-2 shadow-sm">
                <p className="text-xs text-gray-500">
                  Showing {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length} trips
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setClientPage(p => Math.max(1, p - 1))}
                    disabled={clientPage === 1}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-gray-400 text-xs">…</span>
                    ) : (
                      <button key={i}
                        onClick={() => setClientPage(p)}
                        className={`px-3 py-1 text-xs border rounded transition-colors
                          ${clientPage === p
                            ? "bg-gray-800 text-white border-gray-800"
                            : "border-gray-300 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setClientPage(p => Math.min(totalPages, p + 1))}
                    disabled={clientPage === totalPages}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TripDetailsModal
        selectedTrip={selectedTrip}
        setSelectedTrip={setSelectedTrip}
        onTripUpdate={handleTripUpdate}
      />
    </div>
  );
};

export default TripInventoryPage;