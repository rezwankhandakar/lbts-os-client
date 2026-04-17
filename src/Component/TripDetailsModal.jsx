
// import React, { useState, useEffect } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";
// import {
//   X, Truck, User, Package, PhoneForwarded,
//   Plus, Trash2, Pencil, Check, RotateCcw, StickyNote, Save, Wallet, ChevronDown
// } from "lucide-react";
// import useAuth from "../hooks/useAuth";

// /* ─── Field ─── */
// const Field = ({ label, value, onChange }) => (
//   <div className="space-y-0.5">
//     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
//     <input
//       className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
//       value={value}
//       onChange={e => onChange(e.target.value)}
//     />
//   </div>
// );

// /* ─── Edit Trip Info Modal ─── */
// const EditTripInfoModal = ({ trip, onSave, onClose, axiosSecure, updatedBy }) => {
//   const [form, setForm] = useState({
//     vehicleNumber: trip.vehicleNumber || "",
//     vendorName: trip.vendorName || "",
//     vendorNumber: trip.vendorNumber || "",
//     driverName: trip.driverName || "",
//     driverNumber: trip.driverNumber || "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await axiosSecure.patch(`/deliveries/${trip._id}/trip-info`, { ...form, updatedBy });
//       Swal.fire({ icon: "success", title: "Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//       onSave(form, res.data?.data);
//       onClose();
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
//     }
//     setSaving(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
//       <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
//         <div className="px-4 py-3 bg-slate-800 flex items-center justify-between text-white shrink-0">
//           <div>
//             <p className="font-bold text-sm">Edit Trip Info</p>
//             <p className="text-slate-400 text-[10px] font-mono">{trip.tripNumber}</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={16} /></button>
//         </div>
//         <div className="p-4 space-y-4 overflow-y-auto flex-1">
//           <div>
//             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//               <Truck size={10} className="text-indigo-400" /> Vehicle
//             </p>
//             <Field label="Vehicle Number" value={form.vehicleNumber} onChange={v => setForm(f => ({ ...f, vehicleNumber: v }))} />
//           </div>
//           <div>
//             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//               <Package size={10} className="text-indigo-400" /> Vendor
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <Field label="Vendor Name" value={form.vendorName} onChange={v => setForm(f => ({ ...f, vendorName: v }))} />
//               <Field label="Vendor Phone" value={form.vendorNumber} onChange={v => setForm(f => ({ ...f, vendorNumber: v }))} />
//             </div>
//           </div>
//           <div>
//             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//               <User size={10} className="text-indigo-400" /> Driver
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <Field label="Driver Name" value={form.driverName} onChange={v => setForm(f => ({ ...f, driverName: v }))} />
//               <Field label="Driver Phone" value={form.driverNumber} onChange={v => setForm(f => ({ ...f, driverNumber: v }))} />
//             </div>
//           </div>
//         </div>
//         <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
//           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
//           <button onClick={handleSave} disabled={saving}
//             className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
//             <Check size={13} /> {saving ? "Saving…" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ─── Edit Challan Modal ─── */
// const EditChallanCard = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
//   const [form, setForm] = useState({
//     customerName: challan.customerName || "",
//     address: challan.address || "",
//     thana: challan.thana || "",
//     district: challan.district || "",
//     receiverNumber: challan.receiverNumber || "",
//     zone: challan.zone || "",
//   });
//   const [products, setProducts] = useState((challan.products || []).map(p => ({ ...p })));
//   const [saving, setSaving] = useState(false);

//   const handleProductChange = (i, field, val) =>
//     setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
//   const handleAddProduct = () =>
//     setProducts(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", quantity: 1 }]);
//   const handleDeleteProduct = async (i) => {
//     const p = products[i];
//     if (products.length <= 1) return Swal.fire({ icon: "warning", title: "Cannot remove last product" });
//     if (p._id && !p._id.startsWith("new_")) {
//       try { await axiosSecure.delete(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`); }
//       catch { return Swal.fire({ icon: "error", title: "Delete failed" }); }
//     }
//     setProducts(prev => prev.filter((_, idx) => idx !== i));
//   };
//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}`, { ...form, updatedBy });
//       for (const p of products) {
//         if (!p.productName || !p.model) continue;
//         const isNew = !p._id || p._id.startsWith("new_");
//         if (isNew) await axiosSecure.post(`/deliveries/${tripId}/challan/${challan.challanId}/product`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
//         else await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
//       }
//       Swal.fire({ icon: "success", title: "Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//       onSave({ ...challan, ...form, products }, res.data?.data);
//       onClose();
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
//     }
//     setSaving(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
//       <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
//         <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between text-white shrink-0">
//           <div>
//             <p className="font-bold text-sm">Edit Challan</p>
//             <p className="text-indigo-200 text-[10px] font-mono">{challan.customerName}</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
//         </div>
//         <div className="p-4 space-y-3 overflow-y-auto flex-1">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <div className="col-span-1 sm:col-span-2"><Field label="Customer Name" value={form.customerName} onChange={v => setForm(f => ({ ...f, customerName: v }))} /></div>
//             <div className="col-span-1 sm:col-span-2"><Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} /></div>
//             <Field label="Thana" value={form.thana} onChange={v => setForm(f => ({ ...f, thana: v }))} />
//             <Field label="District" value={form.district} onChange={v => setForm(f => ({ ...f, district: v }))} />
//             <Field label="Receiver Number" value={form.receiverNumber} onChange={v => setForm(f => ({ ...f, receiverNumber: v }))} />
//             <Field label="Zone" value={form.zone} onChange={v => setForm(f => ({ ...f, zone: v }))} />
//           </div>
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Products</p>
//               <button onClick={handleAddProduct} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-lg transition">
//                 <Plus size={10} /> Add
//               </button>
//             </div>
//             <div className="space-y-2">
//               {products.map((p, i) => (
//                 <div key={p._id || i} className="flex gap-2 items-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
//                   <input placeholder="Product name" value={p.productName} onChange={e => handleProductChange(i, "productName", e.target.value)}
//                     className="flex-1 min-w-0 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400" />
//                   <input placeholder="Model" value={p.model} onChange={e => handleProductChange(i, "model", e.target.value)}
//                     className="w-16 sm:w-20 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 uppercase" />
//                   <input type="number" min="1" value={p.quantity} onChange={e => handleProductChange(i, "quantity", e.target.value)}
//                     className="w-10 sm:w-12 text-xs bg-white border border-slate-200 rounded px-1 py-1.5 outline-none text-center font-bold" />
//                   <button onClick={() => handleDeleteProduct(i)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
//                     <Trash2 size={12} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
//           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
//           <button onClick={handleSave} disabled={saving}
//             className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
//             <Check size={13} /> {saving ? "Saving…" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ─── Return Modal ─── */
// const ReturnModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
//   const isEdit = !!(challan.returnedProducts?.length > 0);
//   const [returnItems, setReturnItems] = useState(
//     (challan.products || []).map(p => ({
//       _id: p._id, productName: p.productName, model: p.model,
//       deliveredQty: Number(p.quantity) || 0,
//       returnQty: challan.returnedProducts?.find(r => r._id === p._id)?.returnQty || 0,
//     }))
//   );
//   const [returnNote, setReturnNote] = useState(challan.returnNote || "");
//   const [saving, setSaving] = useState(false);

//   const handleQtyChange = (i, val) => {
//     const max = returnItems[i].deliveredQty;
//     setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, returnQty: Math.min(Math.max(0, Number(val)), max) } : r));
//   };
//   const handleFieldChange = (i, field, val) =>
//     setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
//   const handleAddItem = () =>
//     setReturnItems(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", deliveredQty: 999, returnQty: 1 }]);
//   const handleRemoveItem = (i) => { if (returnItems.length > 1) setReturnItems(prev => prev.filter((_, idx) => idx !== i)); };

//   const activeReturns = returnItems.filter(r => r.returnQty > 0);
//   const totalReturn = activeReturns.reduce((s, r) => s + r.returnQty, 0);

//   const handleSave = async () => {
//     if (activeReturns.length === 0) { Swal.fire({ icon: "warning", title: "No return items" }); return; }
//     setSaving(true);
//     try {
//       const returnedProducts = activeReturns.map(r => ({ _id: r._id, productName: r.productName, model: r.model, returnQty: r.returnQty }));
//       if (isEdit) {
//         await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/return`, { returnedProducts, returnNote, updatedBy });
//         Swal.fire({ icon: "success", title: "Return Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//         onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: null });
//       } else {
//         const res = await axiosSecure.post(`/deliveries/${tripId}/return-challan`, {
//           originalChallanId: challan.challanId, customerName: challan.customerName, zone: challan.zone,
//           address: challan.address, thana: challan.thana, district: challan.district,
//           receiverNumber: challan.receiverNumber, returnedProducts, returnNote, updatedBy,
//         });
//         Swal.fire({ icon: "success", title: "Return Added!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//         onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: res.data.returnChallan });
//       }
//       onClose();
//     } catch (err) { Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" }); }
//     setSaving(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
//       <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
//         <div className="px-4 py-3 bg-orange-600 flex items-center justify-between text-white shrink-0">
//           <div>
//             <p className="font-bold text-sm flex items-center gap-2"><RotateCcw size={13} /> {isEdit ? "Edit Return" : "Product Return"}</p>
//             <p className="text-orange-200 text-[10px] font-mono">{challan.customerName}</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
//         </div>
//         <div className="p-4 space-y-3 overflow-y-auto flex-1">
//           <div className="flex items-center justify-between">
//             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Return Products</p>
//             <button onClick={handleAddItem} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg transition">
//               <Plus size={10} /> Add Item
//             </button>
//           </div>
//           <div className="space-y-2">
//             {returnItems.map((r, i) => (
//               <div key={r._id || i} className={`p-3 border rounded-xl ${r.returnQty > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
//                 <div className="flex gap-2 mb-2">
//                   <input placeholder="Product name" value={r.productName} onChange={e => handleFieldChange(i, "productName", e.target.value)}
//                     className="flex-1 min-w-0 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-orange-400" />
//                   <input placeholder="Model" value={r.model} onChange={e => handleFieldChange(i, "model", e.target.value)}
//                     className="w-16 sm:w-20 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none uppercase" />
//                   {returnItems.length > 1 && (
//                     <button onClick={() => handleRemoveItem(i)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
//                       <Trash2 size={12} />
//                     </button>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   {!r._id?.startsWith("new_") && (
//                     <span className="text-[10px] text-slate-500">Delivered: <b className="text-slate-700">{r.deliveredQty} PCS</b></span>
//                   )}
//                   <div className="flex items-center gap-1.5 ml-auto">
//                     <span className="text-[10px] font-bold text-orange-600">Return:</span>
//                     <input type="number" min="0" max={r._id?.startsWith("new_") ? undefined : r.deliveredQty}
//                       value={r.returnQty} onChange={e => handleQtyChange(i, e.target.value)}
//                       className="w-14 text-center text-sm font-black border border-orange-300 bg-white rounded-lg px-1 py-1 outline-none text-orange-700" />
//                   </div>
//                   {!r._id?.startsWith("new_") && (
//                     <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${r.returnQty === 0 ? "bg-green-50 text-green-600 border-green-200" : r.returnQty < r.deliveredQty ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
//                       {r.returnQty === 0 ? "No Return" : r.returnQty < r.deliveredQty ? "Partial" : "All"}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//           {totalReturn > 0 && (
//             <div className="p-2.5 bg-orange-100 border border-orange-300 rounded-xl flex items-center justify-between">
//               <p className="text-xs font-bold text-orange-700">Total Return</p>
//               <p className="text-sm font-black text-orange-700">{totalReturn} PCS</p>
//             </div>
//           )}
//           <div>
//             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Return Note (Optional)</p>
//             <textarea rows={2} value={returnNote} onChange={e => setReturnNote(e.target.value)}
//               placeholder="e.g. Product damaged, customer refused..."
//               className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 resize-none" />
//           </div>
//         </div>
//         <div className="px-4 py-3 border-t flex items-center justify-between bg-slate-50 shrink-0">
//           <p className="text-[10px] text-slate-400">{activeReturns.length > 0 ? `${totalReturn} PCS total` : "None selected"}</p>
//           <div className="flex gap-2">
//             <button onClick={onClose} className="px-3 sm:px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
//             <button onClick={handleSave} disabled={saving}
//               className="px-3 sm:px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
//               <Check size={13} /> {saving ? "Saving…" : isEdit ? "Update Return" : "Save Return"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ─── Note Modal ─── */
// const NoteModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
//   const [note, setNote] = useState(challan.note || "");
//   const [saving, setSaving] = useState(false);
//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/note`, { note, updatedBy });
//       Swal.fire({ icon: "success", title: "Note Saved!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//       onSave({ ...challan, note }, res.data?.data);
//       onClose();
//     } catch (err) { Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" }); }
//     setSaving(false);
//   };
//   return (
//     <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
//       <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
//         <div className="px-4 py-3 bg-amber-500 flex items-center justify-between text-white shrink-0">
//           <div>
//             <p className="font-bold text-sm flex items-center gap-2"><StickyNote size={13} /> Challan Note</p>
//             <p className="text-amber-100 text-[10px] font-mono">{challan.customerName}</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
//         </div>
//         <div className="p-4">
//           <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
//             placeholder="Write any note about this challan..."
//             className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 resize-none" autoFocus />
//           {challan.noteUpdatedAt && <p className="text-[10px] text-slate-400 mt-1">Last updated: {new Date(challan.noteUpdatedAt).toLocaleString()}</p>}
//         </div>
//         <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
//           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
//           <button onClick={handleSave} disabled={saving}
//             className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
//             <Save size={13} /> {saving ? "Saving…" : "Save Note"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ════════════════════════════════════════════════════════════════
//    MAIN MODAL
// ════════════════════════════════════════════════════════════════ */
// const TripDetailsModal = ({ selectedTrip, setSelectedTrip, onTripUpdate }) => {
//   const axiosSecure = useAxiosSecure();
//   const { user } = useAuth();
//   const loggedInUser = user?.displayName || user?.email || "Unknown";
//   const [trip, setTrip] = useState(selectedTrip);
//   const [loadingId, setLoadingId] = useState(null);
//   const [openDropdown, setOpenDropdown] = useState({ id: null, type: null });
//   const [editingChallan, setEditingChallan] = useState(null);
//   const [editingTripInfo, setEditingTripInfo] = useState(false);
//   const [returningChallan, setReturningChallan] = useState(null);
//   const [notingChallan, setNotingChallan] = useState(null);
//   const [advance, setAdvance] = useState("");
//   const [savingAdvance, setSavingAdvance] = useState(false);
//   const [statsOpen, setStatsOpen] = useState(false);

//   useEffect(() => {
//     setTrip(selectedTrip);
//     setAdvance(selectedTrip?.advance ?? "");
//   }, [selectedTrip]);

//   if (!trip) return null;

//   const totalProducts = trip.challans?.reduce((sum, c) =>
//     c.isReturn ? sum : sum + (c.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) || 0), 0);
//   const deliveryNotConfirmed = trip.challans?.filter(c => !c.isReturn && c.deliveryStatus !== "confirmed").length;
//   const challanNotReceived = trip.challans?.filter(c => !c.isReturn && c.challanReturnStatus !== "received").length;

//   const getStatusBadge = (status) => {
//     const map = {
//       confirmed:    "bg-emerald-100 text-emerald-700",
//       not_received: "bg-rose-100 text-rose-700",
//       call_later:   "bg-amber-100 text-amber-700",
//       received:     "bg-indigo-100 text-indigo-700",
//       missing:      "bg-red-100 text-red-700",
//     };
//     return map[status] || "bg-slate-100 text-slate-600";
//   };

//   const syncTrip = (updated) => { setTrip(updated); if (onTripUpdate) onTripUpdate(updated); };

//   const updateStatus = async (challanId, status, endpoint, field) => {
//     try {
//       setLoadingId(`${challanId}-${field}`);
//       await axiosSecure.patch(`/deliveries/${endpoint}`, { tripNumber: trip.tripNumber, challanId, status, operator: "Admin" });
//       syncTrip({ ...trip, challans: trip.challans.map(c => c.challanId === challanId ? { ...c, [field]: status } : c) });
//       Swal.fire({ icon: "success", title: "Updated", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//     } catch { Swal.fire({ icon: "error", title: "Error", text: "Update failed" }); }
//     finally { setLoadingId(null); }
//   };

//   const handleDeleteChallan = async (challanId, customerName) => {
//     const { isConfirmed } = await Swal.fire({
//       title: "Delete Challan?",
//       html: `<p class="text-sm text-gray-600">Remove <b>${customerName}</b>?</p>`,
//       icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
//     });
//     if (!isConfirmed) return;
//     try {
//       await axiosSecure.delete(`/deliveries/${trip._id}/challan/${challanId}`);
//       syncTrip({ ...trip, challans: trip.challans.filter(c => c.challanId !== challanId), totalChallan: trip.totalChallan - 1 });
//       Swal.fire({ icon: "success", title: "Challan removed", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
//     } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Delete failed" }); }
//   };

//   const handleSaveAdvance = async () => {
//     setSavingAdvance(true);
//     try {
//       const res = await axiosSecure.patch(`/deliveries/${trip._id}/advance`, { advance: advance !== "" ? Number(advance) : null, updatedBy: loggedInUser });
//       if (res.data.success) {
//         const updated = res.data.data;
//         setAdvance(updated.advance ?? "");
//         syncTrip({ ...trip, advance: updated.advance, advanceSavedBy: updated.advanceSavedBy });
//         Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Saved!", showConfirmButton: false, timer: 1200 });
//       }
//     } catch { Swal.fire("Error", "Failed to save advance", "error"); }
//     setSavingAdvance(false);
//   };

//   const productSummary = (() => {
//     const map = {};
//     trip.challans?.forEach(c => {
//       if (c.isReturn) return;
//       (c.products || []).forEach(p => { if (!map[p.productName]) map[p.productName] = 0; map[p.productName] += Number(p.quantity || 0); });
//     });
//     return Object.entries(map);
//   })();

//   return (
//     <>
//       {/* ── Backdrop ── */}
//       <div
//         className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-50 p-0 sm:p-3 md:p-4"
//         onClick={e => { if (e.target === e.currentTarget) setSelectedTrip(null); }}
//       >
//         <div className="bg-white w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col">

//           {/* ════ HEADER ════ */}
//           <div className="shrink-0 bg-white border-b border-slate-100">

//             {/* ── Top row ── */}
//             <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
//               <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
//                 <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight shrink-0">{trip.tripNumber}</h2>
//                 <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block shrink-0">{new Date(trip.createdAt).toDateString()}</span>
//                 {(trip.currentUser || trip.createdBy) && (
//                   <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
//                     <User size={9} /> {trip.currentUser || trip.createdBy}
//                   </span>
//                 )}
//                 {trip.lastUpdatedBy && (
//                   <span className="hidden md:flex items-center gap-1 text-[10px] text-indigo-500 shrink-0">
//                     <Pencil size={9} /> {trip.lastUpdatedBy}
//                   </span>
//                 )}
//                 {trip.advanceSavedBy && (
//                   <span className="hidden md:flex items-center gap-1 text-[10px] text-violet-500 shrink-0">
//                     <Wallet size={9} /> {trip.advanceSavedBy}
//                   </span>
//                 )}
//               </div>
//               <div className="flex items-center gap-1.5 shrink-0">
//                 <button
//                   onClick={() => setEditingTripInfo(true)}
//                   className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
//                 >
//                   <Pencil size={10} /> <span className="hidden sm:inline">Edit</span>
//                 </button>
//                 <button
//                   onClick={() => setSelectedTrip(null)}
//                   className="p-1.5 sm:p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition border border-transparent hover:border-rose-100"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>

//             {/* ── Stats bar ── */}
//             <div className="mx-2 sm:mx-3 mb-2.5 bg-slate-800 rounded-xl overflow-hidden">

//               {/* Compact summary row (always visible) + toggle button */}
//               <div
//                 className="flex items-center justify-between px-3 py-1 cursor-pointer"
//                 onClick={() => setStatsOpen(o => !o)}
//               >
//                 <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
//                   <div className="flex items-center gap-1">
//                     <Truck size={11} className="text-indigo-400 shrink-0" />
//                     <span className="text-[11px] font-bold text-white  max-w-[80px] sm:max-w-[120px]">{trip.vehicleNumber}</span>
//                   </div>
            
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <span className="text-[10px] text-emerald-400 font-black">
//                       {trip.challans?.filter(c => !c.isReturn).length ?? trip.totalChallan} pts
//                     </span>
//                     <span className="text-[10px] text-sky-400 font-black">{totalProducts} pcs</span>
                   
//                   </div>
//                 </div>
//                 <ChevronDown
//                   size={14}
//                   className={`text-slate-400 transition-transform duration-200 shrink-0 ${statsOpen ? "rotate-180" : ""}`}
//                 />
//               </div>

//               {/* Expanded detail panel — toggleable on ALL screen sizes */}
//               {statsOpen && (
//                 <div className="border-t border-slate-700 px-3 py-3 flex flex-wrap items-start gap-x-4 gap-y-3">

               

//                   {/* Vendor */}
//                   <div className="flex items-center gap-2">
//                     <Package size={14} className="text-indigo-400 shrink-0" />
//                     <div>
//                       <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</p>
//                       <p className="text-xs font-bold text-white mt-0.5">{trip.vendorName}</p>
//                       {trip.vendorNumber && (
//                         <p className="text-[10px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={9} />{trip.vendorNumber}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Driver */}
//                   <div className="flex items-center gap-2">
//                     <User size={14} className="text-indigo-400 shrink-0" />
//                     <div>
//                       <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</p>
//                       <p className="text-xs font-bold text-white mt-0.5">{trip.driverName}</p>
//                       {trip.driverNumber && (
//                         <p className="text-[10px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={9} />{trip.driverNumber}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Count badges */}
//                   <div className="flex items-center gap-1.5 flex-wrap">
//                     {[
//                       { label: "Points",   value: trip.challans?.filter(c => !c.isReturn).length ?? trip.totalChallan, color: "emerald" },
//                       { label: "Products", value: totalProducts,        color: "sky"   },
//                       { label: "Pending",  value: deliveryNotConfirmed, color: "rose"  },
//                       { label: "Challan",  value: challanNotReceived,   color: "amber" },
//                     ].map(b => (
//                       <div key={b.label} className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center`}
//                         style={{ background: `color-mix(in srgb, var(--tw-${b.color}) 10%, transparent)` }}>
//                         <p className={`text-[7px] text-${b.color}-400 uppercase font-black leading-none mb-0.5`}>{b.label}</p>
//                         <p className={`text-xs sm:text-sm font-black text-${b.color}-400 leading-none`}>{b.value}</p>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Advance input */}
//                   <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
//                     <Wallet size={13} className="text-violet-400 shrink-0" />
//                     <div className="flex-1 sm:flex-none">
//                       <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Advance (৳)</p>
//                       <div className="flex items-center gap-1.5">
//                         <input
//                           type="number" value={advance}
//                           onChange={e => setAdvance(e.target.value)}
//                           placeholder="—"
//                           className="flex-1 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400 text-center"
//                         />
//                         <button
//                           onClick={handleSaveAdvance} disabled={savingAdvance}
//                           className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
//                         >
//                           <Save size={10} /> {savingAdvance ? "…" : "Save"}
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ════ CHALLAN GRID ════ */}
//           <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
//               {trip.challans.map((c, i) => {
//                 const isReturnCard = c.isReturn === true;
//                 const totalReturn = (c.returnedProducts || []).reduce((s, r) => s + (r.returnQty || 0), 0);
//                 const hasReturn = !isReturnCard && totalReturn > 0;
//                 const hasNote = !!c.note?.trim();

