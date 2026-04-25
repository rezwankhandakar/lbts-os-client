
import React, { useEffect, useState, useCallback, useRef } from "react";
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
        vehicleNumber: "", vendorName: "", vendorNumber: "", driverName: "", driverNumber: ""
    });
    const [deliveryQueue, setDeliveryQueue] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);
    const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
    const [mobileTab, setMobileTab] = useState("challans");

    const handleDeliveryInfoChange = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    };

    const fetchChallans = useCallback(async (search) => {
        if (!search) { setChallans([]); return; }
        setLoading(true);
        try {
            const res = await axiosSecure.get(`/challans?search=${encodeURIComponent(search)}&page=1&limit=5000`);
            const all = res.data.data || res.data || [];
            setChallans(all.filter(c => c.status !== "delivered"));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [axiosSecure]);

    useEffect(() => {
        const t = setTimeout(() => fetchChallans(searchText), 500);
        return () => clearTimeout(t);
    }, [searchText, fetchChallans]);

    const addToDelivery = (challan) => {
        if (challan.status === "delivered") {
            return Swal.fire({ icon: "warning", title: "Already Delivered", timer: 2000, showConfirmButton: false });
        }
        if (!deliveryQueue.some(item => item._id === challan._id)) {
            setDeliveryQueue([...deliveryQueue, challan]);
            setMobileTab("queue");
        } else {
            Swal.fire({ icon: "info", title: "Already Added", timer: 1500, showConfirmButton: false });
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
                Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
                fetchChallans(searchText);
                setDeliveryQueue(prev => prev.map(item => item._id === editingChallan._id ? editingChallan : item));
                setIsEditModalOpen(false);
            }
        } catch (err) {
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
        const deliveredItems = deliveryQueue.filter(c => c.status === "delivered");
        if (deliveredItems.length > 0) {
            return Swal.fire({ icon: "warning", title: "Already Delivered", text: deliveredItems.map(c => c.customerName).join(", ") });
        }

        const deliveryData = deliveryQueue.map(c => ({
            ...deliveryInfo,
            challanId: c._id, customerName: c.customerName, zone: c.zone,
            address: c.address, thana: c.thana, district: c.district,
            receiverNumber: c.receiverNumber, products: c.products,
            createdBy: user?.displayName || user?.email || "unknown",
        }));

        try {
            const res = await axiosSecure.post("/deliveries", deliveryData);
            if (res.data.success) {
                Swal.fire({
                    title: "Dispatch Confirmed ✅",
                    html: `<p>Delivery created successfully!</p><p class="text-emerald-600 font-bold mt-1">Trip ID: ${res.data.tripNumber}</p>`,
                    icon: "success"
                });
                setDeliveryQueue([]);
                setDeliveryInfo({ vehicleNumber: "", vendorName: "", vendorNumber: "", driverName: "", driverNumber: "" });
                fetchChallans(searchText);
                setMobileTab("challans");
            }
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to create delivery. Try again.";
            Swal.fire({ icon: "error", title: "Dispatch Failed", text: msg });
        }
    };

    const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white transition-all placeholder-slate-400";

    return (
        <div className="min-h-screen bg-slate-50 page-enter">
            <div className="max-w-[1800px] mx-auto px-2 sm:px-3 lg:px-0">

                {/* ── Header & Vehicle Info ── */}
                <div className="bg-white shadow-sm border border-slate-200 mb-3 rounded-2xl overflow-hidden">

                    {/* Top bar */}
                    <div className="bg-slate-950 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaTruck className="text-white" size={14} />
                                </div>
                                DELIVERY <span className="text-emerald-400">PLANNER</span>
                            </h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-10">Operational Control Center</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right">
                                <p className="text-slate-500 text-[10px] font-bold uppercase">Search Results</p>
                                <p className="text-white font-black text-xl leading-tight">{challans.length}</p>
                            </div>
                            {deliveryQueue.length > 0 && (
                                <span className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase flex-shrink-0">
                                    {deliveryQueue.length} in queue
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Vehicle info grid */}
                    <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">

                        {/* Vehicle Number with autocomplete */}
                        <div className="col-span-2 sm:col-span-1 relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Vehicle No.</label>
                            <div className="relative">
                                <FaCarSide className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                    type="text" value={deliveryInfo.vehicleNumber}
                                    placeholder="Metro-1234"
                                    className={`${inp} pl-8`}
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setDeliveryInfo(prev => ({ ...prev, vehicleNumber: val }));
                                        if (val.length > 1) {
                                            try {
                                                const res = await axiosSecure.get(`/vehicles/search?search=${val}`);
                                                setVehicleSuggestions(res.data || []);
                                            } catch { }
                                        } else { setVehicleSuggestions([]); }
                                    }}
                                    onBlur={() => setTimeout(() => setVehicleSuggestions([]), 150)}
                                />
                                {vehicleSuggestions.length > 0 && (() => {
                                    const inp = document.querySelector('input[placeholder="Metro-1234"]');
                                    const rect = inp ? inp.getBoundingClientRect() : null;
                                    return rect ? (
                                        <div style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
                                            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                                            {vehicleSuggestions.map((v, i) => (
                                                <div key={i} onMouseDown={() => {
                                                    setDeliveryInfo({ vehicleNumber: v.vehicleNumber, vendorName: v.vendorName, vendorNumber: v.vendorPhone, driverName: v.driverName, driverNumber: v.driverPhone });
                                                    setVehicleSuggestions([]);
                                                }} className="p-2.5 hover:bg-orange-50 cursor-pointer border-b last:border-0 transition-colors">
                                                    <p className="font-black text-xs text-slate-800">{v.vehicleNumber}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{v.vendorName} · {v.driverName}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>

                        {[
                            { label: "Vendor Name",  name: "vendorName",   ph: "Vendor Ltd.", icon: <FaBuilding className="text-slate-400 text-xs" /> },
                            { label: "Vendor Phone", name: "vendorNumber", ph: "017xxxxxxxx",  icon: <FaPhoneAlt className="text-slate-400 text-xs" /> },
                            { label: "Driver Name",  name: "driverName",   ph: "Driver Name", icon: <FaIdBadge className="text-slate-400 text-xs" /> },
                            { label: "Driver Phone", name: "driverNumber", ph: "018xxxxxxxx",  icon: <FaPhoneAlt className="text-slate-400 text-xs" /> },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">{f.icon}</span>
                                    <input type="text" name={f.name} value={deliveryInfo[f.name]}
                                        onChange={handleDeliveryInfoChange} placeholder={f.ph}
                                        className={`${inp} pl-8`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Mobile tab switcher ── */}
                <div className="flex xl:hidden mb-3 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <button onClick={() => setMobileTab("challans")}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
                            ${mobileTab === "challans" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                        <FaBoxOpen size={12} /> Challans
                        {challans.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "challans" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                                {challans.length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setMobileTab("queue")}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
                            ${mobileTab === "queue" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                        <FaTruck size={12} /> Queue
                        {deliveryQueue.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "queue" ? "bg-emerald-400 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                                {deliveryQueue.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Main Workspace ── */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-5">

                    {/* ══ LEFT: Challans panel ══ */}
                    <div className={`xl:col-span-4 flex flex-col gap-3 ${mobileTab !== "challans" ? "hidden xl:flex" : ""}`}>
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Challans</h3>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-bold uppercase text-slate-500">{searchText || "Recent"}</span>
                        </div>
                        <div className="space-y-3 max-h-[70vh] xl:max-h-[75vh] overflow-y-auto pr-1">
                            {loading
                                ? <SkeletonCard />
                                : challans.length === 0
                                ? <EmptyState message="Search for challans to start planning" />
                                : challans.map(c => (
                                    <ChallanCard key={c._id} data={c} onAdd={() => addToDelivery(c)} onEdit={() => handleEditClick(c)} />
                                ))
                            }
                        </div>
                    </div>

                    {/* ══ RIGHT: Queue panel ══ */}
                    <div className={`xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[60vh] xl:min-h-[75vh]
                        ${mobileTab !== "queue" ? "hidden xl:flex" : "flex"}`}>

                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Delivery Queue</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Items ready for dispatch</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                                    {deliveryQueue.length} Selected
                                </span>
                                {deliveryQueue.length > 0 && (
                                    <button onClick={() => setDeliveryQueue([])}
                                        className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                                        <FaTrashAlt size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-3 sm:p-5 flex-grow overflow-y-auto bg-slate-50/30">
                            {deliveryQueue.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                                        <FaBoxOpen size={28} className="text-slate-300" />
                                    </div>
                                    <p className="font-bold uppercase text-xs tracking-widest text-slate-400">No Items in Queue</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Add challans from the left panel</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deliveryQueue.map(item => (
                                        <QueueItem key={item._id} item={item}
                                            onRemove={(id) => setDeliveryQueue(q => q.filter(i => i._id !== id))} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {deliveryQueue.length > 0 && (
                            <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                                <button onClick={handleConfirmDispatch}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                                    CONFIRM DISPATCH &amp; GENERATE TRIP <FaTruck size={14} />
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

/* ── ChallanCard ── */
const ChallanCard = ({ data, onAdd, onEdit }) => (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${data.status === "delivered" ? "border-emerald-200 opacity-80" : "border-slate-100 hover:shadow-md hover:border-orange-200"}`}>
        <div className="bg-slate-50 px-3 py-2 flex justify-between items-center border-b border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400">
                {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "—"}
            </span>
            <div className="flex gap-1.5 items-center">
                {data.status === "delivered" ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200">✓ Delivered</span>
                ) : (
                    <>
                        <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                            <FaUserEdit size={13} />
                        </button>
                        <button onClick={onAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all shadow-sm">
                            <FaPlusCircle size={10} /> Add
                        </button>
                    </>
                )}
            </div>
        </div>
        <div className="p-3">
            <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mb-0.5">{data.customerName}</h4>
            <p className="text-[10px] text-emerald-600 font-black uppercase mb-2 tracking-widest">Zone: {data.zone}</p>
            <div className="space-y-0.5 mb-3 text-[11px] text-slate-500">
                <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-600">Location:</span><span className="truncate">{data.address}</span></p>
                <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-600">District:</span><span>{data.district}</span><span className="font-bold text-slate-600">Thana:</span><span>{data.thana}</span></p>
                <p className="flex gap-1"><span className="font-bold text-slate-600">Receiver:</span>{data.receiverNumber}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                {data.products?.map((p, i) => (
                    <div key={i} className="flex justify-between text-[10px] py-0.5">
                        <span className="text-slate-600 font-bold truncate pr-3 uppercase">{p.model}</span>
                        <span className="text-blue-600 font-black flex-shrink-0">{p.quantity} PCS</span>
                    </div>
                ))}
            </div>
            {data.status === "delivered" && data.tripNumber && (
                <p className="mt-1.5 text-[10px] text-emerald-600 font-bold">Trip: {data.tripNumber}</p>
            )}
        </div>
    </div>
);

/* ── QueueItem ── */
const QueueItem = ({ item, onRemove }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm relative group hover:border-emerald-200 transition-all">
        <button onClick={() => onRemove(item._id)} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
            <FaTimes size={13} />
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:w-1/2 pr-6 sm:pr-0">
                <span className="text-[10px] font-semibold text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</span>
                <h4 className="font-black text-slate-800 uppercase tracking-tight truncate text-sm">{item.customerName}</h4>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">Zone: {item.zone}</span>
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                    <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-600">Location:</span><span className="truncate">{item.address}</span></p>
                    <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-600">District:</span><span>{item.district}</span><span className="font-bold text-slate-600">Thana:</span><span>{item.thana}</span></p>
                    <p className="flex gap-1"><span className="font-bold text-slate-600">Receiver:</span>{item.receiverNumber}</p>
                </div>
            </div>
            <div className="sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Load Details</p>
                <div className="space-y-1">
                    {item.products?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-700 font-bold uppercase truncate pr-2">{p.model}</span>
                            <span className="font-black text-emerald-600 flex-shrink-0">{p.quantity} <span className="text-[9px] text-slate-400">PCS</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/* ── Skeleton ── */
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-3 border border-slate-100 animate-pulse space-y-2">
        <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
        <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
        <div className="space-y-1.5"><div className="h-2.5 bg-slate-50 rounded-lg" /><div className="h-2.5 bg-slate-50 rounded-lg w-5/6" /></div>
    </div>
);

/* ── Empty state ── */
const EmptyState = ({ message }) => (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FaBoxOpen className="text-slate-300" size={28} />
        </div>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{message}</p>
    </div>
);

export default CreateDelivery;
