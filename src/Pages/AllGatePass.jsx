

// import React, { useEffect, useState, useRef } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import ActionDropdown from "../Component/ActionDropdown";
// import Pagination from "../Component/Pagination";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import useRole from "../hooks/useRole";
// import Swal from "sweetalert2";
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

//   const toggle = (val) =>
//     onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

//   return (
//     <div ref={ref} className="relative w-full">
//       <button
//         type="button"
//         onClick={() => setOpen(o => !o)}
//         className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
//           ${selected.length > 0
//             ? "border-gray-700 bg-gray-100 text-gray-800"
//             : "border-gray-300 bg-white text-gray-400"}`}
//       >
//         <span className="truncate flex-1">{label}</span>
//         <span className="flex items-center gap-1 shrink-0">
//           {selected.length > 0 && (
//             <span
//               className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
//               onClick={e => { e.stopPropagation(); onChange([]); }}
//             >✕</span>
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
//               <input
//                 autoFocus
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 placeholder="Search…"
//                 className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none"
//               />
//             </div>
//           )}
//           <div className="max-h-44 overflow-y-auto">
//             {filtered.length === 0
//               ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
//               : filtered.map(opt => (
//                 <label
//                   key={opt}
//                   className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors
//                     ${selected.includes(opt) ? "bg-gray-50" : ""}`}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selected.includes(opt)}
//                     onChange={() => toggle(opt)}
//                     className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0"
//                   />
//                   <span className="truncate">{opt}</span>
//                 </label>
//               ))
//             }
//           </div>
//           {selected.length > 0 && (
//             <div className="border-t border-gray-100 p-1">
//               <button
//                 onClick={() => onChange([])}
//                 className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors"
//               >
//                 Clear all
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ── Main Component ── */
// const AllGatePass = () => {
//   const axiosSecure = useAxiosSecure();
//   const [gatePasses, setGatePasses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState(null);
//   const [, setCurrentPage] = useState(1);

//   const { searchText, setSearchText } = useSearch();
//   const { role } = useRole();

//   const [tripDoFilter,    setTripDoFilter]    = useState([]);
//   const [customerFilter,  setCustomerFilter]  = useState([]);
//   const [csdFilter,       setCsdFilter]       = useState([]);
//   const [unitFilter,      setUnitFilter]      = useState([]);
//   const [vehicleFilter,   setVehicleFilter]   = useState([]);
//   const [zoneFilter,      setZoneFilter]      = useState([]);
//   const [productFilter,   setProductFilter]   = useState([]);
//   const [modelFilter,     setModelFilter]     = useState([]);
//   const [tripDateFilter,  setTripDateFilter]  = useState("");

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year,  setYear]  = useState(new Date().getFullYear());

//   const fetchGatePasses = async (m, y, search, page = 1) => {
//     setLoading(true);
//     try {
//       let url = `/gate-pass?month=${m}&year=${y}&page=${page}&limit=50`;
//       if (search) url += `&search=${search}`;
//       const res = await axiosSecure.get(url);
//       setGatePasses(res.data.data || []);
//       setPagination(res.data.pagination || null);
//     } catch (err) { console.error(err); }
//     setLoading(false);
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//     fetchGatePasses(month, year, searchText, 1);
//   }, [month, year, searchText]);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     fetchGatePasses(month, year, searchText, page);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleResetAll = () => {
//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());
//     setCurrentPage(1);
//     if (setSearchText) setSearchText("");
//     setTripDoFilter([]); setCustomerFilter([]); setCsdFilter([]);
//     setUnitFilter([]); setVehicleFilter([]); setZoneFilter([]);
//     setProductFilter([]); setModelFilter([]); setTripDateFilter("");
//     Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
//   };

//   const rowMatchesAll = (gp, p, excludeField = null) => {
//     const s = searchText?.toLowerCase() || "";
//     const matchesSearch = !searchText || [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model]
//       .some(v => v?.toLowerCase().includes(s));

//     const check = (field, filter, val) =>
//       field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

//     return matchesSearch &&
//       check("tripDo",      tripDoFilter,   gp.tripDo) &&
//       check("customerName",customerFilter, gp.customerName) &&
//       check("csd",         csdFilter,      gp.csd) &&
//       check("unit",        unitFilter,     gp.unit) &&
//       check("vehicleNo",   vehicleFilter,  gp.vehicleNo) &&
//       check("zone",        zoneFilter,     gp.zone) &&
//       check("productName", productFilter,  p.productName) &&
//       check("model",       modelFilter,    p.model) &&
//       (excludeField === "date" || !tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter);
//   };

//   const filteredRows = gatePasses.flatMap(gp =>
//     (gp.products || []).filter(p => rowMatchesAll(gp, p)).map(p => ({ gp, p }))
//   );

//   const totalQty = filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0);

//   // Cascading options — exclude own filter so self-options stay visible
//   const getOptionsFor = (field) => {
//     const map = new Map();
//     gatePasses.forEach(gp => {
//       (gp.products || []).forEach(p => {
//         if (!rowMatchesAll(gp, p, field)) return;
//         const val = (field === "productName" || field === "model")
//           ? p[field]?.toString().trim()
//           : gp[field]?.toString().trim();
//         if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//       });
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   const activeFilterGroups = [
//     { label: "Trip DO",   values: tripDoFilter,   clear: () => setTripDoFilter([]) },
//     { label: "Customer",  values: customerFilter,  clear: () => setCustomerFilter([]) },
//     { label: "CSD",       values: csdFilter,       clear: () => setCsdFilter([]) },
//     { label: "Unit",      values: unitFilter,      clear: () => setUnitFilter([]) },
//     { label: "Vehicle",   values: vehicleFilter,   clear: () => setVehicleFilter([]) },
//     { label: "Zone",      values: zoneFilter,      clear: () => setZoneFilter([]) },
//     { label: "Product",   values: productFilter,   clear: () => setProductFilter([]) },
//     { label: "Model",     values: modelFilter,     clear: () => setModelFilter([]) },
//     ...(tripDateFilter ? [{ label: "Date", values: [tripDateFilter], clear: () => setTripDateFilter("") }] : []),
//   ].filter(f => f.values.length > 0);

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
//       const toRow = (gp, p) => ({
//         "Trip Do": gp.tripDo, "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "",
//         Customer: gp.customerName, CSD: gp.csd, Unit: gp.unit || "",
//         "Vehicle No": gp.vehicleNo, Zone: gp.zone,
//         Product: p.productName, Model: p.model, Qty: p.quantity, User: gp.currentUser,
//       });

//       if (exportType === "filtered") {
//         if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         exportData = filteredRows.map(({ gp, p }) => toRow(gp, p));
//       } else {
//         Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//         const res = await axiosSecure.get(`/gate-pass?month=${month}&year=${year}&page=1&limit=5000`);
//         (res.data.data || []).forEach(gp => gp.products?.forEach(p => exportData.push(toRow(gp, p))));
//         if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
//         Swal.close();
//       }

//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "GatePass");
//       saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
//         `GatePass_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
//       Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
//     } catch { Swal.fire("Error", "Export failed", "error"); }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto">

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">Gate Pass Inventory</h2>
//             {pagination && (
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {pagination.total} total records
//               </p>
//             )}
//           </div>

//           <div className="flex flex-wrap items-center gap-2">
//             <select
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={month}
//               onChange={e => setMonth(parseInt(e.target.value))}
//             >
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//               ))}
//             </select>

//             <input
//               type="number"
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={year}
//               onChange={e => setYear(parseInt(e.target.value))}
//             />

//             <button
//               onClick={handleResetAll}
//               className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
//             >
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//               Reset All
//             </button>

//             {role === "admin" && (
//               <button
//                 onClick={handleExportExcel}
//                 className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all"
//               >
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//                 Export Excel
//               </button>
//             )}
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
//           <LoadingSpinner text="Loading Gate Pass…" />
//         ) : filteredRows.length === 0 ? (
//           <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
//             No gate pass found.
//           </div>
//         ) : (
//           <>
//             <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse text-sm">
//                   <thead className="sticky top-0 z-20">
//                     {/* Column headers */}
//                     <tr className="bg-gray-800 text-white text-left">
//                       {["Trip DO", "Trip Date", "Customer", "CSD", "Unit", "Vehicle No", "Zone", "Product", "Model", "Qty", "Action"].map(h => (
//                         <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>

//                     {/* Filter row */}
//                     <tr className="bg-gray-50 border-b-2 border-gray-200">
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("tripDo")}      selected={tripDoFilter}   onChange={setTripDoFilter}   placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200">
//                         <input
//                           type="date"
//                           className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
//                           value={tripDateFilter}
//                           onChange={e => setTripDateFilter(e.target.value)}
//                         />
//                       </th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")} selected={customerFilter}  onChange={setCustomerFilter}  placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("csd")}          selected={csdFilter}      onChange={setCsdFilter}      placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("unit")}         selected={unitFilter}     onChange={setUnitFilter}     placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={setVehicleFilter}  placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setZoneFilter}     placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}  selected={productFilter}  onChange={setProductFilter}  placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}        selected={modelFilter}    onChange={setModelFilter}    placeholder="All" /></th>
//                       <th className="p-1 border-r border-gray-200 text-center text-sm font-semibold text-gray-700">{totalQty}</th>
//                       <th className="p-1"></th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {filteredRows.map(({ gp, p }, idx) => (
//                       <tr
//                         key={`${gp._id}-${p._id || idx}`}
//                         className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors"
//                       >
//                         <td className="px-3 py-2 whitespace-nowrap">
//                           <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{gp.tripDo}</span>
//                         </td>
//                         <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">
//                           {gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}
//                         </td>
//                         <td className="px-3 py-2 font-medium text-gray-800">{gp.customerName}</td>
//                         <td className="px-3 py-2 text-gray-500 text-xs">{gp.csd?.toUpperCase()}</td>
//                         <td className="px-3 py-2 text-gray-500 text-xs">{gp.unit?.toUpperCase() || "—"}</td>
//                         <td className="px-3 py-2 text-xs">{gp.vehicleNo?.toUpperCase()}</td>
//                         <td className="px-3 py-2 text-gray-600 text-xs">{gp.zone}</td>
//                         <td className="px-3 py-2">{p.productName}</td>
//                         <td className="px-3 py-2 text-gray-500 text-xs">{p.model?.toUpperCase()}</td>
//                         <td className="px-3 py-2 text-center font-semibold">{p.quantity}</td>
//                         <td className="px-3 py-2">
//                           <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser} />
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <Pagination pagination={pagination} onPageChange={handlePageChange} />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllGatePass;





import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import ActionDropdown from "../Component/ActionDropdown";
import Pagination from "../Component/Pagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
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

  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-xs rounded border transition-all text-left
          ${selected.length > 0
            ? "border-gray-700 bg-gray-100 text-gray-800"
            : "border-gray-300 bg-white text-gray-400"}`}
      >
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <span
              className="text-gray-400 hover:text-gray-700 leading-none px-0.5 cursor-pointer"
              onClick={e => { e.stopPropagation(); onChange([]); }}
            >✕</span>
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
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none"
              />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
              : filtered.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors
                    ${selected.includes(opt) ? "bg-gray-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggle(opt)}
                    className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0"
                  />
                  <span className="truncate">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <button
                onClick={() => onChange([])}
                className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ── */
const AllGatePass = () => {
  const axiosSecure = useAxiosSecure();
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [, setCurrentPage] = useState(1);

  const { searchText, setSearchText } = useSearch();
  const { role } = useRole();

  const [tripDoFilter,    setTripDoFilter]    = useState([]);
  const [customerFilter,  setCustomerFilter]  = useState([]);
  const [csdFilter,       setCsdFilter]       = useState([]);
  const [unitFilter,      setUnitFilter]      = useState([]);
  const [vehicleFilter,   setVehicleFilter]   = useState([]);
  const [zoneFilter,      setZoneFilter]      = useState([]);
  const [productFilter,   setProductFilter]   = useState([]);
  const [modelFilter,     setModelFilter]     = useState([]);
  const [tripDateFilter,  setTripDateFilter]  = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const fetchGatePasses = async (m, y, search, page = 1) => {
    setLoading(true);
    try {
      let url = `/gate-pass?month=${m}&year=${y}&page=${page}&limit=50`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setGatePasses(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchGatePasses(month, year, searchText, 1);
  }, [month, year, searchText]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchGatePasses(month, year, searchText, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setCurrentPage(1);
    if (setSearchText) setSearchText("");
    setTripDoFilter([]); setCustomerFilter([]); setCsdFilter([]);
    setUnitFilter([]); setVehicleFilter([]); setZoneFilter([]);
    setProductFilter([]); setModelFilter([]); setTripDateFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = (gp, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model]
      .some(v => v?.toLowerCase().includes(s));

    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

    return matchesSearch &&
      check("tripDo",      tripDoFilter,   gp.tripDo) &&
      check("customerName",customerFilter, gp.customerName) &&
      check("csd",         csdFilter,      gp.csd) &&
      check("unit",        unitFilter,     gp.unit) &&
      check("vehicleNo",   vehicleFilter,  gp.vehicleNo) &&
      check("zone",        zoneFilter,     gp.zone) &&
      check("productName", productFilter,  p.productName) &&
      check("model",       modelFilter,    p.model) &&
      (excludeField === "date" || !tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter);
  };

  const filteredRows = gatePasses.flatMap(gp =>
    (gp.products || []).filter(p => rowMatchesAll(gp, p)).map(p => ({ gp, p }))
  );

  const totalQty = filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0);

  const getOptionsFor = (field) => {
    const map = new Map();
    gatePasses.forEach(gp => {
      (gp.products || []).forEach(p => {
        if (!rowMatchesAll(gp, p, field)) return;
        const val = (field === "productName" || field === "model")
          ? p[field]?.toString().trim()
          : gp[field]?.toString().trim();
        if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Trip DO",   values: tripDoFilter,   clear: () => setTripDoFilter([]) },
    { label: "Customer",  values: customerFilter,  clear: () => setCustomerFilter([]) },
    { label: "CSD",       values: csdFilter,       clear: () => setCsdFilter([]) },
    { label: "Unit",      values: unitFilter,      clear: () => setUnitFilter([]) },
    { label: "Vehicle",   values: vehicleFilter,   clear: () => setVehicleFilter([]) },
    { label: "Zone",      values: zoneFilter,      clear: () => setZoneFilter([]) },
    { label: "Product",   values: productFilter,   clear: () => setProductFilter([]) },
    { label: "Model",     values: modelFilter,     clear: () => setModelFilter([]) },
    ...(tripDateFilter ? [{ label: "Date", values: [tripDateFilter], clear: () => setTripDateFilter("") }] : []),
  ].filter(f => f.values.length > 0);

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
      const toRow = (gp, p) => ({
        "Trip Do": gp.tripDo, "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "",
        Customer: gp.customerName, CSD: gp.csd, Unit: gp.unit || "",
        "Vehicle No": gp.vehicleNo, Zone: gp.zone,
        Product: p.productName, Model: p.model, Qty: p.quantity, User: gp.currentUser,
      });

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gate Pass Inventory</h2>
            {pagination && (
              <p className="text-xs text-gray-400 mt-0.5">
                {pagination.total} total records
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>

            <input
              type="number"
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
            />

            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Reset All
            </button>

            {role === "admin" && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Excel
              </button>
            )}
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
          <LoadingSpinner text="Loading Gate Pass…" />
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
            No gate pass found.
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* ── KEY FIX: overflow-x-auto + overflow-y-auto with max-h ──
                  Both axes on the same container lets thead sticky work correctly.
                  Adjust max-h value to match your layout (navbar + page padding). */}
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    {/* Column headers — sticky to top of scroll container */}
                    <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
                      {["Trip DO", "Trip Date", "Customer", "CSD", "Unit", "Vehicle No", "Zone", "Product", "Model", "Qty", "Action"].map(h => (
                        <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>

                    {/* Filter row — sticky just below header row */}
                    <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("tripDo")}      selected={tripDoFilter}   onChange={setTripDoFilter}   placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200">
                        <input
                          type="date"
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                          value={tripDateFilter}
                          onChange={e => setTripDateFilter(e.target.value)}
                        />
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")} selected={customerFilter}  onChange={setCustomerFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("csd")}          selected={csdFilter}      onChange={setCsdFilter}      placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("unit")}         selected={unitFilter}     onChange={setUnitFilter}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("vehicleNo")}    selected={vehicleFilter}  onChange={setVehicleFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setZoneFilter}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}  selected={productFilter}  onChange={setProductFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}        selected={modelFilter}    onChange={setModelFilter}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200 text-center text-sm font-semibold text-gray-700">{totalQty}</th>
                      <th className="p-1"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map(({ gp, p }, idx) => (
                      <tr
                        key={`${gp._id}-${p._id || idx}`}
                        className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{gp.tripDo}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">
                          {gp.tripDate ? new Date(gp.tripDate).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800">{gp.customerName}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{gp.csd?.toUpperCase()}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{gp.unit?.toUpperCase() || "—"}</td>
                        <td className="px-3 py-2 text-xs">{gp.vehicleNo?.toUpperCase()}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{gp.zone}</td>
                        <td className="px-3 py-2">{p.productName}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{p.model?.toUpperCase()}</td>
                        <td className="px-3 py-2 text-center font-semibold">{p.quantity}</td>
                        <td className="px-3 py-2">
                          <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default AllGatePass;