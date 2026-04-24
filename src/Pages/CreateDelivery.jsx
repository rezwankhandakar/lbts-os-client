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

    /* mobile: which panel is active — "challans" | "queue" */
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
        } catch (err) {
            console.error("Error fetching challans:", err);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        const t = setTimeout(() => fetchChallans(searchText), 500);
        return () => clearTimeout(t);
    }, [searchText, fetchChallans]);

    const addToDelivery = (challan) => {
        if (challan.status === "delivered") {
            return Swal.fire({ icon: "warning", title: "Already Delivered", text: `${challan.customerName} এর challan ইতিমধ্যে deliver হয়ে গেছে।`, timer: 2000, showConfirmButton: false });
        }
        if (!deliveryQueue.some(item => item._id === challan._id)) {
            setDeliveryQueue([...deliveryQueue, challan]);
            /* auto-switch to queue tab on mobile */
            setMobileTab("queue");
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
        const deliveredItems = deliveryQueue.filter(c => c.status === "delivered");
        if (deliveredItems.length > 0) {
            const names = deliveredItems.map(c => c.customerName).join(", ");
            return Swal.fire({ icon: "warning", title: "Already Delivered", text: `এই challan গুলো ইতিমধ্যে delivered: ${names}` });
        }

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
                fetchChallans(searchText);
                setMobileTab("challans");
            }
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to create delivery. Try again.";
            Swal.fire({ icon: "error", title: "Dispatch Failed", text: msg });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
            <div className="max-w-[1800px] mx-auto px-2 sm:px-3 lg:px-0">

                {/* ── Header & Vehicle Info ── */}
                <div className="bg-white shadow-sm border border-slate-200 mb-3 rounded-b-xl overflow-hidden">

                    {/* Top bar */}
                    <div className="bg-slate-900 px-3 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                                <FaTruck className="text-green-500 shrink-0" />
                                DELIVERY <span className="text-green-500">PLANNER</span>
                            </h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Operational Control Center</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right">
                                <p className="text-slate-400 text-[10px] font-bold uppercase">Search Results</p>
                                <p className="text-white font-black text-lg leading-tight">{challans.length}</p>
                            </div>
                            {deliveryQueue.length > 0 && (
                                <span className="bg-green-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase shrink-0">
                                    {deliveryQueue.length} in queue
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Vehicle info grid */}
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">

                        {/* Vehicle Number with autocomplete */}
                        <div className="col-span-2 sm:col-span-1 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Vehicle No.</label>
                            <div className="relative">
                                <FaCarSide className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                                <input
                                    ref={el => { if (el) el._vehicleInput = true; }}
                                    type="text"
                                    value={deliveryInfo.vehicleNumber}
                                    placeholder="Metro-1234"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white transition-all"
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setDeliveryInfo(prev => ({ ...prev, vehicleNumber: val }));
                                        if (val.length > 1) {
                                            try {
                                                const res = await axiosSecure.get(`/vehicles/search?search=${val}`);
                                                setVehicleSuggestions(res.data || []);
                                            } catch (err) { console.error(err); }
                                        } else {
                                            setVehicleSuggestions([]);
                                        }
                                    }}
                                    onBlur={() => setTimeout(() => setVehicleSuggestions([]), 150)}
                                />
                                {vehicleSuggestions.length > 0 && (() => {
                                    const inp = document.querySelector('input[placeholder="Metro-1234"]');
                                    const rect = inp ? inp.getBoundingClientRect() : null;
                                    return rect ? (
                                        <div
                                            style={{
                                                position: "fixed",
                                                top: rect.bottom + 4,
                                                left: rect.left,
                                                width: rect.width,
                                                zIndex: 9999,
                                            }}
                                            className="bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                                        >
                                            {vehicleSuggestions.map((v, i) => (
                                                <div key={i} onMouseDown={() => {
                                                    setDeliveryInfo({ vehicleNumber: v.vehicleNumber, vendorName: v.vendorName, vendorNumber: v.vendorPhone, driverName: v.driverName, driverNumber: v.driverPhone });
                                                    setVehicleSuggestions([]);
                                                }} className="p-2.5 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors">
                                                    <p className="font-black text-xs text-slate-800">{v.vehicleNumber}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{v.vendorName} • {v.driverName}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>

                        {[
                            { label: "Vendor Name",  name: "vendorName",   placeholder: "Vendor Ltd." },
                            { label: "Vendor Phone", name: "vendorNumber", placeholder: "017xxxxxxxx" },
                            { label: "Driver Name",  name: "driverName",   placeholder: "Mr. Driver" },
                            { label: "Driver Phone", name: "driverNumber", placeholder: "018xxxxxxxx" },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">{f.label}</label>
                                <input
                                    type="text" name={f.name} value={deliveryInfo[f.name]}
                                    onChange={handleDeliveryInfoChange} placeholder={f.placeholder}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-green-500 focus:bg-white transition-all"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Mobile tab switcher ── */}
                <div className="flex xl:hidden mb-3 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <button
                        onClick={() => setMobileTab("challans")}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
                            ${mobileTab === "challans" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                        <FaBoxOpen size={12} /> Challans
                        {challans.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "challans" ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                                {challans.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileTab("queue")}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
                            ${mobileTab === "queue" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                        <FaTruck size={12} /> Queue
                        {deliveryQueue.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "queue" ? "bg-green-400 text-white" : "bg-green-100 text-green-700"}`}>
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
                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold uppercase">{searchText || "Recent"}</span>
                        </div>
                        <div className="space-y-3 max-h-[70vh] xl:max-h-[75vh] overflow-y-auto pr-1">
                            {loading ? (
                                <SkeletonCard />
                            ) : challans.length === 0 ? (
                                <EmptyState message="Search for challans to start planning" />
                            ) : (
                                challans.map(c => (
                                    <ChallanCard key={c._id} data={c} onAdd={() => addToDelivery(c)} onEdit={() => handleEditClick(c)} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ══ RIGHT: Queue panel ══ */}
                    <div className={`xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden
                        ${mobileTab !== "queue" ? "hidden xl:flex" : "flex"}
                        min-h-[60vh] xl:min-h-[75vh]`}>

                        {/* Queue header */}
                        <div className="px-3 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight">Delivery Queue</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Items ready for dispatch</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                                    {deliveryQueue.length} Selected
                                </span>
                                {deliveryQueue.length > 0 && (
                                    <button onClick={() => setDeliveryQueue([])} className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition">
                                        <FaTrashAlt size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Queue body */}
                        <div className="p-3 sm:p-5 flex-grow overflow-y-auto bg-[#fafafa]">
                            {deliveryQueue.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16">
                                    <FaBoxOpen size={52} className="mb-3 opacity-20" />
                                    <p className="font-bold uppercase text-xs tracking-widest">No Items in Queue</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Add challans from the left panel</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deliveryQueue.map(item => (
                                        <QueueItem
                                            key={item._id} item={item}
                                            onRemove={(id) => setDeliveryQueue(q => q.filter(i => i._id !== id))}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dispatch button */}
                        {deliveryQueue.length > 0 && (
                            <div className="p-3 bg-white border-t border-slate-100">
                                <button onClick={handleConfirmDispatch}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm sm:text-base shadow-lg shadow-green-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
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

/* ── ChallanCard ── */
const ChallanCard = ({ data, onAdd, onEdit }) => (
    <div className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
        data.status === "delivered"
            ? "border-green-200 opacity-80"
            : "border-slate-200 hover:shadow-md"
    }`}>
        {/* Card header */}
        <div className="bg-slate-50 px-3 py-2 flex justify-between items-center border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
                {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "—"}
            </span>
            <div className="flex gap-1.5 items-center">
                {data.status === "delivered" ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-200 flex items-center gap-1">
                        ✓ Delivered
                    </span>
                ) : (
                    <>
                        <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FaUserEdit size={13} />
                        </button>
                        <button onClick={onAdd} className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all shadow-sm active:scale-95">
                            <FaPlusCircle size={10} /> Add
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Card body */}
        <div className="p-3">
            <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mb-0.5">{data.customerName}</h4>
            <p className="text-[10px] text-green-600 font-black uppercase mb-2 tracking-widest">Zone: {data.zone}</p>
            <div className="space-y-0.5 mb-3 text-[11px] text-slate-500">
                <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-700">Location:</span><span className="truncate">{data.address}</span></p>
                <p className="flex gap-1 flex-wrap">
                    <span className="font-bold text-slate-700">District:</span><span>{data.district}</span>
                    <span className="font-bold text-slate-700">Thana:</span><span>{data.thana}</span>
                </p>
                <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver:</span>{data.receiverNumber}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                {data.products?.map((p, i) => (
                    <div key={i} className="flex justify-between text-[10px] py-0.5">
                        <span className="text-slate-600 font-bold truncate pr-3 uppercase">{p.model}</span>
                        <span className="text-blue-600 font-black shrink-0">{p.quantity} PCS</span>
                    </div>
                ))}
            </div>
            {data.status === "delivered" && data.tripNumber && (
                <p className="mt-1.5 text-[10px] text-green-600 font-bold">Trip: {data.tripNumber}</p>
            )}
        </div>
    </div>
);

/* ── QueueItem ── */
const QueueItem = ({ item, onRemove }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm relative group hover:border-green-200 transition-all">
        <button onClick={() => onRemove(item._id)} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 transition-colors">
            <FaTimes size={14} />
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Left: customer info */}
            <div className="sm:w-1/2 pr-6 sm:pr-0">
                <span className="text-[10px] font-bold text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}
                </span>
                <h4 className="font-black text-slate-800 uppercase tracking-tight truncate text-sm">{item.customerName}</h4>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">Zone: {item.zone}</span>
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                    <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-700">Location:</span><span className="truncate">{item.address}</span></p>
                    <p className="flex gap-1 flex-wrap">
                        <span className="font-bold text-slate-700">District:</span><span>{item.district}</span>
                        <span className="font-bold text-slate-700">Thana:</span><span>{item.thana}</span>
                    </p>
                    <p className="flex gap-1"><span className="font-bold text-slate-700">Receiver:</span>{item.receiverNumber}</p>
                </div>
            </div>

            {/* Right: products */}
            <div className="sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Load Details</p>
                <div className="space-y-1">
                    {item.products?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-700 font-bold uppercase truncate pr-2">{p.model}</span>
                            <span className="font-black text-green-600 shrink-0">{p.quantity} <span className="text-[9px] text-slate-400">PCS</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/* ── Skeleton ── */
const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-3 border border-slate-100 animate-pulse space-y-2">
        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
        <div className="h-5 bg-slate-100 rounded w-3/4"></div>
        <div className="space-y-1.5">
            <div className="h-2.5 bg-slate-50 rounded"></div>
            <div className="h-2.5 bg-slate-50 rounded w-5/6"></div>
        </div>
    </div>
);

/* ── Empty state ── */
const EmptyState = ({ message }) => (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
        <FaBoxOpen className="mx-auto text-slate-200 mb-3" size={40} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{message}</p>
    </div>
);

export default CreateDelivery;