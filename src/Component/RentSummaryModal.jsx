/* ════════════════════════════════════════════════════════════════
   RENT SUMMARY MODAL — Updated Design
   Drop-in replacement for the RentSummaryModal component
════════════════════════════════════════════════════════════════ */

import { Save, X, Package, RotateCcw, Truck, User } from "lucide-react";

/* ── Bangla words helper (same as before) ── */
const ones = ["","এক","দুই","তিন","চার","পাঁচ","ছয়","সাত","আট","নয়",
              "দশ","এগারো","বারো","তেরো","চৌদ্দ","পনেরো","ষোলো","সতেরো","আঠারো","উনিশ"];
const tens = ["","","বিশ","ত্রিশ","চল্লিশ","পঞ্চাশ","ষাট","সত্তর","আশি","নব্বই"];
function toBanglaWords(n) {
  n = Math.round(Math.abs(n));
  if (n === 0) return "শূন্য";
  function belowHundred(num) {
    if (num < 20) return ones[num];
    return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
  }
  function belowThousand(num) {
    if (num < 100) return belowHundred(num);
    return ones[Math.floor(num/100)]+" শত"+(num%100 ? " "+belowHundred(num%100) : "");
  }
  const crore = Math.floor(n/10000000); n %= 10000000;
  const lakh  = Math.floor(n/100000);   n %= 100000;
  const hazar = Math.floor(n/1000);     n %= 1000;
  const rest  = n;
  let parts = [];
  if (crore) parts.push(belowThousand(crore)+" কোটি");
  if (lakh)  parts.push(belowThousand(lakh)+" লক্ষ");
  if (hazar) parts.push(belowThousand(hazar)+" হাজার");
  if (rest)  parts.push(belowThousand(rest));
  return parts.join(" ");
}
function takaInWords(amount) {
  if (amount === "" || amount == null) return null;
  const n = Number(amount);
  if (isNaN(n) || n === 0) return null;
  return toBanglaWords(n) + " টাকা";
}

const RentSummaryModal = ({ rental, rent, leborBill, onConfirm, onCancel, saving }) => {
  const challans       = rental.challans || [];
  const normalChallans = challans.filter(c => !c.isReturn);
  const returnChallans = challans.filter(c =>  c.isReturn);

  const productMap = {};
  normalChallans.forEach(c =>
    (c.products || []).forEach(p => {
      if (!productMap[p.productName]) productMap[p.productName] = 0;
      productMap[p.productName] += Number(p.quantity || 0);
    })
  );
  const productSummary = Object.entries(productMap);
  const totalPcs  = productSummary.reduce((s, [, q]) => s + q, 0);
  const rentNum   = Number(rent)      || 0;
  const leborNum  = Number(leborBill) || 0;
  const totalBill = rentNum + leborNum;
  const hasRent   = rent      !== "" && rent      != null;
  const hasLebor  = leborBill !== "" && leborBill != null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,6,23,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "96vh" }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HEADER ── */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 px-5 pt-5 pb-4">
          {/* decorative circle */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)", transform: "translate(30%,-30%)" }} />

          <button onClick={onCancel}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
            <X size={16} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Truck size={16} className="text-indigo-300" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-base tracking-tight leading-tight">{rental.tripNumber}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-slate-400 text-[11px] font-medium">{rental.vehicleNumber}</span>
                <span className="text-slate-600 text-[10px]">·</span>
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <User size={9} className="text-indigo-400" />{rental.driverName}
                </span>
              </div>
            </div>
          </div>

          {/* stat pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
              <span className="text-[10px] text-emerald-400 font-bold">{normalChallans.length} পয়েন্ট</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/25">
              <span className="text-[10px] text-sky-400 font-bold">{totalPcs} পিস</span>
            </div>
            {returnChallans.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25">
                <RotateCcw size={9} className="text-orange-400" />
                <span className="text-[10px] text-orange-400 font-bold">{returnChallans.length} রিটার্ন</span>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4 bg-slate-50">

          {/* Product breakdown */}
          {productSummary.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package size={12} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পণ্যের বিবরণ</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {productSummary.map(([name, qty], i) => (
                  <div key={i}
                    className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-[12px] text-slate-700 font-semibold">{name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-indigo-600">{qty}</span>
                      <span className="text-[9px] text-slate-400 font-medium">পিস</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50 border-t border-indigo-100">
                  <span className="text-[11px] text-indigo-700 font-black uppercase tracking-wide">মোট</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-indigo-700">{totalPcs}</span>
                    <span className="text-[9px] text-indigo-500 font-medium">পিস</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bill breakdown */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">বিল সারসংক্ষেপ</p>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

              {/* Rent row */}
              <div className="px-3.5 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-600 font-semibold">গাড়ি ভাড়া</span>
                  <span className={`text-[14px] font-black ${hasRent ? "text-indigo-700" : "text-slate-300"}`}>
                    {hasRent ? `৳ ${rentNum.toLocaleString()}` : "—"}
                  </span>
                </div>
                {hasRent && takaInWords(rent) && (
                  <p className="text-[10px] text-indigo-400 font-medium mt-0.5 text-right">{takaInWords(rent)}</p>
                )}
              </div>

              {/* Lebor row */}
              <div className="px-3.5 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-600 font-semibold">লেবার বিল</span>
                  <span className={`text-[14px] font-black ${hasLebor ? "text-sky-700" : "text-slate-300"}`}>
                    {hasLebor ? `৳ ${leborNum.toLocaleString()}` : "—"}
                  </span>
                </div>
                {hasLebor && takaInWords(leborBill) && (
                  <p className="text-[10px] text-sky-400 font-medium mt-0.5 text-right">{takaInWords(leborBill)}</p>
                )}
              </div>

              {/* Total row */}
              {hasRent && hasLebor && (
                <div className="px-3.5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                      <span className="text-[12px] text-emerald-800 font-black">মোট বিল</span>
                    </div>
                    <span className="text-[18px] font-black text-emerald-700 tracking-tight">
                      ৳ {totalBill.toLocaleString()}
                    </span>
                  </div>
                  {takaInWords(totalBill) && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 text-right leading-relaxed">
                      {takaInWords(totalBill)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-100 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-2 px-6 py-2.5 text-[13px] font-black text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              flex: 2,
              background: saving
                ? "#6366f1"
                : "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
              boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,0.4)",
            }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                সংরক্ষণ হচ্ছে…
              </>
            ) : (
              <>
                <Save size={13} />
                নিশ্চিত করুন
              </>
            )}
          </button>
        </div>

        {/* mobile bottom safe area */}
        <div className="h-safe-bottom bg-white sm:hidden" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
};

export default RentSummaryModal;