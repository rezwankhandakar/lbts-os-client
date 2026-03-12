// import React, { useState, useEffect } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {

//     const axiosSecure = useAxiosSecure();

//     const [trip, setTrip] = useState(selectedTrip);
//     const [loadingId, setLoadingId] = useState(null);

//     useEffect(() => {
//         setTrip(selectedTrip);
//     }, [selectedTrip]);

//     if (!trip) return null;

//     // Total Product Qty
//     const totalProducts = trip.challans?.reduce((sum, c) => {
//         const qty = c.products?.reduce((pSum, p) => pSum + Number(p.quantity || 0), 0);
//         return sum + qty;
//     }, 0);

//     const date = new Date(trip.createdAt).toLocaleDateString();

//     // Confirm Delivery
//     const handleConfirm = async (challanId, status) => {

//         try {

//             setLoadingId(challanId);

//             await axiosSecure.patch("/deliveries/confirm", {
//                 tripNumber: trip.tripNumber,
//                 challanId,
//                 status,
//                 operator: "Operator"
//             });

//             // UI Update
//             setTrip(prev => ({
//                 ...prev,
//                 challans: prev.challans.map(c =>
//                     c.challanId === challanId
//                         ? { ...c, deliveryStatus: status }
//                         : c
//                 )
//             }));

//             Swal.fire({
//                 icon: "success",
//                 title: "Delivery Status Updated",
//                 timer: 1200,
//                 showConfirmButton: false
//             });

//         } catch (err) {

//             console.error(err);

//             Swal.fire({
//                 icon: "error",
//                 title: "Update Failed"
//             });

//         } finally {

//             setLoadingId(null);

//         }

//     };


//     // Challan Return
//     const handleChallanReturn = async (challanId, status) => {

//         try {

//             setLoadingId(challanId);

//             await axiosSecure.patch("/deliveries/challan-return", {
//                 tripNumber: trip.tripNumber,
//                 challanId,
//                 status,
//                 operator: "Operator"
//             });

//             // UI Update
//             setTrip(prev => ({
//                 ...prev,
//                 challans: prev.challans.map(c =>
//                     c.challanId === challanId
//                         ? { ...c, challanReturnStatus: status }
//                         : c
//                 )
//             }));

//             Swal.fire({
//                 icon: "success",
//                 title: "Challan Return Updated",
//                 timer: 1200,
//                 showConfirmButton: false
//             });

//         } catch (err) {

//             console.error(err);

//             Swal.fire({
//                 icon: "error",
//                 title: "Update Failed"
//             });

//         } finally {

//             setLoadingId(null);

//         }

//     };

// // Delivery not confirmed
// const deliveryNotConfirmed = trip.challans.filter(
//     c => c.deliveryStatus !== "confirmed"
// ).length;

// // Challan not received
// const challanNotReceived = trip.challans.filter(
//     c => c.challanReturnStatus !== "received"
// ).length;

//     return (

//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

//             <div className="bg-white w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl p-6">

//                 {/* Header */}

//                 <div className="flex justify-between items-start border-b pb-4 mb-6">

//                     <div>

//                         <h2 className="text-xl font-bold text-green-700">
//                             Trip {trip.tripNumber}
//                         </h2>

//                         <p className="text-sm text-gray-500 mt-1">
//                             Date: {date}
//                         </p>

//                         <div className="flex gap-3 mt-2 text-sm">

//                             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
//                                 Total Challan: {trip.totalChallan}
//                             </span>

//                             <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
//                                 Total Products: {totalProducts} PCS
//                             </span>

//                         </div>

//                     </div>

//                     <button
//                         onClick={() => setSelectedTrip(null)}
//                         className="text-red-500 font-bold"
//                     >
//                         Close
//                     </button>

//                 </div>

//                 {/* Short Summary */}

// <div className="flex gap-3 mt-3 text-sm">

//     <span className="bg-red-100 text-red-700 px-3 py-1 rounded">
//         Delivery Not Confirmed: {deliveryNotConfirmed}
//     </span>

//     <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded">
//         Challan Not Received: {challanNotReceived}
//     </span>

// </div>


//                 {/* Vehicle + Vendor + Driver */}

//                 <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">

//                     <div className="border rounded-lg p-3 bg-gray-50">
//                         <p className="font-semibold text-gray-600">Vehicle</p>
//                         <p className="font-bold">{trip.vehicleNumber}</p>
//                     </div>

//                     <div className="border rounded-lg p-3 bg-gray-50">
//                         <p className="font-semibold text-gray-600">Vendor</p>
//                         <p className="font-bold">{trip.vendorName}</p>
//                         <p className="text-gray-500">{trip.vendorNumber}</p>
//                     </div>

//                     <div className="border rounded-lg p-3 bg-gray-50">
//                         <p className="font-semibold text-gray-600">Driver</p>
//                         <p className="font-bold">{trip.driverName}</p>
//                         <p className="text-gray-500">{trip.driverNumber}</p>
//                     </div>

//                 </div>


//                 {/* Challan Cards */}

//                 <div className="grid md:grid-cols-2 gap-4">

//                     {trip.challans.map((c, i) => (

//                         <div
//                             key={i}
//                             className="border rounded-lg p-4 shadow-sm bg-gray-50"
//                         >

//                             {/* Customer */}

//                             <div className="mb-2">

//                                 <h3 className="font-bold text-gray-800">
//                                     {c.customerName}
//                                 </h3>

//                                 <p className="text-xs text-blue-600 font-semibold">
//                                     Zone: {c.zone}
//                                 </p>

//                             </div>


//                             {/* Address */}

//                             <div className="text-sm text-gray-600 mb-3">

//                                 <p>Address : {c.address}</p>

//                                 <p>
//                                     District : {c.district} | Thana : {c.thana}
//                                 </p>

//                                 <div className="flex justify-between items-center mt-2">

//                                     <p className="text-xs text-gray-500">
//                                         Receiver: {c.receiverNumber}
//                                     </p>

//                                     <div className="flex gap-2">



//                                         <button
//                                             disabled={loadingId === c.challanId}
//                                             onClick={() => handleConfirm(c.challanId, "confirmed")}
//                                             className="bg-green-500 text-white px-2 py-1 text-xs rounded"
//                                         >
//                                             Confirm
//                                         </button>

//                                         <button
//                                             disabled={loadingId === c.challanId}
//                                             onClick={() => handleConfirm(c.challanId, "not_received")}
//                                             className="bg-red-500 text-white px-2 py-1 text-xs rounded"
//                                         >
//                                             Not Received
//                                         </button>

//                                         <button
//                                             disabled={loadingId === c.challanId}
//                                             onClick={() => handleConfirm(c.challanId, "call_later")}
//                                             className="bg-yellow-500 text-white px-2 py-1 text-xs rounded"
//                                         >
//                                             Call Later
//                                         </button>

//                                     </div>

//                                 </div>

//                             </div>


//                             {/* Delivery Status */}

//                             <span className="text-xs px-2 py-1 rounded bg-gray-200">
//                                 Delivery: {c.deliveryStatus || "pending"}
//                             </span>


//                             {/* Challan Return */}

//                             <div className="flex gap-2 mt-2">

//                                 <button
//                                     disabled={loadingId === c.challanId}
//                                     onClick={() => handleChallanReturn(c.challanId, "received")}
//                                     className="bg-indigo-500 text-white px-2 py-1 text-xs rounded"
//                                 >
//                                     Challan Received
//                                 </button>

//                                 <button
//                                     disabled={loadingId === c.challanId}
//                                     onClick={() => handleChallanReturn(c.challanId, "missing")}
//                                     className="bg-red-400 text-white px-2 py-1 text-xs rounded"
//                                 >
//                                     Missing
//                                 </button>

//                             </div>

//                             <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 ml-2">
//                                 Challan: {c.challanReturnStatus || "pending"}
//                             </span>


//                             {/* Products */}

//                             <div className="border-t pt-2 mt-2">

//                                 <p className="text-xs font-semibold text-gray-500 mb-1">
//                                     Products
//                                 </p>

//                                 {c.products.map((p, idx) => (

//                                     <div
//                                         key={idx}
//                                         className="flex justify-between text-sm py-1"
//                                     >
//                                         <span className="font-medium uppercase">
//                                             {p.productName}
//                                         </span>

