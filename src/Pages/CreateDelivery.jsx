
// import React, { useEffect, useState, useCallback } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { useSearch } from "../hooks/SearchContext";
// import useRole from "../hooks/useRole";
// import Swal from "sweetalert2";
// import {
//     FaEdit, FaTrashAlt, FaUserEdit, FaTimes,
//     FaSave, FaBoxOpen, FaPlusCircle, FaTruck, FaPhoneAlt, FaIdBadge, FaCarSide, FaBuilding
// } from "react-icons/fa";
// import EditCreateDeliveryChallanModal from "../Component/EditCreateDelliveryChallanModal";
// import useAuth from "../hooks/useAuth";

// const CreateDelivery = () => {
//     const axiosSecure = useAxiosSecure();
//     const [challans, setChallans] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const { searchText } = useSearch();
//     const { role } = useRole();
//     const { user } = useAuth();

//     const [deliveryInfo, setDeliveryInfo] = useState({
//         vehicleNumber: "",
//         vendorName: "",
//         vendorNumber: "",
//         driverName: "",
//         driverNumber: ""
//     });

//     const [deliveryQueue, setDeliveryQueue] = useState([]);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editingChallan, setEditingChallan] = useState(null);
//     const [vehicleSuggestions, setVehicleSuggestions] = useState([]);

//     const handleDeliveryInfoChange = (e) => {
//         const { name, value } = e.target;
//         setDeliveryInfo(prev => ({ ...prev, [name]: value }));
//     };

//     const fetchChallans = useCallback(async (search) => {
//         if (!search) { setChallans([]); return; }
//         setLoading(true);
//         try {
//             const res = await axiosSecure.get(`/challans?search=${search}`);
//             setChallans(res.data.data || res.data || []);
//         } catch (err) {
//             console.error("Error fetching challans:", err);
//         } finally {
//             setLoading(false);
//         }
//     }, [axiosSecure]);

//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             fetchChallans(searchText);
//         }, 500);
//         return () => clearTimeout(delayDebounceFn);
//     }, [searchText, fetchChallans]);

//     const addToDelivery = (challan) => {
//         if (!deliveryQueue.some(item => item._id === challan._id)) {
//             setDeliveryQueue([...deliveryQueue, challan]);
//         } else {
//             Swal.fire({ icon: 'info', title: 'Already Added', text: 'This challan is already in the queue.', timer: 1500, showConfirmButton: false });
//         }
//     };

//     const handleEditClick = (challan) => {
//         setEditingChallan(JSON.parse(JSON.stringify(challan)));
//         setIsEditModalOpen(true);
//     };

//     const handleEditChange = (e) => {
//         const { name, value } = e.target;
//         setEditingChallan(prev => ({ ...prev, [name]: value }));
//     };

//     const handleProductChange = (index, field, value) => {
//         const updated = [...editingChallan.products];
//         updated[index][field] = value;
//         setEditingChallan({ ...editingChallan, products: updated });
//     };

//     const handleDeleteProduct = (index) => {
//         const updated = [...editingChallan.products];
//         updated.splice(index, 1);
//         setEditingChallan({ ...editingChallan, products: updated });
//     };

//     const handleUpdateChallan = async () => {
//         try {
//             const res = await axiosSecure.patch(`/challans/${editingChallan._id}`, editingChallan);
//             if (res.data.modifiedCount || res.data.success) {
//                 Swal.fire("Updated", "Challan updated successfully", "success");
//                 fetchChallans(searchText);
//                 setDeliveryQueue(prev => prev.map(item => item._id === editingChallan._id ? editingChallan : item));
//                 setIsEditModalOpen(false);
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire("Error", "Update failed", "error");
//         }
//     };

