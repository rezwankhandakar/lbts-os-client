
// import React, { useEffect, useState } from "react";

// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";

// const DeliveredPage = () => {
//   const axiosSecure = useAxiosSecure();
//   const { searchText, setSearchText } = useSearch();

//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Filters
//   const [customerFilter, setCustomerFilter] = useState("");
//   const [zoneFilter, setZoneFilter] = useState("");
//   const [districtFilter, setDistrictFilter] = useState("");
//   const [thanaFilter, setThanaFilter] = useState("");
//   const [productFilter, setProductFilter] = useState("");
//   const [modelFilter, setModelFilter] = useState("");
//   const [addressFilter, setAddressFilter] = useState("");
//   const [receiverFilter, setReceiverFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());

//   // Fetch deliveries
//   const fetchDeliveries = async (m, y, search) => {
//     setLoading(true);
//     try {
//       let url = `/deliveries?month=${m}&year=${y}`;
//       if (search) url += `&search=${search}`;
//       const res = await axiosSecure.get(url);
//       setDeliveries(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchDeliveries(month, year, searchText);
//   }, [month, year, searchText]);

//   const handleResetAll = () => {
//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());
//     setSearchText("");
//     setCustomerFilter("");
//     setZoneFilter("");
//     setDistrictFilter("");
//     setThanaFilter("");
//     setProductFilter("");
//     setModelFilter("");
//     setAddressFilter("");
//     setReceiverFilter("");
//     setDateFilter("");

//     Swal.fire({
//       toast: true,
//       position: "top-end",
//       icon: "success",
//       title: "Filters & Search Cleared",
//       showConfirmButton: false,
//       timer: 1500,
//     });
//   };

//   // Filter & flatten data
//   const getFilteredData = () => {
//     const rows = [];
//     deliveries.forEach((trip) => {
//       trip.challans?.forEach((challan) => {
//         const challanDate = new Date(trip.createdAt);
//         if (challanDate.getMonth() + 1 !== month || challanDate.getFullYear() !== year) return;

//         challan.products?.forEach((product) => {
//           const s = searchText?.toLowerCase() || "";

//           const matchesSearch =
//             !searchText ||
//             [
//               challan.customerName,
//               challan.zone,
//               challan.address,
//               challan.receiverNumber,
//               challan.district,
//               challan.thana,
//               product.productName,
//               product.model,
//               product.quantity?.toString(),
//               challanDate.toLocaleDateString(),
//             ].some((val) => val?.toString().toLowerCase().includes(s));

//           const matchesFilters =
//             (!dateFilter || challanDate.toISOString().slice(0, 10) === dateFilter) &&
//             (!customerFilter || challan.customerName?.toLowerCase() === customerFilter.toLowerCase()) &&
//             (!zoneFilter || challan.zone?.toLowerCase() === zoneFilter.toLowerCase()) &&
//             (!addressFilter || challan.address?.toLowerCase() === addressFilter.toLowerCase()) &&
//             (!receiverFilter || challan.receiverNumber?.toLowerCase() === receiverFilter.toLowerCase()) &&
//             (!districtFilter || challan.district?.toLowerCase() === districtFilter.toLowerCase()) &&
//             (!thanaFilter || challan.thana?.toLowerCase() === thanaFilter.toLowerCase()) &&
//             (!productFilter || product.productName?.toLowerCase() === productFilter.toLowerCase()) &&
//             (!modelFilter || product.model?.toLowerCase() === modelFilter.toLowerCase());

//           if (matchesSearch && matchesFilters) {
//             rows.push({ trip, challan, product, date: challanDate });
//           }
//         });
//       });
//     });
//     return rows;
//   };

//   const filteredRows = getFilteredData();
//   const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.product.quantity) || 0), 0);

//   const getUniqueValuesFromRows = (rows, field) => {
//     const map = new Map();
//     rows.forEach(({ challan, product }) => {
//       let val = field === "productName" || field === "model" ? product[field]?.trim() : challan[field]?.trim();
//       if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   const handleExportExcel = () => {
//     if (!filteredRows.length) return Swal.fire("No Data", "No data available to export!", "warning");

