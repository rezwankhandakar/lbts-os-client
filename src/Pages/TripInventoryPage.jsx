// import React, { useEffect, useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import Swal from "sweetalert2";
// import TripDetailsModal from "../Component/TripDetailsModal";

// const TripInventoryPage = () => {

//     const axiosSecure = useAxiosSecure();
//     const { searchText, setSearchText } = useSearch();

//     const [deliveries, setDeliveries] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());

//     const [selectedTrip, setSelectedTrip] = useState(null);

//     // Fetch
//     const fetchDeliveries = async (m, y, search) => {

//         setLoading(true);

//         try {

//             let url = `/deliveries?month=${m}&year=${y}`;

//             if (search) url += `&search=${search}`;

//             const res = await axiosSecure.get(url);

//             setDeliveries(res.data.data || []);

//         } catch (err) {

//             console.error(err);

//         }

//         setLoading(false);

//     };

//     useEffect(() => {

//         fetchDeliveries(month, year, searchText);

//     }, [month, year, searchText]);


//     // Group by Trip Number
//     // const getTrips = () => {

//     //     const tripMap = {};

//     //     deliveries.forEach((d) => {

//     //         if (!tripMap[d.tripNumber]) {

//     //             tripMap[d.tripNumber] = {
//     //                 tripNumber: d.tripNumber,
//     //                 vendorName: d.vendorName,
//     //                 driverName: d.driverName,
//     //                 vehicleNumber: d.vehicleNumber,
//     //                 point: d.zone,
//     //                 createdAt: d.createdAt,
//     //                 status: "Delivered",
//     //                 deliveries: []
//     //             };

//     //         }

//     //         tripMap[d.tripNumber].deliveries.push(d);

//     //     });

//     //     return Object.values(tripMap);

//     // };

// const getTrips = () => {

//     return deliveries.map((t) => ({
//         tripNumber: t.tripNumber,
//         vendorName: t.vendorName,
//         driverName: t.driverName,
//         vehicleNumber: t.vehicleNumber,
//         challanQty: t.totalChallan,
//         createdAt: t.createdAt,
//         status: "Delivered",
//         deliveries: t.challans
//     }));

// };

//     const tripRows = getTrips();

//     // Reset
//     const handleReset = () => {

//         setMonth(new Date().getMonth() + 1);
//         setYear(new Date().getFullYear());
//         setSearchText("");

//         Swal.fire({
//             toast: true,
//             position: "top-end",
//             icon: "success",
//             title: "Filters Cleared",
//             showConfirmButton: false,
//             timer: 1500
//         });

//     };


//     // Export Excel
//     const handleExportExcel = () => {

//         if (tripRows.length === 0) {

//             Swal.fire("No Data", "Nothing to export", "warning");
//             return;

//         }

//         const exportData = tripRows.map((t) => ({
//             Date: new Date(t.createdAt).toLocaleDateString(),
//             Trip: t.tripNumber,
//             Vendor: t.vendorName,
//             Driver: t.driverName,
//             Vehicle: t.vehicleNumber,
//             Point: t.challanQty,
//             Status: t.status
//         }));

//         const ws = XLSX.utils.json_to_sheet(exportData);
//         const wb = XLSX.utils.book_new();

//         XLSX.utils.book_append_sheet(wb, ws, "Trips");

//         const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

//         const blob = new Blob([buffer], { type: "application/octet-stream" });

//         saveAs(blob, `TripInventory_${month}_${year}.xlsx`);

//     };


//     return (

//         <div className="min-h-screen bg-gray-50 p-4">

//             <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">

//                 {/* Header */}

//                 <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">

//                     <div className="flex gap-2">

//                         <select
//                             className="border px-2 py-1 rounded"
//                             value={month}
//                             onChange={(e) => setMonth(parseInt(e.target.value))}
//                         >

//                             {[...Array(12)].map((_, i) => (
//                                 <option key={i} value={i + 1}>
//                                     {new Date(0, i).toLocaleString("default", { month: "long" })}
//                                 </option>
//                             ))}

//                         </select>

//                         <input
//                             type="number"
//                             className="border px-2 py-1 rounded w-24"
//                             value={year}
//                             onChange={(e) => setYear(parseInt(e.target.value))}
//                         />

//                         <button
//                             onClick={handleReset}
//                             className="bg-red-500 text-white px-3 py-1 rounded"
//                         >
//                             Reset
//                         </button>

//                     </div>

//                     <h2 className="text-xl font-bold text-green-700">
//                         Trip Inventory
//                     </h2>

//                     <button
//                         onClick={handleExportExcel}
//                         className="bg-green-600 text-white px-3 py-1 rounded"
//                     >
//                         Export Excel
//                     </button>

//                 </div>


//                 {loading ?

//                     <div className="text-center py-10">
//                         Loading...
//                     </div>

//                     :

//                     <table className="w-full border-collapse text-sm">

//                         <thead className="bg-green-600 text-white text-center">

//                             <tr>

//                                 <th className="border p-2">Date</th>
//                                 <th className="border p-2">Trip Number</th>
//                                 <th className="border p-2">Vendor</th>
//                                 <th className="border p-2">Driver</th>
//                                 <th className="border p-2">Vehicle</th>
//                                 <th className="border p-2">Point</th>
//                                 <th className="border p-2">Status</th>
//                                 <th className="border p-2">View</th>

//                             </tr>

//                         </thead>

//                         <tbody>

//                             {tripRows.map((t, i) => {

//                                 const date = new Date(t.createdAt)

//                                 return (

//                                     <tr key={i} className="text-center even:bg-gray-50">

//                                         <td className="border px-2 py-1">
//                                             {date.toLocaleDateString()}
//                                         </td>

//                                         <td className="border px-2 py-1 font-bold">
//                                             {t.tripNumber}
//                                         </td>

//                                         <td className="border px-2 py-1">
//                                             {t.vendorName}
//                                         </td>

//                                         <td className="border px-2 py-1">
//                                             {t.driverName}
//                                         </td>

//                                         <td className="border px-2 py-1">
//                                             {t.vehicleNumber}
//                                         </td>

//                                         <td className="border px-2 py-1">
//                                             {t.challanQty}
//                                         </td>

//                                         <td className="border px-2 py-1">

//                                             <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
//                                                 Delivered
//                                             </span>

//                                         </td>

//                                         <td className="border px-2 py-1">

//                                             <button
//                                                 onClick={() => setSelectedTrip(t)}
//                                                 className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
//                                             >
//                                                 View
//                                             </button>

//                                         </td>

//                                     </tr>

//                                 )

//                             })}

//                         </tbody>

//                     </table>

//                 }

//             </div>


//             {/* Modal */}

//           <TripDetailsModal
//     selectedTrip={selectedTrip} 
//     setSelectedTrip={setSelectedTrip} 
// />

//         </div>

//     )

// };

// export default TripInventoryPage;







import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import TripDetailsModal from "../Component/TripDetailsModal";

const TripInventoryPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Fetch Deliveries
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

  // Prepare trips for table
  const getTrips = () => {
    return deliveries.map((t) => ({
      tripNumber: t.tripNumber,
      vendorName: t.vendorName,
      driverName: t.driverName,
      vehicleNumber: t.vehicleNumber,
      challanQty: t.totalChallan,
      createdAt: t.createdAt,
      status: "Delivered",
      challans: t.challans,
    }));
  };

  const tripRows = getTrips();

  // Reset Filters
  const handleReset = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setSearchText("");
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Filters Cleared",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    if (tripRows.length === 0) {
      Swal.fire("No Data", "Nothing to export", "warning");
      return;
    }

    const exportData = tripRows.map((t) => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      Trip: t.tripNumber,
      Vendor: t.vendorName,
      Driver: t.driverName,
      Vehicle: t.vehicleNumber,
      Challans: t.challanQty,
      Status: t.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trips");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `TripInventory_${month}_${year}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <select
              className="border px-2 py-1 rounded"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="border px-2 py-1 rounded w-24"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />

            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>

          <h2 className="text-xl font-bold text-green-700">Trip Inventory</h2>

          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Export Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-600 text-white text-center">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Trip Number</th>
                <th className="border p-2">Vendor</th>
                <th className="border p-2">Driver</th>
                <th className="border p-2">Vehicle</th>
                <th className="border p-2">Challans</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">View</th>
              </tr>
            </thead>
            <tbody>
              {tripRows.map((t, i) => {
                const date = new Date(t.createdAt);
                return (
                  <tr key={i} className="text-center even:bg-gray-50">
                    <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
                    <td className="border px-2 py-1 font-bold">{t.tripNumber}</td>
                    <td className="border px-2 py-1">{t.vendorName}</td>
                    <td className="border px-2 py-1">{t.driverName}</td>
                    <td className="border px-2 py-1">{t.vehicleNumber}</td>
                    <td className="border px-2 py-1">{t.challanQty}</td>
                    <td className="border px-2 py-1">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        Delivered
                      </span>
                    </td>
                    <td className="border px-2 py-1">
                      <button
                        onClick={() => setSelectedTrip(t)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <TripDetailsModal selectedTrip={selectedTrip} setSelectedTrip={setSelectedTrip} />
    </div>
  );
};

export default TripInventoryPage;