//     const handleConfirmDispatch = async () => {
//         if (!deliveryInfo.vehicleNumber || !deliveryInfo.driverNumber) {
//             return Swal.fire("Required", "Vehicle and Driver details are mandatory", "warning");
//         }
//         if (deliveryQueue.length === 0) {
//             return Swal.fire("Empty Queue", "Please add at least one challan", "warning");
//         }
//         const deliveryData = deliveryQueue.map(c => ({
//             ...deliveryInfo,
//             challanId: c._id,
//             customerName: c.customerName,
//             zone: c.zone,
//             address: c.address,
//             thana: c.thana,
//             district: c.district,
//             receiverNumber: c.receiverNumber,
//             products: c.products,
//             createdBy: user?.displayName || user?.email || "unknown",
//         }));
//         try {
//             const res = await axiosSecure.post("/deliveries", deliveryData);
//             if (res.data.success) {
//                 Swal.fire({
//                     title: "Dispatch Confirmed",
//                     html: `<p>Delivery created successfully!</p><p class="text-green-600 font-bold">Trip ID: ${res.data.tripNumber}</p>`,
//                     icon: "success"
//                 });
//                 setDeliveryQueue([]);
//                 setDeliveryInfo({ vehicleNumber: "", vendorName: "", vendorNumber: "", driverName: "", driverNumber: "" });
//             }
//         } catch (error) {
//             console.error(error);
//             Swal.fire("Error", "Failed to create delivery. Try again.", "error");
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
//             <div className="max-w-[1800px] mx-auto">

//                 {/* Header & Vehicle Info */}
//                 <div className="bg-white shadow-sm border border-slate-200 mb-3">
//                     <div className="bg-slate-900 p-2 flex flex-col md:flex-row justify-between items-center gap-4">
//                         <div>
//                             <h2 className="text-2xl font-black text-white flex items-center gap-3">
//                                 <FaTruck className="text-green-500" /> DELIVERY
//                                 <span className="text-green-500">PLANNER</span>
//                             </h2>
//                             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Operational Control Center</p>
//                         </div>
//                         <div className="flex gap-4">
//                             <div className="text-right hidden sm:block">
//                                 <p className="text-slate-400 text-[10px] font-bold uppercase">Active Search Results</p>
//                                 <p className="text-white font-black text-lg">{challans.length}</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//                         <div className="relative">
//                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vehicle Number</label>
//                             <div className="relative">
//                                 <FaCarSide className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
//                                 <input
//                                     type="text"
//                                     value={deliveryInfo.vehicleNumber}
//                                     placeholder="Metro-1234"
//                                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white transition-all"
//                                     onChange={async (e) => {
//                                         const val = e.target.value;
//                                         setDeliveryInfo(prev => ({ ...prev, vehicleNumber: val }));
//                                         if (val.length > 1) {
//                                             try {
//                                                 const res = await axiosSecure.get(`/vehicles/search?search=${val}`);
//                                                 setVehicleSuggestions(res.data || []);
//                                             } catch (error) { console.error(error); }
//                                         } else {
//                                             setVehicleSuggestions([]);
//                                         }
//                                     }}
//                                 />
//                                 {vehicleSuggestions.length > 0 && (
//                                     <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[999] mt-2 max-h-60 overflow-y-auto">
//                                         {vehicleSuggestions.map((v, i) => (
//                                             <div key={i} onClick={() => {
//                                                 setDeliveryInfo({ vehicleNumber: v.vehicleNumber, vendorName: v.vendorName, vendorNumber: v.vendorPhone, driverName: v.driverName, driverNumber: v.driverPhone });
//                                                 setVehicleSuggestions([]);
//                                             }} className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors">
//                                                 <p className="font-black text-xs text-slate-800">{v.vehicleNumber}</p>
//                                                 <p className="text-[10px] text-slate-500 font-bold uppercase">{v.vendorName} • {v.driverName}</p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                         <div>
//                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vendor Name</label>
//                             <input type="text" name="vendorName" value={deliveryInfo.vendorName} onChange={handleDeliveryInfoChange} placeholder="Vendor Ltd." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
//                         </div>
//                         <div>
//                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vendor Phone</label>
//                             <input type="text" name="vendorNumber" value={deliveryInfo.vendorNumber} onChange={handleDeliveryInfoChange} placeholder="017xxxxxxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
//                         </div>
//                         <div>
//                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Driver Name</label>
//                             <input type="text" name="driverName" value={deliveryInfo.driverName} onChange={handleDeliveryInfoChange} placeholder="Mr. Driver" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
//                         </div>
//                         <div>
//                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Driver Phone</label>
//                             <input type="text" name="driverNumber" value={deliveryInfo.driverNumber} onChange={handleDeliveryInfoChange} placeholder="018xxxxxxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Workspace */}
//                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//                     <div className="xl:col-span-4 flex flex-col gap-4">
//                         <div className="flex items-center justify-between px-2">
//                             <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Challans</h3>
//                             <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold uppercase">{searchText || "Recent"}</span>
//                         </div>
//                         <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
//                             {loading ? <SkeletonCard /> : challans.length === 0 ? (
//                                 <EmptyState message="Search for challans to start planning" />
//                             ) : (
//                                 challans.map(c => (
//                                     <ChallanCard key={c._id} data={c} onAdd={() => addToDelivery(c)} onEdit={() => handleEditClick(c)} />
//                                 ))
//                             )}
//                         </div>
//                     </div>

