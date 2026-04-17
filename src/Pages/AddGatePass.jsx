// import React, { useState, useRef } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import useAuth from "../hooks/useAuth";
// import AutoDropdown from "../Component/AutoDropdown";
// import Swal from "sweetalert2";
// import EditRecentGatePassModal from "../Component/EditRecentGatePassModal";

// const AddGatePass = () => {
//   const axiosSecure = useAxiosSecure();
//   const { user } = useAuth();
//   const queryClient = useQueryClient();

//   const [autoData, setAutoData] = useState({});
//   const [activeField, setActiveField] = useState(null);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const debounceRef = useRef(null);

//   const { register, control, handleSubmit, reset, setValue } = useForm({
//     defaultValues: { products: [{ productName: "", model: "", quantity: "" }] },
//   });

//   const { fields, append, remove } = useFieldArray({ control, name: "products" });

//   const { data: recentGatePass = null } = useQuery({
//     queryKey: ["recent-gate-pass"],
//     queryFn: async () => {
//       const res = await axiosSecure.get("/gate-pass?limit=1");
//       return res.data.data?.[0] || null;
//     },
//     staleTime: 30 * 1000,
//   });

//   const handleAutoSearch = (fieldKey, field, value) => {
//     if (!value) return;
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(async () => {
//       try {
//         const res = await axiosSecure.get(`/autocomplete?field=${field}&search=${value}`);
//         setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
//         setActiveField(fieldKey);
//       } catch (err) {
//         console.error(err);
//       }
//     }, 400);
//   };

//   const onSubmit = async (data) => {
//     try {
//       const tripDateObj = new Date(data.tripDate);
//       const payload = {
//         ...data,
//         currentUser: user.displayName,
//         createdAt: new Date(),
//         tripMonth: tripDateObj.getMonth() + 1,
//         tripYear: tripDateObj.getFullYear(),
//       };
//       const res = await axiosSecure.post("/gate-pass", payload);
//       if (res.data.insertedId) {
//         Swal.fire({ icon: "success", title: "Gate Pass Added", text: "Gate pass added successfully ✅", timer: 1500, showConfirmButton: false });
//         reset();
//         queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
//       }
//     } catch (err) {
//       console.error(err);
//       Swal.fire({ icon: "error", title: "Failed", text: "Gate pass add failed ❌" });
//     }
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       icon: "warning", title: "Are you sure?", text: "Do you want to Delete this!",
//       showCancelButton: true, confirmButtonText: "Yes, delete it!",
//     });
//     if (confirm.isConfirmed) {
//       try {
//         await axiosSecure.delete(`/gate-pass/${id}`);
//         Swal.fire({ title: "Deleted!", text: "Gate pass has been deleted.", icon: "success", timer: 1500, showConfirmButton: false });
//         queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
//       } catch (err) {
//         console.error(err);
//         Swal.fire("Error!", "Failed to delete gate pass.", "error");
//       }
//     }
//   };

//   const handleEdit = (product) => {
//     setSelectedProduct(product);
//     setEditModalOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">

//         {/* Add Gate Pass Form */}
//         <div className="lg:col-span-4 bg-white shadow-lg rounded-xl p-6">
//           <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Add Gate Pass</h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//             <div className="grid md:grid-cols-4 gap-4">
//               <input placeholder="Trip Do" {...register("tripDo", { required: true })} className="input border" />
//               <input type="date" {...register("tripDate", { required: true })} className="input border" />
//               <div className="relative">
//                 <input placeholder="CSD" {...register("csd", { required: true })} onChange={(e) => handleAutoSearch("csd", "csd", e.target.value)} className="input border w-full" />
//                 <AutoDropdown fieldKey="csd" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("csd", v)} />
//               </div>
//               <div className="relative">
//                 <input placeholder="Unit" {...register("unit", { required: true })} onChange={(e) => handleAutoSearch("unit", "unit", e.target.value)} className="input border w-full" />
//                 <AutoDropdown fieldKey="unit" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("unit", v)} />
//               </div>
//             </div>

//             <div className="grid md:grid-cols-3 gap-4">
//               <div className="relative">
//                 <input placeholder="Customer Name" {...register("customerName", { required: true })} onChange={(e) => handleAutoSearch("customerName", "customerName", e.target.value)} className="input border w-full" />
//                 <AutoDropdown fieldKey="customerName" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("customerName", v)} />
//               </div>
//               <div className="relative">
//                 <input placeholder="Vehicle No" {...register("vehicleNo", { required: true })} onChange={(e) => handleAutoSearch("vehicleNo", "vehicleNo", e.target.value)} className="input border w-full" />
//                 <AutoDropdown fieldKey="vehicleNo" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("vehicleNo", v)} />
//               </div>
//               <div className="relative">
//                 <input placeholder="Zone / PO" {...register("zone", { required: true })} onChange={(e) => handleAutoSearch("zone", "zone", e.target.value)} className="input border w-full" />
//                 <AutoDropdown fieldKey="zone" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("zone", v)} />
//               </div>
//             </div>

//             <div>
//               {fields.map((item, index) => (
//                 <div key={item.id} className="grid grid-cols-12 gap-3 mt-2 bg-gray-50 p-2 rounded">
//                   <div className="relative col-span-5">
//                     <input placeholder="Product" {...register(`products.${index}.productName`)} onChange={(e) => handleAutoSearch(`productName-${index}`, "productName", e.target.value)} className="input w-full border" />
//                     <AutoDropdown fieldKey={`productName-${index}`} autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue(`products.${index}.productName`, v)} />
//                   </div>
//                   <div className="relative col-span-5">
//                     <input placeholder="Model" {...register(`products.${index}.model`)} onChange={(e) => handleAutoSearch(`model-${index}`, "model", e.target.value)} className="input w-full border" />
//                     <AutoDropdown fieldKey={`model-${index}`} autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue(`products.${index}.model`, v)} />
//                   </div>
//                   <input type="number" placeholder="Qty" {...register(`products.${index}.quantity`, { required: true })} className="input col-span-2 border" />
//                 </div>
//               ))}
//               <div className="flex gap-2 mt-3">
//                 <button type="button" onClick={() => append({ productName: "", model: "", quantity: "" })} className="btn btn-sm btn-outline text-indigo-600 border-indigo-600 hover:bg-sky-100">+ Add Product</button>
//                 {fields.length > 1 && <button type="button" onClick={() => remove(fields.length - 1)} className="btn btn-sm btn-error">Remove</button>}
//               </div>
//             </div>

//             <button type="submit" className="btn btn-primary w-full shadow-lg">Submit Gate Pass</button>
//           </form>
//         </div>

//         {/* Recent Gate Pass Card */}
//         <div className="lg:col-span-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-slate-200 overflow-hidden h-fit sticky top-6">
//           <div className="relative bg-slate-900 p-5 overflow-hidden">
//             <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/30 rounded-full blur-2xl"></div>
//             <div className="relative flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-indigo-600 rounded-xl border border-indigo-400">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
//                 </div>
//                 <h3 className="text-white font-extrabold text-sm tracking-wide">Recently Added</h3>
//               </div>
//               {recentGatePass && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse border border-slate-900"></span>}
//             </div>
//           </div>

//           <div className="p-6">
//             {recentGatePass ? (
//               <div className="space-y-6">
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">Trip DO</span>
//                     <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-mono font-black border border-indigo-100">{recentGatePass.tripDo}</span>
//                   </div>
//                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-inner">
//                     {[
//                       { label: "Customer", value: recentGatePass.customerName, color: "text-blue-800 font-extrabold" },
//                       { label: "Unit", value: recentGatePass.unit, color: "text-slate-900 font-bold" },
//                       { label: "CSD", value: recentGatePass.csd, color: "text-slate-900 font-bold" },
//                       { label: "Date", value: recentGatePass.tripDate?.slice(0, 10), color: "text-slate-900 font-bold" },
//                       { label: "Vehicle", value: recentGatePass.vehicleNo, color: "text-slate-900 font-bold" },
//                       { label: "Zone/PO", value: recentGatePass.zone, color: "text-slate-900 font-bold" },
//                     ].map((detail, idx) => (
//                       <div key={idx} className="flex justify-between items-start text-[13px] border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
//                         <span className="text-slate-600 font-bold min-w-[70px]">{detail.label}</span>
//                         <span className={`text-right break-words flex-1 ml-4 ${detail.color}`}>{detail.value || "N/A"}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="flex items-center gap-2">
//                     <span className="h-[2px] flex-1 bg-slate-200"></span>
//                     <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Products Details</span>
//                     <span className="h-[2px] flex-1 bg-slate-200"></span>
//                   </div>
//                   <div className="grid grid-cols-1 gap-2">
//                     {recentGatePass.products.map((prod, idx) => (
//                       <div key={idx} className="flex items-center justify-between p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-300 transition-all shadow-sm">
//                         <div className="flex flex-col">
//                           <span className="text-sm font-black text-slate-900 leading-tight">{prod.productName}</span>
//                           <span className="text-[11px] font-bold text-slate-600">{prod.model}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className="text-xs font-black text-white bg-slate-800 px-2 py-1 rounded-lg">{prod.quantity}</span>
//                           <button onClick={() => handleEdit(prod)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all border border-transparent hover:border-orange-200">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="pt-4 flex flex-col gap-4">
//                   <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-100">
//                     <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
//                       Assigned By: <span className="text-slate-900 font-black">{recentGatePass.currentUser}</span>
//                     </span>
//                   </div>
//                   <button onClick={() => handleDelete(recentGatePass._id)} className="group flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="py-20 text-center">
//                 <div className="inline-flex p-5 bg-slate-100 rounded-full mb-4 text-slate-400">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
//                 </div>
//                 <p className="text-sm font-black text-slate-900 uppercase">No Data Found</p>
//                 <p className="text-[11px] text-slate-600 font-bold mt-1 tracking-tight">Add a new entry to see it here</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {editModalOpen && selectedProduct && (
//         <EditRecentGatePassModal
//           open={editModalOpen}
//           onClose={() => setEditModalOpen(false)}
//           gp={recentGatePass}
//           p={selectedProduct}
//           axiosSecure={axiosSecure}
//           refreshGatePass={() => queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] })}
//         />
//       )}
//     </div>
//   );
// };

// export default AddGatePass;




import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import Swal from "sweetalert2";
import EditRecentGatePassModal from "../Component/EditRecentGatePassModal";

const AddGatePass = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [autoData, setAutoData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRecent, setShowRecent] = useState(false); // mobile toggle
  const debounceRef = useRef(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: { products: [{ productName: "", model: "", quantity: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  const { data: recentGatePass = null } = useQuery({
    queryKey: ["recent-gate-pass"],
    queryFn: async () => {
      const res = await axiosSecure.get("/gate-pass?limit=1");
      return res.data.data?.[0] || null;
    },
    staleTime: 30 * 1000,
  });

  const handleAutoSearch = (fieldKey, field, value) => {
    if (!value) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosSecure.get(`/autocomplete?field=${field}&search=${value}`);
        setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
        setActiveField(fieldKey);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  const onSubmit = async (data) => {
    try {
      const tripDateObj = new Date(data.tripDate);
      const payload = {
        ...data,
        currentUser: user.displayName,
        createdAt: new Date(),
        tripMonth: tripDateObj.getMonth() + 1,
        tripYear: tripDateObj.getFullYear(),
      };
      const res = await axiosSecure.post("/gate-pass", payload);
      if (res.data.insertedId) {
        Swal.fire({ icon: "success", title: "Gate Pass Added", text: "Gate pass added successfully ✅", timer: 1500, showConfirmButton: false });
        reset();
        queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
        setShowRecent(true); // show recent panel on mobile after submit
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed", text: "Gate pass add failed ❌" });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning", title: "Are you sure?", text: "Do you want to Delete this!",
      showCancelButton: true, confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/gate-pass/${id}`);
        Swal.fire({ title: "Deleted!", text: "Gate pass has been deleted.", icon: "success", timer: 1500, showConfirmButton: false });
        queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", "Failed to delete gate pass.", "error");
      }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  /* ── Shared input class ── */
  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white transition-all";

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Mobile: tab switcher ── */}
        <div className="flex lg:hidden mb-3 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setShowRecent(false)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5
              ${!showRecent ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Gate Pass
          </button>
          <button
            onClick={() => setShowRecent(true)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5
              ${showRecent ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <span className={`w-2 h-2 rounded-full ${recentGatePass ? "bg-emerald-400" : "bg-gray-300"}`} />
            Recently Added
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 sm:gap-6">

          {/* ── FORM ── */}
          <div className={`lg:col-span-4 bg-white shadow-lg rounded-xl p-4 sm:p-6 ${showRecent ? "hidden lg:block" : "block"}`}>
            <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 text-gray-800">Add Gate Pass</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">

              {/* Row 1: Trip Do, Date, CSD, Unit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Trip Do</label>
                  <input placeholder="Trip Do" {...register("tripDo", { required: true })} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Date</label>
                  <input type="date" {...register("tripDate", { required: true })} className={inp} />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">CSD</label>
                  <input placeholder="CSD" {...register("csd", { required: true })}
                    onChange={(e) => handleAutoSearch("csd", "csd", e.target.value)} className={inp} />
                  <AutoDropdown fieldKey="csd" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("csd", v)} />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Unit</label>
                  <input placeholder="Unit" {...register("unit", { required: true })}
                    onChange={(e) => handleAutoSearch("unit", "unit", e.target.value)} className={inp} />
                  <AutoDropdown fieldKey="unit" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("unit", v)} />
                </div>
              </div>

              {/* Row 2: Customer, Vehicle, Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Customer Name</label>
                  <input placeholder="Customer Name" {...register("customerName", { required: true })}
                    onChange={(e) => handleAutoSearch("customerName", "customerName", e.target.value)} className={inp} />
                  <AutoDropdown fieldKey="customerName" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("customerName", v)} />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle No</label>
                  <input placeholder="Vehicle No" {...register("vehicleNo", { required: true })}
                    onChange={(e) => handleAutoSearch("vehicleNo", "vehicleNo", e.target.value)} className={inp} />
                  <AutoDropdown fieldKey="vehicleNo" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("vehicleNo", v)} />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Zone / PO</label>
                  <input placeholder="Zone / PO" {...register("zone", { required: true })}
                    onChange={(e) => handleAutoSearch("zone", "zone", e.target.value)} className={inp} />
                  <AutoDropdown fieldKey="zone" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("zone", v)} />
                </div>
              </div>

              {/* Products */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Products</label>
                <div className="space-y-2">
                  {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {/* Product name — full width on xs, 5 cols on sm */}
                      <div className="relative col-span-12 sm:col-span-5">
                        <input placeholder="Product" {...register(`products.${index}.productName`)}
                          onChange={(e) => handleAutoSearch(`productName-${index}`, "productName", e.target.value)}
                          className={inp} />
                        <AutoDropdown fieldKey={`productName-${index}`} autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue(`products.${index}.productName`, v)} />
                      </div>
                      {/* Model */}
                      <div className="relative col-span-8 sm:col-span-5">
                        <input placeholder="Model" {...register(`products.${index}.model`)}
                          onChange={(e) => handleAutoSearch(`model-${index}`, "model", e.target.value)}
                          className={inp} />
                        <AutoDropdown fieldKey={`model-${index}`} autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue(`products.${index}.model`, v)} />
                      </div>
                      {/* Qty */}
                      <div className="col-span-4 sm:col-span-2">
                        <input type="number" placeholder="Qty" {...register(`products.${index}.quantity`, { required: true })}
                          className={inp} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button type="button"
                    onClick={() => append({ productName: "", model: "", quantity: "" })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-all">
                    + Add Product
                  </button>
                  {fields.length > 1 && (
                    <button type="button"
                      onClick={() => remove(fields.length - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <button type="submit"
                className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] text-sm sm:text-base">
                Submit Gate Pass
              </button>
            </form>
          </div>

          {/* ── RECENT GATE PASS ── */}
          <div className={`lg:col-span-2 ${showRecent ? "block" : "hidden lg:block"}`}>
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl border border-slate-200 overflow-hidden lg:sticky lg:top-6">

              {/* Card header */}
              <div className="relative bg-slate-900 px-4 sm:px-5 py-3.5 sm:py-4 overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/30 rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-xl border border-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-extrabold text-sm tracking-wide">Recently Added</h3>
                  </div>
                  {recentGatePass && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse border border-slate-900" />}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {recentGatePass ? (
                  <div className="space-y-4 sm:space-y-5">

                    {/* Trip DO + details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Trip DO</span>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-mono font-black border border-indigo-100">
                          {recentGatePass.tripDo}
                        </span>
                      </div>

                      <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 shadow-inner">
                        {[
                          { label: "Customer", value: recentGatePass.customerName, color: "text-blue-800 font-extrabold" },
                          { label: "Unit",     value: recentGatePass.unit,         color: "text-slate-900 font-bold" },
                          { label: "CSD",      value: recentGatePass.csd,          color: "text-slate-900 font-bold" },
                          { label: "Date",     value: recentGatePass.tripDate?.slice(0, 10), color: "text-slate-900 font-bold" },
                          { label: "Vehicle",  value: recentGatePass.vehicleNo,    color: "text-slate-900 font-bold" },
                          { label: "Zone/PO",  value: recentGatePass.zone,         color: "text-slate-900 font-bold" },
                        ].map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-slate-500 font-bold min-w-[60px] shrink-0">{detail.label}</span>
                            <span className={`text-right break-words flex-1 ml-3 ${detail.color}`}>{detail.value || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">Products</span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        {recentGatePass.products.map((prod, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-black text-slate-900 leading-tight truncate">{prod.productName}</span>
                              <span className="text-[10px] font-bold text-slate-500">{prod.model}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg">{prod.quantity}</span>
                              <button onClick={() => handleEdit(prod)}
                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all border border-transparent hover:border-orange-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 flex flex-col gap-3">
                      <div className="flex items-center justify-center py-1.5 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                          Assigned By: <span className="text-slate-900 font-black">{recentGatePass.currentUser}</span>
                        </span>
                      </div>
                      <button onClick={() => handleDelete(recentGatePass._id)}
                        className="group flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 sm:py-20 text-center">
                    <div className="inline-flex p-4 sm:p-5 bg-slate-100 rounded-full mb-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase">No Data Found</p>
                    <p className="text-[11px] text-slate-600 font-bold mt-1 tracking-tight">Add a new entry to see it here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {editModalOpen && selectedProduct && (
        <EditRecentGatePassModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          gp={recentGatePass}
          p={selectedProduct}
          axiosSecure={axiosSecure}
          refreshGatePass={() => queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] })}
        />
      )}
    </div>
  );
};

export default AddGatePass;
