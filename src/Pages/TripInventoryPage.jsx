
// import React, { useEffect, useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import TripDetailsModal from "../Component/TripDetailsModal";

// const TripInventoryPage = () => {

//   const axiosSecure = useAxiosSecure();
//   const { searchText, setSearchText } = useSearch();

//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());

//   const [selectedTrip, setSelectedTrip] = useState(null);

//   // Column Filters
//   const [tripFilter, setTripFilter] = useState("");
//   const [vendorFilter, setVendorFilter] = useState("");
//   const [driverFilter, setDriverFilter] = useState("");
//   const [vehicleFilter, setVehicleFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [deliveryFilter, setDeliveryFilter] = useState("");
// const [challanFilter, setChallanFilter] = useState("");

//   // Fetch Deliveries
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

//   // Prepare Trips
//   const getTrips = () => {

//     return deliveries.map((t) => ({

//       tripNumber: t.tripNumber,
//       vendorName: t.vendorName,
//       vendorNumber: t.vendorNumber,
//       driverName: t.driverName,
//       driverNumber: t.driverNumber,
//       vehicleNumber: t.vehicleNumber,
//       totalChallan: t.totalChallan,
//       challanQty: t.totalChallan,
//       createdAt: t.createdAt,
//       status: "Delivered",
//       challans: t.challans,

//     }));

//   };

//   const tripRows = getTrips();

//   // Unique values
//   const getUniqueValues = (arr, field) => {

//     const map = new Map();

//     arr.forEach((item) => {

//       const value = item[field]?.toString().trim();

//       if (value) {

//         const key = value.toLowerCase();

//         if (!map.has(key)) map.set(key, value);

//       }

//     });

//     return Array.from(map.values()).sort((a, b) => a.localeCompare(b));

//   };

//   // Filtering Logic

//   const getFilteredRows = () => {

//   return tripRows.filter((t) => {

//     const s = searchText?.toLowerCase() || "";

//     const challans = t.challans || [];

//     const allDelivered =
//       challans.length > 0 &&
//       challans.every(c => c.deliveryStatus === "confirmed");

//     const allReceived =
//       challans.length > 0 &&
//       challans.every(c => c.challanReturnStatus === "received");

//     const matchesSearch =
//       !searchText ||
//       [
//         t.tripNumber,
//         t.vendorName,
//         t.driverName,
//         t.vehicleNumber
//       ].some((val) => val?.toLowerCase().includes(s));

//     const matchesMonthYear =
//       new Date(t.createdAt).getMonth() + 1 === month &&
//       new Date(t.createdAt).getFullYear() === year;

//     const matchesFilters =
//       (!tripFilter || t.tripNumber === tripFilter) &&
//       (!vendorFilter || t.vendorName === vendorFilter) &&
//       (!driverFilter || t.driverName === driverFilter) &&
//       (!vehicleFilter || t.vehicleNumber === vehicleFilter) &&
//       (!dateFilter ||
//         new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
//       (!deliveryFilter ||
//         (deliveryFilter === "delivered" && allDelivered) ||
//         (deliveryFilter === "notDelivered" && !allDelivered)) &&
//       (!challanFilter ||
//         (challanFilter === "received" && allReceived) ||
//         (challanFilter === "notReceived" && !allReceived));

//     return matchesMonthYear && matchesSearch && matchesFilters;

//   });

// };

//   const filteredRows = getFilteredRows();

//   // Reset All
//   const handleReset = () => {

//     setMonth(new Date().getMonth() + 1);
//     setYear(new Date().getFullYear());

//     setSearchText("");

//     setTripFilter("");
//     setVendorFilter("");
//     setDriverFilter("");
//     setVehicleFilter("");
//     setDateFilter("");
//     setDeliveryFilter("");
// setChallanFilter("");

//     Swal.fire({
//       toast: true,
//       position: "top-end",
//       icon: "success",
//       title: "Filters & Search Cleared",
//       showConfirmButton: false,
//       timer: 1500,
//     });

//   };

//   // Export Excel
//   const handleExportExcel = () => {

//     if (filteredRows.length === 0) {

//       Swal.fire("No Data", "Nothing to export", "warning");

//       return;

//     }

//     const exportData = filteredRows.map((t) => ({

//       Date: new Date(t.createdAt).toLocaleDateString(),
//       Trip: t.tripNumber,
//       Vendor: t.vendorName,
//       Driver: t.driverName,
//       Vehicle: t.vehicleNumber,
//       Challans: t.challanQty,
//       Status: t.status,

//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);

//     const wb = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(wb, ws, "Trips");

//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

//     const blob = new Blob([buffer], { type: "application/octet-stream" });

//     saveAs(blob, `TripInventory_${month}_${year}.xlsx`);

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
//               onClick={handleReset}
//               className="bg-red-500 text-white px-3 py-1 rounded"
//             >
//               Reset All
//             </button>

//           </div>

//           <h2 className="text-xl font-bold text-green-700">
//             Trip Inventory
//           </h2>

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

//             <thead className="sticky top-0 z-10">

//               <tr className="bg-green-600 text-white text-center">
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Trip Number</th>
//                 <th className="border p-2">Vendor</th>
//                 <th className="border p-2">Driver</th>
//                 <th className="border p-2">Vehicle</th>
//                 <th className="border p-2">Point</th>
//                 <th className="border p-2">Delivery</th>
//                 <th className="border p-2">Challan</th>
//                 <th className="border p-2">View</th>
//               </tr>

//               {/* Filters */}

//               <tr className="bg-green-50 text-center">

//                 <th className="border p-1">
//                   <input
//                     type="date"
//                     className="w-full border rounded text-xs p-1"
//                     value={dateFilter}
//                     onChange={(e) => setDateFilter(e.target.value)}
//                   />
//                 </th>

//                 <th className="border p-1">
//                   <select
//                     className="w-full border rounded text-xs p-1"
//                     value={tripFilter}
//                     onChange={(e) => setTripFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValues(filteredRows, "tripNumber").map(v => (
//                       <option key={v} value={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>

//                 <th className="border p-1">
//                   <select
//                     className="w-full border rounded text-xs p-1"
//                     value={vendorFilter}
//                     onChange={(e) => setVendorFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValues(filteredRows, "vendorName").map(v => (
//                       <option key={v} value={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>

//                 <th className="border p-1">
//                   <select
//                     className="w-full border rounded text-xs p-1"
//                     value={driverFilter}
//                     onChange={(e) => setDriverFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValues(filteredRows, "driverName").map(v => (
//                       <option key={v} value={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>

//                 <th className="border p-1">
//                   <select
//                     className="w-full border rounded text-xs p-1"
//                     value={vehicleFilter}
//                     onChange={(e) => setVehicleFilter(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {getUniqueValues(filteredRows, "vehicleNumber").map(v => (
//                       <option key={v} value={v}>{v}</option>
//                     ))}
//                   </select>
//                 </th>

//                 <th className="border"></th>

//                 {/* Delivery Filter */}
// <th className="border p-1">
// <select
//   className="w-full border rounded text-xs p-1"
//   value={deliveryFilter}
//   onChange={(e) => setDeliveryFilter(e.target.value)}
// >
//   <option value="">All</option>

//   {filteredRows.some(t =>
//     (t.challans || []).every(c => c.deliveryStatus === "confirmed")
//   ) && (
//     <option value="delivered">All Delivered</option>
//   )}

//   {filteredRows.some(t =>
//     !(t.challans || []).every(c => c.deliveryStatus === "confirmed")
//   ) && (
//     <option value="notDelivered">Not Delivered</option>
//   )}

// </select>
// </th>

// {/* Challan Filter */}
// <th className="border p-1">
// <select
//   className="w-full border rounded text-xs p-1"
//   value={challanFilter}
//   onChange={(e) => setChallanFilter(e.target.value)}
// >
//   <option value="">All</option>

