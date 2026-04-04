

// import React, { useState, useEffect } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";
// import { X, Truck, User, Package, MapPin, PhoneForwarded, MoreVertical } from "lucide-react";

// const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {

//     const axiosSecure = useAxiosSecure();

//     const [trip, setTrip] = useState(selectedTrip);
//     const [loadingId, setLoadingId] = useState(null);
//     const [openDropdown, setOpenDropdown] = useState({ id: null, type: null });


//     useEffect(() => { setTrip(selectedTrip); }, [selectedTrip]);

//     if (!trip) return null;

//     const totalProducts = trip.challans?.reduce((sum, c) => {
//         const qty = c.products?.reduce((pSum, p) => pSum + Number(p.quantity || 0), 0);
//         return sum + qty;
//     }, 0);

//     const deliveryNotConfirmed = trip.challans?.filter(c => c.deliveryStatus !== "confirmed").length;
//     const challanNotReceived = trip.challans?.filter(c => c.challanReturnStatus !== "received").length;

//     const getStatusStyle = (status) => {
//         switch (status) {
//             case "confirmed": return "bg-green-50 text-green-600 border-green-100";
//             case "received": return "bg-indigo-50 text-indigo-600 border-indigo-100";
//             case "missing": return "bg-red-50 text-red-600 border-red-100";
//             case "call_later": return "bg-yellow-50 text-yellow-600 border-yellow-100";
//             default: return "bg-gray-50 text-gray-500 border-gray-100";
//         }
//     };

//     const updateStatus = async (challanId, status, endpoint, field) => {
//         try {
//             setLoadingId(`${challanId}-${field}`);
//             await axiosSecure.patch(`/deliveries/${endpoint}`, {
//                 tripNumber: trip.tripNumber,
//                 challanId,
//                 status,
//                 operator: "Admin"
//             });

//             setTrip(prev => ({
//                 ...prev,
//                 challans: prev.challans.map(c =>
//                     c.challanId === challanId ? { ...c, [field]: status } : c
//                 )
//             }));

//             Swal.fire({ icon: "success", title: "Updated", toast: true, position: 'top-end', timer: 1500, showConfirmButton: false });
//         } catch (err) {
//             Swal.fire({ icon: "error", title: "Error", text: "Update failed" });
//         } finally { setLoadingId(null); }
//     };

//     const getStatusBadge = (status) => {
//         switch (status) {
//             case "confirmed":
//                 return "bg-emerald-100 text-emerald-700";
//             case "not_received":
//                 return "bg-rose-100 text-rose-700";
//             case "call_later":
//                 return "bg-amber-100 text-amber-700";
//             case "received":
//                 return "bg-indigo-100 text-indigo-700";
//             case "missing":
//                 return "bg-red-100 text-red-700";
//             default:
//                 return "bg-slate-100 text-slate-600";
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-start md:items-center z-50 p-2 md:p-4">
//             <div className="bg-white w-full max-w-6xl max-h-[98vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">

//                 {/* Compact Header */}
//                 <div className="p-3 border-b bg-white">
//                     {/* Row 1: Title & Close Button */}
//                     <div className="flex justify-between items-center">
//                         <div className="flex items-center gap-3">
//                             <h2 className="text-xl font-bold text-slate-800 tracking-tight">{trip.tripNumber}</h2>
//                             <div className="h-4 w-[1px] bg-slate-200"></div>
//                             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                                 {new Date(trip.createdAt).toDateString()}
//                             </p>
//                             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                                 {trip.createdBy}
//                             </p>
//                         </div>
//                         <button
//                             onClick={() => setSelectedTrip(null)}
//                             className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-all border border-transparent hover:border-rose-100"
//                         >
//                             <X size={20} />
//                         </button>
//                     </div>

//                     {/* Optimized Combined Info & Stats Bar */}
//                     <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-3 bg-slate-800 rounded-xl text-white shadow-lg">

