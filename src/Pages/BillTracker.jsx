import React, { useState, useEffect, useCallback, useMemo } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import {
  Plus, Trash2, X, Check, ChevronDown, AlertCircle,
  CheckCircle2, Clock, Wallet, FileText, Hammer, Receipt, Pencil,
} from "lucide-react";

/* ══ Constants ══════════════════════════════════════════════════ */
const MONTHS    = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const now       = new Date();
const CUR_MONTH = now.getMonth() + 1;
const CUR_YEAR  = now.getFullYear();
const YEARS     = Array.from({ length: 5 }, (_, i) => CUR_YEAR - i);

/* ══ Helpers ════════════════════════════════════════════════════ */
const fmt = n => n != null ? Number(n).toLocaleString("en-BD") : "—";
const pct = (paid, total) => total > 0 ? Math.min(100, Math.round(paid / total * 100)) : 0;

const STATUS = {
  paid:    { label: "Paid Full", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  icon: CheckCircle2 },
  partial: { label: "Partial",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  icon: AlertCircle  },
  unpaid:  { label: "Unpaid",    color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.3)",   icon: Clock        },
};

/* ══ ProgressBar ════════════════════════════════════════════════ */
function ProgressBar({ paid, total, color }) {
  const p = pct(paid, total);
  return (
    <div className="flex items-center gap-2">
      <div style={{ background: "rgba(148,163,184,0.1)" }} className="flex-1 h-1.5 rounded-full overflow-hidden">
        <div style={{ width: `${p}%`, background: color, transition: "width 0.6s ease" }} className="h-full rounded-full" />
      </div>
      <span style={{ color }} className="text-[10px] font-black w-7 text-right shrink-0">{p}%</span>
    </div>
  );
}

const FL = ({ children }) => <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">{children}</p>;

const DarkInput = ({ type = "text", value, onChange, placeholder, className = "", ...rest }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.15)", color: "#e2e8f0" }}
    className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition placeholder-slate-600 ${className}`}
    {...rest} />
);

/* ══ Add/Edit Bill Modal ════════════════════════════════════════ */
function AddBillModal({ type, month, year, editBill, onClose, onSaved, axiosSecure }) {
  const isEdit  = !!editBill;
  const accent  = (editBill?.type || type) === "main" ? "#818cf8" : "#38bdf8";
  const [items,  setItems]  = useState(
    isEdit
      ? editBill.items.map(i => ({ model: i.model, pics: i.pics || "", amount: i.amount }))
      : [{ model: "", pics: "", amount: "" }]
  );
  const [note,   setNote]   = useState(isEdit ? (editBill.note || "") : "");
  const [saving, setSaving] = useState(false);

  const totalAmount = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPics   = items.reduce((s, i) => s + (Number(i.pics)   || 0), 0);
  const addRow      = () => setItems(p => [...p, { model: "", pics: "", amount: "" }]);
  const removeRow   = i  => setItems(p => p.filter((_, idx) => idx !== i));
  const updateRow   = (i, f, v) => setItems(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r));

  const handleSave = async () => {
    const valid = items.filter(i => i.model.trim() && Number(i.amount) > 0);
    if (!valid.length) return Swal.fire({ toast: true, position: "top-end", icon: "warning", title: "কমপক্ষে একটি item দাও", showConfirmButton: false, timer: 1500 });
    setSaving(true);
    try {
      if (isEdit) {
        await axiosSecure.patch(`/walton-bills/${editBill._id}`, { items: valid, note });
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Bill update হয়েছে!", showConfirmButton: false, timer: 1500 });
      } else {
        await axiosSecure.post("/walton-bills", { month, year, type, items: valid, note });
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Bill issue হয়েছে!", showConfirmButton: false, timer: 1500 });
      }
      onSaved(); onClose();
    } catch { Swal.fire("ত্রুটি", "Save failed", "error"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.92)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg,#0f172a,#0a1120)", border: "1px solid rgba(148,163,184,0.12)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)", maxHeight: "90vh" }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }} className="px-5 py-4 flex items-center gap-3 shrink-0">
          <div style={{ background: `${accent}18`, border: `1px solid ${accent}30` }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            {(editBill?.type || type) === "main" ? <FileText size={15} style={{ color: accent }} /> : <Hammer size={15} style={{ color: accent }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-widest">{isEdit ? "Bill Edit করো" : "নতুন Bill Issue"}</p>
            <h2 className="text-sm font-black text-slate-100">{(editBill?.type || type) === "main" ? "Main Bill" : "Lebor Bill"} — {MONTHS[(editBill?.month || month) - 1]} {editBill?.year || year}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition shrink-0"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <FL>Product / Model Items</FL>
              <button onClick={addRow} style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-80 transition">
                <Plus size={10} /> Row যোগ করো
              </button>
            </div>
            <div className="space-y-2.5">
              {items.map((row, i) => (
                <div key={i} style={{ background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.08)" }} className="rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={row.model} onChange={e => updateRow(i, "model", e.target.value)} placeholder="Model / Item (যেমন: WFR, WAC)"
                      style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition placeholder-slate-600" />
                    {items.length > 1 && (
                      <button onClick={() => removeRow(i)} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["pics","Pics (পিস)","0","text-center"],["amount","Amount (৳)","0","text-right"]].map(([f,l,ph,cls]) => (
                      <div key={f}>
                        <p className="text-[8px] text-slate-600 font-bold mb-1 pl-0.5">{l}</p>
                        <input type="number" value={row[f]} onChange={e => updateRow(i, f, e.target.value)} placeholder={ph}
                          style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                          className={`w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition placeholder-slate-600 ${cls}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: `${accent}08`, border: `1px solid ${accent}20` }} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 mb-0.5">মোট Bill</p>
              {totalPics > 0 && <p className="text-[11px] text-slate-400">{totalPics.toLocaleString()} pics</p>}
            </div>
            <p style={{ color: accent }} className="text-2xl font-black">৳{fmt(totalAmount)}</p>
          </div>

          <div>
            <FL>Note (ঐচ্ছিক)</FL>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="কোনো বিশেষ তথ্য…"
              style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0", resize: "none" }}
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none focus:border-indigo-400 transition placeholder-slate-600" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)" }} className="px-5 py-3 flex gap-2.5 shrink-0">
          <button onClick={onClose} style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)" }}
            className="flex-1 py-3 text-sm font-bold text-slate-400 rounded-xl hover:text-white transition">বাতিল</button>
          <button onClick={handleSave} disabled={saving}
            style={{ background: `linear-gradient(135deg,${accent}cc,${accent})`, boxShadow: `0 4px 20px ${accent}30` }}
            className="flex-[2] py-3 text-sm font-black text-white rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2">
            <Check size={14} /> {saving ? "Saving…" : isEdit ? "Bill Update করো" : "Bill Issue করো"}
          </button>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom,0px)" }} className="sm:hidden shrink-0" />
      </div>
    </div>
  );
}