//                                         <span className="font-medium uppercase">
//                                             {p.model}
//                                         </span>

//                                         <span className="font-bold text-green-600">
//                                             {p.quantity} PCS
//                                         </span>

//                                     </div>

//                                 ))}

//                             </div>

//                         </div>

//                     ))}

//                 </div>

//             </div>

//         </div>

//     );

// };

// export default TripDetailsModal;





import React, { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { X, Truck, User, Package, MapPin, PhoneForwarded } from "lucide-react";

const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {
    const axiosSecure = useAxiosSecure();
    const [trip, setTrip] = useState(selectedTrip);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => { setTrip(selectedTrip); }, [selectedTrip]);

    if (!trip) return null;

    const totalProducts = trip.challans?.reduce((sum, c) => {
        const qty = c.products?.reduce((pSum, p) => pSum + Number(p.quantity || 0), 0);
        return sum + qty;
    }, 0);

    const deliveryNotConfirmed = trip.challans?.filter(c => c.deliveryStatus !== "confirmed").length;
    const challanNotReceived = trip.challans?.filter(c => c.challanReturnStatus !== "received").length;

    const getStatusStyle = (status) => {
        switch (status) {
            case "confirmed": return "bg-green-50 text-green-600 border-green-100";
            case "received": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "missing": return "bg-red-50 text-red-600 border-red-100";
            case "call_later": return "bg-yellow-50 text-yellow-600 border-yellow-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    const updateStatus = async (challanId, status, endpoint, field) => {
        try {
            setLoadingId(`${challanId}-${field}`);
            await axiosSecure.patch(`/deliveries/${endpoint}`, {
                tripNumber: trip.tripNumber,
                challanId,
                status,
                operator: "Admin"
            });

            setTrip(prev => ({
                ...prev,
                challans: prev.challans.map(c =>
                    c.challanId === challanId ? { ...c, [field]: status } : c
                )
            }));

            Swal.fire({ icon: "success", title: "Updated", toast: true, position: 'top-end', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: "Update failed" });
        } finally { setLoadingId(null); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-start md:items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-6xl max-h-[98vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">

                {/* Compact Header */}
                <div className="p-3 border-b bg-white">
                    {/* Row 1: Title & Close Button */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{trip.tripNumber}</h2>
                            <div className="h-4 w-[1px] bg-slate-200"></div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {new Date(trip.createdAt).toDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedTrip(null)}
                            className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-all border border-transparent hover:border-rose-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                   {/* Optimized Combined Info & Stats Bar */}
<div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-3 bg-slate-800 rounded-xl text-white shadow-lg">
    
    {/* Logistics Info Group */}
    <div className="flex flex-wrap items-center gap-6 border-r border-slate-700 pr-6">
        {/* Vehicle */}
        <div className="flex items-center gap-2.5">
            <Truck size={16} className="text-indigo-400" />
            <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Vehicle</span>
                <span className="text-xs font-bold">{trip.vehicleNumber}</span>
            </div>
        </div>

        {/* Vendor */}
        <div className="flex items-center gap-3 border-l border-slate-700 pl-6 hidden md:flex">
    {/* Icon Section */}
    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <Package size={18} className="text-indigo-400" />
    </div>

    {/* Text Section */}
    <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
            Vendor
        </span>
        
        {/* Vendor Name */}
        <span className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
            {trip.vendorName}
        </span>

        {/* Vendor Phone Number */}
        <a 
           
            className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit"
        >
            <PhoneForwarded size={10} className="shrink-0" />
            <span className="font-bold">
                {trip.vendorNumber}
            </span>
        </a>
    </div>
</div>

        {/* Driver - Name top, Number bottom */}
        <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
    {/* Icon Section */}
    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <User size={18} className="text-indigo-400" />
    </div>

    {/* Text Section */}
    <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
            Driver
        </span>
        
        {/* Driver Name */}
        <span className="text-sm font-bold text-white leading-tight">
            {trip.driverName}
        </span>

        {/* Clickable Phone Number */}
        <a 
            
            className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit"
        >
            <PhoneForwarded size={10} className="shrink-0" />
            <span className="font-bold">
                {trip.driverNumber}
            </span>
        </a>
    </div>
</div>
    </div>

    {/* Compact Stats Group */}
    <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
        {/* Total Stats */}

         <div className="flex items-center gap-2">
    {/* Total Point - Emerald/Green Theme (Success/Completion vibe) */}
    <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm">
        <div className="text-center">
            <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-wider leading-none mb-1">Total Point</p>
            <p className="text-sm font-black text-emerald-400 leading-none">
                {trip.totalChallan}
            </p>
        </div>
    </div>

    {/* Total Products - Sky/Blue Theme (Data/Inventory vibe) */}
    <div className="flex items-center px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg shadow-sm">
        <div className="text-center">
            <p className="text-[8px] font-bold text-sky-400/80 uppercase tracking-wider leading-none mb-1">Total Products</p>
            <p className="text-sm font-black text-sky-400 leading-none">
                {totalProducts}
            </p>
        </div>
    </div>
</div>

        {/* Pending Alerts */}
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <div className="text-center">
                    <p className="text-[8px] font-bold text-rose-400 uppercase leading-none mb-0.5">Pending Delivery Confirmation</p>
                    <p className="text-sm font-black text-rose-500 leading-none">{deliveryNotConfirmed}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="text-center">
                    <p className="text-[8px] font-bold text-amber-400 uppercase leading-none mb-0.5">Pending Receiving Challan</p>
                    <p className="text-sm font-black text-amber-500 leading-none">{challanNotReceived}</p>
                </div>
            </div>
        </div>
    </div>
</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">


                    {/* Challan Grid - Focus on Content */}
                    <div className="grid md:grid-cols-2 gap-3">
                        {trip.challans.map((c, i) => (
                            <div key={i} className="border rounded-xl p-3 hover:border-blue-200 transition-colors bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="max-w-[70%]">
                                        <h3 className="font-bold text-slate-800 leading-tight truncate">{c.customerName}</h3>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                            <MapPin size={12} /> {c.address}
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600 border border-slate-200 uppercase">{c.zone}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Delivery Actions */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 px-1">
                                            <span>Delivery</span>
                                            <span className={c.deliveryStatus === 'confirmed' ? 'text-green-600' : ''}>{c.deliveryStatus || 'Pending'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                disabled={loadingId === `${c.challanId}-deliveryStatus`}
                                                onClick={() => updateStatus(c.challanId, "confirmed", "confirm", "deliveryStatus")}
                                                className="w-full bg-emerald-600 text-white py-1 rounded font-bold text-[11px] hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                            >
                                                {loadingId === `${c.challanId}-deliveryStatus` ? "..." : "Confirm"}
                                            </button>
                                            <div className="flex gap-1">
                                                <button onClick={() => updateStatus(c.challanId, "not_received", "confirm", "deliveryStatus")} className="flex-1 bg-slate-100 text-slate-600 py-1 rounded font-bold text-[10px] hover:bg-rose-50 hover:text-rose-600">Reject</button>
                                                <button onClick={() => updateStatus(c.challanId, "call_later", "confirm", "deliveryStatus")} className="flex-1 bg-slate-100 text-slate-600 py-1 rounded font-bold text-[10px] hover:bg-amber-50 hover:text-amber-600">Later</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Return Actions */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 px-1">
                                            <span>Return</span>
                                            <span className={c.challanReturnStatus === 'received' ? 'text-indigo-600' : ''}>{c.challanReturnStatus || 'Waiting'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                disabled={loadingId === `${c.challanId}-challanReturnStatus`}
                                                onClick={() => updateStatus(c.challanId, "received", "challan-return", "challanReturnStatus")}
                                                className="w-full bg-indigo-600 text-white py-1 rounded font-bold text-[11px] hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                            >
                                                Mark Received
                                            </button>
                                            <button onClick={() => updateStatus(c.challanId, "missing", "challan-return", "challanReturnStatus")} className="w-full border border-red-200 text-red-500 py-1 rounded font-bold text-[10px] hover:bg-red-50">Report Missing</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Product List Section */}
                                <div className="mt-3 py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="text-slate-400 text-left border-b border-slate-200">
                                                <th className="pb-1 font-semibold uppercase">Product</th>
                                                <th className="pb-1 text-right font-semibold uppercase">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {c.products.map((p, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0">
                                                    <td className="py-1 text-slate-700 font-medium uppercase">{p.productName} <span className="text-slate-400">({p.model})</span></td>
                                                    <td className="py-1 text-right font-bold text-slate-900">{p.quantity} PCS</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

               
            </div>
        </div>
    );
};

export default TripDetailsModal;






// import React, { useState, useEffect } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// // Badge component
// const Badge = ({ text, colorClass }) => (
//   <span className={`text-xs px-3 py-1 rounded-full font-semibold ${colorClass}`}>
//     {text}
//   </span>
// );

// // Product Row
// const ProductRow = ({ product }) => (
//   <div className="flex justify-between py-1 border-b last:border-b-0 text-sm">
//     <span className="font-medium uppercase">{product.productName}</span>
//     <span className="font-medium uppercase">{product.model}</span>
//     <span className="font-bold text-green-600">{product.quantity} PCS</span>
//   </div>
// );

// // Challan Card
// const ChallanCard = ({ challan, loadingId, handleConfirm, handleChallanReturn }) => (
//   <div className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-lg transition">
//     {/* Customer Info */}
//     <div className="mb-2">
//       <h3 className="text-gray-800 font-bold">{challan.customerName}</h3>
//       <p className="text-xs text-blue-600 font-semibold">Zone: {challan.zone}</p>
//     </div>

//     {/* Address */}
//     <div className="text-sm text-gray-600 mb-3 space-y-1">
//       <p>Address: {challan.address}</p>
//       <p>District: {challan.district} | Thana: {challan.thana}</p>
//       <p className="text-xs text-gray-500">Receiver: {challan.receiverNumber}</p>
//     </div>

//     {/* Delivery Actions */}
//     <div className="flex flex-wrap gap-2 mb-2">
//       <button
//         disabled={loadingId === challan.challanId}
//         onClick={() => handleConfirm(challan.challanId, "confirmed")}
//         className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
//       >
//         Confirm
//       </button>
//       <button
//         disabled={loadingId === challan.challanId}
//         onClick={() => handleConfirm(challan.challanId, "not_received")}
//         className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
//       >
//         Not Received
//       </button>
//       <button
//         disabled={loadingId === challan.challanId}
//         onClick={() => handleConfirm(challan.challanId, "call_later")}
//         className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold"
//       >
//         Call Later
//       </button>
//     </div>

//     {/* Status Badges */}
//     <div className="flex flex-wrap gap-2 mb-3">
//       <Badge
//         text={`Delivery: ${challan.deliveryStatus || "pending"}`}
//         colorClass="bg-gray-200 text-gray-700"
//       />
//       <Badge
//         text={`Challan: ${challan.challanReturnStatus || "pending"}`}
//         colorClass={
//           challan.challanReturnStatus === "received"
//             ? "bg-green-100 text-green-700"
//             : "bg-red-100 text-red-700"
//         }
//       />
//     </div>

//     {/* Products */}
//     <div className="border-t pt-2 mt-2">
//       <p className="text-xs font-semibold text-gray-500 mb-1">Products</p>
//       {challan.products.map((p, idx) => (
//         <ProductRow key={idx} product={p} />
//       ))}
//     </div>

//     {/* Challan Return Actions */}
//     <div className="flex flex-wrap gap-2 mt-3">
//       <button
//         disabled={loadingId === challan.challanId}
//         onClick={() => handleChallanReturn(challan.challanId, "received")}
//         className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold"
//       >
//         Received
//       </button>
//       <button
//         disabled={loadingId === challan.challanId}
//         onClick={() => handleChallanReturn(challan.challanId, "missing")}
//         className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold"
//       >
//         Missing
//       </button>
//     </div>
//   </div>
// );

// const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {
//   const axiosSecure = useAxiosSecure();
//   const [trip, setTrip] = useState(selectedTrip);
//   const [loadingId, setLoadingId] = useState(null);

//   useEffect(() => setTrip(selectedTrip), [selectedTrip]);

//   if (!trip) return null;

//   const totalProducts = trip.challans?.reduce(
//     (sum, c) => sum + (c.products?.reduce((pSum, p) => pSum + Number(p.quantity || 0), 0) || 0),
//     0
//   );

//   const date = new Date(trip.createdAt).toLocaleDateString();

//   const deliveryNotConfirmed = trip.challans.filter(c => c.deliveryStatus !== "confirmed").length;
//   const challanNotReceived = trip.challans.filter(c => c.challanReturnStatus !== "received").length;

//   // Handlers
//   const handleConfirm = async (challanId, status) => {
//     try {
//       setLoadingId(challanId);
//       await axiosSecure.patch("/deliveries/confirm", { tripNumber: trip.tripNumber, challanId, status, operator: "Operator" });
//       setTrip(prev => ({
//         ...prev,
//         challans: prev.challans.map(c =>
//           c.challanId === challanId ? { ...c, deliveryStatus: status } : c
//         )
//       }));
//       Swal.fire({ icon: "success", title: "Delivery Updated", timer: 1200, showConfirmButton: false });
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Update Failed" });
//     } finally { setLoadingId(null); }
//   };

//   const handleChallanReturn = async (challanId, status) => {
//     try {
//       setLoadingId(challanId);
//       await axiosSecure.patch("/deliveries/challan-return", { tripNumber: trip.tripNumber, challanId, status, operator: "Operator" });
//       setTrip(prev => ({
//         ...prev,
//         challans: prev.challans.map(c =>
//           c.challanId === challanId ? { ...c, challanReturnStatus: status } : c
//         )
//       }));
//       Swal.fire({ icon: "success", title: "Challan Updated", timer: 1200, showConfirmButton: false });
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Update Failed" });
//     } finally { setLoadingId(null); }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex justify-center items-start md:items-center p-4 z-50 overflow-auto">
//       <div className="bg-white w-full max-w-6xl rounded-2xl p-6 shadow-lg animate-slide-down">
//         {/* Header */}
//         <div className="flex justify-between items-start border-b pb-4 mb-6 flex-wrap gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-green-700">Trip {trip.tripNumber}</h2>
//             <p className="text-sm text-gray-500 mt-1">Date: {date}</p>
//             <div className="flex flex-wrap gap-2 mt-2">
//               <Badge text={`Total Challan: ${trip.totalChallan}`} colorClass="bg-blue-100 text-blue-700" />
//               <Badge text={`Total Products: ${totalProducts} PCS`} colorClass="bg-green-100 text-green-700" />
//               <Badge text={`Delivery Not Confirmed: ${deliveryNotConfirmed}`} colorClass="bg-red-100 text-red-700" />
//               <Badge text={`Challan Not Received: ${challanNotReceived}`} colorClass="bg-orange-100 text-orange-700" />
//             </div>
//           </div>
//           <button onClick={() => setSelectedTrip(null)} className="text-red-500 font-bold text-lg hover:underline">Close</button>
//         </div>

//         {/* Vehicle / Vendor / Driver */}
//         <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
//           <div className="border rounded-lg p-3 bg-gray-50">
//             <p className="font-semibold text-gray-600">Vehicle</p>
//             <p className="font-bold">{trip.vehicleNumber}</p>
//           </div>
//           <div className="border rounded-lg p-3 bg-gray-50">
//             <p className="font-semibold text-gray-600">Vendor</p>
//             <p className="font-bold">{trip.vendorName}</p>
//             <p className="text-gray-500">{trip.vendorNumber}</p>
//           </div>
//           <div className="border rounded-lg p-3 bg-gray-50">
//             <p className="font-semibold text-gray-600">Driver</p>
//             <p className="font-bold">{trip.driverName}</p>
//             <p className="text-gray-500">{trip.driverNumber}</p>
//           </div>
//         </div>

//         {/* Challans */}
//         <div className="grid md:grid-cols-2 gap-4">
//           {trip.challans.map((c, i) => (
//             <ChallanCard
//               key={i}
//               challan={c}
//               loadingId={loadingId}
//               handleConfirm={handleConfirm}
//               handleChallanReturn={handleChallanReturn}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TripDetailsModal;