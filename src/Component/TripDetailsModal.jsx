import React, { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded,
  Plus, Trash2, Pencil, Check, RotateCcw, StickyNote, Save, Wallet, ChevronDown,
  Building2, ArrowLeft
} from "lucide-react";
import useAuth from "../hooks/useAuth";

/* ── বাংলায় টাকার পরিমাণ ── */
const _ones = ["","এক","দুই","তিন","চার","পাঁচ","ছয়","সাত","আট","নয়",
               "দশ","এগারো","বারো","তেরো","চৌদ্দ","পনেরো","ষোলো","সতেরো","আঠারো","উনিশ"];
const _tens = ["","","বিশ","ত্রিশ","চল্লিশ","পঞ্চাশ","ষাট","সত্তর","আশি","নব্বই"];
function _b100(n){if(n<20)return _ones[n];return _tens[Math.floor(n/10)]+(n%10?" "+_ones[n%10]:"");}
function _b1000(n){if(n<100)return _b100(n);return _ones[Math.floor(n/100)]+" শত"+(n%100?" "+_b100(n%100):"");}
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
      if (deliveryStatus && deliveryStatus !== challan.deliveryStatus) {
        await axiosSecure.patch(`/deliveries/confirm`, {
          tripNumber: challan._tripNumber, challanId: challan.challanId,
          status: deliveryStatus, operator: updatedBy,
        });
      }
      if (challanReturnStatus && challanReturnStatus !== challan.challanReturnStatus) {
        await axiosSecure.patch(`/deliveries/challan-return`, {
          tripNumber: challan._tripNumber, challanId: challan.challanId,
          status: challanReturnStatus, operator: updatedBy,
        });
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
            <p className="font-bold text-sm">📋 RTN + Note</p>
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

  const [trip,                 setTrip]                 = useState(selectedTrip);
  const [loadingId,            setLoadingId]            = useState(null);
  const [editingChallan,       setEditingChallan]       = useState(null);
  const [editingTripInfo,      setEditingTripInfo]      = useState(false);
  const [returningChallan,     setReturningChallan]     = useState(null);
  const [notingChallan,        setNotingChallan]        = useState(null);
  const [floorCarryingChallan, setFloorCarryingChallan] = useState(null);
  const [rtnNoteChallan,       setRtnNoteChallan]       = useState(null);
  const [advance,              setAdvance]              = useState("");
  const [savingAdvance,        setSavingAdvance]        = useState(false);
  const [statsOpen,            setStatsOpen]            = useState(false);
  const [openActionMenu,       setOpenActionMenu]       = useState(null); // ← নতুন state

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

  const updateStatus = async (challanId, status, endpoint, field) => {
    try {
      setLoadingId(`${challanId}-${field}`);
      await axiosSecure.patch(`/deliveries/${endpoint}`, { tripNumber: trip.tripNumber, challanId, status, operator: loggedInUser });
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
                  onClick={() => setEditingTripInfo(true)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Pencil size={10} /> <span className="hidden sm:inline">Edit</span>
                </button>
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
                    {[
                      { label: "Confirmation Pending", value: deliveryNotConfirmed, color: "rose"  },
                      { label: "Challan Not Received", value: challanNotReceived,   color: "amber" },
                    ].map(b => (
                      <div key={b.label} className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center bg-white/5">
                        <p className={`text-[7px] text-${b.color}-400 uppercase font-black leading-none mb-0.5`}>{b.label}</p>
                        <p className={`text-xs sm:text-sm font-black text-${b.color}-400 leading-none`}>{b.value}</p>
                      </div>
                    ))}
                  </div>
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
                      {advance !== "" && advance != null && takaInWords(advance) && (
                        <p className="text-[9px] text-violet-300 font-medium mt-1 pl-0.5">{takaInWords(advance)}</p>
                      )}
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

        {/* Return badge OR status badges */}
        {isReturnCard ? (
          <div className="flex items-center gap-1.5">
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
                    <span className="text-[12px] shrink-0">📋</span> RTN + Note
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setFloorCarryingChallan(c); setOpenActionMenu(null); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[11px] font-semibold hover:bg-emerald-50 transition text-left ${hasFloor ? "text-emerald-700" : "text-emerald-600"}`}
                  >
                    <span className="text-[12px] shrink-0">🏢</span>
                    {c.floor ? `Floor: ${c.floor}তলা` : c.carrying ? `Carry: ${c.carrying}` : "Floor / Carrying"}
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
    </>
  );
};

export default TripDetailsModal;