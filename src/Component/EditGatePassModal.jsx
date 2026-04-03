

import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

const EditGatePassModal = ({ open, onClose, gp, p, axiosSecure, setGatePasses }) => {
  const [formData, setFormData] = useState({
    tripDo: "",
    tripDate: "",
    customerName: "",
    csd: "",
    unit: "",
    vehicleNo: "",
    zone: "",
    productName: "",
    model: "",
    quantity: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (gp && p) {
      setFormData({
        tripDo: gp.tripDo || "",
        tripDate: gp.tripDate?.slice(0, 10) || "",
        customerName: gp.customerName || "",
        csd: gp.csd || "",
        unit: gp.unit || "",
        vehicleNo: gp.vehicleNo || "",
        zone: gp.zone || "",
        productName: p.productName || "",
        model: p.model || "",
        quantity: p.quantity || ""
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
      // ⭐ product update
      await axiosSecure.put(`/gate-pass/${gp._id}/product/${p._id}`, {
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity),
      });

      // ⭐ gate pass main update
      const res = await axiosSecure.patch(`/gate-pass/${gp._id}`, {
        tripDo: formData.tripDo,
        tripDate: formData.tripDate,
        customerName: formData.customerName,
        csd: formData.csd,
        unit: formData.unit,
        vehicleNo: formData.vehicleNo,
        zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });

      setGatePasses((prev) =>
        prev.map((g) => (g._id === gp._id ? res.data.data : g))
      );

      onClose();

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Gate pass updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Something went wrong!",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Edit Gate Pass</h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {/* Row 1 */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Trip Do</label>
            <input
              required
              type="text"
              name="tripDo"
              value={formData.tripDo}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Trip Date</label>
            <input
              required
              type="date"
              name="tripDate"
              value={formData.tripDate}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 ml-1">Customer</label>
            <input
              required
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 3 - CSD & Unit */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">CSD</label>
            <input
              required
              type="text"
              name="csd"
              value={formData.csd}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Unit</label>
            <input
              required
              type="text"
              name="unit"
              placeholder="Unit"
              value={formData.unit}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
            />
          </div>

          {/* Row 4 */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Vehicle No</label>
            <input
              required
              type="text"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Zone</label>
            <input
              required
              type="text"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 5 - Product Info */}
          <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Product Details</p>
            <div className="space-y-2">
              <input
                required
                type="text"
                name="productName"
                placeholder="Product Name"
                value={formData.productName}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-1.5 rounded-lg w-full outline-none"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  name="model"
                  placeholder="Model"
                  value={formData.model}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg w-full outline-none"
                />
                <input
                  required
                  type="number"
                  min="1"
                  name="quantity"
                  placeholder="Qty"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg w-24 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGatePassModal;



// import React, { useState, useEffect } from "react";
// import useAuth from "../hooks/useAuth";
// import Swal from "sweetalert2";

// const EditGatePassModal = ({ open, onClose, gp, p, axiosSecure, setGatePasses }) => {
//   const [formData, setFormData] = useState({
//     tripDo: "", tripDate: "", customerName: "", csd: "",
//     unit: "", vehicleNo: "", zone: "", productName: "", model: "", quantity: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     if (gp && p) {
//       setFormData({
//         tripDo: gp.tripDo || "",
//         tripDate: gp.tripDate?.slice(0, 10) || "",
//         customerName: gp.customerName || "",
//         csd: gp.csd || "",
//         unit: gp.unit || "",
//         vehicleNo: gp.vehicleNo || "",
//         zone: gp.zone || "",
//         productName: p.productName || "",
//         model: p.model || "",
//         quantity: p.quantity || ""
//       });
//     }
//   }, [gp, p]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axiosSecure.put(`/gate-pass/${gp._id}/product/${p._id}`, {
//         productName: formData.productName,
//         model: formData.model,
//         quantity: Number(formData.quantity),
//       });
//       const res = await axiosSecure.patch(`/gate-pass/${gp._id}`, {
//         tripDo: formData.tripDo,
//         tripDate: formData.tripDate,
//         customerName: formData.customerName,
//         csd: formData.csd,
//         unit: formData.unit,
//         vehicleNo: formData.vehicleNo,
//         zone: formData.zone,
//         currentUser: user?.displayName || user?.email,
//       });
//       setGatePasses(prev => prev.map(g => g._id === gp._id ? res.data.data : g));
//       onClose();
//       Swal.fire({ icon: "success", title: "Updated!", text: "Gate pass updated successfully", timer: 1500, showConfirmButton: false });
//     } catch (err) {
//       console.error(err);
//       Swal.fire({ icon: "error", title: "Update failed", text: "Something went wrong!" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!open) return null;

//   const inp = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-colors placeholder:text-gray-400";
//   const lbl = "block text-[11px] uppercase tracking-wider text-gray-600 mb-1";

//   return (
//     <div
//       className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
//       onClick={e => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

//         {/* Header */}
//         <div className="bg-gray-800 px-5 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <span className="text-xs text-white/60 border border-white/20 rounded px-2 py-0.5 font-mono">edit</span>
//             <span className="text-sm text-white">Edit Gate Pass</span>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-all"
//           >
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//             </svg>
//           </button>
//         </div>

//         {/* Body */}
//         <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">

//           {/* Trip Info */}
//           <div>
//             <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100 after:content-['']">Trip Information</p>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className={lbl}>Trip DO</label>
//                 <input required name="tripDo" type="text" value={formData.tripDo} onChange={handleChange} className={inp} placeholder="DO-0000" />
//               </div>
//               <div>
//                 <label className={lbl}>Trip Date</label>
//                 <input required name="tripDate" type="date" value={formData.tripDate} onChange={handleChange} className={inp} />
//               </div>
//             </div>
//           </div>

//           {/* Customer & Logistics */}
//           <div>
//             <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100 after:content-['']">Customer &amp; Logistics</p>
//             <div className="space-y-3">
//               <div>
//                 <label className={lbl}>Customer Name</label>
//                 <input required name="customerName" type="text" value={formData.customerName} onChange={handleChange} className={inp} placeholder="Full name" />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className={lbl}>CSD</label>
//                   <input required name="csd" type="text" value={formData.csd} onChange={handleChange} className={inp} placeholder="CSD" />
//                 </div>
//                 <div>
//                   <label className={lbl}>Unit</label>
//                   <input required name="unit" type="text" value={formData.unit} onChange={handleChange} className={inp} placeholder="Unit" />
//                 </div>
//                 <div>
//                   <label className={lbl}>Vehicle No</label>
//                   <input required name="vehicleNo" type="text" value={formData.vehicleNo} onChange={handleChange} className={inp} placeholder="Vehicle number" />
//                 </div>
//                 <div>
//                   <label className={lbl}>Zone / PO</label>
//                   <input required name="zone" type="text" value={formData.zone} onChange={handleChange} className={inp} placeholder="Zone" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product */}
//           <div>
//             <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-100 after:content-['']">Product Details</p>
//             <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
//               <div>
//                 <label className={lbl}>Product Name</label>
//                 <input required name="productName" type="text" value={formData.productName} onChange={handleChange} className={inp} placeholder="Product name" />
//               </div>
//               <div className="grid grid-cols-3 gap-3">
//                 <div className="col-span-2">
//                   <label className={lbl}>Model</label>
//                   <input required name="model" type="text" value={formData.model} onChange={handleChange} className={inp} placeholder="Model" />
//                 </div>
//                 <div>
//                   <label className={lbl}>Qty</label>
//                   <input required name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} className={inp} placeholder="0" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-end gap-2 pt-1">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors flex items-center gap-2 disabled:opacity-60"
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
//                   </svg>
//                   Saving…
//                 </>
//               ) : (
//                 <>
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                     <polyline points="20 6 9 17 4 12"/>
//                   </svg>
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditGatePassModal;