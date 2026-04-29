import React, { useState, useEffect, useCallback, useMemo } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import {
  Plus, Trash2, X, Check, ChevronDown, AlertCircle,
  CheckCircle2, Clock, Wallet, FileText, Hammer, Receipt,
} from "lucide-react";

/* ══ Constants ══════════════════════════════════════════════════ */
const MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
                "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const MONTHS_EN = ["January","February","March","April","May","June",
                   "July","August","September","October","November","December"];
const now = new Date();
const CUR_MONTH = now.getMonth() + 1;
const CUR_YEAR  = now.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CUR_YEAR - i);

/* ══ Helpers ════════════════════════════════════════════════════ */
const fmt = n => n != null ? Number(n).toLocaleString("en-BD") : "—";
const pct = (paid, total) => total > 0 ? Math.min(100, Math.round(paid / total * 100)) : 0;

const STATUS = {
  paid:    { label: "Paid Full", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2 },
  partial: { label: "Partial",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: AlertCircle },
  unpaid:  { label: "Unpaid",    color: "#f43f5e", bg: "rgba(244,63,94,0.12)",  border: "rgba(244,63,94,0.25)",  icon: Clock },
};

/* ══ Shared Components ══════════════════════════════════════════ */
function ProgressBar({ paid, total, color }) {
  const p = pct(paid, total);
  return (
    <div className="flex items-center gap-2">
      <div style={{ background: "rgba(148,163,184,0.08)" }} className="flex-1 h-2 rounded-full overflow-hidden">
        <div style={{ width: `${p}%`, background: color, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }}
          className="h-full rounded-full" />
      </div>
      <span style={{ color }} className="text-[10px] font-black w-8 text-right shrink-0">{p}%</span>
    </div>
  );
}

const FieldLabel = ({ children }) => (
  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{children}</p>
);

const DarkInput = ({ type = "text", value, onChange, placeholder, className = "", ...rest }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
    className={`w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition-colors placeholder-slate-700 ${className}`}
    {...rest}
  />
);

