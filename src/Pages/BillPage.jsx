// import React, { useEffect, useState, useRef } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import CarRentDetailsModal from "../Component/CarRentDetailsModal";
// import LoadingSpinner from "../Component/LoadingSpinner";

// /* ── Multi-select dropdown ── */
// const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState("");
//     const ref = useRef(null);

//     useEffect(() => {
//         const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, []);

//     const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
//     const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
//     const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

//     return (
//         <div ref={ref} className="relative w-full">
//             <button
//                 type="button"
//                 onClick={() => setOpen(o => !o)}
//                 className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
//           ${selected.length > 0 ? "border-gray-700 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
//             >
//                 <span className="truncate flex-1">{label}</span>
//                 <span className="flex items-center gap-1 shrink-0">
//                     {selected.length > 0 && (
//                         <span className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
//                             onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
//                     )}
//                     <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                         <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
//                     </svg>
//                 </span>
//             </button>

//             {open && (
//                 <div
//                     className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[150px] w-max max-w-[240px] overflow-hidden"
//                     style={{
//                         zIndex: 9999,
//                         top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
//                         left: ref.current ? ref.current.getBoundingClientRect().left : 0,
//                     }}
//                 >
//                     {options.length > 5 && (
//                         <div className="p-1.5 border-b border-gray-100">
//                             <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
//                                 placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
//                         </div>
//                     )}
//                     <div className="max-h-44 overflow-y-auto">
//                         {filtered.length === 0
//                             ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
//                             : filtered.map(opt => (
//                                 <label key={opt}
//                                     className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
//                                     <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
//                                         className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
//                                     <span className="truncate">{opt}</span>
//                                 </label>
//                             ))
//                         }
//                     </div>
//                     {selected.length > 0 && (
//                         <div className="border-t border-gray-100 p-1">
//                             <button onClick={() => onChange([])}
//                                 className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">
//                                 Clear all
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// /* ════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ════════════════════════════════════════════════════════════════ */
// const CarRentPage = () => {
//     const axiosSecure = useAxiosSecure();
//     const { searchText, setSearchText } = useSearch();

//     const [rentals, setRentals] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [selectedRental, setSelectedRental] = useState(null);

//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());

//     const [tripFilter, setTripFilter] = useState([]);
//     const [vendorFilter, setVendorFilter] = useState([]);
//     const [driverFilter, setDriverFilter] = useState([]);
//     const [vehicleFilter, setVehicleFilter] = useState([]);
//     const [dateFilter, setDateFilter] = useState("");

//     /* ── fetch ── */
//     const fetchRentals = async (m, y, search) => {
//         setLoading(true);
//         try {
//             let url = `/car-rents?month=${m}&year=${y}&page=1&limit=5000`;
//             if (search) url += `&search=${encodeURIComponent(search)}`;
//             const res = await axiosSecure.get(url);
//             setRentals(res.data.data || []);
//         } catch (err) { console.error(err); }
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchRentals(month, year, searchText);
//     }, [month, year, searchText]);

//     /* ── map to rows ── */
//     const rentalRows = rentals.map(r => ({
//         _id: r._id,
//         tripNumber: r.tripNumber,
//         vendorName: r.vendorName,
//         vendorNumber: r.vendorNumber,
//         driverName: r.driverName,
//         driverNumber: r.driverNumber,
//         vehicleNumber: r.vehicleNumber,
//         point: r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,
//         totalChallan: r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,   // ← এটাও রাখো
//         rent: r.rent,
//         leborBill: r.leborBill,
//         createdAt: r.createdAt,
//         createdBy: r.createdBy,
//         currentUser: r.currentUser,
//         challans: r.challans,       // ← এটা missing ছিল
//     }));

//     /* ── callback so modal edits sync back to parent ── */
//     const handleRentalUpdate = (updatedRental) => {
//         setRentals(prev =>
//             prev.map(r => r._id === updatedRental._id ? { ...r, ...updatedRental } : r)
//         );
//         setSelectedRental(prev => prev ? { ...prev, ...updatedRental } : prev);
//     };

//     /* ── filtering ── */
//     const rowMatchesAll = (r, excludeField = null) => {
//         const s = searchText?.toLowerCase() || "";

//         const matchesSearch = !searchText ||
//             [r.tripNumber, r.vendorName, r.driverName, r.vehicleNumber].some(v => v?.toLowerCase().includes(s));

//         const check = (field, filter, val) =>
//             field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

//         return matchesSearch &&
//             check("tripNumber", tripFilter, r.tripNumber) &&
//             check("vendorName", vendorFilter, r.vendorName) &&
//             check("driverName", driverFilter, r.driverName) &&
//             check("vehicleNumber", vehicleFilter, r.vehicleNumber) &&
//             (excludeField === "date" || !dateFilter || new Date(r.createdAt).toISOString().slice(0, 10) === dateFilter);
//     };

//     const filteredRows = rentalRows.filter(r => rowMatchesAll(r));

//     const getOptionsFor = (field) => {
//         const map = new Map();
//         rentalRows.forEach(r => {
//             if (!rowMatchesAll(r, field)) return;
//             const val = r[field]?.toString().trim();
//             if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//         });
//         return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//     };

//     /* ── reset ── */
//     const handleReset = () => {
//         setMonth(new Date().getMonth() + 1);
//         setYear(new Date().getFullYear());
//         if (setSearchText) setSearchText("");
//         setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
//         setVehicleFilter([]); setDateFilter("");
//         Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
//     };

//     const activeFilterGroups = [
//         { label: "Trip", values: tripFilter, clear: () => setTripFilter([]) },
//         { label: "Vendor", values: vendorFilter, clear: () => setVendorFilter([]) },
//         { label: "Driver", values: driverFilter, clear: () => setDriverFilter([]) },
//         { label: "Vehicle", values: vehicleFilter, clear: () => setVehicleFilter([]) },
//         ...(dateFilter ? [{ label: "Date", values: [dateFilter], clear: () => setDateFilter("") }] : []),
//     ].filter(f => f.values.length > 0);

//     /* ── export ── */
//     const handleExportExcel = async () => {
//         const { value: exportType } = await Swal.fire({
//             title: "Export to Excel",
//             html: `<div style="text-align:left;padding:8px 0">
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
//             showCancelButton: true,
//             confirmButtonColor: "#374151",
//             confirmButtonText: "Export",
//             cancelButtonText: "Cancel",
//             preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
//         });
//         if (!exportType) return;

//         try {
//             let exportData = [];
//             const toRow = (r) => ({
//                 Date: new Date(r.createdAt).toLocaleDateString(),
//                 "Trip Number": r.tripNumber,
//                 Vendor: r.vendorName,
//                 "Vendor Number": r.vendorNumber || "",
//                 Driver: r.driverName,
//                 "Driver Number": r.driverNumber || "",
//                 Vehicle: r.vehicleNumber,
//                 Point: r.point ?? "",
//                 Rent: r.rent ?? "",
//                 "Lebor Bill": r.leborBill ?? "",
//             });

//             if (exportType === "filtered") {
//                 if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
//                 exportData = filteredRows.map(toRow);
//             } else {
//                 Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//                 const res = await axiosSecure.get(`/car-rents?month=${month}&year=${year}&page=1&limit=5000`);
//                 exportData = (res.data.data || []).map(toRow);
//                 if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
//                 Swal.close();
//             }

//             const ws = XLSX.utils.json_to_sheet(exportData);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "CarRents");
//             saveAs(
//                 new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
//                 `CarRent_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`
//             );
//             Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
//         } catch { Swal.fire("Error", "Export failed", "error"); }
//     };

//     /* ════════════════════════════════════════════════════════════════
//        RENDER
//     ════════════════════════════════════════════════════════════════ */
//     return (
//         <div className="min-h-screen bg-gray-50 p-4">
//             <div className="max-w-full mx-auto">

