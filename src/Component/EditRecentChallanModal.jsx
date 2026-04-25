import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { X, Save } from "lucide-react";

const EditRecentChallanModal = ({ open, onClose, challan, product, axiosSecure, refreshChallan }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "", address: "", district: "", thana: "",
    receiverNumber: "", zone: "", model: "", productName: "", quantity: "",
  });

  useEffect(() => {
    if (open && challan && product) {
      setFormData({
        customerName: challan.customerName || "", address: challan.address || "",
        district: challan.district || "", thana: challan.thana || "",
        receiverNumber: challan.receiverNumber || "", zone: challan.zone || "",
        model: product.model || "", productName: product.productName || "",
        quantity: product.quantity || "",
      });
    }
  }, [open, challan, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosSecure.put(`/challan/${challan._id}/product/${product._id}`, {
        model: formData.model, productName: formData.productName,
        quantity: Number(formData.quantity),
      });
      await axiosSecure.patch(`/challan/${challan._id}`, {
        customerName: formData.customerName, address: formData.address,
        district: formData.district, thana: formData.thana,
        receiverNumber: formData.receiverNumber, zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });
      Swal.fire({ icon: "success", title: "Updated Successfully", timer: 1500, showConfirmButton: false });
      onClose();
      refreshChallan();
    } catch (err) {
      Swal.fire("Error!", "Update failed!", "error");
    }
  };

  if (!open) return null;

  const inp = "w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition-all placeholder-slate-400";
  const lbl = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "96vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 to-green-600">
          <div>
            <p className="text-white font-black text-sm tracking-tight">Edit Recent Challan</p>
            <p className="text-emerald-200 text-[11px] font-mono mt-0.5">ID: {challan?._id?.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white/70 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 py-4 bg-slate-50 space-y-4">

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Information</p>
            </div>
            <div>
              <label className={lbl}>Customer Name</label>
              <input required name="customerName" value={formData.customerName} onChange={handleChange} className={inp} placeholder="Customer name" />
            </div>
            <div>
              <label className={lbl}>Street Address</label>
              <input required name="address" value={formData.address} onChange={handleChange} className={inp} placeholder="Address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Thana</label>
                <input required name="thana" value={formData.thana} onChange={handleChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>District</label>
                <input required name="district" value={formData.district} onChange={handleChange} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Phone No</label>
                <input required name="receiverNumber" value={formData.receiverNumber} onChange={handleChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Zone</label>
                <input required name="zone" value={formData.zone} onChange={handleChange} className={inp} />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-5 rounded-full bg-blue-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Information</p>
            </div>
            <div>
              <label className={`${lbl} text-blue-500`}>Product Name</label>
              <input required name="productName" value={formData.productName} onChange={handleChange}
                className={`${inp} border-blue-200 focus:border-blue-400 focus:ring-blue-400/10`} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${lbl} text-blue-500`}>Model</label>
                <input required name="model" value={formData.model} onChange={handleChange}
                  className={`${inp} uppercase border-blue-200 focus:border-blue-400 focus:ring-blue-400/10`} />
              </div>
              <div>
                <label className={`${lbl} text-blue-500`}>Quantity</label>
                <input required name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange}
                  className={`${inp} border-blue-200 focus:border-blue-400 focus:ring-blue-400/10`} />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-100 flex gap-2.5">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition">
            Discard
          </button>
          <button type="submit" onClick={handleSubmit}
            className="flex-[2] py-2.5 text-[13px] font-black text-white rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
            <Save size={13} /> Save & Update
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom,0px)" }} className="bg-white sm:hidden" />
      </div>
    </div>
  );
};

export default EditRecentChallanModal;