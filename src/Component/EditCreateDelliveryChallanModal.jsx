

import React from "react";
import { FaTimes, FaBoxOpen, FaTrashAlt, FaPlus } from "react-icons/fa";

const EditCreateDeliveryChallanModal = ({
  isOpen,
  editingChallan,
  setIsEditModalOpen,
  handleEditChange,
  handleProductChange,
  handleDeleteProduct,
  handleUpdateChallan,
  setEditingChallan,
}) => {

  if (!isOpen || !editingChallan) return null;

  const handleAddProduct = () => {
    setEditingChallan(prev => ({
      ...prev,
      products: [...(prev.products || []), { productName: "", model: "", quantity: "" }],
    }));
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-colors placeholder:text-gray-400";
  const lbl = "block text-[11px] uppercase tracking-wider text-gray-600 mb-1";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={e => e.target === e.currentTarget && setIsEditModalOpen(false)}
    >
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 border border-white/20 rounded px-2 py-0.5 font-mono">edit</span>
            <span className="text-sm text-white">Edit Challan</span>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Customer Info */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100 after:content-['']">Customer Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Customer Name</label>
                <input name="customerName" value={editingChallan.customerName || ""} onChange={handleEditChange} placeholder="Ex: Rahim & Co" className={inp} />
              </div>
              <div>
                <label className={lbl}>Receiver Number</label>
                <input name="receiverNumber" value={editingChallan.receiverNumber || ""} onChange={handleEditChange} placeholder="+880 1XXX-XXXXXX" className={inp} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100 after:content-['']">Delivery Address</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
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
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2 after:w-8 after:h-px after:bg-gray-100 after:content-['']">Products</p>
              <button
                type="button"
                onClick={handleAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
              >
                <FaPlus size={9} /> Add Product
              </button>
            </div>

            <div className="space-y-2">
              {editingChallan.products?.map((p, index) => (
                <div key={index} className="flex gap-2 items-center p-2.5 bg-gray-50 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                  <div className="flex-[5]">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Item Name</label>
                    <input
                      value={p.productName}
                      onChange={e => handleProductChange(index, "productName", e.target.value)}
                      className="w-full text-sm text-gray-900 outline-none bg-transparent border-b border-gray-200 focus:border-gray-500 pb-0.5 placeholder:text-gray-400"
                      placeholder="Product name"
                    />
                  </div>
                  <div className="flex-[4]">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Model</label>
                    <input
                      value={p.model}
                      onChange={e => handleProductChange(index, "model", e.target.value)}
                      className="w-full text-sm text-gray-900 outline-none bg-transparent border-b border-gray-200 focus:border-gray-500 pb-0.5 placeholder:text-gray-400"
                      placeholder="Model"
                    />
                  </div>
                  <div className="w-16 shrink-0">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={e => handleProductChange(index, "quantity", e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 outline-none bg-transparent border-b border-gray-200 focus:border-gray-500 pb-0.5"
                      placeholder="0"
                    />
                  </div>
                  {editingChallan.products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(index)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center border border-red-100 rounded text-red-300 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <FaTrashAlt size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateChallan}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Update Challan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCreateDeliveryChallanModal;