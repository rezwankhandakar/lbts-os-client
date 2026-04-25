import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { X, Save } from "lucide-react";

const EditGatePassModal = ({ open, onClose, gp, p, axiosSecure, setGatePasses }) => {
  const [formData, setFormData] = useState({
    tripDo: "", tripDate: "", customerName: "", csd: "",
    unit: "", vehicleNo: "", zone: "", productName: "", model: "", quantity: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (gp && p) {
      setFormData({
        tripDo: gp.tripDo || "", tripDate: gp.tripDate?.slice(0, 10) || "",
        customerName: gp.customerName || "", csd: gp.csd || "",
        unit: gp.unit || "", vehicleNo: gp.vehicleNo || "",
        zone: gp.zone || "", productName: p.productName || "",
        model: p.model || "", quantity: p.quantity || ""
      });
    }
  }, [gp, p]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosSecure.put(`/gate-pass/${gp._id}/product/${p._id}`, {
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity),
      });
      const res = await axiosSecure.patch(`/gate-pass/${gp._id}`, {
        tripDo: formData.tripDo, tripDate: formData.tripDate,
        customerName: formData.customerName, csd: formData.csd,
        unit: formData.unit, vehicleNo: formData.vehicleNo,
        zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });
      setGatePasses(prev => prev.map(g => g._id === gp._id ? res.data.data : g));
      onClose();
      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: "Something went wrong!" });
    }
  };

  if (!open) return null;

  const inp = "w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all placeholder-slate-400";
  const lbl = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "96vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 shrink-0">
          <div>
            <p className="text-white font-black text-sm tracking-tight">Edit Gate Pass</p>
            {gp?.tripDo && <p className="text-slate-400 text-[11px] font-mono mt-0.5">{gp.tripDo}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 py-4 space-y-3 bg-slate-50">

          {/* Trip Do + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Trip Do</label>
              <input required type="text" name="tripDo" value={formData.tripDo} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Trip Date</label>
              <input required type="date" name="tripDate" value={formData.tripDate} onChange={handleChange} className={inp} />
            </div>
          </div>

          {/* Customer */}
          <div>
            <label className={lbl}>Customer</label>
            <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} placeholder="Customer name" />
          </div>

          {/* CSD + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>CSD</label>
              <input required type="text" name="csd" value={formData.csd} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Unit</label>
              <input required type="text" name="unit" placeholder="Unit" value={formData.unit} onChange={handleChange}
                className={`${inp} bg-indigo-50 border-indigo-200 focus:border-indigo-400`} />
            </div>
          </div>

          {/* Vehicle + Zone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Vehicle No</label>
              <input required type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Zone</label>
              <input required type="text" name="zone" value={formData.zone} onChange={handleChange} className={inp} />
            </div>
          </div>

          {/* Product section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</p>
            <div>
              <label className={lbl}>Product Name</label>
              <input required type="text" name="productName" placeholder="Product name" value={formData.productName} onChange={handleChange} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={lbl}>Model</label>
                <input required type="text" name="model" placeholder="Model" value={formData.model} onChange={handleChange}
                  className={`${inp} uppercase`} />
              </div>
              <div>
                <label className={lbl}>Quantity</label>
                <input required type="number" min="1" name="quantity" placeholder="Qty" value={formData.quantity} onChange={handleChange} className={inp} />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-100 flex gap-2.5">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" form="edit-gp-form" onClick={handleSubmit}
            className="flex-[2] py-2.5 text-[13px] font-black text-white rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
            <Save size={13} /> Save Changes
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom,0px)" }} className="bg-white sm:hidden" />
      </div>
    </div>
  );
};

export default EditGatePassModal;