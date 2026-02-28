

// import React, { useEffect, useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import ActionDropdown from "../Component/ActionDropdown";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import useRole from "../hooks/useRole";
// import Swal from "sweetalert2";

// const AllGatePass = () => {
//     const axiosSecure = useAxiosSecure();
//     const [gatePasses, setGatePasses] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const { searchText } = useSearch();
//     const { role } = useRole();

//     // Filters state
//     const [tripDoFilter, setTripDoFilter] = useState("");
//     const [customerFilter, setCustomerFilter] = useState("");
//     const [csdFilter, setCsdFilter] = useState("");
//     const [unitFilter, setUnitFilter] = useState(""); // ⭐ Added Unit Filter
//     const [vehicleFilter, setVehicleFilter] = useState("");
//     const [zoneFilter, setZoneFilter] = useState("");
//     const [productFilter, setProductFilter] = useState("");
//     const [modelFilter, setModelFilter] = useState("");
//     const [userFilter, setUserFilter] = useState("");
//     const [tripDateFilter, setTripDateFilter] = useState("");

//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());

//     const fetchGatePasses = async (m, y, search) => {
//         setLoading(true);
//         try {
//             let url = `/gate-pass?month=${m}&year=${y}`;
//             if (search) url += `&search=${search}`;
//             const res = await axiosSecure.get(url);
//             setGatePasses(res.data.data || []);
//         } catch (err) {
//             console.error(err);
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchGatePasses(month, year, searchText);
//     }, [month, year, searchText]);

//     const getUniqueValues = (arr, field) => {
//         const values = arr.flatMap((gp) => {
//             if (field === "productName" || field === "model") {
//                 return gp.products?.map((p) => p[field]) || [];
//             }
//             return gp[field] ? [gp[field]] : [];
//         });
//         return [...new Set(values)];
//     };

//     // --- ⭐ Filter Logic Update ⭐ ---
//     const getFilteredData = () => {
//         const rows = [];
//         gatePasses.forEach((gp) => {
//             gp.products?.forEach((p) => {
//                 const s = searchText.toLowerCase();
//                 const matchesSearch = !searchText || 
//                     [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model]
//                     .some(val => val?.toLowerCase().includes(s));

//                 const matchesFilters = 
//                     (!tripDoFilter || gp.tripDo === tripDoFilter) &&
//                     (!customerFilter || gp.customerName === customerFilter) &&
//                     (!csdFilter || gp.csd === csdFilter) &&
//                     (!unitFilter || gp.unit === unitFilter) && // ⭐ Unit Filter Logic
//                     (!vehicleFilter || gp.vehicleNo === vehicleFilter) &&
//                     (!zoneFilter || gp.zone === zoneFilter) &&
//                     (!productFilter || p.productName === productFilter) &&
//                     (!modelFilter || p.model === modelFilter) &&
//                     (!userFilter || gp.currentUser === userFilter) &&
//                     (!tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter);

//                 if (matchesSearch && matchesFilters) {
//                     rows.push({ gp, p });
//                 }
//             });
//         });
//         return rows;
//     };

//     const filteredRows = getFilteredData();
//     const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

//     const handleExportExcel = () => {
//         if (filteredRows.length === 0) {
//             Swal.fire("No Data", "No data available to export", "warning");
//             return;
//         }