/* ══ Add Payment Modal ══════════════════════════════════════════ */
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
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Payment যোগ হয়েছে!", showConfirmButton: false, timer: 1500 });
      onSaved(); onClose();
    } catch { Swal.fire("ত্রুটি", "Failed", "error"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.92)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg,#0f172a,#0a1120)", border: "1px solid rgba(148,163,184,0.12)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden">

        <div style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }} className="px-5 py-4 flex items-center gap-3">
          <div style={{ background: `${accent}18`, border: `1px solid ${accent}30` }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={14} style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-widest">Payment যোগ করো</p>
            <p className="text-sm font-black text-slate-200">{MONTHS_EN[bill.month - 1]} {bill.year}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition shrink-0"><X size={16} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["মোট Bill", bill.totalAmount, accent],["দেওয়া হয়েছে", bill.totalPaid, "#10b981"],["বাকি", due, "#f43f5e"]].map(([l,v,c]) => (
              <div key={l} style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.12)" }} className="rounded-xl p-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 leading-tight">{l}</p>
                <p style={{ color: c }} className="text-base font-black leading-tight">৳{fmt(v)}</p>
              </div>
            ))}
          </div>
          <div><FL>Amount (৳)</FL><DarkInput type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`সর্বোচ্চ ৳${fmt(due)}`} className="text-base font-black text-center" /></div>
          <div><FL>তারিখ</FL><DarkInput type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><FL>Note</FL><DarkInput value={note} onChange={e => setNote(e.target.value)} placeholder="যেকোনো তথ্য…" /></div>
          <button onClick={handleSave} disabled={saving}
            style={{ background: `linear-gradient(135deg,${accent}bb,${accent})`, boxShadow: `0 4px 16px ${accent}25` }}
            className="w-full py-3 text-sm font-black text-white rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2">
            <Check size={14} /> {saving ? "Saving…" : "Payment Confirm"}
          </button>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom,0px)" }} className="sm:hidden" />
      </div>
    </div>
  );
}