//                 return (
//                   <div key={i} className={`border rounded-xl p-2.5 sm:p-3 transition-all
//                     ${isReturnCard
//                       ? "bg-orange-50 border-orange-200"
//                       : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"}`}>

//                     {/* Return card header */}
//                     {isReturnCard && (
//                       <div className="flex items-center justify-between mb-2 pb-2 border-b border-orange-200">
//                         <div className="flex items-center gap-1.5">
//                           <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded uppercase">
//                             <RotateCcw size={8} /> Return
//                           </span>
//                           {c.returnedAt && (
//                             <span className="text-[10px] text-orange-600">{new Date(c.returnedAt).toLocaleDateString("en-GB")}</span>
//                           )}
//                         </div>
//                         <button onClick={() => handleDeleteChallan(c.challanId, c.customerName)}
//                           className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
//                           <Trash2 size={9} /> Delete
//                         </button>
//                       </div>
//                     )}

//                     {/* Info + actions */}
//                     <div className="flex gap-2 justify-between">
//                       {/* Left: customer info */}
//                       <div className="space-y-0.5 min-w-0 flex-1">
//                         <p className="text-xs font-bold text-slate-800 leading-tight">{c.customerName}</p>
//                         <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase
//                           ${isReturnCard ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
//                           {c.zone}
//                         </span>
//                         <p className="text-[10px] text-slate-500 leading-snug truncate">{c.address}</p>
//                         <p className="text-[10px] text-slate-500 leading-snug">{c.district} · {c.thana}</p>
//                         <p className="text-[10px] text-slate-600 font-semibold">{c.receiverNumber}</p>
//                         {!isReturnCard && hasNote && (
//                           <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1">
//                             📝 {c.note.length > 50 ? c.note.slice(0, 50) + "…" : c.note}
//                           </p>
//                         )}
//                         {isReturnCard && c.returnNote && (
//                           <p className="text-[9px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-0.5 mt-1 italic">
//                             📝 {c.returnNote}
//                           </p>
//                         )}
//                       </div>

