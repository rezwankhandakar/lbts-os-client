import { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded, Save, Wallet, Pencil, ChevronDown, RotateCcw,
  ArrowLeft,
} from "lucide-react";
import RentSummaryModal from "./RentSummaryModal";

/* ════════════════════════════════════════════════════════════════
   সংখ্যাকে বাংলা কথায় রূপান্তর
   ─────────────────────────────────────────────────────────────────
   Bangla te 1-99 prottek number er nijoshsho naam ache — eta English
   er moto "twenty + one = twenty-one" pattern follow kore na.  E.g.
   21 = "একুশ" (not "বিশ এক"), 35 = "পঁয়ত্রিশ", 99 = "নিরানব্বই".
   So 1-99 er full table direct map kora hoyeche.
════════════════════════════════════════════════════════════════ */
const banglaBelowHundred = [
  "",                                                                                  // 0  (handled by caller)
  "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",                            // 1–9
  "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ",      // 10–19
  "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "ঊনত্রিশ",   // 20–29
  "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", // 30–39
  "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", // 40–49
  "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট",       // 50–59
  "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর",  // 60–69
  "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি",  // 70–79
  "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই",            // 80–89
  "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই", // 90–99
];

function toBanglaWords(n) {
  n = Math.round(Math.abs(n));
  if (n === 0) return "শূন্য";
  function belowHundred(num) {
    return banglaBelowHundred[num];
  }
  function belowThousand(num) {
    if (num < 100) return belowHundred(num);
    const h = Math.floor(num / 100);
    const r = num % 100;
    return banglaBelowHundred[h] + " শত" + (r ? " " + belowHundred(r) : "");
  }
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh  = Math.floor(n / 100000);   n %= 100000;
  const hazar = Math.floor(n / 1000);     n %= 1000;
  const rest  = n;
  let parts = [];
  if (crore) parts.push(belowThousand(crore) + " কোটি");
  if (lakh)  parts.push(belowThousand(lakh)  + " লক্ষ");
  if (hazar) parts.push(belowThousand(hazar) + " হাজার");
  if (rest)  parts.push(belowThousand(rest));
  return parts.join(" ");
}

function takaInWords(amount) {
  if (amount === "" || amount == null) return null;
  const n = Number(amount);
  if (isNaN(n)) return null;
  return toBanglaWords(n) + " টাকা";
}

/* ════════════════════════════════════════════════════════════════
   CAR RENT DETAILS  (modal or full-page surface)
   ─────────────────────────────────────────────────────────────────
   Same component for two use-cases:
     - Modal overlay (displayMode="modal", default; backward-compatible)
     - Full page     (displayMode="page"; used by /car-rent/:id route)

   In page mode the outer fixed-backdrop is dropped, the box fills the
   layout, the close X at the right is hidden, and a Back button is
   added at the left of the header.  All internal handlers stay the
   same — the parent decides what `setSelectedRental(null)` means
   (close modal vs. navigate back).
════════════════════════════════════════════════════════════════ */
const CarRentDetailsModal = ({ selectedRental, setSelectedRental, onRentalUpdate, onSaved, onSaveSuccess, readOnly = false, displayMode = "modal" }) => {
  const isPage = displayMode === "page";
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const loggedInUser = user?.displayName || "Unknown";

  const [rental,      setRental]      = useState(null);
  const [rent,        setRent]        = useState("");
  const [leborBill,   setLeborBill]   = useState("");
  const [saving,      setSaving]      = useState(false);
  const [statsOpen,   setStatsOpen]   = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (selectedRental) {
      setRental(selectedRental);
      setRent(selectedRental.rent      ?? "");
      setLeborBill(selectedRental.leborBill ?? "");
      setStatsOpen(false);
      setShowSummary(false);
    } else {
      setRental(null);
    }
  }, [selectedRental]);

  const handleClose = () => {
    setRental(null);
    setSelectedRental(null);
    setShowSummary(false);
  };

  if (!rental) return null;

  const challans       = rental.challans || [];
  const normalChallans = challans.filter(c => !c.isReturn);
  const totalProducts  = normalChallans.reduce((sum, c) =>
    sum + (c.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) || 0), 0);

  const productMap = {};
  normalChallans.forEach(c =>
    (c.products || []).forEach(p => {
      if (!productMap[p.productName]) productMap[p.productName] = 0;
      productMap[p.productName] += Number(p.quantity || 0);
    })
  );
  const productSummary = Object.entries(productMap);

  const handleSaveClick = () => setShowSummary(true);

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch(`/car-rents/${rental._id}`, {
        rent:      rent      !== "" ? Number(rent)      : null,
        leborBill: leborBill !== "" ? Number(leborBill) : null,
        updatedBy: loggedInUser,
      });
      if (res.data.success) {
        const updated = res.data.data;
        setRental(prev => ({ ...prev, ...updated }));
        if (onRentalUpdate) onRentalUpdate(updated);
        if (onSaved) onSaved();
        setShowSummary(false);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "সংরক্ষিত হয়েছে!", showConfirmButton: false, timer: 1500 });
        // After-save navigation hook — used by page-mode wrapper to
        // redirect to the list with the Missing filter pre-applied.
        // Modal mode doesn't pass this prop, so existing behaviour
        // (stay open, let onSaved flip filters in caller) is preserved.
        if (onSaveSuccess) {
          // Small delay so user actually sees the success toast before
          // the route changes.
          setTimeout(() => onSaveSuccess(updated), 600);
        }
      }
    } catch {
      Swal.fire("ত্রুটি", "সংরক্ষণ ব্যর্থ হয়েছে", "error");
    }
    setSaving(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":    return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "not_received": return "bg-rose-100 text-rose-700 border-rose-200";
      case "call_later":   return "bg-amber-100 text-amber-700 border-amber-200";
      case "received":     return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "missing":      return "bg-red-100 text-red-700 border-red-200";
      default:             return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  // ── Outer wrapper differs by displayMode ──
  //   modal → fixed backdrop + centered max-width box; click outside closes
  //   page  → fills parent layout, no backdrop, no click-outside
  const outerProps = isPage
    ? { className: "h-full w-full flex flex-col bg-slate-50" }
    : {
        className: "fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-50 p-0 sm:p-3 md:p-4",
        onClick: handleClose,
      };
  const innerProps = isPage
    ? { className: "bg-white w-full overflow-hidden flex flex-col flex-1" }
    : {
        className: "bg-white w-full max-w-5xl overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col",
        style: { maxHeight: "100dvh" },
        onClick: (e) => e.stopPropagation(),
      };

  return (
    <>
      {/* ── RentSummaryModal ── */}
      {showSummary && (
        <RentSummaryModal
          rental={rental}
          rent={rent}
          leborBill={leborBill}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowSummary(false)}
          saving={saving}
        />
      )}

      <div {...outerProps}>
        <div {...innerProps}>

          {/* ══ HEADER ══ */}
          <div className="shrink-0 bg-slate-800">
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 cursor-pointer select-none"
              onClick={() => setStatsOpen(o => !o)}
            >
              {/* Back button — only in page mode. Stops propagation so
                  clicking it doesn't also toggle the stats panel. */}
              {isPage && (
                <button
                  onClick={e => { e.stopPropagation(); handleClose(); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-300 border border-slate-600 rounded-lg hover:bg-white/5 hover:text-white transition shrink-0"
                  title="Back"
                >
                  <ArrowLeft size={12} /> <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <h2 className="text-xs sm:text-sm font-black text-white tracking-tight shrink-0">
                  {rental.tripNumber}
                </h2>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {new Date(rental.createdAt).toLocaleDateString("en-GB")}
                </span>
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <Truck size={10} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-300 truncate max-w-[70px] sm:max-w-[110px]" title={rental.vehicleNumber}>
                    {rental.vehicleNumber}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <User size={10} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-300 truncate max-w-[100px]" title={rental.driverName}>
                    {rental.driverName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-black shrink-0">
                  {normalChallans.length || rental.totalChallan || rental.point} Point — {totalProducts} Pics
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${statsOpen ? "rotate-180" : ""}`} />
                {/* X close — only in modal mode; page mode uses Back on left */}
                {!isPage && (
                  <button
                    onClick={e => { e.stopPropagation(); handleClose(); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Expanded stats panel ── */}
            {statsOpen && (
              <div className="border-t border-slate-700 px-3 py-3 space-y-3">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vehicle</p>
                      <p className="text-xs font-bold text-white">{rental.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package size={13} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</p>
                      <p className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[220px]" title={rental.vendorName}>
                        {rental.vendorName}
                      </p>
                      {rental.vendorNumber && (
                        <p className="text-[10px] text-indigo-400 flex items-center gap-1">
                          <PhoneForwarded size={9} />{rental.vendorNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</p>
                      <p className="text-xs font-bold text-white truncate max-w-[140px]" title={rental.driverName}>
                        {rental.driverName}
                      </p>
                      {rental.driverNumber && (
                        <p className="text-[10px] text-indigo-400 flex items-center gap-1">
                          <PhoneForwarded size={9} />{rental.driverNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {(rental.currentUser || rental.createdBy) && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User size={9} />{rental.currentUser || rental.createdBy}
                      </span>
                    )}
                    {rental.lastUpdatedBy && (
                      <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                        <Pencil size={9} />{rental.lastUpdatedBy}
                      </span>
                    )}
                    {rental.rentSavedBy && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Wallet size={9} />{rental.rentSavedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chips + inputs */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { l: "Adv",   v: rental.advance  != null ? Number(rental.advance).toLocaleString()  : "—", color: "text-orange-300", bg: "bg-orange-500/10 border-orange-500/20" },
                      { l: "Rent",  v: rental.rent      != null ? Number(rental.rent).toLocaleString()      : "—", color: "text-indigo-300", bg: "bg-indigo-500/10 border-indigo-500/20" },
                      { l: "Lebor", v: rental.leborBill != null ? Number(rental.leborBill).toLocaleString() : "—", color: "text-sky-300",    bg: "bg-sky-500/10 border-sky-500/20" },
                      ...(rental.rent != null && rental.leborBill != null ? [{
                        l: "Total",
                        v: (Number(rental.rent) + Number(rental.leborBill)).toLocaleString(),
                        color: "text-emerald-300",
                        bg: "bg-emerald-500/15 border-emerald-500/25",
                      }] : []),
                    ].map((chip, i) => (
                      <div key={i} className={`flex items-center gap-0.5 px-2 py-0.5 rounded border ${chip.bg}`}>
                        <span className="text-[9px] text-slate-500 font-bold leading-none">{chip.l}</span>
                        <span className={`text-[10px] font-black ${chip.color} leading-none`}>৳{chip.v}</span>
                      </div>
                    ))}
                  </div>
                  {!readOnly && (
                    <div className="flex items-start gap-1.5 flex-wrap ml-auto">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-amber-200 uppercase font-black tracking-widest mb-0.5 pl-0.5">Rent (৳)</span>
                        <input
                          type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="—"
                          className="w-20 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center"
                        />
                        {/* Bangla amount-in-words — shows live as the user types.
                            Hidden when blank or invalid; kept under the input
                            (max-width matches input) so the header layout
                            doesn't shift when it appears. */}
                        {rent !== "" && rent != null && takaInWords(rent) && (
                          <p className="w-20 sm:w-24 mt-1 px-0.5 text-[11px] text-amber-200 font-semibold  leading-tight break-words text-center">
                            {takaInWords(rent)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-amber-200 uppercase font-black tracking-widest mb-0.5 pl-0.5">Lebor Bill (৳)</span>
                        <input
                          type="number" value={leborBill} onChange={e => setLeborBill(e.target.value)} placeholder="—"
                          className="w-20 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center"
                        />
                        {leborBill !== "" && leborBill != null && takaInWords(leborBill) && (
                          <p className="w-20 sm:w-24 mt-1 px-0.5 text-[11px] text-amber-200 font-semibold leading-tight break-words text-center">
                            {takaInWords(leborBill)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSaveClick} disabled={saving}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 mt-3.5"
                      >
                        <Save size={11} /> Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ CHALLAN GRID ══ */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4">
            {challans.length === 0 ? (
              <div className="text-center py-16 text-slate-400 italic text-sm">No challans in this trip.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {challans.map((c, i) => {
                  const isReturnCard = c.isReturn === true;
                  return (
                    <div
                      key={i}
                      className={`border rounded-xl overflow-hidden transition-all duration-200
                        ${isReturnCard
                          ? "bg-orange-50 border-orange-200"
                          : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"}`}
                    >

                      {/* ══ TOP ROW: status badges OR return badge ══ */}
                      <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 border-b
                        ${isReturnCard
                          ? "bg-orange-100/60 border-orange-200"
                          : "bg-slate-50 border-slate-100"}`}>

                        {isReturnCard ? (
                          /* Return badge + date */
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded uppercase">
                              <RotateCcw size={8} /> Return Challan
                            </span>
                            {c.returnedAt && (
                              <span className="text-[10px] text-orange-600 font-medium">
                                {new Date(c.returnedAt).toLocaleDateString("en-GB")}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* D + C status badges */
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}>
                              D: {c.deliveryStatus || "Pending"}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}>
                              C: {c.challanReturnStatus || "Pending"}
                            </span>
                          </div>
                        )}

                        {/* Zone badge — right side of top row */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase shrink-0
                          ${isReturnCard
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          {c.zone}
                        </span>
                      </div>

                      {/* ══ BODY: full data ══ */}
                      <div className="p-2.5 sm:p-3 space-y-1">

                        {/* Customer name — full, no truncate */}
                        <p className="text-xs sm:text-sm text-green-800 font-bold leading-snug break-words">
                          {c.customerName}
                        </p>

                        {/* Address — full, no truncate */}
                        <p className="text-[11px] text-black leading-snug break-words">
                          <span className="font-semibold text-orange-500">Addr:</span> {c.address}
                        </p>

                        {/* District · Thana */}
                        {(c.district || c.thana) && (
                          <p className="text-[11px] leading-snug">
                            {c.district && (
                              <span>
                                <span className="font-semibold text-cyan-800">District:</span>{" "}
                                <span className="text-black">{c.district}</span>
                              </span>
                            )}
                            {c.district && c.thana && <span className="text-slate-300 mx-1">·</span>}
                            {c.thana && (
                              <span>
                                <span className="font-semibold text-cyan-800">Thana:</span>{" "}
                                <span className="text-black">{c.thana}</span>
                              </span>
                            )}
                          </p>
                        )}

                        {/* Receiver number */}
                        {c.receiverNumber && (
                          <p className="text-[10px] text-slate-800 font-semibold tracking-wide">
                            {c.receiverNumber}
                          </p>
                        )}

                        {/* Floor / Carrying chips */}
                        {!isReturnCard && (c.floor || c.carrying) && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {c.floor && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-black text-emerald-700">
                                🏢 {c.floor} তলা
                              </span>
                            )}
                            {c.carrying && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[9px] font-semibold text-amber-700">
                                🚐 {c.carrying}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Note — full, no truncate */}
                        {!isReturnCard && c.note?.trim() && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 break-words">
                            📝 {c.note}
                          </p>
                        )}
                        {isReturnCard && c.returnNote && (
                          <p className="text-[10px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-1 italic break-words">
                            📝 {c.returnNote}
                          </p>
                        )}
                      </div>

                      {/* ══ Product table ══ */}
                      <div className={`mx-2.5 mb-2.5 rounded-xl border overflow-hidden
                        ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
                        <table className="w-full text-[10px] sm:text-xs">
                          <thead className={`uppercase text-[9px] sm:text-[10px]
                            ${isReturnCard ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                            <tr>
                              <th className="px-2 py-1.5 text-left font-bold">Product</th>
                              <th className="px-2 py-1.5 text-left font-bold">Model</th>
                              <th className="px-2 py-1.5 text-right font-bold">{isReturnCard ? "Rtn" : "Qty"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(c.products || []).map((p, idx) => (
                              <tr
                                key={idx}
                                className={`border-b last:border-0
                                  ${isReturnCard
                                    ? "border-orange-100 hover:bg-orange-100/50"
                                    : "border-slate-100 hover:bg-white"}`}
                              >
                                <td className={`px-2 py-1.5 text-[10px] font-semibold break-words
                                  ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>
                                  {p.productName}
                                </td>
                                <td className={`px-2 py-1.5 text-[9px] uppercase text-[9px]
                                  ${isReturnCard ? "text-orange-700" : "text-black"}`}>
                                  {p.model}
                                </td>
                                <td className={`px-2 py-1.5 text-right font-bold whitespace-nowrap
                                  ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>
                                  {p.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ FOOTER ══ */}
          <div className="shrink-0 border-t border-slate-100 px-3 py-2 bg-white">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {productSummary.length > 0 && (
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {productSummary.map(([name, qty], idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0 cursor-default"
                      title={name}
                    >
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-700 max-w-[70px] sm:max-w-none truncate">
                        {name}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-indigo-600 shrink-0">
                        {qty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto shrink-0"
              >
                {isPage ? "Back" : "Close"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CarRentDetailsModal;