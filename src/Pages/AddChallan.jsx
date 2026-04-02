

// import React, { useState, useEffect } from "react";

// import { useForm, useFieldArray } from "react-hook-form";
// import { Plus, Trash2, Edit3, User, MapPin, Phone, Package, Send, History, Globe, Clock, Building, Navigation } from "lucide-react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import useAuth from "../hooks/useAuth";
// import AutoDropdown from "../Component/AutoDropdown";
// import Swal from "sweetalert2";
// import EditRecentChallanModal from "../Component/EditRecentChallanModal";

// const AddChallan = () => {
//   const axiosSecure = useAxiosSecure();
//   const { user } = useAuth();

//   const [autoData, setAutoData] = useState({});
//   const [activeField, setActiveField] = useState(null);
//   const [recentChallan, setRecentChallan] = useState(null);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
//     defaultValues: {
//       products: [{ model: "", productName: "", quantity: "" }],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "products",
//   });

//   const handleAutoSearch = async (fieldKey, field, value) => {
//     if (!value) return;
//     try {
//       const res = await axiosSecure.get(`/autocomplete?collection=challan&field=${field}&search=${value}`);
//       setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
//       setActiveField(fieldKey);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchRecentChallan = async () => {
//     try {
//       const res = await axiosSecure.get("/challan/recent?limit=1");
//       setRecentChallan(res.data.data?.[0] || null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchRecentChallan();
//   }, []);

//   const onSubmit = async (data) => {
//     try {
//       const payload = { ...data, currentUser: user?.displayName, createdAt: new Date() };
//       const res = await axiosSecure.post("/challan", payload);

//       if (res.data.insertedId) {
//         Swal.fire({ icon: "success", title: "Challan Created!", showConfirmButton: false, timer: 1500 });
//         reset();
//         fetchRecentChallan();
//       }
//     } catch (err) {
//       Swal.fire("Error!", "Failed to add challan", "error");
//     }
//   };

//   const handleEdit = (product, index) => {
//     setSelectedProduct({ ...product, productIndex: index });
//     setEditModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "Delete this challan?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#ef4444",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (confirm.isConfirmed) {
//       try {
//         await axiosSecure.delete(`/challan/${id}`);
//         Swal.fire("Deleted!", "Challan deleted.", "success");
//         fetchRecentChallan();
//       } catch (err) { console.error(err); }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

//         {/* ================= FORM SECTION (Left) ================= */}
//         <div className="lg:col-span-7 bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
//           <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-3">
//             <Package className="text-blue-600" size={24} />
//             <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Delivery Challan</h2>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//             <div className="bg-white space-y-5">

//               {/* Row 1: Customer Name, Phone & Zone */}
//               <div className="grid grid-cols-12 gap-2">
//                 <div className="col-span-12 md:col-span-5">
//                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Customer Name</label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-3 text-slate-400" size={18} />
//                     <input {...register("customerName", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="Customer Name" />
//                   </div>
//                 </div>

//                 <div className="col-span-12 md:col-span-4">
//                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Receiver Phone</label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
//                     <input {...register("receiverNumber", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="017XXXXXXXX" />
//                   </div>
//                 </div>

//                 <div className="col-span-12 md:col-span-3 relative">
//                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Zone</label>
//                   <div className="relative">
//                     <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
//                     <input
//                       {...register("zone", { required: true })}
//                       onChange={(e) => handleAutoSearch("zone", "zone", e.target.value)}
//                       className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="Zone"
//                     />
//                   </div>
//                   <AutoDropdown fieldKey="zone" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("zone", v)} />
//                 </div>
//               </div>

//               {/* Row 2: Full Street Address */}
//               <div className="w-full">
//                 <label className="text-xs font-semibold text-slate-500 mb-1 block">Address</label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
//                   <input {...register("address", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="Enter Delivery Address..." />
//                 </div>
//               </div>

//               {/* Row 3: Thana & District */}
//               <div className="grid grid-cols-12 gap-4">
//                 <div className="col-span-12 md:col-span-6 relative">
//                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Thana</label>
//                   <div className="relative">
//                     <Navigation className="absolute left-3 top-3 text-slate-400" size={18} />
//                     <input
//                       {...register("thana", { required: true })}
//                       onChange={(e) => handleAutoSearch("thana", "thana", e.target.value)}
//                       className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="Enter Thana"
//                     />
//                   </div>
//                   <AutoDropdown fieldKey="thana" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("thana", v)} />
//                 </div>