//         Swal.fire({
//             title: "Export Excel?",
//             text: `You are going to export ${filteredRows.length} rows`,
//             icon: "question",
//             showCancelButton: true,
//             confirmButtonColor: "#16a34a",
//             confirmButtonText: "Yes, Export",
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 const exportData = filteredRows.map(({ gp, p }) => ({
//                     "Trip Do": gp.tripDo,
//                     "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "",
//                     Customer: gp.customerName,
//                     CSD: gp.csd,
//                     Unit: gp.unit || "", // ⭐ Added to Excel
//                     "Vehicle No": gp.vehicleNo,
//                     Zone: gp.zone,
//                     Product: p.productName,
//                     Model: p.model,
//                     Qty: p.quantity,
//                     User: gp.currentUser,
//                 }));

//                 const ws = XLSX.utils.json_to_sheet(exportData);
//                 const wb = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(wb, ws, "GatePass");
//                 const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//                 const blob = new Blob([buffer], { type: "application/octet-stream" });
//                 saveAs(blob, `GatePass_${month}_${year}.xlsx`);
//                 Swal.fire("Exported!", "Excel file downloaded successfully", "success");
//             }
//         });
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-4">
//             <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
                
//                 {/* Header Section */}
//                 <div className="relative flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mb-6">
//                     <div className="flex flex-wrap gap-2 w-full sm:w-auto">
//                         <select className="border px-2 py-1 rounded" value={month} onChange={(e) => setMonth(e.target.value)}>
//                             {[...Array(12)].map((_, i) => (
//                                 <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//                             ))}
//                         </select>
//                         <input type="number" className="border px-2 py-1 rounded w-24" value={year} onChange={(e) => setYear(e.target.value)} />
//                         <button onClick={() => { 
//                             setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
//                             setTripDoFilter(""); setCustomerFilter(""); setCsdFilter(""); setUnitFilter(""); 
//                             setVehicleFilter(""); setZoneFilter(""); setProductFilter(""); setModelFilter(""); 
//                             setUserFilter(""); setTripDateFilter("");
//                         }} className="bg-red-400 text-white px-3 py-1 rounded">Reset</button>
//                         {role === "admin" && (
//                             <button onClick={handleExportExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export</button>
//                         )}
//                     </div>
//                     <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-xl md:text-2xl font-bold text-center w-full sm:w-auto text-green-700">Gate Pass Inventory</h2>
//                 </div>

//                 {loading ? (
//                     <div className="text-center py-6">Loading...</div>
//                 ) : filteredRows.length === 0 ? (
//                     <div className="text-center py-6">No gate pass found.</div>
//                 ) : (
//                     <table className="w-full border-collapse text-sm">
//                         <thead className="sticky top-0 z-10">
//                             <tr className="bg-green-600 text-white text-center [&>th]:border [&>th]:border-gray-300">
//                                 <th className="px-3 py-2 whitespace-nowrap">Trip Do</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Trip Date</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Customer</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">CSD</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Unit</th> {/* ⭐ Unit Header */}
//                                 <th className="px-3 py-2 whitespace-nowrap">Vehicle No</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Zone</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Product</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Model</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Qty</th>
//                                 <th className="px-3 py-2 whitespace-nowrap">Action</th>
//                             </tr>

//                             {/* Filters Row */}
//                             <tr className="bg-green-100 text-center">
//                                 <th className="border p-1"><select className="w-full border rounded" value={tripDoFilter} onChange={(e) => setTripDoFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "tripDo").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                                 <th className="border p-1"><input type="date" className="w-full border rounded text-xs" value={tripDateFilter} onChange={(e) => setTripDateFilter(e.target.value)} /></th>
//                                 <th className="border p-1"><select className="w-full border rounded" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "customerName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                                 <th className="border p-1"><select className="w-full border rounded" value={csdFilter} onChange={(e) => setCsdFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "csd").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                
//                                 {/* ⭐ Unit Filter Row ⭐ */}
//                                 <th className="border p-1"><select className="w-full border rounded" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "unit").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                
//                                 <th className="border p-1"><select className="w-full border rounded" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "vehicleNo").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                                 <th className="border p-1"><select className="w-full border rounded" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "zone").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                                 <th className="border p-1"><select className="w-full border rounded" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "productName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                                 <th className="border p-1"><select className="w-full border rounded" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "model").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                
//                                 <th className="border p-1 bg-white text-blue-700 font-bold text-base leading-none">
//                                    {totalQty}
//                                 </th>

//                                 <th className="border p-1"><select className="w-full border rounded" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "currentUser").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {filteredRows.map(({ gp, p }, idx) => (
//                                 <tr key={`${gp._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition">
//                                     <td className="border px-2 py-1">{gp.tripDo}</td>
//                                     <td className="border px-2 py-1">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "-"}</td>
//                                     <td className="border px-2 py-1">{gp.customerName}</td>
//                                     <td className="border px-2 py-1">{gp.csd}</td>
//                                     <td className="border px-2 py-1 font-medium text-gray-600">{gp.unit || "-"}</td> {/* ⭐ Unit Data */}
//                                     <td className="border px-2 py-1">{gp.vehicleNo}</td>
//                                     <td className="border px-2 py-1">{gp.zone}</td>
//                                     <td className="border px-2 py-1">{p.productName}</td>
//                                     <td className="border px-2 py-1">{p.model}</td>
//                                     <td className="border px-2 py-1 font-semibold">{p.quantity}</td>
//                                     <td className="border px-2 py-1">
//                                         <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser}/>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AllGatePass;



import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import ActionDropdown from "../Component/ActionDropdown";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";

const AllGatePass = () => {
    const axiosSecure = useAxiosSecure();
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // ⭐ setSearchText pull kora holo global search reset korar jonno
    const { searchText, setSearchText } = useSearch(); 
    const { role } = useRole();

    // Filters state
    const [tripDoFilter, setTripDoFilter] = useState("");
    const [customerFilter, setCustomerFilter] = useState("");
    const [csdFilter, setCsdFilter] = useState("");
    const [unitFilter, setUnitFilter] = useState(""); 
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [zoneFilter, setZoneFilter] = useState("");
    const [productFilter, setProductFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [tripDateFilter, setTripDateFilter] = useState("");

    // Date States
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchGatePasses = async (m, y, search) => {
        setLoading(true);
        try {
            let url = `/gate-pass?month=${m}&year=${y}`;
            if (search) url += `&search=${search}`;
            const res = await axiosSecure.get(url);
            setGatePasses(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGatePasses(month, year, searchText);
    }, [month, year, searchText]);

    // ⭐ Full Reset Function
    const handleResetAll = () => {
        // 1. Reset Date to Current
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());

        // 2. Reset Global Search Text
        if (setSearchText) setSearchText("");

        // 3. Reset All Column Filters
        setTripDoFilter("");
        setCustomerFilter("");
        setCsdFilter("");
        setUnitFilter("");
        setVehicleFilter("");
        setZoneFilter("");
        setProductFilter("");
        setModelFilter("");
        setUserFilter("");
        setTripDateFilter("");

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Filters & Search Cleared',
            showConfirmButton: false,
            timer: 1500
        });
    };

    const getUniqueValues = (arr, field) => {
        const values = arr.flatMap((gp) => {
            if (field === "productName" || field === "model") {
                return gp.products?.map((p) => p[field]) || [];
            }
            return gp[field] ? [gp[field]] : [];
        });
        return [...new Set(values)];
    };

    const getFilteredData = () => {
        const rows = [];
        gatePasses.forEach((gp) => {
            gp.products?.forEach((p) => {
                const s = searchText ? searchText.toLowerCase() : "";
                const matchesSearch = !searchText || 
                    [gp.tripDo, gp.customerName, gp.csd, gp.unit, gp.vehicleNo, gp.zone, gp.currentUser, p.productName, p.model]
                    .some(val => val?.toLowerCase().includes(s));

                const matchesFilters = 
                    (!tripDoFilter || gp.tripDo === tripDoFilter) &&
                    (!customerFilter || gp.customerName === customerFilter) &&
                    (!csdFilter || gp.csd === csdFilter) &&
                    (!unitFilter || gp.unit === unitFilter) && 
                    (!vehicleFilter || gp.vehicleNo === vehicleFilter) &&
                    (!zoneFilter || gp.zone === zoneFilter) &&
                    (!productFilter || p.productName === productFilter) &&
                    (!modelFilter || p.model === modelFilter) &&
                    (!userFilter || gp.currentUser === userFilter) &&
                    (!tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter);

                if (matchesSearch && matchesFilters) {
                    rows.push({ gp, p });
                }
            });
        });
        return rows;
    };

    const filteredRows = getFilteredData();
    const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "No Data",
            text: "No data available to export!",
            confirmButtonColor: "#16a34a",
        });
        return;
    }

    // ⭐ Export Confirmation Alert
    Swal.fire({
        title: "Export to Excel?",
        text: `You are about to export ${filteredRows.length} rows of data.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Export it!",
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                const exportData = filteredRows.map(({ gp, p }) => ({
                    "Trip Do": gp.tripDo,
                    "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "",
                    Customer: gp.customerName,
                    CSD: gp.csd,
                    Unit: gp.unit || "",
                    "Vehicle No": gp.vehicleNo,
                    Zone: gp.zone,
                    Product: p.productName,
                    Model: p.model,
                    Qty: p.quantity,
                    User: gp.currentUser,
                }));

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "GatePass");
                const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const blob = new Blob([buffer], { type: "application/octet-stream" });
                saveAs(blob, `GatePass_${month}_${year}.xlsx`);

                // ⭐ Success Alert after download
                Swal.fire({
                    icon: "success",
                    title: "Exported!",
                    text: "Your Excel file has been downloaded successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire("Error", "Something went wrong during export", "error");
            }
        }
    });
};
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
                
                {/* Header Section */}
                <div className="relative flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mb-6">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <select className="border px-2 py-1 rounded bg-white shadow-sm" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                            ))}
                        </select>
                        <input type="number" className="border px-2 py-1 rounded w-24 bg-white shadow-sm" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                        
                        {/* ⭐ Updated Reset Button */}
                        <button 
                            onClick={handleResetAll} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition-all"
                        >
                            Reset All
                        </button>

                        {role === "admin" && (
                            <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm transition-all">
                                Export
                            </button>
                        )}
                    </div>
                    <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-xl md:text-2xl font-bold text-center w-full sm:w-auto text-green-700">
                        Gate Pass Inventory
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-10 font-medium text-green-600">Loading Data...</div>
                ) : filteredRows.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic border rounded-lg">No gate pass found.</div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-green-600 text-white text-center">
                                <th className="border p-2 whitespace-nowrap">Trip Do</th>
                                <th className="border p-2 whitespace-nowrap">Trip Date</th>
                                <th className="border p-2 whitespace-nowrap">Customer</th>
                                <th className="border p-2 whitespace-nowrap">CSD</th>
                                <th className="border p-2 whitespace-nowrap">Unit</th>
                                <th className="border p-2 whitespace-nowrap">Vehicle No</th>
                                <th className="border p-2 whitespace-nowrap">Zone</th>
                                <th className="border p-2 whitespace-nowrap">Product</th>
                                <th className="border p-2 whitespace-nowrap">Model</th>
                                <th className="border p-2 whitespace-nowrap">Qty</th>
                                <th className="border p-2 whitespace-nowrap">Action</th>
                            </tr>

                            {/* Filters Row */}
                            <tr className="bg-green-50 text-center">
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={tripDoFilter} onChange={(e) => setTripDoFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "tripDo").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><input type="date" className="w-full border rounded text-[10px] p-1" value={tripDateFilter} onChange={(e) => setTripDateFilter(e.target.value)} /></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "customerName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={csdFilter} onChange={(e) => setCsdFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "csd").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "unit").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "vehicleNo").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "zone").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "productName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}><option value="">All</option>{getUniqueValues(gatePasses, "model").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1 bg-white text-blue-700 font-bold">{totalQty}</th>
                                <th className="border p-1 bg-white"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRows.map(({ gp, p }, idx) => (
                                <tr key={`${gp._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition-colors">
                                    <td className="border px-2 py-1">{gp.tripDo}</td>
                                    <td className="border px-2 py-1 whitespace-nowrap">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "-"}</td>
                                    <td className="border px-2 py-1 font-medium">{gp.customerName}</td>
                                    <td className="border px-2 py-1">{gp.csd}</td>
                                    <td className="border px-2 py-1 text-gray-600">{gp.unit || "-"}</td>
                                    <td className="border px-2 py-1">{gp.vehicleNo}</td>
                                    <td className="border px-2 py-1">{gp.zone}</td>
                                    <td className="border px-2 py-1">{p.productName}</td>
                                    <td className="border px-2 py-1">{p.model}</td>
                                    <td className="border px-2 py-1 font-bold text-green-700">{p.quantity}</td>
                                    <td className="border px-2 py-1">
                                        <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser}/>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AllGatePass;

