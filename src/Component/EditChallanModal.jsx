

// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";

// const EditChallanModal = ({ open, onClose, challan, product, axiosSecure, setChallans }) => {
//   const [formData, setFormData] = useState({});

//   useEffect(() => {
//     if (open && challan && product) {
//       setFormData({
//         customerName: challan.customerName || "",
//         address: challan.address || "",
//         thana: challan.thana || "",
//         district: challan.district || "",
//         receiverNumber: challan.receiverNumber || "",
//         zone: challan.zone || "",
//         productName: product.productName || "",
//         model: product.model || "",
//         quantity: product.quantity || 0,
//       });
//     }
//   }, [open, challan, product]);

//   if (!open) return null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const challanUpdate = {
//         customerName: formData.customerName,
//         address: formData.address,
//         thana: formData.thana,
//         district: formData.district,
//         receiverNumber: formData.receiverNumber,
//         zone: formData.zone,
//       };

//       const productUpdate = {
//         productName: formData.productName,
//         model: formData.model,
//         quantity: Number(formData.quantity),
//       };

//       const resMain = await axiosSecure.patch(
//         `/challan/${challan._id}`,
//         challanUpdate
//       );

//       if (!resMain.data.success) {
//         throw new Error("Main challan update failed");
//       }

//       const resProd = await axiosSecure.put(
//         `/challan/${challan._id}/product/${product._id}`,
//         productUpdate
//       );

//       if (!resProd.data.success) {
//         throw new Error("Product update failed");
//       }

//       setChallans((prev) =>
//         prev.map((item) =>
//           item._id === challan._id ? resProd.data.data : item
//         )
//       );

//       Swal.fire({
//         icon: "success",
//         title: "Updated Successfully",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       onClose();

//     } catch (err) {
//       console.error(err);
//       Swal.fire("Error!", "Update failed!", "error");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
//         <div className="bg-green-600 p-4 flex justify-between items-center text-white">
//           <h3 className="font-bold text-lg">Edit Challan & Product</h3>
//           <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[90vh]">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
//             {/* --- Challan Details Section --- */}
//             <div className="space-y-4">
//               <h4 className="font-bold text-green-700 border-b pb-1 uppercase text-xs tracking-wider">Customer Details</h4>
              
//               <div>
//                 <label className="text-[11px] font-bold text-gray-400 uppercase">Customer Name</label>
//                 <input 
//                   className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                   value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
//                   placeholder="Customer Name"
//                 />
//               </div>

//               <div>
//                 <label className="text-[11px] font-bold text-gray-400 uppercase">Street Address</label>
//                 <input 
//                   className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                   value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
//                   placeholder="House/Road/Village"
//                 />
//               </div>

//               {/* Thana & District in one line */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-[11px] font-bold text-gray-400 uppercase">Thana</label>
//                   <input 
//                     className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                     value={formData.thana} onChange={(e) => setFormData({...formData, thana: e.target.value})} 
//                     placeholder="Thana"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[11px] font-bold text-gray-400 uppercase">District</label>
//                   <input 
//                     className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                     value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} 
//                     placeholder="District"
//                   />
//                 </div>
//               </div>

//               {/* Receiver Number & Zone in one line */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-[11px] font-bold text-gray-400 uppercase">Phone No</label>
//                   <input 
//                     className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                     value={formData.receiverNumber} onChange={(e) => setFormData({...formData, receiverNumber: e.target.value})} 
//                     placeholder="017xxxxxxxx"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[11px] font-bold text-gray-400 uppercase">Zone</label>
//                   <input 
//                     className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
//                     value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} 
//                     placeholder="Zone Name"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* --- Product Details Section --- */}
//             <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 h-fit">
//               <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-xs tracking-wider">Product Info</h4>
              
//               <div>
//                 <label className="text-[11px] font-bold text-gray-400 uppercase">Product Name</label>
//                 <input 
//                   className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
//                   value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} 
//                   placeholder="Item Name"
//                 />
//               </div>

//               <div>
//                 <label className="text-[11px] font-bold text-gray-400 uppercase">Model</label>
//                 <input 
//                   className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
//                   value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} 
//                   placeholder="Model Number"
//                 />
//               </div>

//               <div>
//                 <label className="text-[11px] font-bold text-gray-400 uppercase">Quantity</label>
//                 <input 
//                   type="number" className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
//                   value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
//                   placeholder="Qty"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 flex justify-end gap-3 border-t pt-4">
//             <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
//             <button type="submit" className="px-8 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition">Update Now</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditChallanModal;   



import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const EditChallanModal = ({ open, onClose, challan, product, axiosSecure, setChallans }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open && challan && product) {
      setFormData({
        customerName: challan.customerName || "",
        address: challan.address || "",
        thana: challan.thana || "",
        district: challan.district || "",
        receiverNumber: challan.receiverNumber || "",
        zone: challan.zone || "",
        model: product.model || "",
        quantity: product.quantity || 0,
      });
    }
  }, [open, challan, product]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const challanUpdate = {
        customerName: formData.customerName,
        address: formData.address,
        thana: formData.thana,
        district: formData.district,
        receiverNumber: formData.receiverNumber,
        zone: formData.zone,
      };

      const productUpdate = {
        model: formData.model,
        quantity: Number(formData.quantity),
      };

      const resMain = await axiosSecure.patch(`/challan/${challan._id}`, challanUpdate);
      if (!resMain.data.success) throw new Error("Main challan update failed");

      const resProd = await axiosSecure.put(`/challan/${challan._id}/product/${product._id}`, productUpdate);
      if (!resProd.data.success) throw new Error("Product update failed");

      setChallans((prev) =>
        prev.map((item) => (item._id === challan._id ? resProd.data.data : item))
      );

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Update failed!", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* --- Header: Recent Challan Style --- */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-xl tracking-tight">Edit Recent Challan</h3>
            <p className="text-green-100 text-xs mt-0.5 opacity-90">
              ID: <span className="font-mono">{challan?._id?.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* --- Left Column: Customer Details --- */}
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-6 bg-green-600 rounded-full"></span>
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Customer Information</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Customer Name</label>
                  <input 
                    required name="customerName"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    value={formData.customerName} onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Street Address</label>
                  <input 
                    required name="address"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    value={formData.address} onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Thana</label>
                    <input 
                      required name="thana"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                      value={formData.thana} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">District</label>
                    <input 
                      required name="district"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                      value={formData.district} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Column: Order & Contact --- */}
            <div className="flex-1 space-y-5 border-l border-gray-100 pl-0 md:pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-6 bg-blue-600 rounded-full"></span>
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Order & Contact</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Phone No</label>
                    <input 
                      required name="receiverNumber"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                      value={formData.receiverNumber} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Zone</label>
                    <input 
                      required name="zone"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                      value={formData.zone} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase ml-1 tracking-tighter">Product Model</label>
                    <input 
                      required name="model"
                      className="w-full border border-blue-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white" 
                      value={formData.model} onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase ml-1 tracking-tighter">Quantity</label>
                    <input 
                      required name="quantity" type="number" min="1"
                      className="w-full border border-blue-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white" 
                      value={formData.quantity} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div className="mt-10 flex justify-end items-center gap-4 border-t pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Discard Changes
            </button>
            <button 
              type="submit" 
              className="px-10 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-95"
            >
              Save & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChallanModal;