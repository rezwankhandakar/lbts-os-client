import React, { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded,
  Plus, Trash2, Pencil, Check, RotateCcw, StickyNote, Save, Wallet, ChevronDown,
  Building2, ArrowLeft, Search, Loader2, Copy
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import useRole from "../hooks/useRole";
// Re-resolve capacity + rate from (product, model, location) so a challan
// added to an existing trip carries the same rate the Delivered page expects.
import { findRate } from "../utils/rateMatcher";
import { computeLocation } from "../utils/localAddressMatcher";
// Challan editing inside the Add-Challan modal — same editor Create
// Delivery uses, so behaviour (location/rate recompute) stays identical.
import EditCreateDeliveryChallanModal from "./EditCreateDelliveryChallanModal";

/* ── বাংলায় টাকার পরিমাণ ──
   Bangla te 1-99 prottek number er nijoshsho naam ache — English er
   moto "twenty + one = twenty-one" pattern follow kore na.  21 = "একুশ"
   (not "বিশ এক"), 35 = "পঁয়ত্রিশ" etc.  So full 0-99 table direct lookup
   kora hocche.  Same table CarRentDetailsModal e o use kora hocche —
   ekta utility module e tola jeto kintu both components keep self-
   contained to avoid coupling. */
const _b99 = [
  "",
  "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",
  "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ",
  "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "ঊনত্রিশ",
  "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ",
  "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ",
  "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট",
  "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর",
  "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি",
  "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই",
  "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই",
];
function _b1000(n){
  if (n < 100) return _b99[n];
  return _b99[Math.floor(n/100)] + " শত" + (n%100 ? " " + _b99[n%100] : "");
}
function takaInWords(amount){
  const n=Math.round(Math.abs(Number(amount)));
  if(!n||isNaN(n))return null;
  let r=n, parts=[];
  const cr=Math.floor(r/10000000); r%=10000000;
  const lk=Math.floor(r/100000);   r%=100000;
  const hz=Math.floor(r/1000);     r%=1000;
  if(cr) parts.push(_b1000(cr)+" কোটি");
  if(lk) parts.push(_b1000(lk)+" লক্ষ");
  if(hz) parts.push(_b1000(hz)+" হাজার");
  if(r)  parts.push(_b1000(r));
  return parts.join(" ")+" টাকা";
}

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
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "100dvh" }}>
        <div className="px-4 py-3 bg-slate-800 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">Edit Trip Info</p>
            <p className="text-slate-400 text-[10px] font-mono">{trip.tripNumber}</p>
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
      // ── Partial delivery ────────────────────────────────────────────
      // splitLeftover=1 → server মুছে দেওয়া product-টাকে নতুন pending
      // challan হিসেবে All-Challan-এ রেখে দেয় (next delivery-র জন্য)।
      try {
        const res = await axiosSecure.delete(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}?splitLeftover=1`);
        const lf = res.data?.leftover;
        if (lf?.quantity) {
          Swal.fire({
            icon: "info", toast: true, position: "top-end", timer: 3000, showConfirmButton: false,
            title: `${lf.quantity} PCS moved back to pending (All Challan)`,
          });
        }
      }
      catch { return Swal.fire({ icon: "error", title: "Delete failed" }); }
    }
    setProducts(prev => prev.filter((_, idx) => idx !== i));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}`, { ...form, updatedBy });
      // ── Partial delivery ──────────────────────────────────────────
      // splitLeftover: true → qty কমালে (৫ → ২) কমে যাওয়া অংশ (৩) server
      // নতুন pending challan হিসেবে রেখে দেয় — All-Challan-এ next
      // delivery-র জন্য available থাকে।
      let leftoverQty = 0;
      for (const p of products) {
        if (!p.productName || !p.model) continue;
        const isNew = !p._id || p._id.startsWith("new_");
        // syncChallan: true → নতুন product টা All-Challan-এর canonical
        // challan record-এও add হয় (একই _id দিয়ে), যাতে Trip Do /
        // gate-pass matching এই product-এও কাজ করে।
        if (isNew) await axiosSecure.post(`/deliveries/${tripId}/challan/${challan.challanId}/product`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1, syncChallan: true });
        else {
          const pr = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`, { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1, splitLeftover: true, updatedBy });
          leftoverQty += Number(pr.data?.leftover?.quantity) || 0;
        }
      }
      Swal.fire({
        icon: "success", toast: true, position: "top-end", showConfirmButton: false,
        timer: leftoverQty ? 3500 : 1500,
        title: leftoverQty
          ? `Updated — ${leftoverQty} PCS moved back to pending (All Challan)`
          : "Updated!",
      });
      onSave({ ...challan, ...form, products }, res.data?.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "100dvh" }}>
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
                <div key={p._id || i} className="grid grid-cols-[35%_50%_10%_5%] gap-1.5 items-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <input placeholder="Product name" value={p.productName} onChange={e => handleProductChange(i, "productName", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400" />
                  <input placeholder="Model" value={p.model} onChange={e => handleProductChange(i, "model", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 uppercase" />
                  <input type="number" min="1" value={p.quantity} onChange={e => handleProductChange(i, "quantity", e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-1 py-1.5 outline-none text-center font-bold" />
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
    const n = Number(val);
    const safe = Number.isFinite(n) ? n : 0; // NaN guard — non-numeric paste ইত্যাদি
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, returnQty: Math.min(Math.max(0, safe), max) } : r));
  };
  const handleFieldChange = (i, field, val) =>
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const handleAddItem = () =>
    setReturnItems(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", deliveredQty: 999, returnQty: 1 }]);
  const handleRemoveItem = (i) => { if (returnItems.length > 1) setReturnItems(prev => prev.filter((_, idx) => idx !== i)); };

  const activeReturns = returnItems.filter(r => r.returnQty > 0);
  const totalReturn = activeReturns.reduce((s, r) => s + r.returnQty, 0);

  // FIX #58 — Return সম্পূর্ণ remove: trip-এর return card, original
  // challan-এর mark, আর All Challan-এর return-pending challan — তিনটাই
  // server-এ undo হয়। Item re-deliver হয়ে গেলে server 409 দিয়ে আটকায়।
  const handleRemoveReturn = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Remove Return?",
      html: `<p class="text-sm">Return card + pending re-delivery challan <b>মুছে যাবে</b>।<br/>Challan আবার স্বাভাবিক delivered অবস্থায় ফিরে যাবে।</p>`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;
    setSaving(true);
    try {
      await axiosSecure.delete(`/deliveries/${tripId}/challan/${challan.challanId}/return`);
      Swal.fire({ icon: "success", title: "Return Removed!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      const { returnedProducts: _rp, returnNote: _rn, returnedAt: _ra, ...cleared } = challan;
      onSave({ updatedOriginal: cleared, newReturnChallan: null, removeReturn: true });
      onClose();
    } catch (err) { Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" }); }
    setSaving(false);
  };

  const handleSave = async () => {
    if (activeReturns.length === 0) {
      // Edit mode-এ সব 0 করা = return তুলে নেওয়া
      if (isEdit) { handleRemoveReturn(); return; }
      Swal.fire({ icon: "warning", title: "No return items" }); return;
    }
    setSaving(true);
    try {
      const returnedProducts = activeReturns.map(r => ({ _id: r._id, productName: r.productName, model: r.model, returnQty: r.returnQty }));
      if (isEdit) {
        await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/return`, { returnedProducts, returnNote, updatedBy });
        Swal.fire({ icon: "success", title: "Return Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: null, syncedProducts: returnedProducts });
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
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "100dvh" }}>
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
                    className="w-[35%] text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-orange-400" />
                  <input placeholder="Model" value={r.model} onChange={e => handleFieldChange(i, "model", e.target.value)}
                    className="w-[65%] text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none uppercase focus:border-orange-400" />
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
          {isEdit ? (
            <button onClick={handleRemoveReturn} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition disabled:opacity-60">
              <Trash2 size={12} /> Remove Return
            </button>
          ) : (
            <p className="text-[10px] text-slate-400">{activeReturns.length > 0 ? `${totalReturn} PCS total` : "None selected"}</p>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 sm:px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-3 sm:px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              <Check size={13} /> {saving ? "Saving…" : isEdit ? (activeReturns.length === 0 ? "Remove Return" : "Update Return") : "Save Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── RTN + Note Modal ─── */
const STATUS_LABELS = {
  confirmed:    "✅ Confirmed",
  not_received: "❌ Not Received",
  call_later:   "📞 Call Later",
  received:     "📦 Received",
  missing:      "⚠️ Missing",
};
const D_STATUSES = ["confirmed", "not_received", "call_later"];
const C_STATUSES = ["received", "missing"];

const RtnNoteModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const [deliveryStatus,      setDeliveryStatus]      = useState(challan.deliveryStatus      || "");
  const [challanReturnStatus, setChallanReturnStatus] = useState(challan.challanReturnStatus || "");
  const [note,                setNote]                = useState(challan.note                || "");
  const [saving,              setSaving]              = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Non-empty status → dedicated endpoints (they also stamp
      // confirmedBy/receivedBy audit fields). Cleared status ("") →
      // generic /status endpoint, otherwise the clear was only ever
      // applied locally and a refresh silently brought the old value
      // back (bug).
      const dChanged = deliveryStatus      !== (challan.deliveryStatus      || "");
      const cChanged = challanReturnStatus !== (challan.challanReturnStatus || "");
      if (dChanged && deliveryStatus) {
        await axiosSecure.patch(`/deliveries/confirm`, {
          tripNumber: challan._tripNumber, challanId: challan.challanId,
          status: deliveryStatus, operator: updatedBy,
        });
      }
      if (cChanged && challanReturnStatus) {
        await axiosSecure.patch(`/deliveries/challan-return`, {
          tripNumber: challan._tripNumber, challanId: challan.challanId,
          status: challanReturnStatus, operator: updatedBy,
        });
      }
      const clearPayload = {};
      if (dChanged && !deliveryStatus)      clearPayload.deliveryStatus      = "";
      if (cChanged && !challanReturnStatus) clearPayload.challanReturnStatus = "";
      if (Object.keys(clearPayload).length > 0) {
        await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/status`, clearPayload);
      }
      if (note !== challan.note) {
        await axiosSecure.patch(
          `/deliveries/${tripId}/challan/${challan.challanId}/note`,
          { note, updatedBy }
        );
      }
      Swal.fire({ icon: "success", title: "Saved!", toast: true, position: "top-end", timer: 1200, showConfirmButton: false });
      onSave({ ...challan, deliveryStatus, challanReturnStatus, note });
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  const StatusBtn = ({ value, active, onClick, color }) => {
    const colors = {
      indigo: active ? "bg-indigo-100 border-indigo-400 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300",
      amber:  active ? "bg-amber-100  border-amber-400  text-amber-700"  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-300",
    };
    return (
      <button onClick={onClick}
        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-left transition-all border ${colors[color]}`}>
        {STATUS_LABELS[value] || "— Clear"}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "100dvh" }}>
        <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">📋 Status + Note</p>
            <p className="text-indigo-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Status</p>
            <div className="grid grid-cols-2 gap-1.5">
              <StatusBtn value="" active={!deliveryStatus} onClick={() => setDeliveryStatus("")} color="indigo" />
              {D_STATUSES.map(s => (
                <StatusBtn key={s} value={s} active={deliveryStatus === s} onClick={() => setDeliveryStatus(s)} color="indigo" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Challan Return Status</p>
            <div className="grid grid-cols-2 gap-1.5">
              <StatusBtn value="" active={!challanReturnStatus} onClick={() => setChallanReturnStatus("")} color="amber" />
              {C_STATUSES.map(s => (
                <StatusBtn key={s} value={s} active={challanReturnStatus === s} onClick={() => setChallanReturnStatus(s)} color="amber" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Note</p>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Write any note about this challan..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 resize-none" />
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={13} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Floor / Carrying Modal ─── */
const FLOORS = Array.from({ length: 15 }, (_, i) => i + 1);
const FloorCarryingModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const [floor,    setFloor]    = useState(challan.floor    ?? "");
  const [carrying, setCarrying] = useState(challan.carrying ?? "");
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosSecure.patch(
        `/deliveries/${tripId}/challan/${challan.challanId}/floor-carrying`,
        {
          floor:    floor    !== "" ? Number(floor) : null,
          carrying: carrying !== "" ? carrying.trim() : null,
        }
      );
      Swal.fire({ icon: "success", title: "Saved!", toast: true, position: "top-end", timer: 1200, showConfirmButton: false });
      onSave({ ...challan, floor: floor !== "" ? Number(floor) : null, carrying: carrying || null });
      onClose();
    } catch { Swal.fire({ icon: "error", title: "Failed" }); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "100dvh" }}>
        <div className="px-4 py-3 bg-emerald-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2"><Building2 size={13} /> Floor / Carrying</p>
            <p className="text-emerald-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Floor নম্বর (১–১৫)</p>
            <div className="grid grid-cols-5 gap-1.5">
              {["", ...FLOORS].map(f => (
                <button key={f} onClick={() => setFloor(f === "" ? "" : f)}
                  className={`py-2 rounded-xl text-[11px] font-black text-center transition-all border
                    ${(floor === f || (f === "" && floor === ""))
                      ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"}`}>
                  {f === "" ? "—" : f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Carrying (বাহন / ব্যক্তি)</p>
            <input value={carrying} onChange={e => setCarrying(e.target.value)}
              placeholder="যেমন: CNF Auto, কুলি, ভ্যান গাড়ি…"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 transition" />
          </div>
          {(challan.floor || challan.carrying) && (
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-[9px] text-slate-500 font-bold mb-0.5">বর্তমান মান</p>
              <p className="text-xs font-bold text-emerald-700">
                {challan.floor ? `${challan.floor} তলা` : ""}
                {challan.floor && challan.carrying ? " · " : ""}
                {challan.carrying || ""}
              </p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={13} /> {saving ? "Saving…" : "Save"}
          </button>
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

/* ─── Trip Note Modal ───
   One note PER TRIP (not per challan) — for jotting down something
   about the whole trip, e.g. "driver delayed", "double-checked with
   customer". Saved via PATCH /deliveries/:tripId/note.

   Vendor visibility: this modal is only ever reachable through routes
   already gated to NON_VENDOR roles (Trip Details page / Trip
   Inventory), so a vendor account can never open it from the UI. The
   server also strips the note out of GET /deliveries for vendor
   requests, so even a direct API call can't read it — this is purely
   the editor UI for non-vendor staff. */
const TripNoteModal = ({ trip, onSave, onClose, axiosSecure, updatedBy }) => {
  const [note, setNote] = useState(trip.tripNote || "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosSecure.patch(`/deliveries/${trip._id}/note`, { note, updatedBy });
      Swal.fire({ icon: "success", title: "Trip Note Saved!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave({ tripNote: note, tripNoteUpdatedAt: new Date().toISOString(), tripNoteUpdatedBy: updatedBy });
      onClose();
    } catch (err) {
      console.error("Save trip note failed:", err?.response?.status, err?.response?.data, err?.message);
      const msg = err?.response?.data?.message
        || (err?.response?.status ? `Server error (${err.response.status})` : err?.message)
        || "Failed to save note";
      Swal.fire({ icon: "error", title: "Failed to save note", text: msg });
    }
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2"><StickyNote size={13} /> Trip Note</p>
            <p className="text-indigo-100 text-[10px] font-mono">{trip.tripNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-slate-400 mb-2">Visible to admin / manager / operator only — vendors cannot see this note.</p>
          <textarea rows={5} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Write any note about this whole trip..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 resize-none" autoFocus />
          {trip.tripNoteUpdatedAt && (
            <p className="text-[10px] text-slate-400 mt-1">
              Last updated: {new Date(trip.tripNoteUpdatedAt).toLocaleString()}{trip.tripNoteUpdatedBy ? ` by ${trip.tripNoteUpdatedBy}` : ""}
            </p>
          )}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Save size={13} /> {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Add Challan Modal ───
   Pick existing PENDING challans (same search as Create Delivery) and add
   them to THIS trip. On confirm they get embedded in the trip, marked
   delivered in /all-challan, and show up on the Delivered page. */
const AddChallanModal = ({ trip, onAdded, onClose, axiosSecure, addedBy }) => {
  const [search, setSearch]         = useState("");
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState([]);   // queue — challan objects
  const [submitting, setSubmitting] = useState(false);
  const [mobileTab, setMobileTab]   = useState("challans"); // challans | queue
  // ── Challan edit (CreateDelivery-র মতো, একই editor modal) ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChallan,  setEditingChallan]  = useState(null);
  const [savingChallan,   setSavingChallan]   = useState(false);

  // challanIds already in this trip — exclude them from results.
  // Ref-এ রাখা হয়েছে যাতে runSearch-এর useCallback closure stale না হয়।
  const existingIdsRef = React.useRef(new Set());
  existingIdsRef.current = new Set((trip.challans || []).map(c => String(c.challanId)));

  const runSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/challans?search=${encodeURIComponent(term.trim())}&page=1&limit=5000`);
      const all = res.data?.data || res.data?.challans || res.data || [];
      const list = Array.isArray(all) ? all : [];
      // CreateDelivery-র মতোই: pending + return-pending eligible,
      // delivered/re-delivered বাদ, আর এই trip-এ আগেই থাকা গুলোও বাদ।
      setResults(list.filter(c =>
        c.status !== "delivered" && c.status !== "re-delivered" &&
        !existingIdsRef.current.has(String(c._id))
      ));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    const t = setTimeout(() => runSearch(search), 350);
    return () => clearTimeout(t);
  }, [search, runSearch]);

  const isSelected = (id) => selected.some(s => s._id === id);
  const addToQueue = (challan) => {
    if (challan.status === "delivered" || challan.status === "re-delivered") {
      return Swal.fire({ icon: "warning", title: "Already Delivered", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    }
    if (isSelected(challan._id)) {
      return Swal.fire({ icon: "info", title: "Already Added", toast: true, position: "top-end", timer: 1300, showConfirmButton: false });
    }
    setSelected(prev => [...prev, challan]);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: `${challan.customerName} added`, timer: 1000, showConfirmButton: false });
  };
  const removeFromQueue = (id) => setSelected(prev => prev.filter(s => s._id !== id));

  /* ── Challan edit — CreateDelivery-র identical logic ──
     thana/district বদলালে location + প্রতিটা product-এর rate নতুন করে
     resolve হয়; product name/model/capacity বদলালেও rate re-resolve। */
  const handleEditClick = (challan) => {
    setEditingChallan(JSON.parse(JSON.stringify(challan)));
    setIsEditModalOpen(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingChallan(prev => {
      const next = { ...prev, [name]: value };
      if (name === "thana" || name === "district") {
        const newLocation = computeLocation(next.thana, next.district) || prev.location || null;
        next.location = newLocation;
        next.products = (next.products || []).map(p => {
          const { capacity, rate } = findRate({
            productName: p.productName, model: p.model,
            location: newLocation, capacity: p.capacity || "",
          });
          return { ...p, capacity: capacity || p.capacity || "", rate };
        });
      }
      return next;
    });
  };
  const handleProductChange = (index, field, value) => {
    const updated = [...editingChallan.products];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "productName" || field === "model" || field === "capacity") {
      const location = editingChallan.location
        || computeLocation(editingChallan.thana, editingChallan.district)
        || null;
      const p = updated[index];
      const { capacity, rate } = findRate({
        productName: p.productName, model: p.model, location,
        capacity: field === "capacity" ? value : (p.capacity || ""),
      });
      if (capacity) updated[index].capacity = capacity;
      else if (field === "capacity") updated[index].capacity = value;
      updated[index].rate = rate;
    }
    setEditingChallan({ ...editingChallan, products: updated });
  };
  const handleDeleteProduct = (index) => {
    const updated = [...editingChallan.products];
    updated.splice(index, 1);
    setEditingChallan({ ...editingChallan, products: updated });
  };
  const handleUpdateChallan = async () => {
    const cleanProducts = (editingChallan.products || [])
      .filter(p => (p.productName || "").trim())
      .map(p => ({ ...p, quantity: Number(p.quantity) || 1 }));
    if (cleanProducts.length === 0) {
      return Swal.fire({ icon: "warning", title: "At least one product required" });
    }
    setSavingChallan(true);
    try {
      const payload = {
        ...editingChallan,
        products: cleanProducts,
        location: editingChallan.location || computeLocation(editingChallan.thana, editingChallan.district) || "",
        updatedBy: addedBy || "unknown",
        // ── Partial delivery — CreateDelivery-র মতোই: row remove / qty
        // কমালে বাদ পড়া অংশ নতুন pending challan হয়ে All-Challan-এ থাকে।
        splitLeftover: true,
      };
      const res = await axiosSecure.patch(`/challans/${editingChallan._id}`, payload);
      if (res.data.modifiedCount || res.data.success) {
        const lf = res.data.leftover;
        Swal.fire({
          toast: true, position: "top-end", icon: "success",
          title: lf?.quantity
            ? `Challan updated — ${lf.quantity} PCS kept pending for next delivery`
            : "Challan updated",
          timer: lf?.quantity ? 3000 : 1400, showConfirmButton: false,
        });
        const upd = { ...editingChallan, products: cleanProducts };
        // Search results + queue — দুই জায়গাতেই sync
        setResults(prev  => prev.map(c => c._id === upd._id ? { ...c, ...upd } : c));
        setSelected(prev => prev.map(c => c._id === upd._id ? { ...c, ...upd } : c));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]?.message
        || err?.response?.data?.message || "Update failed";
      Swal.fire({ icon: "error", title: "Could not update", text: msg });
    } finally {
      setSavingChallan(false);
    }
  };

  const handleConfirm = async () => {
    if (selected.length === 0) {
      return Swal.fire({ icon: "warning", title: "Select at least one challan" });
    }
    // ── Confirm preview — CreateDelivery-র dispatch preview-এর মতো ──
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const pcs = selected.reduce((s, c) => s + (c.products || []).reduce((x, p) => x + (Number(p.quantity) || 0), 0), 0);
    const { isConfirmed } = await Swal.fire({
      title: "Add to Trip?",
      html: `<div style="text-align:left;font-size:13px;color:#475569;line-height:1.8">
               <b style="color:#0f172a">🚚 ${esc(trip.tripNumber)}</b><br/>
               ${selected.map(c => `• ${esc(c.customerName)}`).slice(0, 6).join("<br/>")}
               ${selected.length > 6 ? `<br/>…+${selected.length - 6} more` : ""}<br/>
               Points: <b style="color:#059669">${selected.length}</b> ·
               Products: <b style="color:#0284c7">${pcs} PCS</b>
             </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Yes, Add to Trip",
      cancelButtonText: "Review Again",
    });
    if (!isConfirmed) return;
    setSubmitting(true);
    try {
      // Build payload — re-resolve location + per-product capacity/rate so the
      // Delivered page shows correct rates (same logic as Create Delivery).
      const payloadChallans = selected.map(c => {
        const location = c.location || computeLocation(c.thana, c.district) || null;
        const products = (c.products || []).map(p => {
          const r = findRate({
            productName: p.productName,
            model: p.model,
            location,
            capacity: p.capacity || "",
          });
          return {
            _id: p._id,
            productName: p.productName,
            model: p.model,
            quantity: Number(p.quantity) || 0,
            capacity: r.capacity || p.capacity || "",
            rate: r.rate || Number(p.rate) || 0,
          };
        });
        return {
          challanId: c._id,
          customerName: c.customerName,
          zone: c.zone,
          address: c.address,
          thana: c.thana,
          district: c.district,
          location,
          // Remarks — admin-only note set on the All Challan page, carried
          // through so it shows up on the Delivered page too.
          remarks: c.remarks || "",
          receiverNumber: c.receiverNumber,
          products,
        };
      });

      const res = await axiosSecure.post(`/deliveries/${trip._id}/add-challans`, {
        challans: payloadChallans,
        addedBy,
      });

      if (res.data?.success) {
        Swal.fire({
          toast: true, position: "top-end", icon: "success",
          title: `${res.data.added} challan added`, showConfirmButton: false, timer: 1600,
        });
        onAdded(res.data.addedChallans || []);
        onClose();
      } else {
        throw new Error(res.data?.message || "Failed to add");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add challans";
      Swal.fire({ icon: "error", title: "Could not add", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Load summary (points / PCS / per-product) — CreateDelivery-র মতো ──
  const productMap = {};
  let totalPcs = 0;
  selected.forEach(c => (c.products || []).forEach(p => {
    const qty = Number(p.quantity) || 0;
    totalPcs += qty;
    const key = p.productName || p.model || "Item";
    productMap[key] = (productMap[key] || 0) + qty;
  }));

  /* ── Card (Available Challans panel) ── */
  const ChallanCard = ({ c }) => {
    const sel = isSelected(c._id);
    return (
      <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all
        ${sel ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-100 hover:shadow-md hover:border-emerald-200"}`}>
        <div className="bg-slate-50 px-3 py-2 flex justify-between items-center border-b border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400">
            {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
          </span>
          <div className="flex gap-1.5 items-center">
            {c.status === "return-pending" && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full border border-orange-200">↩ Return-Pending</span>
            )}
            <button onClick={() => handleEditClick(c)} title="Edit challan"
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
              <Pencil size={12} />
            </button>
            <button
              onClick={() => (sel ? removeFromQueue(c._id) : addToQueue(c))}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all shadow-sm
                ${sel
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}
            >
              {sel ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
            </button>
          </div>
        </div>
        <div className="p-3">
          <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mb-0.5">{c.customerName}</h4>
          <p className="text-[10px] text-emerald-600 font-black uppercase mb-2 tracking-widest">Zone: {c.zone || "—"}</p>
          <div className="space-y-0.5 mb-3 text-[11px] text-slate-500">
            <p className="flex gap-1 flex-wrap"><span className="font-bold text-slate-600">Location:</span><span className="break-words">{c.address}</span></p>
            <p className="flex gap-1 flex-wrap">
              <span className="font-bold text-slate-600">District:</span><span>{c.district || "—"}</span>
              <span className="font-bold text-slate-600">Thana:</span><span>{c.thana || "—"}</span>
            </p>
            <p className="flex gap-1"><span className="font-bold text-slate-600">Receiver:</span>{c.receiverNumber || "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
            {(c.products || []).map((p, i) => (
              <div key={i} className="flex justify-between text-[10px] py-0.5">
                <span className="text-slate-600 font-bold truncate pr-3 uppercase">{p.model || p.productName}</span>
                <span className="text-blue-600 font-black flex-shrink-0">{p.quantity} PCS</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── Queue item (right panel) — CreateDelivery-র QueueItem style ── */
  const QueueItem = ({ item }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm relative group hover:border-emerald-200 transition-all">
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button onClick={() => handleEditClick(item)} title="Edit challan"
          className="p-1.5 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all">
          <Pencil size={12} />
        </button>
        <button onClick={() => removeFromQueue(item._id)} title="Remove from queue"
          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
          <X size={13} />
        </button>
      </div>
      <span className="text-[10px] font-semibold text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</span>
      <h4 className="font-black text-slate-800 uppercase tracking-tight truncate text-sm pr-16">{item.customerName}</h4>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">Zone: {item.zone || "—"}</span>
        {item.status === "return-pending" && (
          <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black uppercase">↩ Return</span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {(item.products || []).map((p, i) => (
          <div key={i} className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 font-bold uppercase truncate pr-2">{p.model || p.productName}</span>
            <span className="font-black text-emerald-600 flex-shrink-0">{p.quantity} <span className="text-[9px] text-slate-400">PCS</span></span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-[80] p-0 sm:p-3"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-slate-50 w-full max-w-5xl h-[94vh] sm:max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">

        {/* ── Top bar (CreateDelivery "DELIVERY PLANNER" style) ── */}
        <div className="bg-slate-950 px-4 py-3 flex justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="text-white" size={15} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                ADD <span className="text-emerald-400">CHALLAN</span>
              </h2>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">{trip.tripNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Results</p>
              <p className="text-white font-black text-lg leading-tight">{results.length}</p>
            </div>
            {selected.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex-shrink-0">
                {selected.length} in queue
              </span>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"><X size={16} /></button>
          </div>
        </div>

        {/* ── Mobile tab switcher (Challans | Queue) ── */}
        <div className="flex md:hidden border-b border-slate-200 bg-white shrink-0">
          <button onClick={() => setMobileTab("challans")}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
              ${mobileTab === "challans" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <Package size={12} /> Challans
            {results.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "challans" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                {results.length}
              </span>
            )}
          </button>
          <button onClick={() => setMobileTab("queue")}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2
              ${mobileTab === "queue" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <Truck size={12} /> Queue
            {selected.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === "queue" ? "bg-emerald-400 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                {selected.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Workspace: LEFT challans / RIGHT queue ── */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 min-h-0">

          {/* ══ LEFT: Available Challans ══ */}
          <div className={`flex-col min-h-0 border-r border-slate-200 ${mobileTab !== "challans" ? "hidden md:flex" : "flex"}`}>
            <div className="px-3 sm:px-4 py-3 bg-white border-b border-slate-100 shrink-0">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Search Pending Challans</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, phone, address…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading ? (
                <div className="bg-white rounded-2xl p-3 border border-slate-100 animate-pulse space-y-2">
                  <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                  <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="space-y-1.5"><div className="h-2.5 bg-slate-50 rounded-lg" /><div className="h-2.5 bg-slate-50 rounded-lg w-5/6" /></div>
                </div>
              ) : search.trim().length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Package className="text-slate-300" size={26} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Search to find challans</p>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Package className="text-slate-300" size={26} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No pending challans found</p>
                </div>
              ) : (
                results.map(c => <ChallanCard key={c._id} c={c} />)
              )}
            </div>
          </div>

          {/* ══ RIGHT: Queue ══ */}
          <div className={`flex-col min-h-0 bg-white ${mobileTab !== "queue" ? "hidden md:flex" : "flex"}`}>
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Add Queue</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Items ready to join {trip.tripNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                  {selected.length} Selected
                </span>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} title="Clear queue"
                    className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 flex-1 overflow-y-auto bg-slate-50/30">
              {selected.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <Package size={28} className="text-slate-300" />
                  </div>
                  <p className="font-bold uppercase text-xs tracking-widest text-slate-400">No Items in Queue</p>
                  <p className="text-[10px] text-slate-300 mt-1">Add challans from the search panel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.map(item => <QueueItem key={item._id} item={item} />)}
                </div>
              )}
            </div>

            {/* ── Load summary + confirm (CreateDelivery footer style) ── */}
            <div className="bg-white border-t border-slate-100 shrink-0">
              {selected.length > 0 && (
                <div className="px-3 sm:px-4 pt-3 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-black text-emerald-700">
                    {selected.length} <span className="font-semibold text-emerald-500">points</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg text-[10px] font-black text-sky-700">
                    {totalPcs} <span className="font-semibold text-sky-500">PCS total</span>
                  </span>
                  {Object.entries(productMap).map(([name, qty]) => (
                    <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 max-w-[160px]">
                      <span className="truncate">{name}</span>
                      <span className="font-black text-indigo-600 shrink-0">{qty}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 p-3 sm:px-4">
                <button onClick={onClose} disabled={submitting}
                        className="px-4 py-2 text-xs font-black uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  Cancel
                </button>
                <button onClick={handleConfirm} disabled={submitting || selected.length === 0}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  {submitting ? "Adding…" : `Add to Trip${selected.length ? ` (${selected.length})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Challan editor — same modal Create Delivery uses (z-[9999]) ── */}
      <EditCreateDeliveryChallanModal
        isOpen={isEditModalOpen}
        editingChallan={editingChallan}
        setIsEditModalOpen={setIsEditModalOpen}
        handleEditChange={handleEditChange}
        handleProductChange={handleProductChange}
        handleDeleteProduct={handleDeleteProduct}
        handleUpdateChallan={handleUpdateChallan}
        setEditingChallan={setEditingChallan}
        saving={savingChallan}
      />
    </div>
  );
};


/* ════════════════════════════════════════════════════════════════
   MAIN — TripDetails (renders as modal or full page)
   ─────────────────────────────────────────────────────────────────
   Same component powers two use-cases:
     - Modal overlay  (displayMode="modal", default; backward-compatible)
     - Full page      (displayMode="page";  used by /trip/:id route)

   The inner content (header + stats bar + challan grid + footer) is
   identical between the two — only the outer wrapper, max-height
   behavior, and close button label/action change.  Keeping a single
   component avoids drift between the two surfaces.
════════════════════════════════════════════════════════════════ */
const TripDetailsModal = ({ selectedTrip, setSelectedTrip, onTripUpdate, displayMode = "modal" }) => {
  const isPage = displayMode === "page";
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const loggedInUser = user?.displayName || user?.email || "Unknown";
  // Defensive client-side check, on top of the route guard (NON_VENDOR)
  // and the server stripping tripNote for vendor requests — vendors
  // should never even see the Note button.
  const { role } = useRole();
  const isVendor = role === "vendor";
  const canDeleteTrip = role === "admin" || role === "manager";

  const [trip,                 setTrip]                 = useState(selectedTrip);
  const [editingChallan,       setEditingChallan]       = useState(null);
  const [editingTripInfo,      setEditingTripInfo]      = useState(false);
  const [returningChallan,     setReturningChallan]     = useState(null);
  const [notingChallan,        setNotingChallan]        = useState(null);
  const [showTripNote,         setShowTripNote]         = useState(false);
  const [floorCarryingChallan, setFloorCarryingChallan] = useState(null);
  const [rtnNoteChallan,       setRtnNoteChallan]       = useState(null);
  const [advance,              setAdvance]              = useState("");
  const [savingAdvance,        setSavingAdvance]        = useState(false);
  const [statsOpen,            setStatsOpen]            = useState(false);
  const [openActionMenu,       setOpenActionMenu]       = useState(null); // ← নতুন state
  const [showAddChallan,       setShowAddChallan]       = useState(false);
  // ── Challan quick search + status filter (big trip-এ দ্রুত খুঁজতে) ──
  const [challanSearch,        setChallanSearch]        = useState("");
  const [challanTab,           setChallanTab]           = useState("all"); // all | pending | confirmed | not_received | returns

  useEffect(() => {
    if (!selectedTrip) { setTrip(null); return; }
    const withTripNum = {
      ...selectedTrip,
      challans: (selectedTrip.challans || []).map(c => ({ ...c, _tripNumber: selectedTrip.tripNumber })),
    };
    setTrip(withTripNum);
    setAdvance(selectedTrip?.advance ?? "");
  }, [selectedTrip]);

  if (!trip) return null;

  const totalProducts = trip.challans?.reduce((sum, c) =>
    c.isReturn ? sum : sum + (c.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) || 0), 0);
  const deliveryNotConfirmed = trip.challans?.filter(c => !c.isReturn && c.deliveryStatus !== "confirmed").length;
  const challanNotReceived   = trip.challans?.filter(c => !c.isReturn && c.challanReturnStatus !== "received").length;

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

  const syncTrip = (updated) => {
    const withTripNum = {
      ...updated,
      challans: (updated.challans || []).map(c => ({ ...c, _tripNumber: updated.tripNumber })),
    };
    setTrip(withTripNum);
    if (onTripUpdate) onTripUpdate(withTripNum);
  };

  // ── Delete the entire trip ──
  // Reverts every real challan back to Pending (server-side) and deletes
  // the trip document, then closes the page (goes back to the list).
  // Admin/Manager only. Moved here from the Trip-Inventory list.
  const handleDeleteTrip = async () => {
    const challanCount = (trip.challans || []).filter(c => !c.isReturn).length;
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Delete Trip?",
      html: `<p style="font-size:13px;color:#475569">
               Trip <b>${trip.tripNumber}</b> (${challanCount} challan${challanCount === 1 ? "" : "s"}) will be permanently deleted.
               <br/>All its challans go back to <b>Pending</b> so they can be re-dispatched.
               <br/>This cannot be undone.
             </p>`,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete Trip",
      cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/deliveries/${trip._id}`, { data: { reason: reason || "" } });
      await Swal.fire({ icon: "success", title: "Trip deleted", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      setSelectedTrip(null); // closes page → navigates back to the list
    } catch (err) {
      Swal.fire({ icon: "error", title: err?.response?.data?.message || "Delete failed" });
    }
  };

  // ── Copy a WhatsApp-friendly trip summary to clipboard ──
  const handleCopySummary = async () => {
    const normals = (trip.challans || []).filter(c => !c.isReturn);
    const lines = [
      `🚚 ${trip.tripNumber} — ${new Date(trip.createdAt).toLocaleDateString("en-GB")}`,
      `Vendor: ${trip.vendorName}${trip.vendorNumber ? ` (${trip.vendorNumber})` : ""}`,
      `Driver: ${trip.driverName}${trip.driverNumber ? ` (${trip.driverNumber})` : ""}`,
      `Vehicle: ${trip.vehicleNumber}`,
      `Points: ${normals.length}`,
      "",
      ...normals.map((c, i) =>
        `${i + 1}. ${c.customerName} — ${c.zone || ""}${c.receiverNumber ? ` · ${c.receiverNumber}` : ""}\n   ${c.address || ""}`
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Summary copied!", showConfirmButton: false, timer: 1400 });
    } catch {
      Swal.fire({ toast: true, position: "top-end", icon: "error", title: "Copy failed", showConfirmButton: false, timer: 1400 });
    }
  };

  const handleChallansAdded = (addedChallans) => {
    // Merge the newly-embedded challans into the local trip so the Delivered
    // page / trip list update immediately (server already persisted them).
    const withNum = (addedChallans || []).map(c => ({ ...c, _tripNumber: trip.tripNumber }));
    syncTrip({
      ...trip,
      challans: [...(trip.challans || []), ...withNum],
      totalChallan: (trip.totalChallan || trip.challans?.length || 0) + withNum.length,
    });
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

  // ── Progress (normal challans only) ──
  const normalCount    = trip.challans?.filter(c => !c.isReturn).length || 0;
  const confirmedCount = trip.challans?.filter(c => !c.isReturn && c.deliveryStatus === "confirmed").length || 0;
  const receivedCount  = trip.challans?.filter(c => !c.isReturn && c.challanReturnStatus === "received").length || 0;
  const returnCount    = trip.challans?.filter(c => c.isReturn).length || 0;
  const confirmedPct   = normalCount ? Math.round((confirmedCount / normalCount) * 100) : 0;
  const receivedPct    = normalCount ? Math.round((receivedCount  / normalCount) * 100) : 0;

  // ── Challan search + tab filter ──
  // NOTE: filter করলেও original index দরকার (serial number + key stability),
  // তাই আগে index attach করে তারপর filter করা হচ্ছে।
  const q = challanSearch.trim().toLowerCase();
  const visibleChallans = (trip.challans || [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      if (challanTab === "returns"      && !c.isReturn) return false;
      if (challanTab === "confirmed"    && (c.isReturn || c.deliveryStatus !== "confirmed")) return false;
      if (challanTab === "pending"      && (c.isReturn || !!c.deliveryStatus)) return false;
      if (challanTab === "not_received" && (c.isReturn || c.challanReturnStatus === "received")) return false;
      if (!q) return true;
      return [c.customerName, c.zone, c.address, c.thana, c.district, c.receiverNumber,
        ...(c.products || []).flatMap(p => [p.productName, p.model])]
        .some(v => v?.toString().toLowerCase().includes(q));
    });

  const challanTabs = [
    { key: "all",          label: "All",           count: trip.challans?.length || 0 },
    { key: "pending",      label: "Pending",       count: trip.challans?.filter(c => !c.isReturn && !c.deliveryStatus).length || 0 },
    { key: "confirmed",    label: "Confirmed",     count: confirmedCount },
    { key: "not_received", label: "Challan Due",   count: normalCount - receivedCount },
    ...(returnCount > 0 ? [{ key: "returns", label: "Returns", count: returnCount }] : []),
  ];

  // ── Outer wrapper differs by displayMode ──
  //   modal → fixed backdrop + centered box; click outside closes
  //   page  → normal flow, full height, no backdrop, no click-outside
  const outerProps = isPage
    ? {
        className: "h-full w-full flex flex-col bg-slate-50",
        // no onClick — page doesn't dismiss on outside click
      }
    : {
        className: "fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-50 p-0 sm:p-3 md:p-4",
        onClick: (e) => { if (e.target === e.currentTarget) setSelectedTrip(null); },
      };
  const innerProps = isPage
    ? {
        className: "bg-white w-full overflow-hidden flex flex-col flex-1",
      }
    : {
        className: "bg-white w-full max-w-5xl overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col",
        style: { maxHeight: "100dvh" },
      };

  return (
    <>
      <div {...outerProps}>
        <div {...innerProps}>

          {/* ════ HEADER ════ */}
          <div className="shrink-0 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                {/* In page mode, prepend a Back button. In modal mode the
                    X at the right handles closing — no back button needed. */}
                {isPage && (
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shrink-0"
                    title="Back"
                  >
                    <ArrowLeft size={12} /> <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight shrink-0">{trip.tripNumber}</h2>
                <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">{new Date(trip.createdAt).toDateString()}</span>
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
                  onClick={handleCopySummary}
                  title="Copy trip summary (share in WhatsApp)"
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Copy size={10} /> <span className="hidden sm:inline">Copy</span>
                </button>
                {!isVendor && (
                  <button
                    onClick={() => setShowTripNote(true)}
                    title="Trip note (not visible to vendors)"
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition ${
                      trip.tripNote
                        ? "text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <StickyNote size={10} /> <span className="hidden sm:inline">Note</span>
                  </button>
                )}
                <button
                  onClick={() => setEditingTripInfo(true)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Pencil size={10} /> <span className="hidden sm:inline">Edit</span>
                </button>
                {canDeleteTrip && (
                  <button
                    onClick={handleDeleteTrip}
                    title="Delete this trip"
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition"
                  >
                    <Trash2 size={10} /> <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
                {/* Close X — only in modal mode; page mode uses the Back
                    button on the left instead. */}
                {!isPage && (
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="p-1.5 sm:p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition border border-transparent hover:border-rose-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="mx-2 sm:mx-3 mb-2.5 bg-slate-800 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-1 cursor-pointer"
                onClick={() => setStatsOpen(o => !o)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <Truck size={11} className="text-indigo-400 shrink-0" />
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

              {/* ── Progress: delivery confirmations + challan receipts ── */}
              {normalCount > 0 && (
                <div className="px-3 pb-1.5 grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Delivered</span>
                      <span className={`text-[9px] font-black ${confirmedPct === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                        {confirmedCount}/{normalCount}
                      </span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${confirmedPct === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
                        style={{ width: `${confirmedPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Challan Rcvd</span>
                      <span className={`text-[9px] font-black ${receivedPct === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                        {receivedCount}/{normalCount}
                      </span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${receivedPct === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
                        style={{ width: `${receivedPct}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {statsOpen && (
                <div className="border-t border-slate-700 px-3 py-3 flex flex-wrap items-start gap-x-4 gap-y-3">
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* NOTE: Tailwind can't compile dynamic class strings like
                        `text-${color}-400` — full class names must appear
                        literally, otherwise they get purged and the badges
                        render unstyled. */}
                    {[
                      { label: "Confirmation Pending", value: deliveryNotConfirmed, cls: "text-rose-400"  },
                      { label: "Challan Not Received", value: challanNotReceived,   cls: "text-amber-400" },
                    ].map(b => (
                      <div key={b.label} className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center bg-white/5">
                        <p className={`text-[7px] ${b.cls} uppercase font-black leading-none mb-0.5`}>{b.label}</p>
                        <p className={`text-xs sm:text-sm font-black ${b.cls} leading-none`}>{b.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    <Wallet size={13} className="text-violet-400 shrink-0" />
                    <div className="flex-1 sm:flex-none">
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Advance (৳)</p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" min="0" value={advance}
                          onChange={e => {
                            const v = e.target.value;
                            // Negative advance অর্থহীন — খালি string allow, নেগেটিভ block
                            if (v === "" || Number(v) >= 0) setAdvance(v);
                          }}
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
                      {advance !== "" && advance != null && takaInWords(advance) && (
                        <p className="text-[9px] text-violet-300 font-medium mt-1 pl-0.5">{takaInWords(advance)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Trip Note banner — only shown when a note exists.
                Clicking it reopens the editor. Hidden for vendors (this
                whole component is already NON_VENDOR-gated, but we keep
                the same defensive check used on the button above). ── */}
            {!isVendor && trip.tripNote && trip.tripNote.trim() && (
              <button
                type="button"
                onClick={() => setShowTripNote(true)}
                className="mx-2 sm:mx-3 mb-2.5 flex items-start gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-left hover:bg-indigo-100 transition w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)]"
              >
                <StickyNote size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-indigo-800 font-medium leading-snug whitespace-pre-wrap break-words">
                  {trip.tripNote}
                </span>
              </button>
            )}
          </div>

          {/* ════ CHALLAN GRID ════ */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3">
            {/* ── Toolbar: search + status tabs + add ── */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5">
              <div className="relative flex-1 min-w-[150px] max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={challanSearch}
                  onChange={e => setChallanSearch(e.target.value)}
                  placeholder="Search customer, zone, phone…"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-6 py-1.5 text-[11px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder-slate-400"
                />
                {challanSearch && (
                  <button onClick={() => setChallanSearch("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {challanTabs.map(t => (
                  <button key={t.key} onClick={() => setChallanTab(t.key)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap
                      ${challanTab === t.key
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}>
                    {t.label} <span className={challanTab === t.key ? "text-slate-400" : "text-slate-400"}>{t.count}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddChallan(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm ml-auto"
              >
                <Plus size={13} /> Add Challan
              </button>
            </div>
            {visibleChallans.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-2">
                  <Search size={20} className="text-slate-300" />
                </div>
                <p className="text-xs font-bold">No challans match</p>
                {(q || challanTab !== "all") && (
                  <button onClick={() => { setChallanSearch(""); setChallanTab("all"); }}
                    className="mt-2 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 underline">
                    Clear search & filters
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
             {visibleChallans.map(({ c, i }) => {
  const isReturnCard = c.isReturn === true;
  const totalReturn  = (c.returnedProducts || []).reduce((s, r) => s + (r.returnQty || 0), 0);
  const hasReturn    = !isReturnCard && totalReturn > 0;
  const hasNote      = !!c.note?.trim();
  const hasFloor     = !!(c.floor || c.carrying);
  const hasStatus    = !!(c.deliveryStatus || c.challanReturnStatus);
  const isActionActive = hasReturn || hasNote || hasFloor || hasStatus;

  return (
    <div key={i} className={`border rounded-xl overflow-hidden transition-all
      ${isReturnCard
        ? "bg-orange-50 border-orange-200"
        : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"}`}>

      {/* ══ TOP ROW: Status badges + Action button ══ */}
      <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 border-b
        ${isReturnCard ? "bg-orange-100/60 border-orange-200" : "bg-slate-50 border-slate-100"}`}>

        {/* Serial number + Return badge OR status badges */}
        {isReturnCard ? (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-5 h-5 bg-slate-700 text-white text-[9px] font-black rounded-full shrink-0">
              {i + 1}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded uppercase">
              <RotateCcw size={8} /> Return
            </span>
            {c.returnedAt && (
              <span className="text-[10px] text-orange-600 font-medium">
                {new Date(c.returnedAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="flex items-center justify-center w-5 h-5 bg-slate-700 text-white text-[9px] font-black rounded-full shrink-0">
              {i + 1}
            </span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}>
              D: {c.deliveryStatus || "Pending"}
            </span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}>
              C: {c.challanReturnStatus || "Pending"}
            </span>
          </div>
        )}

        {/* Right side: Action button OR Delete (return card) */}
        {isReturnCard ? (
          <button
            onClick={() => handleDeleteChallan(c.challanId, c.customerName)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={9} /> Delete
          </button>
        ) : (
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenActionMenu(prev => prev === c.challanId ? null : c.challanId)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold border rounded-lg transition
                ${isActionActive
                  ? "text-indigo-700 border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                  : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              ⚡ Actions
              <ChevronDown size={9} className={`transition-transform duration-150 ${openActionMenu === c.challanId ? "rotate-180" : ""}`} />
            </button>

            {openActionMenu === c.challanId && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setOpenActionMenu(null)} />
                <div className="absolute right-0 top-full mt-1.5 z-[70] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden min-w-[160px]">
                  <button
                    onClick={() => { setEditingChallan(c); setOpenActionMenu(null); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition text-left"
                  >
                    <Pencil size={12} className="shrink-0" /> Edit Challan
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setReturningChallan(c); setOpenActionMenu(null); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold hover:bg-orange-50 transition text-left ${hasReturn ? "text-orange-600" : "text-orange-500"}`}
                  >
                    <RotateCcw size={12} className="shrink-0" />
                    {hasReturn ? `Return (${totalReturn} PCS)` : "Product Return"}
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setRtnNoteChallan(c); setOpenActionMenu(null); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold hover:bg-indigo-50 transition text-left ${hasStatus || hasNote ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    <span className="text-[12px] shrink-0">📋</span> Status + Note
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setFloorCarryingChallan(c); setOpenActionMenu(null); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold hover:bg-emerald-50 transition text-left ${hasFloor ? "text-emerald-700" : "text-emerald-600"}`}
                  >
                    <span className="text-[12px] shrink-0">🏢</span>
                    {c.floor ? `Floor: ${c.floor}তলা` : c.carrying ? `Carry: ${c.carrying}` : "Floor / Carrying"}
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setOpenActionMenu(null); handleDeleteChallan(c.challanId, c.customerName); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <Trash2 size={12} className="shrink-0" /> Remove Challan
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ══ BODY: সব data full width ══ */}
      <div className="p-2.5 sm:p-3 space-y-1">

        {/* Customer name — full, no truncate */}
        <p className="text-sm font-bold text-slate-800 leading-snug">{c.customerName}</p>

        {/* Zone badge */}
        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase
          ${isReturnCard ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
          {c.zone}
        </span>

        {/* Address — full, no truncate */}
        <p className="text-[11px] text-black leading-snug break-words">{c.address}</p>

        {/* District · Thana */}
        {(c.district || c.thana) && (
          <p className="text-[11px] leading-snug">
            {c.district && <span><span className="text-cyan-800 font-semibold">District:</span> <span className="text-black font-semibold">{c.district}</span></span>}
            {c.district && c.thana && <span className="text-slate-300 mx-1">·</span>}
            {c.thana && <span><span className="text-cyan-800 font-semibold">Thana:</span> <span className="text-black font-semibold">{c.thana}</span></span>}
          </p>
        )}

        {/* Receiver number */}
        {c.receiverNumber && (
          <p className="text-[11px] font-semibold text-slate-700 tracking-wide">{c.receiverNumber}</p>
        )}

        {/* Floor / Carrying chips */}
        {!isReturnCard && (c.floor || c.carrying) && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {c.floor && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-black text-emerald-700">
                🏢 {c.floor}তলা
              </span>
            )}
            {c.carrying && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[9px] font-semibold text-amber-700">
                🚐 {c.carrying}
              </span>
            )}
          </div>
        )}

        {/* Note */}
        {!isReturnCard && hasNote && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 break-words">
            📝 {c.note}
          </p>
        )}
        {isReturnCard && c.returnNote && (
          <p className="text-[9px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-1 italic break-words">
            📝 {c.returnNote}
          </p>
        )}
      </div>

      {/* ══ Product table ══ */}
      <div className={`mx-2.5 mb-2.5 rounded-lg border overflow-hidden text-[10px]
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
                  <td className={`px-2 py-1.5 text-[10px] font-semibold ${isReturnCard ? "text-orange-800" : "text-black"}`}>{p.productName}</td>
                  <td className={`px-2 py-1.5 uppercase text-[9px] ${isReturnCard ? "text-orange-700" : "text-black"}`}>{p.model}</td>
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
          <div className="shrink-0 border-t border-slate-100 px-3 py-2 bg-white">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {productSummary.length > 0 && (
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {productSummary.map(([name, qty], idx) => (
                    <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 max-w-[60px] sm:max-w-none truncate">{name}</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 shrink-0">{qty}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="hidden sm:block">
                {trip.advance != null && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-lg shrink-0">
                    <Wallet size={10} className="text-violet-500 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] text-violet-600 font-semibold">Adv:</span>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-black text-violet-700">৳{Number(trip.advance).toLocaleString()}</span>
                      {takaInWords(trip.advance) && (
                        <p className="text-[8px] text-violet-400 font-medium leading-none mt-0.5">{takaInWords(trip.advance)}</p>
                      )}
                    </div>
                  </div>
                )}
              </span>
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto shrink-0"
              >
                {isPage ? "Back" : "Close"}
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
      {showTripNote && !isVendor && (
        <TripNoteModal
          trip={trip} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(noteData) => syncTrip({ ...trip, ...noteData })}
          onClose={() => setShowTripNote(false)}
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
          onSave={({ updatedOriginal, newReturnChallan, removeReturn, syncedProducts }) => {
            let challans = trip.challans.map(c => c.challanId === updatedOriginal.challanId ? updatedOriginal : c);
            let totalChallan = trip.totalChallan;
            if (removeReturn) {
              // FIX #58 — return card(গুলো) local state থেকেও সরাও
              const before = challans.length;
              challans = challans.filter(c => !(c.isReturn && c.originalChallanId === updatedOriginal.challanId));
              totalChallan = Math.max(0, totalChallan - (before - challans.length));
            } else if (newReturnChallan) {
              challans = [...challans, newReturnChallan];
              totalChallan = totalChallan + 1;
            } else if (syncedProducts) {
              // Edit — embedded return card-এর quantity গুলোও sync করো
              challans = challans.map(c =>
                (c.isReturn && c.originalChallanId === updatedOriginal.challanId)
                  ? {
                      ...c,
                      returnNote: updatedOriginal.returnNote || "",
                      products: syncedProducts.map(p => ({
                        _id: p._id, productName: p.productName, model: p.model,
                        quantity: Number(p.returnQty || p.quantity) || 0,
                      })),
                    }
                  : c
              );
            }
            syncTrip({ ...trip, lastUpdatedBy: loggedInUser, totalChallan, challans });
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
      {rtnNoteChallan && (
        <RtnNoteModal
          tripId={trip._id} challan={rtnNoteChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(updatedChallan) => syncTrip({
            ...trip,
            challans: trip.challans.map(c =>
              c.challanId === updatedChallan.challanId
                ? { ...c, deliveryStatus: updatedChallan.deliveryStatus, challanReturnStatus: updatedChallan.challanReturnStatus, note: updatedChallan.note }
                : c
            ),
          })}
          onClose={() => setRtnNoteChallan(null)}
        />
      )}
      {floorCarryingChallan && (
        <FloorCarryingModal
          tripId={trip._id} challan={floorCarryingChallan} axiosSecure={axiosSecure} updatedBy={loggedInUser}
          onSave={(updatedChallan) => syncTrip({
            ...trip,
            challans: trip.challans.map(c => c.challanId === updatedChallan.challanId ? { ...c, floor: updatedChallan.floor, carrying: updatedChallan.carrying } : c),
          })}
          onClose={() => setFloorCarryingChallan(null)}
        />
      )}
      {showAddChallan && (
        <AddChallanModal
          trip={trip} axiosSecure={axiosSecure} addedBy={loggedInUser}
          onAdded={handleChallansAdded}
          onClose={() => setShowAddChallan(false)}
        />
      )}
    </>
  );
};

export default TripDetailsModal;