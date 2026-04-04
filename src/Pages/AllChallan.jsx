
// import React, { useEffect, useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import useRole from "../hooks/useRole";
// import ChallanActionDropdown from "../Component/ChallanActionDropdown";
// import Swal from "sweetalert2";

// const AllChallan = () => {
//   const axiosSecure = useAxiosSecure();
//   const [challans, setChallans] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { searchText, setSearchText } = useSearch();
//   const { role } = useRole();

//   // Filters state
//   const [customerFilter, setCustomerFilter] = useState("");
//   const [addressFilter, setAddressFilter] = useState("");
//   const [thanaFilter, setThanaFilter] = useState(""); 
//   const [districtFilter, setDistrictFilter] = useState(""); 
//   const [receiverFilter, setReceiverFilter] = useState("");
//   const [zoneFilter, setZoneFilter] = useState("");
//   const [modelFilter, setModelFilter] = useState("");
//   const [productNameFilter, setProductNameFilter] = useState(""); // Added
//   const [dateFilter, setDateFilter] = useState("");
  
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());

//   const fetchChallans = async (m, y, search) => {
//     setLoading(true);
//     try {
//       let url = `/challans?month=${m}&year=${y}`;
//       if (search) url += `&search=${search}`;
//       const res = await axiosSecure.get(url);
//       setChallans(res.data.data || res.data || []);
//     } catch (err) {
//       console.error("Error fetching challans:", err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchChallans(month, year, searchText);
//   }, [month, year, searchText]);


//   const getUniqueValues = (arr, field) => {
//   const map = new Map();

//   arr.forEach((c) => {
//     if (field === "model" || field === "productName") { // Updated for product fields
//       c.products?.forEach((p) => {
//         const value = p[field]?.toString().trim();
//         if (value) {
//           const key = value.toLowerCase();
//           if (!map.has(key)) map.set(key, value);
//         }
//       });
//     } else {
//       const value = c[field]?.toString().trim();
//       if (value) {
//         const key = value.toLowerCase();
//         if (!map.has(key)) map.set(key, value);
//       }
//     }
//   });

//   return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
// };

//   const handleResetAll = () => {
//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());
//     if (setSearchText) setSearchText("");
//     setCustomerFilter("");
//     setAddressFilter("");
//     setThanaFilter("");
//     setDistrictFilter("");
//     setReceiverFilter("");
//     setZoneFilter("");
//     setModelFilter("");
//     setProductNameFilter(""); // Added
//     setDateFilter("");

//     Swal.fire({
//       toast: true,
//       position: 'top-end',
//       icon: 'success',
//       title: 'All Filters Reset',
//       showConfirmButton: false,
//       timer: 1500
//     });
//   };

//   const getFilteredData = () => {
//     const rows = [];
//     challans.forEach((c) => {
//       c.products?.forEach((p) => {
//         const s = searchText ? searchText.toLowerCase() : "";

//         // Global Search Match
//         const matchesSearch =
//           !searchText ||
//           [
//             c.customerName,
//             c.address,
//             c.thana,
//             c.district,
//             c.receiverNumber,
//             c.zone,
//             c.currentUser,
//             p.productName,
//             p.model,
//           ].some((val) => val?.toLowerCase().includes(s));

//         // Column Filters Match
//         const matchesFilters =
//   (!customerFilter || c.customerName?.toLowerCase() === customerFilter.toLowerCase()) &&
//   (!addressFilter || c.address?.toLowerCase() === addressFilter.toLowerCase()) &&
//   (!thanaFilter || c.thana?.toLowerCase() === thanaFilter.toLowerCase()) &&
//   (!districtFilter || c.district?.toLowerCase() === districtFilter.toLowerCase()) &&
//   (!receiverFilter || c.receiverNumber?.toLowerCase() === receiverFilter.toLowerCase()) &&
//   (!zoneFilter || c.zone?.toLowerCase() === zoneFilter.toLowerCase()) &&
//   (!modelFilter || p.model?.toLowerCase() === modelFilter.toLowerCase()) &&
//   (!productNameFilter || p.productName?.toLowerCase() === productNameFilter.toLowerCase()) && // Added
//   (!dateFilter ||
//     (c.createdAt &&
//       new Date(c.createdAt).toISOString().slice(0, 10) === dateFilter));

//         if (matchesSearch && matchesFilters) {
//           rows.push({ c, p });
//         }
//       });
//     });
//     return rows;
//   };

//   const filteredRows = getFilteredData();
//   const filteredChallansOnly = [
//     ...new Map(filteredRows.map(item => [item.c._id, item.c])).values()
//   ];
//   const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

// const handleExportExcel = () => {
//   if (filteredRows.length === 0) {
//     Swal.fire({
//       icon: "warning",
//       title: "No Data",
//       text: "No data available to export!"
//     });
//     return;
//   }

//   // ⭐ Confirmation Alert
//   Swal.fire({
//     title: "Export to Excel?",
//     text: `You are about to export ${filteredRows.length} rows.`,
//     icon: "question",
//     showCancelButton: true,
//     confirmButtonColor: "#16a34a",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Yes, Export",
//     cancelButtonText: "Cancel"
//   }).then((result) => {

//     if (result.isConfirmed) {

//       const exportData = filteredRows.map(({ c, p }) => ({
//         "Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
//         "Customer": c.customerName,
//         "Address": c.address,
//         "Thana": c.thana || "",
//         "District": c.district || "",
//         "Receiver No": c.receiverNumber,
//         "Zone": c.zone,
//         "Product Name": p.productName, // Added
//         "Model": p.model,
//         "Qty": p.quantity,
//         "User": c.currentUser || "N/A",
//       }));

//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "ChallanReport");
//       const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

//       const blob = new Blob([buffer], { type: "application/octet-stream" });
//       saveAs(blob, `Challan_Report_${month}_${year}.xlsx`);

//       Swal.fire({
//         icon: "success",
//         title: "Exported!",
//         text: "Excel file downloaded successfully.",
//         timer: 2000,
//         showConfirmButton: false
//       });
//     }
//   });
// };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
        
//         {/* Header Section */}
//         <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 w-full">
  
//   {/* Filters Section */}
//   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full lg:w-auto">
//     <select 
//       className="border px-2 py-1.5 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-full sm:w-auto" 
//       value={month} 
//       onChange={(e) => setMonth(parseInt(e.target.value))}
//     >
//       {[...Array(12)].map((_, i) => (
//         <option key={i} value={i + 1}>
//           {new Date(0, i).toLocaleString("default", { month: "long" })}
//         </option>
//       ))}
//     </select>

//     <input 
//       type="number" 
//       className="border px-2 py-1.5 rounded w-full sm:w-24 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
//       value={year} 
//       onChange={(e) => setYear(parseInt(e.target.value))} 
//     />

//     <button 
//       onClick={handleResetAll} 
//       className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded shadow-sm text-sm transition-colors w-full sm:w-auto active:scale-95"
//     >
//       Reset All
//     </button>
//   </div>
  
//   <div className="text-center order-first lg:order-none">
//     <h2 className="text-xl md:text-2xl font-bold text-green-700">
//       Challan Inventory
//     </h2>
//   </div>
  
//   <div className="w-full lg:w-auto">
//     {role === "admin" && (
//       <button 
//         onClick={handleExportExcel} 
//         className="bg-green-600 text-white px-4 py-1.5 rounded shadow-sm hover:bg-green-700 transition-colors w-full sm:w-auto text-sm font-medium active:scale-95"
//       >
//         Export Excel
//       </button>
//     )}
//   </div>
// </div>
    

//         {/* Table Section */}
//         {loading ? (
//           <div className="text-center py-10 text-green-600 font-bold">Loading Challans...</div>
//         ) : (
//           <table className="w-full border-collapse text-sm min-w-[1200px]">
//             <thead>
//               <tr className="bg-green-600 text-white text-center">
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Customer</th>
//                 <th className="border p-2">Address</th>
//                 <th className="border p-2">Thana</th>
//                 <th className="border p-2">District</th>
//                 <th className="border p-2">Receiver No</th>
//                 <th className="border p-2">Zone</th>
//                 <th className="border p-2">Product</th> {/* Added Header */}
//                 <th className="border p-2">Model</th>
//                 <th className="border p-2">Qty</th>
//                 <th className="border p-2">Action</th>
//               </tr>
              
//               <tr className="bg-green-50">
//                 <th className="border p-1"><input type="date" className="w-full text-xs p-1 border rounded" value={dateFilter} onChange={e => setDateFilter(e.target.value)} /></th>
//                 <th className="border p-1">
//                   <select className="w-full text-xs p-1 border rounded font-normal" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "customerName").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={addressFilter} onChange={e => setAddressFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "address").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={thanaFilter} onChange={e => setThanaFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "thana").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "district").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={receiverFilter} onChange={e => setReceiverFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "receiverNumber").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "zone").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1"> {/* Added Filter */}
//                   <select className="w-full text-xs p-1 border rounded font-normal" value={productNameFilter} onChange={e => setProductNameFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "productName").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                    <select className="w-full text-xs p-1 border rounded font-normal" value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
//                     <option value="">All</option>
//                     {getUniqueValues(filteredChallansOnly, "model").map(v => <option key={v} value={v}>{v}</option>)}
//                   </select>
//                 </th>
//                 <th className="border p-1 bg-white text-green-600 font-bold text-center">{totalQty}</th>
//                 <th className="border p-1 bg-white"></th>
//               </tr>
//             </thead>
            
//             <tbody>
//               {filteredRows.length > 0 ? (
//                 filteredRows.map(({ c, p }, idx) => (
//                   <tr key={`${c._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition-colors">
//                     <td className="border px-2 py-1 whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</td>
//                     <td className="border px-2 py-1 ">{c.customerName}</td>
//                     <td className="border px-2 py-1 truncate max-w-[150px]" title={c.address}>{c.address}</td>
//                     <td className="border px-2 py-1">{c.thana || "-"}</td>
//                     <td className="border px-2 py-1 ">{c.district || "-"}</td>
//                     <td className="border px-2 py-1">{c.receiverNumber}</td>
//                     <td className="border px-2 py-1">{c.zone}</td>
//                     <td className="border px-2 py-1">{p.productName || "-"}</td> {/* Added Cell */}
//                     <td className="border px-2 py-1">{p.model?.toUpperCase()}</td>
//                     <td className="border px-2 py-1 font-bold text-blue-800">{p.quantity}</td>
//                     <td className="border px-2">
//                       <ChallanActionDropdown 
//                         challan={c} 
//                         product={p} 
//                         axiosSecure={axiosSecure} 
//                         setChallans={setChallans} 
//                       />
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="11" className="text-center py-10 text-gray-500 italic">No Challans found matching your criteria.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllChallan;

import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ChallanActionDropdown from "../Component/ChallanActionDropdown";
import Pagination from "../Component/Pagination";
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