//                         {/* Logistics Info Group */}
//                         <div className="flex flex-wrap items-center gap-6 border-r border-slate-700 pr-6">
//                             {/* Vehicle */}
//                             <div className="flex items-center gap-2.5">
//                                 <Truck size={16} className="text-indigo-400" />
//                                 <div className="flex flex-col">
//                                     <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Vehicle</span>
//                                     <span className="text-xs font-bold">{trip.vehicleNumber}</span>
//                                 </div>
//                             </div>

//                             {/* Vendor */}
//                             <div className="flex items-center gap-3 border-l border-slate-700 pl-6 hidden md:flex">
//                                 {/* Icon Section */}
//                                 <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
//                                     <Package size={18} className="text-indigo-400" />
//                                 </div>

//                                 {/* Text Section */}
//                                 <div className="flex flex-col gap-0.5">
//                                     <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
//                                         Vendor
//                                     </span>

//                                     {/* Vendor Name */}
//                                     <span className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
//                                         {trip.vendorName}
//                                     </span>

//                                     {/* Vendor Phone Number */}
//                                     <a

//                                         className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit"
//                                     >
//                                         <PhoneForwarded size={10} className="shrink-0" />
//                                         <span className="font-bold">
//                                             {trip.vendorNumber}
//                                         </span>
//                                     </a>
//                                 </div>
//                             </div>

//                             {/* Driver - Name top, Number bottom */}
//                             <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
//                                 {/* Icon Section */}
//                                 <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
//                                     <User size={18} className="text-indigo-400" />
//                                 </div>

//                                 {/* Text Section */}
//                                 <div className="flex flex-col gap-0.5">
//                                     <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
//                                         Driver
//                                     </span>

//                                     {/* Driver Name */}
//                                     <span className="text-sm font-bold text-white leading-tight">
//                                         {trip.driverName}
//                                     </span>

//                                     {/* Clickable Phone Number */}
//                                     <a

//                                         className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit"
//                                     >
//                                         <PhoneForwarded size={10} className="shrink-0" />
//                                         <span className="font-bold">
//                                             {trip.driverNumber}
//                                         </span>
//                                     </a>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Compact Stats Group */}
//                         <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
//                             {/* Total Stats */}
                            

//                             <div className="flex items-center gap-2">
//                                 {/* Total Point - Emerald/Green Theme (Success/Completion vibe) */}
//                                 <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm">
//                                     <div className="text-center">
//                                         <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-wider leading-none mb-1">Total Point</p>
//                                         <p className="text-sm font-black text-emerald-400 leading-none">
//                                             {trip.totalChallan}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Total Products - Sky/Blue Theme (Data/Inventory vibe) */}
//                                 <div className="flex items-center px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg shadow-sm">
//                                     <div className="text-center">
//                                         <p className="text-[8px] font-bold text-sky-400/80 uppercase tracking-wider leading-none mb-1">Total Products</p>
//                                         <p className="text-sm font-black text-sky-400 leading-none">
//                                             {totalProducts}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Pending Alerts */}
//                             <div className="flex items-center gap-3">
//                                 <div className="flex items-center gap-3 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
//                                     <div className="text-center">
//                                         <p className="text-[8px] font-bold text-rose-400 uppercase leading-none mb-0.5">Pending Delivery</p>
//                                         <p className="text-sm font-black text-rose-500 leading-none">{deliveryNotConfirmed}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
//                                     <div className="text-center">
//                                         <p className="text-[8px] font-bold text-amber-400 uppercase leading-none mb-0.5">Pending Challan</p>
//                                         <p className="text-sm font-black text-amber-500 leading-none">{challanNotReceived}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-4">

//                     {/* Challan Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {trip.challans.map((c, i) => (
//                             <div
//                                 key={i}
//                                 className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
//                             >
//                                 {/* Top Section */}
//                                 <div className="flex justify-between items-start gap-3">
//                                     {/* Customer Info */}
//                                     <div className="space-y-1 max-w-[70%]">
//                                         <p className="text-[11px] text-slate-800 font-bold break-words leading-tight">
//                                             {c.customerName}
//                                         </p>

//                                         <span className="inline-block text-[9px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold uppercase tracking-wide">
//                                             Zone : {c.zone}
//                                         </span>

//                                         <p className="text-[11px] text-slate-500 leading-snug">
//                                             <span className="font-semibold text-slate-600">Address :</span> {c.address}
//                                         </p>

//                                         <p className="text-[11px] text-slate-500 leading-snug">
//                                             <span className="font-semibold text-slate-600">District :</span> {c.district}{" "}
//                                             <span className="font-semibold text-slate-600">Thana :</span> {c.thana}
//                                         </p>

//                                         <p className="text-[11px] text-slate-600 font-semibold">
//                                             Receiver : {c.receiverNumber}
//                                         </p>
//                                     </div>

//                                     {/* Badges Side by Side */}
//                                     <div className="flex gap-2 flex-shrink-0 mt-1">
//                                         {/* Delivery Badge */}
//                                         <div className="relative">
//                                             <span
//                                                 onClick={() =>
//                                                     setOpenDropdown(prev =>
//                                                         prev.id === c.challanId && prev.type === "delivery"
//                                                             ? { id: null, type: null }
//                                                             : { id: c.challanId, type: "delivery" }
//                                                     )
//                                                 }
//                                                 className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide shadow-sm text-center cursor-pointer transition hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}
//                                             >
//                                                 D : {c.deliveryStatus || "Pending"}
//                                             </span>

//                                             {openDropdown.id === c.challanId && openDropdown.type === "delivery" && (
//                                                 <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
//                                                     <div className="px-3 py-2 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">
//                                                         Update Delivery
//                                                     </div>
//                                                     {["confirmed", "not_received", "call_later"].map(status => (
//                                                         <button
//                                                             key={status}
//                                                             onClick={e => {
//                                                                 e.stopPropagation();
//                                                                 updateStatus(c.challanId, status, "confirm", "deliveryStatus");
//                                                                 setOpenDropdown({ id: null, type: null });
//                                                             }}
//                                                             className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize hover:bg-slate-50 ${c.deliveryStatus === status ? "text-indigo-600 bg-indigo-50" : ""
//                                                                 }`}
//                                                         >
//                                                             {status.replace("_", " ")}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Return Badge */}
//                                         <div className="relative">
//                                             <span
//                                                 onClick={() =>
//                                                     setOpenDropdown(prev =>
//                                                         prev.id === c.challanId && prev.type === "return"
//                                                             ? { id: null, type: null }
//                                                             : { id: c.challanId, type: "return" }
//                                                     )
//                                                 }
//                                                 className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide shadow-sm text-center cursor-pointer transition hover:opacity-80 whitespace-nowrap ${getStatusBadge(
//                                                     c.challanReturnStatus
//                                                 )}`}
//                                             >
//                                                 C : {c.challanReturnStatus || "Pending"}
//                                             </span>

//                                             {openDropdown.id === c.challanId && openDropdown.type === "return" && (
//                                                 <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
//                                                     <div className="px-3 py-2 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">
//                                                         Update Return
//                                                     </div>
//                                                     {["received", "missing"].map(status => (
//                                                         <button
//                                                             key={status}
//                                                             onClick={e => {
//                                                                 e.stopPropagation();
//                                                                 updateStatus(c.challanId, status, "challan-return", "challanReturnStatus");
//                                                                 setOpenDropdown({ id: null, type: null });
//                                                             }}
//                                                             className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize hover:bg-slate-50 ${c.challanReturnStatus === status ? "text-indigo-600 bg-indigo-50" : ""
//                                                                 }`}
//                                                         >
//                                                             {status}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Product List */}
//                                 <div className="mt-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
//                                     <table className="w-full text-[11px]">
//                                         <thead className="bg-slate-100 text-slate-500 uppercase text-[10px]">
//                                             <tr>
//                                                 <th className="px-2 py-2 text-left">Product</th>
//                                                 <th className="px-2 py-2 text-left">Model</th>
//                                                 <th className="px-2 py-2 text-right">Qty</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {c.products.map((p, idx) => (
//                                                 <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-white">
//                                                     <td className="px-2 py-1.5 font-semibold text-slate-700">{p.productName}</td>
//                                                     <td className="px-2 py-1.5 text-slate-600 uppercase">{p.model}</td>
//                                                     <td className="px-2 py-1.5 text-right font-bold text-slate-900">{p.quantity} PCS</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>


