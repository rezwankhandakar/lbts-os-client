
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import {
    FaEdit, FaTrashAlt, FaUserEdit, FaTimes,
    FaSave, FaBoxOpen, FaPlusCircle, FaTruck, FaMapMarkerAlt, FaPhoneAlt
} from "react-icons/fa";

const CreateDelivery = () => {
    const axiosSecure = useAxiosSecure();
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(false);
    const { searchText } = useSearch();
    const { role } = useRole();

    // Delivery Queue State
    const [deliveryQueue, setDeliveryQueue] = useState([]);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchChallans = async (m, y, search) => {
        setLoading(true);
        try {
            let url = `/challans?month=${m}&year=${y}`;
            if (search) url += `&search=${search}`;
            const res = await axiosSecure.get(url);
            setChallans(res.data.data || res.data || []);
        } catch (err) {
            console.error("Error fetching challans:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchChallans(month, year, searchText);
    }, [month, year, searchText]);

    const addToDelivery = (challan) => {
        const isExist = deliveryQueue.find(item => item._id === challan._id);
        if (!isExist) {
            setDeliveryQueue([...deliveryQueue, challan]);
        } else {
            Swal.fire("Note", "Already in delivery list", "info");
        }
    };

    const removeFromQueue = (id) => {
        setDeliveryQueue(deliveryQueue.filter(item => item._id !== id));
    };

    const handleEditClick = (challan) => {
        setEditingChallan(JSON.parse(JSON.stringify(challan)));
        setIsEditModalOpen(true);
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...editingChallan.products];
        updatedProducts[index][field] = value;
        setEditingChallan({ ...editingChallan, products: updatedProducts });
    };

    const handleSaveChallanUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosSecure.patch(`/challans/${editingChallan._id}`, editingChallan);
            if (res.data.success) {
                Swal.fire("Updated!", "Challan data updated.", "success");
                setIsEditModalOpen(false);
                fetchChallans(month, year, searchText);
                // যদি ওই আইটেম কিউতে থাকে তবে সেখানেও আপডেট করুন
                setDeliveryQueue(prev => prev.map(item => item._id === editingChallan._id ? editingChallan : item));
            }
        } catch (err) {
            Swal.fire("Error", "Update failed", "error");
        }
    };

    const filteredChallans = challans.filter((c) => {
        return !searchText ||
            [c.customerName, c.address, c.district, c.zone].some(v => v?.toLowerCase().includes(searchText.toLowerCase()));
    });

    const handleRemoveProduct = (index) => {
        const updatedProducts = editingChallan.products.filter((_, i) => i !== index);
        setEditingChallan({ ...editingChallan, products: updatedProducts });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-2 md:p-6 font-sans">
            <div className="max-w-[1700px] mx-auto">

                {/* --- Header Section --- */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-8 border-green-600">
                    <div className="flex gap-2">
                        <select className="border-2 border-gray-100 px-4 py-2 rounded-xl font-bold text-gray-700 outline-none focus:border-green-500" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                            ))}
                        </select>
                        <input type="number" className="border-2 border-gray-100 px-4 py-2 rounded-xl w-28 font-bold text-gray-700 outline-none focus:border-green-500" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">Delivery <span className="text-green-600">Planner</span></h2>
                    <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-black border border-green-200">Total: {filteredChallans.length}</div>
                </div>

                {/* --- Main Dashboard --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                    {/* LEFT SIDE: Available Challans (5 Columns) */}
                    <div className="xl:col-span-4 space-y-4 max-h-[82vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-xs font-black text-gray-400 uppercase ml-1">Challan List</p>

                        {loading ? (
                            <div className="p-10 text-center font-bold text-green-600 animate-bounce">Loading...</div>
                        ) : (
                            filteredChallans.map((c) => (
                                <div key={c._id} className="bg-white rounded-2xl shadow-sm border-b-4 border-gray-200 hover:border-green-500 transition-all overflow-hidden group">

                                    {/* Card Header */}
                                    <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                                        <span className="text-[10px] font-mono tracking-widest opacity-70 uppercase">#{c._id.slice(-6)}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick(c)} className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition">
                                                <FaUserEdit size={14} />
                                            </button>
                                            <button onClick={() => addToDelivery(c)} className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-black transition shadow-lg">
                                                <FaPlusCircle /> ADD
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-black text-blue-900 uppercase truncate mb-1">{c.customerName}</h3>
                                        <p className="text-[11px] text-green-700 font-bold uppercase mb-2 tracking-tighter">Zone: {c.zone}</p>

                                        {/* Customer Details - Wrapped for long addresses */}
                                        <div className="space-y-1 mb-4 border-l-2 border-gray-100 pl-2">
                                            <p className="text-[11px] text-gray-500 whitespace-normal break-words leading-relaxed">
                                                <strong className="text-gray-700">Address:</strong> {c.address}
                                            </p>
                                            <p className="text-[11px] text-gray-500 whitespace-normal break-words">
                                                <strong className="text-gray-700">Thana:</strong> {c.thana}, <strong className="text-gray-700">District:</strong> {c.district}
                                            </p>
                                            <p className="text-[11px] text-gray-600 font-bold italic">
                                                <strong className="text-gray-700 not-italic">Receiver:</strong> {c.receiverNumber}
                                            </p>
                                        </div>

                                        {/* Product List Table */}
                                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                                            <table className="w-full text-[11px]">
                                                <thead>
                                                    <tr className="text-gray-400 uppercase font-black border-b border-gray-200">
                                                        <th className="pb-1 text-left">Model</th>
                                                        <th className="pb-1 text-right">Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {c.products?.map((p, pIdx) => (
                                                        <tr key={pIdx}>
                                                            <td className="py-1.5 font-bold text-gray-700 uppercase break-all">{p.model}</td>
                                                            <td className="py-1.5 text-right font-black text-blue-600">{p.quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Footer with Total */}
                                        <div className="mt-3 pt-2 flex justify-between items-center border-t border-dashed border-gray-300">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                                {c.products?.length || 0} Models
                                            </span>
                                            <span className="text-base font-black text-gray-800">
                                                {c.products?.reduce((sum, p) => sum + Number(p.quantity), 0)}
                                                <small className="text-[10px] ml-1 uppercase text-gray-500">Total Pcs</small>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT SIDE: Delivery Queue (8 Columns) */}
                    <div className="xl:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-200 min-h-[70vh] flex flex-col overflow-hidden">
                        <div className="bg-green-600 p-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight"><FaTruck /> Delivery Queue</h3>
                                <p className="text-[10px] font-bold opacity-80 uppercase">Prepare these challans for final delivery</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{deliveryQueue.length} Selected</span>
                                {deliveryQueue.length > 0 && (
                                    <button onClick={() => setDeliveryQueue([])} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-black transition">CLEAR</button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 flex-grow overflow-y-auto max-h-[65vh] bg-gray-50/50">
                            {deliveryQueue.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <FaTruck size={100} />
                                    <p className="text-2xl font-black mt-4">Queue is empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {deliveryQueue.map((item) => (
                                        <div key={item._id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-shadow">
                                            <button onClick={() => removeFromQueue(item._id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"><FaTimes size={20} /></button>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                {/* Info */}
                                                <div className="md:col-span-5 border-r border-gray-100 pr-4">
                                                    <h4 className="text-lg font-black text-blue-900 uppercase leading-none mb-2">{item.customerName}</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <p className="flex items-start gap-2 text-gray-600"><FaMapMarkerAlt className="mt-1 text-red-500 shrink-0" /> <span>{item.address}, {item.thana}, {item.district}</span></p>
                                                        <p className="flex items-center gap-2 text-gray-600 font-bold"><FaPhoneAlt className="text-green-600 shrink-0" /> {item.receiverNumber}</p>
                                                        <p className="mt-2 inline-block bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Zone: {item.zone}</p>
                                                    </div>
                                                </div>

                                                {/* Products Table */}
                                                <div className="md:col-span-7">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Product Details</p>
                                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="bg-gray-100 text-gray-500 font-bold uppercase">
                                                                <tr>
                                                                    <th className="p-2">Model</th>
                                                                    <th className="p-2 text-center">Qty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.products?.map((p, pIdx) => (
                                                                    <tr key={pIdx} className="border-b border-gray-200/50">
                                                                        <td className="p-2 font-bold text-gray-700">{p.model}</td>
                                                                        <td className="p-2 text-center"><span className="font-black text-green-600">{p.quantity} PCS</span></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Final Action */}
                        {deliveryQueue.length > 0 && (
                            <div className="p-6 bg-white border-t-2 border-gray-100">
                                <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95 uppercase tracking-tighter">
                                    Confirm Dispatch & Print Challan <FaTruck size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- EDIT MODAL (Previous Style Maintained) --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] border border-gray-100">

                        {/* --- Compact Header --- */}
                        <div className="bg-gray-900 p-4 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg"><FaEdit className="text-green-400" size={14} /></div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Update Challan</h3>
                                    <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase opacity-70">ID: {editingChallan._id.slice(-6)}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-red-500/20 p-2 rounded-full transition-colors group">
                                <FaTimes size={16} className="text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>

                        {/* --- Scrollable Body (Single Column) --- */}
                        <form onSubmit={handleSaveChallanUpdate} className="p-5 overflow-y-auto custom-scrollbar space-y-5 bg-gray-50/30">

                            {/* Customer Information Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">Customer Name</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-blue-900 focus:border-blue-500 outline-none shadow-sm transition-all" value={editingChallan.customerName} onChange={(e) => setEditingChallan({ ...editingChallan, customerName: e.target.value })} required />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">Receiver Phone</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500" value={editingChallan.receiverNumber} onChange={(e) => setEditingChallan({ ...editingChallan, receiverNumber: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">Zone</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500" value={editingChallan.zone} onChange={(e) => setEditingChallan({ ...editingChallan, zone: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">Thana</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500" value={editingChallan.thana} onChange={(e) => setEditingChallan({ ...editingChallan, thana: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">District</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-green-500" value={editingChallan.district} onChange={(e) => setEditingChallan({ ...editingChallan, district: e.target.value })} />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mb-1">Address</label>
                                    <textarea rows="2" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-green-500 resize-none shadow-sm" value={editingChallan.address} onChange={(e) => setEditingChallan({ ...editingChallan, address: e.target.value })} />
                                </div>
                            </div>

                            {/* --- Compact Product List --- */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                    <h4 className="text-[10px] font-black text-gray-800 uppercase flex items-center gap-2">
                                        <FaBoxOpen className="text-blue-500" /> Product Items ({editingChallan.products?.length})
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    {editingChallan.products?.map((product, index) => (
                                        <div key={index} className="flex gap-2 items-center group">
                                            <div className="flex-grow grid grid-cols-12 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group-hover:border-blue-200 transition-all">
                                                <div className="col-span-8 p-1">
                                                    <input
                                                        type="text"
                                                        className="w-full px-2 py-1 text-xs font-bold text-gray-700 bg-transparent outline-none uppercase"
                                                        placeholder="Model"
                                                        value={product.model}
                                                        onChange={(e) => handleProductChange(index, "model", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-4 border-l border-gray-100 bg-blue-50/30 p-1">
                                                    <input
                                                        type="number"
                                                        className="w-full px-2 py-1 text-xs font-black text-center text-blue-700 bg-transparent outline-none"
                                                        placeholder="Qty"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                <FaTrashAlt size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        {/* --- Action Footer --- */}
                        <div className="p-5 bg-white border-t border-gray-50 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSaveChallanUpdate}
                                className="flex-[2] py-3 bg-green-600 rounded-xl font-black text-white shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                            >
                                <FaSave /> Update All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateDelivery;