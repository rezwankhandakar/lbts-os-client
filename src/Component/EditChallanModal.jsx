// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";

// const EditChallanModal = ({ open, onClose, challan, product, axiosSecure, setChallans }) => {
//   const [formData, setFormData] = useState({});

//   useEffect(() => {
//     if (open && challan && product) {
//       setFormData({
//         customerName: challan.customerName || "",
//         address: challan.address || "",
//         receiverNumber: challan.receiverNumber || "",
//         zone: challan.zone || "",
//         productName: product.productName || "",
//         model: product.model || "",
//         quantity: product.quantity || 0,
//       });
//     }
//   }, [open, challan, product]);

//   if (!open) return null;

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const challanUpdate = {
//       customerName: formData.customerName,
//       address: formData.address,
//       receiverNumber: formData.receiverNumber,
//       zone: formData.zone,
//     };

//     const productUpdate = {
//       productName: formData.productName,
//       model: formData.model,
//       quantity: Number(formData.quantity),
//     };

//     // ১️⃣ First update main challan
//     const resMain = await axiosSecure.patch(
//       `/challan/${challan._id}`,
//       challanUpdate
//     );

//     if (!resMain.data.success) {
//       throw new Error("Main challan update failed");
//     }

//     // ২️⃣ Then update specific product
//     const resProd = await axiosSecure.put(
//       `/challan/${challan._id}/product/${product._id}`,
//       productUpdate
//     );

//     if (!resProd.data.success) {
//       throw new Error("Product update failed");
//     }

//     // ৩️⃣ Update UI with fresh DB data
//     setChallans((prev) =>
//       prev.map((item) =>
//         item._id === challan._id ? resProd.data.data : item
//       )
//     );

//     Swal.fire({
//       icon: "success",
//       title: "Updated Successfully",
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     onClose();

//   } catch (err) {
//     console.error(err);
//     Swal.fire("Error!", "Update failed!", "error");
//   }
// };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
//         <div className="bg-green-600 p-4 flex justify-between items-center text-white">
//           <h3 className="font-bold text-lg">Edit Challan & Product</h3>
//           <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-3">
//               <h4 className="font-bold text-green-700 border-b pb-1">Challan Details</h4>
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-green-500" 
//                 value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
//                 placeholder="Customer Name"
//               />
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-green-500" 
//                 value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
//                 placeholder="Address"
//               />
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-green-500" 
//                 value={formData.receiverNumber} onChange={(e) => setFormData({...formData, receiverNumber: e.target.value})} 
//                 placeholder="Receiver Number"
//               />
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-green-500" 
//                 value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} 
//                 placeholder="Zone"
//               />
//             </div>

//             <div className="space-y-3 bg-gray-50 p-3 rounded border">
//               <h4 className="font-bold text-blue-700 border-b pb-1">Product Details</h4>
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
//                 value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} 
//                 placeholder="Product Name"
//               />
//               <input 
//                 className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
//                 value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} 
//                 placeholder="Model"
//               />
//               <input 
//                 type="number" className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
//                 value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
//                 placeholder="Quantity"
//               />
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end gap-3">
//             <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 transition">Cancel</button>
//             <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Save Changes</button>
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
        productName: product.productName || "",
        model: product.model || "",
        quantity: product.quantity || 0,
      });
    }
  }, [open, challan, product]);

  if (!open) return null;

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
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity),
      };

      const resMain = await axiosSecure.patch(
        `/challan/${challan._id}`,
        challanUpdate
      );

      if (!resMain.data.success) {
        throw new Error("Main challan update failed");
      }

      const resProd = await axiosSecure.put(
        `/challan/${challan._id}/product/${product._id}`,
        productUpdate
      );

      if (!resProd.data.success) {
        throw new Error("Product update failed");
      }

      setChallans((prev) =>
        prev.map((item) =>
          item._id === challan._id ? resProd.data.data : item
        )
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Edit Challan & Product</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- Challan Details Section --- */}
            <div className="space-y-4">
              <h4 className="font-bold text-green-700 border-b pb-1 uppercase text-xs tracking-wider">Customer Details</h4>
              
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Customer Name</label>
                <input 
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                  value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
                  placeholder="Customer Name"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Street Address</label>
                <input 
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  placeholder="House/Road/Village"
                />
              </div>

              {/* Thana & District in one line */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Thana</label>
                  <input 
                    className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                    value={formData.thana} onChange={(e) => setFormData({...formData, thana: e.target.value})} 
                    placeholder="Thana"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">District</label>
                  <input 
                    className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                    value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} 
                    placeholder="District"
                  />
                </div>
              </div>

              {/* Receiver Number & Zone in one line */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Phone No</label>
                  <input 
                    className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                    value={formData.receiverNumber} onChange={(e) => setFormData({...formData, receiverNumber: e.target.value})} 
                    placeholder="017xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Zone</label>
                  <input 
                    className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-green-500 bg-white" 
                    value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} 
                    placeholder="Zone Name"
                  />
                </div>
              </div>
            </div>

            {/* --- Product Details Section --- */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 h-fit">
              <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-xs tracking-wider">Product Info</h4>
              
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Product Name</label>
                <input 
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
                  value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} 
                  placeholder="Item Name"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Model</label>
                <input 
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
                  value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} 
                  placeholder="Model Number"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Quantity</label>
                <input 
                  type="number" className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-blue-500 bg-white" 
                  value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  placeholder="Qty"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" className="px-8 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition">Update Now</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChallanModal;