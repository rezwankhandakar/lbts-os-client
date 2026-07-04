import React, { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, User, MapPin, Phone, Package, Send, History, Globe, Clock, Building, Navigation } from "lucide-react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import useAutoComplete from "../hooks/useAutoComplete";
import Swal from "sweetalert2";
import EditRecentChallanModal from "../Component/EditRecentChallanModal";
import AIAddressParser from "../Component/AIAddressParser";
import LocalAddressDropdown from "../Component/LocalAddressDropdown";
import LocalProductDropdown from "../Component/LocalProductDropdown";
import { suggestThanas, suggestDistricts, computeLocation } from "../utils/localAddressMatcher";
// Local rate / product lookup — sources are src/utils/withModelData.js
// and src/utils/withoutModelData.js (generated from the two xlsx files).
// We use these to:
//   1. show product-name suggestions as the user types 1-2 letters
//   2. resolve capacity + rate from product + model + location at submit
import { findRate, suggestProducts } from "../utils/rateMatcher";
// PDF / Bijoy / SutonnyMJ (ANSI) থেকে কপি করা টেক্সট paste হলে সেটাকে
// Unicode বাংলায় normalize করার জন্য — দেখুন src/utils/banglaTextConverter.js
import { normalizeBanglaPaste } from "../utils/banglaTextConverter";

const AddChallan = () => {
  const axiosSecure  = useAxiosSecure();
  const { user }     = useAuth();
  const queryClient  = useQueryClient();

  const [editModalOpen,  setEditModalOpen]  = useState(false);
  const [selectedProduct,setSelectedProduct]= useState(null);
  const [showRecent,     setShowRecent]     = useState(false);

  // Product-name local typeahead.  Map of row-index → { query, open }
  // We use this to drive a small dropdown over each Product field that
  // shows suggestions from the master product list (with-model + without-
  // model combined).  The user can ignore the dropdown and free-type
  // anything; rate resolution at submit time is best-effort.
  const [productSuggestState, setProductSuggestState] = useState({});

  // FIX: cache + debounce + abort — একই query দ্বিতীয়বার API call করবে না
  const { autoData, activeField, setActiveField, handleAutoSearch } =
    useAutoComplete(axiosSecure, "challan");

  // ── Local typeahead state for thana / district fields ──
  //   Powered by the built-in 64-districts + all-thanas master list.
  //   Suggestions show from 1-2 letters with fuzzy typo tolerance.
  const [thanaQuery,    setThanaQuery]    = useState("");
  const [districtQuery, setDistrictQuery] = useState("");

  const { register, control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: { products: [{ model: "", productName: "", quantity: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  const { data: recentChallan = null } = useQuery({
    queryKey: ["recent-challan"],
    queryFn: async () => {
      const res = await axiosSecure.get("/challan/recent?limit=1");
      return res.data.data?.[0] || null;
    },
    staleTime: 30 * 1000,
  });



  const onSubmit = async (data) => {
    try {
      // ═══════════════════════════════════════════════════════════════
      //  Location auto-compute
      //  ───────────────────────────────────────────────────────────────
      //  RULE: User field-এ যা typed/picked করেছে, সেটা NEVER overwrite
      //  হবে। শুধু `location` field টা compute হবে user-supplied
      //  thana + district থেকে।
      //
      //  Flow:
      //    1. computeLocation(thana, district) try করো
      //    2. null returns?  → user-confirmation popup (Layer 5)
      //    3. Save with whatever the user explicitly approved
      //
      //  thana/district fields user-typed value-এর সাথে exactly যেমন
      //  database-এ save হবে — কোনো silent rewrite নাই।
      // ═══════════════════════════════════════════════════════════════

      // 1) Try local compute on whatever user typed.
      let autoLocation     = computeLocation(data.thana, data.district);
      let resolutionSource = autoLocation ? "auto" : null;

      // 2) If local couldn't figure it out, ask the user directly —
      //    don't touch thana/district fields.
      if (!autoLocation) {
        const { value: pickedLocation } = await Swal.fire({
          icon: "warning",
          title: "Location Auto-detect হয়নি",
          html: `
            <div style="text-align:left;padding:8px 0;font-size:13px">
              <p style="color:#6b7280;margin-bottom:12px">
                <b>Thana:</b> ${data.thana || "<i>—</i>"}<br/>
                <b>District:</b> ${data.district || "<i>—</i>"}<br/>
                <b>Address:</b> <span style="color:#374151">${data.address || "—"}</span>
              </p>
              <p style="margin-bottom:10px;color:#374151;font-weight:600">
                দয়া করে location category নিজে select করুন:
              </p>
            </div>
          `,
          input: "radio",
          inputOptions: {
            "ISD":       "🔵 ISD — Dhaka inside metro thana",
            "OSD-Metro": "🟣 OSD-Metro — অন্য district এর Sadar/Metro thana",
            "OSD-Thana": "🟡 OSD-Thana — Outside metro / regular thana",
          },
          inputValidator: (v) => !v && "একটা option select করুন",
          showCancelButton: true,
          confirmButtonText: "Confirm & Save",
          cancelButtonText:  "Skip — Save without Location",
          confirmButtonColor: "#f97316",
        });

        if (pickedLocation) {
          autoLocation = pickedLocation;
          resolutionSource = "user_manual";
        } else {
          // User skipped — save with null location.
          autoLocation = null;
          resolutionSource = "skipped";
        }
      }

      // 3) Build payload — thana/district পাঠাচ্ছি EXACTLY যা field-এ আছে।
      //    প্রতি product এর জন্য capacity + rate auto-resolve করি
      //    (with-model / without-model lookup থেকে).  resolve না হলে
      //    capacity="" + rate=0 যাবে, Delivered page থেকে user পরে
      //    capacity select করলে rate calculate হবে.
      const productsWithRate = (data.products || []).map((p) => {
        const { capacity, rate } = findRate({
          productName: p.productName,
          model: p.model,
          location: autoLocation,
        });
        return {
          productName: p.productName,
          model: p.model,
          quantity: p.quantity,
          capacity,
          rate,
        };
      });
      const payload = {
        ...data,                            // includes thana, district as user typed
        products: productsWithRate,         // override with rate-resolved version
        location: autoLocation,
        locationSource: resolutionSource,
        currentUser: user?.displayName,
        createdAt: new Date(),
      };
      const res = await axiosSecure.post("/challan", payload);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Challan Created!",
          showConfirmButton: false,
          timer: 1500,
        });
        reset();
        setThanaQuery("");
        setDistrictQuery("");
        queryClient.invalidateQueries({ queryKey: ["recent-challan"] });
      }
    } catch {
      Swal.fire("Error!", "Failed to add challan", "error");
    }
  };

  const handleEdit = (product, index) => {
    setSelectedProduct({ ...product, productIndex: index });
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?", text: "Delete this challan?", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Yes, delete",
    });
    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/challan/${id}`);
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
        queryClient.invalidateQueries({ queryKey: ["recent-challan"] });
      } catch { console.error("delete failed"); }
    }
  };

  /* ── shared input classes ── */
  const inp   = "w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";
  const inpSm = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  // ── Bangla-aware paste handler ──
  // PDF থেকে কপি করা টেক্সট SutonnyMJ / Bijoy (ANSI) অথবা Unicode
  // যেকোনোটাই হতে পারে। পেস্ট হওয়ার সময় টেক্সট পরীক্ষা করে প্রয়োজনে
  // Unicode-এ কনভার্ট করে তারপরই field-এ বসানো হয় — ফলে ডাটাবেসে
  // সবসময় Unicode বাংলা-ই সংরক্ষিত হয়। (বিস্তারিত: utils/banglaTextConverter.js)
  const handleBanglaPaste = (e, fieldName) => {
    const pasted = e.clipboardData?.getData("text");
    if (!pasted) return; // clipboard খালি — default browser paste-ই চলুক

    const normalized = normalizeBanglaPaste(pasted);
    e.preventDefault();

    const input = e.target;
    const current = getValues(fieldName) ?? "";
    const start = input.selectionStart ?? current.length;
    const end   = input.selectionEnd ?? current.length;
    const newValue = current.slice(0, start) + normalized + current.slice(end);

    setValue(fieldName, newValue, { shouldDirty: true, shouldValidate: true });

    // cursor-কে পেস্ট করা টেক্সটের ঠিক পরে রাখা
    requestAnimationFrame(() => {
      const pos = start + normalized.length;
      input.setSelectionRange?.(pos, pos);
    });
  };

  // ── Local typeahead suggestions (memoised, instant — no network) ──
  // Thana list is filtered by the currently-typed district when one
  // exists, so "kot" in Cumilla gives just Kotwali Model (Cumilla) etc.
  const districtSuggestions = useMemo(
    () => suggestDistricts(districtQuery, 8),
    [districtQuery]
  );
  const thanaSuggestions = useMemo(
    () => suggestThanas(thanaQuery, 10, districtQuery.trim() || null),
    [thanaQuery, districtQuery]
  );

  return (
    <div className="min-h-screen bg-slate-50 page-enter">

      {/* ── Mobile: Recent toggle bar ── */}
      {recentChallan && (
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shadow-sm">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <History size={13} className="text-emerald-500" />
            Recent: <span className="font-black text-slate-800 uppercase">{recentChallan.customerName}</span>
          </span>
          <button
            onClick={() => setShowRecent(v => !v)}
            className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 transition-all hover:bg-emerald-100"
          >
            {showRecent ? "Hide ▲" : "View ▼"}
          </button>
        </div>
      )}

      {/* ── Mobile: Recent panel ── */}
      {showRecent && recentChallan && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-3">
          <RecentCard challan={recentChallan} onDelete={handleDelete} onEdit={handleEdit} compact />
        </div>
      )}

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* ═══ FORM ═══ */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800">Create Delivery Challan</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fill in the delivery details below</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4">

              {/* Row 1: Customer + Phone + Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register("customerName", { required: true })} className={inp} placeholder="Customer name" />
                  </div>
                  {errors.customerName && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Receiver Phone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register("receiverNumber", { required: true })} className={inp} placeholder="017XXXXXXXX" />
                  </div>
                </div>

                <div className="sm:col-span-3 relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Zone
                  </label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("zone", { required: true })}
                      onChange={e => handleAutoSearch("zone", "zone", e.target.value)}
                      className={inp} placeholder="Zone"
                    />
                  </div>
                  <AutoDropdown fieldKey="zone" autoData={autoData} activeField={activeField}
                    setActiveField={setActiveField} setFormValue={v => setValue("zone", v)} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    {...register("address", { required: true })}
                    onPaste={(e) => handleBanglaPaste(e, "address")}
                    className={inp} placeholder="Full delivery address"
                  />
                </div>
                {/* AI Address Parser */}
                <AIAddressParser
                  axiosSecure={axiosSecure}
                  getAddress={() => getValues("address")}
                  setAddress={(v) => setValue("address", v, { shouldDirty: true })}
                  setThana={(v) => {
                    setValue("thana", v, { shouldDirty: true });
                    setThanaQuery(v || "");
                  }}
                  setDistrict={(v) => {
                    setValue("district", v, { shouldDirty: true });
                    setDistrictQuery(v || "");
                  }}
                />
              </div>

              {/* Thana + District (local typeahead — built-in 64 districts / all thanas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Thana</label>
                  <div className="relative">
                    <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("thana")}
                      autoComplete="off"
                      onChange={e => {
                        const v = e.target.value;
                        setValue("thana", v);
                        setThanaQuery(v);
                        if (v.trim().length >= 1) setActiveField("thana-local");
                        else setActiveField(null);
                      }}
                      onFocus={e => {
                        const v = e.target.value;
                        setThanaQuery(v);
                        if (v.trim().length >= 1) setActiveField("thana-local");
                      }}
                      className={inp} placeholder="Type 1-2 letters for suggestions"
                    />
                  </div>
                  <LocalAddressDropdown
                    fieldKey="thana-local"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    suggestions={thanaSuggestions}
                    mode="thana"
                    onPick={(thanaName, item) => {
                      setValue("thana", thanaName, { shouldDirty: true });
                      setThanaQuery(thanaName);
                      // Auto-fill district from the picked thana if the
                      // district field is empty or differs from the thana's
                      // owning district (helpful when the user didn't yet
                      // type a district).
                      const currentDistrict = (getValues("district") || "").trim();
                      if (!currentDistrict || currentDistrict !== item.district) {
                        if (!currentDistrict) {
                          setValue("district", item.district, { shouldDirty: true });
                          setDistrictQuery(item.district);
                        }
                      }
                    }}
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("district")}
                      autoComplete="off"
                      onChange={e => {
                        const v = e.target.value;
                        setValue("district", v);
                        setDistrictQuery(v);
                        if (v.trim().length >= 1) setActiveField("district-local");
                        else setActiveField(null);
                      }}
                      onFocus={e => {
                        const v = e.target.value;
                        setDistrictQuery(v);
                        if (v.trim().length >= 1) setActiveField("district-local");
                      }}
                      className={inp} placeholder="Type 1-2 letters for suggestions"
                    />
                  </div>
                  <LocalAddressDropdown
                    fieldKey="district-local"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    suggestions={districtSuggestions}
                    mode="district"
                    onPick={(districtName) => {
                      setValue("district", districtName, { shouldDirty: true });
                      setDistrictQuery(districtName);
                    }}
                  />
                </div>
              </div>

              {/* Products */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-slate-700">Product Particulars</h3>
                  <button
                    type="button"
                    onClick={() => append({ model: "", productName: "", quantity: "" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600
                      bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {fields.map((item, index) => (
                    <div key={item.id}
                      className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl items-start">
                      {/* Product Name */}
                      <div className="col-span-5 sm:col-span-4 relative">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Product</label>
                        <input
                          {...register(`products.${index}.productName`, { required: true })}
                          autoComplete="off"
                          onChange={e => {
                            const v = e.target.value;
                            setValue(`products.${index}.productName`, v);
                            setProductSuggestState(prev => ({ ...prev, [index]: v }));

                            // ── Local-first typeahead ────────────────
                            // 1. Compute local matches synchronously.
                            // 2. If we have ≥1 local match → show local
                            //    dropdown ONLY.  Skip the server call so
                            //    its delayed setActiveField can't overwrite
                            //    our local activeField (that was the bug
                            //    where suggestions appeared then vanished).
                            // 3. If local has nothing → fall back to the
                            //    server history dropdown.
                            const trimmed = v.trim();
                            if (trimmed.length === 0) {
                              setActiveField(null);
                              return;
                            }
                            const localHits = suggestProducts(trimmed, 8);
                            if (localHits.length > 0) {
                              // Order matters here: handleAutoSearch("") will
                              // call setActiveField(null) immediately, so we
                              // call IT FIRST then setActiveField to the local
                              // key.  React batches the two updates in a
                              // single render — final value wins.
                              handleAutoSearch(`product-${index}`, "productName", "");
                              setActiveField(`product-local-${index}`);
                            } else {
                              // Local miss → close local dropdown and let
                              // the server-side history typeahead handle it.
                              if (activeField === `product-local-${index}`) {
                                setActiveField(null);
                              }
                              handleAutoSearch(`product-${index}`, "productName", v);
                            }
                          }}
                          onFocus={e => {
                            const v = e.target.value.trim();
                            if (v.length === 0) return;
                            setProductSuggestState(prev => ({ ...prev, [index]: v }));
                            const localHits = suggestProducts(v, 8);
                            if (localHits.length > 0) {
                              handleAutoSearch(`product-${index}`, "productName", "");
                              setActiveField(`product-local-${index}`);
                            } else {
                              handleAutoSearch(`product-${index}`, "productName", v);
                            }
                          }}
                          className={inpSm} placeholder="Product name (1-2 letters)"
                        />
                        {/* LOCAL canonical product list (with-model + without-model) — priority */}
                        <LocalProductDropdown
                          fieldKey={`product-local-${index}`}
                          activeField={activeField}
                          setActiveField={setActiveField}
                          suggestions={suggestProducts(productSuggestState[index] || "", 8)}
                          onPick={(name) => {
                            setValue(`products.${index}.productName`, name, { shouldDirty: true });
                            setProductSuggestState(prev => ({ ...prev, [index]: name }));
                          }}
                        />
                        {/* SERVER-side history fallback — only when local had no match */}
                        <AutoDropdown fieldKey={`product-${index}`} autoData={autoData} activeField={activeField}
                          setActiveField={setActiveField} setFormValue={v => setValue(`products.${index}.productName`, v)} />
                      </div>

                      {/* Model */}
                      <div className="col-span-4 sm:col-span-5 relative">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Model</label>
                        <input
                          {...register(`products.${index}.model`, { required: true })}
                          onChange={e => handleAutoSearch(`model-${index}`, "model", e.target.value)}
                          className={inpSm} placeholder="Model / SKU"
                        />
                        <AutoDropdown fieldKey={`model-${index}`} autoData={autoData} activeField={activeField}
                          setActiveField={setActiveField} setFormValue={v => setValue(`products.${index}.model`, v)} />
                      </div>

                      {/* Qty */}
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                        <input
                          type="number"
                          {...register(`products.${index}.quantity`, { required: true })}
                          className={`${inpSm} text-center px-1`} placeholder="0"
                        />
                      </div>

                      {/* Delete */}
                      <div className="col-span-12 sm:col-span-1 flex sm:justify-center sm:pt-5">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors sm:p-1"
                        >
                          <Trash2 size={14} />
                          <span className="sm:hidden font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600
                  text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
              >
                <Send size={15} /> Submit Challan
              </button>
            </form>
          </div>

          {/* ═══ RECENT CHALLAN (desktop) ═══ */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm sticky top-6 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <History size={15} className="text-emerald-500" /> Recent Challan
                </h3>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded uppercase tracking-wider">
                  Latest
                </span>
              </div>

              {recentChallan
                ? <RecentCard challan={recentChallan} onDelete={handleDelete} onEdit={handleEdit} />
                : <div className="py-16 text-center text-slate-400 text-sm">No recent activity found.</div>
              }
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
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

/* ── Recent Challan Card ── */
const RecentCard = ({ challan, onDelete, onEdit, compact = false }) => (
  <div className={compact ? "p-3 space-y-3" : "p-5 space-y-4"}>

    {/* Customer + delete */}
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Customer</p>
        <h4 className={`font-black text-slate-900 uppercase truncate ${compact ? "text-base" : "text-xl"}`}>
          {challan.customerName}
        </h4>
      </div>
      <button
        onClick={() => onDelete(challan._id)}
        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>

    {/* Phone + Zone */}
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Receiver", icon: <Phone size={11} className="text-blue-500" />, value: challan.receiverNumber },
        { label: "Zone",     icon: <Globe size={11}  className="text-blue-500" />, value: challan.zone },
      ].map(({ label, icon, value }) => (
        <div key={label} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase">{icon}{value}</p>
        </div>
      ))}
    </div>

    {/* Address */}
    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5">Delivery Address</p>
      <p className="text-xs font-medium text-slate-600 flex items-start gap-1.5 mb-2">
        <MapPin size={12} className="text-red-400 mt-0.5 flex-shrink-0" /> {challan.address}
      </p>
      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-1.5">
        <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded uppercase">
          Thana: {challan.thana}
        </span>
        <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded uppercase">
          District: {challan.district}
        </span>
      </div>
    </div>

    {/* Products */}
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Items</p>
      <div className="space-y-1.5">
        {challan.products?.map((p, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[9px] flex-shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 truncate">{p.productName}</p>
                <p className="text-xs font-bold text-slate-800 uppercase truncate">{p.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-black text-blue-600">{p.quantity}</span>
              <button
                onClick={() => onEdit(p, i)}
                className="p-1 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all"
              >
                <Edit3 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-100">
      <span className="text-[10px] font-semibold">By: {challan.currentUser || "Admin"}</span>
      <span className="flex items-center gap-1 text-[10px] font-medium">
        <Clock size={10} /> {new Date(challan.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  </div>
);

export default AddChallan;