
import React, { useEffect, useState, useCallback, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useRole from "../hooks/useRole";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const fmt  = (n) => n == null ? "—" : "৳ " + Number(n).toLocaleString("en-IN");
const num  = (n) => (n != null ? Number(n) : 0);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, color="text-gray-800", border="border-gray-200", bg="bg-white", pill, onClick }) => (
  <div
    onClick={onClick}
    className={`${bg} border ${border} rounded-xl p-2.5 sm:p-3 shadow-sm transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:brightness-95 active:scale-[0.99]" : ""}`}
  >
    <div className="flex items-start justify-between gap-1 mb-1">
      <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
      {pill && (
        <span className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wide shrink-0 ${pill.color}`}>{pill.text}</span>
      )}
    </div>
    <p className={`text-sm sm:text-base font-bold ${color} leading-tight`}>{value}</p>
    {sub && <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 leading-snug break-words">{sub}</p>}
  </div>
);

/* ── Badge ── */
const Badge = ({ source, type }) => {
  const cfg = {
    auto_advance:   ["text-amber-700",  "bg-amber-50",  "border-amber-200",  "Advance (Auto)"],
    manual_advance: ["text-orange-700", "bg-orange-50", "border-orange-200", "Advance (Manual)"],
    vendor_payment: ["text-indigo-700", "bg-indigo-50", "border-indigo-200", "Vendor Payment"],
    income:         ["text-emerald-700","bg-emerald-50","border-emerald-200","Income"],
    expense:        ["text-red-700",    "bg-red-50",    "border-red-200",    "Expense"],
  };
  const key = source === "auto_advance" ? "auto_advance"
    : source === "vendor_payment" ? "vendor_payment"
    : type === "manual_advance" ? "manual_advance"
    : type;
  const [tc, bg, bc, label] = cfg[key] || ["text-gray-600","bg-gray-50","border-gray-200","Other"];
  return (
    <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tc} ${bg} ${bc} uppercase tracking-wide whitespace-nowrap`}>
      {label}
    </span>
  );
};

/* ── Progress bar ── */
const Bar = ({ value, max, color="bg-emerald-500" }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1">
    <div className={`h-full ${color} rounded-full transition-all`}
      style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} />
  </div>
);

/* ══ PAY VENDOR MODAL ══ */
const PayVendorModal = ({ open, onClose, vendor, summary, onPay }) => {
  const remaining = summary ? Math.max(0, summary.totalBill - summary.totalAdvance - summary.totalPaid) : 0;
  const [amount, setAmount] = useState("");
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !summary) return;
    setAmount(remaining > 0 ? String(remaining) : "");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
  }, [open, remaining]);

  if (!open || !vendor || !summary) return null;

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) {
      Swal.fire({ icon: "warning", title: "Amount দাও", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      return;
    }
    setSaving(true);
    await onPay({ vendorName: vendor, amount: Number(amount), date, note });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-gray-800">Pay Vendor</h3>
          <p className="text-xs text-gray-400 mt-0.5">{vendor}</p>
        </div>
        <div className="p-4 space-y-3.5">
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-500"><span>Total Bill</span><span className="font-semibold text-gray-800">{fmt(summary.totalBill)}</span></div>
            <div className="flex justify-between text-amber-700"><span>Advance (auto)</span><span className="font-semibold">— {fmt(summary.totalAdvance)}</span></div>
            {summary.totalPaid > 0 && <div className="flex justify-between text-indigo-700"><span>Already paid</span><span className="font-semibold">— {fmt(summary.totalPaid)}</span></div>}
            <div className={`flex justify-between font-black pt-1.5 border-t border-gray-200 ${remaining > 0 ? "text-red-600" : "text-emerald-600"}`}>
              <span>Remaining Due</span><span>{remaining > 0 ? fmt(remaining) : "✓ Cleared"}</span>
            </div>
          </div>
          <details className="text-xs text-gray-500 cursor-pointer">
            <summary className="font-semibold text-gray-600 mb-1">{summary.trips} trips included</summary>
            <div className="mt-1 space-y-1 pl-2 max-h-28 overflow-y-auto">
              {summary.tripList.map((t, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-mono text-gray-400">{t.tripNumber}</span>
                  <span className="text-gray-600">{fmt(num(t.rent) + num(t.leborBill))}</span>
                </div>
              ))}
            </div>
          </details>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Amount (৳) *</label>
            <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date *</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Note</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="optional..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-4 pb-5 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handlePay} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-500 transition disabled:opacity-60">
            {saving ? "Saving…" : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ MANUAL TX MODAL ══ */
const ManualTxModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ type: "income", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "", recipientName: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ type: "income", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "", recipientName: "" });
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || !form.date) {
      Swal.fire({ icon: "warning", title: "সব required field fill করো", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      return;
    }
    if (form.type === "manual_advance" && !form.recipientName.trim()) {
      Swal.fire({ icon: "warning", title: "Recipient name দাও", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      return;
    }
    setSaving(true);
    await onSave({ ...form, amount: Number(form.amount) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-gray-800">Add Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 text-lg leading-none">✕</button>
        </div>
        <div className="p-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ["income", "Income", "text-emerald-700 bg-emerald-50 border-emerald-200"],
                ["expense", "Expense", "text-red-700 bg-red-50 border-red-200"],
                ["manual_advance", "Advance", "text-orange-700 bg-orange-50 border-orange-200"],
              ].map(([k, l, c]) => (
                <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
                  className={`py-2 px-1 rounded-lg border text-xs font-semibold transition-all ${form.type === k ? c + " ring-2 ring-offset-1 ring-current" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="e.g. Office rent, Salary..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          {form.type === "manual_advance" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Recipient *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="e.g. Driver Rahim..." value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (৳) *</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date *</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Note (optional)</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 resize-none"
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 px-4 pb-5 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ VENDOR SUMMARY TABLE ══ */
const VendorSummaryTable = ({ vendorMap, onPayVendor }) => {
  const vendors = Object.values(vendorMap).sort((a, b) => b.totalBill - a.totalBill);
  if (!vendors.length) return <p className="text-center text-gray-400 text-sm py-8 italic">No vendor data.</p>;
  return (
    <div>
      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {vendors.map((v, i) => {
          const cleared = v.totalAdvance + v.totalPaid;
          const due = Math.max(0, v.totalBill - cleared);
          return (
            <div key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">{v.vendor}</span>
                <span className="text-xs text-gray-400">{v.trips} trips</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-400 block">Total Bill</span><span className="font-semibold text-gray-800">{fmt(v.totalBill)}</span></div>
                <div><span className="text-gray-400 block">Advance</span><span className="font-medium text-amber-700">{fmt(v.totalAdvance)}</span></div>
                <div><span className="text-gray-400 block">Paid</span><span className="font-medium text-indigo-700">{v.totalPaid > 0 ? fmt(v.totalPaid) : "—"}</span></div>
                <div><span className="text-gray-400 block">Due</span><span className={`font-bold ${due > 0 ? "text-red-600" : "text-emerald-600"}`}>{due > 0 ? fmt(due) : "✓ Cleared"}</span></div>
              </div>
              {v.totalBill > 0 && <Bar value={cleared} max={v.totalBill} color={due > 0 ? "bg-amber-400" : "bg-emerald-500"} />}
              {due > 0 && onPayVendor && (
                <button onClick={() => onPayVendor(v.vendor)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition font-semibold">
                  Pay Vendor
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Desktop table */}
      <table className="hidden sm:table w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white text-left">
            {["Vendor","Trips","Total Bill","Advance","Paid","Due",""].map(h => (
              <th key={h} className="px-3 py-2.5 text-xs font-normal uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => {
            const cleared = v.totalAdvance + v.totalPaid;
            const due = Math.max(0, v.totalBill - cleared);
            return (
              <tr key={i} className="border-b border-gray-100 hover:bg-amber-50/30 even:bg-slate-50/40 transition-colors">
                <td className="px-3 py-2.5 font-semibold text-gray-800">{v.vendor}</td>
                <td className="px-3 py-2.5 text-gray-500 text-center">{v.trips}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-800">{fmt(v.totalBill)}</td>
                <td className="px-3 py-2.5 text-amber-700 font-medium">{fmt(v.totalAdvance)}</td>
                <td className="px-3 py-2.5 text-indigo-700 font-medium">{v.totalPaid > 0 ? fmt(v.totalPaid) : <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5 min-w-[130px]">
                  <span className={`font-bold ${due > 0 ? "text-red-600" : "text-emerald-600"}`}>{due > 0 ? fmt(due) : "✓ Cleared"}</span>
                  {v.totalBill > 0 && <Bar value={cleared} max={v.totalBill} color={due > 0 ? "bg-amber-400" : "bg-emerald-500"} />}
                </td>
                <td className="px-3 py-2.5">
                  {due > 0 && onPayVendor && (
                    <button onClick={() => onPayVendor(v.vendor)} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition font-semibold whitespace-nowrap">Pay</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const AccountsDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { role } = useRole();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const [trips,      setTrips]      = useState([]);
  const [accountTxs, setAccountTxs] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [txLoading,  setTxLoading]  = useState(false);

  const [tab,           setTab]           = useState("overview");
  const [payVendorName, setPayVendorName] = useState(null);
  const [advSearch,     setAdvSearch]     = useState("");
  const [advTypeFilter, setAdvTypeFilter] = useState("all");
  const [manualModal,   setManualModal]   = useState(false);
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [searchTx,      setSearchTx]      = useState("");

  const [auditLogs,    setAuditLogs]    = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotal,   setAuditTotal]   = useState(0);
  const [auditPage,    setAuditPage]    = useState(1);
  const [auditSearch,  setAuditSearch]  = useState("");
  const [restoring,    setRestoring]    = useState(null);

  const [prevMonthBalance, setPrevMonthBalance] = useState(null);
  const [carryForwardTxs,  setCarryForwardTxs]  = useState([]);

  const apiCache = useRef({});
  const fetchWithCache = useCallback(async (url) => {
    if (apiCache.current[url]) return apiCache.current[url];
    const res = await axiosSecure.get(url);
    apiCache.current[url] = res.data;
    return res.data;
  }, [axiosSecure]);

  useEffect(() => { apiCache.current = {}; }, [month, year]);

  const fetchTrips = useCallback(async (m, y) => {
    setLoading(true);
    try { const data = await fetchWithCache(`/car-rents?month=${m}&year=${y}&page=1&limit=5000`); setTrips(data.data || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  }, [fetchWithCache]);

  const fetchAccountTxs = useCallback(async (m, y) => {
    setTxLoading(true);
    try { const data = await fetchWithCache(`/accounts?month=${m}&year=${y}`); setAccountTxs(data.data || []); }
    catch (err) { console.error(err); }
    setTxLoading(false);
  }, [fetchWithCache]);

  const calcNetBalanceChain = useCallback(async (targetM, targetY) => {
    const LOOKBACK = 6;
    const months = [];
    for (let i = LOOKBACK; i >= 0; i--) {
      let m = targetM - i, y = targetY;
      while (m <= 0) { m += 12; y -= 1; }
      months.push({ m, y });
    }
    let runningBalance = 0;
    for (const { m, y } of months) {
      try {
        const [accData, tripData] = await Promise.all([
          fetchWithCache(`/accounts?month=${m}&year=${y}`),
          fetchWithCache(`/car-rents?month=${m}&year=${y}&page=1&limit=5000`),
        ]);
        const txs  = accData.data  || [];
        const trps = tripData.data || [];
        const inc  = txs.filter(t => t.type === "income").reduce((s, t) => s + num(t.amount), 0);
        const exp  = txs.filter(t => t.type === "expense").reduce((s, t) => s + num(t.amount), 0);
        const vadv = txs.filter(t => t.type === "manual_advance").reduce((s, t) => s + num(t.amount), 0);
        const vpay = txs.filter(t => t.type === "vendor_payment").reduce((s, t) => s + num(t.amount), 0);
        const aadv = trps.reduce((s, t) => s + num(t.advance), 0);
        const totalInc = inc + (runningBalance > 0 ? runningBalance : 0);
        const totalExp = exp + vadv + vpay + aadv + (runningBalance < 0 ? Math.abs(runningBalance) : 0);
        runningBalance = totalInc - totalExp;
      } catch { /* no data */ }
    }
    return runningBalance;
  }, [fetchWithCache]);

  useEffect(() => {
    fetchTrips(month, year);
    fetchAccountTxs(month, year);
    const loadPrevData = async () => {
      setPrevMonthBalance(null);
      try {
        const prevM = month === 1 ? 12 : month - 1;
        const prevY = month === 1 ? year - 1 : year;
        const balance = await calcNetBalanceChain(prevM, prevY);
        setPrevMonthBalance(balance);
        const recentMonths = [];
        for (let i = 1; i <= 3; i++) {
          const m2 = month - i <= 0 ? month - i + 12 : month - i;
          const y2 = month - i <= 0 ? year - 1 : year;
          recentMonths.push({ m2, y2 });
        }
        const results = await Promise.all(recentMonths.map(({ m2, y2 }) => fetchWithCache(`/accounts?month=${m2}&year=${y2}`)));
        const unpaid = results.flatMap(r => (r.data || []).filter(t => t.type === "manual_advance" && t.status !== "paid"));
        setCarryForwardTxs(unpaid);
      } catch { setPrevMonthBalance(0); setCarryForwardTxs([]); }
    };
    loadPrevData();
  }, [month, year, fetchTrips, fetchAccountTxs, calcNetBalanceChain]);

  /* ── Vendor Map ── */
  const vendorMap = {};
  trips.forEach(t => {
    const v = t.vendorName || "Unknown";
    if (!vendorMap[v]) vendorMap[v] = { vendor: v, trips: 0, totalBill: 0, totalAdvance: 0, totalPaid: 0, tripList: [] };
    vendorMap[v].trips++;
    vendorMap[v].totalBill    += num(t.rent) + num(t.leborBill);
    vendorMap[v].totalAdvance += num(t.advance);
    vendorMap[v].tripList.push(t);
  });
  accountTxs.filter(t => t.type === "vendor_payment").forEach(t => {
    const v = t.vendorName || "";
    if (!v) return;
    if (vendorMap[v]) vendorMap[v].totalPaid += num(t.amount);
    else vendorMap[v] = { vendor: v, trips: 0, totalBill: 0, totalAdvance: 0, totalPaid: num(t.amount), tripList: [] };
  });

  /* ── Totals ── */
  const totalVendorBill  = Object.values(vendorMap).reduce((s, v) => s + v.totalBill, 0);
  const totalAdvance     = Object.values(vendorMap).reduce((s, v) => s + v.totalAdvance, 0);
  const totalVendorPaid  = accountTxs.filter(t => t.type === "vendor_payment").reduce((s, t) => s + num(t.amount), 0);
  const totalVendorDue   = Object.values(vendorMap).reduce((s, v) => s + Math.max(0, v.totalBill - v.totalAdvance - v.totalPaid), 0);
  const pendingVendors   = Object.values(vendorMap).filter(v => Math.max(0, v.totalBill - v.totalAdvance - v.totalPaid) > 0).length;

  const manualIncome       = accountTxs.filter(t => t.type === "income").reduce((s, t) => s + num(t.amount), 0);
  const manualExpense      = accountTxs.filter(t => t.type === "expense").reduce((s, t) => s + num(t.amount), 0);
  const manualAdvanceTotal = accountTxs.filter(t => t.type === "manual_advance").reduce((s, t) => s + num(t.amount), 0);

  const prevBalancePositive = prevMonthBalance != null && prevMonthBalance > 0 ? prevMonthBalance : 0;
  const prevBalanceNegative = prevMonthBalance != null && prevMonthBalance < 0 ? Math.abs(prevMonthBalance) : 0;

  const totalIncome  = manualIncome + prevBalancePositive;
  const totalExpense = manualExpense + totalVendorPaid + totalAdvance + manualAdvanceTotal + prevBalanceNegative;
  const netBalance   = totalIncome - totalExpense;

  const prevMonthName    = MONTHS[month === 1 ? 11 : month - 2];
  const prevMonthLoading = prevMonthBalance === null;

  /* ── canWrite: শুধু manager সব action করতে পারবে ── */
  const canWrite = role === 'manager';

  /* ── Handlers ── */
  const handlePayVendor = async ({ vendorName, amount, date, note }) => {
    try {
      const res = await axiosSecure.post("/accounts", { type: "vendor_payment", description: `Vendor Payment — ${vendorName}`, amount, date, note, vendorName });
      if (res.data.success) {
        setAccountTxs(prev => [res.data.data, ...prev]);
        Swal.fire({ icon: "success", title: "Payment saved!", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      }
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed" }); }
  };

  const handleAddManualTx = async (tx) => {
    try {
      const res = await axiosSecure.post("/accounts", {
        type: tx.type,
        description: tx.type === "manual_advance" ? `Advance — ${tx.recipientName}` : tx.description,
        amount: tx.amount, date: tx.date, note: tx.note || "",
        recipientName: tx.recipientName || "", vendorName: tx.vendorName || "",
      });
      if (res.data.success) {
        setAccountTxs(prev => [res.data.data, ...prev]);
        Swal.fire({ icon: "success", title: "Transaction added", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      }
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed" }); }
  };

  const fetchAuditLogs = useCallback(async (page = 1, search = "") => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append("performedBy", search);
      const res = await axiosSecure.get(`/audit-logs?${params}`);
      setAuditLogs(res.data.data || []);
      setAuditTotal(res.data.total || 0);
    } catch (err) { console.error(err); }
    setAuditLoading(false);
  }, [axiosSecure]);

  const handleDeleteTx = async (id) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Transaction Delete করবেন?",
      html: `<p style="font-size:13px;color:#6b7280;margin-bottom:12px">এই record টি permanently delete হবে।</p>
        <textarea id="swal-reason" placeholder="কারণ লিখুন (optional)..."
          style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;resize:none;height:72px;outline:none"></textarea>`,
      icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete করুন", cancelButtonText: "Cancel",
      preConfirm: () => document.getElementById("swal-reason")?.value?.trim() || "",
    });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/accounts/${id}`, { data: { reason } });
      setAccountTxs(prev => prev.filter(t => t._id !== id));
      setCarryForwardTxs(prev => prev.filter(t => t._id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      if (tab === "audit") fetchAuditLogs(auditPage, auditSearch);
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed" }); }
  };

  const handleRestore = async (log) => {
    if (log.isRestored) {
      Swal.fire({ icon: "info", title: "ইতোমধ্যে Restore হয়েছে", timer: 2000, showConfirmButton: false }); return;
    }
    const doc = log.deletedDocument;
    if (!doc) return;
    const { isConfirmed } = await Swal.fire({
      title: "Restore করবেন?",
      html: `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;text-align:left;font-size:12px;line-height:1.8">
        <div><span style="color:#9ca3af">Description:</span> <strong>${doc.description || "—"}</strong></div>
        <div><span style="color:#9ca3af">Amount:</span> <strong style="color:#065f46">৳ ${Number(doc.amount || 0).toLocaleString("en-IN")}</strong></div>
        <div><span style="color:#9ca3af">Type:</span> <strong>${doc.type || "—"}</strong></div>
      </div>`,
      icon: "question", showCancelButton: true, confirmButtonColor: "#059669", confirmButtonText: "হ্যাঁ, Restore করুন", cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;
    try {
      const { _id, ...rest } = doc;
      const res = await axiosSecure.post("/accounts", rest);
      if (res.data.success) {
        const newId = res.data.data?._id || res.data.insertedId;
        await axiosSecure.patch(`/audit-logs/${log._id}/restored`, { restoredDocumentId: newId });
        setAuditLogs(prev => prev.map(l => l._id === log._id ? { ...l, isRestored: true, restoredAt: new Date() } : l));
        if (rest.month === month && rest.year === year) setAccountTxs(prev => [res.data.data, ...prev]);
        Swal.fire({ icon: "success", title: "Restored!", timer: 2000, showConfirmButton: false });
      }
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Restore failed" }); }
    setRestoring(null);
  };

  const handleMarkPaid = async (id, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    const { isConfirmed } = await Swal.fire({
      title: newStatus === "paid" ? "Paid হিসেবে Mark করবেন?" : "Unpaid করবেন?",
      icon: "question", showCancelButton: true,
      confirmButtonColor: newStatus === "paid" ? "#059669" : "#f59e0b",
      confirmButtonText: newStatus === "paid" ? "✓ হ্যাঁ, Paid করুন" : "Unpaid করুন", cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;
    try {
      const res = await axiosSecure.patch(`/accounts/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setAccountTxs(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        if (newStatus === "paid") setCarryForwardTxs(prev => prev.filter(t => t._id !== id));
        else setCarryForwardTxs(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        Swal.fire({ icon: "success", title: newStatus === "paid" ? "Paid marked!" : "Unpaid marked!", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      }
    } catch (err) { Swal.fire({ icon: "error", title: err?.response?.data?.message || "Failed" }); }
  };

  /* ── Transactions ── */
  const autoAdvanceTxs = trips.filter(t => t.advance != null && t.advance > 0).map(t => ({
    _id: `adv_${t._id}`, source: "auto_advance",
    description: `Advance — ${t.tripNumber} (${t.vendorName})`,
    amount: num(t.advance), date: t.createdAt?.slice(0, 10) || "",
    note: `Driver: ${t.driverName}`,
  }));

  const allTransactions = [
    ...accountTxs.map(t => ({ ...t, source: t.type === "vendor_payment" ? "vendor_payment" : t.type === "manual_advance" ? "manual_advance" : "manual" })),
    ...autoAdvanceTxs,
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const filteredTxs = allTransactions.filter(t => {
    if (typeFilter === "auto_advance"   && t.source !== "auto_advance")   return false;
    if (typeFilter === "manual_advance" && t.source !== "manual_advance") return false;
    if (typeFilter === "vendor_payment" && t.source !== "vendor_payment") return false;
    if (typeFilter === "income"  && !(t.source === "manual" && t.type === "income"))  return false;
    if (typeFilter === "expense" && !(t.source === "manual" && t.type === "expense")) return false;
    if (typeFilter === "all_expense" && t.source === "manual" && t.type === "income") return false;
    const q = searchTx.toLowerCase();
    if (q && !t.description?.toLowerCase().includes(q) && !t.note?.toLowerCase().includes(q)) return false;
    return true;
  });

  const footerTotal = (() => {
    if (typeFilter === "income") return filteredTxs.reduce((s, t) => s + num(t.amount), 0);
    if (["expense","vendor_payment","manual_advance","auto_advance","all_expense"].includes(typeFilter)) return filteredTxs.reduce((s, t) => s + num(t.amount), 0);
    return null;
  })();

  /* ── Export with confirmation ── */
  const handleExport = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Export করবেন?",
      html: `<p style="font-size:13px;color:#6b7280">
        <strong>${MONTHS[month - 1]} ${year}</strong> এর
        <strong> ${filteredTxs.length} টি</strong> transaction Excel এ export হবে।
      </p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      confirmButtonText: "✓ Export করুন",
      cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;

    const rows = filteredTxs.map(t => ({
      Date: t.date || t.createdAt?.slice(0, 10),
      Type: t.source === "auto_advance" ? "Advance (Auto)" : t.source === "manual_advance" ? "Advance (Manual)" : t.source === "vendor_payment" ? "Vendor Payment" : t.type,
      Description: t.description, Amount: t.amount, Note: t.note || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `Accounts_${MONTHS[month - 1]}_${year}.xlsx`);
  };

  const payingVendorSummary = payVendorName ? vendorMap[payVendorName] : null;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 page-enter">
      {/* Pay vendor modal শুধু manager দেখবে */}
      {canWrite && <PayVendorModal open={!!payVendorName} vendor={payVendorName} summary={payingVendorSummary} onClose={() => setPayVendorName(null)} onPay={handlePayVendor} />}
      {canWrite && <ManualTxModal open={manualModal} onClose={() => setManualModal(false)} onSave={handleAddManualTx} />}

      <div className="max-w-full mx-auto p-2 sm:p-3 lg:p-4">

        {/* ── Header ── */}
        <div className="flex flex-col gap-2 mb-3 sm:mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">Accounts</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                {MONTHS[month - 1]} {year} · {trips.length} trips
                {pendingVendors > 0 && <span className="ml-1.5 text-red-500 font-semibold">· {pendingVendors} pending</span>}
              </p>
            </div>
            {/* Mobile action icons — শুধু manager */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {canWrite && (
                <button onClick={() => setManualModal(true)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs rounded bg-emerald-500 text-white hover:bg-emerald-600 transition font-medium">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add
                </button>
              )}
              <button onClick={handleExport}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded bg-slate-900 text-white hover:bg-gray-700 transition">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                XLS
              </button>
            </div>
          </div>

          {/* Filter + desktop buttons row */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="border border-gray-300 px-2 py-1.5 rounded text-xs sm:text-sm bg-white text-gray-700 focus:outline-none flex-1 min-w-[90px] max-w-[140px]"
              value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" className="border border-gray-300 px-1 py-1.5 rounded text-xs sm:text-sm bg-white text-gray-700 w-16 focus:outline-none"
              value={year} onChange={e => setYear(parseInt(e.target.value))} />
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              {/* Desktop Add button — শুধু manager */}
              {canWrite && (
                <button onClick={() => setManualModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600 transition font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Transaction
                </button>
              )}
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded bg-slate-900 text-white hover:bg-gray-700 transition">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {loading || txLoading ? <LoadingSpinner /> : (<>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
          <StatCard label="Total Deposit" value={prevMonthLoading ? "…" : fmt(totalIncome)}
            sub={prevBalancePositive > 0 ? `Manual: ${fmt(manualIncome)} + ${prevMonthName}: ${fmt(prevBalancePositive)}` : `${accountTxs.filter(t => t.type === "income").length} entries`}
            color="text-emerald-700" border="border-emerald-200" bg="bg-emerald-50"
            onClick={() => { setTab("transactions"); setTypeFilter("income"); }} />
          <StatCard label="Total Expense" value={prevMonthLoading ? "…" : fmt(totalExpense)}
            sub="Manual + Vendor + Advance"
            color="text-red-600" border="border-red-200" bg="bg-red-50"
            onClick={() => { setTab("transactions"); setTypeFilter("all_expense"); }} />
          <StatCard label="Net Balance" value={prevMonthLoading ? "…" : fmt(netBalance)}
            sub={prevMonthBalance != null && prevMonthBalance !== 0 ? `Incl. ${prevMonthName}: ${prevMonthBalance > 0 ? "+" : ""}${fmt(prevMonthBalance)}` : netBalance >= 0 ? "Surplus" : "Deficit"}
            color={netBalance >= 0 ? "text-emerald-700" : "text-red-700"}
            border={netBalance >= 0 ? "border-emerald-200" : "border-red-200"}
            bg={netBalance >= 0 ? "bg-emerald-50" : "bg-red-50"}
            onClick={() => { setTab("transactions"); setTypeFilter("all"); }} />
          <StatCard label="Bill Issued" value={fmt(totalVendorBill)} sub="Rent + Labour"
            color="text-rose-700" border="border-rose-200" bg="bg-rose-50"
            pill={{ text: "Issued", color: "bg-rose-100 text-rose-700" }}
            onClick={() => setTab("vendors")} />
          <StatCard label="Advance" value={fmt(totalAdvance + manualAdvanceTotal)}
            sub={`Auto: ${fmt(totalAdvance)} · Manual: ${fmt(manualAdvanceTotal)}`}
            color="text-amber-700" border="border-amber-200" bg="bg-amber-50"
            pill={{ text: "All", color: "bg-amber-100 text-amber-700" }}
            onClick={() => setTab("advances")} />
          <StatCard label="Vendor Due" value={fmt(totalVendorDue)} sub={`${pendingVendors} vendors pending`}
            color={totalVendorDue > 0 ? "text-red-700" : "text-emerald-700"}
            border={totalVendorDue > 0 ? "border-red-200" : "border-emerald-200"}
            bg={totalVendorDue > 0 ? "bg-red-50" : "bg-emerald-50"}
            pill={totalVendorDue === 0 ? { text: "Cleared", color: "bg-emerald-100 text-emerald-700" } : null}
            onClick={() => setTab("vendors")} />
        </div>

        {/* ── Tabs ── */}
        <div className="mb-3 sm:mb-4 overflow-x-auto pb-0.5">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-max min-w-full sm:min-w-0 sm:w-fit">
            {[
              { id: "overview",     label: "Overview" },
              { id: "vendors",      label: `Vendors${pendingVendors > 0 ? ` (${pendingVendors})` : ""}` },
              { id: "advances",     label: "Advances" },
              { id: "transactions", label: "Transactions" },
              { id: "audit",        label: "🗑 Deleted" },
            ].map(t => (
              <button key={t.id}
                onClick={() => { setTab(t.id); if (t.id === "audit") fetchAuditLogs(1, auditSearch); }}
                className={`px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold rounded transition-all whitespace-nowrap
                  ${tab === t.id ? "bg-slate-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

            {/* Vendor Bill Breakdown */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/40 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-rose-50 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">Vendor Bill Breakdown</h3>
                  <div className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">Liability</div>
                </div>
                <p className="text-[10px] text-slate-400 mb-4 font-medium">Bill issued ≠ paid. <span className="text-rose-400 font-bold">Pay from Vendors tab.</span></p>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: "Bill Issued (Rent + Labour)", value: totalVendorBill,  color: "from-rose-400 to-pink-500",    icon: "🧾" },
                    { label: "Vendor Advance",              value: totalAdvance,      color: "from-amber-400 to-orange-500", icon: "💸" },
                    { label: "Vendor Payments",             value: totalVendorPaid,   color: "from-indigo-400 to-blue-600",  icon: "🏦" },
                    { label: "Total Outstanding Due",       value: totalVendorDue,    color: "from-red-500 to-red-700",      icon: "⚠️" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm opacity-80">{item.icon}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-800 ml-2 shrink-0">{fmt(item.value)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 shadow-inner">
                        <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(100, (item.value / (totalVendorBill || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-slate-50 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Trips",   val: trips.length,                 bg: "bg-slate-50  border-slate-100",  tc: "text-slate-800" },
                    { label: "Vendors", val: Object.keys(vendorMap).length, bg: "bg-amber-50  border-amber-100", tc: "text-amber-700" },
                    { label: "Pending", val: pendingVendors,                bg: "bg-red-50    border-red-100",    tc: "text-red-700" },
                  ].map(s => (
                    <div key={s.label} className={`p-2 rounded-xl border ${s.bg}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-tighter mb-0.5 ${s.tc} opacity-70`}>{s.label}</p>
                      <p className={`text-lg font-black ${s.tc}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cash Flow (Dark) */}
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[70px]" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-[55px]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.15em]">Live Cash Flow</h3>
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {(() => {
                    const maxVal = Math.max(totalIncome, totalExpense, 1);
                    return [
                      ...(prevBalancePositive > 0 ? [{ label: `Opening Bal. (${prevMonthName})`, value: prevBalancePositive, color: "bg-teal-400", sign: "+" }] : []),
                      { label: "Deposit Money",     value: manualIncome,                      color: "bg-emerald-400", sign: "+" },
                      ...(prevBalanceNegative > 0 ? [{ label: "Prev Month Deficit",            value: prevBalanceNegative, color: "bg-rose-500", sign: "−" }] : []),
                      { label: "Operational Exp.",  value: manualExpense,                     color: "bg-rose-400",    sign: "−" },
                      { label: "Vendor Payout",     value: totalVendorPaid,                   color: "bg-indigo-400", sign: "−" },
                      { label: "Total Advance",     value: manualAdvanceTotal + totalAdvance,  color: "bg-amber-400",  sign: "−" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className={`text-[10px] font-black ml-2 shrink-0 ${item.sign === "+" ? "text-emerald-400" : "text-rose-400"}`}>
                            {item.sign} {fmt(item.value)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.min(100, (item.value / maxVal) * 100)}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                <div className={`mt-5 rounded-xl p-3.5 sm:p-4 transition-all duration-500 ${netBalance >= 0 ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/20" : "bg-gradient-to-br from-rose-500/20 to-red-500/5 border border-rose-500/20"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Disposable Balance</p>
                      <h2 className={`text-2xl font-black tracking-tighter ${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {netBalance >= 0 ? "+" : ""}{prevMonthLoading ? "…" : fmt(netBalance)}
                      </h2>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {netBalance >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending vendors quick view */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-3 sm:p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">Pending Vendors — Quick View</h3>
                <button onClick={() => setTab("vendors")} className="text-xs text-indigo-600 hover:underline font-semibold shrink-0">View All →</button>
              </div>
              {pendingVendors === 0 ? (
                <div className="text-center py-6 text-emerald-600 font-semibold text-sm">✓ All vendors cleared!</div>
              ) : (
                <div className="space-y-2">
                  {Object.values(vendorMap)
                    .filter(v => Math.max(0, v.totalBill - v.totalAdvance - v.totalPaid) > 0)
                    .sort((a, b) => (b.totalBill - b.totalAdvance - b.totalPaid) - (a.totalBill - a.totalAdvance - a.totalPaid))
                    .slice(0, 6)
                    .map((v, i) => {
                      const due = v.totalBill - v.totalAdvance - v.totalPaid;
                      return (
                        <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-b-0">
                          <span className="text-sm text-gray-700 flex-1 font-medium truncate min-w-0">{v.vendor}</span>
                          <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{v.trips} trips</span>
                          <span className="font-bold text-red-600 text-sm shrink-0">{fmt(due)}</span>
                          {/* শুধু manager Pay button দেখবে */}
                          {canWrite && (
                            <button onClick={() => setPayVendorName(v.vendor)}
                              className="px-2 sm:px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition font-semibold shrink-0">
                              Pay
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ VENDORS ══ */}
        {tab === "vendors" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-800 truncate">Vendor Summary — {MONTHS[month - 1]} {year}</h3>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{trips.length} trips · {Object.keys(vendorMap).length} vendors</span>
            </div>
            {/* canWrite null পাঠালে Pay button লুকিয়ে যাবে */}
            <VendorSummaryTable vendorMap={vendorMap} onPayVendor={canWrite ? setPayVendorName : null} />
          </div>
        )}

        {/* ══ ADVANCES ══ */}
        {tab === "advances" && (() => {
          const manualAdvances = accountTxs.filter(t => t.type === "manual_advance");
          const tripAdvances   = trips.filter(t => t.advance != null && t.advance > 0);
          const unpaidCurrent  = manualAdvances.filter(a => a.status !== "paid");
          const paidCurrent    = manualAdvances.filter(a => a.status === "paid");
          const unpaidTotal    = unpaidCurrent.reduce((s, a) => s + num(a.amount), 0);
          const currentIds     = new Set(manualAdvances.map(a => String(a._id)));
          const uniqueCarried  = carryForwardTxs.filter(a => !currentIds.has(String(a._id)));

          const filteredManual = manualAdvances.filter(a =>
            (advTypeFilter === "all" || advTypeFilter === "manual") &&
            (!advSearch || (a.recipientName || "").toLowerCase().includes(advSearch.toLowerCase()) || (a.note || "").toLowerCase().includes(advSearch.toLowerCase()))
          );
          const filteredTrip = tripAdvances.filter(t =>
            (advTypeFilter === "all" || advTypeFilter === "auto") &&
            (!advSearch || (t.vendorName || "").toLowerCase().includes(advSearch.toLowerCase()) || (t.tripNumber || "").toLowerCase().includes(advSearch.toLowerCase()) || (t.driverName || "").toLowerCase().includes(advSearch.toLowerCase()))
          );
          const filteredCarried = uniqueCarried.filter(a =>
            (advTypeFilter === "all" || advTypeFilter === "carry") &&
            (!advSearch || (a.recipientName || "").toLowerCase().includes(advSearch.toLowerCase()) || (a.note || "").toLowerCase().includes(advSearch.toLowerCase()))
          );

          const allRows = [
            ...filteredManual.map(a => ({ date: a.date, name: a.recipientName || a.description?.replace("Advance — ", "") || "—", type: "manual", note: a.note || "", amount: num(a.amount), status: a.status || "unpaid", _id: a._id })),
            ...filteredTrip.map(t => ({ date: t.createdAt?.slice(0, 10) || "", name: t.vendorName, type: "auto", note: `${t.tripNumber} · ${t.driverName}`, amount: num(t.advance), status: "auto", _id: null })),
            ...filteredCarried.map(a => ({ date: a.date, name: a.recipientName || a.description?.replace("Advance — ", "") || "—", type: "carry", note: a.note ? `[Carried] ${a.note}` : "[Carried from prev month]", amount: num(a.amount), status: "unpaid", _id: a._id })),
          ].sort((a, b) => new Date(b.date) - new Date(a.date));

          return (
            <div className="space-y-3">
              {uniqueCarried.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div>
                    <p className="font-semibold text-orange-800 text-xs">{uniqueCarried.length} unpaid advance{uniqueCarried.length > 1 ? "s" : ""} carried — {fmt(uniqueCarried.reduce((s, a) => s + num(a.amount), 0))}</p>
                    <p className="text-[10px] text-orange-600 mt-0.5">আগের month এ expense হিসেবে count হয়েছে — এই month এ শুধু reminder</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Auto (Trips)", val: fmt(totalAdvance), sub: `${tripAdvances.length} trips`, bg: "bg-amber-50 border-amber-200", tc: "text-amber-700" },
                  { label: "Manual", val: fmt(manualAdvanceTotal), sub: `${paidCurrent.length} paid · ${unpaidCurrent.length} unpaid`, bg: "bg-orange-50 border-orange-200", tc: "text-orange-700" },
                  { label: "Unpaid (this month)", val: fmt(unpaidTotal), sub: "will carry forward", bg: "bg-red-50 border-red-200", tc: "text-red-700" },
                  uniqueCarried.length > 0
                    ? { label: "Carried Forward", val: fmt(uniqueCarried.reduce((s, a) => s + num(a.amount), 0)), sub: `${uniqueCarried.length} from prev months`, bg: "bg-orange-100 border-orange-300", tc: "text-orange-800" }
                    : { label: "Total", val: fmt(totalAdvance + manualAdvanceTotal), sub: "Auto + Manual", bg: "bg-gray-800 border-gray-700", tc: "text-white" },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border rounded-xl p-2.5 shadow-sm`}>
                    <p className={`text-[9px] sm:text-[10px] uppercase tracking-widest mb-0.5 ${s.tc} opacity-80`}>{s.label}</p>
                    <p className={`text-base sm:text-lg font-bold ${s.tc}`}>{s.val}</p>
                    <p className={`text-[9px] sm:text-[10px] ${s.tc} opacity-60`}>{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-3 sm:px-5 py-3 border-b border-gray-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">Advance History</h3>
                    <span className="text-xs text-gray-400">{allRows.length} entries</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-400 flex-1 min-w-[100px] bg-white"
                      placeholder="Search name / trip…" value={advSearch} onChange={e => setAdvSearch(e.target.value)} />
                    <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white text-gray-600"
                      value={advTypeFilter} onChange={e => setAdvTypeFilter(e.target.value)}>
                      <option value="all">All Types</option>
                      <option value="manual">Manual</option>
                      <option value="auto">Auto (Trips)</option>
                      <option value="carry">Carried Forward</option>
                    </select>
                  </div>
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
                  {allRows.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic text-sm">No advance records.</div>
                  ) : allRows.map((r, i) => (
                    <div key={i} className={`p-3 space-y-1.5 ${r.status === "paid" ? "opacity-50 bg-gray-50/40" : r.type === "carry" ? "bg-orange-50/50" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${r.type === "auto" ? "text-amber-700 bg-amber-50 border-amber-200" : r.type === "carry" ? "text-orange-800 bg-orange-100 border-orange-300" : "text-orange-700 bg-orange-50 border-orange-200"}`}>
                          {r.type === "auto" ? "Auto" : r.type === "carry" ? "Carried" : "Manual"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{r.date}</span>
                        <span className="font-bold text-amber-700">{fmt(r.amount)}</span>
                      </div>
                      {r.note && <p className="text-[10px] text-gray-400 truncate">{r.note}</p>}
                      {/* Mark Paid — শুধু manager */}
                      {r.type !== "auto" && r._id && canWrite && (
                        <button onClick={() => handleMarkPaid(r._id, r.status)}
                          className={`w-full py-1.5 text-[10px] font-semibold rounded border transition-all ${r.status === "paid" ? "text-emerald-700 bg-emerald-50 border-emerald-300" : "text-gray-600 bg-white border-gray-300"}`}>
                          {r.status === "paid" ? "✓ Paid" : "Mark Paid"}
                        </button>
                      )}
                      {/* Read-only status badge for non-manager */}
                      {r.type !== "auto" && r._id && !canWrite && (
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded border ${r.status === "paid" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-gray-400 border-gray-200 bg-gray-50"}`}>
                          {r.status === "paid" ? "✓ Paid" : "Unpaid"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
                  {allRows.length === 0 ? <div className="text-center py-12 text-gray-400 italic text-sm">No advance records.</div> : (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                          {["Date","Name","Note","Type","Amount","Status"].map(h => (
                            <th key={h} className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allRows.map((r, i) => (
                          <tr key={i} className={`border-b border-gray-50 transition-colors ${r.status === "paid" ? "opacity-50 bg-gray-50/40" : r.type === "carry" ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-amber-50/40"}`}>
                            <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>
                            <td className="px-4 py-2 font-semibold text-gray-800">{r.name}</td>
                            <td className="px-4 py-2 text-xs text-gray-400 max-w-[180px]"><span className="truncate block">{r.note || "—"}</span></td>
                            <td className="px-4 py-2">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${r.type === "auto" ? "text-amber-700 bg-amber-50 border-amber-200" : r.type === "carry" ? "text-orange-800 bg-orange-100 border-orange-300" : "text-orange-700 bg-orange-50 border-orange-200"}`}>
                                {r.type === "auto" ? "Auto" : r.type === "carry" ? "Carried" : "Manual"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-amber-700 whitespace-nowrap">{fmt(r.amount)}</td>
                            <td className="px-4 py-2 text-center">
                              {r.type === "auto" ? (
                                <span className="text-xs text-gray-300">—</span>
                              ) : canWrite ? (
                                <button onClick={() => handleMarkPaid(r._id, r.status)}
                                  className={`px-2 py-1 text-[10px] font-semibold rounded border transition-all whitespace-nowrap ${r.status === "paid" ? "text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100" : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"}`}>
                                  {r.status === "paid" ? "✓ Paid" : "Mark Paid"}
                                </button>
                              ) : (
                                <span className={`text-[10px] px-2 py-1 rounded border ${r.status === "paid" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-gray-400 border-gray-200"}`}>
                                  {r.status === "paid" ? "✓ Paid" : "Unpaid"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Total</td>
                          <td className="px-4 py-2 text-right font-black text-gray-800">{fmt(allRows.reduce((s, r) => s + r.amount, 0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ TRANSACTIONS ══ */}
        {tab === "transactions" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 sm:px-5 py-3 border-b border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">All Transactions</h3>
                <span className="text-xs text-gray-400">{filteredTxs.length} entries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-400 flex-1 min-w-[100px]"
                  placeholder="Search…" value={searchTx} onChange={e => setSearchTx(e.target.value)} />
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white"
                  value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="all_expense">All Expenses</option>
                  <option value="expense">Expense (Manual)</option>
                  <option value="vendor_payment">Vendor Payment</option>
                  <option value="manual_advance">Advance (Manual)</option>
                  <option value="auto_advance">Advance (Auto)</option>
                </select>
              </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-50 max-h-[65vh] overflow-y-auto">
              {filteredTxs.length === 0 ? <div className="text-center py-12 text-gray-400 italic text-sm">No transactions found.</div>
                : filteredTxs.map((t, i) => (
                <div key={t._id || i} className="p-3 space-y-1.5 hover:bg-amber-50/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <Badge source={t.source} type={t.type} />
                    <span className="font-bold text-gray-800 text-sm">{fmt(t.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700 truncate flex-1">{t.description}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{t.date || t.createdAt?.slice(0, 10)}</span>
                  </div>
                  {t.note && <p className="text-[10px] text-gray-400 truncate">{t.note}</p>}
                  {/* Delete — শুধু manager */}
                  {canWrite && t.source !== "auto_advance" && t._id && !String(t._id).startsWith("adv_") && (
                    <button onClick={() => handleDeleteTx(t._id)} className="text-gray-300 hover:text-red-500 transition text-xs">✕ Delete</button>
                  )}
                </div>
              ))}
              {footerTotal !== null && (
                <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total ({filteredTxs.length})</span>
                  <span className="text-sm font-black text-gray-800">{fmt(footerTotal)}</span>
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
              {filteredTxs.length === 0 ? <div className="text-center py-16 text-gray-400 italic text-sm">No transactions found.</div> : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      {["Date","Type","Description","Note","Amount",""].map(h => (
                        <th key={h} className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.map((t, i) => (
                      <tr key={t._id || i} className="border-b border-gray-50 hover:bg-amber-50 transition-colors">
                        <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{t.date || t.createdAt?.slice(0, 10)}</td>
                        <td className="px-4 py-2"><Badge source={t.source} type={t.type} /></td>
                        <td className="px-4 py-2 text-sm text-gray-700 max-w-[200px]"><span className="truncate block">{t.description}</span></td>
                        <td className="px-4 py-2 text-xs text-gray-400 max-w-[140px]"><span className="truncate block">{t.note || "—"}</span></td>
                        <td className="px-4 py-2 text-right font-bold text-gray-800 whitespace-nowrap">{fmt(t.amount)}</td>
                        <td className="px-4 py-2 text-center">
                          {/* Delete — শুধু manager */}
                          {canWrite && t.source !== "auto_advance" && t._id && !String(t._id).startsWith("adv_") && (
                            <button onClick={() => handleDeleteTx(t._id)} className="text-gray-300 hover:text-red-500 transition text-sm">✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {footerTotal !== null && (
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td colSpan={4} className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">Total ({filteredTxs.length})</td>
                        <td className="px-4 py-2 text-right text-sm font-black text-gray-800">{fmt(footerTotal)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ AUDIT LOG ══ */}
        {tab === "audit" && (() => {
          const AUDIT_LABELS = {
            income:         ["Income",          "text-emerald-700 bg-emerald-50 border-emerald-200"],
            expense:        ["Expense",          "text-red-700 bg-red-50 border-red-200"],
            manual_advance: ["Advance (Manual)", "text-orange-700 bg-orange-50 border-orange-200"],
            vendor_payment: ["Vendor Payment",   "text-indigo-700 bg-indigo-50 border-indigo-200"],
          };
          const totalPages = Math.ceil(auditTotal / 20);
          return (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 sm:px-5 py-3 flex flex-col gap-2">
                <div>
                  <h3 className="text-sm font-bold text-red-800">🗑 Delete Audit Log</h3>
                  <p className="text-xs text-red-500 mt-0.5">সকল deleted transaction এর record। Restore করা যাবে।</p>
                </div>
                <div className="flex items-center gap-2">
                  <input className="border border-red-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400 flex-1 bg-white"
                    placeholder="Email দিয়ে filter…" value={auditSearch}
                    onChange={e => { setAuditSearch(e.target.value); setAuditPage(1); fetchAuditLogs(1, e.target.value); }} />
                  <button onClick={() => fetchAuditLogs(auditPage, auditSearch)}
                    className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-600 transition font-semibold shrink-0">
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {auditLoading ? (
                  <div className="py-16 text-center text-gray-400 text-sm animate-pulse">লোড হচ্ছে…</div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 italic text-sm">কোনো delete history নেই।</div>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="sm:hidden divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
                      {auditLogs.map((log, i) => {
                        const doc = log.deletedDocument || {};
                        const [typeLabel, typeCls] = AUDIT_LABELS[doc.type] || ["Unknown", "text-gray-500 bg-gray-50 border-gray-200"];
                        const deletedAt = log.performedAt ? new Date(log.performedAt) : null;
                        return (
                          <div key={log._id || i} className="p-3 space-y-1.5 hover:bg-red-50/20 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${typeCls}`}>{typeLabel}</span>
                              <span className="font-bold text-gray-800 text-sm">{fmt(doc.amount)}</span>
                            </div>
                            <div className="text-xs text-gray-700 truncate">{doc.description || "—"}</div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span>{log.performedBy?.email || "—"}</span>
                              <span>{deletedAt ? deletedAt.toLocaleDateString("en-BD") : "—"}</span>
                            </div>
                            {log.reason && <p className="text-[10px] text-gray-500 italic">"{log.reason}"</p>}
                            <div>
                              {log.isRestored ? (
                                <span className="text-[10px] font-semibold text-gray-400">✓ Restored</span>
                              ) : canWrite ? (
                                <button disabled={restoring === log._id} onClick={() => handleRestore(log)}
                                  className="px-3 py-1.5 text-[10px] font-semibold rounded border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition disabled:opacity-50">
                                  {restoring === log._id ? "…" : "↩ Restore"}
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-300">—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
                      <table className="w-full text-sm border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-900 text-white sticky top-0 z-10">
                            {["সময়","কে Delete করেছে","Type","Description","Amount","কারণ",""].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs font-normal uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map((log, i) => {
                            const doc = log.deletedDocument || {};
                            const [typeLabel, typeCls] = AUDIT_LABELS[doc.type] || ["Unknown", "text-gray-500 bg-gray-50 border-gray-200"];
                            const deletedAt = log.performedAt ? new Date(log.performedAt) : null;
                            return (
                              <tr key={log._id || i} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                                <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                                  <div className="font-medium text-gray-700">{deletedAt ? deletedAt.toLocaleDateString("en-BD") : "—"}</div>
                                  <div className="text-gray-400 text-[10px]">{deletedAt ? deletedAt.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="text-xs font-semibold text-gray-800">{log.performedBy?.email || "—"}</div>
                                  <div className="text-[10px] text-gray-400 uppercase">{log.performedBy?.role || ""}</div>
                                </td>
                                <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${typeCls}`}>{typeLabel}</span></td>
                                <td className="px-4 py-2.5 text-sm text-gray-700 max-w-[180px]">
                                  <span className="block truncate">{doc.description || "—"}</span>
                                  {doc.vendorName && <span className="text-xs text-gray-400 block">Vendor: {doc.vendorName}</span>}
                                  {doc.recipientName && <span className="text-xs text-gray-400 block">To: {doc.recipientName}</span>}
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">
                                  {fmt(doc.amount)}<div className="text-[10px] text-gray-400 font-normal">{doc.date}</div>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[140px]">
                                  {log.reason ? <span className="italic">"{log.reason}"</span> : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {log.isRestored ? (
                                    <span className="px-2 py-1 text-[10px] font-semibold rounded border border-gray-200 text-gray-400 bg-gray-50 whitespace-nowrap">✓ Restored</span>
                                  ) : canWrite ? (
                                    <button disabled={restoring === log._id} onClick={() => handleRestore(log)}
                                      className="px-2.5 py-1 text-[10px] font-semibold rounded border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap disabled:opacity-50">
                                      {restoring === log._id ? "…" : "↩ Restore"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-300">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-t border-gray-100 flex-wrap gap-2">
                        <span className="text-xs text-gray-400">মোট {auditTotal} টি · Page {auditPage}/{totalPages}</span>
                        <div className="flex gap-2">
                          <button disabled={auditPage <= 1} onClick={() => { const p = auditPage - 1; setAuditPage(p); fetchAuditLogs(p, auditSearch); }}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">← Prev</button>
                          <button disabled={auditPage >= totalPages} onClick={() => { const p = auditPage + 1; setAuditPage(p); fetchAuditLogs(p, auditSearch); }}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next →</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}

        </>)}
      </div>
    </div>
  );
};

export default AccountsDashboard;