//     const exportData = filteredRows.map(({ challan, product, date }) => ({
//       Date: date.toLocaleDateString(),
//       Customer: challan.customerName,
//       Zone: challan.zone,
//       Address: challan.address,
//       "Receiver Number": challan.receiverNumber,
//       District: challan.district,
//       Thana: challan.thana,
//       Product: product.productName,
//       Model: product.model,
//       Qty: product.quantity,
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Delivered_${month}_${year}.xlsx`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
//           <div className="flex gap-2 flex-wrap">
//             <select className="border px-2 py-1 rounded" value={month} onChange={(e) => setMonth(+e.target.value)}>
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>
//                   {new Date(0, i).toLocaleString("default", { month: "short" })}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="number"
//               className="border px-2 py-1 rounded w-20"
//               value={year}
//               onChange={(e) => setYear(+e.target.value)}
//             />

//             <button onClick={handleResetAll} className="bg-red-500 text-white px-3 py-1 rounded">
//               Reset
//             </button>
//           </div>

//           <h2 className="text-xl font-bold text-green-700">Delivered Orders</h2>

//           <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
//             Export Excel
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse text-sm min-w-[900px]">
//               <thead className="bg-green-600 text-white text-center sticky top-0">
//                 <tr>
//                   <th className="border p-2">Date</th>
//                   <th className="border p-2">Customer</th>
//                   <th className="border p-2">Zone</th>
//                   <th className="border p-2">Address</th>
//                   <th className="border p-2">Receiver</th>
//                   <th className="border p-2">District</th>
//                   <th className="border p-2">Thana</th>
//                   <th className="border p-2">Product</th>
//                   <th className="border p-2">Model</th>
//                   <th className="border p-2">Qty</th>
//                 </tr>

//                 {/* Filters row */}
//                 <tr className="bg-white text-black text-center">
//                   <th className="border p-1">
//                     <input
//                       type="date"
//                       className="w-full border text-xs p-1"
//                       value={dateFilter}
//                       onChange={(e) => setDateFilter(e.target.value)}
//                     />
//                   </th>
//                   {["customerName", "zone", "address", "receiverNumber", "district", "thana", "productName", "model"].map((f, i) => (
//                     <th key={i} className="border p-1">
//                       <select
//                         className="w-full border text-xs p-1"
//                         value={{
//                           customerName: customerFilter,
//                           zone: zoneFilter,
//                           address: addressFilter,
//                           receiverNumber: receiverFilter,
//                           district: districtFilter,
//                           thana: thanaFilter,
//                           productName: productFilter,
//                           model: modelFilter,
//                         }[f]}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           if (f === "customerName") setCustomerFilter(val);
//                           else if (f === "zone") setZoneFilter(val);
//                           else if (f === "address") setAddressFilter(val);
//                           else if (f === "receiverNumber") setReceiverFilter(val);
//                           else if (f === "district") setDistrictFilter(val);
//                           else if (f === "thana") setThanaFilter(val);
//                           else if (f === "productName") setProductFilter(val);
//                           else if (f === "model") setModelFilter(val);
//                         }}
//                       >
//                         <option value="">All</option>
//                         {getUniqueValuesFromRows(filteredRows, f).map((v) => (
//                           <option key={v}>{v}</option>
//                         ))}
//                       </select>
//                     </th>
//                   ))}
//                   <th className="border p-1 font-bold">{totalQty}</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredRows.map(({ trip, challan, product, date }, idx) => (
//                   <tr key={idx} className="text-center even:bg-gray-50">
//                     <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.customerName}>
//                       {challan.customerName}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[80px]" title={challan.zone}>
//                       {challan.zone}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[120px]" title={challan.address}>
//                       {challan.address}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.receiverNumber}>
//                       {challan.receiverNumber}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.district}>
//                       {challan.district}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.thana}>
//                       {challan.thana}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={product.productName}>
//                       {product.productName}
//                     </td>
//                     <td className="border px-2 py-1 truncate max-w-[100px]" title={product.model}>
//                       {product.model}
//                     </td>
//                     <td className="border px-2 py-1 font-bold">{product.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeliveredPage;


import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import Pagination from "../Component/Pagination";
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
const DeliveredPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [, setCurrentPage] = useState(1);

  const [customerFilter,  setCustomerFilter]  = useState([]);
  const [zoneFilter,      setZoneFilter]      = useState([]);
  const [districtFilter,  setDistrictFilter]  = useState([]);
  const [thanaFilter,     setThanaFilter]     = useState([]);
  const [productFilter,   setProductFilter]   = useState([]);
  const [modelFilter,     setModelFilter]     = useState([]);
  const [addressFilter,   setAddressFilter]   = useState([]);
  const [receiverFilter,  setReceiverFilter]  = useState([]);
  const [dateFilter,      setDateFilter]      = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const fetchDeliveries = async (m, y, search, page = 1) => {
    setLoading(true);
    try {
      let url = `/deliveries?month=${m}&year=${y}&page=${page}&limit=50`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchDeliveries(month, year, searchText, 1);
  }, [month, year, searchText]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchDeliveries(month, year, searchText, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setCurrentPage(1);
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setZoneFilter([]); setDistrictFilter([]);
    setThanaFilter([]); setProductFilter([]); setModelFilter([]);
    setAddressFilter([]); setReceiverFilter([]); setDateFilter("");
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = (trip, challan, product, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const matchesSearch = !searchText || [challan.customerName, challan.zone, challan.address, challan.receiverNumber, challan.district, challan.thana, product.productName, product.model]
      .some(v => v?.toString().toLowerCase().includes(s));

    const challanDate = new Date(trip.createdAt).toISOString().slice(0, 10);

    const check = (field, filter, val) =>
      field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());

    return matchesSearch &&
      (excludeField === "date" || !dateFilter || challanDate === dateFilter) &&
      check("customerName",   customerFilter,  challan.customerName) &&
      check("zone",           zoneFilter,      challan.zone) &&
      check("address",        addressFilter,   challan.address) &&
      check("receiverNumber", receiverFilter,  challan.receiverNumber) &&
      check("district",       districtFilter,  challan.district) &&
      check("thana",          thanaFilter,     challan.thana) &&
      check("productName",    productFilter,   product.productName) &&
      check("model",          modelFilter,     product.model);
  };

  const filteredRows = deliveries.flatMap(trip =>
    (trip.challans || []).flatMap(challan =>
      (challan.products || [])
        .filter(product => rowMatchesAll(trip, challan, product))
        .map(product => ({ trip, challan, product, date: new Date(trip.createdAt) }))
    )
  );

  const totalQty = filteredRows.reduce((sum, { product }) => sum + (Number(product.quantity) || 0), 0);

  const getOptionsFor = (field) => {
    const map = new Map();
    deliveries.forEach(trip => {
      (trip.challans || []).forEach(challan => {
        (challan.products || []).forEach(product => {
          if (!rowMatchesAll(trip, challan, product, field)) return;
          const val = (field === "productName" || field === "model")
            ? product[field]?.trim()
            : challan[field]?.trim();
          if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Customer",  values: customerFilter,  clear: () => setCustomerFilter([]) },
    { label: "Zone",      values: zoneFilter,      clear: () => setZoneFilter([]) },
    { label: "Address",   values: addressFilter,   clear: () => setAddressFilter([]) },
    { label: "Receiver",  values: receiverFilter,  clear: () => setReceiverFilter([]) },
    { label: "District",  values: districtFilter,  clear: () => setDistrictFilter([]) },
    { label: "Thana",     values: thanaFilter,     clear: () => setThanaFilter([]) },
    { label: "Product",   values: productFilter,   clear: () => setProductFilter([]) },
    { label: "Model",     values: modelFilter,     clear: () => setModelFilter([]) },
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
      const toRow = (challan, product, date) => ({
        Date: date.toLocaleDateString(),
        Customer: challan.customerName, Zone: challan.zone,
        Address: challan.address, "Receiver Number": challan.receiverNumber,
        District: challan.district, Thana: challan.thana,
        Product: product.productName, Model: product.model, Qty: product.quantity,
      });

      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(({ challan, product, date }) => toRow(challan, product, date));
      } else {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}&page=1&limit=5000`);
        (res.data.data || []).forEach(trip => {
          (trip.challans || []).forEach(challan => {
            (challan.products || []).forEach(product => {
              exportData.push(toRow(challan, product, new Date(trip.createdAt)));
            });
          });
        });
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
        Swal.close();
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `Delivered_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Delivered Orders</h2>
            {pagination && <p className="text-xs text-gray-400 mt-0.5">{pagination.total} total trips</p>}
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
          <LoadingSpinner text="Loading Deliveries…" />
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic border border-dashed border-gray-200 rounded-lg bg-white">
            No deliveries found.
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-800 text-white text-left">
                      {["Date", "Customer", "Zone", "Address", "Receiver", "District", "Thana", "Product", "Model", "Qty"].map(h => (
                        <th key={h} className="px-3 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-1 border-r border-gray-200">
                        <input type="date"
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white"
                          value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                      </th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("customerName")}   selected={customerFilter}  onChange={setCustomerFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("zone")}           selected={zoneFilter}      onChange={setZoneFilter}      placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("address")}        selected={addressFilter}   onChange={setAddressFilter}   placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("receiverNumber")} selected={receiverFilter}  onChange={setReceiverFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("district")}       selected={districtFilter}  onChange={setDistrictFilter}  placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("thana")}          selected={thanaFilter}     onChange={setThanaFilter}     placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("productName")}    selected={productFilter}   onChange={setProductFilter}   placeholder="All" /></th>
                      <th className="p-1 border-r border-gray-200"><MultiSelectFilter options={getOptionsFor("model")}          selected={modelFilter}     onChange={setModelFilter}     placeholder="All" /></th>
                      <th className="p-1 text-center text-sm font-semibold text-gray-700">{totalQty}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map(({ challan, product, date }, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{date.toLocaleDateString("en-GB")}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{challan.customerName}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{challan.zone}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs max-w-[130px] truncate" title={challan.address}>{challan.address}</td>
                        <td className="px-3 py-2 text-xs">{challan.receiverNumber}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{challan.district}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{challan.thana}</td>
                        <td className="px-3 py-2">{product.productName}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{product.model}</td>
                        <td className="px-3 py-2 text-center font-semibold">{product.quantity}</td>
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

export default DeliveredPage;