//                     <div className="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[75vh]">
//                         <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//                             <div>
//                                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Delivery Queue</h3>
//                                 <p className="text-[10px] text-slate-400 font-bold uppercase">Items ready for dispatch</p>
//                             </div>
//                             <div className="flex items-center gap-3">
//                                 <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[11px] font-black uppercase">{deliveryQueue.length} Selected</span>
//                                 {deliveryQueue.length > 0 && (
//                                     <button onClick={() => setDeliveryQueue([])} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition"><FaTrashAlt size={16} /></button>
//                                 )}
//                             </div>
//                         </div>
//                         <div className="p-6 flex-grow overflow-y-auto bg-[#fafafa]">
//                             {deliveryQueue.length === 0 ? (
//                                 <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
//                                     <FaBoxOpen size={64} className="mb-4 opacity-20" />
//                                     <p className="font-bold uppercase text-sm tracking-widest">No Items in Queue</p>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-4">
//                                     {deliveryQueue.map(item => (
//                                         <QueueItem key={item._id} item={item} onRemove={(id) => setDeliveryQueue(q => q.filter(i => i._id !== id))} />
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                         {deliveryQueue.length > 0 && (
//                             <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
//                                 <button onClick={handleConfirmDispatch}
//                                     className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-4 transition-all active:scale-[0.98]">
//                                     CONFIRM DISPATCH & GENERATE TRIP <FaTruck />
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* ✅ setEditingChallan prop added */}
//             <EditCreateDeliveryChallanModal
//                 isOpen={isEditModalOpen}
//                 editingChallan={editingChallan}
//                 setIsEditModalOpen={setIsEditModalOpen}
//                 handleEditChange={handleEditChange}
//                 handleProductChange={handleProductChange}
//                 handleDeleteProduct={handleDeleteProduct}
//                 handleUpdateChallan={handleUpdateChallan}
//                 setEditingChallan={setEditingChallan}
//             />
//         </div>
//     );
// };

// const ChallanCard = ({ data, onAdd, onEdit }) => (
//     <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
//         <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
//             <span className="text-[10px]  font-bold">Date: {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "—"}</span>
//             <div className="flex gap-2">
//                 <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FaUserEdit size={14} /></button>
//                 <button onClick={onAdd} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all shadow-sm active:scale-95"><FaPlusCircle /> Add to Trip</button>
//             </div>
//         </div>
//         <div className="p-4">
//             <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mb-1">{data.customerName}</h4>
//             <p className="text-[10px] text-green-600 font-black uppercase mb-3 tracking-widest">Zone : {data.zone}</p>
//             <div className="space-y-1 mb-4 text-[11px] text-slate-500">
//                 <p className="flex gap-1"><span className="font-bold text-slate-700">Location :</span> <span className="truncate">{data.address}</span></p>
//                 <p className="flex gap-1"><span className="font-bold text-slate-700">District :</span> <span className="truncate">{data.district}</span><span className="font-bold text-slate-700">Thana :</span>{data.thana}</p>
//                 <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver :</span> {data.receiverNumber}</p>
//             </div>
//             <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
//                 {data.products?.map((p, i) => (
//                     <div key={i} className="flex justify-between text-[10px] py-0.5">
//                         <span className="text-slate-600 font-bold truncate pr-4 uppercase">{p.model}</span>
//                         <span className="text-blue-600 font-black shrink-0">{p.quantity} PCS</span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     </div>
// );

// const QueueItem = ({ item, onRemove }) => (
//     <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative group hover:border-green-200 transition-all">
//         <button onClick={() => onRemove(item._id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={16} /></button>
//         <div className="flex flex-col md:flex-row gap-6">
//             <div className="md:w-1/2">
//             <span className="text-[10px]  font-bold">Date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</span>
//                 <h4 className="font-black text-slate-800 uppercase tracking-tight truncate">{item.customerName}</h4>
//                 <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">Zone: {item.zone}</span>
//                 <div className="mt-2 space-y-1 text-[11px] text-slate-500 font-medium">
//                     <p className="flex gap-1"><span className="font-bold text-slate-700">Location :</span> <span className="truncate">{item.address}</span></p>
//                     <p className="flex gap-1"><span className="font-bold text-slate-700">District :</span> <span className="truncate">{item.district}</span><span className="font-bold text-slate-700">Thana :</span>{item.thana}</p>
//                     <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver :</span> {item.receiverNumber}</p>
//                 </div>
//             </div>
//             <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
//                 <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Load Details</p>
//                 <div className="space-y-1.5">
//                     {item.products?.map((p, i) => (
//                         <div key={i} className="flex justify-between items-center text-[11px]">
//                             <span className="text-slate-700 font-bold uppercase">{p.model}</span>
//                             <span className="font-black text-green-600">{p.quantity} <span className="text-[9px] text-slate-400">PCS</span></span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     </div>
// );

// const SkeletonCard = () => (
//     <div className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
//         <div className="h-4 bg-slate-100 rounded w-1/3"></div>
//         <div className="h-6 bg-slate-100 rounded w-3/4"></div>
//         <div className="space-y-2">
//             <div className="h-3 bg-slate-50 rounded"></div>
//             <div className="h-3 bg-slate-50 rounded w-5/6"></div>
//         </div>
//     </div>
// );

// const EmptyState = ({ message }) => (
//     <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
//         <FaBoxOpen className="mx-auto text-slate-200 mb-4" size={48} />
//         <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{message}</p>
//     </div>
// );

// export default CreateDelivery;




import React, { useEffect, useState, useCallback } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import {
    FaEdit, FaTrashAlt, FaUserEdit, FaTimes,
    FaSave, FaBoxOpen, FaPlusCircle, FaTruck, FaPhoneAlt, FaIdBadge, FaCarSide, FaBuilding
} from "react-icons/fa";
import EditCreateDeliveryChallanModal from "../Component/EditCreateDelliveryChallanModal";
import useAuth from "../hooks/useAuth";

const CreateDelivery = () => {
    const axiosSecure = useAxiosSecure();
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(false);
    const { searchText } = useSearch();
    const { role } = useRole();
    const { user } = useAuth();

    const [deliveryInfo, setDeliveryInfo] = useState({
        vehicleNumber: "",
        vendorName: "",
        vendorNumber: "",
        driverName: "",
        driverNumber: ""
    });

    const [deliveryQueue, setDeliveryQueue] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);
    const [vehicleSuggestions, setVehicleSuggestions] = useState([]);

    const handleDeliveryInfoChange = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    };

    const fetchChallans = useCallback(async (search) => {
        if (!search) { setChallans([]); return; }
        setLoading(true);
        try {
            const res = await axiosSecure.get(`/challans?search=${search}`);
            setChallans(res.data.data || res.data || []);
        } catch (err) {
            console.error("Error fetching challans:", err);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchChallans(searchText);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchText, fetchChallans]);

    const addToDelivery = (challan) => {
        // Already delivered check
        if (challan.status === "delivered") {
            return Swal.fire({
                icon: "warning",
                title: "Already Delivered",
                text: `${challan.customerName} এর challan ইতিমধ্যে deliver হয়ে গেছে।`,
                timer: 2000,
                showConfirmButton: false,
            });
        }
        if (!deliveryQueue.some(item => item._id === challan._id)) {
            setDeliveryQueue([...deliveryQueue, challan]);
        } else {
            Swal.fire({ icon: 'info', title: 'Already Added', text: 'This challan is already in the queue.', timer: 1500, showConfirmButton: false });
        }
    };

    const handleEditClick = (challan) => {
        setEditingChallan(JSON.parse(JSON.stringify(challan)));
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingChallan(prev => ({ ...prev, [name]: value }));
    };

    const handleProductChange = (index, field, value) => {
        const updated = [...editingChallan.products];
        updated[index][field] = value;
        setEditingChallan({ ...editingChallan, products: updated });
    };

    const handleDeleteProduct = (index) => {
        const updated = [...editingChallan.products];
        updated.splice(index, 1);
        setEditingChallan({ ...editingChallan, products: updated });
    };

    const handleUpdateChallan = async () => {
        try {
            const res = await axiosSecure.patch(`/challans/${editingChallan._id}`, editingChallan);
            if (res.data.modifiedCount || res.data.success) {
                Swal.fire("Updated", "Challan updated successfully", "success");
                fetchChallans(searchText);
                setDeliveryQueue(prev => prev.map(item => item._id === editingChallan._id ? editingChallan : item));
                setIsEditModalOpen(false);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Update failed", "error");
        }
    };

    const handleConfirmDispatch = async () => {
        if (!deliveryInfo.vehicleNumber || !deliveryInfo.driverNumber) {
            return Swal.fire("Required", "Vehicle and Driver details are mandatory", "warning");
        }
        if (deliveryQueue.length === 0) {
            return Swal.fire("Empty Queue", "Please add at least one challan", "warning");
        }

        // ── Frontend delivered check ──────────────────────────────
        const deliveredItems = deliveryQueue.filter(c => c.status === "delivered");
        if (deliveredItems.length > 0) {
            const names = deliveredItems.map(c => c.customerName).join(", ");
            return Swal.fire({
                icon: "warning",
                title: "Already Delivered",
                text: `এই challan গুলো ইতিমধ্যে delivered: ${names}`,
            });
        }
        // ─────────────────────────────────────────────────────────

        const deliveryData = deliveryQueue.map(c => ({
            ...deliveryInfo,
            challanId: c._id,
            customerName: c.customerName,
            zone: c.zone,
            address: c.address,
            thana: c.thana,
            district: c.district,
            receiverNumber: c.receiverNumber,
            products: c.products,
            createdBy: user?.displayName || user?.email || "unknown",
        }));

        try {
            const res = await axiosSecure.post("/deliveries", deliveryData);
            if (res.data.success) {
                Swal.fire({
                    title: "Dispatch Confirmed",
                    html: `<p>Delivery created successfully!</p><p class="text-green-600 font-bold">Trip ID: ${res.data.tripNumber}</p>`,
                    icon: "success"
                });
                setDeliveryQueue([]);
                setDeliveryInfo({ vehicleNumber: "", vendorName: "", vendorNumber: "", driverName: "", driverNumber: "" });
                // challan list refresh করো যাতে delivered badge দেখায়
                fetchChallans(searchText);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to create delivery. Try again.";
            Swal.fire({
                icon: "error",
                title: "Dispatch Failed",
                text: msg,
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
            <div className="max-w-[1800px] mx-auto">

                {/* Header & Vehicle Info */}
                <div className="bg-white shadow-sm border border-slate-200 mb-3">
                    <div className="bg-slate-900 p-2 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <FaTruck className="text-green-500" /> DELIVERY
                                <span className="text-green-500">PLANNER</span>
                            </h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Operational Control Center</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-slate-400 text-[10px] font-bold uppercase">Active Search Results</p>
                                <p className="text-white font-black text-lg">{challans.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vehicle Number</label>
                            <div className="relative">
                                <FaCarSide className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    value={deliveryInfo.vehicleNumber}
                                    placeholder="Metro-1234"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white transition-all"
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setDeliveryInfo(prev => ({ ...prev, vehicleNumber: val }));
                                        if (val.length > 1) {
                                            try {
                                                const res = await axiosSecure.get(`/vehicles/search?search=${val}`);
                                                setVehicleSuggestions(res.data || []);
                                            } catch (error) { console.error(error); }
                                        } else {
                                            setVehicleSuggestions([]);
                                        }
                                    }}
                                />
                                {vehicleSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[999] mt-2 max-h-60 overflow-y-auto">
                                        {vehicleSuggestions.map((v, i) => (
                                            <div key={i} onClick={() => {
                                                setDeliveryInfo({ vehicleNumber: v.vehicleNumber, vendorName: v.vendorName, vendorNumber: v.vendorPhone, driverName: v.driverName, driverNumber: v.driverPhone });
                                                setVehicleSuggestions([]);
                                            }} className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors">
                                                <p className="font-black text-xs text-slate-800">{v.vehicleNumber}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{v.vendorName} • {v.driverName}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vendor Name</label>
                            <input type="text" name="vendorName" value={deliveryInfo.vendorName} onChange={handleDeliveryInfoChange} placeholder="Vendor Ltd." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vendor Phone</label>
                            <input type="text" name="vendorNumber" value={deliveryInfo.vendorNumber} onChange={handleDeliveryInfoChange} placeholder="017xxxxxxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Driver Name</label>
                            <input type="text" name="driverName" value={deliveryInfo.driverName} onChange={handleDeliveryInfoChange} placeholder="Mr. Driver" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Driver Phone</label>
                            <input type="text" name="driverNumber" value={deliveryInfo.driverNumber} onChange={handleDeliveryInfoChange} placeholder="018xxxxxxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white" />
                        </div>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Challans</h3>
                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold uppercase">{searchText || "Recent"}</span>
                        </div>
                        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? <SkeletonCard /> : challans.length === 0 ? (
                                <EmptyState message="Search for challans to start planning" />
                            ) : (
                                challans.map(c => (
                                    <ChallanCard key={c._id} data={c} onAdd={() => addToDelivery(c)} onEdit={() => handleEditClick(c)} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[75vh]">
                        <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Delivery Queue</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Items ready for dispatch</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[11px] font-black uppercase">{deliveryQueue.length} Selected</span>
                                {deliveryQueue.length > 0 && (
                                    <button onClick={() => setDeliveryQueue([])} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition"><FaTrashAlt size={16} /></button>
                                )}
                            </div>
                        </div>
                        <div className="p-6 flex-grow overflow-y-auto bg-[#fafafa]">
                            {deliveryQueue.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                                    <FaBoxOpen size={64} className="mb-4 opacity-20" />
                                    <p className="font-bold uppercase text-sm tracking-widest">No Items in Queue</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {deliveryQueue.map(item => (
                                        <QueueItem key={item._id} item={item} onRemove={(id) => setDeliveryQueue(q => q.filter(i => i._id !== id))} />
                                    ))}
                                </div>
                            )}
                        </div>
                        {deliveryQueue.length > 0 && (
                            <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                                <button onClick={handleConfirmDispatch}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-4 transition-all active:scale-[0.98]">
                                    CONFIRM DISPATCH & GENERATE TRIP <FaTruck />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditCreateDeliveryChallanModal
                isOpen={isEditModalOpen}
                editingChallan={editingChallan}
                setIsEditModalOpen={setIsEditModalOpen}
                handleEditChange={handleEditChange}
                handleProductChange={handleProductChange}
                handleDeleteProduct={handleDeleteProduct}
                handleUpdateChallan={handleUpdateChallan}
                setEditingChallan={setEditingChallan}
            />
        </div>
    );
};

// ── ChallanCard — delivered হলে badge দেখাবে, Add button থাকবে না ──
const ChallanCard = ({ data, onAdd, onEdit }) => (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all group ${
        data.status === "delivered"
            ? "border-green-200 opacity-80"
            : "border-slate-200 hover:shadow-md"
    }`}>
        <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
            <span className="text-[10px] font-bold">
                Date: {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "—"}
            </span>
            <div className="flex gap-2 items-center">
                {data.status === "delivered" ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-200 flex items-center gap-1">
                        ✓ Delivered
                    </span>
                ) : (
                    <>
                        <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FaUserEdit size={14} />
                        </button>
                        <button onClick={onAdd} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
                            <FaPlusCircle /> Add to Trip
                        </button>
                    </>
                )}
            </div>
        </div>
        <div className="p-4">
            <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mb-1">{data.customerName}</h4>
            <p className="text-[10px] text-green-600 font-black uppercase mb-3 tracking-widest">Zone : {data.zone}</p>
            <div className="space-y-1 mb-4 text-[11px] text-slate-500">
                <p className="flex gap-1"><span className="font-bold text-slate-700">Location :</span> <span className="truncate">{data.address}</span></p>
                <p className="flex gap-1"><span className="font-bold text-slate-700">District :</span> <span className="truncate">{data.district}</span><span className="font-bold text-slate-700"> Thana :</span> {data.thana}</p>
                <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver :</span> {data.receiverNumber}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                {data.products?.map((p, i) => (
                    <div key={i} className="flex justify-between text-[10px] py-0.5">
                        <span className="text-slate-600 font-bold truncate pr-4 uppercase">{p.model}</span>
                        <span className="text-blue-600 font-black shrink-0">{p.quantity} PCS</span>
                    </div>
                ))}
            </div>
            {/* Delivered হলে trip number দেখাও */}
            {data.status === "delivered" && data.tripNumber && (
                <p className="mt-2 text-[10px] text-green-600 font-bold">
                    Trip: {data.tripNumber}
                </p>
            )}
        </div>
    </div>
);

const QueueItem = ({ item, onRemove }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative group hover:border-green-200 transition-all">
        <button onClick={() => onRemove(item._id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><FaTimes size={16} /></button>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
                <span className="text-[10px] font-bold">Date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</span>
                <h4 className="font-black text-slate-800 uppercase tracking-tight truncate">{item.customerName}</h4>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">Zone: {item.zone}</span>
                <div className="mt-2 space-y-1 text-[11px] text-slate-500 font-medium">
                    <p className="flex gap-1"><span className="font-bold text-slate-700">Location :</span> <span className="truncate">{item.address}</span></p>
                    <p className="flex gap-1"><span className="font-bold text-slate-700">District :</span> <span className="truncate">{item.district}</span><span className="font-bold text-slate-700"> Thana :</span> {item.thana}</p>
                    <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver :</span> {item.receiverNumber}</p>
                </div>
            </div>
            <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Load Details</p>
                <div className="space-y-1.5">
                    {item.products?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-700 font-bold uppercase">{p.model}</span>
                            <span className="font-black text-green-600">{p.quantity} <span className="text-[9px] text-slate-400">PCS</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
        <div className="h-6 bg-slate-100 rounded w-3/4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-50 rounded"></div>
            <div className="h-3 bg-slate-50 rounded w-5/6"></div>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
        <FaBoxOpen className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{message}</p>
    </div>
);

export default CreateDelivery;