//                {/* Header */}
// <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
//   <div>
//     <h2 className="text-xl font-semibold text-gray-800">Car Rent</h2>
//     <div className="flex items-center gap-2 mt-1 flex-wrap">
//       <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
//         {filteredRows.length} trips
//       </span>
//       {filteredRows.filter(r => r.rent == null).length > 0 && (
//         <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">
//           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
//           Rent missing: {filteredRows.filter(r => r.rent == null).length}
//         </span>
//       )}
//       {filteredRows.filter(r => r.leborBill == null).length > 0 && (
//         <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-0.5">
//           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
//           Lebor Bill missing: {filteredRows.filter(r => r.leborBill == null).length}
//         </span>
//       )}
//       {filteredRows.filter(r => r.rent == null).length === 0 &&
//        filteredRows.filter(r => r.leborBill == null).length === 0 &&
//        filteredRows.length > 0 && (
//         <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5">
//           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
//           All complete
//         </span>
//       )}
//     </div>
//   </div>
//   <div className="flex flex-wrap items-center gap-2">
//     <select
//       className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
//       value={month} onChange={e => setMonth(parseInt(e.target.value))}>
//       {[...Array(12)].map((_, i) => (
//         <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//       ))}
//     </select>
//     <input type="number"
//       className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
//       value={year} onChange={e => setYear(parseInt(e.target.value))} />
//     <button onClick={handleReset}
//       className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
//       </svg>
//       Reset All
//     </button>
//     <button onClick={handleExportExcel}
//       className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all">
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
//       </svg>
//       Export Excel
//     </button>
//   </div>
// </div>

//                 {/* Active filter chips */}
//                 {activeFilterGroups.length > 0 && (
//                     <div className="flex flex-wrap items-center gap-1.5 mb-3">
//                         <span className="text-[10px] text-gray-400 uppercase tracking-widest">Filters:</span>
//                         {activeFilterGroups.map((f, i) => (
//                             <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded">
//                                 {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} selected`}
//                                 <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
//                             </span>
//                         ))}
//                     </div>
//                 )}