/* ── Main Component ── */
const AllChallan = () => {
  const axiosSecure = useAxiosSecure();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [, setCurrentPage] = useState(1);

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

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const fetchChallans = async (m, y, search, page = 1) => {
    setLoading(true);
    try {
      let url = `/challans?month=${m}&year=${y}&page=${page}&limit=50`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setChallans(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchChallans(month, year, searchText, 1);
  }, [month, year, searchText]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchChallans(month, year, searchText, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setCurrentPage(1);
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setAddressFilter([]); setThanaFilter([]);
    setDistrictFilter([]); setReceiverFilter([]); setZoneFilter([]);
    setModelFilter([]); setProductNameFilter([]); setDateFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = (c, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [c.customerName, c.address, c.thana, c.district, c.receiverNumber, c.zone, c.currentUser, p.productName, p.model]
      .some(v => v?.toLowerCase().includes(s));

    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

    return matchesSearch &&
      check("customerName",    customerFilter,    c.customerName) &&
      check("address",         addressFilter,     c.address) &&
      check("thana",           thanaFilter,       c.thana) &&
      check("district",        districtFilter,    c.district) &&
      check("receiverNumber",  receiverFilter,    c.receiverNumber) &&
      check("zone",            zoneFilter,        c.zone) &&
      check("productName",     productNameFilter, p.productName) &&
      check("model",           modelFilter,       p.model) &&
      (excludeField === "date" || !dateFilter || (c.createdAt && new Date(c.createdAt).toISOString().slice(0, 10) === dateFilter));
  };

  const filteredRows = challans.flatMap(c =>
    (c.products || []).filter(p => rowMatchesAll(c, p)).map(p => ({ c, p }))
  );
  const totalQty = filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0);

  // cascading options
  const getOptionsFor = (field) => {
    const map = new Map();
    challans.forEach(c => {
      (c.products || []).forEach(p => {
        if (!rowMatchesAll(c, p, field)) return;
        const val = (field === "productName" || field === "model")
          ? p[field]?.toString().trim()
          : c[field]?.toString().trim();
        if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Customer",  values: customerFilter,    clear: () => setCustomerFilter([]) },
    { label: "Address",   values: addressFilter,     clear: () => setAddressFilter([]) },
    { label: "Thana",     values: thanaFilter,       clear: () => setThanaFilter([]) },
    { label: "District",  values: districtFilter,    clear: () => setDistrictFilter([]) },
    { label: "Receiver",  values: receiverFilter,    clear: () => setReceiverFilter([]) },
    { label: "Zone",      values: zoneFilter,        clear: () => setZoneFilter([]) },
    { label: "Product",   values: productNameFilter, clear: () => setProductNameFilter([]) },
    { label: "Model",     values: modelFilter,       clear: () => setModelFilter([]) },
    ...(dateFilter ? [{ label: "Date", values: [dateFilter], clear: () => setDateFilter("") }] : []),
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
      const toRow = (c, p) => ({
        Date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
        Customer: c.customerName, Address: c.address,
        Thana: c.thana || "", District: c.district || "",
        "Receiver No": c.receiverNumber, Zone: c.zone,
        "Product Name": p.productName, Model: p.model,
        Qty: p.quantity, User: c.currentUser || "N/A",
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Challan Inventory</h2>
            {pagination && (
              <p className="text-xs text-gray-400 mt-0.5">{pagination.total} total records</p>
            )}
          </div>
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
            <button onClick={handleResetAll}
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
          <LoadingSpinner text="Loading Challans…" />
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
            No challans found.
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left sticky top-0 z-20">
                      {["Date", "Customer", "Address", "Thana", "District", "Receiver No", "Zone", "Product", "Model", "Qty", "Action"].map(h => (
                        <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 sticky top-[41px] z-20">
                      <th className="p-1 border-r border-gray-200">
                        <input type="date"
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                          value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")}   selected={customerFilter}    onChange={setCustomerFilter}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("address")}        selected={addressFilter}     onChange={setAddressFilter}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("thana")}          selected={thanaFilter}       onChange={setThanaFilter}       placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("district")}       selected={districtFilter}    onChange={setDistrictFilter}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("receiverNumber")} selected={receiverFilter}    onChange={setReceiverFilter}    placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}           selected={zoneFilter}        onChange={setZoneFilter}        placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}    selected={productNameFilter} onChange={setProductNameFilter} placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}          selected={modelFilter}       onChange={setModelFilter}       placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200 text-center text-sm font-semibold text-gray-700">{totalQty}</th>
                      <th className="p-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map(({ c, p }, idx) => (
                      <tr key={`${c._id}-${idx}`} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{c.customerName}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs max-w-[150px] truncate" title={c.address}>{c.address}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{c.thana || "—"}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{c.district || "—"}</td>
                        <td className="px-3 py-2 text-xs">{c.receiverNumber}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{c.zone}</td>
                        <td className="px-3 py-2">{p.productName || "—"}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{p.model?.toUpperCase()}</td>
                        <td className="px-3 py-2 text-center font-semibold">{p.quantity}</td>
                        <td className="px-3 py-2">
                          <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} setChallans={setChallans} />
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

export default AllChallan;