//                 <div className="col-span-12 md:col-span-6 relative">
//                   <label className="text-xs font-semibold text-slate-500 mb-1 block">District</label>
//                   <div className="relative">
//                     <Building className="absolute left-3 top-3 text-slate-400" size={18} />
//                     <input
//                       {...register("district", { required: true })}
//                       onChange={(e) => handleAutoSearch("district", "district", e.target.value)}
//                       className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="Enter District"
//                     />
//                   </div>
//                   <AutoDropdown fieldKey="district" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("district", v)} />
//                 </div>
//               </div>
//             </div>

//             {/* Product Section - MODEL, PRODUCT NAME & QTY */}
//             <div className="pt-4 border-t border-slate-100">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-bold text-slate-700 text-sm">Product Particulars</h3>
//                 <button type="button" onClick={() => append({ model: "", productName: "", quantity: "" })} className="btn btn-sm btn-ghost text-blue-600 normal-case">
//                   <Plus size={16} /> Add Item
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {fields.map((item, index) => (
//                   <div key={item.id} className="grid grid-cols-12 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center">

//                     <div className="col-span-4 relative">
//                       <input
//                         {...register(`products.${index}.productName`, { required: true })}
//                         onChange={(e) => handleAutoSearch(`product-${index}`, "productName", e.target.value)}
//                         className="input input-sm input-bordered w-full bg-white h-10"
//                         placeholder="Product Name"
//                       />
//                       <AutoDropdown
//                         fieldKey={`product-${index}`}
//                         autoData={autoData}
//                         activeField={activeField}
//                         setActiveField={setActiveField}
//                         setFormValue={(v) => setValue(`products.${index}.productName`, v)}
//                       />
//                     </div>

//                     <div className="col-span-5 relative">
//                       <input
//                         {...register(`products.${index}.model`, { required: true })}
//                         onChange={(e) => handleAutoSearch(`model-${index}`, "model", e.target.value)}
//                         className="input input-sm input-bordered w-full bg-white h-10"
//                         placeholder="Model"
//                       />
//                       <AutoDropdown fieldKey={`model-${index}`} autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue(`products.${index}.model`, v)} />
//                     </div>

//                     <div className="col-span-2">
//                       <input type="number" {...register(`products.${index}.quantity`, { required: true })} className="input input-sm input-bordered w-full text-center bg-white h-10" placeholder="Qty" />
//                     </div>

//                     <div className="col-span-1 flex justify-center">
//                       <button type="button" onClick={() => remove(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <button className="btn btn-primary w-full shadow-lg shadow-blue-500/20 gap-2 h-12 text-md font-bold rounded-xl border-none bg-blue-600 hover:bg-blue-700">
//               <Send size={18} /> Submit Challan
//             </button>
//           </form>
//         </div>

//         {/* ================= RECENT CHALLAN (Right) ================= */}
//         <div className="lg:col-span-5">
//           <div className="bg-white shadow-sm border border-slate-200 rounded-2xl sticky top-8">
//             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
//               <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                 <History className="text-emerald-600" size={20} />
//                 Recent Challan
//               </h3>
//               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase tracking-wider">Latest Entry</span>
//             </div>

//             {recentChallan ? (
//               <div className="p-6 space-y-6">
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer Name</label>
//                       <h4 className="text-xl font-bold text-slate-900 uppercase leading-tight">{recentChallan.customerName}</h4>
//                     </div>
//                     <button onClick={() => handleDelete(recentChallan._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
//                       <Trash2 size={18} />
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
//                       <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Receiver Number</label>
//                       <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                         <Phone size={14} className="text-blue-500" /> {recentChallan.receiverNumber}
//                       </p>
//                     </div>
//                     <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
//                       <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Zone</label>
//                       <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase">
//                         <Globe size={14} className="text-blue-500" /> {recentChallan.zone}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
//                     <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Delivery Address</label>
//                     <p className="text-[13px] font-medium text-slate-600 leading-relaxed flex items-start gap-2 mb-2">
//                       <MapPin size={16} className="text-red-400 mt-0.5" /> {recentChallan.address}
//                     </p>
//                     <div className="flex gap-2 border-t border-slate-200 pt-2">
//                       <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded uppercase"> <span className="text-blue-400">Thana:</span> {recentChallan.thana}</span>
//                       <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded uppercase"> <span className="text-blue-400">District:</span> {recentChallan.district}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block">Items Information</label>
//                   <div className="space-y-2">
//                     {recentChallan.products?.map((p, i) => (
//                       <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
//                             {i + 1}
//                           </div>
//                           <div>
//                             <p className="text-[11px] text-slate-500">{p.productName}</p>
//                             <p className="text-[13px] font-bold text-slate-800 uppercase">{p.model}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-4">
//                           <span className="text-md font-bold text-blue-600">{p.quantity}</span>
//                           <button onClick={() => handleEdit(p, i)} className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors">
//                             <Edit3 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
//                   <div className="flex items-center gap-2 text-xs font-semibold italic">
//                     By: {recentChallan.currentUser || 'Admin'}
//                   </div>
//                   <div className="flex items-center gap-1 text-[11px] font-medium">
//                     <Clock size={12} /> {new Date(recentChallan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="py-20 text-center text-slate-400 text-sm italic">
//                 No recent activity found.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* MODAL */}
//       {editModalOpen && selectedProduct && (
//         <EditRecentChallanModal
//           open={editModalOpen}
//           onClose={() => { setEditModalOpen(false); setSelectedProduct(null); }}
//           challan={recentChallan}
//           product={selectedProduct}
//           axiosSecure={axiosSecure}
//           refreshChallan={fetchRecentChallan}
//         />
//       )}
//     </div>
//   );
// };

// export default AddChallan;


import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, User, MapPin, Phone, Package, Send, History, Globe, Clock, Building, Navigation } from "lucide-react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import Swal from "sweetalert2";
import EditRecentChallanModal from "../Component/EditRecentChallanModal";

const AddChallan = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [autoData, setAutoData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const debounceRef = useRef(null);

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      products: [{ model: "", productName: "", quantity: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  // ── React Query — Recent Challan ───────────────────────────────
  const { data: recentChallan = null } = useQuery({
    queryKey: ["recent-challan"],
    queryFn: async () => {
      const res = await axiosSecure.get("/challan/recent?limit=1");
      return res.data.data?.[0] || null;
    },
    staleTime: 30 * 1000, // ৩০ সেকেন্ড cache
  });

  // ── Autocomplete — debounce সহ ────────────────────────────────
  const handleAutoSearch = (fieldKey, field, value) => {
    if (!value) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosSecure.get(`/autocomplete?collection=challan&field=${field}&search=${value}`);
        setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
        setActiveField(fieldKey);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  // ── Submit ─────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, currentUser: user?.displayName, createdAt: new Date() };
      const res = await axiosSecure.post("/challan", payload);

      if (res.data.insertedId) {
        Swal.fire({ icon: "success", title: "Challan Created!", showConfirmButton: false, timer: 1500 });
        reset();
        queryClient.invalidateQueries({ queryKey: ["recent-challan"] });
      }
    } catch (err) {
      Swal.fire("Error!", "Failed to add challan", "error");
    }
  };

  // ── Edit ───────────────────────────────────────────────────────
  const handleEdit = (product, index) => {
    setSelectedProduct({ ...product, productIndex: index });
    setEditModalOpen(true);
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this challan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/challan/${id}`);
        Swal.fire("Deleted!", "Challan deleted.", "success");
        queryClient.invalidateQueries({ queryKey: ["recent-challan"] });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= FORM SECTION (Left) ================= */}
        <div className="lg:col-span-7 bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-3">
            <Package className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Delivery Challan</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="bg-white space-y-5">

              {/* Row 1: Customer Name, Phone & Zone */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 md:col-span-5">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input {...register("customerName", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="Customer Name" />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Receiver Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input {...register("receiverNumber", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="017XXXXXXXX" />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3 relative">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Zone</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      {...register("zone", { required: true })}
                      onChange={(e) => handleAutoSearch("zone", "zone", e.target.value)}
                      className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Zone"
                    />
                  </div>
                  <AutoDropdown fieldKey="zone" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("zone", v)} />
                </div>
              </div>

              {/* Row 2: Full Street Address */}
              <div className="w-full">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input {...register("address", { required: true })} className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20" placeholder="Enter Delivery Address..." />
                </div>
              </div>

              {/* Row 3: Thana & District */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 relative">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Thana</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      {...register("thana", { required: true })}
                      onChange={(e) => handleAutoSearch("thana", "thana", e.target.value)}
                      className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter Thana"
                    />
                  </div>
                  <AutoDropdown fieldKey="thana" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("thana", v)} />
                </div>

                <div className="col-span-12 md:col-span-6 relative">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">District</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      {...register("district", { required: true })}
                      onChange={(e) => handleAutoSearch("district", "district", e.target.value)}
                      className="input input-bordered w-full pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter District"
                    />
                  </div>
                  <AutoDropdown fieldKey="district" autoData={autoData} activeField={activeField} setActiveField={setActiveField} setFormValue={(v) => setValue("district", v)} />
                </div>
              </div>
            </div>

            {/* Product Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 text-sm">Product Particulars</h3>
                <button type="button" onClick={() => append({ model: "", productName: "", quantity: "" })} className="btn btn-sm btn-ghost text-blue-600 normal-case">
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center">
                    <div className="col-span-4 relative">
                      <input
                        {...register(`products.${index}.productName`, { required: true })}
                        onChange={(e) => handleAutoSearch(`product-${index}`, "productName", e.target.value)}
                        className="input input-sm input-bordered w-full bg-white h-10"
                        placeholder="Product Name"
                      />
                      <AutoDropdown
                        fieldKey={`product-${index}`}
                        autoData={autoData}
                        activeField={activeField}
                        setActiveField={setActiveField}
                        setFormValue={(v) => setValue(`products.${index}.productName`, v)}
                      />
                    </div>

                    <div className="col-span-5 relative">
                      <input
                        {...register(`products.${index}.model`, { required: true })}
                        onChange={(e) => handleAutoSearch(`model-${index}`, "model", e.target.value)}
                        className="input input-sm input-bordered w-full bg-white h-10"
                        placeholder="Model"
                      />
                      <AutoDropdown
                        fieldKey={`model-${index}`}
                        autoData={autoData}
                        activeField={activeField}
                        setActiveField={setActiveField}
                        setFormValue={(v) => setValue(`products.${index}.model`, v)}
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        {...register(`products.${index}.quantity`, { required: true })}
                        className="input input-sm input-bordered w-full text-center bg-white h-10"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => remove(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary w-full shadow-lg shadow-blue-500/20 gap-2 h-12 text-md font-bold rounded-xl border-none bg-blue-600 hover:bg-blue-700">
              <Send size={18} /> Submit Challan
            </button>
          </form>
        </div>

        {/* ================= RECENT CHALLAN (Right) ================= */}
        <div className="lg:col-span-5">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl sticky top-8">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History className="text-emerald-600" size={20} />
                Recent Challan
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase tracking-wider">Latest Entry</span>
            </div>

            {recentChallan ? (
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer Name</label>
                      <h4 className="text-xl font-bold text-slate-900 uppercase leading-tight">{recentChallan.customerName}</h4>
                    </div>
                    <button onClick={() => handleDelete(recentChallan._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Receiver Number</label>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone size={14} className="text-blue-500" /> {recentChallan.receiverNumber}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Zone</label>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase">
                        <Globe size={14} className="text-blue-500" /> {recentChallan.zone}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Delivery Address</label>
                    <p className="text-[13px] font-medium text-slate-600 leading-relaxed flex items-start gap-2 mb-2">
                      <MapPin size={16} className="text-red-400 mt-0.5" /> {recentChallan.address}
                    </p>
                    <div className="flex gap-2 border-t border-slate-200 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded uppercase">
                        <span className="text-blue-400">Thana:</span> {recentChallan.thana}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded uppercase">
                        <span className="text-blue-400">District:</span> {recentChallan.district}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block">Items Information</label>
                  <div className="space-y-2">
                    {recentChallan.products?.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500">{p.productName}</p>
                            <p className="text-[13px] font-bold text-slate-800 uppercase">{p.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-md font-bold text-blue-600">{p.quantity}</span>
                          <button onClick={() => handleEdit(p, i)} className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2 text-xs font-semibold italic">
                    By: {recentChallan.currentUser || "Admin"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <Clock size={12} /> {new Date(recentChallan.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-sm italic">
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {editModalOpen && selectedProduct && (
        <EditRecentChallanModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedProduct(null); }}
          challan={recentChallan}
          product={selectedProduct}
          axiosSecure={axiosSecure}
          refreshChallan={() => queryClient.invalidateQueries({ queryKey: ["recent-challan"] })}
        />
      )}
    </div>
  );
};

export default AddChallan;