//                 {/* Table */}
//                 {loading ? (
//                     <LoadingSpinner />
//                 ) : filteredRows.length === 0 ? (
//                     <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
//                         No records found.
//                     </div>
//                 ) : (
//                     <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
//                         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
//                             <table className="w-full border-collapse text-sm">
//                                 <thead>
//                                     <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
//                                         {["Date", "Trip Number", "Vendor", "Driver", "Vehicle", "Point", "Rent", "Lebor Bill", "Action"].map(h => (
//                                             <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
//                                         ))}
//                                     </tr>
//                                     <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
//                                         {/* Date */}
//                                         <th className="p-1 border-r border-gray-200">
//                                             <input type="date"
//                                                 className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
//                                                 value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
//                                         </th>
//                                         {/* Trip */}
//                                         <th className="p-1 border-r border-gray-200">
//                                             <MultiSelectFilter options={getOptionsFor("tripNumber")} selected={tripFilter} onChange={setTripFilter} placeholder="All" />
//                                         </th>
//                                         {/* Vendor */}
//                                         <th className="p-1 border-r border-gray-200">
//                                             <MultiSelectFilter options={getOptionsFor("vendorName")} selected={vendorFilter} onChange={setVendorFilter} placeholder="All" />
//                                         </th>
//                                         {/* Driver */}
//                                         <th className="p-1 border-r border-gray-200">
//                                             <MultiSelectFilter options={getOptionsFor("driverName")} selected={driverFilter} onChange={setDriverFilter} placeholder="All" />
//                                         </th>
//                                         {/* Vehicle */}
//                                         <th className="p-1 border-r border-gray-200">
//                                             <MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} placeholder="All" />
//                                         </th>
//                                         {/* Point, Rent, Lebor Bill — no filter */}
//                                         <th className="p-1 border-r border-gray-200"></th>
//                                         <th className="p-1 border-r border-gray-200"></th>
//                                         <th className="p-1 border-r border-gray-200"></th>
//                                         {/* Action */}
//                                         <th className="p-1"></th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((r, i) => {
//                                         const date = new Date(r.createdAt);
//                                         return (
//                                             <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors text-center">
//                                                 <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
//                                                 <td className="px-3 py-2">
//                                                     <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{r.tripNumber}</span>
//                                                 </td>
//                                                 <td className="px-3 py-2 text-gray-700 text-sm">{r.vendorName}</td>
//                                                 <td className="px-3 py-2 text-gray-700 text-sm">{r.driverName}</td>
//                                                 <td className="px-3 py-2 text-xs text-gray-600 uppercase">{r.vehicleNumber}</td>
//                                                 <td className="px-3 py-2 font-semibold text-gray-700">{r.point ?? "—"}</td>
//                                                 <td className="px-3 py-2 font-semibold">
//                                                     {r.rent != null
//                                                         ? <span className="text-green-700">৳ {Number(r.rent).toLocaleString()}</span>
//                                                         : <span className="px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded text-[10px] font-medium">Missing</span>
//                                                     }
//                                                 </td>
//                                                 <td className="px-3 py-2 font-semibold">
//                                                     {r.leborBill != null
//                                                         ? <span className="text-green-700">৳ {Number(r.leborBill).toLocaleString()}</span>
//                                                         : <span className="px-1.5 py-0.5 bg-orange-50 text-orange-500 border border-orange-200 rounded text-[10px] font-medium">Missing</span>
//                                                     }
//                                                 </td>
//                                                 <td className="px-3 py-2">
//                                                     <button
//                                                         onClick={() => setSelectedRental(r)}
//                                                         className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
//                                                     >
//                                                         View
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Modal */}
//             <CarRentDetailsModal
//                 selectedRental={selectedRental}
//                 setSelectedRental={setSelectedRental}
//                 onRentalUpdate={handleRentalUpdate}
//             />
//         </div>
//     );
// };

// export default CarRentPage;






import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";
import LoadingSpinner from "../Component/LoadingSpinner";

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
const CarRentPage = () => {
    const axiosSecure = useAxiosSecure();
    const { searchText, setSearchText } = useSearch();

    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [tripFilter,      setTripFilter]      = useState([]);
    const [vendorFilter,    setVendorFilter]    = useState([]);
    const [driverFilter,    setDriverFilter]    = useState([]);
    const [vehicleFilter,   setVehicleFilter]   = useState([]);
    const [dateFilter,      setDateFilter]      = useState("");
    const [rentFilter,      setRentFilter]      = useState("");
    const [leborBillFilter, setLeborBillFilter] = useState("");

    /* ── fetch ── */
    const fetchRentals = async (m, y, search) => {
        setLoading(true);
        try {
            let url = `/car-rents?month=${m}&year=${y}&page=1&limit=5000`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const res = await axiosSecure.get(url);
            setRentals(res.data.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchRentals(month, year, searchText);
    }, [month, year, searchText]);

    /* ── map to rows ── */
    const rentalRows = rentals.map(r => ({
        _id:          r._id,
        tripNumber:   r.tripNumber,
        vendorName:   r.vendorName,
        vendorNumber: r.vendorNumber,
        driverName:   r.driverName,
        driverNumber: r.driverNumber,
        vehicleNumber:r.vehicleNumber,
        point:        r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,
        totalChallan: r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,
        rent:         r.rent,
        leborBill:    r.leborBill,
        createdAt:    r.createdAt,
        createdBy:    r.createdBy,
        currentUser:  r.currentUser,
        challans:     r.challans,
    }));

    /* ── callback so modal edits sync back to parent ── */
    const handleRentalUpdate = (updatedRental) => {
        setRentals(prev =>
            prev.map(r => r._id === updatedRental._id ? { ...r, ...updatedRental } : r)
        );
        setSelectedRental(prev => prev ? { ...prev, ...updatedRental } : prev);
    };

    /* ── filtering ── */
    const rowMatchesAll = (r, excludeField = null) => {
        const s = searchText?.toLowerCase() || "";

        const matchesSearch = !searchText ||
            [r.tripNumber, r.vendorName, r.driverName, r.vehicleNumber].some(v => v?.toLowerCase().includes(s));

        const check = (field, filter, val) =>
            field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

        return matchesSearch &&
            check("tripNumber",    tripFilter,    r.tripNumber) &&
            check("vendorName",    vendorFilter,  r.vendorName) &&
            check("driverName",    driverFilter,  r.driverName) &&
            check("vehicleNumber", vehicleFilter, r.vehicleNumber) &&
            (excludeField === "date" || !dateFilter || new Date(r.createdAt).toISOString().slice(0, 10) === dateFilter) &&
            (!rentFilter ||
                (rentFilter === "missing" && r.rent == null) ||
                (rentFilter === "added"   && r.rent != null)) &&
            (!leborBillFilter ||
                (leborBillFilter === "missing" && r.leborBill == null) ||
                (leborBillFilter === "added"   && r.leborBill != null));
    };

    const filteredRows = rentalRows.filter(r => rowMatchesAll(r));

    const getOptionsFor = (field) => {
        const map = new Map();
        rentalRows.forEach(r => {
            if (!rowMatchesAll(r, field)) return;
            const val = r[field]?.toString().trim();
            if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        });
        return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    };

    /* ── reset ── */
    const handleReset = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        if (setSearchText) setSearchText("");
        setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
        setVehicleFilter([]); setDateFilter("");
        setRentFilter(""); setLeborBillFilter("");
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
    };

    const activeFilterGroups = [
        { label: "Trip",       values: tripFilter,    clear: () => setTripFilter([]) },
        { label: "Vendor",     values: vendorFilter,  clear: () => setVendorFilter([]) },
        { label: "Driver",     values: driverFilter,  clear: () => setDriverFilter([]) },
        { label: "Vehicle",    values: vehicleFilter, clear: () => setVehicleFilter([]) },
        ...(dateFilter      ? [{ label: "Date",      values: [dateFilter],      clear: () => setDateFilter("") }]      : []),
        ...(rentFilter      ? [{ label: "Rent",      values: [rentFilter],      clear: () => setRentFilter("") }]      : []),
        ...(leborBillFilter ? [{ label: "Lebor Bill",values: [leborBillFilter], clear: () => setLeborBillFilter("") }] : []),
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
            const toRow = (r) => ({
                Date:            new Date(r.createdAt).toLocaleDateString(),
                "Trip Number":   r.tripNumber,
                Vendor:          r.vendorName,
                "Vendor Number": r.vendorNumber || "",
                Driver:          r.driverName,
                "Driver Number": r.driverNumber || "",
                Vehicle:         r.vehicleNumber,
                Point:           r.point ?? "",
                Rent:            r.rent ?? "",
                "Lebor Bill":    r.leborBill ?? "",
            });

            if (exportType === "filtered") {
                if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
                exportData = filteredRows.map(toRow);
            } else {
                Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const res = await axiosSecure.get(`/car-rents?month=${month}&year=${year}&page=1&limit=5000`);
                exportData = (res.data.data || []).map(toRow);
                if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
                Swal.close();
            }

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CarRents");
            saveAs(
                new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
                `CarRent_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`
            );
            Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
        } catch { Swal.fire("Error", "Export failed", "error"); }
    };

    /* ════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-full mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Car Rent</h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
                                {filteredRows.length} trips
                            </span>
                            {filteredRows.filter(r => r.rent == null).length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    Rent missing: {filteredRows.filter(r => r.rent == null).length}
                                </span>
                            )}
                            {filteredRows.filter(r => r.leborBill == null).length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-0.5">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    Lebor Bill missing: {filteredRows.filter(r => r.leborBill == null).length}
                                </span>
                            )}
                            {filteredRows.filter(r => r.rent == null).length === 0 &&
                             filteredRows.filter(r => r.leborBill == null).length === 0 &&
                             filteredRows.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    All complete
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Summary */}
{filteredRows.length > 0 && (
  <div className="flex flex-wrap items-center gap-2 mt-2">
    {(() => {
      const totalRent      = filteredRows.reduce((s, r) => s + (r.rent      != null ? Number(r.rent)      : 0), 0);
      const totalLeborBill = filteredRows.reduce((s, r) => s + (r.leborBill != null ? Number(r.leborBill) : 0), 0);
      const totalBill      = totalRent + totalLeborBill;
      return (
        <>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm">
            Rent: <span className="text-gray-800 font-bold">৳ {totalRent.toLocaleString()}</span>
          </span>
          <span className="text-gray-300 text-xs">+</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm">
            Lebor Bill: <span className="text-gray-800 font-bold">৳ {totalLeborBill.toLocaleString()}</span>
          </span>
          <span className="text-gray-300 text-xs">=</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 shadow-sm">
            Total: ৳ {totalBill.toLocaleString()}
          </span>
        </>
      );
    })()}
  </div>
)}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                            ))}
                        </select>
                        <input type="number"
                            className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            value={year} onChange={e => setYear(parseInt(e.target.value))} />
                        <button onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                            </svg>
                            Reset All
                        </button>
                        <button onClick={handleExportExcel}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
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
                        No records found.
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
                                        {["Date", "Trip Number", "Vendor", "Driver", "Vehicle", "Point", "Rent", "Lebor Bill", "Action"].map(h => (
                                            <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
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
                                        {/* Vendor */}
                                        <th className="p-1 border-r border-gray-200">
                                            <MultiSelectFilter options={getOptionsFor("vendorName")} selected={vendorFilter} onChange={setVendorFilter} placeholder="All" />
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
                                            <SimpleSelect
                                                value={rentFilter}
                                                onChange={setRentFilter}
                                                options={[
                                                    { value: "",        label: "All" },
                                                    { value: "added",   label: "Added" },
                                                    { value: "missing", label: "Missing" },
                                                ]}
                                            />
                                        </th>
                                        {/* Lebor Bill filter */}
                                        <th className="p-1 border-r border-gray-200">
                                            <SimpleSelect
                                                value={leborBillFilter}
                                                onChange={setLeborBillFilter}
                                                options={[
                                                    { value: "",        label: "All" },
                                                    { value: "added",   label: "Added" },
                                                    { value: "missing", label: "Missing" },
                                                ]}
                                            />
                                        </th>
                                        {/* Action */}
                                        <th className="p-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((r, i) => {
                                        const date = new Date(r.createdAt);
                                        return (
                                            <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors text-center">
                                                <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
                                                <td className="px-3 py-2">
                                                    <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{r.tripNumber}</span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-700 text-sm">{r.vendorName}</td>
                                                <td className="px-3 py-2 text-gray-700 text-sm">{r.driverName}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600 uppercase">{r.vehicleNumber}</td>
                                                <td className="px-3 py-2 font-semibold text-gray-700">{r.point ?? "—"}</td>
                                                <td className="px-3 py-2 font-semibold">
                                                    {r.rent != null
                                                        ? <span className="text-green-700">৳ {Number(r.rent).toLocaleString()}</span>
                                                        : <span className="px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded text-[10px] font-medium">Missing</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2 font-semibold">
                                                    {r.leborBill != null
                                                        ? <span className="text-green-700">৳ {Number(r.leborBill).toLocaleString()}</span>
                                                        : <span className="px-1.5 py-0.5 bg-orange-50 text-orange-500 border border-orange-200 rounded text-[10px] font-medium">Missing</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        onClick={() => setSelectedRental(r)}
                                                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                                                    >
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
                )}
            </div>

            {/* Modal */}
            <CarRentDetailsModal
                selectedRental={selectedRental}
                setSelectedRental={setSelectedRental}
                onRentalUpdate={handleRentalUpdate}
            />
        </div>
    );
};

export default CarRentPage;