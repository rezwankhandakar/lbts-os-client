
import { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import {
  X, Truck, User, Package, PhoneForwarded, Save, Wallet, Pencil,
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

  useEffect(() => {
    if (selectedRental) {
      setRental(selectedRental);
      setRent(selectedRental.rent      ?? "");
      setLeborBill(selectedRental.leborBill ?? "");
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
        updatedBy: loggedInUser, // ← নতুন
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

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-start md:items-center z-50 p-2 md:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[98vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="p-3 border-b bg-white shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{rental.tripNumber}</h2>
              <div className="h-4 w-[1px] bg-slate-200" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {new Date(rental.createdAt).toDateString()}
              </p>

              {/* Created by */}
              {(rental.currentUser || rental.createdBy) && (
                <>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400">Created:</span>
                    <span className="text-xs font-medium text-slate-600">
                      {rental.currentUser || rental.createdBy}
                    </span>
                  </div>
                </>
              )}

              {/* Updated by — trip info edit হলে */}
              {rental.lastUpdatedBy && (
                <>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <Pencil size={11} className="text-indigo-400" />
                    <span className="text-[10px] text-slate-400">Updated:</span>
                    <span className="text-xs font-medium text-indigo-600">{rental.lastUpdatedBy}</span>
                  </div>
                </>
              )}

              {/* Rent/Lebor saved by — আলাদা field */}
              {rental.rentSavedBy && (
                <>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <Wallet size={11} className="text-emerald-400" />
                    <span className="text-[10px] text-slate-400">Rent by:</span>
                    <span className="text-xs font-medium text-emerald-600">{rental.rentSavedBy}</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-all border border-transparent hover:border-rose-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Stats Bar ── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-3 bg-slate-800 rounded-xl text-white shadow-lg">
            <div className="flex flex-wrap items-center gap-6 border-r border-slate-700 pr-6">
              <div className="flex items-center gap-2.5">
                <Truck size={16} className="text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Vehicle</span>
                  <span className="text-xs font-bold">{rental.vehicleNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-slate-700 pl-6 hidden md:flex">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Package size={18} className="text-indigo-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Vendor</span>
                  <span className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">{rental.vendorName}</span>
                  {rental.vendorNumber && (
                    <span className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                      <PhoneForwarded size={10} className="shrink-0" />
                      <span className="font-bold">{rental.vendorNumber}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <User size={18} className="text-indigo-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Driver</span>
                  <span className="text-sm font-bold text-white leading-tight">{rental.driverName}</span>
                  {rental.driverNumber && (
                    <span className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                      <PhoneForwarded size={10} className="shrink-0" />
                      <span className="font-bold">{rental.driverNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-wider leading-none mb-1">Total Point</p>
                    <p className="text-sm font-black text-emerald-400 leading-none">{normalChallans.length || (rental.totalChallan ?? rental.point)}</p>
                  </div>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg shadow-sm">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-sky-400/80 uppercase tracking-wider leading-none mb-1">Total Products</p>
                    <p className="text-sm font-black text-sky-400 leading-none">{totalProducts}</p>
                  </div>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-orange-300 uppercase font-black tracking-widest leading-none">Advance</span>
                    <span className="text-xs font-black text-orange-300">
                      ৳ {rental.advance != null ? Number(rental.advance).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Rent & Lebor Bill inline edit ── */}
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Rent (৳)</span>
                    <input
                      type="number"
                      value={rent}
                      onChange={e => setRent(e.target.value)}
                      placeholder="—"
                      className="w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center"
                    />
                   
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Lebor Bill (৳)</span>
                    <input
                      type="number"
                      value={leborBill}
                      onChange={e => setLeborBill(e.target.value)}
                      placeholder="—"
                      className="w-24 text-xs font-bold bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 mt-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    <Save size={12} />
                    {saving ? "…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Challan Grid ── */}
        <div className="flex-1 overflow-y-auto p-4">
          {challans.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic">No challans in this trip.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challans.map((c, i) => {
                const isReturnCard = c.isReturn === true;
                return (
                  <div
                    key={i}
                    className={`border rounded-2xl p-4 transition-all duration-200
                      ${isReturnCard
                        ? "bg-orange-50 border-orange-200"
                        : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                      }`}
                  >
                    {isReturnCard && (
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-200">
                        <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-md uppercase tracking-wide">
                          ↩ Return Challan
                        </span>
                        {c.returnedAt && (
                          <span className="text-[10px] text-orange-600 font-semibold">
                            {new Date(c.returnedAt).toLocaleDateString("en-GB")}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 max-w-[60%]">
                        <p className="text-[11px] text-slate-800 font-bold break-words leading-tight">{c.customerName}</p>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md border font-semibold uppercase tracking-wide
                          ${isReturnCard
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          Zone: {c.zone}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          <span className="font-semibold text-slate-600">Address:</span> {c.address}
                        </p>
                        {(c.district || c.thana) && (
                          <p className="text-[11px] text-slate-500 leading-snug">
                            <span className="font-semibold text-slate-600">District:</span> {c.district}
                            {" "}<span className="font-semibold text-slate-600">Thana:</span> {c.thana}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-600 font-semibold">Receiver: {c.receiverNumber}</p>
                        {!isReturnCard && c.note?.trim() && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1 italic">
                            📝 {c.note.length > 60 ? c.note.slice(0, 60) + "…" : c.note}
                          </p>
                        )}
                        {isReturnCard && c.returnNote && (
                          <p className="text-[10px] text-orange-700 bg-orange-100 border border-orange-200 rounded px-2 py-1 mt-1 italic">
                            📝 {c.returnNote}
                          </p>
                        )}
                      </div>

                      {!isReturnCard && (
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide whitespace-nowrap ${getStatusBadge(c.deliveryStatus)}`}>
                            D: {c.deliveryStatus || "Pending"}
                          </span>
                          <span className={`text-[8px] px-2.5 py-[3px] rounded-full font-bold border uppercase tracking-wide whitespace-nowrap ${getStatusBadge(c.challanReturnStatus)}`}>
                            C: {c.challanReturnStatus || "Pending"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={`mt-4 rounded-xl border overflow-hidden
                      ${isReturnCard ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"}`}>
                      <table className="w-full text-[11px]">
                        <thead className={`uppercase text-[10px]
                          ${isReturnCard ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                          <tr>
                            <th className="px-2 py-2 text-left">Product</th>
                            <th className="px-2 py-2 text-left">Model</th>
                            <th className="px-2 py-2 text-right">{isReturnCard ? "Return Qty" : "Qty"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(c.products || []).map((p, idx) => (
                            <tr key={idx} className={`border-b last:border-0
                              ${isReturnCard ? "border-orange-100 hover:bg-orange-100/50" : "border-slate-100 hover:bg-white"}`}>
                              <td className={`px-2 py-1.5 font-semibold ${isReturnCard ? "text-orange-800" : "text-slate-700"}`}>
                                {p.productName}
                              </td>
                              <td className={`px-2 py-1.5 uppercase ${isReturnCard ? "text-orange-700" : "text-slate-600"}`}>
                                {p.model}
                              </td>
                              <td className={`px-2 py-1.5 text-right font-bold ${isReturnCard ? "text-orange-700" : "text-slate-900"}`}>
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

        {/* ── Footer ── */}
        <div className="shrink-0 border-t px-5 py-3 bg-slate-50 flex flex-wrap items-center justify-between gap-3">

          {/* Product Summary */}
          {normalChallans.length > 0 && (() => {
            const productMap = {};
            normalChallans.forEach(c =>
              (c.products || []).forEach(p => {
                const key = p.productName;
                if (!productMap[key]) productMap[key] = { productName: p.productName, quantity: 0 };
                productMap[key].quantity += Number(p.quantity || 0);
              })
            );
            const summary = Object.values(productMap);
            return (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Summary</span>
                </div>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {summary.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-700">{item.productName}</span>
                      <span className="text-[11px] font-black text-indigo-600">{item.quantity} PCS</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center gap-4 text-sm">
            {rental.rent != null && (
              <span className="text-slate-600">
                Rent: <span className="font-bold text-slate-800">৳ {Number(rental.rent).toLocaleString()}</span>
              </span>
            )}
            {rental.leborBill != null && (
              <span className="text-slate-600">
                Lebor Bill: <span className="font-bold text-slate-800">৳ {Number(rental.leborBill).toLocaleString()}</span>
              </span>
            )}
            {rental.rent != null && rental.leborBill != null && (
              <span className="text-slate-600 border-l border-slate-200 pl-4">
                Total: <span className="font-bold text-indigo-700">
                  ৳ {(Number(rental.rent) + Number(rental.leborBill)).toLocaleString()}
                </span>
              </span>
            )}
          </div>

          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CarRentDetailsModal;