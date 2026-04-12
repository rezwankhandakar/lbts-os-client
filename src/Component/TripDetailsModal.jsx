
import React, { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded,
  Plus, Trash2, Pencil, Check, RotateCcw, StickyNote, Save, Wallet
} from "lucide-react";
import useAuth from "../hooks/useAuth";


/* ─── Inline editable field ─── */
const Field = ({ label, value, onChange }) => (
  <div className="space-y-0.5">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <input
      className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
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
      const res = await axiosSecure.patch(`/deliveries/${trip._id}/trip-info`, {
        ...form,
        updatedBy,
      });
      Swal.fire({ icon: "success", title: "Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave(form, res.data?.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-3 bg-slate-800 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">Edit Trip Info</p>
            <p className="text-slate-400 text-[10px] font-mono">{trip.tripNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Truck size={11} className="text-indigo-400" /> Vehicle
            </p>
            <Field label="Vehicle Number" value={form.vehicleNumber} onChange={v => setForm(f => ({ ...f, vehicleNumber: v }))} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Package size={11} className="text-indigo-400" /> Vendor
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vendor Name" value={form.vendorName} onChange={v => setForm(f => ({ ...f, vendorName: v }))} />
              <Field label="Vendor Phone" value={form.vendorNumber} onChange={v => setForm(f => ({ ...f, vendorNumber: v }))} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User size={11} className="text-indigo-400" /> Driver
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Driver Name" value={form.driverName} onChange={v => setForm(f => ({ ...f, driverName: v }))} />
              <Field label="Driver Phone" value={form.driverNumber} onChange={v => setForm(f => ({ ...f, driverNumber: v }))} />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
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
      try {
        await axiosSecure.delete(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`);
      } catch { return Swal.fire({ icon: "error", title: "Delete failed" }); }
    }
    setProducts(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}`, {
        ...form,
        updatedBy,
      });
      for (const p of products) {
        if (!p.productName || !p.model) continue;
        const isNew = !p._id || p._id.startsWith("new_");
        if (isNew) {
          await axiosSecure.post(`/deliveries/${tripId}/challan/${challan.challanId}/product`,
            { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
        } else {
          await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/product/${p._id}`,
            { productName: p.productName, model: p.model, quantity: Number(p.quantity) || 1 });
        }
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-5 py-3 bg-indigo-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm">Edit Challan</p>
            <p className="text-indigo-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Customer Name" value={form.customerName} onChange={v => setForm(f => ({ ...f, customerName: v }))} /></div>
            <div className="col-span-2"><Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} /></div>
            <Field label="Thana" value={form.thana} onChange={v => setForm(f => ({ ...f, thana: v }))} />
            <Field label="District" value={form.district} onChange={v => setForm(f => ({ ...f, district: v }))} />
            <Field label="Receiver Number" value={form.receiverNumber} onChange={v => setForm(f => ({ ...f, receiverNumber: v }))} />
            <Field label="Zone" value={form.zone} onChange={v => setForm(f => ({ ...f, zone: v }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Products</p>
              <button onClick={handleAddProduct}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-lg transition">
                <Plus size={10} /> Add Product
              </button>
            </div>
            <div className="space-y-2">
              {products.map((p, i) => (
                <div key={p._id || i} className="flex gap-2 items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <input placeholder="Product name" value={p.productName}
                    onChange={e => handleProductChange(i, "productName", e.target.value)}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400" />
                  <input placeholder="Model" value={p.model}
                    onChange={e => handleProductChange(i, "model", e.target.value)}
                    className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 uppercase" />
                  <input type="number" min="1" value={p.quantity}
                    onChange={e => handleProductChange(i, "quantity", e.target.value)}
                    className="w-14 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400 text-center font-bold" />
                  <button onClick={() => handleDeleteProduct(i)}
                    className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Product Return Modal ─── */
const ReturnModal = ({ tripId, challan, onSave, onClose, axiosSecure, updatedBy }) => {
  const isEdit = !!(challan.returnedProducts?.length > 0);

  const [returnItems, setReturnItems] = useState(
    (challan.products || []).map(p => ({
      _id: p._id,
      productName: p.productName,
      model: p.model,
      deliveredQty: Number(p.quantity) || 0,
      returnQty: challan.returnedProducts?.find(r => r._id === p._id)?.returnQty || 0,
    }))
  );
  const [returnNote, setReturnNote] = useState(challan.returnNote || "");
  const [saving, setSaving] = useState(false);

  const handleQtyChange = (i, val) => {
    const max = returnItems[i].deliveredQty;
    const num = Math.min(Math.max(0, Number(val)), max);
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, returnQty: num } : r));
  };

  const handleFieldChange = (i, field, val) =>
    setReturnItems(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleAddItem = () =>
    setReturnItems(prev => [...prev, { _id: `new_${Date.now()}`, productName: "", model: "", deliveredQty: 999, returnQty: 1 }]);

  const handleRemoveItem = (i) => {
    if (returnItems.length <= 1) return;
    setReturnItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const activeReturns = returnItems.filter(r => r.returnQty > 0);
  const totalReturn = activeReturns.reduce((s, r) => s + r.returnQty, 0);

  const handleSave = async () => {
    if (activeReturns.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "No return items",
        text: "All quantities are 0. Please set at least one return quantity.",
        confirmButtonText: "OK",
      });
      return;
    }
    setSaving(true);
    try {
      const returnedProducts = activeReturns.map(r => ({
        _id: r._id, productName: r.productName, model: r.model, returnQty: r.returnQty,
      }));

      if (isEdit) {
        await axiosSecure.patch(`/deliveries/${tripId}/challan/${challan.challanId}/return`, {
          returnedProducts, returnNote, updatedBy,
        });
        Swal.fire({ icon: "success", title: "Return Updated!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: null });
      } else {
        const res = await axiosSecure.post(`/deliveries/${tripId}/return-challan`, {
          originalChallanId: challan.challanId,
          customerName: challan.customerName,
          zone: challan.zone,
          address: challan.address,
          thana: challan.thana,
          district: challan.district,
          receiverNumber: challan.receiverNumber,
          returnedProducts,
          returnNote,
          updatedBy,
        });
        Swal.fire({ icon: "success", title: "Return Added!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
        onSave({ updatedOriginal: { ...challan, returnedProducts, returnNote }, newReturnChallan: res.data.returnChallan });
      }
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-5 py-3 bg-orange-600 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2">
              <RotateCcw size={14} /> {isEdit ? "Edit Return" : "Product Return"}
            </p>
            <p className="text-orange-200 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Return Products</p>
              <button onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg transition">
                <Plus size={10} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {returnItems.map((r, i) => (
                <div key={r._id || i} className={`p-3 border rounded-xl transition-all ${r.returnQty > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Product name" value={r.productName}
                      onChange={e => handleFieldChange(i, "productName", e.target.value)}
                      className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-orange-400" />
                    <input placeholder="Model" value={r.model}
                      onChange={e => handleFieldChange(i, "model", e.target.value)}
                      className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-orange-400 uppercase" />
                    {returnItems.length > 1 && (
                      <button onClick={() => handleRemoveItem(i)}
                        className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition shrink-0">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!r._id?.startsWith("new_") && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold">Delivered:</span>
                        <span className="font-black text-slate-700">{r.deliveredQty} PCS</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[10px] font-bold text-orange-600">Return Qty:</span>
                      <input type="number" min="0"
                        max={r._id?.startsWith("new_") ? undefined : r.deliveredQty}
                        value={r.returnQty}
                        onChange={e => handleQtyChange(i, e.target.value)}
                        className="w-16 text-center text-sm font-black border border-orange-300 bg-white rounded-lg px-2 py-1 outline-none focus:border-orange-500 text-orange-700" />
                    </div>
                    {!r._id?.startsWith("new_") && (
                      <div className="shrink-0">
                        {r.returnQty === 0 && <span className="text-[9px] px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded font-bold">No Return</span>}
                        {r.returnQty > 0 && r.returnQty < r.deliveredQty && <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold">Partial</span>}
                        {r.returnQty > 0 && r.returnQty === r.deliveredQty && <span className="text-[9px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded font-bold">All Return</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalReturn > 0 && (
              <div className="mt-3 p-2.5 bg-orange-100 border border-orange-300 rounded-xl flex items-center justify-between">
                <p className="text-xs font-bold text-orange-700">Total Return</p>
                <p className="text-sm font-black text-orange-700">{totalReturn} PCS</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Return Note (Optional)</p>
            <textarea rows={3} value={returnNote} onChange={e => setReturnNote(e.target.value)}
              placeholder="e.g. Product damaged, customer refused..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 focus:bg-white transition-colors resize-none" />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400">
            {activeReturns.length > 0 ? `${activeReturns.length} item(s) — ${totalReturn} PCS total` : "No items selected"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              <Check size={14} /> {saving ? "Saving…" : isEdit ? "Update Return" : "Save Return"}
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
      const res = await axiosSecure.patch(
        `/deliveries/${tripId}/challan/${challan.challanId}/note`,
        { note, updatedBy }
      );
      Swal.fire({ icon: "success", title: "Note Saved!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      onSave({ ...challan, note }, res.data?.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message || "" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-3 bg-amber-500 flex items-center justify-between text-white shrink-0">
          <div>
            <p className="font-bold text-sm flex items-center gap-2"><StickyNote size={14} /> Challan Note</p>
            <p className="text-amber-100 text-[10px] font-mono">{challan.customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Note</p>
          <textarea rows={5} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Write any note about this challan..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 focus:bg-white transition-colors resize-none"
            autoFocus />
          {challan.noteUpdatedAt && (
            <p className="text-[10px] text-slate-400 mt-1.5">Last updated: {new Date(challan.noteUpdatedAt).toLocaleString()}</p>
          )}
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-60">
            <Save size={14} /> {saving ? "Saving…" : "Save Note"}
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

  /* ── Advance state ── */
  const [advance, setAdvance] = useState("");
  const [savingAdvance, setSavingAdvance] = useState(false);

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
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-700";
      case "not_received": return "bg-rose-100 text-rose-700";
      case "call_later": return "bg-amber-100 text-amber-700";
      case "received": return "bg-indigo-100 text-indigo-700";
      case "missing": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const syncTrip = (updated) => {
    setTrip(updated);
    if (onTripUpdate) onTripUpdate(updated);
  };

  const updateStatus = async (challanId, status, endpoint, field) => {
    try {
      setLoadingId(`${challanId}-${field}`);
      await axiosSecure.patch(`/deliveries/${endpoint}`, {
        tripNumber: trip.tripNumber, challanId, status, operator: "Admin"
      });
      syncTrip({
        ...trip,
        challans: trip.challans.map(c =>
          c.challanId === challanId ? { ...c, [field]: status } : c
        )
      });
      Swal.fire({ icon: "success", title: "Updated", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Update failed" });
    } finally { setLoadingId(null); }
  };

  const handleDeleteChallan = async (challanId, customerName) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Challan?",
      html: `<p class="text-sm text-gray-600">Remove <b>${customerName}</b> from this trip?</p>`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/deliveries/${trip._id}/challan/${challanId}`);
      syncTrip({
        ...trip,
        challans: trip.challans.filter(c => c.challanId !== challanId),
        totalChallan: trip.totalChallan - 1,
      });
      Swal.fire({ icon: "success", title: "Challan removed", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: err?.response?.data?.message || "Delete failed" });
    }
  };

  /* ── Save advance ── */
  const handleSaveAdvance = async () => {
    setSavingAdvance(true);
    try {
      const res = await axiosSecure.patch(`/deliveries/${trip._id}/advance`, {
        advance: advance !== "" ? Number(advance) : null,
        updatedBy: loggedInUser,
      });
      if (res.data.success) {
        const updated = res.data.data;
        setAdvance(updated.advance ?? "");
        syncTrip({
          ...trip,
          advance: updated.advance,
          advanceSavedBy: updated.advanceSavedBy,
          // lastUpdatedBy touch করছি না
        });
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Saved!", showConfirmButton: false, timer: 1200 });
      }
    } catch {
      Swal.fire("Error", "Failed to save advance", "error");
    }
    setSavingAdvance(false);
  };

  /* ── Product summary (normal challans only) ── */
  const productSummary = (() => {
    const map = {};
    trip.challans?.forEach(c => {
      if (c.isReturn) return;
      (c.products || []).forEach(p => {
        const key = p.productName;
        if (!map[key]) map[key] = 0;
        map[key] += Number(p.quantity || 0);
      });
    });
    return Object.entries(map);
  })();

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-start md:items-center z-50 p-2 md:p-4">
        <div className="bg-white w-full max-w-6xl max-h-[98vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">

          {/* Header */}
          <div className="p-3 border-b bg-white shrink-0">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{trip.tripNumber}</h2>
                <div className="h-4 w-[1px] bg-slate-200" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {new Date(trip.createdAt).toDateString()}
                </p>

                {/* Created by */}
                {(trip.currentUser || trip.createdBy) && (
                  <>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400">Created:</span>
                      <span className="text-xs font-medium text-slate-600">
                        {trip.currentUser || trip.createdBy}
                      </span>
                    </div>
                  </>
                )}

                {/* Updated by — challan/trip info edit করলে */}
                {trip.lastUpdatedBy && (
                  <>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Pencil size={11} className="text-indigo-400" />
                      <span className="text-[10px] text-slate-400">Updated:</span>
                      <span className="text-xs font-medium text-indigo-600">{trip.lastUpdatedBy}</span>
                    </div>
                  </>
                )}

                {/* Advance by — advance save করলে, সম্পূর্ণ আলাদা */}
                {trip.advanceSavedBy && (
                  <>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Wallet size={11} className="text-violet-400" />
                      <span className="text-[10px] text-slate-400">Advance by:</span>
                      <span className="text-xs font-medium text-violet-500">{trip.advanceSavedBy}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingTripInfo(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition">
                  <Pencil size={11} /> Edit Trip Info
                </button>
                <button onClick={() => setSelectedTrip(null)}
                  className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-all border border-transparent hover:border-rose-100">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
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
                    <span className="flex items-center gap-1.5 text-[11px] text-indigo-400 w-fit">
                      <PhoneForwarded size={10} className="shrink-0" />
                      <span className="font-bold">{trip.vendorNumber}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
                  <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <User size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</span>
                    <span className="text-sm font-bold text-white leading-tight">{trip.driverName}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-indigo-400 w-fit">
                      <PhoneForwarded size={10} className="shrink-0" />
                      <span className="font-bold">{trip.driverNumber}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-wider leading-none mb-1">Total Point</p>
                      <p className="text-sm font-black text-emerald-400 leading-none">
                        {trip.challans?.filter(c => !c.isReturn).length ?? trip.totalChallan}
                      </p>
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

                  {/* ── Advance inline input ── */}
                  <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                    <Wallet size={14} className="text-violet-400 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">
                        Advance (৳)
                      </span>
                      <input
                        type="number"
                        value={advance}
                        onChange={e => setAdvance(e.target.value)}
                        placeholder="—"
                        className="w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400 text-center"
                      />
                    </div>
                    <button
                      onClick={handleSaveAdvance}
                      disabled={savingAdvance}
                      className="flex items-center gap-1 px-2.5 py-1.5 mt-3.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                    >
                      <Save size={11} />
                      {savingAdvance ? "…" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Challan Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.challans.map((c, i) => {
                const isReturnCard = c.isReturn === true;
                const totalReturn = (c.returnedProducts || []).reduce((s, r) => s + (r.returnQty || 0), 0);
                const hasReturn = !isReturnCard && totalReturn > 0;
                const hasNote = !!c.note?.trim();

                return (
                  <div key={i} className={`group border rounded-2xl p-4 hover:shadow-md transition-all duration-200
                    ${isReturnCard
                      ? "bg-orange-50 border-orange-200 hover:border-orange-300"
                      : "bg-white border-slate-200 hover:border-indigo-200"
                    }`}>

                    {isReturnCard && (
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-md uppercase tracking-wide">
                            <RotateCcw size={9} /> Return Challan
                          </span>
                          {c.returnedAt && (
                            <span className="text-[10px] text-orange-600 font-semibold">
                              {new Date(c.returnedAt).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                        <button onClick={() => handleDeleteChallan(c.challanId, c.customerName)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 max-w-[60%]">
                        <p className="text-[11px] text-slate-800 font-bold break-words leading-tight">{c.customerName}</p>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md border font-semibold uppercase tracking-wide
                          ${isReturnCard
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          Zone : {c.zone}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-snug"><span className="font-semibold text-slate-600">Address :</span> {c.address}</p>
                        <p className="text-[11px] text-slate-500 leading-snug"><span className="font-semibold text-slate-600">District :</span> {c.district} <span className="font-semibold text-slate-600">Thana :</span> {c.thana}</p>
                        <p className="text-[11px] text-slate-600 font-semibold">Receiver : {c.receiverNumber}</p>
                        {!isReturnCard && hasNote && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1 italic">
                            📝 {c.note.length > 60 ? c.note.slice(0, 60) + "…" : c.note}
                          </p>
                        )}
                        {isReturnCard && c.returnNote && (
                          <p className="text-[10px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-1 mt-1 italic">
                            📝 {c.returnNote}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {!isReturnCard && (
                          <div className="flex gap-1.5">
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
                        )}

                        {!isReturnCard && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap justify-end">
                            <button onClick={() => setEditingChallan(c)}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                              <Pencil size={10} /> Edit
                            </button>
                            <button onClick={() => setReturningChallan(c)}
                              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold border rounded-lg transition
                                ${hasReturn
                                  ? "text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100"
                                  : "text-orange-500 border-orange-200 hover:bg-orange-50"}`}>
                              <RotateCcw size={10} /> {hasReturn ? `Return (${totalReturn})` : "Return"}
                            </button>
                            <button onClick={() => setNotingChallan(c)}
                              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold border rounded-lg transition
                                ${hasNote
                                  ? "text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100"
                                  : "text-amber-500 border-amber-200 hover:bg-amber-50"}`}>
                              <StickyNote size={10} /> Note
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Table */}
                    <div className={`mt-4 rounded-xl border overflow-hidden
                      ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
                      <table className="w-full text-[11px]">
                        <thead className={`uppercase text-[10px] ${isReturnCard ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                          <tr>
                            <th className="px-2 py-2 text-left">Product</th>
                            <th className="px-2 py-2 text-left">Model</th>
                            <th className="px-2 py-2 text-right">{isReturnCard ? "Return Qty" : "Delivered"}</th>
                            {!isReturnCard && hasReturn && <th className="px-2 py-2 text-right text-orange-500">Return</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {c.products.map((p, idx) => {
                            const ret = !isReturnCard && c.returnedProducts?.find(r => r._id === p._id);
                            return (
                              <tr key={idx} className={`border-b last:border-0 transition
                                ${isReturnCard ? "border-orange-100 hover:bg-orange-100/50" : "border-slate-100 hover:bg-white"}`}>
                                <td className={`px-2 py-1.5 font-semibold ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>{p.productName}</td>
                                <td className={`px-2 py-1.5 uppercase ${isReturnCard ? "text-orange-700" : "text-slate-600"}`}>{p.model}</td>
                                <td className={`px-2 py-1.5 text-right font-bold ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>{p.quantity} PCS</td>
                                {!isReturnCard && hasReturn && (
                                  <td className="px-2 py-1.5 text-right font-bold text-orange-600">
                                    {ret?.returnQty ? `${ret.returnQty} PCS` : "—"}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {!isReturnCard && hasReturn && c.returnNote && (
                        <div className="px-3 py-2 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-700 italic">
                          Return Note: {c.returnNote}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 border-t px-5 py-3 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {productSummary.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Summary:</span>
                  {productSummary.map(([name, qty], idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-700">{name}</span>
                      <span className="text-[11px] font-black text-indigo-600">{qty} PCS</span>
                    </div>
                  ))}
                </div>
              )}
              {trip.advance != null && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 rounded-lg">
                  <Wallet size={11} className="text-violet-500 shrink-0" />
                  <span className="text-[11px] text-violet-600 font-semibold">Advance:</span>
                  <span className="text-[11px] font-black text-violet-700">৳ {Number(trip.advance).toLocaleString()}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedTrip(null)}
              className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Sub-modals */}
      {editingTripInfo && (
        <EditTripInfoModal
          trip={trip}
          axiosSecure={axiosSecure}
          updatedBy={loggedInUser}
          onSave={(info, serverData) => syncTrip({
            ...trip, ...info,
            lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
            // advanceSavedBy touch করছি না
          })}
          onClose={() => setEditingTripInfo(false)}
        />
      )}

      {editingChallan && (
        <EditChallanCard
          tripId={trip._id}
          challan={editingChallan}
          axiosSecure={axiosSecure}
          updatedBy={loggedInUser}
          onSave={(updatedChallan, serverData) => {
            syncTrip({
              ...trip,
              lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
              challans: trip.challans.map(c =>
                c.challanId === updatedChallan.challanId ? updatedChallan : c
              ),
            });
          }}
          onClose={() => setEditingChallan(null)}
        />
      )}

      {returningChallan && (
        <ReturnModal
          tripId={trip._id}
          challan={returningChallan}
          axiosSecure={axiosSecure}
          updatedBy={loggedInUser}
          onSave={({ updatedOriginal, newReturnChallan }) => {
            const updatedChallans = trip.challans.map(c =>
              c.challanId === updatedOriginal.challanId ? updatedOriginal : c
            );
            syncTrip({
              ...trip,
              lastUpdatedBy: loggedInUser,
              totalChallan: newReturnChallan ? trip.totalChallan + 1 : trip.totalChallan,
              challans: newReturnChallan
                ? [...updatedChallans, newReturnChallan]
                : updatedChallans,
            });
          }}
          onClose={() => setReturningChallan(null)}
        />
      )}

      {notingChallan && (
        <NoteModal
          tripId={trip._id}
          challan={notingChallan}
          axiosSecure={axiosSecure}
          updatedBy={loggedInUser}
          onSave={(updatedChallan, serverData) => {
            syncTrip({
              ...trip,
              lastUpdatedBy: serverData?.lastUpdatedBy || loggedInUser,
              challans: trip.challans.map(c =>
                c.challanId === updatedChallan.challanId ? updatedChallan : c
              ),
            });
          }}
          onClose={() => setNotingChallan(null)}
        />
      )}
    </>
  );
};

export default TripDetailsModal;