//             </div>
//         </div>
//     );
// };

// export default TripDetailsModal;




import React, { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { X, Truck, User, Package, MapPin, PhoneForwarded, MoreVertical } from "lucide-react";

const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {
    const axiosSecure = useAxiosSecure();
    const [trip, setTrip] = useState(selectedTrip);
    const [loadingId, setLoadingId] = useState(null);
    const [openDropdown, setOpenDropdown] = useState({ id: null, type: null });

    useEffect(() => { setTrip(selectedTrip); }, [selectedTrip]);

    if (!trip) return null;

    const totalProducts = trip.challans?.reduce((sum, c) => {
        const qty = c.products?.reduce((pSum, p) => pSum + Number(p.quantity || 0), 0);
        return sum + qty;
    }, 0);

    const deliveryNotConfirmed = trip.challans?.filter(c => c.deliveryStatus !== "confirmed").length;
    const challanNotReceived   = trip.challans?.filter(c => c.challanReturnStatus !== "received").length;

    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed":    return "bg-emerald-100 text-emerald-700";
            case "not_received": return "bg-rose-100 text-rose-700";
            case "call_later":   return "bg-amber-100 text-amber-700";
            case "received":     return "bg-indigo-100 text-indigo-700";
            case "missing":      return "bg-red-100 text-red-700";
            default:             return "bg-slate-100 text-slate-600";
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
            Swal.fire({ icon: "success", title: "Updated", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Update failed" });
        } finally { setLoadingId(null); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-start md:items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-6xl max-h-[98vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-3 border-b bg-white">
                    {/* Title row */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{trip.tripNumber}</h2>
                            <div className="h-4 w-[1px] bg-slate-200" />
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {new Date(trip.createdAt).toDateString()}
                            </p>
                            {(trip.currentUser || trip.createdBy) && (
                                <>
                                    <div className="h-4 w-[1px] bg-slate-200" />
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} className="text-slate-400" />
                                        <span className="text-xs font-medium text-slate-600">{trip.currentUser || trip.createdBy}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedTrip(null)}
                            className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-all border border-transparent hover:border-rose-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Info & Stats Bar */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-3 bg-slate-800 rounded-xl text-white shadow-lg">
                        <div className="flex flex-wrap items-center gap-6 border-r border-slate-700 pr-6">
                            <div className="flex items-center gap-2.5">
                                <Truck size={16} className="text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Vehicle</span>
                                    <span className="text-xs font-bold">{trip.vehicleNumber}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-l border-slate-700 pl-6 hidden md:flex">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Package size={18} className="text-indigo-400" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</span>
                                    <span className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">{trip.vendorName}</span>
                                    <a className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit">
                                        <PhoneForwarded size={10} className="shrink-0" />
                                        <span className="font-bold">{trip.vendorNumber}</span>
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <User size={18} className="text-indigo-400" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</span>
                                    <span className="text-sm font-bold text-white leading-tight">{trip.driverName}</span>
                                    <a className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-white transition-colors w-fit">
                                        <PhoneForwarded size={10} className="shrink-0" />
                                        <span className="font-bold">{trip.driverNumber}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-wider leading-none mb-1">Total Point</p>
                                        <p className="text-sm font-black text-emerald-400 leading-none">{trip.totalChallan}</p>
                                    </div>
                                </div>
                                <div className="flex items-center px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg shadow-sm">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-sky-400/80 uppercase tracking-wider leading-none mb-1">Total Products</p>
                                        <p className="text-sm font-black text-sky-400 leading-none">{totalProducts}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-rose-400 uppercase leading-none mb-0.5">Pending Delivery</p>
                                        <p className="text-sm font-black text-rose-500 leading-none">{deliveryNotConfirmed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-amber-400 uppercase leading-none mb-0.5">Pending Challan</p>
                                        <p className="text-sm font-black text-amber-500 leading-none">{challanNotReceived}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Challan Grid */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trip.challans.map((c, i) => (
                            <div key={i} className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-1 max-w-[70%]">
                                        <p className="text-[11px] text-slate-800 font-bold break-words leading-tight">{c.customerName}</p>
                                        <span className="inline-block text-[9px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold uppercase tracking-wide">Zone : {c.zone}</span>
                                        <p className="text-[11px] text-slate-500 leading-snug"><span className="font-semibold text-slate-600">Address :</span> {c.address}</p>
                                        <p className="text-[11px] text-slate-500 leading-snug"><span className="font-semibold text-slate-600">District :</span> {c.district} <span className="font-semibold text-slate-600">Thana :</span> {c.thana}</p>
                                        <p className="text-[11px] text-slate-600 font-semibold">Receiver : {c.receiverNumber}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 mt-1">
                                        {/* Delivery Badge */}
                                        <div className="relative">
                                            <span
                                                onClick={() => setOpenDropdown(prev =>
                                                    prev.id === c.challanId && prev.type === "delivery"
                                                        ? { id: null, type: null }
                                                        : { id: c.challanId, type: "delivery" }
                                                )}
                                                className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide shadow-sm text-center cursor-pointer transition hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}
                                            >
                                                D : {c.deliveryStatus || "Pending"}
                                            </span>
                                            {openDropdown.id === c.challanId && openDropdown.type === "delivery" && (
                                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                                    <div className="px-3 py-2 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Update Delivery</div>
                                                    {["confirmed", "not_received", "call_later"].map(status => (
                                                        <button key={status} onClick={e => { e.stopPropagation(); updateStatus(c.challanId, status, "confirm", "deliveryStatus"); setOpenDropdown({ id: null, type: null }); }}
                                                            className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize hover:bg-slate-50 ${c.deliveryStatus === status ? "text-indigo-600 bg-indigo-50" : ""}`}>
                                                            {status.replace("_", " ")}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Return Badge */}
                                        <div className="relative">
                                            <span
                                                onClick={() => setOpenDropdown(prev =>
                                                    prev.id === c.challanId && prev.type === "return"
                                                        ? { id: null, type: null }
                                                        : { id: c.challanId, type: "return" }
                                                )}
                                                className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide shadow-sm text-center cursor-pointer transition hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}
                                            >
                                                C : {c.challanReturnStatus || "Pending"}
                                            </span>
                                            {openDropdown.id === c.challanId && openDropdown.type === "return" && (
                                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                                    <div className="px-3 py-2 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Update Return</div>
                                                    {["received", "missing"].map(status => (
                                                        <button key={status} onClick={e => { e.stopPropagation(); updateStatus(c.challanId, status, "challan-return", "challanReturnStatus"); setOpenDropdown({ id: null, type: null }); }}
                                                            className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize hover:bg-slate-50 ${c.challanReturnStatus === status ? "text-indigo-600 bg-indigo-50" : ""}`}>
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Table */}
                                <div className="mt-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                    <table className="w-full text-[11px]">
                                        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px]">
                                            <tr>
                                                <th className="px-2 py-2 text-left">Product</th>
                                                <th className="px-2 py-2 text-left">Model</th>
                                                <th className="px-2 py-2 text-right">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {c.products.map((p, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-white">
                                                    <td className="px-2 py-1.5 font-semibold text-slate-700">{p.productName}</td>
                                                    <td className="px-2 py-1.5 text-slate-600 uppercase">{p.model}</td>
                                                    <td className="px-2 py-1.5 text-right font-bold text-slate-900">{p.quantity} PCS</td>
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