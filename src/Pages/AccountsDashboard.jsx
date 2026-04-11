import React, { useEffect, useState, useCallback, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const fmt  = (n) => n == null ? "—" : "৳ " + Number(n).toLocaleString("en-IN");
const num  = (n) => (n != null ? Number(n) : 0);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, color="text-gray-800", border="border-gray-200", bg="bg-white", pill, onClick }) => (
  <div onClick={onClick}
    className={`${bg} border ${border} rounded-xl p-4 shadow-sm transition-all ${onClick?"cursor-pointer hover:shadow-md hover:brightness-95 active:scale-[0.99]":""}`}>
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="text-xs text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
      {pill && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${pill.color}`}>{pill.text}</span>}
    </div>
    <p className={`text-xl font-bold ${color} leading-tight`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1 leading-snug">{sub}</p>}
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
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${tc} ${bg} ${bc} uppercase tracking-wide whitespace-nowrap`}>{label}</span>;
};

/* ── Progress bar ── */
const Bar = ({ value, max, color="bg-emerald-500" }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1">
    <div className={`h-full ${color} rounded-full transition-all`} style={{ width:`${max>0?Math.min(100,(value/max)*100):0}%` }} />
  </div>
);

/* ══════════════════════════════════════════════════════════════
   PAY VENDOR MODAL
══════════════════════════════════════════════════════════════ */
const PayVendorModal = ({ open, onClose, vendor, summary, onPay }) => {
  const remaining = summary ? Math.max(0, summary.totalBill - summary.totalAdvance - summary.totalPaid) : 0;
  const [amount, setAmount] = useState("");
  const [date,   setDate]   = useState(new Date().toISOString().slice(0,10));
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !summary) return;
    setAmount(remaining > 0 ? String(remaining) : "");
    setDate(new Date().toISOString().slice(0,10));
    setNote("");
  }, [open, remaining]);

  if (!open || !vendor || !summary) return null;

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) {
      Swal.fire({ icon:"warning", title:"Amount দাও", toast:true, position:"top-end", timer:1800, showConfirmButton:false });
      return;
    }
    setSaving(true);
    await onPay({ vendorName: vendor, amount: Number(amount), date, note });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Pay Vendor</h3>
          <p className="text-xs text-gray-400 mt-0.5">{vendor}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-500">
              <span>Total Bill (Rent + Labour)</span>
              <span className="font-semibold text-gray-800">{fmt(summary.totalBill)}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Advance (auto)</span>
              <span className="font-semibold">— {fmt(summary.totalAdvance)}</span>
            </div>
            {summary.totalPaid > 0 && (
              <div className="flex justify-between text-indigo-700">
                <span>Already paid</span>
                <span className="font-semibold">— {fmt(summary.totalPaid)}</span>
              </div>
            )}
            <div className={`flex justify-between font-black pt-1.5 border-t border-gray-200 ${remaining>0?"text-red-600":"text-emerald-600"}`}>
              <span>Remaining Due</span>
              <span>{remaining > 0 ? fmt(remaining) : "✓ Cleared"}</span>
            </div>
          </div>
          <details className="text-xs text-gray-500 cursor-pointer">
            <summary className="font-semibold text-gray-600 mb-1">{summary.trips} trips included</summary>
            <div className="mt-1.5 space-y-1 pl-2 max-h-32 overflow-y-auto">
              {summary.tripList.map((t,i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-mono text-gray-400">{t.tripNumber}</span>
                  <span className="text-gray-600">{fmt(num(t.rent)+num(t.leborBill))}</span>
                </div>
              ))}
            </div>
          </details>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Amount (৳) *</label>
            <input type="number" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date *</label>
            <input type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Note</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="optional..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handlePay} disabled={saving}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-500 transition disabled:opacity-60">
            {saving ? "Saving…" : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MANUAL TX MODAL
══════════════════════════════════════════════════════════════ */
const ManualTxModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ type:"income", description:"", amount:"", date:new Date().toISOString().slice(0,10), note:"", recipientName:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ type:"income", description:"", amount:"", date:new Date().toISOString().slice(0,10), note:"", recipientName:"" });
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || !form.date) {
      Swal.fire({ icon:"warning", title:"সব required field fill করো", toast:true, position:"top-end", timer:1800, showConfirmButton:false });
      return;
    }
    if (form.type === "manual_advance" && !form.recipientName.trim()) {
      Swal.fire({ icon:"warning", title:"Recipient name দাও", toast:true, position:"top-end", timer:1800, showConfirmButton:false });
      return;
    }
    setSaving(true);
    await onSave({ ...form, amount: Number(form.amount) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Add Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[["income","Income","text-emerald-700 bg-emerald-50 border-emerald-200"],
                ["expense","Expense","text-red-700 bg-red-50 border-red-200"],
                ["manual_advance","Advance","text-orange-700 bg-orange-50 border-orange-200"]].map(([k,l,c]) => (
                <button key={k} onClick={() => setForm(f=>({...f,type:k}))}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${form.type===k?c+" ring-2 ring-offset-1 ring-current":"border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="e.g. Office rent, Salary, Client payment..."
              value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          </div>
          {form.type === "manual_advance" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Recipient *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="e.g. Karim, Driver Rahim, Office..."
                value={form.recipientName} onChange={e => setForm(f=>({...f,recipientName:e.target.value}))} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (৳) *</label>
              <input type="number" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="0" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date *</label>
              <input type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Note (optional)</label>
            <textarea rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 resize-none"
              value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   VENDOR SUMMARY TABLE
══════════════════════════════════════════════════════════════ */
const VendorSummaryTable = ({ vendorMap, onPayVendor }) => {
  const vendors = Object.values(vendorMap).sort((a,b) => b.totalBill - a.totalBill);
  if (!vendors.length) return <p className="text-center text-gray-400 text-sm py-8 italic">No vendor data.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white text-left">
            {["Vendor","Trips","Total Bill","Advance (auto)","Paid","Due",""].map(h => (
              <th key={h} className="px-3 py-2.5 text-xs font-normal uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vendors.map((v,i) => {
            const cleared = v.totalAdvance + v.totalPaid;
            const due = Math.max(0, v.totalBill - cleared);
            return (
              <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/40 transition-colors">
                <td className="px-3 py-2.5 font-semibold text-gray-800">{v.vendor}</td>
                <td className="px-3 py-2.5 text-gray-500 text-center">{v.trips}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-800">{fmt(v.totalBill)}</td>
                <td className="px-3 py-2.5 text-amber-700 font-medium">{fmt(v.totalAdvance)}</td>
                <td className="px-3 py-2.5 text-indigo-700 font-medium">{v.totalPaid > 0 ? fmt(v.totalPaid) : <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5 min-w-[140px]">
                  <span className={`font-bold ${due>0?"text-red-600":"text-emerald-600"}`}>
                    {due > 0 ? fmt(due) : "✓ Cleared"}
                  </span>
                  {v.totalBill > 0 && <Bar value={cleared} max={v.totalBill} color={due>0?"bg-amber-400":"bg-emerald-500"} />}
                </td>
                <td className="px-3 py-2.5">
                  {due > 0 && (
                    <button onClick={() => onPayVendor(v.vendor)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition font-semibold whitespace-nowrap">
                      Pay
                    </button>
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

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  const [trips,      setTrips]      = useState([]);
  const [accountTxs, setAccountTxs] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [txLoading,  setTxLoading]  = useState(false);

  const [tab,           setTab]           = useState("overview");
  const [payVendorName, setPayVendorName] = useState(null);
  const [advSearch,     setAdvSearch]     = useState("");
  const [manualModal,   setManualModal]   = useState(false);
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [searchTx,      setSearchTx]      = useState("");

  // FIX: prevMonthBalance এখন number — positive হলে income এ যোগ, negative হলে expense এ যোগ
  const [prevMonthBalance,  setPrevMonthBalance]  = useState(null); // null = loading, 0 = no prev data
  const [carryForwardTxs,   setCarryForwardTxs]   = useState([]);   // unpaid manual advances from prev months

  // FIX: API response cache — বারবার same month fetch বন্ধ করতে
  const apiCache = useRef({});
  const fetchWithCache = useCallback(async (url) => {
    if (apiCache.current[url]) return apiCache.current[url];
    const res = await axiosSecure.get(url);
    apiCache.current[url] = res.data;
    return res.data;
  }, [axiosSecure]);

  // Cache clear on month/year change
  useEffect(() => { apiCache.current = {}; }, [month, year]);

  /* ── Fetch trips ── */
  const fetchTrips = useCallback(async (m, y) => {
    setLoading(true);
    try {
      const data = await fetchWithCache(`/car-rents?month=${m}&year=${y}&page=1&limit=5000`);
      setTrips(data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [fetchWithCache]);

  /* ── Fetch account transactions ── */
  const fetchAccountTxs = useCallback(async (m, y) => {
    setTxLoading(true);
    try {
      const data = await fetchWithCache(`/accounts?month=${m}&year=${y}`);
      setAccountTxs(data.data || []);
    } catch (err) { console.error(err); }
    setTxLoading(false);
  }, [fetchWithCache]);

  /* ── Calc net balance for any month (iterative, uses cache) ── */
  // FIX: Iterative chain — January থেকে target month পর্যন্ত forward calculate
  // এতে recursion নেই, API call সর্বোচ্চ target month সংখ্যক
  // targetM/targetY মাসের net balance calculate করে (সেই মাস সহ, chain আকারে)
  const calcNetBalanceChain = useCallback(async (targetM, targetY) => {
    // LOOKBACK months আগে থেকে শুরু করে targetM পর্যন্ত iterate — targetM নিজেও include
    const LOOKBACK = 6;
    const months = [];
    for (let i = LOOKBACK; i >= 0; i--) {   // i=0 মানে targetM নিজে
      let m = targetM - i;
      let y = targetY;
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

        const inc  = txs.filter(t=>t.type==="income").reduce((s,t)=>s+num(t.amount),0);
        const exp  = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+num(t.amount),0);
        const vadv = txs.filter(t=>t.type==="manual_advance").reduce((s,t)=>s+num(t.amount),0);
        const vpay = txs.filter(t=>t.type==="vendor_payment").reduce((s,t)=>s+num(t.amount),0);
        const aadv = trps.reduce((s,t)=>s+num(t.advance),0);

        // Opening balance chain: positive → income এ যোগ, negative → expense এ যোগ
        const totalInc = inc + (runningBalance > 0 ? runningBalance : 0);
        const totalExp = exp + vadv + vpay + aadv + (runningBalance < 0 ? Math.abs(runningBalance) : 0);
        runningBalance = totalInc - totalExp;
      } catch { /* এই month এ data নেই, runningBalance অপরিবর্তিত */ }
    }
    return runningBalance;
  }, [fetchWithCache]);

  useEffect(() => {
    fetchTrips(month, year);
    fetchAccountTxs(month, year);

    const loadPrevData = async () => {
      setPrevMonthBalance(null); // loading
      try {
        const prevM = month === 1 ? 12 : month - 1;
        const prevY = month === 1 ? year - 1 : year;
        const balance = await calcNetBalanceChain(prevM, prevY);
        setPrevMonthBalance(balance);

        // Unpaid manual advances from last 3 months (carried forward)
        const recentMonths = [];
        for (let i = 1; i <= 3; i++) {
          const m2 = month - i <= 0 ? month - i + 12 : month - i;
          const y2 = month - i <= 0 ? year - 1 : year;
          recentMonths.push({ m2, y2 });
        }
        const results = await Promise.all(
          recentMonths.map(({ m2, y2 }) => fetchWithCache(`/accounts?month=${m2}&year=${y2}`))
        );
        // FIX: carried advances — শুধু যেগুলো current month এর accountTxs এ নেই
        const unpaid = results.flatMap(r =>
          (r.data || []).filter(t => t.type === "manual_advance" && t.status !== "paid")
        );
        setCarryForwardTxs(unpaid);
      } catch { setPrevMonthBalance(0); setCarryForwardTxs([]); }
    };
    loadPrevData();
  }, [month, year, fetchTrips, fetchAccountTxs, calcNetBalanceChain]);

  /* ══ VENDOR MAP ══ */
  const vendorMap = {};
  trips.forEach(t => {
    const v = t.vendorName || "Unknown";
    if (!vendorMap[v]) vendorMap[v] = { vendor:v, trips:0, totalBill:0, totalAdvance:0, totalPaid:0, tripList:[] };
    vendorMap[v].trips++;
    vendorMap[v].totalBill    += num(t.rent) + num(t.leborBill);
    vendorMap[v].totalAdvance += num(t.advance);
    vendorMap[v].tripList.push(t);
  });
  accountTxs.filter(t => t.type === "vendor_payment").forEach(t => {
    const v = t.vendorName || "";
    if (!v) return;
    if (vendorMap[v]) vendorMap[v].totalPaid += num(t.amount);
    else vendorMap[v] = { vendor:v, trips:0, totalBill:0, totalAdvance:0, totalPaid:num(t.amount), tripList:[] };
  });

  /* ══ TOTALS ══ */
  const totalVendorBill = Object.values(vendorMap).reduce((s,v)=>s+v.totalBill, 0);
  const totalAdvance    = Object.values(vendorMap).reduce((s,v)=>s+v.totalAdvance, 0);
  const totalVendorPaid = accountTxs.filter(t=>t.type==="vendor_payment").reduce((s,t)=>s+num(t.amount), 0);
  // FIX: per-vendor due — overclear একটা vendor অন্যটার due কমাবে না
  const totalVendorDue  = Object.values(vendorMap).reduce((s,v)=>s+Math.max(0,v.totalBill-v.totalAdvance-v.totalPaid), 0);
  const pendingVendors  = Object.values(vendorMap).filter(v=>Math.max(0,v.totalBill-v.totalAdvance-v.totalPaid)>0).length;

  const manualIncome       = accountTxs.filter(t=>t.type==="income").reduce((s,t)=>s+num(t.amount), 0);
  const manualExpense      = accountTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+num(t.amount), 0);
  const manualAdvanceTotal = accountTxs.filter(t=>t.type==="manual_advance").reduce((s,t)=>s+num(t.amount), 0);
  const carryForwardFromPrev = carryForwardTxs.reduce((s,t)=>s+num(t.amount), 0);

  // FIX: prevMonthBalance — positive হলে income এ, negative হলে সেটা additional expense
  const prevBalancePositive = prevMonthBalance != null && prevMonthBalance > 0 ? prevMonthBalance : 0;
  const prevBalanceNegative = prevMonthBalance != null && prevMonthBalance < 0 ? Math.abs(prevMonthBalance) : 0;

  const totalIncome  = manualIncome + prevBalancePositive;
  // carry forward advances already counted in prev month — NOT added here again
  const totalExpense = manualExpense + totalVendorPaid + totalAdvance + manualAdvanceTotal + prevBalanceNegative;
  const netBalance   = totalIncome - totalExpense;

  const prevMonthName = MONTHS[month === 1 ? 11 : month - 2];
  const prevMonthLoading = prevMonthBalance === null;

  /* ── Handlers ── */
  const handlePayVendor = async ({ vendorName, amount, date, note }) => {
    try {
      const res = await axiosSecure.post("/accounts", {
        type: "vendor_payment", description: `Vendor Payment — ${vendorName}`,
        amount, date, note, vendorName,
      });
      if (res.data.success) {
        setAccountTxs(prev => [res.data.data, ...prev]);
        Swal.fire({ icon:"success", title:"Payment saved!", toast:true, position:"top-end", timer:1800, showConfirmButton:false });
      }
    } catch (err) { Swal.fire({ icon:"error", title: err?.response?.data?.message || "Failed" }); }
  };

  const handleAddManualTx = async (tx) => {
    try {
      const res = await axiosSecure.post("/accounts", {
        type: tx.type,
        description: tx.type === "manual_advance" ? `Advance — ${tx.recipientName}` : tx.description,
        amount: tx.amount, date: tx.date, note: tx.note || "",
        recipientName: tx.recipientName || "",
        vendorName: tx.vendorName || "",
      });
      if (res.data.success) {
        setAccountTxs(prev => [res.data.data, ...prev]);
        Swal.fire({ icon:"success", title:"Transaction added", toast:true, position:"top-end", timer:1500, showConfirmButton:false });
      }
    } catch (err) { Swal.fire({ icon:"error", title: err?.response?.data?.message || "Failed" }); }
  };

  const handleDeleteTx = async (id) => {
    const { isConfirmed } = await Swal.fire({ title:"Delete?", icon:"warning", showCancelButton:true, confirmButtonColor:"#ef4444", confirmButtonText:"Delete" });
    if (!isConfirmed) return;
    try {
      await axiosSecure.delete(`/accounts/${id}`);
      setAccountTxs(prev => prev.filter(t => t._id !== id));
      // FIX: carryForwardTxs থেকেও সরাও
      setCarryForwardTxs(prev => prev.filter(t => t._id !== id));
    } catch (err) { Swal.fire({ icon:"error", title: err?.response?.data?.message || "Failed" }); }
  };

  const handleMarkPaid = async (id, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      const res = await axiosSecure.patch(`/accounts/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setAccountTxs(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        // FIX: paid হলে carried list থেকে সরাও instantly
        if (newStatus === "paid") {
          setCarryForwardTxs(prev => prev.filter(t => t._id !== id));
        } else {
          setCarryForwardTxs(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        }
      }
    } catch (err) { Swal.fire({ icon:"error", title: err?.response?.data?.message || "Failed" }); }
  };

  /* ── Transactions list ── */
  const autoAdvanceTxs = trips
    .filter(t => t.advance != null && t.advance > 0)
    .map(t => ({
      _id: `adv_${t._id}`, source: "auto_advance",
      description: `Advance — ${t.tripNumber} (${t.vendorName})`,
      amount: num(t.advance), date: t.createdAt?.slice(0,10) || "",
      note: `Driver: ${t.driverName}`,
    }));

  const allTransactions = [
    ...accountTxs.map(t => ({
      ...t,
      source: t.type === "vendor_payment" ? "vendor_payment"
            : t.type === "manual_advance"  ? "manual_advance"
            : "manual",
    })),
    ...autoAdvanceTxs,
  ].sort((a,b) => new Date(b.date||b.createdAt) - new Date(a.date||a.createdAt));

  const filteredTxs = allTransactions.filter(t => {
    if (typeFilter === "auto_advance"   && t.source !== "auto_advance")   return false;
    if (typeFilter === "manual_advance" && t.source !== "manual_advance") return false;
    if (typeFilter === "vendor_payment" && t.source !== "vendor_payment") return false;
    if (typeFilter === "income"         && !(t.source==="manual" && t.type==="income"))  return false;
    if (typeFilter === "expense"        && !(t.source==="manual" && t.type==="expense")) return false;
    if (typeFilter === "all_expense"    && t.source==="manual" && t.type==="income") return false;
    const q = searchTx.toLowerCase();
    if (q && !t.description?.toLowerCase().includes(q) && !t.note?.toLowerCase().includes(q)) return false;
    return true;
  });

  // FIX: footer total — income filter হলে income total, expense হলে expense total
  const footerTotal = (() => {
    if (typeFilter === "income") return filteredTxs.reduce((s,t)=>s+num(t.amount),0);
    if (["expense","vendor_payment","manual_advance","auto_advance","all_expense"].includes(typeFilter))
      return filteredTxs.reduce((s,t)=>s+num(t.amount),0);
    // "all" — income ও expense মিশিয়ে total দেখানো misleading, তাই hide
    return null;
  })();

  const handleExport = () => {
    const rows = filteredTxs.map(t => ({
      Date: t.date || t.createdAt?.slice(0,10),
      Type: t.source==="auto_advance"?"Advance (Auto)":t.source==="manual_advance"?"Advance (Manual)":t.source==="vendor_payment"?"Vendor Payment":t.type,
      Description: t.description, Amount: t.amount, Note: t.note||"",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    saveAs(new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})],{type:"application/octet-stream"}),
      `Accounts_${MONTHS[month-1]}_${year}.xlsx`);
  };

  const payingVendorSummary = payVendorName ? vendorMap[payVendorName] : null;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      <PayVendorModal open={!!payVendorName} vendor={payVendorName} summary={payingVendorSummary}
        onClose={() => setPayVendorName(null)} onPay={handlePayVendor} />
      <ManualTxModal open={manualModal} onClose={() => setManualModal(false)} onSave={handleAddManualTx} />

      <div className="max-w-full mx-auto p-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Accounts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {MONTHS[month-1]} {year} · {trips.length} trips
              {pendingVendors > 0 && <span className="ml-2 text-red-500 font-semibold">· {pendingVendors} vendors pending</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none"
              value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <input type="number"
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none"
              value={year} onChange={e => setYear(parseInt(e.target.value))} />
            <button onClick={() => setManualModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500 transition font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Transaction
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 transition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {loading || txLoading ? <LoadingSpinner /> : (<>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <StatCard label="Total Income" value={prevMonthLoading ? "…" : fmt(totalIncome)}
            sub={prevBalancePositive > 0
              ? `Manual: ${fmt(manualIncome)} + ${prevMonthName}: ${fmt(prevBalancePositive)}`
              : `${accountTxs.filter(t=>t.type==="income").length} entries`}
            color="text-emerald-700" border="border-emerald-200" bg="bg-emerald-50"
            onClick={() => { setTab("transactions"); setTypeFilter("income"); }} />
          <StatCard label="Total Expense" value={prevMonthLoading ? "…" : fmt(totalExpense)}
            sub="Manual + Vendor + Advance"
            color="text-red-600" border="border-red-200" bg="bg-red-50"
            onClick={() => { setTab("transactions"); setTypeFilter("all_expense"); }} />
          <StatCard label="Net Balance" value={prevMonthLoading ? "…" : fmt(netBalance)}
            sub={prevMonthBalance != null && prevMonthBalance !== 0
              ? `Incl. ${prevMonthName}: ${prevMonthBalance > 0 ? "+" : ""}${fmt(prevMonthBalance)}`
              : netBalance >= 0 ? "Surplus" : "Deficit"}
            color={netBalance>=0?"text-emerald-700":"text-red-700"}
            border={netBalance>=0?"border-emerald-200":"border-red-200"}
            bg={netBalance>=0?"bg-emerald-50":"bg-red-50"}
            onClick={() => { setTab("transactions"); setTypeFilter("all"); }} />
          <StatCard label="Bill Issued" value={fmt(totalVendorBill)}
            sub="Rent + Labour · not paid"
            color="text-rose-700" border="border-rose-200" bg="bg-rose-50"
            pill={{ text:"Issued", color:"bg-rose-100 text-rose-700" }}
            onClick={() => setTab("vendors")} />
          <StatCard label="Advance" value={fmt(totalAdvance + manualAdvanceTotal)}
            sub={`Auto: ${fmt(totalAdvance)} · Manual: ${fmt(manualAdvanceTotal)}`}
            color="text-amber-700" border="border-amber-200" bg="bg-amber-50"
            pill={{ text:"All", color:"bg-amber-100 text-amber-700" }}
            onClick={() => setTab("advances")} />
          <StatCard label="Vendor Due" value={fmt(totalVendorDue)}
            sub={`${pendingVendors} vendors pending`}
            color={totalVendorDue>0?"text-red-700":"text-emerald-700"}
            border={totalVendorDue>0?"border-red-200":"border-emerald-200"}
            bg={totalVendorDue>0?"bg-red-50":"bg-emerald-50"}
            pill={totalVendorDue===0?{text:"Cleared",color:"bg-emerald-100 text-emerald-700"}:null}
            onClick={() => setTab("vendors")} />
        </div>

        {/* FIX: Tabs — advances tab add করা হয়েছে */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 w-fit shadow-sm">
          {[
            { id:"overview",     label:"Overview" },
            { id:"vendors",      label:`Vendors${pendingVendors>0?` (${pendingVendors})`:""}` },
            { id:"advances",     label:"Advances" },
            { id:"transactions", label:"Transactions" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${tab===t.id?"bg-gray-800 text-white":"text-gray-500 hover:text-gray-800"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-0.5">Vendor Bill Breakdown</h3>
              <p className="text-xs text-gray-400 mb-4">Bill issued ≠ paid. Pay from "Vendors" tab per vendor.</p>
              <div className="space-y-3">
                {[
                  { label:"Bill Issued (Rent + Labour)", value:totalVendorBill,  color:"bg-rose-300",   max:totalVendorBill||1 },
                  { label:"Advance Paid (auto)",         value:totalAdvance,     color:"bg-amber-400",  max:totalVendorBill||1 },
                  { label:"Paid from Accounts",          value:totalVendorPaid,  color:"bg-indigo-400", max:totalVendorBill||1 },
                  { label:"Still Due",                   value:totalVendorDue,   color:"bg-red-500",    max:totalVendorBill||1 },
                ].map((item,i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs font-bold text-gray-800">{fmt(item.value)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`}
                        style={{ width:`${Math.min(100,(item.value/item.max)*100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Trips</p>
                  <p className="text-xl font-black text-gray-800">{trips.length}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600">Vendors</p>
                  <p className="text-lg font-black text-amber-700">{Object.keys(vendorMap).length}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-500">Due</p>
                  <p className="text-lg font-black text-red-700">{pendingVendors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Accounts Cash Flow</h3>
              <div className="space-y-3 mb-5">
                {(() => {
                  const maxVal = Math.max(totalIncome, totalExpense, 1);
                  const rows = [
                    ...(prevBalancePositive > 0 ? [{ label:`Opening Balance (${prevMonthName})`, value:prevBalancePositive, color:"bg-teal-400", sign:"+" }] : []),
                    { label:"Income (this month)",    value:manualIncome,        color:"bg-emerald-400", sign:"+" },
                    ...(prevBalanceNegative > 0 ? [{ label:`Deficit from ${prevMonthName}`, value:prevBalanceNegative, color:"bg-rose-500", sign:"−" }] : []),
                    { label:"Manual Expense",         value:manualExpense,       color:"bg-red-400",     sign:"−" },
                    { label:"Vendor Payments",        value:totalVendorPaid,     color:"bg-indigo-400",  sign:"−" },
                    { label:"Advance — Manual",       value:manualAdvanceTotal,  color:"bg-orange-400",  sign:"−" },
                    { label:"Advance — Auto (trips)", value:totalAdvance,        color:"bg-amber-400",   sign:"−" },
                  ];
                  return rows.map((item,i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-xs font-bold text-gray-800">{item.sign} {fmt(item.value)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`}
                          style={{ width:`${Math.min(100,(item.value/maxVal)*100)}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className={`rounded-xl p-4 flex items-center justify-between ${netBalance>=0?"bg-emerald-50 border border-emerald-200":"bg-red-50 border border-red-200"}`}>
                <span className="text-sm font-semibold text-gray-700">Net Balance</span>
                <span className={`text-2xl font-black ${netBalance>=0?"text-emerald-700":"text-red-700"}`}>
                  {netBalance>=0?"+":""}{prevMonthLoading?"…":fmt(netBalance)}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Pending Vendors — Quick View</h3>
                <button onClick={() => setTab("vendors")} className="text-xs text-indigo-600 hover:underline font-semibold">View All →</button>
              </div>
              {pendingVendors === 0 ? (
                <div className="text-center py-6 text-emerald-600 font-semibold text-sm">✓ All vendors cleared!</div>
              ) : (
                <div className="space-y-2">
                  {Object.values(vendorMap)
                    .filter(v=>Math.max(0,v.totalBill-v.totalAdvance-v.totalPaid)>0)
                    .sort((a,b)=>(b.totalBill-b.totalAdvance-b.totalPaid)-(a.totalBill-a.totalAdvance-a.totalPaid))
                    .slice(0,6)
                    .map((v,i) => {
                      const due = v.totalBill - v.totalAdvance - v.totalPaid;
                      return (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
                          <span className="text-sm text-gray-700 flex-1 font-medium truncate">{v.vendor}</span>
                          <span className="text-xs text-gray-400 shrink-0">{v.trips} trips · {fmt(v.totalBill)} bill</span>
                          <span className="font-bold text-red-600 text-sm shrink-0">{fmt(due)} due</span>
                          <button onClick={()=>setPayVendorName(v.vendor)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition font-semibold shrink-0">
                            Pay
                          </button>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ VENDORS ══ */}
        {tab === "vendors" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Vendor-wise Summary — {MONTHS[month-1]} {year}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Pay করলে সব trips-এর bill একসাথে settle হবে</p>
              </div>
              <span className="text-xs text-gray-400">{trips.length} trips · {Object.keys(vendorMap).length} vendors</span>
            </div>
            <VendorSummaryTable vendorMap={vendorMap} onPayVendor={setPayVendorName} />
          </div>
        )}

        {/* ══ ADVANCES ══ */}
        {tab === "advances" && (() => {
          const manualAdvances = accountTxs.filter(t => t.type === "manual_advance");
          const tripAdvances   = trips.filter(t => t.advance != null && t.advance > 0);
          const unpaidCurrent  = manualAdvances.filter(a => a.status !== "paid");
          const paidCurrent    = manualAdvances.filter(a => a.status === "paid");
          const unpaidTotal    = unpaidCurrent.reduce((s,a) => s+num(a.amount), 0);

          // FIX: carried rows — exclude যেগুলো current month এও আছে (duplicate prevention)
          const currentIds = new Set(manualAdvances.map(a => String(a._id)));
          const uniqueCarried = carryForwardTxs.filter(a => !currentIds.has(String(a._id)));

          const filteredManual = manualAdvances.filter(a =>
            !advSearch ||
            (a.recipientName||"").toLowerCase().includes(advSearch.toLowerCase()) ||
            (a.note||"").toLowerCase().includes(advSearch.toLowerCase())
          );
          const filteredTrip = tripAdvances.filter(t =>
            !advSearch ||
            (t.vendorName||"").toLowerCase().includes(advSearch.toLowerCase()) ||
            (t.tripNumber||"").toLowerCase().includes(advSearch.toLowerCase()) ||
            (t.driverName||"").toLowerCase().includes(advSearch.toLowerCase())
          );
          const filteredCarried = uniqueCarried.filter(a =>
            !advSearch ||
            (a.recipientName||"").toLowerCase().includes(advSearch.toLowerCase()) ||
            (a.note||"").toLowerCase().includes(advSearch.toLowerCase())
          );

          const allRows = [
            ...filteredManual.map(a => ({
              date: a.date, name: a.recipientName || a.description?.replace("Advance — ","") || "—",
              type:"manual", note: a.note || "", amount: num(a.amount), status: a.status||"unpaid", _id: a._id,
            })),
            ...filteredTrip.map(t => ({
              date: t.createdAt?.slice(0,10)||"", name: t.vendorName, type:"auto",
              note: `${t.tripNumber} · ${t.driverName}`, amount: num(t.advance), status:"auto", _id: null,
            })),
            ...filteredCarried.map(a => ({
              date: a.date, name: a.recipientName || a.description?.replace("Advance — ","") || "—",
              type:"carry", note: a.note ? `[Carried] ${a.note}` : "[Carried from prev month]",
              amount: num(a.amount), status:"unpaid", _id: a._id,
            })),
          ].sort((a,b) => new Date(b.date) - new Date(a.date));

          return (
            <div className="space-y-3">
              {uniqueCarried.length > 0 && (
                <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div>
                    <p className="font-semibold text-orange-800">
                      {uniqueCarried.length} unpaid advance{uniqueCarried.length>1?"s":""} carried from previous months — {fmt(uniqueCarried.reduce((s,a)=>s+num(a.amount),0))}
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">আগের month এ already expense হিসেবে count হয়েছে — এই month এ শুধু reminder</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-amber-600 uppercase tracking-widest mb-0.5">Auto (Trips)</p>
                  <p className="text-lg font-bold text-amber-700">{fmt(totalAdvance)}</p>
                  <p className="text-xs text-amber-400">{tripAdvances.length} trips</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-orange-500 uppercase tracking-widest mb-0.5">Manual</p>
                  <p className="text-lg font-bold text-orange-700">{fmt(manualAdvanceTotal)}</p>
                  <p className="text-xs text-orange-400">{paidCurrent.length} paid · {unpaidCurrent.length} unpaid</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-red-500 uppercase tracking-widest mb-0.5">Unpaid (this month)</p>
                  <p className="text-lg font-bold text-red-700">{fmt(unpaidTotal)}</p>
                  <p className="text-xs text-red-400">will carry forward</p>
                </div>
                {uniqueCarried.length > 0 ? (
                  <div className="bg-orange-100 border border-orange-300 rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-orange-600 uppercase tracking-widest mb-0.5">Carried Forward</p>
                    <p className="text-lg font-bold text-orange-800">{fmt(uniqueCarried.reduce((s,a)=>s+num(a.amount),0))}</p>
                    <p className="text-xs text-orange-500">{uniqueCarried.length} from prev months</p>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-lg font-bold text-white">{fmt(totalAdvance + manualAdvanceTotal)}</p>
                    <p className="text-xs text-gray-400">Auto + Manual</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-sm font-bold text-gray-800">Advance History</h3>
                  <div className="sm:ml-auto flex items-center gap-2">
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-400 w-52 bg-white"
                      placeholder="Search name / trip / note…"
                      value={advSearch} onChange={e => setAdvSearch(e.target.value)} />
                    <span className="text-xs text-gray-400 shrink-0">{allRows.length} entries</span>
                  </div>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
                  {allRows.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 italic text-sm">No advance records.</div>
                  ) : (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRows.map((r,i) => (
                          <tr key={i} className={`border-b border-gray-50 transition-colors ${
                            r.status==="paid" ? "opacity-50 bg-gray-50/40" :
                            r.type==="carry"  ? "bg-orange-50/50 hover:bg-orange-50" :
                            "hover:bg-amber-50/40"
                          }`}>
                            <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>
                            <td className="px-4 py-2.5 font-semibold text-gray-800">{r.name}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[200px]">
                              <span className="truncate block">{r.note||"—"}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${
                                r.type==="auto"  ? "text-amber-700 bg-amber-50 border-amber-200" :
                                r.type==="carry" ? "text-orange-800 bg-orange-100 border-orange-300" :
                                                   "text-orange-700 bg-orange-50 border-orange-200"
                              }`}>
                                {r.type==="auto" ? "Auto" : r.type==="carry" ? "Carried" : "Manual"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-amber-700 whitespace-nowrap">{fmt(r.amount)}</td>
                            <td className="px-4 py-2.5 text-center">
                              {r.type==="auto" ? (
                                <span className="text-xs text-gray-300">—</span>
                              ) : (
                                <button onClick={() => handleMarkPaid(r._id, r.status)}
                                  className={`px-2.5 py-1 text-[10px] font-semibold rounded border transition-all whitespace-nowrap ${
                                    r.status==="paid"
                                      ? "text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                                      : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
                                  }`}>
                                  {r.status==="paid" ? "✓ Paid" : "Mark Paid"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Total</td>
                          <td className="px-4 py-2.5 text-right font-black text-gray-800">
                            {fmt(allRows.reduce((s,r)=>s+r.amount,0))}
                          </td>
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
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-sm font-bold text-gray-800">All Transactions</h3>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <input
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-400 w-48"
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
                <span className="text-xs text-gray-400">{filteredTxs.length} entries</span>
              </div>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
              {filteredTxs.length === 0 ? (
                <div className="text-center py-16 text-gray-400 italic text-sm">No transactions found.</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      {["Date","Type","Description","Note","Amount",""].map(h => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h==="Amount"?"text-right":"text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.map((t,i) => (
                      <tr key={t._id||i} className="border-b border-gray-50 hover:bg-amber-50 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{t.date||t.createdAt?.slice(0,10)}</td>
                        <td className="px-4 py-2.5"><Badge source={t.source} type={t.type} /></td>
                        <td className="px-4 py-2.5 text-sm text-gray-700 max-w-[220px]"><span className="truncate block">{t.description}</span></td>
                        <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[160px]"><span className="truncate block">{t.note||"—"}</span></td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">{fmt(t.amount)}</td>
                        <td className="px-4 py-2.5 text-center">
                          {t.source !== "auto_advance" && t._id && !String(t._id).startsWith("adv_") && (
                            <button onClick={() => handleDeleteTx(t._id)}
                              className="text-gray-300 hover:text-red-500 transition text-sm">✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* FIX: footer total — "all" filter এ hide */}
                  {footerTotal !== null && (
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td colSpan={4} className="px-4 py-2.5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                          Total ({filteredTxs.length})
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-black text-gray-800">
                          {fmt(footerTotal)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          </div>
        )}

        </>)}
      </div>
    </div>
  );
};

export default AccountsDashboard;