//                       {/* Right: status + actions (non-return cards) */}
//                       {!isReturnCard && (
//                         <div className="flex flex-col items-end gap-1.5 shrink-0">
//                           {/* Status badge row */}
//                           <div className="flex gap-1 flex-wrap justify-end">
//                             {/* Delivery status dropdown */}
//                             <div className="relative">
//                               <span
//                                 onClick={() => setOpenDropdown(prev =>
//                                   prev.id === c.challanId && prev.type === "delivery"
//                                     ? { id: null, type: null }
//                                     : { id: c.challanId, type: "delivery" }
//                                 )}
//                                 className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase cursor-pointer hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}
//                               >
//                                 D: {c.deliveryStatus || "Pending"}
//                               </span>
//                               {openDropdown.id === c.challanId && openDropdown.type === "delivery" && (
//                                 <div className="absolute right-0 mt-1 w-36 sm:w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
//                                   <div className="px-3 py-1.5 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Delivery</div>
//                                   {["confirmed", "not_received", "call_later"].map(s => (
//                                     <button key={s}
//                                       onClick={e => { e.stopPropagation(); updateStatus(c.challanId, s, "confirm", "deliveryStatus"); setOpenDropdown({ id: null, type: null }); }}
//                                       className={`w-full text-left px-3 py-1.5 text-xs font-semibold capitalize hover:bg-slate-50 ${c.deliveryStatus === s ? "text-indigo-600 bg-indigo-50" : ""}`}>
//                                       {s.replace("_", " ")}
//                                     </button>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                             {/* Challan return status dropdown */}
//                             <div className="relative">
//                               <span
//                                 onClick={() => setOpenDropdown(prev =>
//                                   prev.id === c.challanId && prev.type === "return"
//                                     ? { id: null, type: null }
//                                     : { id: c.challanId, type: "return" }
//                                 )}
//                                 className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase cursor-pointer hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}
//                               >
//                                 C: {c.challanReturnStatus || "Pending"}
//                               </span>
//                               {openDropdown.id === c.challanId && openDropdown.type === "return" && (
//                                 <div className="absolute right-0 mt-1 w-32 sm:w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
//                                   <div className="px-3 py-1.5 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Challan</div>
//                                   {["received", "missing"].map(s => (
//                                     <button key={s}
//                                       onClick={e => { e.stopPropagation(); updateStatus(c.challanId, s, "challan-return", "challanReturnStatus"); setOpenDropdown({ id: null, type: null }); }}
//                                       className={`w-full text-left px-3 py-1.5 text-xs font-semibold capitalize hover:bg-slate-50 ${c.challanReturnStatus === s ? "text-indigo-600 bg-indigo-50" : ""}`}>
//                                       {s}
//                                     </button>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* Action buttons */}
//                           <div className="flex items-center gap-1 flex-wrap justify-end">
//                             <button onClick={() => setEditingChallan(c)}
//                               className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
//                               <Pencil size={9} /> Edit
//                             </button>
//                             <button onClick={() => setReturningChallan(c)}
//                               className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold border rounded-lg transition
//                                 ${hasReturn ? "text-orange-600 border-orange-300 bg-orange-50" : "text-orange-500 border-orange-200 hover:bg-orange-50"}`}>
//                               <RotateCcw size={9} /> {hasReturn ? `(${totalReturn})` : "Rtn"}
//                             </button>
//                             <button onClick={() => setNotingChallan(c)}
//                               className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold border rounded-lg transition
//                                 ${hasNote ? "text-amber-600 border-amber-300 bg-amber-50" : "text-amber-500 border-amber-200 hover:bg-amber-50"}`}>
//                               <StickyNote size={9} /> Note
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Product table */}
//                     <div className={`mt-2 sm:mt-2.5 rounded-lg border overflow-hidden text-[10px]
//                       ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
//                       <table className="w-full">
//                         <thead className={`uppercase text-[9px] ${isReturnCard ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
//                           <tr>
//                             <th className="px-2 py-1.5 text-left font-bold">Product</th>
//                             <th className="px-2 py-1.5 text-left font-bold">Model</th>
//                             <th className="px-2 py-1.5 text-right font-bold">{isReturnCard ? "Rtn" : "Qty"}</th>
//                             {!isReturnCard && hasReturn && (
//                               <th className="px-2 py-1.5 text-right font-bold text-orange-500">Rtn</th>
//                             )}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {c.products.map((p, idx) => {
//                             const ret = !isReturnCard && c.returnedProducts?.find(r => r._id === p._id);
//                             return (
//                               <tr key={idx} className={`border-b last:border-0 ${isReturnCard ? "border-orange-100" : "border-slate-100"}`}>
//                                 <td className={`px-2 py-1.5 font-semibold truncate max-w-[80px] sm:max-w-none ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>{p.productName}</td>
//                                 <td className={`px-2 py-1.5 uppercase text-[9px] ${isReturnCard ? "text-orange-700" : "text-slate-600"}`}>{p.model}</td>
//                                 <td className={`px-2 py-1.5 text-right font-bold ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>{p.quantity}</td>
//                                 {!isReturnCard && hasReturn && (
//                                   <td className="px-2 py-1.5 text-right font-bold text-orange-600">{ret?.returnQty || "—"}</td>
//                                 )}
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                       {!isReturnCard && hasReturn && c.returnNote && (
//                         <div className="px-2 py-1.5 bg-orange-50 border-t border-orange-100 text-[9px] text-orange-700 italic">
//                           📝 {c.returnNote}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* ════ FOOTER ════ */}
//           <div className="shrink-0 border-t border-slate-100 px-3 py-2 bg-white flex flex-wrap items-center gap-1.5 sm:gap-2">
//             {productSummary.length > 0 && (
//               <>
//                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Summary:</span>
//                 <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
//                   {productSummary.map(([name, qty], idx) => (
//                     <div key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg">
//                       <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[80px] sm:max-w-none">{name}</span>
//                       <span className="text-[10px] font-black text-indigo-600 shrink-0">{qty} PCS</span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//             {trip.advance != null && (
//               <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-lg shrink-0">
//                 <Wallet size={10} className="text-violet-500 shrink-0" />
//                 <span className="text-[10px] text-violet-600 font-semibold">Adv:</span>
//                 <span className="text-[10px] font-black text-violet-700">৳{Number(trip.advance).toLocaleString()}</span>
//               </div>
//             )}
//             <button
//               onClick={() => setSelectedTrip(null)}
//               className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto shrink-0"
//             >
//               Close
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* ── Sub-modals ── */}
//       {editingTripInfo && (
//         <EditTripInfoModal
//           trip={trip} axiosSecure={axiosSecure} updatedBy={loggedInUser}
//           onSave={(info, serverData) => syncTrip({ ...trip, ...info, lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser })}
//           onClose={() => setEditingTripInfo(false)}
//         />
//       )}
//       {editingChallan && (
//         <EditChallanCard
//           tripId={trip._id} challan={editingChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
//           onSave={(updatedChallan, serverData) => syncTrip({
//             ...trip,
//             lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
//             challans: trip.challans.map(c => c.challanId === updatedChallan.challanId ? updatedChallan : c),
//           })}
//           onClose={() => setEditingChallan(null)}
//         />
//       )}
//       {returningChallan && (
//         <ReturnModal
//           tripId={trip._id} challan={returningChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
//           onSave={({ updatedOriginal, newReturnChallan }) => {
//             const updatedChallans = trip.challans.map(c => c.challanId === updatedOriginal.challanId ? updatedOriginal : c);
//             syncTrip({
//               ...trip, lastUpdatedBy: loggedInUser,
//               totalChallan: newReturnChallan ? trip.totalChallan + 1 : trip.totalChallan,
//               challans: newReturnChallan ? [...updatedChallans, newReturnChallan] : updatedChallans,
//             });
//           }}
//           onClose={() => setReturningChallan(null)}
//         />
//       )}
//       {notingChallan && (
//         <NoteModal
//           tripId={trip._id} challan={notingChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
//           onSave={(updatedChallan, serverData) => syncTrip({
//             ...trip,
//             lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
//             challans: trip.challans.map(c => c.challanId === updatedChallan.challanId ? updatedChallan : c),
//           })}
//           onClose={() => setNotingChallan(null)}
//         />
//       )}
//     </>
//   );
// };

// export default TripDetailsModal;




import React, { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded,
  Plus, Trash2, Pencil, Check, RotateCcw, StickyNote, Save, Wallet, ChevronDown
} from "lucide-react";
import useAuth from "../hooks/useAuth";

/* ─── Field ─── */
const Field = ({ label, value, onChange }) => (
  <div className="space-y-0.5">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <input
      className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

/* ─── Edit Trip Info Modal ─── */
const EditTripInfoModal = ({ trip, onSave, onClose, axiosSecure, updatedBy }) => {
  const [form, setForm] = useState({
    vehicleNumber: trip.vehicleNumber || "",
    vendorName: trip.vendorName || "",
    vendorNumber: trip.vendorNumber || "",
    driverName: trip.driverName || "",
    driverNumber: trip.driverNumber || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${trip._id}/trip-info`, { ...form, updatedBy });
      Swal.fire({ icon: "success", title: "Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave(form, res.data?.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        <div className="px-4 py-3 bg-slate-800 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">Edit Trip Info</p>
            <p className="text-slate-400 text-[10px] font-mono">{trip.tripNumber}  </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Truck size={10} className="text-indigo-400" /> Vehicle
            </p>
            <Field label="Vehicle Number" value={form.vehicleNumber} onChange={v => setForm(f => ({ ...f, vehicleNumber: v }))} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={10} className="text-indigo-400" /> Vendor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vendor Name" value={form.vendorName} onChange={v => setForm(f => ({ ...f, vendorName: v }))} />
              <Field label="Vendor Phone" value={form.vendorNumber} onChange={v => setForm(f => ({ ...f, vendorNumber: v }))} />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={10} className="text-indigo-400" /> Driver
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Driver Name" value={form.driverName} onChange={v => setForm(f => ({ ...f, driverName: v }))} />
              <Field label="Driver Phone" value={form.driverNumber} onChange={v => setForm(f => ({ ...f, driverNumber: v }))} />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={13} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Challan Modal ─── */
const EditChallanCard = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const [form, setForm] = useState({
    customerName: challan.customerName || "",
    address: challan.address || "",
    thana: challan.thana || "",
    district: challan.district || "",
    receiverNumber: challan.receiverNumber || "",
    zone: challan.zone || "",
  });
  const [products, setProducts] = useState((challan.products || []).map(p => ({ ...p })));
  const [saving, setSaving] = useState(false);

  const handleProductChange = (i, field, val) =>
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  const handleAddProduct = () =>
    setProducts(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", quantity: 1 }]);
  const handleDeleteProduct = async (i) => {
    const p = products[i];
    if (products.length <= 1) return Swal.fire({ icon: "warning", title: "Cannot remove last product" });
    if (p._id && !p._id.startsWith("new_")) {
      try { await axiosSecure.delete(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`); }
      catch { return Swal.fire({ icon: "error", title: "Delete failed" }); }
    }
    setProducts(prev => prev.filter((_, idx) => idx !== i));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}`, { ...form, updatedBy });
      for (const p of products) {
        if (!p.productName || !p.model) continue;
        const isNew = !p._id || p._id.startsWith("new_");
        if (isNew) await axiosSecure.post(`/deliveries/${tripId}/challan/${challan.challanId}/product`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
        else await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
      }
      Swal.fire({ icon: "success", title: "Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave({ ...challan, ...form, products }, res.data?.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">Edit Challan</p>
            <p className="text-indigo-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2"><Field label="Customer Name" value={form.customerName} onChange={v => setForm(f => ({ ...f, customerName: v }))} /></div>
            <div className="col-span-1 sm:col-span-2"><Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} /></div>
            <Field label="Thana" value={form.thana} onChange={v => setForm(f => ({ ...f, thana: v }))} />
            <Field label="District" value={form.district} onChange={v => setForm(f => ({ ...f, district: v }))} />
            <Field label="Receiver Number" value={form.receiverNumber} onChange={v => setForm(f => ({ ...f, receiverNumber: v }))} />
            <Field label="Zone" value={form.zone} onChange={v => setForm(f => ({ ...f, zone: v }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Products</p>
              <button onClick={handleAddProduct} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-lg transition">
                <Plus size={10} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {products.map((p, i) => (
                <div key={p._id || i} className="flex gap-2 items-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <input placeholder="Product name" value={p.productName} onChange={e => handleProductChange(i, "productName", e.target.value)}
                    className="flex-1 min-w-0 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400" />
                  <input placeholder="Model" value={p.model} onChange={e => handleProductChange(i, "model", e.target.value)}
                    className="w-16 sm:w-20 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 uppercase" />
                  <input type="number" min="1" value={p.quantity} onChange={e => handleProductChange(i, "quantity", e.target.value)}
                    className="w-10 sm:w-12 text-xs bg-white border border-slate-200 rounded px-1 py-1.5 outline-none text-center font-bold" />
                  <button onClick={() => handleDeleteProduct(i)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={13} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Return Modal ─── */
const ReturnModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const isEdit = !!(challan.returnedProducts?.length > 0);
  const [returnItems, setReturnItems] = useState(
    (challan.products || []).map(p => ({
      _id: p._id, productName: p.productName, model: p.model,
      deliveredQty: Number(p.quantity) || 0,
      returnQty: challan.returnedProducts?.find(r => r._id === p._id)?.returnQty || 0,
    }))
  );
  const [returnNote, setReturnNote] = useState(challan.returnNote || "");
  const [saving, setSaving] = useState(false);

  const handleQtyChange = (i, val) => {
    const max = returnItems[i].deliveredQty;
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, returnQty: Math.min(Math.max(0, Number(val)), max) } : r));
  };
  const handleFieldChange = (i, field, val) =>
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const handleAddItem = () =>
    setReturnItems(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", deliveredQty: 999, returnQty: 1 }]);
  const handleRemoveItem = (i) => { if (returnItems.length > 1) setReturnItems(prev => prev.filter((_, idx) => idx !== i)); };

  const activeReturns = returnItems.filter(r => r.returnQty > 0);
  const totalReturn = activeReturns.reduce((s, r) => s + r.returnQty, 0);

  const handleSave = async () => {
    if (activeReturns.length === 0) { Swal.fire({ icon: "warning", title: "No return items" }); return; }
    setSaving(true);
    try {
      const returnedProducts = activeReturns.map(r => ({ _id: r._id, productName: r.productName, model: r.model, returnQty: r.returnQty }));
      if (isEdit) {
        await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/return`, { returnedProducts, returnNote, updatedBy });
        Swal.fire({ icon: "success", title: "Return Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: null });
      } else {
        const res = await axiosSecure.post(`/deliveries/${tripId}/return-challan`, {
          originalChallanId: challan.challanId, customerName: challan.customerName, zone: challan.zone,
          address: challan.address, thana: challan.thana, district: challan.district,
          receiverNumber: challan.receiverNumber, returnedProducts, returnNote, updatedBy,
        });
        Swal.fire({ icon: "success", title: "Return Added!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: res.data.returnChallan });
      }
      onClose();
    } catch (err) { Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" }); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-4 py-3 bg-orange-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2"><RotateCcw size={13} /> {isEdit ? "Edit Return" : "Product Return"}</p>
            <p className="text-orange-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Return Products</p>
            <button onClick={handleAddItem} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg transition">
              <Plus size={10} /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {returnItems.map((r, i) => (
              <div key={r._id || i} className={`p-3 border rounded-xl ${r.returnQty > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
                <div className="flex gap-2 mb-2">
                  <input placeholder="Product name" value={r.productName} onChange={e => handleFieldChange(i, "productName", e.target.value)}
                    className="flex-1 min-w-0 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-orange-400" />
                  <input placeholder="Model" value={r.model} onChange={e => handleFieldChange(i, "model", e.target.value)}
                    className="w-16 sm:w-20 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none uppercase" />
                  {returnItems.length > 1 && (
                    <button onClick={() => handleRemoveItem(i)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!r._id?.startsWith("new_") && (
                    <span className="text-[10px] text-slate-500">Delivered: <b className="text-slate-700">{r.deliveredQty} PCS</b></span>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] font-bold text-orange-600">Return:</span>
                    <input type="number" min="0" max={r._id?.startsWith("new_") ? undefined : r.deliveredQty}
                      value={r.returnQty} onChange={e => handleQtyChange(i, e.target.value)}
                      className="w-14 text-center text-sm font-black border border-orange-300 bg-white rounded-lg px-1 py-1 outline-none text-orange-700" />
                  </div>
                  {!r._id?.startsWith("new_") && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${r.returnQty === 0 ? "bg-green-50 text-green-600 border-green-200" : r.returnQty < r.deliveredQty ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                      {r.returnQty === 0 ? "No Return" : r.returnQty < r.deliveredQty ? "Partial" : "All"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalReturn > 0 && (
            <div className="p-2.5 bg-orange-100 border border-orange-300 rounded-xl flex items-center justify-between">
              <p className="text-xs font-bold text-orange-700">Total Return</p>
              <p className="text-sm font-black text-orange-700">{totalReturn} PCS</p>
            </div>
          )}
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Return Note (Optional)</p>
            <textarea rows={2} value={returnNote} onChange={e => setReturnNote(e.target.value)}
              placeholder="e.g. Product damaged, customer refused..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 resize-none" />
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400">{activeReturns.length > 0 ? `${totalReturn} PCS total` : "None selected"}</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 sm:px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-3 sm:px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              <Check size={13} /> {saving ? "Saving…" : isEdit ? "Update Return" : "Save Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Note Modal ─── */
const NoteModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const [note, setNote] = useState(challan.note || "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/note`, { note, updatedBy });
      Swal.fire({ icon: "success", title: "Note Saved!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave({ ...challan, note }, res.data?.data);
      onClose();
    } catch (err) { Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" }); }
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 bg-amber-500 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2"><StickyNote size={13} /> Challan Note</p>
            <p className="text-amber-100 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4">
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Write any note about this challan..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 resize-none" autoFocus />
          {challan.noteUpdatedAt && <p className="text-[10px] text-slate-400 mt-1">Last updated: {new Date(challan.noteUpdatedAt).toLocaleString()}</p>}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Save size={13} /> {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════════════════════════════ */
const TripDetailsModal = ({ selectedTrip, setSelectedTrip, onTripUpdate }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const loggedInUser = user?.displayName || user?.email || "Unknown";
  const [trip, setTrip] = useState(selectedTrip);
  const [loadingId, setLoadingId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState({ id: null, type: null });
  const [editingChallan, setEditingChallan] = useState(null);
  const [editingTripInfo, setEditingTripInfo] = useState(false);
  const [returningChallan, setReturningChallan] = useState(null);
  const [notingChallan, setNotingChallan] = useState(null);
  const [advance, setAdvance] = useState("");
  const [savingAdvance, setSavingAdvance] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    setTrip(selectedTrip);
    setAdvance(selectedTrip?.advance ?? "");
  }, [selectedTrip]);

  if (!trip) return null;

  const totalProducts = trip.challans?.reduce((sum, c) =>
    c.isReturn ? sum : sum + (c.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) || 0), 0);
  const deliveryNotConfirmed = trip.challans?.filter(c => !c.isReturn && c.deliveryStatus !== "confirmed").length;
  const challanNotReceived = trip.challans?.filter(c => !c.isReturn && c.challanReturnStatus !== "received").length;

  const getStatusBadge = (status) => {
    const map = {
      confirmed:    "bg-emerald-100 text-emerald-700",
      not_received: "bg-rose-100 text-rose-700",
      call_later:   "bg-amber-100 text-amber-700",
      received:     "bg-indigo-100 text-indigo-700",
      missing:      "bg-red-100 text-red-700",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  const syncTrip = (updated) => { setTrip(updated); if (onTripUpdate) onTripUpdate(updated); };

  const updateStatus = async (challanId, status, endpoint, field) => {
    try {
      setLoadingId(`${challanId}-${field}`);
      await axiosSecure.patch(`/deliveries/${endpoint}`, { tripNumber: trip.tripNumber, challanId, status, operator: "Admin" });
      syncTrip({ ...trip, challans: trip.challans.map(c => c.challanId === challanId ? { ...c, [field]: status } : c) });
      Swal.fire({ icon: "success", title: "Updated", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "Error", text: "Update failed" }); }
    finally { setLoadingId(null); }
  };

  const handleDeleteChallan = async (challanId, customerName) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Challan?",
      html: `<p class="text-sm text-gray-600">Remove <b>${customerName}</b>?</p>`,
      icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/deliveries/${trip._id}/challan/${challanId}`);
      syncTrip({ ...trip, challans: trip.challans.filter(c => c.challanId !== challanId), totalChallan: trip.totalChallan - 1 });
      Swal.fire({ icon: "success", title: "Challan removed", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Delete failed" }); }
  };

  const handleSaveAdvance = async () => {
    setSavingAdvance(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${trip._id}/advance`, { advance: advance !== "" ? Number(advance) : null, updatedBy: loggedInUser });
      if (res.data.success) {
        const updated = res.data.data;
        setAdvance(updated.advance ?? "");
        syncTrip({ ...trip, advance: updated.advance, advanceSavedBy: updated.advanceSavedBy });
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Saved!", showConfirmButton: false, timer: 1200 });
      }
    } catch { Swal.fire("Error", "Failed to save advance", "error"); }
    setSavingAdvance(false);
  };

  const productSummary = (() => {
    const map = {};
    trip.challans?.forEach(c => {
      if (c.isReturn) return;
      (c.products || []).forEach(p => { if (!map[p.productName]) map[p.productName] = 0; map[p.productName] += Number(p.quantity || 0); });
    });
    return Object.entries(map);
  })();

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-50 p-0 sm:p-3 md:p-4"
        onClick={e => { if (e.target === e.currentTarget) setSelectedTrip(null); }}
      >
        <div className="bg-white w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col">

          {/* ════ HEADER ════ */}
          <div className="shrink-0 bg-white border-b border-slate-100">

            {/* ── Top row ── */}
            <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight shrink-0">{trip.tripNumber}</h2>
                <span className="text-[9px] sm:text-[10px] text-slate-400 sm:block shrink-0">{new Date(trip.createdAt).toDateString()}</span>
                {(trip.currentUser || trip.createdBy) && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <User size={9} /> {trip.currentUser || trip.createdBy}
                  </span>
                )}
                {trip.lastUpdatedBy && (
                  <span className="hidden md:flex items-center gap-1 text-[10px] text-indigo-500 shrink-0">
                    <Pencil size={9} /> {trip.lastUpdatedBy}
                  </span>
                )}
                {trip.advanceSavedBy && (
                  <span className="hidden md:flex items-center gap-1 text-[10px] text-violet-500 shrink-0">
                    <Wallet size={9} /> {trip.advanceSavedBy}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingTripInfo(true)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Pencil size={10} /> <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-1.5 sm:p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition border border-transparent hover:border-rose-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="mx-2 sm:mx-3 mb-2.5 bg-slate-800 rounded-xl overflow-hidden">

              {/* Compact summary row (always visible) + toggle button */}
              <div
                className="flex items-center justify-between px-3 py-1 cursor-pointer"
                onClick={() => setStatsOpen(o => !o)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <Truck size={11} className="text-indigo-400 shrink-0" />
                    {/* ✅ FIX 1: whitespace-nowrap দিয়ে এক লাইনে রাখা */}
                    <span className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[160px]">
                      {trip.vehicleNumber}
                    </span>
                  </div>
            
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-emerald-400 font-black">
                      {trip.challans?.filter(c => !c.isReturn).length ?? trip.totalChallan} Points 
                  </span>
                    <span className="text-[10px] text-sky-400 font-black">{totalProducts} Products</span>
                   
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${statsOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* Expanded detail panel — toggleable on ALL screen sizes */}
              {statsOpen && (
                <div className="border-t border-slate-700 px-3 py-3 flex flex-wrap items-start gap-x-4 gap-y-3">

                  {/* Vendor */}
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</p>
                      <p className="text-xs font-bold text-white mt-0.5">{trip.vendorName}</p>
                      {trip.vendorNumber && (
                        <p className="text-[10px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={9} />{trip.vendorNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</p>
                      <p className="text-xs font-bold text-white mt-0.5">{trip.driverName}</p>
                      {trip.driverNumber && (
                        <p className="text-[10px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={9} />{trip.driverNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Count badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                     
                      { label: "Confarmation Pending",  value: deliveryNotConfirmed, color: "rose"  },
                      { label: "Challan Not Recived",  value: challanNotReceived,   color: "amber" },
                    ].map(b => (
                      <div key={b.label} className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center`}
                        style={{ background: `color-mix(in srgb, var(--tw-${b.color}) 10%, transparent)` }}>
                        <p className={`text-[7px] text-${b.color}-400 uppercase font-black leading-none mb-0.5`}>{b.label}</p>
                        <p className={`text-xs sm:text-sm font-black text-${b.color}-400 leading-none`}>{b.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Advance input */}
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    <Wallet size={13} className="text-violet-400 shrink-0" />
                    <div className="flex-1 sm:flex-none">
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Advance (৳)</p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" value={advance}
                          onChange={e => setAdvance(e.target.value)}
                          placeholder="—"
                          className="flex-1 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400 text-center"
                        />
                        <button
                          onClick={handleSaveAdvance} disabled={savingAdvance}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                        >
                          <Save size={10} /> {savingAdvance ? "…" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* ════ CHALLAN GRID ════ */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
              {trip.challans.map((c, i) => {
                const isReturnCard = c.isReturn === true;
                const totalReturn = (c.returnedProducts || []).reduce((s, r) => s + (r.returnQty || 0), 0);
                const hasReturn = !isReturnCard && totalReturn > 0;
                const hasNote = !!c.note?.trim();

                return (
                  <div key={i} className={`border rounded-xl p-2.5 sm:p-3 transition-all
                    ${isReturnCard
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"}`}>

                    {/* Return card header */}
                    {isReturnCard && (
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-orange-200">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded uppercase">
                            <RotateCcw size={8} /> Return
                          </span>
                          {c.returnedAt && (
                            <span className="text-[10px] text-orange-600">{new Date(c.returnedAt).toLocaleDateString("en-GB")}</span>
                          )}
                        </div>
                        <button onClick={() => handleDeleteChallan(c.challanId, c.customerName)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
                          <Trash2 size={9} /> Delete
                        </button>
                      </div>
                    )}

                    {/* Info + actions */}
                    <div className="flex gap-2 justify-between">
                      {/* Left: customer info */}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{c.customerName}</p>
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase
                          ${isReturnCard ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          {c.zone}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-snug truncate">{c.address}</p>
                        <p className="text-[10px] text-slate-500 leading-snug"><span className="text-[10px] text-cyan-800 font-semibold">District :</span> {c.district} <span className="text-[10px] text-cyan-800 font-semibold">Thana :</span> {c.thana} <span className="text-[10px] text-slate-600 font-semibold">{c.receiverNumber}</span></p>
                        <p ></p>
                        {!isReturnCard && hasNote && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1">
                            📝 {c.note.length > 50 ? c.note.slice(0, 50) + "…" : c.note}
                          </p>
                        )}
                        {isReturnCard && c.returnNote && (
                          <p className="text-[9px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-0.5 mt-1 italic">
                            📝 {c.returnNote}
                          </p>
                        )}
                      </div>

                      {/* Right: status + actions (non-return cards) */}
                      {!isReturnCard && (
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {/* Status badge row */}
                          <div className="flex gap-1 flex-wrap justify-end">
                            {/* Delivery status dropdown */}
                            <div className="relative">
                              <span
                                onClick={() => setOpenDropdown(prev =>
                                  prev.id === c.challanId && prev.type === "delivery"
                                    ? { id: null, type: null }
                                    : { id: c.challanId, type: "delivery" }
                                )}
                                className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase cursor-pointer hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}
                              >
                                D: {c.deliveryStatus || "Pending"}
                              </span>
                              {openDropdown.id === c.challanId && openDropdown.type === "delivery" && (
                                <div className="absolute right-0 mt-1 w-36 sm:w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                  <div className="px-3 py-1.5 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Delivery</div>
                                  {["confirmed", "not_received", "call_later"].map(s => (
                                    <button key={s}
                                      onClick={e => { e.stopPropagation(); updateStatus(c.challanId, s, "confirm", "deliveryStatus"); setOpenDropdown({ id: null, type: null }); }}
                                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold capitalize hover:bg-slate-50 ${c.deliveryStatus === s ? "text-indigo-600 bg-indigo-50" : ""}`}>
                                      {s.replace("_", " ")}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Challan return status dropdown */}
                            <div className="relative">
                              <span
                                onClick={() => setOpenDropdown(prev =>
                                  prev.id === c.challanId && prev.type === "return"
                                    ? { id: null, type: null }
                                    : { id: c.challanId, type: "return" }
                                )}
                                className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase cursor-pointer hover:opacity-80 whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}
                              >
                                C: {c.challanReturnStatus || "Pending"}
                              </span>
                              {openDropdown.id === c.challanId && openDropdown.type === "return" && (
                                <div className="absolute right-0 mt-1 w-32 sm:w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                  <div className="px-3 py-1.5 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase">Challan</div>
                                  {["received", "missing"].map(s => (
                                    <button key={s}
                                      onClick={e => { e.stopPropagation(); updateStatus(c.challanId, s, "challan-return", "challanReturnStatus"); setOpenDropdown({ id: null, type: null }); }}
                                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold capitalize hover:bg-slate-50 ${c.challanReturnStatus === s ? "text-indigo-600 bg-indigo-50" : ""}`}>
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button onClick={() => setEditingChallan(c)}
                              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                              <Pencil size={9} /> Edit
                            </button>
                            <button onClick={() => setReturningChallan(c)}
                              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold border rounded-lg transition
                                ${hasReturn ? "text-orange-600 border-orange-300 bg-orange-50" : "text-orange-500 border-orange-200 hover:bg-orange-50"}`}>
                              <RotateCcw size={9} /> {hasReturn ? `(${totalReturn})` : "Rtn"}
                            </button>
                            <button onClick={() => setNotingChallan(c)}
                              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] font-semibold border rounded-lg transition
                                ${hasNote ? "text-amber-600 border-amber-300 bg-amber-50" : "text-amber-500 border-amber-200 hover:bg-amber-50"}`}>
                              <StickyNote size={9} /> Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product table */}
                    <div className={`mt-2 sm:mt-2.5 rounded-lg border overflow-hidden text-[10px]
                      ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
                      <table className="w-full">
                        <thead className={`uppercase text-[9px] ${isReturnCard ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                          <tr>
                            <th className="px-2 py-1.5 text-left font-bold">Product</th>
                            <th className="px-2 py-1.5 text-left font-bold">Model</th>
                            <th className="px-2 py-1.5 text-right font-bold">{isReturnCard ? "Rtn" : "Qty"}</th>
                            {!isReturnCard && hasReturn && (
                              <th className="px-2 py-1.5 text-right font-bold text-orange-500">Rtn</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {c.products.map((p, idx) => {
                            const ret = !isReturnCard && c.returnedProducts?.find(r => r._id === p._id);
                            return (
                              <tr key={idx} className={`border-b last:border-0 ${isReturnCard ? "border-orange-100" : "border-slate-100"}`}>
                                <td className={`px-2 py-1.5 font-semibold truncate max-w-[80px] sm:max-w-none ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>{p.productName}</td>
                                <td className={`px-2 py-1.5 uppercase text-[9px] ${isReturnCard ? "text-orange-700" : "text-slate-600"}`}>{p.model}</td>
                                <td className={`px-2 py-1.5 text-right font-bold ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>{p.quantity}</td>
                                {!isReturnCard && hasReturn && (
                                  <td className="px-2 py-1.5 text-right font-bold text-orange-600">{ret?.returnQty || "—"}</td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {!isReturnCard && hasReturn && c.returnNote && (
                        <div className="px-2 py-1.5 bg-orange-50 border-t border-orange-100 text-[9px] text-orange-700 italic">
                          📝 {c.returnNote}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ FOOTER ════ */}
          {/* ✅ FIX 2: Footer summary মোবাইলে scrollable + proper wrap */}
          <div className="shrink-0 border-t border-slate-100 px-3 py-2 bg-white">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {productSummary.length > 0 && (
                <>
                  {/* <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Summary:</span> */}
                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {productSummary.map(([name, qty], idx) => (
                      <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 max-w-[60px] sm:max-w-none truncate">{name}</span>
                        <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 shrink-0">{qty}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            <span className="hidden sm:block">
                {trip.advance != null && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-lg shrink-0">
                  <Wallet size={10} className="text-violet-500 shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-violet-600 font-semibold">Adv:</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-violet-700">৳{Number(trip.advance).toLocaleString()}</span>
                </div>
              )}
            </span>
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto shrink-0"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sub-modals ── */}
      {editingTripInfo && (
        <EditTripInfoModal
          trip={trip} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(info, serverData) => syncTrip({ ...trip, ...info, lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser })}
          onClose={() => setEditingTripInfo(false)}
        />
      )}
      {editingChallan && (
        <EditChallanCard
          tripId={trip._id} challan={editingChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(updatedChallan, serverData) => syncTrip({
            ...trip,
            lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
            challans: trip.challans.map(c => c.challanId === updatedChallan.challanId ? updatedChallan : c),
          })}
          onClose={() => setEditingChallan(null)}
        />
      )}
      {returningChallan && (
        <ReturnModal
          tripId={trip._id} challan={returningChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={({ updatedOriginal, newReturnChallan }) => {
            const updatedChallans = trip.challans.map(c => c.challanId === updatedOriginal.challanId ? updatedOriginal : c);
            syncTrip({
              ...trip, lastUpdatedBy: loggedInUser,
              totalChallan: newReturnChallan ? trip.totalChallan + 1 : trip.totalChallan,
              challans: newReturnChallan ? [...updatedChallans, newReturnChallan] : updatedChallans,
            });
          }}
          onClose={() => setReturningChallan(null)}
        />
      )}
      {notingChallan && (
        <NoteModal
          tripId={trip._id} challan={notingChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(updatedChallan, serverData) => syncTrip({
            ...trip,
            lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
            challans: trip.challans.map(c => c.challanId === updatedChallan.challanId ? updatedChallan : c),
          })}
          onClose={() => setNotingChallan(null)}
        />
      )}
    </>
  );
};

export default TripDetailsModal;