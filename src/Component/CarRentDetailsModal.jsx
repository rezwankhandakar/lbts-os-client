import { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded, Save, Wallet, Pencil, ChevronDown,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   CAR RENT DETAILS MODAL
════════════════════════════════════════════════════════════════ */
const CarRentDetailsModal = ({ selectedRental, setSelectedRental, onRentalUpdate, readOnly = false }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const loggedInUser = user?.displayName || user?.email || "Unknown";

  const [rental,    setRental]    = useState(null);
  const [rent,      setRent]      = useState("");
  const [leborBill, setLeborBill] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (selectedRental) {
      setRental(selectedRental);
      setRent(selectedRental.rent      ?? "");
      setLeborBill(selectedRental.leborBill ?? "");
      setStatsOpen(false);
    } else {
      setRental(null);
    }
  }, [selectedRental]);

  const handleClose = () => {
    setRental(null);
    setSelectedRental(null);
  };

  if (!rental) return null;

  const challans       = rental.challans || [];
  const normalChallans = challans.filter(c => !c.isReturn);
  const totalProducts  = normalChallans.reduce((sum, c) =>
    sum + (c.products?.reduce((s, p) => s + Number(p.quantity || 0), 0) || 0), 0);

  const handleSave = async () => {
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
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Saved!", showConfirmButton: false, timer: 1200 });
      }
    } catch {
      Swal.fire("Error", "Failed to save", "error");
    }
    setSaving(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":    return "bg-emerald-100 text-emerald-700";
      case "not_received": return "bg-rose-100 text-rose-700";
      case "call_later":   return "bg-amber-100 text-amber-700";
      case "received":     return "bg-indigo-100 text-indigo-700";
      case "missing":      return "bg-red-100 text-red-700";
      default:             return "bg-slate-100 text-slate-500";
    }
  };

  /* product summary map */
  const productMap = {};
  normalChallans.forEach(c =>
    (c.products || []).forEach(p => {
      if (!productMap[p.productName]) productMap[p.productName] = 0;
      productMap[p.productName] += Number(p.quantity || 0);
    })
  );
  const productSummary = Object.entries(productMap);

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-end sm:items-center z-50 p-0 sm:p-3 md:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* ══ HEADER — single compact dark bar ══ */}
        <div className="shrink-0 bg-slate-800">

          {/* Single compact row */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 cursor-pointer select-none"
            onClick={() => setStatsOpen(o => !o)}
          >
            {/* Left: trip + date + vehicle + driver + pts */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight shrink-0">{rental.tripNumber}</h2>
              <span className="text-[9px] text-slate-400 font-medium shrink-0">
                {new Date(rental.createdAt).toLocaleDateString("en-GB")}
              </span>
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <Truck size={9} className="text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-300 truncate max-w-[55px] sm:max-w-[90px]">{rental.vehicleNumber}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <User size={9} className="text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-300 truncate max-w-[80px]">{rental.driverName}</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-black shrink-0">
                {normalChallans.length || rental.totalChallan || rental.point} Point - {totalProducts} Pics
              </span>
            </div>

            {/* Right: chevron + close */}
            <div className="flex items-center gap-0.5 shrink-0">
              <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${statsOpen ? "rotate-180" : ""}`} />
              <button
                onClick={e => { e.stopPropagation(); handleClose(); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Expanded detail panel */}
          {statsOpen && (
            <div className="border-t border-slate-700 px-3 py-3 space-y-3">

              {/* Vehicle / Vendor / Driver */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Truck size={12} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vehicle</p>
                    <p className="text-[11px] font-bold text-white">{rental.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</p>
                    <p className="text-[11px] font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">{rental.vendorName}</p>
                    {rental.vendorNumber && (
                      <p className="text-[9px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={8} />{rental.vendorNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</p>
                    <p className="text-[11px] font-bold text-white">{rental.driverName}</p>
                    {rental.driverNumber && (
                      <p className="text-[9px] text-indigo-400 flex items-center gap-1"><PhoneForwarded size={8} />{rental.driverNumber}</p>
                    )}
                  </div>
                </div>
                {/* Meta: created/updated by */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                  {(rental.currentUser || rental.createdBy) && (
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <User size={8} />{rental.currentUser || rental.createdBy}
                    </span>
                  )}
                  {rental.lastUpdatedBy && (
                    <span className="text-[9px] text-indigo-400 flex items-center gap-1">
                      <Pencil size={8} />{rental.lastUpdatedBy}
                    </span>
                  )}
                  {rental.rentSavedBy && (
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <Wallet size={8} />{rental.rentSavedBy}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial row: compact chips + edit inputs */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Smart compact chips — Advance / Rent / Lebor / Total */}
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
                    <div key={i} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${chip.bg}`}>
                      <span className="text-[8px] text-slate-500 font-bold leading-none">{chip.l}</span>
                      <span className={`text-[9px] font-black ${chip.color} leading-none`}>৳{chip.v}</span>
                    </div>
                  ))}
                </div>

                {/* Edit inputs (non-readOnly) */}
                {!readOnly && (
                  <div className="flex items-end gap-1.5 flex-wrap ml-auto">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-0.5 pl-0.5">Rent (৳)</span>
                      <input type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="—"
                        className="w-20 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-0.5 pl-0.5">Lebor Bill (৳)</span>
                      <input type="number" value={leborBill} onChange={e => setLeborBill(e.target.value)} placeholder="—"
                        className="w-20 sm:w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center" />
                    </div>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
                      <Save size={11} /> {saving ? "…" : "Save"}
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
                  <div key={i} className={`border rounded-xl p-2.5 sm:p-3 md:p-4 transition-all duration-200
                    ${isReturnCard ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"}`}>

                    {/* Return challan badge */}
                    {isReturnCard && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-orange-200">
                        <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded uppercase">
                          ↩ Return Challan
                        </span>
                        {c.returnedAt && (
                          <span className="text-[10px] text-orange-600 font-semibold">
                            {new Date(c.returnedAt).toLocaleDateString("en-GB")}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      {/* Customer info */}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs text-slate-800 font-bold break-words leading-tight">{c.customerName}</p>
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase
                          ${isReturnCard ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          {c.zone}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-snug truncate">
                          <span className="font-semibold text-slate-600">Addr:</span> {c.address}
                        </p>
                        {(c.district || c.thana) && (
                          <p className="text-[10px] text-slate-500 leading-snug">
                            <span className="font-semibold text-slate-600">{c.district}</span>
                            {c.thana && <span className="text-slate-400"> · {c.thana}</span>}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-600 font-semibold">{c.receiverNumber}</p>
                        {!isReturnCard && c.note?.trim() && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1">
                            📝 {c.note.length > 55 ? c.note.slice(0, 55) + "…" : c.note}
                          </p>
                        )}
                        {isReturnCard && c.returnNote && (
                          <p className="text-[9px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-0.5 mt-1 italic">
                            📝 {c.returnNote}
                          </p>
                        )}
                      </div>

                      {/* Status badges */}
                      {!isReturnCard && (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}>
                            D: {c.deliveryStatus || "Pending"}
                          </span>
                          <span className={`text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border uppercase whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}>
                            C: {c.challanReturnStatus || "Pending"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product table */}
                    <div className={`mt-2 sm:mt-3 rounded-xl border overflow-hidden
                      ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
                      <table className="w-full text-[10px] sm:text-[11px]">
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
                            <tr key={idx} className={`border-b last:border-0
                              ${isReturnCard ? "border-orange-100 hover:bg-orange-100/50" : "border-slate-100 hover:bg-white"}`}>
                              <td className={`px-2 py-1.5 font-semibold truncate max-w-[80px] sm:max-w-none ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>
                                {p.productName}
                              </td>
                              <td className={`px-2 py-1.5 uppercase text-[9px] ${isReturnCard ? "text-orange-700" : "text-slate-600"}`}>
                                {p.model}
                              </td>
                              <td className={`px-2 py-1.5 text-right font-bold whitespace-nowrap ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>
                                {p.quantity} PCS
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
          <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 max-w-[60px] sm:max-w-none truncate">{name}</span>
            <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 shrink-0">{qty}</span>
          </div>
        ))}
      </div>
    )}

    <button
      onClick={handleClose}
      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition ml-auto shrink-0"
    >
      Close
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default CarRentDetailsModal;
