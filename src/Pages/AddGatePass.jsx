
import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import Swal from "sweetalert2";
import EditRecentGatePassModal from "../Component/EditRecentGatePassModal";
import { FiPlus, FiTrash2, FiEdit2, FiTruck, FiCalendar, FiMapPin, FiPackage, FiSend } from "react-icons/fi";

const AddGatePass = () => {
  const axiosSecure  = useAxiosSecure();
  const { user }     = useAuth();
  const queryClient  = useQueryClient();

  const [autoData,        setAutoData]        = useState({});
  const [activeField,     setActiveField]     = useState(null);
  const [editModalOpen,   setEditModalOpen]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRecent,      setShowRecent]      = useState(false);
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
        setAutoData(prev => ({ ...prev, [fieldKey]: res.data }));
        setActiveField(fieldKey);
      } catch (err) { console.error(err); }
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
        tripYear:  tripDateObj.getFullYear(),
      };
      const res = await axiosSecure.post("/gate-pass", payload);
      if (res.data.insertedId) {
        Swal.fire({ icon: "success", title: "Gate Pass Added ✅", timer: 1500, showConfirmButton: false });
        reset();
        queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
        setShowRecent(true);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: "Gate pass add failed ❌" });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning", title: "Delete Gate Pass?",
      showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Yes, delete",
    });
    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/gate-pass/${id}`);
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
        queryClient.invalidateQueries({ queryKey: ["recent-gate-pass"] });
      } catch { Swal.fire("Error!", "Failed to delete.", "error"); }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const inp   = "w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";
  const inpSm = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 page-enter">

      {/* ── Mobile tab switcher ── */}
      <div className="flex lg:hidden mb-3 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm mx-3 mt-1">
        <button
          onClick={() => setShowRecent(false)}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5
            ${!showRecent ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <FiPlus size={12} /> Add Gate Pass
        </button>
        <button
          onClick={() => setShowRecent(true)}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5
            ${showRecent ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <span className={`w-2 h-2 rounded-full ${recentGatePass ? "bg-emerald-400" : "bg-slate-300"}`} />
          Recently Added
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6">

          {/* ═══ FORM ═══ */}
          <div className={`lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${showRecent ? "hidden lg:block" : "block"}`}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
                <FiPackage size={16} className="text-sky-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800">Add Gate Pass</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter trip and product details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4">

              {/* Row 1: Trip Do, Date, CSD, Unit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Trip Do */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Trip Do</label>
                  <div className="relative">
                    <FiTruck size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register("tripDo", { required: true })} className={inp} placeholder="Trip Do No." />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <div className="relative">
                    <FiCalendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" {...register("tripDate", { required: true })} className={inp} />
                  </div>
                </div>

                {/* CSD */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">CSD</label>
                  <div className="relative">
                    <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("csd", { required: true })}
                      onChange={e => handleAutoSearch("csd", "csd", e.target.value)}
                      className={inp} placeholder="CSD"
                    />
                  </div>
                  <AutoDropdown fieldKey="csd" autoData={autoData} activeField={activeField}
                    setActiveField={setActiveField} setFormValue={v => setValue("csd", v)} />
                </div>

                {/* Unit */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Unit</label>
                  <div className="relative">
                    <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("unit", { required: true })}
                      onChange={e => handleAutoSearch("unit", "unit", e.target.value)}
                      className={inp} placeholder="Unit"
                    />
                  </div>
                  <AutoDropdown fieldKey="unit" autoData={autoData} activeField={activeField}
                    setActiveField={setActiveField} setFormValue={v => setValue("unit", v)} />
                </div>
              </div>

              {/* Row 2: Customer, Vehicle, Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Customer Name", key: "customerName", placeholder: "Customer name" },
                  { label: "Vehicle No",    key: "vehicleNo",    placeholder: "Vehicle number" },
                  { label: "Zone / PO",     key: "zone",         placeholder: "Zone or PO" },
                ].map(({ label, key, placeholder }) => (
                  <div className="relative" key={key}>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <div className="relative">
                      <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register(key, { required: true })}
                        onChange={e => handleAutoSearch(key, key, e.target.value)}
                        className={inp} placeholder={placeholder}
                      />
                    </div>
                    <AutoDropdown fieldKey={key} autoData={autoData} activeField={activeField}
                      setActiveField={setActiveField} setFormValue={v => setValue(key, v)} />
                  </div>
                ))}
              </div>

              {/* Products */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-slate-700">Products</h3>
                  <button
                    type="button"
                    onClick={() => append({ productName: "", model: "", quantity: "" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600
                      bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                  >
                    <FiPlus size={13} /> Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl items-start">
                      {/* Product */}
                      <div className="relative col-span-12 sm:col-span-5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                        <input
                          {...register(`products.${index}.productName`)}
                          onChange={e => handleAutoSearch(`productName-${index}`, "productName", e.target.value)}
                          className={inpSm} placeholder="Product name"
                        />
                        <AutoDropdown fieldKey={`productName-${index}`} autoData={autoData} activeField={activeField}
                          setActiveField={setActiveField} setFormValue={v => setValue(`products.${index}.productName`, v)} />
                      </div>

                      {/* Model */}
                      <div className="relative col-span-8 sm:col-span-5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Model</label>
                        <input
                          {...register(`products.${index}.model`)}
                          onChange={e => handleAutoSearch(`model-${index}`, "model", e.target.value)}
                          className={inpSm} placeholder="Model / SKU"
                        />
                        <AutoDropdown fieldKey={`model-${index}`} autoData={autoData} activeField={activeField}
                          setActiveField={setActiveField} setFormValue={v => setValue(`products.${index}.model`, v)} />
                      </div>

                      {/* Qty */}
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                        <input
                          type="number"
                          {...register(`products.${index}.quantity`, { required: true })}
                          className={`${inpSm} text-center`} placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(fields.length - 1)}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500
                      bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={12} /> Remove Last
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600
                  text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
              >
                <FiSend size={15} /> Submit Gate Pass
              </button>
            </form>
          </div>

          {/* ═══ RECENT GATE PASS ═══ */}
          <div className={`lg:col-span-2 ${showRecent ? "block" : "hidden lg:block"}`}>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm lg:sticky lg:top-6 overflow-hidden">

              {/* Card header */}
              <div className="bg-slate-900 px-5 py-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <FiPackage size={14} className="text-white" />
                    </div>
                    <h3 className="text-white font-black text-sm">Recently Added</h3>
                  </div>
                  {recentGatePass && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="p-5">
                {recentGatePass ? (
                  <div className="space-y-4">
                    {/* Trip DO */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Trip DO</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-mono font-black border border-indigo-100">
                        {recentGatePass.tripDo}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      {[
                        { label: "Customer", value: recentGatePass.customerName, cls: "font-black text-blue-700" },
                        { label: "Unit",     value: recentGatePass.unit },
                        { label: "CSD",      value: recentGatePass.csd },
                        { label: "Date",     value: recentGatePass.tripDate?.slice(0, 10) },
                        { label: "Vehicle",  value: recentGatePass.vehicleNo },
                        { label: "Zone/PO",  value: recentGatePass.zone },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-500 font-bold min-w-[60px]">{label}</span>
                          <span className={`text-right flex-1 ml-3 text-slate-800 font-semibold truncate ${cls || ""}`}>
                            {value || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Products */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Products</p>
                      <div className="space-y-1.5">
                        {recentGatePass.products.map((prod, idx) => (
                          <div key={idx}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 truncate">{prod.productName}</p>
                              <p className="text-[10px] font-semibold text-slate-500">{prod.model}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg">
                                {prod.quantity}
                              </span>
                              <button
                                onClick={() => handleEdit(prod)}
                                className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                              >
                                <FiEdit2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        By: <span className="text-slate-800">{recentGatePass.currentUser}</span>
                      </p>
                      <button
                        onClick={() => handleDelete(recentGatePass._id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-red-200
                          text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase
                          tracking-widest transition-all"
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <FiPackage size={26} />
                    </div>
                    <p className="text-sm font-black text-slate-600">No Data Found</p>
                    <p className="text-xs text-slate-400 mt-1">Add a new entry to see it here</p>
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