/* ══ Bill Card ══════════════════════════════════════════════════ */
function BillCard({ bill, readOnly, onAddPayment, onEdit, onDelete, onDeletePayment }) {
  const [open, setOpen] = useState(false);
  const st     = STATUS[bill.status] || STATUS.unpaid;
  const StIcon = st.icon;
  const due    = Math.max(0, bill.totalAmount - bill.totalPaid);
  const accent = bill.type === "main" ? "#818cf8" : "#38bdf8";

  const handleDelete = () =>
    Swal.fire({ title: "Bill মুছবে?", text: "এই bill ও সব payment চিরতরে মুছে যাবে।", icon: "warning",
      showCancelButton: true, confirmButtonText: "হ্যাঁ, মুছো", cancelButtonText: "না",
      background: "#0f172a", color: "#e2e8f0", confirmButtonColor: "#ef4444" })
    .then(r => r.isConfirmed && onDelete(bill._id));

  return (
    <div style={{
      background: "linear-gradient(160deg,rgba(15,23,42,0.98),rgba(10,17,32,1))",
      border: `1px solid ${st.border}`,
      boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
    }} className="rounded-2xl overflow-hidden">

      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            {bill.type === "main" ? <FileText size={15} style={{ color: accent }} /> : <Hammer size={15} style={{ color: accent }} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2.5">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span style={{ color: accent, background: `${accent}1f`, border: `1px solid ${accent}40` }}
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0">
                {bill.type === "main" ? "Main Bill" : "Lebor Bill"}
              </span>
              <span style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">
                <StIcon size={9} /> {st.label}
              </span>
              {bill.note && <span className="text-[11px] text-slate-300 italic truncate max-w-[180px] sm:max-w-[260px]">"{bill.note}"</span>}
            </div>

            {/* Item chips */}
            <div className="flex flex-wrap gap-1.5">
              {bill.items.map((item, i) => (
                <div key={i} style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.18)" }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg">
                  <span className="text-[11px] font-black text-slate-100">{item.model}</span>
                  {item.pics > 0 && <span className="text-[10px] text-slate-300 hidden sm:inline">{item.pics.toLocaleString()} pcs</span>}
                  <span style={{ color: accent }} className="text-[11px] font-black">৳{fmt(item.amount)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
              <span className="text-slate-400">মোট: <span className="font-black text-slate-100">৳{fmt(bill.totalAmount)}</span></span>
              <span className="text-slate-400">দেওয়া: <span className="font-black text-emerald-400">৳{fmt(bill.totalPaid)}</span></span>
              {due > 0 && <span className="text-slate-400">বাকি: <span className="font-black text-rose-400">৳{fmt(due)}</span></span>}
            </div>

            <ProgressBar paid={bill.totalPaid} total={bill.totalAmount} color={st.color} />
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex flex-col gap-1.5 shrink-0">
              {due > 0 && (
                <button onClick={() => onAddPayment(bill)}
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold hover:bg-emerald-500 hover:text-white hover:border-transparent transition-all whitespace-nowrap">
                  <Wallet size={10} /> Pay
                </button>
              )}
              <button onClick={() => onEdit(bill)}
                style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8" }}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold hover:bg-indigo-500 hover:text-white hover:border-transparent transition-all whitespace-nowrap">
                <Pencil size={10} /> Edit
              </button>
              <button onClick={handleDelete}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[10px] text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all whitespace-nowrap">
                <Trash2 size={10} /> মুছো
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment toggle */}
      {bill.payments.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(148,163,184,0.07)" }}>
          <button onClick={() => setOpen(o => !o)} style={{ background: "rgba(8,14,26,0.5)" }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/[0.02] transition">
            <ChevronDown size={13} className={`text-slate-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
            <span className="text-[10px] font-bold text-slate-500 flex-1 min-w-0">{bill.payments.length}টি Payment</span>
            <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
              className="px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">৳{fmt(bill.totalPaid)}</span>
          </button>

          {open && (
            <div style={{ background: "rgba(5,10,20,0.6)" }} className="px-4 pb-3 pt-1 space-y-1.5">
              {bill.payments.map((p, idx) => (
                <div key={idx} style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl">
                  <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-black text-emerald-400">৳{fmt(p.amount)}</span>
                    <span className="text-[11px] text-slate-300">{new Date(p.date).toLocaleDateString("en-GB")}</span>
                    {p.note && <span className="text-[11px] text-slate-300 italic truncate max-w-[180px]">"{p.note}"</span>}
                  </div>
                  {!readOnly && (
                    <button onClick={() => onDeletePayment(bill._id, idx, p.amount)}
                      className="text-slate-500 hover:text-rose-400 transition p-1 shrink-0"><X size={12} /></button>
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

/* ══ MAIN PAGE ══════════════════════════════════════════════════ */
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
  const [editModal, setEditModal] = useState(null);
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
      paid:     b.reduce((s, x) => s + x.totalPaid,   0),
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
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "মুছে গেছে", showConfirmButton: false, timer: 1200 });
    } catch { Swal.fire("ত্রুটি", "Delete failed", "error"); }
  };

  const handleDeletePayment = async (billId, idx, amount) => {
    const r = await Swal.fire({ title: `৳${fmt(amount)} payment মুছবে?`, icon: "warning",
      showCancelButton: true, confirmButtonText: "হ্যাঁ", cancelButtonText: "না",
      background: "#0f172a", color: "#e2e8f0", confirmButtonColor: "#ef4444" });
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
    /* ── flex col, h-full — parent layout height নেয়, নিজে scroll করে না ── */
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#060d1a" }}>

      {/* ══ Sticky Header ══ */}
      <div className="flex-shrink-0" style={{
        background: "linear-gradient(180deg,rgba(10,17,32,0.99),rgba(8,14,26,0.97))",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        backdropFilter: "blur(16px)",
      }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 pt-3 pb-2.5 space-y-2.5">

          {/* Title + selectors */}
          <div className="flex items-center gap-2.5">
            <div style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0">
              <Receipt size={14} className="text-white sm:hidden" />
              <Receipt size={18} className="text-white hidden sm:block" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-xl font-black text-slate-100 leading-tight">Walton Bill Tracker</h1>
              <p className="text-[9px] sm:text-xs text-slate-500 hidden sm:block">Bill issue ও payment অনুসরণ</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold outline-none focus:border-indigo-400 transition w-[86px] sm:w-auto">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.12)", color: "#e2e8f0" }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold outline-none focus:border-indigo-400 transition w-[58px] sm:w-auto">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Tabs + Add button */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 sm:gap-2 flex-1 min-w-0 sm:flex-initial sm:max-w-md">
              {TABS.map(({ key, label, icon: Icon, color }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={activeTab === key
                    ? { background: `${color}15`, border: `1px solid ${color}35`, color }
                    : { background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.08)", color: "#64748b" }}
                  className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex-1 justify-center min-w-0">
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
                style={{ background: `linear-gradient(135deg,${accent}cc,${accent})`, boxShadow: `0 4px 12px ${accent}30` }}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black text-white hover:opacity-90 active:scale-[0.97] transition-all shrink-0 whitespace-nowrap">
                <Plus size={12} /> নতুন Bill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ Scrollable Content — শুধু এই অংশ scroll করবে ══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 space-y-3 sm:space-y-4" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>

          {/* Summary */}
          {summary.count > 0 && (
            <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.08)" }} className="rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-6 sm:max-w-2xl sm:mx-auto">
                {[["মোট Issue", summary.total, accent],["দেওয়া হয়েছে", summary.paid, "#10b981"],["বাকি আছে", summary.due, "#f43f5e"]].map(([l,v,c]) => (
                  <div key={l} className="text-center">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 leading-tight">{l}</p>
                    <p style={{ color: c }} className="text-lg sm:text-3xl font-black leading-none">৳{fmt(v)}</p>
                  </div>
                ))}
              </div>
              <ProgressBar paid={summary.paid} total={summary.total} color={summary.due === 0 ? "#10b981" : accent} />
              <div className="flex flex-wrap justify-center gap-3">
                {[["Full Paid", summary.fullPaid, "#10b981"],["Partial", summary.partial, "#f59e0b"],["Unpaid", summary.unpaid, "#f43f5e"]]
                  .filter(([,c]) => c > 0).map(([l,c,col]) => (
                    <span key={l} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: col }}>
                      <span style={{ background: col }} className="w-1.5 h-1.5 rounded-full" />{c} {l}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Bill list */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <div style={{ border: "2px solid rgba(99,102,241,0.15)", borderTopColor: accent }} className="w-7 h-7 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <div style={{ background: `${accent}08`, border: `1px solid ${accent}18` }} className="w-14 h-14 rounded-2xl flex items-center justify-center">
                {activeTab === "main" ? <FileText size={22} style={{ color: accent }} /> : <Hammer size={22} style={{ color: accent }} />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">{MONTHS[month - 1]} {year}-তে কোনো {activeTab === "main" ? "Main" : "Lebor"} Bill নেই</p>
                <p className="text-xs text-slate-600 mt-1">{readOnly ? "Manager bill issue করলে এখানে দেখাবে" : '"নতুন Bill" ক্লিক করে issue করো'}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 items-start">
              {filteredBills.map(bill => (
                <BillCard key={bill._id} bill={bill} readOnly={readOnly}
                  onAddPayment={b => !readOnly && setPayModal(b)}
                  onEdit={b => !readOnly && setEditModal(b)}
                  onDelete={handleDelete} onDeletePayment={handleDeletePayment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addModal && !readOnly && (
        <AddBillModal type={activeTab} month={month} year={year}
          onClose={() => setAddModal(false)} onSaved={fetchBills} axiosSecure={axiosSecure} user={user} />
      )}
      {editModal && !readOnly && (
        <AddBillModal editBill={editModal}
          onClose={() => setEditModal(null)} onSaved={fetchBills} axiosSecure={axiosSecure} user={user} />
      )}
      {payModal && (
        <AddPaymentModal bill={payModal} onClose={() => setPayModal(null)} onSaved={fetchBills} axiosSecure={axiosSecure} />
      )}
    </div>
  );
};

export default BillTracker;