/* ══ Add Bill Modal ══════════════════════════════════════════════ */
function AddBillModal({ type, month, year, onClose, onSaved, axiosSecure }) {
  const typeLabel   = type === "main" ? "Main Bill" : "Lebor Bill";
  const accentColor = type === "main" ? "#818cf8" : "#38bdf8";
  const [items,  setItems]  = useState([{ model: "", pics: "", amount: "" }]);
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);

  const totalAmount = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPics   = items.reduce((s, i) => s + (Number(i.pics)   || 0), 0);

  const addRow    = () => setItems(p => [...p, { model: "", pics: "", amount: "" }]);
  const removeRow = i  => setItems(p => p.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setItems(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSave = async () => {
    const validItems = items.filter(i => i.model.trim() && Number(i.amount) > 0);
    if (!validItems.length) {
      return Swal.fire({ toast: true, position: "top-end", icon: "warning",
        title: "কমপক্ষে একটি item দাও", showConfirmButton: false, timer: 1500 });
    }
    setSaving(true);
    try {
      await axiosSecure.post("/walton-bills", { month, year, type, items: validItems, note });
      Swal.fire({ toast: true, position: "top-end", icon: "success",
        title: "Bill issue হয়েছে!", showConfirmButton: false, timer: 1500 });
      onSaved(); onClose();
    } catch { Swal.fire("ত্রুটি", "Save failed", "error"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(2,6,23,0.9)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg,#0f172a,#0a1120)",
          border: "1px solid rgba(148,163,184,0.12)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col">

        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          className="px-4 sm:px-5 py-4 flex items-center gap-3 shrink-0">
          <div style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            {type === "main" ? <FileText size={15} style={{ color: accentColor }} /> : <Hammer size={15} style={{ color: accentColor }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: accentColor }} className="text-[9px] font-black uppercase tracking-widest">নতুন Bill Issue</p>
            <h2 className="text-sm font-black text-slate-100 truncate">{typeLabel} — {MONTHS[month - 1]} {year}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white transition shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Product / Model Items</FieldLabel>
              <button onClick={addRow}
                style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25`, color: accentColor }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-80 transition">
                <Plus size={10} /> Row যোগ করো
              </button>
            </div>

            <div className="space-y-3">
              {items.map((row, i) => (
                <div key={i} style={{ background: "rgba(148,163,184,0.03)", border: "1px solid rgba(148,163,184,0.07)" }}
                  className="rounded-xl p-3 space-y-2">
                  {/* Model input + remove */}
                  <div className="flex items-center gap-2">
                    <input value={row.model} onChange={e => updateRow(i, "model", e.target.value)}
                      placeholder="Model / Item (যেমন: WFR, WAC, NVH)"
                      style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition placeholder-slate-700" />
                    {items.length > 1 && (
                      <button onClick={() => removeRow(i)}
                        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {/* Pics + Amount side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] text-slate-600 font-bold mb-1 pl-0.5">Pics (পিস)</p>
                      <input type="number" value={row.pics} onChange={e => updateRow(i, "pics", e.target.value)}
                        placeholder="0"
                        style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                        className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition text-center placeholder-slate-700" />
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 font-bold mb-1 pl-0.5">Amount (৳)</p>
                      <input type="number" value={row.amount} onChange={e => updateRow(i, "amount", e.target.value)}
                        placeholder="0"
                        style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                        className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition text-right placeholder-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
            className="rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">মোট Bill</p>
              {totalPics > 0 && <p className="text-[10px] text-slate-500">{totalPics.toLocaleString()} pics</p>}
            </div>
            <p style={{ color: accentColor }} className="text-2xl sm:text-3xl font-black">৳{fmt(totalAmount)}</p>
          </div>

          {/* Note */}
          <div>
            <FieldLabel>Note (ঐচ্ছিক)</FieldLabel>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="কোনো বিশেষ তথ্য…"
              style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.12)",
                color: "#e2e8f0", resize: "none" }}
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none focus:border-indigo-400 transition placeholder-slate-700" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)" }}
          className="px-4 sm:px-5 py-3 flex gap-2 shrink-0">
          <button onClick={onClose}
            style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)" }}
            className="flex-1 py-3 text-sm font-bold text-slate-400 rounded-xl hover:text-white transition">
            বাতিল
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ background: `linear-gradient(135deg,${accentColor}cc,${accentColor})`,
              boxShadow: `0 4px 20px ${accentColor}30` }}
            className="flex-[2] py-3 text-sm font-black text-white rounded-xl
              hover:opacity-90 active:scale-95 disabled:opacity-40 transition flex items-center justify-center gap-2">
            <Check size={14} /> {saving ? "Saving…" : "Bill Issue করো"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ Add Payment Modal ═══════════════════════════════════════════ */
function AddPaymentModal({ bill, onClose, onSaved, axiosSecure }) {
  const due    = Math.max(0, bill.totalAmount - bill.totalPaid);
  const accent = bill.type === "main" ? "#818cf8" : "#38bdf8";
  const [amount, setAmount] = useState(due || "");
  const [note,   setNote]   = useState("");
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await axiosSecure.patch(`/walton-bills/${bill._id}/payment`, { amount: Number(amount), note, date });
      Swal.fire({ toast: true, position: "top-end", icon: "success",
        title: "Payment যোগ হয়েছে!", showConfirmButton: false, timer: 1500 });
      onSaved(); onClose();
    } catch { Swal.fire("ত্রুটি", "Failed", "error"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(2,6,23,0.9)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg,#0f172a,#0a1120)",
          border: "1px solid rgba(148,163,184,0.12)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden">

        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          className="px-4 sm:px-5 py-4 flex items-center gap-3">
          <div style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={14} style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-widest">Payment যোগ করো</p>
            <p className="text-sm font-black text-slate-200 truncate">
              {MONTHS_EN[bill.month - 1]} {bill.year}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-5 py-4 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "মোট Bill",    v: bill.totalAmount, c: accent },
              { l: "দেওয়া হয়েছে", v: bill.totalPaid,   c: "#10b981" },
              { l: "বাকি",        v: due,              c: "#f43f5e" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.08)" }}
                className="rounded-xl p-2.5">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-600 mb-1 leading-tight">{l}</p>
                <p style={{ color: c }} className="text-sm font-black leading-tight">৳{fmt(v)}</p>
              </div>
            ))}
          </div>

          <div>
            <FieldLabel>Amount (৳)</FieldLabel>
            <DarkInput type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={`সর্বোচ্চ ৳${fmt(due)}`} className="text-base font-black text-center" />
          </div>

          <div>
            <FieldLabel>তারিখ</FieldLabel>
            <DarkInput type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <FieldLabel>Note</FieldLabel>
            <DarkInput value={note} onChange={e => setNote(e.target.value)} placeholder="যেকোনো তথ্য…" />
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ background: `linear-gradient(135deg,${accent}bb,${accent})`,
              boxShadow: `0 4px 16px ${accent}25` }}
            className="w-full py-3 text-sm font-black text-white rounded-xl
              hover:opacity-90 active:scale-95 disabled:opacity-40 transition flex items-center justify-center gap-2">
            <Check size={14} /> {saving ? "Saving…" : "Payment Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ Bill Card ═══════════════════════════════════════════════════ */
function BillCard({ bill, readOnly, onAddPayment, onDelete, onDeletePayment }) {
  const [open, setOpen] = useState(false);
  const st     = STATUS[bill.status] || STATUS.unpaid;
  const StIcon = st.icon;
  const due    = Math.max(0, bill.totalAmount - bill.totalPaid);
  const accent = bill.type === "main" ? "#818cf8" : "#38bdf8";

  const handleDelete = () => {
    Swal.fire({
      title: "Bill মুছবে?", text: "এই bill ও সব payment চিরতরে মুছে যাবে।",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছো", cancelButtonText: "না",
      background: "#0f172a", color: "#e2e8f0", confirmButtonColor: "#ef4444",
    }).then(r => r.isConfirmed && onDelete(bill._id));
  };

  return (
    <div style={{
      background: "linear-gradient(160deg,rgba(15,23,42,0.95),rgba(10,17,32,0.98))",
      border: `1px solid ${st.border}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
    }} className="rounded-2xl overflow-hidden">

      <div className="px-3 sm:px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            {bill.type === "main"
              ? <FileText size={15} style={{ color: accent }} />
              : <Hammer  size={15} style={{ color: accent }} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span style={{ color: accent, background: `${accent}10`, border: `1px solid ${accent}20` }}
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shrink-0">
                {bill.type === "main" ? "Main Bill" : "Lebor Bill"}
              </span>
              <span style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shrink-0">
                <StIcon size={8} /> {st.label}
              </span>
              {bill.note && (
                <span className="text-[9px] text-slate-500 italic truncate max-w-[100px] sm:max-w-[160px]">
                  "{bill.note}"
                </span>
              )}
            </div>

            {/* Items chips */}
            <div className="flex flex-wrap gap-1.5">
              {bill.items.map((item, i) => (
                <div key={i}
                  style={{ background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.1)" }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-black text-slate-200">{item.model}</span>
                  {item.pics > 0 && (
                    <span className="text-[9px] text-slate-500 hidden sm:inline">
                      {item.pics.toLocaleString()} pics
                    </span>
                  )}
                  <span style={{ color: accent }} className="text-[10px] font-black">
                    ৳{fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <span className="text-slate-500">মোট: <span className="font-black text-slate-100">৳{fmt(bill.totalAmount)}</span></span>
              <span className="text-slate-500">দেওয়া: <span className="font-black text-emerald-400">৳{fmt(bill.totalPaid)}</span></span>
              {due > 0 && <span className="text-slate-500">বাকি: <span className="font-black text-rose-400">৳{fmt(due)}</span></span>}
            </div>

            <ProgressBar paid={bill.totalPaid} total={bill.totalAmount} color={st.color} />
          </div>

          {/* Action buttons */}
          {!readOnly && (
            <div className="flex flex-col gap-1.5 shrink-0">
              {due > 0 && (
                <button onClick={() => onAddPayment(bill)}
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}
                  className="flex items-center justify-center gap-1 w-16 sm:w-auto sm:px-2.5 py-1.5 rounded-xl
                    text-[9px] sm:text-[10px] font-bold
                    hover:bg-emerald-500 hover:text-white hover:border-transparent transition-all">
                  <Wallet size={10} />
                  <span>Pay</span>
                </button>
              )}
              <button onClick={handleDelete}
                className="flex items-center justify-center gap-1 w-16 sm:w-auto sm:px-2 py-1.5 rounded-xl
                  text-[9px] text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                <Trash2 size={10} />
                <span className="sm:inline">মুছো</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment list toggle */}
      {bill.payments.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(148,163,184,0.07)" }}>
          <button onClick={() => setOpen(o => !o)}
            style={{ background: "rgba(8,14,26,0.5)" }}
            className="w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 text-left hover:bg-white/[0.01] transition">
            <ChevronDown size={13} className={`text-slate-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
            <span className="text-[10px] font-bold text-slate-500 flex-1 min-w-0 truncate">
              {bill.payments.length}টি Payment
            </span>
            <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
              className="px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">
              ৳{fmt(bill.totalPaid)}
            </span>
          </button>

          {open && (
            <div style={{ background: "rgba(5,10,20,0.6)" }} className="px-3 sm:px-4 pb-3 pt-1 space-y-1.5">
              {bill.payments.map((p, idx) => (
                <div key={idx}
                  style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-black text-emerald-400">৳{fmt(p.amount)}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(p.date).toLocaleDateString("en-GB")}
                      </span>
                      {p.note && (
                        <span className="text-[9px] text-slate-500 italic truncate max-w-[100px] sm:max-w-[150px]">
                          "{p.note}"
                        </span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <button onClick={() => onDeletePayment(bill._id, idx, p.amount)}
                      className="text-slate-700 hover:text-rose-400 transition p-1 shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══ MAIN PAGE ═══════════════════════════════════════════════════ */
const BillTracker = () => {
  const axiosSecure = useAxiosSecure();
  const { user }    = useAuth();
  const { role }    = useRole();
  const canEdit  = role === "manager";
  const readOnly = !canEdit;

  const [month,     setMonth]     = useState(CUR_MONTH);
  const [year,      setYear]      = useState(CUR_YEAR);
  const [activeTab, setActiveTab] = useState("main");
  const [bills,     setBills]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [addModal,  setAddModal]  = useState(false);
  const [payModal,  setPayModal]  = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/walton-bills?month=${month}&year=${year}`);
      if (res.data.success) setBills(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [month, year, axiosSecure]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filteredBills = useMemo(() => bills.filter(b => b.type === activeTab), [bills, activeTab]);

  const summary = useMemo(() => {
    const b = filteredBills;
    return {
      total:    b.reduce((s, x) => s + x.totalAmount, 0),
      paid:     b.reduce((s, x) => s + x.totalPaid, 0),
      due:      b.reduce((s, x) => s + Math.max(0, x.totalAmount - x.totalPaid), 0),
      fullPaid: b.filter(x => x.status === "paid").length,
      partial:  b.filter(x => x.status === "partial").length,
      unpaid:   b.filter(x => x.status === "unpaid").length,
      count:    b.length,
    };
  }, [filteredBills]);

  const handleDelete = async (id) => {
    try {
      await axiosSecure.delete(`/walton-bills/${id}`);
      setBills(p => p.filter(b => b._id !== id));
      Swal.fire({ toast: true, position: "top-end", icon: "success",
        title: "মুছে গেছে", showConfirmButton: false, timer: 1200 });
    } catch { Swal.fire("ত্রুটি", "Delete failed", "error"); }
  };

  const handleDeletePayment = async (billId, idx, amount) => {
    const r = await Swal.fire({
      title: `৳${fmt(amount)} payment মুছবে?`, icon: "warning",
      showCancelButton: true, confirmButtonText: "হ্যাঁ", cancelButtonText: "না",
      background: "#0f172a", color: "#e2e8f0", confirmButtonColor: "#ef4444",
    });
    if (!r.isConfirmed) return;
    try {
      const res = await axiosSecure.delete(`/walton-bills/${billId}/payment/${idx}`);
      if (res.data.success) setBills(p => p.map(b => b._id === billId ? res.data.data : b));
    } catch { Swal.fire("ত্রুটি", "Delete failed", "error"); }
  };

  const accent = activeTab === "main" ? "#818cf8" : "#38bdf8";
  const TABS = [
    { key: "main",  label: "Main Bill",  icon: FileText, color: "#818cf8" },
    { key: "lebor", label: "Lebor Bill", icon: Hammer,   color: "#38bdf8" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a" }} className="pb-24">

      {/* ══ Sticky Header ══ */}
      <div style={{
        background: "linear-gradient(180deg,rgba(10,17,32,0.99),rgba(8,14,26,0.97))",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        backdropFilter: "blur(16px)",
      }} className="sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-3">

          {/* Title + selectors */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0">
              <Receipt size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-100 leading-tight">
                Walton Bill Tracker
              </h1>
              <p className="text-[9px] text-slate-500 hidden sm:block">Bill issue ও payment অনুসরণ</p>
            </div>
            {/* Selectors */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                className="px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold
                  outline-none focus:border-indigo-400 transition w-[88px] sm:w-auto">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                className="px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold
                  outline-none focus:border-indigo-400 transition w-[62px] sm:w-auto">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Tabs + Add */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {TABS.map(({ key, label, icon: Icon, color }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={activeTab === key
                    ? { background: `${color}15`, border: `1px solid ${color}35`, color }
                    : { background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.08)", color: "#64748b" }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex-1 justify-center">
                  <Icon size={11} className="shrink-0" />
                  <span className="truncate">{label}</span>
                  <span style={activeTab === key
                    ? { background: `${color}20`, color }
                    : { background: "rgba(148,163,184,0.08)", color: "#64748b" }}
                    className="px-1.5 py-0.5 rounded-lg text-[9px] font-black shrink-0">
                    {bills.filter(b => b.type === key).length}
                  </span>
                </button>
              ))}
            </div>
            {!readOnly && (
              <button onClick={() => setAddModal(true)}
                style={{ background: `linear-gradient(135deg,${accent}cc,${accent})`,
                  boxShadow: `0 4px 16px ${accent}30` }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                  text-[10px] sm:text-xs font-black text-white
                  hover:opacity-90 active:scale-95 transition-all shrink-0 whitespace-nowrap">
                <Plus size={12} /> নতুন Bill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 space-y-4">

        {/* Summary */}
        {summary.count > 0 && (
          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.08)" }}
            className="rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "মোট Issue",   val: summary.total, color: accent },
                { label: "দেওয়া হয়েছে", val: summary.paid,  color: "#10b981" },
                { label: "বাকি আছে",   val: summary.due,   color: "#f43f5e" },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1 leading-tight">{label}</p>
                  <p style={{ color }} className="text-base sm:text-xl font-black leading-none">
                    ৳{fmt(val)}
                  </p>
                </div>
              ))}
            </div>
            <ProgressBar paid={summary.paid} total={summary.total}
              color={summary.due === 0 ? "#10b981" : accent} />
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Full Paid", count: summary.fullPaid, color: "#10b981" },
                { label: "Partial",   count: summary.partial,  color: "#f59e0b" },
                { label: "Unpaid",    count: summary.unpaid,   color: "#f43f5e" },
              ].filter(s => s.count > 0).map(({ label, count, color }) => (
                <span key={label} className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold" style={{ color }}>
                  <span style={{ background: color }} className="w-1.5 h-1.5 rounded-full" />
                  {count} {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bill List */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <div style={{ border: "2px solid rgba(99,102,241,0.15)", borderTopColor: accent }}
              className="w-7 h-7 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading…</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
            <div style={{ background: `${accent}08`, border: `1px solid ${accent}18` }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center">
              {activeTab === "main"
                ? <FileText size={22} style={{ color: accent }} />
                : <Hammer  size={22} style={{ color: accent }} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">
                {MONTHS[month - 1]} {year}-তে কোনো {activeTab === "main" ? "Main" : "Lebor"} Bill নেই
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {readOnly ? "Manager bill issue করলে এখানে দেখাবে"
                          : 'নতুন bill issue করতে "নতুন Bill" ক্লিক করো'}
              </p>
            </div>
            {!readOnly && (
              <button onClick={() => setAddModal(true)}
                style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition">
                <Plus size={12} /> প্রথম Bill Issue করো
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBills.map(bill => (
              <BillCard key={bill._id} bill={bill}
                readOnly={readOnly}
                onAddPayment={b => !readOnly && setPayModal(b)}
                onDelete={handleDelete}
                onDeletePayment={handleDeletePayment} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {addModal && !readOnly && (
        <AddBillModal type={activeTab} month={month} year={year}
          onClose={() => setAddModal(false)} onSaved={fetchBills}
          axiosSecure={axiosSecure} user={user} />
      )}
      {payModal && (
        <AddPaymentModal bill={payModal}
          onClose={() => setPayModal(null)} onSaved={fetchBills}
          axiosSecure={axiosSecure} />
      )}
    </div>
  );
};

export default BillTracker;