//   {filteredRows.some(t =>
//     (t.challans || []).every(c => c.challanReturnStatus === "received")
//   ) && (
//     <option value="received">All Received</option>
//   )}

//   {filteredRows.some(t =>
//     !(t.challans || []).every(c => c.challanReturnStatus === "received")
//   ) && (
//     <option value="notReceived">Not Received</option>
//   )}

// </select>
// </th>

                
//                 <th className="border"></th>
//                 <th className="border"></th>
                

//               </tr>

//             </thead>

//             <tbody>

//               {filteredRows.map((t, i) => {

//                 const date = new Date(t.createdAt);
//                 const challans = t.challans || [];

//                 const allDelivered =
//                   challans.length > 0 &&
//                   challans.every(c => c.deliveryStatus === "confirmed");

//                 const allReceived =
//                   challans.length > 0 &&
//                   challans.every(c => c.challanReturnStatus === "received");

//                 return (

//                   <tr key={i} className="text-center even:bg-gray-50">

//                     <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
//                     <td className="border px-2 py-1 font-bold">{t.tripNumber}</td>
//                     <td className="border px-2 py-1">{t.vendorName}</td>
//                     <td className="border px-2 py-1">{t.driverName}</td>
//                     <td className="border px-2 py-1">{t.vehicleNumber}</td>
//                     <td className="border px-2 py-1">{t.challanQty}</td>

//                     <td className="border px-2 py-1">
//                       <span className={`px-2 py-1 rounded text-xs ${allDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                         {allDelivered ? "All Delivered" : "Not Delivered"}
//                       </span>
//                     </td>

//                     <td className="border px-2 py-1">
//                       <span className={`px-2 py-1 rounded text-xs ${allReceived ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                         {allReceived ? "All Received" : "Not Received"}
//                       </span>
//                     </td>

//                     <td className="border px-2 py-1">
//                       <button
//                         onClick={() => setSelectedTrip(t)}
//                         className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
//                       >
//                         View
//                       </button>
//                     </td>

//                   </tr>

//                 );

//               })}

//             </tbody>

//           </table>

//         )}

//       </div>

//       <TripDetailsModal
//         selectedTrip={selectedTrip}
//         setSelectedTrip={setSelectedTrip}
//       />

//     </div>

//   );

// };

// export default TripInventoryPage;

import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import TripDetailsModal from "../Component/TripDetailsModal";
import Pagination from "../Component/Pagination";
import LoadingSpinner from "../Component/LoadingSpinner";

const TripInventoryPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [tripFilter, setTripFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [challanFilter, setChallanFilter] = useState("");

  const fetchDeliveries = async (m, y, search, page = 1) => {
    setLoading(true);
    try {
      let url = `/deliveries?month=${m}&year=${y}&page=${page}&limit=50`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error(err);
    }
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

  const getTrips = () => {
    return deliveries.map((t) => ({
      tripNumber: t.tripNumber,
      vendorName: t.vendorName,
      vendorNumber: t.vendorNumber,
      driverName: t.driverName,
      driverNumber: t.driverNumber,
      vehicleNumber: t.vehicleNumber,
      totalChallan: t.totalChallan,
      challanQty: t.totalChallan,
      createdAt: t.createdAt,
      status: "Delivered",
      challans: t.challans,
    }));
  };

  const tripRows = getTrips();

  const getUniqueValues = (arr, field) => {
    const map = new Map();
    arr.forEach((item) => {
      const value = item[field]?.toString().trim();
      if (value) {
        const key = value.toLowerCase();
        if (!map.has(key)) map.set(key, value);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const getFilteredRows = () => {
    return tripRows.filter((t) => {
      const s = searchText?.toLowerCase() || "";
      const challans = t.challans || [];

      const allDelivered = challans.length > 0 && challans.every((c) => c.deliveryStatus === "confirmed");
      const allReceived = challans.length > 0 && challans.every((c) => c.challanReturnStatus === "received");

      const matchesSearch =
        !searchText ||
        [t.tripNumber, t.vendorName, t.driverName, t.vehicleNumber].some(
          (val) => val?.toLowerCase().includes(s)
        );

      const matchesFilters =
        (!tripFilter || t.tripNumber === tripFilter) &&
        (!vendorFilter || t.vendorName === vendorFilter) &&
        (!driverFilter || t.driverName === driverFilter) &&
        (!vehicleFilter || t.vehicleNumber === vehicleFilter) &&
        (!dateFilter || new Date(t.createdAt).toISOString().slice(0, 10) === dateFilter) &&
        (!deliveryFilter ||
          (deliveryFilter === "delivered" && allDelivered) ||
          (deliveryFilter === "notDelivered" && !allDelivered)) &&
        (!challanFilter ||
          (challanFilter === "received" && allReceived) ||
          (challanFilter === "notReceived" && !allReceived));

      return matchesSearch && matchesFilters;
    });
  };

  const filteredRows = getFilteredRows();

  const handleReset = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setCurrentPage(1);
    setSearchText("");
    setTripFilter("");
    setVendorFilter("");
    setDriverFilter("");
    setVehicleFilter("");
    setDateFilter("");
    setDeliveryFilter("");
    setChallanFilter("");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Filters & Search Cleared",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // ── Excel Export — filtered অথবা full month ───────────────────
  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `
        <div style="text-align:left; padding: 8px 0;">
          <p style="font-size:13px; color:#6b7280; margin-bottom:12px">কোন data export করতে চাও?</p>
          <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px; cursor:pointer; font-size:14px;">
            <input type="radio" name="exportType" value="filtered" checked style="accent-color:#16a34a">
            <span><b>Filtered data</b> — এখন UI তে যা দেখাচ্ছে (${filteredRows.length} rows)</span>
          </label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px;">
            <input type="radio" name="exportType" value="full">
            <span><b>Full month data</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year} এর সব data</span>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Export",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        return document.querySelector('input[name="exportType"]:checked')?.value || "filtered";
      }
    });

    if (!exportType) return;

    try {
      let exportData = [];

      if (exportType === "filtered") {
        if (filteredRows.length === 0) {
          return Swal.fire({ icon: "warning", title: "No Data", text: "Filter এ কোনো data নেই!" });
        }
        exportData = filteredRows.map((t) => ({
          Date: new Date(t.createdAt).toLocaleDateString(),
          Trip: t.tripNumber,
          Vendor: t.vendorName,
          "Vendor Number": t.vendorNumber || "",
          Driver: t.driverName,
          "Driver Number": t.driverNumber || "",
          Vehicle: t.vehicleNumber,
          Points: t.challanQty,
          "Delivery Status": (t.challans || []).every((c) => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
          "Challan Status": (t.challans || []).every((c) => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
        }));

      } else {
        Swal.fire({
          title: "Fetching data...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const url = `/deliveries?month=${month}&year=${year}&page=1&limit=5000`;
        const res = await axiosSecure.get(url);
        const allData = res.data.data || [];

        exportData = allData.map((t) => ({
          Date: new Date(t.createdAt).toLocaleDateString(),
          Trip: t.tripNumber,
          Vendor: t.vendorName,
          "Vendor Number": t.vendorNumber || "",
          Driver: t.driverName,
          "Driver Number": t.driverNumber || "",
          Vehicle: t.vehicleNumber,
          Points: t.totalChallan,
          "Delivery Status": (t.challans || []).every((c) => c.deliveryStatus === "confirmed") ? "All Delivered" : "Not Delivered",
          "Challan Status": (t.challans || []).every((c) => c.challanReturnStatus === "received") ? "All Received" : "Not Received",
        }));

        if (exportData.length === 0) {
          return Swal.fire({ icon: "warning", title: "No Data", text: "এই মাসে কোনো data নেই!" });
        }

        Swal.close();
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Trips");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileName = exportType === "filtered"
        ? `TripInventory_Filtered_${month}_${year}.xlsx`
        : `TripInventory_Full_${month}_${year}.xlsx`;
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);

      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows exported.`, timer: 2000, showConfirmButton: false });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Export failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <select className="border px-2 py-1 rounded" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <input type="number" className="border px-2 py-1 rounded w-24" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
            <button onClick={handleReset} className="bg-red-500 text-white px-3 py-1 rounded">Reset All</button>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-green-700">Trip Inventory</h2>
            {pagination && (
              <p className="text-xs text-gray-500 mt-1">
                Total: <span className="font-bold text-green-700">{pagination.total}</span> trips
              </p>
            )}
          </div>

          <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
            Export Excel
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-green-600 text-white text-center">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Trip Number</th>
                  <th className="border p-2">Vendor</th>
                  <th className="border p-2">Driver</th>
                  <th className="border p-2">Vehicle</th>
                  <th className="border p-2">Point</th>
                  <th className="border p-2">Delivery</th>
                  <th className="border p-2">Challan</th>
                  <th className="border p-2">View</th>
                </tr>

                <tr className="bg-green-50 text-center">
                  <th className="border p-1">
                    <input type="date" className="w-full border rounded text-xs p-1" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                  </th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={tripFilter} onChange={(e) => setTripFilter(e.target.value)}>
                      <option value="">All</option>
                      {getUniqueValues(filteredRows, "tripNumber").map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
                      <option value="">All</option>
                      {getUniqueValues(filteredRows, "vendorName").map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
                      <option value="">All</option>
                      {getUniqueValues(filteredRows, "driverName").map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                      <option value="">All</option>
                      {getUniqueValues(filteredRows, "vehicleNumber").map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="border"></th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
                      <option value="">All</option>
                      {filteredRows.some((t) => (t.challans || []).every((c) => c.deliveryStatus === "confirmed")) && <option value="delivered">All Delivered</option>}
                      {filteredRows.some((t) => !(t.challans || []).every((c) => c.deliveryStatus === "confirmed")) && <option value="notDelivered">Not Delivered</option>}
                    </select>
                  </th>
                  <th className="border p-1">
                    <select className="w-full border rounded text-xs p-1" value={challanFilter} onChange={(e) => setChallanFilter(e.target.value)}>
                      <option value="">All</option>
                      {filteredRows.some((t) => (t.challans || []).every((c) => c.challanReturnStatus === "received")) && <option value="received">All Received</option>}
                      {filteredRows.some((t) => !(t.challans || []).every((c) => c.challanReturnStatus === "received")) && <option value="notReceived">Not Received</option>}
                    </select>
                  </th>
                  <th className="border"></th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((t, i) => {
                  const date = new Date(t.createdAt);
                  const challans = t.challans || [];
                  const allDelivered = challans.length > 0 && challans.every((c) => c.deliveryStatus === "confirmed");
                  const allReceived = challans.length > 0 && challans.every((c) => c.challanReturnStatus === "received");

                  return (
                    <tr key={i} className="text-center even:bg-gray-50">
                      <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
                      <td className="border px-2 py-1 font-bold">{t.tripNumber}</td>
                      <td className="border px-2 py-1">{t.vendorName}</td>
                      <td className="border px-2 py-1">{t.driverName}</td>
                      <td className="border px-2 py-1">{t.vehicleNumber}</td>
                      <td className="border px-2 py-1">{t.challanQty}</td>
                      <td className="border px-2 py-1">
                        <span className={`px-2 py-1 rounded text-xs ${allDelivered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {allDelivered ? "All Delivered" : "Not Delivered"}
                        </span>
                      </td>
                      <td className="border px-2 py-1">
                        <span className={`px-2 py-1 rounded text-xs ${allReceived ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {allReceived ? "All Received" : "Not Received"}
                        </span>
                      </td>
                      <td className="border px-2 py-1">
                        <button onClick={() => setSelectedTrip(t)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      <TripDetailsModal selectedTrip={selectedTrip} setSelectedTrip={setSelectedTrip} />
    </div>
  );
};

export default TripInventoryPage;