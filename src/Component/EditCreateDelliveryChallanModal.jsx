import React from "react";
import { FaBoxOpen, FaTrashAlt, FaPlus } from "react-icons/fa";
import { X, Check } from "lucide-react";

const EditCreateDeliveryChallanModal = ({
  isOpen, editingChallan, setIsEditModalOpen,
  handleEditChange, handleProductChange,
  handleDeleteProduct, handleUpdateChallan, setEditingChallan,
}) => {
  if (!isOpen || !editingChallan) return null;

  const handleAddProduct = () => {
    setEditingChallan(prev => ({
      ...prev,
      products: [...(prev.products || []), { productName: "", model: "", quantity: "" }],
    }));
  };

  const inp = "w-full px-3 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10 transition-all placeholder-slate-400";
  const lbl = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";
  const sec = "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.65)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && setIsEditModalOpen(false)}
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "96vh" }}
      >
        {/* Header */}
        <div className="shrink-0 bg-slate-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-white/50 border border-white/20 rounded-lg px-2 py-0.5 font-mono">edit</span>
            <span className="text-sm font-bold text-white">Edit Challan</span>
          </div>
          <button onClick={() => setIsEditModalOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 bg-slate-50 space-y-4">

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <p className={sec}>
              <span className="h-1 w-5 rounded-full bg-slate-700 shrink-0" />
              Customer Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className={lbl}>Customer Name</label>
                <input name="customerName" value={editingChallan.customerName || ""} onChange={handleEditChange}
                  placeholder="Ex: Rahim & Co" className={inp} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={lbl}>Receiver Number</label>
                <input name="receiverNumber" value={editingChallan.receiverNumber || ""} onChange={handleEditChange}
                  placeholder="+880 1XXX-XXXXXX" className={inp} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <p className={sec}>
              <span className="h-1 w-5 rounded-full bg-slate-700 shrink-0" />
              Delivery Address
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={lbl}>Zone</label>
                <input name="zone" value={editingChallan.zone || ""} onChange={handleEditChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Thana</label>
                <input name="thana" value={editingChallan.thana || ""} onChange={handleEditChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>District</label>
                <input name="district" value={editingChallan.district || ""} onChange={handleEditChange} className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Full Address</label>
              <input name="address" value={editingChallan.address || ""} onChange={handleEditChange} className={inp} />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className={sec + " mb-0"}>
                <span className="h-1 w-5 rounded-full bg-slate-700 shrink-0" />
                Products
              </p>
              <button type="button" onClick={handleAddProduct}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-all">
                <FaPlus size={9} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {editingChallan.products?.map((p, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  {/* Product name — small */}
                  <div className="w-[30%] shrink-0">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Item</label>
                    <input value={p.productName}
                      onChange={e => handleProductChange(index, "productName", e.target.value)}
                      className="w-full text-xs text-slate-800 outline-none bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-slate-400 placeholder-slate-300"
                      placeholder="Name" />
                  </div>
                  {/* Model — large */}
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Model</label>
                    <input value={p.model}
                      onChange={e => handleProductChange(index, "model", e.target.value)}
                      className="w-full text-xs text-slate-800 outline-none bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-slate-400 placeholder-slate-300 uppercase"
                      placeholder="Model" />
                  </div>
                  {/* Qty */}
                  <div className="w-12 shrink-0">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Qty</label>
                    <input type="number" min="1" value={p.quantity}
                      onChange={e => handleProductChange(index, "quantity", e.target.value)}
                      className="w-full text-xs font-black text-center text-slate-800 outline-none bg-white border border-slate-200 rounded-lg px-1 py-1.5 focus:border-slate-400" />
                  </div>
                  {editingChallan.products.length > 1 && (
                    <button type="button" onClick={() => handleDeleteProduct(index)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center border border-red-100 rounded-lg text-red-300 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <FaTrashAlt size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-100 flex gap-2.5">
          <button onClick={() => setIsEditModalOpen(false)}
            className="flex-1 py-2.5 text-[13px] font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition">
            Cancel
          </button>
          <button onClick={handleUpdateChallan}
            className="flex-[2] py-2.5 text-[13px] font-black text-white rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] bg-slate-800 hover:bg-slate-700">
            <Check size={13} /> Update Challan
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom,0px)" }} className="bg-white sm:hidden" />
      </div>
    </div>
  );
};

export default EditCreateDeliveryChallanModal;