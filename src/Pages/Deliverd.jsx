

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

//   // Reset All Filters
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

//   // Flatten & Filter Data
//   const getFilteredData = () => {
//     const rows = [];

//     deliveries.forEach((trip) => {
//       trip.challans?.forEach((challan) => {
//         const challanDate = new Date(trip.createdAt);
//         const cMonth = challanDate.getMonth() + 1;
//         const cYear = challanDate.getFullYear();

//         if (cMonth !== month || cYear !== year) return;

//         challan.products?.forEach((product) => {
//           const s = searchText ? searchText.toLowerCase() : "";

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
//             rows.push({
//               trip,
//               challan,
//               product,
//               date: challanDate,
//             });
//           }
//         });
//       });
//     });

//     return rows;
//   };

//   const filteredRows = getFilteredData();
//   const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.product.quantity) || 0), 0);

//   // Get unique values from filtered rows (for dropdown)
//   const getUniqueValuesFromRows = (rows, field) => {
//     const map = new Map();
//     rows.forEach(({ challan, product }) => {
//       let val;
//       if (field === "productName" || field === "model") {
//         val = product[field]?.toString().trim();
//       } else {
//         val = challan[field]?.toString().trim();
//       }
//       if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
//     });
//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
//   };

//   // Export Excel
//   const handleExportExcel = () => {
//     if (filteredRows.length === 0) {
//       Swal.fire("No Data", "No data available to export!", "warning");
//       return;
//     }

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
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     saveAs(blob, `Delivered_${month}_${year}.xlsx`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
//           <div className="flex gap-2">
//             <select
//               className="border px-2 py-1 rounded"
//               value={month}
//               onChange={(e) => setMonth(parseInt(e.target.value))}
//             >
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>
//                   {new Date(0, i).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="number"
//               className="border px-2 py-1 rounded w-24"
//               value={year}
//               onChange={(e) => setYear(parseInt(e.target.value))}
//             />

//             <button
//               onClick={handleResetAll}
//               className="bg-red-500 text-white px-3 py-1 rounded"
//             >
//               Reset
//             </button>
//           </div>

//           <h2 className="text-xl font-bold text-green-700">Delivered Orders</h2>

//           <button
//             onClick={handleExportExcel}
//             className="bg-green-600 text-white px-3 py-1 rounded"
//           >
//             Export Excel
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : (
//           <table className="w-full border-collapse text-sm">
//             <thead className="bg-green-600 text-white text-center">
//               <tr>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Customer</th>
//                 <th className="border p-2">Zone</th>
//                 <th className="border p-2">Address</th>
//                 <th className="border p-2">Receiver</th>
//                 <th className="border p-2">District</th>
//                 <th className="border p-2">Thana</th>
//                 <th className="border p-2">Product</th>
//                 <th className="border p-2">Model</th>
//                 <th className="border p-2">Qty</th>
//               </tr>

//               {/* Filters row */}
//               <tr className="bg-white text-black text-center">
//                 <th className="border p-1">
//                   <input
//                     type="date"
//                     className="w-full border text-xs p-1"
//                     value={dateFilter}
//                     onChange={(e) => setDateFilter(e.target.value)}
//                   />
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={customerFilter}
//                     onChange={(e) => setCustomerFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "customerName").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={zoneFilter}
//                     onChange={(e) => setZoneFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "zone").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={addressFilter}
//                     onChange={(e) => setAddressFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "address").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={receiverFilter}
//                     onChange={(e) => setReceiverFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "receiverNumber").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={districtFilter}
//                     onChange={(e) => setDistrictFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "district").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={thanaFilter}
//                     onChange={(e) => setThanaFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "thana").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={productFilter}
//                     onChange={(e) => setProductFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "productName").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1">
//                   <select
//                     className="w-full border text-xs p-1"
//                     value={modelFilter}
//                     onChange={(e) => setModelFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValuesFromRows(filteredRows, "model").map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="border p-1 font-bold">{totalQty}</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredRows.map(({ trip, challan, product, date }, idx) => (
//                 <tr key={idx} className="text-center even:bg-gray-50">
//                   <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
//                   <td className="border px-2 py-1">{challan.customerName}</td>
//                   <td className="border px-2 py-1">{challan.zone}</td>
//                   <td
//                     className="border px-1 py-1 w-20 max-w-75 truncate cursor-help"
//                     title={challan.address}
//                   >
//                     {challan.address}
//                   </td>
//                   <td className="border px-2 py-1">{challan.receiverNumber}</td>
//                   <td className="border px-2 py-1">{challan.district}</td>
//                   <td className="border px-2 py-1">{challan.thana}</td>
//                   <td className="border px-2 py-1">{product.productName || "-"}</td>
//                   <td className="border px-2 py-1">{product.model}</td>
//                   <td className="border px-2 py-1 font-bold">{product.quantity}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeliveredPage;





import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

const DeliveredPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [customerFilter, setCustomerFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [thanaFilter, setThanaFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [receiverFilter, setReceiverFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch deliveries
  const fetchDeliveries = async (m, y, search) => {
    setLoading(true);
    try {
      let url = `/deliveries?month=${m}&year=${y}`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveries(month, year, searchText);
  }, [month, year, searchText]);

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setSearchText("");
    setCustomerFilter("");
    setZoneFilter("");
    setDistrictFilter("");
    setThanaFilter("");
    setProductFilter("");
    setModelFilter("");
    setAddressFilter("");
    setReceiverFilter("");
    setDateFilter("");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Filters & Search Cleared",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Filter & flatten data
  const getFilteredData = () => {
    const rows = [];
    deliveries.forEach((trip) => {
      trip.challans?.forEach((challan) => {
        const challanDate = new Date(trip.createdAt);
        if (challanDate.getMonth() + 1 !== month || challanDate.getFullYear() !== year) return;

        challan.products?.forEach((product) => {
          const s = searchText?.toLowerCase() || "";

          const matchesSearch =
            !searchText ||
            [
              challan.customerName,
              challan.zone,
              challan.address,
              challan.receiverNumber,
              challan.district,
              challan.thana,
              product.productName,
              product.model,
              product.quantity?.toString(),
              challanDate.toLocaleDateString(),
            ].some((val) => val?.toString().toLowerCase().includes(s));

          const matchesFilters =
            (!dateFilter || challanDate.toISOString().slice(0, 10) === dateFilter) &&
            (!customerFilter || challan.customerName?.toLowerCase() === customerFilter.toLowerCase()) &&
            (!zoneFilter || challan.zone?.toLowerCase() === zoneFilter.toLowerCase()) &&
            (!addressFilter || challan.address?.toLowerCase() === addressFilter.toLowerCase()) &&
            (!receiverFilter || challan.receiverNumber?.toLowerCase() === receiverFilter.toLowerCase()) &&
            (!districtFilter || challan.district?.toLowerCase() === districtFilter.toLowerCase()) &&
            (!thanaFilter || challan.thana?.toLowerCase() === thanaFilter.toLowerCase()) &&
            (!productFilter || product.productName?.toLowerCase() === productFilter.toLowerCase()) &&
            (!modelFilter || product.model?.toLowerCase() === modelFilter.toLowerCase());

          if (matchesSearch && matchesFilters) {
            rows.push({ trip, challan, product, date: challanDate });
          }
        });
      });
    });
    return rows;
  };

  const filteredRows = getFilteredData();
  const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.product.quantity) || 0), 0);

  const getUniqueValuesFromRows = (rows, field) => {
    const map = new Map();
    rows.forEach(({ challan, product }) => {
      let val = field === "productName" || field === "model" ? product[field]?.trim() : challan[field]?.trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const handleExportExcel = () => {
    if (!filteredRows.length) return Swal.fire("No Data", "No data available to export!", "warning");

    const exportData = filteredRows.map(({ challan, product, date }) => ({
      Date: date.toLocaleDateString(),
      Customer: challan.customerName,
      Zone: challan.zone,
      Address: challan.address,
      "Receiver Number": challan.receiverNumber,
      District: challan.district,
      Thana: challan.thana,
      Product: product.productName,
      Model: product.model,
      Qty: product.quantity,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Delivered_${month}_${year}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <select className="border px-2 py-1 rounded" value={month} onChange={(e) => setMonth(+e.target.value)}>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="border px-2 py-1 rounded w-20"
              value={year}
              onChange={(e) => setYear(+e.target.value)}
            />

            <button onClick={handleResetAll} className="bg-red-500 text-white px-3 py-1 rounded">
              Reset
            </button>
          </div>

          <h2 className="text-xl font-bold text-green-700">Delivered Orders</h2>

          <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
            Export Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[900px]">
              <thead className="bg-green-600 text-white text-center sticky top-0">
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Zone</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">Receiver</th>
                  <th className="border p-2">District</th>
                  <th className="border p-2">Thana</th>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Model</th>
                  <th className="border p-2">Qty</th>
                </tr>

                {/* Filters row */}
                <tr className="bg-white text-black text-center">
                  <th className="border p-1">
                    <input
                      type="date"
                      className="w-full border text-xs p-1"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </th>
                  {["customerName", "zone", "address", "receiverNumber", "district", "thana", "productName", "model"].map((f, i) => (
                    <th key={i} className="border p-1">
                      <select
                        className="w-full border text-xs p-1"
                        value={{
                          customerName: customerFilter,
                          zone: zoneFilter,
                          address: addressFilter,
                          receiverNumber: receiverFilter,
                          district: districtFilter,
                          thana: thanaFilter,
                          productName: productFilter,
                          model: modelFilter,
                        }[f]}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (f === "customerName") setCustomerFilter(val);
                          else if (f === "zone") setZoneFilter(val);
                          else if (f === "address") setAddressFilter(val);
                          else if (f === "receiverNumber") setReceiverFilter(val);
                          else if (f === "district") setDistrictFilter(val);
                          else if (f === "thana") setThanaFilter(val);
                          else if (f === "productName") setProductFilter(val);
                          else if (f === "model") setModelFilter(val);
                        }}
                      >
                        <option value="">All</option>
                        {getUniqueValuesFromRows(filteredRows, f).map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </th>
                  ))}
                  <th className="border p-1 font-bold">{totalQty}</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map(({ trip, challan, product, date }, idx) => (
                  <tr key={idx} className="text-center even:bg-gray-50">
                    <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.customerName}>
                      {challan.customerName}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[80px]" title={challan.zone}>
                      {challan.zone}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[120px]" title={challan.address}>
                      {challan.address}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.receiverNumber}>
                      {challan.receiverNumber}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.district}>
                      {challan.district}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={challan.thana}>
                      {challan.thana}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={product.productName}>
                      {product.productName}
                    </td>
                    <td className="border px-2 py-1 truncate max-w-[100px]" title={product.model}>
                      {product.model}
                    </td>
                    <td className="border px-2 py-1 font-bold">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveredPage;