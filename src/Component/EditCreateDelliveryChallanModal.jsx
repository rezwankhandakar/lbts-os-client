// import React from "react";
// import { FaTimes } from "react-icons/fa";

// const EditCreateDeliveryChallanModal = ({
//   isOpen,
//   editingChallan,
//   setIsEditModalOpen,
//   handleEditChange,
//   handleProductChange,
//   handleDeleteProduct,
//   handleUpdateChallan
// }) => {

//   if (!isOpen || !editingChallan) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

//       <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">

//         <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
//           <h3 className="font-black uppercase tracking-widest">
//             Edit Challan
//           </h3>

//           <button
//             onClick={() => setIsEditModalOpen(false)}
//             className="text-gray-300 hover:text-white"
//           >
//             <FaTimes size={18} />
//           </button>
//         </div>

//         <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

//           <input
//             name="customerName"
//             value={editingChallan.customerName || ""}
//             onChange={handleEditChange}
//             placeholder="Customer Name"
//             className="w-full border p-2 rounded"
//           />

//           <input
//             name="receiverNumber"
//             value={editingChallan.receiverNumber || ""}
//             onChange={handleEditChange}
//             placeholder="Receiver Number"
//             className="w-full border p-2 rounded"
//           />

//           <input
//             name="zone"
//             value={editingChallan.zone || ""}
//             onChange={handleEditChange}
//             placeholder="Zone"
//             className="w-full border p-2 rounded"
//           />

//           <input
//             name="address"
//             value={editingChallan.address || ""}
//             onChange={handleEditChange}
//             placeholder="Address"
//             className="w-full border p-2 rounded"
//           />

//           <input
//             name="thana"
//             value={editingChallan.thana || ""}
//             onChange={handleEditChange}
//             placeholder="Thana"
//             className="w-full border p-2 rounded"
//           />

//           <input
//             name="district"
//             value={editingChallan.district || ""}
//             onChange={handleEditChange}
//             placeholder="District"
//             className="w-full border p-2 rounded"
//           />

//           <h4 className="font-bold text-sm mt-4">Products</h4>

//           {editingChallan.products?.map((p, index) => (
//             <div key={index} className="grid grid-cols-4 gap-2 mb-2">

//               <input
//                 value={p.productName}
//                 onChange={(e) =>
//                   handleProductChange(index, "productName", e.target.value)
//                 }
//                 className="border p-2 rounded"
//                 placeholder="Product"
//               />

//               <input
//                 value={p.model}
//                 onChange={(e) =>
//                   handleProductChange(index, "model", e.target.value)
//                 }
//                 className="border p-2 rounded"
//                 placeholder="Model"
//               />

//               <input
//                 value={p.quantity}
//                 onChange={(e) =>
//                   handleProductChange(index, "quantity", e.target.value)
//                 }
//                 className="border p-2 rounded"
//                 placeholder="Qty"
//               />

//               <button
//                 onClick={() => handleDeleteProduct(index)}
//                 className="bg-red-500 hover:bg-red-600 text-white rounded font-bold"
//               >
//                 Delete
//               </button>

//             </div>
//           ))}

//           <div className="flex gap-3 mt-6">

//             <button
//               onClick={handleUpdateChallan}
//               className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold"
//             >
//               Save Changes
//             </button>

//             <button
//               onClick={() => setIsEditModalOpen(false)}
//               className="flex-1 py-3 bg-gray-200 rounded-xl font-bold"
//             >
//               Cancel
//             </button>

//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditCreateDeliveryChallanModal;



import React from "react";
import { FaTimes, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaBoxOpen, FaTrashAlt } from "react-icons/fa";

const EditCreateDeliveryChallanModal = ({
  isOpen,
  editingChallan,
  setIsEditModalOpen,
  handleEditChange,
  handleProductChange,
  handleDeleteProduct,
  handleUpdateChallan
}) => {

  if (!isOpen || !editingChallan) return null;

  // Input styling common classes
  const inputClasses = "w-full border-gray-200 border bg-gray-50/50 p-2.5 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none text-sm";
  const labelClasses = "text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300">
      
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center relative">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">
              Edit <span className="text-blue-400">Challan</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest mt-0.5">UPDATE DELIVERY INFORMATION</p>
          </div>

          <button
            onClick={() => setIsEditModalOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all duration-300"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Section: Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}><FaUser className="inline mr-1 mt-[-2px]"/> Customer Name</label>
              <input
                name="customerName"
                value={editingChallan.customerName || ""}
                onChange={handleEditChange}
                placeholder="Ex: Rahim & Co"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}><FaPhoneAlt className="inline mr-1 mt-[-2px]"/> Receiver Number</label>
              <input
                name="receiverNumber"
                value={editingChallan.receiverNumber || ""}
                onChange={handleEditChange}
                placeholder="+880 1XXX-XXXXXX"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Section: Location Info */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-3 border-b border-gray-200 pb-2 mb-1">
                <h4 className="text-xs font-bold text-slate-700 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500"/> DELIVERY ADDRESS DETAILS
                </h4>
             </div>
            <div>
              <label className={labelClasses}>Zone</label>
              <input name="zone" value={editingChallan.zone || ""} onChange={handleEditChange} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Thana</label>
              <input name="thana" value={editingChallan.thana || ""} onChange={handleEditChange} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>District</label>
              <input name="district" value={editingChallan.district || ""} onChange={handleEditChange} className={inputClasses} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClasses}>Full Address</label>
              <input name="address" value={editingChallan.address || ""} onChange={handleEditChange} className={inputClasses} />
            </div>
          </div>

          {/* Section: Products List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center tracking-widest uppercase">
                <FaBoxOpen className="mr-2 text-blue-600" size={16}/> Products In Challan
            </h4>

            {editingChallan.products?.map((p, index) => (
              <div key={index} className="flex gap-3 items-end group animate-in slide-in-from-left-2 duration-300">
                <div className="flex-grow grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Item Name</label>
                    <input
                      value={p.productName}
                      onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                      className="w-full text-sm font-semibold outline-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Model</label>
                    <input
                      value={p.model}
                      onChange={(e) => handleProductChange(index, "model", e.target.value)}
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Quantity</label>
                    <input
                      value={p.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      className="w-full text-sm font-bold text-blue-600 outline-none bg-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteProduct(index)}
                  className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white h-[52px] w-12 flex items-center justify-center rounded-xl transition-all"
                >
                  <FaTrashAlt size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            
            <button
              onClick={handleUpdateChallan}
              className="flex-[2] py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              Update Challan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditCreateDeliveryChallanModal;