// ════════════════════════════════════════════════════════════════════════
// ProductRates — নতুন unique product / model যোগ করার page
// ────────────────────────────────────────────────────────────────────────
// আগে: নতুন model এলে withModelData.js + withoutModelData.js + server-এর
//      constants/rateTable.js হাতে edit করে redeploy করতে হতো।
// এখন: এই page থেকে row যোগ/edit/delete করলেই AddChallan, Delivered,
//      CreateDelivery, TripDetails — সব জায়গায় সাথে সাথে কাজ করে।
//
// দুই ধরনের entry:
//   • With Model    — Refrigerator/AC/TV/Oven/Washing Machine এর মতো।
//                     Model string **substring** হিসেবে match হয়, অর্থাৎ
//                     challan-এ "WFA-7A1-GDEL" লেখা থাকলে model "7A1"
//                     দিয়ে সেটা ধরা পড়ে।
//   • Without Model — Fan/Bulb/Blender এর মতো। শুধু product name (+ চাইলে
//                     capacity variant) দিয়েই rate বসে।
//
// Built-in tab-এ আগের হার্ডকোড করা table read-only দেখা যায় — নতুন entry
// যোগ করার আগে দেখে নেওয়া যায় জিনিসটা আগে থেকেই আছে কি না।
// ════════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  Package, Plus, Search, Pencil, Trash2, X, Save, Loader2,
  AlertTriangle, CheckCircle2, Database, Sparkles, RotateCcw, Info,
} from "lucide-react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useRole from "../hooks/useRole";
import { RATE_OVERRIDES_KEY } from "../hooks/useRateOverrides";
import {
  describeMatch,
  countModelCollisions,
  getAllProducts,
  getModelOptions,
} from "../utils/rateMatcher";
import { useRateVersion } from "../utils/rateStore";

const LOCATIONS = ["ISD", "OSD-Metro", "OSD-Thana"];

const EMPTY_FORM = {
  _id: null,
  type: "with-model",
  product: "",
  model: "",
  capacity: "",
  rates: { "ISD": "", "OSD-Metro": "", "OSD-Thana": "" },
  note: "",
};

const inp =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 " +
  "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 " +
  "focus:border-orange-400 transition-all";

const label = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

/* ══════════════════════════════════════════════════════════════════════
   Add / Edit form modal
   ══════════════════════════════════════════════════════════════════════ */
const RateEntryModal = ({ open, initial, onClose, onSaved, axiosSecure }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const rateVersion = useRateVersion();

  // initial বদলালে form reset — modal key দিয়ে remount করা হয় (নিচে দেখুন)
  const isEdit = !!form._id;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setRate = (loc, v) => setForm((f) => ({ ...f, rates: { ...f.rates, [loc]: v } }));

  const knownProducts = useMemo(() => getAllProducts(), [rateVersion]);
  const knownModels = useMemo(
    () => getModelOptions(form.product),
    [form.product, rateVersion]
  );

  /* ── live conflict / match preview ──
     Save করার আগে দেখায় এই product+model এখন কোথায় match করছে। এতে
     ভুল করে duplicate বা অন্য product-এর rate override হওয়া ধরা পড়ে। */
  const preview = useMemo(() => {
    if (!form.product.trim()) return null;
    if (form.type === "with-model" && form.model.trim().length < 2) return null;
    return describeMatch({
      productName: form.product.trim(),
      model: form.type === "with-model" ? form.model.trim() : "",
    });
  }, [form.product, form.model, form.type, rateVersion]);

  const collisions = useMemo(() => {
    if (form.type !== "with-model") return 0;
    if (!form.product.trim() || form.model.trim().length < 2) return 0;
    return countModelCollisions({
      productName: form.product.trim(),
      model: form.model.trim(),
    });
  }, [form.product, form.model, form.type, rateVersion]);

  const shortModelWarning =
    form.type === "with-model" &&
    form.model.trim().length > 0 &&
    form.model.trim().length < 3;

  const validate = () => {
    if (form.product.trim().length < 2) return "Product name অন্তত ২ অক্ষরের দিন";
    if (form.type === "with-model" && form.model.trim().length < 2)
      return "Model অন্তত ২ অক্ষরের দিন (substring হিসেবে match হয়)";
    for (const loc of LOCATIONS) {
      const n = Number(form.rates[loc]);
      if (form.rates[loc] === "" || !Number.isFinite(n) || n < 0)
        return `${loc} rate ঠিকভাবে দিন (0 বা তার বেশি)`;
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Swal.fire({ icon: "warning", title: "একটু দেখুন", text: err, confirmButtonColor: "#f97316" });
      return;
    }

    const payload = {
      type: form.type,
      product: form.product.trim(),
      model: form.type === "with-model" ? form.model.trim() : "",
      capacity: form.capacity.trim(),
      rates: LOCATIONS.reduce((acc, l) => ({ ...acc, [l]: Number(form.rates[l]) }), {}),
      note: form.note.trim(),
      active: true,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await axiosSecure.patch(`/rate-entries/${form._id}`, payload);
      } else {
        await axiosSecure.post("/rate-entries", payload);
      }
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: isEdit ? "Entry updated" : "Entry added",
        showConfirmButton: false, timer: 1800,
      });
      onSaved();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || "Save করা যায়নি";
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#f97316" });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl my-6">

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white">
              {isEdit ? <Pencil size={16} /> : <Plus size={18} />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                {isEdit ? "Edit Rate Entry" : "New Product / Model"}
              </h2>
              <p className="text-[11px] text-slate-500">
                Save করার সাথে সাথে সব page-এ কাজ করবে
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* type switch */}
          <div>
            <span className={label}>Entry Type</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "with-model", t: "With Model", d: "Fridge, AC, TV, Oven, Washing Machine" },
                { v: "without-model", t: "Without Model", d: "Fan, Bulb, Blender, Gas Stove…" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => set({ type: o.v })}
                  className={
                    "text-left px-3 py-2.5 rounded-xl border-2 transition-all " +
                    (form.type === o.v
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300")
                  }
                >
                  <span className="block text-[13px] font-bold text-slate-800">{o.t}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{o.d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* product + model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Product Name *</label>
              <input
                className={inp}
                list="pr-product-list"
                value={form.product}
                onChange={(e) => set({ product: e.target.value })}
                placeholder="e.g. Refrigerator"
              />
              <datalist id="pr-product-list">
                {knownProducts.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
              <p className="text-[10px] text-slate-400 mt-1">
                আগের নামটাই লিখলে ওই product-এ নতুন model যোগ হবে
              </p>
            </div>

            {form.type === "with-model" ? (
              <div>
                <label className={label}>Model * <span className="font-normal text-slate-400">(substring)</span></label>
                <input
                  className={inp}
                  list="pr-model-list"
                  value={form.model}
                  onChange={(e) => set({ model: e.target.value })}
                  placeholder="e.g. 7A1"
                />
                <datalist id="pr-model-list">
                  {knownModels.map((m) => <option key={m} value={m} />)}
                </datalist>
                <p className="text-[10px] text-slate-400 mt-1">
                  Challan-এ "WFA-<b>7A1</b>-GDEL" লেখা থাকলেও ধরা পড়বে
                </p>
              </div>
            ) : (
              <div>
                <label className={label}>Capacity Variant <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  className={inp}
                  value={form.capacity}
                  onChange={(e) => set({ capacity: e.target.value })}
                  placeholder="e.g. 19-30 Litre"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  একই product-এ ভিন্ন size থাকলে দিন, নাহলে খালি রাখুন
                </p>
              </div>
            )}
          </div>

          {/* capacity label for with-model */}
          {form.type === "with-model" && (
            <div>
              <label className={label}>Capacity / Group Label</label>
              <input
                className={inp}
                value={form.capacity}
                onChange={(e) => set({ capacity: e.target.value })}
                placeholder="e.g. Gross 151-285 Litre"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Challan / Delivered page-এ Capacity column-এ এটাই বসবে
              </p>
            </div>
          )}

          {/* rates */}
          <div>
            <span className={label}>Rate per Location (৳) *</span>
            <div className="grid grid-cols-3 gap-2">
              {LOCATIONS.map((loc) => (
                <div key={loc}>
                  <span className="block text-[10px] font-bold text-slate-600 mb-1">{loc}</span>
                  <input
                    type="number"
                    min="0"
                    className={inp}
                    value={form.rates[loc]}
                    onChange={(e) => setRate(loc, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* note */}
          <div>
            <label className={label}>Note <span className="font-normal text-slate-400">(optional)</span></label>
            <input
              className={inp}
              value={form.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="কেন যোগ করা হলো — audit log-এ থাকবে"
            />
          </div>

          {/* ── live preview / warnings ── */}
          {shortModelWarning && (
            <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Model খুব ছোট — substring match হওয়ায় এটা অন্য model-এও
                মিলে যেতে পারে। ৩+ অক্ষরের unique অংশ দিন।
              </p>
            </div>
          )}

          {collisions > 0 && (
            <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                এই model string এখন <b>{collisions}</b>টা row-এর সাথে মেলে।
                Save করলে আপনার নতুন row আগে বসবে (override)।
              </p>
            </div>
          )}

          {preview ? (
            <div className="flex gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Info size={15} className="flex-shrink-0 mt-0.5 text-slate-400" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <b>এখন match হচ্ছে:</b>{" "}
                {preview.row.product}
                {preview.row.model ? ` / ${preview.row.model}` : ""}
                {preview.row.capacity ? ` — ${preview.row.capacity}` : ""}{" "}
                <span className={preview.isCustom ? "text-orange-600 font-bold" : "text-slate-400"}>
                  ({preview.isCustom ? "custom" : "built-in"})
                </span>
                <br />
                ISD {preview.row["ISD"]} · Metro {preview.row["OSD-Metro"]} · Thana{" "}
                {preview.row["OSD-Thana"]}
              </div>
            </div>
          ) : (
            form.product.trim().length >= 2 && (
              <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  এখন কোনো row-এ match হচ্ছে না — অর্থাৎ এটা নতুন entry, rate 0 বসছিল।
                </p>
              </div>
            )
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-orange-500/25"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Update" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════ */
const ProductRates = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { role } = useRole();

  const canEdit = role === "admin" || role === "manager";

  const [tab, setTab] = useState("custom");        // custom | builtin
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rate-entries"],
    queryFn: async () => {
      const res = await axiosSecure.get("/rate-entries?includeBaseline=1");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const entries = data?.data || [];
  const baseline = data?.baseline || { withModel: [], withoutModel: [] };

  /** save/delete-এর পর — নিজের list + সব page-এর overlay দুটোই refresh */
  const afterMutate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: RATE_OVERRIDES_KEY });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (!q) return true;
      return [e.product, e.model, e.capacity, e.note]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [entries, typeFilter, search]);

  const baselineRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [
      ...baseline.withModel.map((r) => ({ ...r, type: "with-model" })),
      ...baseline.withoutModel.map((r) => ({ ...r, type: "without-model" })),
    ];
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (!q) return true;
      return [r.product, r.model, r.capacity]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [baseline, typeFilter, search]);

  const openAdd = () => {
    setEditing({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setEditing({
      _id: e._id,
      type: e.type,
      product: e.product || "",
      model: e.model || "",
      capacity: e.capacity || "",
      rates: {
        "ISD": e.rates?.["ISD"] ?? "",
        "OSD-Metro": e.rates?.["OSD-Metro"] ?? "",
        "OSD-Thana": e.rates?.["OSD-Thana"] ?? "",
      },
      note: e.note || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (e) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Entry delete করবেন?",
      html: `<div style="text-align:left;font-size:13px;color:#475569">
               <b>${e.product}</b>${e.model ? ` / ${e.model}` : ""}<br/>
               Delete করলে এই product/model আবার ${e.type === "with-model" ? "built-in" : "built-in"}
               table বা কিছুই না — যেটা আগে ছিল, সেটাতে ফিরে যাবে।
             </div>`,
      input: "text",
      inputPlaceholder: "কারণ (optional)",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;

    try {
      await axiosSecure.delete(`/rate-entries/${e._id}`, {
        data: { reason: res.value || "" },
      });
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: "Deleted", showConfirmButton: false, timer: 1600,
      });
      afterMutate();
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Error",
        text: err?.response?.data?.message || "Delete করা যায়নি",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const TypeBadge = ({ type }) => (
    <span
      className={
        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border " +
        (type === "with-model"
          ? "bg-blue-50 text-blue-600 border-blue-200"
          : "bg-emerald-50 text-emerald-600 border-emerald-200")
      }
    >
      {type === "with-model" ? "model" : "no-model"}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 md:p-8 page-enter">

      {/* ── header ── */}
      <div className="max-w-6xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Product Rates</h1>
          
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={afterMutate}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
            title="Refresh"
          >
            <RotateCcw size={15} />
          </button>
          {canEdit && (
            <button
              onClick={openAdd}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25"
            >
              <Plus size={16} /> Add Product / Model
            </button>
          )}
        </div>
      </div>

      {/* ── tabs + filters ── */}
      <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center gap-2">
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          {[
            { v: "custom", t: "Custom", icon: <Sparkles size={13} />, n: entries.length },
            {
              v: "builtin",
              t: "Built-in",
              icon: <Database size={13} />,
              n: baseline.withModel.length + baseline.withoutModel.length,
            },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setTab(o.v)}
              className={
                "px-3.5 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all " +
                (tab === o.v ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700")
              }
            >
              {o.icon} {o.t}
              <span className={tab === o.v ? "text-slate-300" : "text-slate-400"}>({o.n})</span>
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="all">সব type</option>
          <option value="with-model">With Model</option>
          <option value="without-model">Without Model</option>
        </select>

        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Product / model / capacity খুঁজুন…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
          />
        </div>
      </div>

      {/* ── info strip ── */}
      {tab === "builtin" && (
        <div className="max-w-6xl mx-auto mb-3 flex gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200">
          <Info size={15} className="flex-shrink-0 mt-0.5 text-slate-400" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            এগুলো code-এ থাকা built-in table (read-only)। কোনোটার rate বদলাতে চাইলে
            Custom tab থেকে <b>একই product + model</b> দিয়ে নতুন entry বানান — সেটা
            built-in row-কে override করবে।
          </p>
        </div>
      )}

      {/* ── table ── */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-xs font-semibold">Loading rate entries…</p>
          </div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-2 text-rose-500">
            <AlertTriangle size={26} />
            <p className="text-xs font-semibold">Rate entries load করা যায়নি</p>
            <button onClick={() => refetch()} className="text-[11px] underline">আবার চেষ্টা করুন</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3 text-right">ISD</th>
                  <th className="px-4 py-3 text-right">OSD-Metro</th>
                  <th className="px-4 py-3 text-right">OSD-Thana</th>
                  {tab === "custom" && <th className="px-4 py-3">Added by</th>}
                  {tab === "custom" && canEdit && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tab === "custom" ? (
                  filtered.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 8 : 7} className="px-4 py-14 text-center">
                        <Package size={30} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-500">এখনো কোনো custom entry নেই</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          "Add Product / Model" চেপে প্রথম entry যোগ করুন
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{e.product}</span>
                            <TypeBadge type={e.type} />
                          </div>
                          {e.note && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                              {e.note}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-slate-600">
                          {e.model || "—"}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{e.capacity || "—"}</td>
                        {["ISD", "OSD-Metro", "OSD-Thana"].map((l) => (
                          <td key={l} className="px-4 py-3 text-right font-bold text-slate-700">
                            {e.rates?.[l] ?? 0}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-[10px] text-slate-400">
                          {e.createdBy}
                          <br />
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-GB") : ""}
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )
                ) : baselineRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-400">
                      কিছু পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  baselineRows.slice(0, 400).map((r, i) => (
                    <tr key={`${r.product}-${r.model || r.capacity}-${i}`} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{r.product}</span>
                          <TypeBadge type={r.type} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-slate-500">
                        {r.model || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-slate-500">{r.capacity || "—"}</td>
                      {["ISD", "OSD-Metro", "OSD-Thana"].map((l) => (
                        <td key={l} className="px-4 py-2.5 text-right font-semibold text-slate-600">
                          {r[l]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {tab === "builtin" && baselineRows.length > 400 && (
              <p className="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-100">
                প্রথম ৪০০টা row দেখানো হচ্ছে ({baselineRows.length}টার মধ্যে) — search দিয়ে সরু করুন
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── modal (key দিয়ে remount, তাই form state ঠিকভাবে reset হয়) ── */}
      {modalOpen && (
        <RateEntryModal
          key={editing?._id || "new"}
          open={modalOpen}
          initial={editing}
          axiosSecure={axiosSecure}
          onClose={() => setModalOpen(false)}
          onSaved={afterMutate}
        />
      )}
    </div>
  );
};

export default ProductRates;