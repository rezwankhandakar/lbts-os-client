import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useRole from "../hooks/useRole";   // gate admin-only Location column / export field
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ChallanActionDropdown from "../Component/ChallanActionDropdown";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import { computeLocation } from "../utils/localAddressMatcher";
import { findRate } from "../utils/rateMatcher";
import { useRateVersion } from "../utils/rateStore";
import { productMatches } from "../utils/gatePassMatch";

const ITEMS_PER_PAGE = 500;
// Sentinel value used inside the MultiSelect dropdowns to represent
// "rows where this column is empty / blank".  Kept as a distinctive
// string so it can't collide with a real data value.
const BLANK_OPTION = "(Blank)";
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Get a challan's `location` value.  Prefer the saved field from DB; if it's
 * missing (older challan created before the auto-compute feature shipped),
 * compute it on the fly from thana + district so the column still shows
 * something useful instead of an empty dash.
 */
const resolveLocation = (c) => {
  if (c?.location) return c.location;
  return computeLocation(c?.thana, c?.district) || null;
};

/**
 * Get a product row's effective `capacity` + `rate` (+ derived `amount`).
 * Same fallback pattern as the Delivered page:
 *   1. Trust the saved DB values when a rate is already present.
 *   2. Otherwise run the local rate-matcher on the fly (needs a resolved
 *      Location) so older challans still show a sensible value instead
 *      of a blank/zero.
 * Admin-only — these fields are never shown to non-admin users.
 */
const resolveProductRate = (c, p) => {
  const savedCap  = p?.capacity;
  const savedRate = Number(p?.rate) || 0;
  const qty       = Number(p?.quantity) || 0;

  if (savedRate > 0) {
    return { capacity: savedCap || "", rate: savedRate, amount: qty * savedRate };
  }

  const loc = resolveLocation(c);
  if (!loc) return { capacity: savedCap || "", rate: 0, amount: 0 };

  const r = findRate({
    productName: p?.productName,
    model: p?.model,
    location: loc,
    capacity: savedCap || "",
  });
  const rate = r.rate || 0;
  return { capacity: r.capacity || savedCap || "", rate, amount: qty * rate };
};

/**
 * Format a challan's createdAt to a stable dd/mm/yyyy label.  Used both
 * as the Date-column filter option value and for matching, so the Date
 * column behaves exactly like the other text columns (MultiSelect with
 * All / Blank), instead of a calendar picker.
 */
const formatDate = (c) =>
  c?.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : null;

/**
 * Render Location as a colour-coded badge.  Reused in desktop table and
 * mobile card.
 */
const LocationBadge = ({ value }) => {
  if (!value) return <span className="text-slate-300">—</span>;
  const cls =
    value === "ISD"        ? "bg-blue-50 text-blue-700 border-blue-200" :
    value === "OSD-Metro"  ? "bg-purple-50 text-purple-700 border-purple-200" :
                             "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border whitespace-nowrap ${cls}`}>
      {value}
    </span>
  );
};

/**
 * GP Match badge — Trip Do বসানোর পর এই product row All-Gate-Pass-এর
 * কোনো gate pass-এর সাথে match করছে কিনা দেখায়।
 *   match  = null   → Trip Do-ই বসানো হয়নি (—)
 *   matched: true   → ✓ Matched   (Trip Do exact + customer/model fuzzy verify)
 *   matched: false  → ✗ No Match  (Trip Do আছে কিন্তু কোনো gate pass মেলেনি)
 */
const GpMatchBadge = ({ match }) => {
  if (!match) return <span className="text-slate-300">—</span>;
  return match.matched ? (
    <span
      title={match.gp ? `Matched gate pass — ${match.gp.customerName}${match.gp.csd ? ` · CSD ${match.gp.csd}` : ""}` : "Matched gate pass"}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black border whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
      ✓ Matched
    </span>
  ) : (
    <span
      title="Trip Do set, but no gate pass matched (Trip Do exact + customer/model verify)"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black border whitespace-nowrap bg-red-50 text-red-600 border-red-200">
      ✗ No Match
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Multi-select dropdown
══════════════════════════════════════════════════════════════ */
const MultiSelect = ({ options, selected, onChange, placeholder = "All", blankLabel = BLANK_OPTION }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Blank sentinel-এর display text column-ভেদে বদলানো যায় (value একই থাকে)।
  // Rate column-এ "(Blank)" এর বদলে "(No rate)" অনেক পরিষ্কার।
  const showOpt = (o) => (o === BLANK_OPTION ? blankLabel : o);
  const filtered = options.filter(o => showOpt(o).toLowerCase().includes(search.toLowerCase()));
  const label    = selected.length === 0 ? placeholder
    : selected.length === 1 ? showOpt(selected[0])
    : selected.length === options.length ? "All"
    : `${selected.length} selected`;
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  // "All" master toggle — selecting it picks every option; unselecting
  // it clears everything.  Considered active only when literally every
  // available option is selected.
  const allSelected = options.length > 0 && selected.length === options.length;
  const toggleAll = () => onChange(allSelected ? [] : [...options]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${
          selected.length > 0
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
        }`}
      >
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && (
            <span className="text-slate-400 hover:text-white px-0.5 cursor-pointer leading-none"
              onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
          )}
          <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
          </svg>
        </span>
      </button>

      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[160px] w-max max-w-[260px] overflow-hidden"
          style={{
            zIndex: 9999,
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
            left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 270) : 0,
          }}>
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto">
            {/* "All" master toggle — always visible (unless searching) */}
            {!search && options.length > 0 && (
              <label
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs font-bold border-b border-slate-100 hover:bg-slate-50 transition-colors ${allSelected ? "bg-orange-50/50 text-orange-600" : "text-slate-600"}`}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3 h-3 accent-orange-500 cursor-pointer flex-shrink-0" />
                <span className="truncate">All</span>
              </label>
            )}
            {filtered.length === 0
              ? <div className="px-3 py-3 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => {
                const isBlank = opt === BLANK_OPTION;
                return (
                <label key={opt}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 transition-colors ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                    className="w-3 h-3 accent-orange-500 cursor-pointer flex-shrink-0" />
                  <span className={`truncate ${isBlank ? "italic text-slate-400" : "text-slate-700"}`}>{showOpt(opt)}</span>
                </label>
                );
              })
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => onChange([])}
                className="w-full text-[10px] text-slate-400 uppercase tracking-widest py-1 hover:text-slate-700 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Remarks — admin-only inline-editable cell.
   Mirrors the CSD inline-edit pattern on the Delivered page: click to
   open a text input, Enter to save, Escape to cancel. Remarks live on
   the challan document (`c.remarks`) and, once this challan is
   dispatched, get snapshotted onto the embedded challan so the
   Delivered page can show them too.
══════════════════════════════════════════════════════════════ */
const RemarksCell = ({ challan, editingRemarks, setEditingRemarks, savingRemarks, onSave }) => {
  const editing = editingRemarks && editingRemarks.challanId === challan._id;
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!editing) {
    const display = challan.remarks || "";
    return (
      <button
        type="button"
        onClick={() => setEditingRemarks({ challanId: challan._id, value: display })}
        title={display ? "Click to edit Remarks" : "Click to set Remarks"}
        className="block w-full text-left truncate hover:bg-purple-50 hover:text-purple-700 px-1 -mx-1 rounded transition-colors text-[11px]"
      >
        {display ? (
          <span className="block truncate font-semibold text-slate-700">{display}</span>
        ) : (
          <span className="text-purple-400 italic">click to set</span>
        )}
      </button>
    );
  }

  const value = editingRemarks.value ?? "";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setEditingRemarks((cur) => ({ ...cur, value: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditingRemarks(null);
          if (e.key === "Enter") onSave(challan, (value || "").trim());
        }}
        disabled={savingRemarks}
        autoComplete="off"
        placeholder="Remarks"
        className="w-full px-1.5 py-0.5 border border-purple-400 rounded text-[11px] outline-none focus:ring-2 focus:ring-purple-300"
      />
      <div className="absolute top-full left-0 mt-0.5 text-[8px] text-slate-400">
        Enter to save · Esc to cancel
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Trip Do cell — Delivered page-এর মতোই inline editable, তবে এখানে
   challans collection-এর ডেটা দেখায়। Trip Do product-লেভেল field
   (এক challan-এর ভিন্ন product-এ ভিন্ন Trip Do হতে পারে), তাই
   editing state challanId + productId দুটো দিয়েই key করা।
   Save হয় shared PATCH /deliveries/bulk-trip-do দিয়ে — সেটা
   challans + deliveries দুই collection-এই লেখে, ফলে এই page আর
   Delivered page সবসময় sync-এ থাকে।
══════════════════════════════════════════════════════════════ */
const TripDoCell = ({ challan, product, editingTripDo, setEditingTripDo, savingTripDo, onSave }) => {
  const editing = editingTripDo &&
    editingTripDo.challanId === challan._id &&
    editingTripDo.productId === product._id;
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!editing) {
    const display = product.tripDo || "";
    return (
      <button
        type="button"
        onClick={() => setEditingTripDo({ challanId: challan._id, productId: product._id, value: display })}
        title={display ? "Click to edit Trip Do" : "Click to set Trip Do"}
        className="block w-full text-left truncate hover:bg-indigo-50 hover:text-indigo-700 px-1 -mx-1 rounded transition-colors text-[11px]"
      >
        {display ? (
          <span className="block truncate font-semibold text-indigo-700">{display}</span>
        ) : (
          <span className="text-indigo-400 italic">click to set</span>
        )}
      </button>
    );
  }

  const value = editingTripDo.value ?? "";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setEditingTripDo((cur) => ({ ...cur, value: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditingTripDo(null);
          if (e.key === "Enter") onSave(challan, product, (value || "").trim());
        }}
        disabled={savingTripDo}
        autoComplete="off"
        placeholder="e.g. 4681835"
        className="w-full px-1.5 py-0.5 border border-indigo-400 rounded text-[11px] outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <div className="absolute top-full left-0 mt-0.5 text-[8px] text-slate-400">
        Enter to save · Esc to cancel
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Status badge
══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  if (status === "delivered" || status === "re-delivered") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap ${
        status === "re-delivered"
          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
          : "bg-emerald-100 text-emerald-700 border-emerald-200"
      }`}>
        {status === "re-delivered" ? "↻ Re-Delivered" : "✓ Delivered"}
      </span>
    );
  }
  if (status === "return-pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 whitespace-nowrap">
        ↩ Return-Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-200 whitespace-nowrap">
      ● Pending
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   Mobile card
══════════════════════════════════════════════════════════════ */
const MobileCard = ({ c, p, axiosSecure, refetchChallans, isAdmin, gpMatch, onSplit }) => {
  // Admin-only Remarks edit — a lightweight SweetAlert prompt instead of a
  // full inline text field, since the mobile card doesn't otherwise carry
  // any editable state. Saves straight to the challan document; the
  // Delivered page will pick this up once the challan is dispatched.
  const handleEditRemarks = async () => {
    const { value, isDismissed } = await Swal.fire({
      title: "Set Remarks",
      input: "text",
      inputValue: c.remarks || "",
      inputPlaceholder: "Remarks — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Save",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;
    try {
      await axiosSecure.patch(`/challans/bulk-remarks`, { remarks: (value || "").trim(), challanIds: [c._id] });
      if (typeof refetchChallans === "function") refetchChallans();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Remarks saved", showConfirmButton: false, timer: 1300 });
    } catch (err) {
      console.error("remarks save failed", err);
      Swal.fire("Error", "Failed to save remarks", "error");
    }
  };

  // Admin-only Trip Do edit — Remarks-এর মতোই Swal prompt। Shared
  // bulk-trip-do endpoint challans + deliveries দুটোতেই লেখে, তাই
  // Delivered page সাথে সাথে sync হয়।
  const handleEditTripDo = async () => {
    const { value, isDismissed } = await Swal.fire({
      title: "Set Trip Do",
      input: "text",
      inputValue: p.tripDo || "",
      inputPlaceholder: "e.g. 4681835 — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Save",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;
    try {
      await axiosSecure.patch(`/deliveries/bulk-trip-do`, {
        tripDo: (value || "").trim(),
        targets: [{ challanId: c._id, productId: p._id }],
      });
      if (typeof refetchChallans === "function") refetchChallans();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: (value || "").trim() ? "Trip Do saved" : "Trip Do cleared", showConfirmButton: false, timer: 1300 });
    } catch (err) {
      console.error("trip do save failed", err);
      Swal.fire("Error", err?.response?.status === 403 ? "Only admins can edit Trip Do" : "Failed to save Trip Do", "error");
    }
  };

  return (
    <div className={`border rounded-xl p-3 mb-2 shadow-sm ${(c.status === "delivered" || c.status === "re-delivered") ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}</span>
          {c.tripNumber && (
            <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0.5">{c.tripNumber}</span>
          )}
          <StatusBadge status={c.status} />
        </div>
        <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} refetchChallans={refetchChallans} />
      </div>
      <p className="text-xs font-bold text-slate-800 mb-1">{c.customerName}</p>
      <div className="truncate gap-x-3 gap-y-0.5 text-[10px] text-black mb-2">
        <span className="max-w-[140px]">{c.address}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-black mb-2">
        <span><span className="text-orange-600 font-semibold">Thana: </span>{c.thana || "—"}</span>
        <span><span className="text-orange-600 font-semibold">Dist: </span>{c.district || "—"}</span>
        {isAdmin && (
          <span className="inline-flex items-center gap-1"><span className="text-orange-600 font-semibold">Loc: </span><LocationBadge value={resolveLocation(c)} /></span>
        )}
        <span><span className="text-orange-600 font-semibold">Zone: </span>{c.zone}</span>
        <span><span className="text-orange-600 font-semibold">Ph: </span>{c.receiverNumber}</span>
      </div>
      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-slate-800">{p.productName || "—"}</span>
          <span className="text-[9px] text-black ml-1.5">{p.model?.toUpperCase()}</span>
        </div>
        <div className="ml-2 flex-shrink-0 inline-flex items-center gap-1">
          <span className="text-xs font-black text-slate-800">{p.quantity}</span>
          {isAdmin && p._id && Number(p.quantity) > 1 && onSplit && (
            <button
              type="button"
              onClick={() => onSplit(c, p)}
              title="Split this row by qty"
              className="inline-flex items-center justify-center w-5 h-5 rounded border border-sky-200 text-sky-600 active:bg-sky-500 active:text-white transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"/>
                <circle cx="18" cy="6" r="3"/>
                <circle cx="6" cy="18" r="3"/>
                <path d="M18 9a9 9 0 0 1-9 9"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      {isAdmin && (() => {
        const eff = resolveProductRate(c, p);
        return (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-black mt-2">
            <span><span className="text-emerald-600 font-semibold">Rate: </span>{eff.rate ? `৳${eff.rate}` : "—"}</span>
            <span><span className="text-emerald-600 font-semibold">Amount: </span>{eff.amount ? `৳${eff.amount.toLocaleString()}` : "—"}</span>
            <span><span className="text-emerald-600 font-semibold">Capacity: </span>{eff.capacity || "—"}</span>
          </div>
        );
      })()}
      {isAdmin && (
        <button
          type="button"
          onClick={handleEditTripDo}
          title={p.tripDo ? "Click to edit Trip Do" : "Click to set Trip Do"}
          className="mt-2 w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors text-left"
        >
          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide shrink-0">Trip Do</span>
          {p.tripDo ? (
            <span className="text-[10px] font-semibold text-indigo-700 truncate">{p.tripDo}</span>
          ) : (
            <span className="text-[10px] text-indigo-400 italic">click to set</span>
          )}
        </button>
      )}
      {/* GP Match — Trip Do বসানো থাকলেই দেখানো হয় */}
      {isAdmin && p.tripDo && (
        <div className="mt-1.5 flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide shrink-0">GP Match</span>
          <GpMatchBadge match={gpMatch} />
        </div>
      )}
      {isAdmin && (
        <button
          type="button"
          onClick={handleEditRemarks}
          title={c.remarks ? "Click to edit Remarks" : "Click to set Remarks"}
          className="mt-2 w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-lg transition-colors text-left"
        >
          <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wide shrink-0">Remarks</span>
          {c.remarks ? (
            <span className="text-[10px] font-semibold text-purple-700 truncate">{c.remarks}</span>
          ) : (
            <span className="text-[10px] text-purple-400 italic">click to set</span>
          )}
        </button>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Mobile filter bottom sheet
══════════════════════════════════════════════════════════════ */
const MobileFilterSheet = ({ onClose, getOptionsFor,
  customerFilter, setCustomerFilter, addressFilter, setAddressFilter,
  thanaFilter, setThanaFilter, districtFilter, setDistrictFilter,
  locationFilter, setLocationFilter,
  receiverFilter, setReceiverFilter, zoneFilter, setZoneFilter,
  productNameFilter, setProductNameFilter, modelFilter, setModelFilter,
  remarksFilter, setRemarksFilter, rateFilter, setRateFilter,
  capacityFilter, setCapacityFilter, csdFilter, setCsdFilter, unitFilter, setUnitFilter,
  dateFilter, setDateFilter, tripNumberFilter, setTripNumberFilter, statusFilter, setStatusFilter, setClientPage,
  isAdmin }) => {

  const setF = setter => val => { setter(val); setClientPage(1); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Filters</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Date</p>
              <MultiSelect options={getOptionsFor("date")} selected={dateFilter} onChange={setF(setDateFilter)} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Trip No</p>
              <MultiSelect options={getOptionsFor("tripNumber")} selected={tripNumberFilter} onChange={setF(setTripNumberFilter)} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Status</p>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 outline-none bg-white focus:border-orange-400">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="return-pending">Return-Pending</option>
                <option value="delivered">Delivered</option>
                <option value="re-delivered">Re-Delivered</option>
              </select>
            </div>
            {[
              { label: "Customer", opts: "customerName",   sel: customerFilter,    set: setCustomerFilter },
              { label: "Address",  opts: "address",        sel: addressFilter,     set: setAddressFilter },
              { label: "Thana",    opts: "thana",          sel: thanaFilter,       set: setThanaFilter },
              { label: "District", opts: "district",       sel: districtFilter,    set: setDistrictFilter },
              { label: "Location", opts: "location",       sel: locationFilter,    set: setLocationFilter, adminOnly: true },
              { label: "Receiver", opts: "receiverNumber", sel: receiverFilter,    set: setReceiverFilter },
              { label: "Zone",     opts: "zone",           sel: zoneFilter,        set: setZoneFilter },
              { label: "Product",  opts: "productName",    sel: productNameFilter, set: setProductNameFilter },
              { label: "Model",    opts: "model",          sel: modelFilter,       set: setModelFilter },
              { label: "Rate",     opts: "rate",           sel: rateFilter,        set: setRateFilter,     adminOnly: true, blankLabel: "(No rate)" },
              { label: "Capacity", opts: "capacity",       sel: capacityFilter,    set: setCapacityFilter, adminOnly: true, blankLabel: "(No capacity)" },
              { label: "CSD",      opts: "csd",            sel: csdFilter,         set: setCsdFilter,      adminOnly: true, blankLabel: "(No CSD)" },
              { label: "Unit",     opts: "unit",           sel: unitFilter,        set: setUnitFilter,     adminOnly: true, blankLabel: "(No unit)" },
              { label: "Remarks",  opts: "remarks",        sel: remarksFilter,     set: setRemarksFilter, adminOnly: true },
            ]
              .filter(f => isAdmin || !f.adminOnly)
              .map((f, i) => (
              <div key={i}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">{f.label}</p>
                <MultiSelect options={getOptionsFor(f.opts)} selected={f.sel} onChange={setF(f.set)}
                  blankLabel={f.blankLabel || BLANK_OPTION} />
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white text-sm rounded-xl font-bold">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const AllChallan = () => {
  const axiosSecure = useAxiosSecure();
  // Admin-only:
  //   - Location column in desktop table (header, filter row, body cell)
  //   - Location row in mobile filter sheet
  //   - Loc badge in mobile card
  //   - Location field in Excel export
  // Non-admin users still get a full functional page, just without that
  // column.  While role is loading we default to non-admin (safer to
  // briefly hide than briefly show).
  const { role, isLoading: roleLoading } = useRole();
  const isAdmin = !roleLoading && role === "admin";

  const [challans,          setChallans]          = useState([]);
  const [loading,           setLoading]           = useState(false);

  /**
   * Rate overrides (Product Rates page থেকে যোগ করা product/model) load
   * বা বদল হলে এই version bump হয় — এটা না থাকলে override গুলো আসার পর
   * page re-render হতো না, আর নতুন product-এর rate "—" দেখাত যতক্ষণ
   * অন্য কোনো কারণে render না হয়।
   */
  const rateVersion = useRateVersion();

  /**
   * effOf(c, p) — resolveProductRate() এর memoised মোড়ক।
   * Rate filter, Amount total আর ৫০০টা visible row — সবই একই হিসাব চায়,
   * আর rate resolve না থাকলে findRate() পুরো table scan করে। তাই প্রতি
   * (challan, product) জোড়ার জন্য একবারই হিসাব করে ধরে রাখি।
   * challans refetch হলে বা rate override বদলালে cache আপনিই ফেলে যায়।
   */
  const effOf = React.useMemo(() => {
    const cache = new Map();
    return (c, p) => {
      const key = `${c?._id || ""}|${p?._id || ""}`;
      // _id ছাড়া row (খুব পুরনো data) — cache করা যাবে না, সরাসরি হিসাব
      if (key === "|") return resolveProductRate(c, p);
      let hit = cache.get(key);
      if (!hit) { hit = resolveProductRate(c, p); cache.set(key, hit); }
      return hit;
    };
  }, [challans, rateVersion]);
  const [clientPage,        setClientPage]        = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile,          setIsMobile]          = useState(false);

  const { searchText, setSearchText } = useSearch();

  const [customerFilter,    setCustomerFilter]    = useState([]);
  const [addressFilter,     setAddressFilter]     = useState([]);
  const [thanaFilter,       setThanaFilter]       = useState([]);
  const [districtFilter,    setDistrictFilter]    = useState([]);
  const [locationFilter,    setLocationFilter]    = useState([]);   // NEW: Location column filter
  const [receiverFilter,    setReceiverFilter]    = useState([]);
  const [zoneFilter,        setZoneFilter]        = useState([]);
  const [modelFilter,       setModelFilter]       = useState([]);
  const [productNameFilter, setProductNameFilter] = useState([]);
  const [remarksFilter,     setRemarksFilter]     = useState([]);   // NEW: Remarks column filter (admin-only)
  const [rateFilter,        setRateFilter]        = useState([]);   // NEW: Rate column filter (admin-only, derived value)
  // NEW: Capacity / CSD / Unit column filters (admin-only)
  //   capacity — derived (effOf), CSD/Unit — challan-level stored fields
  const [capacityFilter,    setCapacityFilter]    = useState([]);
  const [csdFilter,         setCsdFilter]         = useState([]);
  const [unitFilter,        setUnitFilter]        = useState([]);
  const [dateFilter,        setDateFilter]        = useState([]);
  const [tripNumberFilter,  setTripNumberFilter]  = useState([]);   // NEW: Trip Number column filter
  const [statusFilter,      setStatusFilter]      = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  // Remarks inline-edit state — admin-only. Remarks are challan-level (one
  // value per challan, shared across that challan's product rows), so the
  // open editor is keyed by challanId only, mirroring the CSD cell pattern
  // on the Delivered page.
  const [editingRemarks, setEditingRemarks] = useState(null);   // { challanId, value }
  const [savingRemarks,  setSavingRemarks]  = useState(false);

  // Trip Do — product-লেভেল inline edit state (Delivered page-এর মতোই)
  const [editingTripDo, setEditingTripDo] = useState(null);     // { challanId, productId, value }
  const [savingTripDo,  setSavingTripDo]  = useState(false);
  const [tripDoFilter,  setTripDoFilter]  = useState([]);       // Trip Do column filter (admin-only)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const setFilter = setter => val => { setter(val); setClientPage(1); };

  const debounceRef = useRef(null);
  const fetchSeqRef = useRef(0);

  // current month/year/search ref — window focus এ use হয়
  const monthRef  = useRef(month);
  const yearRef   = useRef(year);
  const searchRef = useRef(searchText);
  useEffect(() => { monthRef.current  = month;      }, [month]);
  useEffect(() => { yearRef.current   = year;       }, [year]);
  useEffect(() => { searchRef.current = searchText; }, [searchText]);

  const fetchChallans = React.useCallback(async (m, y, search) => {
    // Race guard — পুরনো slow response নতুন result overwrite করতে পারবে না
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    try {
      const url = search
        ? `/challans?search=${encodeURIComponent(search)}`
        : `/challans?month=${m}&year=${y}`;
      const res = await axiosSecure.get(url);
      if (seq !== fetchSeqRef.current) return; // stale
      setChallans(res.data.data || []);
    } catch (err) { if (seq === fetchSeqRef.current) console.error(err); }
    if (seq === fetchSeqRef.current) setLoading(false);
  }, [axiosSecure]);

  // month / year / search change হলে re-fetch
  useEffect(() => {
    setClientPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchChallans(month, year, searchText);
    }, searchText ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [month, year, searchText, fetchChallans]);

  // নতুন challan add করে ফিরে আসলে (window focus) re-fetch
  useEffect(() => {
    const onFocus = () => fetchChallans(monthRef.current, yearRef.current, searchRef.current);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchChallans]);

  // edit / delete এর পরে re-fetch করার callback — children-এ পাঠানো হবে
  const refetchChallans = React.useCallback(() => {
    fetchChallans(monthRef.current, yearRef.current, searchRef.current);
  }, [fetchChallans]);

  /* ── GP Match — Trip Do বসানো product গুলো All-Gate-Pass-এর সাথে
     মিলছে কিনা। All-Gate-Pass page যেভাবে challans/by-trip-do দিয়ে
     উল্টোদিক থেকে match করে, এখানে ঠিক তার আয়না: visible challan-দের
     সব Trip Do এক request-এ /gate-pass/by-trip-do তে পাঠিয়ে gate pass
     গুলো আনা হয়, তারপর একই fuzzy engine (productMatches: Trip Do
     exact + customer + model verify) দিয়ে প্রতিটা row যাচাই হয়। ── */
  const [linkedGatePasses, setLinkedGatePasses] = useState([]);
  const [gpMatchFilter,    setGpMatchFilter]    = useState("");   // "" | matched | unmatched

  useEffect(() => {
    if (!isAdmin) { setLinkedGatePasses([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const tripDos = [...new Set(
          challans.flatMap(c => (c.products || []).map(p => String(p.tripDo ?? "").trim()).filter(Boolean))
        )];
        if (tripDos.length === 0) { if (!cancelled) setLinkedGatePasses([]); return; }
        const res = await axiosSecure.post("/gate-pass/by-trip-do", { tripDos });
        if (!cancelled) setLinkedGatePasses(res.data?.data || []);
      } catch (err) {
        if (!cancelled) { setLinkedGatePasses([]); console.error("gate-pass linkage failed", err); }
      }
    })();
    return () => { cancelled = true; };
  }, [challans, axiosSecure, isAdmin]);

  // tripDo → gate pass list index (দ্রুত lookup)
  const gpByDo = React.useMemo(() => {
    const map = new Map();
    for (const gp of linkedGatePasses) {
      const key = String(gp.tripDo ?? "").trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(gp);
    }
    return map;
  }, [linkedGatePasses]);

  /** null → Trip Do নেই; নাহলে { matched, gp } */
  const getGpMatch = React.useCallback((c, p) => {
    const tripDo = String(p?.tripDo ?? "").trim();
    if (!tripDo) return null;
    const candidates = gpByDo.get(tripDo) || [];
    for (const gp of candidates) {
      for (const gpProduct of (gp.products || [])) {
        if (productMatches(gp, gpProduct, c, p)) return { matched: true, gp };
      }
    }
    return { matched: false, gp: null };
  }, [gpByDo]);

  /**
   * Save an inline Remarks edit for a challan. Admin-only. Uses the shared
   * bulk endpoint with a single target (same pattern as Trip Do on the
   * Delivered page) so the challans collection AND any already-embedded
   * delivery copy stay in sync.
   */
  const saveRemarks = React.useCallback(async (challan, newValue) => {
    setSavingRemarks(true);
    try {
      const clean = (newValue ?? "").toString().trim();
      await axiosSecure.patch(`/challans/bulk-remarks`, { remarks: clean, challanIds: [challan._id] });
      await fetchChallans(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: clean ? "Remarks saved" : "Remarks cleared",
        showConfirmButton: false, timer: 1300,
      });
    } catch (err) {
      console.error("remarks save failed", err);
      Swal.fire("Error", "Failed to save remarks", "error");
    } finally {
      setSavingRemarks(false);
      setEditingRemarks(null);
    }
  }, [axiosSecure, fetchChallans]);

  /**
   * Save an inline Trip Do edit. Trip Do is product-level. Uses the shared
   * PATCH /deliveries/bulk-trip-do endpoint with a single target — the
   * endpoint writes to BOTH the challans collection (this page) and the
   * deliveries collection (Delivered page), so the two pages stay in
   * sync automatically whichever side the entry is made from.
   */
  const saveTripDo = React.useCallback(async (challan, product, newValue) => {
    setSavingTripDo(true);
    try {
      const clean = (newValue ?? "").toString().trim();
      await axiosSecure.patch(`/deliveries/bulk-trip-do`, {
        tripDo: clean,
        targets: [{ challanId: challan._id, productId: product._id }],
      });
      await fetchChallans(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: clean ? `Trip Do set to ${clean}` : "Trip Do cleared",
        showConfirmButton: false, timer: 1300,
      });
    } catch (err) {
      console.error("trip do save failed", err);
      const msg = err?.response?.status === 403 ? "Only admins can edit Trip Do" : "Failed to save Trip Do";
      Swal.fire("Error", msg, "error");
    } finally {
      setSavingTripDo(false);
      setEditingTripDo(null);
    }
  }, [axiosSecure, fetchChallans]);

  /**
   * Bulk Remarks button handler lives further below, after `filteredRows`
   * is declared (it needs to read the currently-filtered rows).
   */

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear()); setClientPage(1);
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setAddressFilter([]); setThanaFilter([]);
    setDistrictFilter([]); setLocationFilter([]); setReceiverFilter([]); setZoneFilter([]);
    setModelFilter([]); setProductNameFilter([]); setRemarksFilter([]); setDateFilter([]); setTripNumberFilter([]); setStatusFilter(""); setTripDoFilter([]); setGpMatchFilter(""); setRateFilter([]);
    setCapacityFilter([]); setCsdFilter([]); setUnitFilter([]);
    setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const rowMatchesAll = React.useCallback((c, p, excludeField = null) => {
    const s = searchText?.toLowerCase() || "";
    const cLocation = resolveLocation(c);    // DB value or computed fallback
    const matchesSearch = !searchText || [
      c.customerName, c.address, c.thana, c.district, cLocation,
      c.receiverNumber, c.zone, c.currentUser, c.remarks, p.productName, p.model
    ].some(v => v?.toLowerCase().includes(s));
    // Generic column check.  Supports the special "(Blank)" sentinel:
    // when selected, it matches rows whose value is empty/missing.  A
    // real value matches when it case-insensitively equals a non-blank
    // selected option.
    const check = (field, filter, val) => {
      if (field === excludeField || filter.length === 0) return true;
      const isEmpty = !val || !val.toString().trim();
      return filter.some(f =>
        f === BLANK_OPTION
          ? isEmpty
          : !isEmpty && val.toString().toLowerCase() === f.toLowerCase()
      );
    };
    const matchesStatus = !statusFilter ||
      (statusFilter === "pending"        && (!c.status || c.status === "pending")) ||
      (statusFilter === "return-pending" && c.status === "return-pending") ||
      (statusFilter === "delivered"      && c.status === "delivered") ||
      (statusFilter === "re-delivered"   && c.status === "re-delivered");
    return matchesSearch && matchesStatus &&
      check("date",           dateFilter,        formatDate(c)) &&
      check("tripNumber",     tripNumberFilter,  c.tripNumber) &&
      check("customerName",   customerFilter,    c.customerName) &&
      check("address",        addressFilter,     c.address) &&
      check("thana",          thanaFilter,       c.thana) &&
      check("district",       districtFilter,    c.district) &&
      check("location",       locationFilter,    cLocation) &&
      check("receiverNumber", receiverFilter,    c.receiverNumber) &&
      check("zone",           zoneFilter,        c.zone) &&
      check("productName",    productNameFilter, p.productName) &&
      check("model",          modelFilter,       p.model) &&
      check("tripDo",         tripDoFilter,      p.tripDo) &&
      check("remarks",        remarksFilter,     c.remarks) &&
      // CSD / Unit — challan-level fields (Gate Pass Inventory sync থেকে আসে)
      check("csd",            csdFilter,         c.csd) &&
      check("unit",           unitFilter,        c.unit) &&
      // Capacity — Rate-এর মতোই DERIVED column (product-এ saved value, নাহলে
      // rate-matcher থেকে resolve হয়)। খালি হলে "(No capacity)" option ওই
      // rows গুলো ধরে — কোন product/model-এর capacity বসেনি সেটা বের করতে।
      (capacityFilter.length === 0 || check("capacity", capacityFilter, effOf(c, p).capacity)) &&
      // Rate is a DERIVED column (saved value, or resolved live by the
      // rate-matcher), so we compute it here rather than reading a field.
      // resolveProductRate() returns 0 when nothing matched — 0 is falsy,
      // so `check` treats it as blank and the "(No rate)" option catches
      // exactly those rows. সেটাই আসল কাজের filter: কোন product/model-এর
      // rate বসেনি সেটা বের করে Product Rates page-এ যোগ করা যায়।
      // resolveProductRate খুব হালকা (একটা table lookup), তাই এখানে
      // call করা নিরাপদ — কিন্তু filter খালি থাকলে হিসাবই করি না।
      (rateFilter.length === 0 || check("rate", rateFilter, effOf(c, p).rate));
  }, [searchText, statusFilter, customerFilter, addressFilter, thanaFilter, districtFilter, locationFilter,
      receiverFilter, zoneFilter, productNameFilter, modelFilter, remarksFilter, dateFilter, tripNumberFilter,
      tripDoFilter, rateFilter, capacityFilter, csdFilter, unitFilter, effOf]);

  const filteredRows = React.useMemo(
    () => challans
      .flatMap(c => (c.products || []).filter(p => rowMatchesAll(c, p)).map(p => ({ c, p })))
      .filter(({ c, p }) => {
        // GP Match filter (admin-only column) — "matched"/"unmatched"
        // শুধু Trip Do বসানো rows-এর মধ্যে থেকে বাছাই করে।
        if (!gpMatchFilter) return true;
        const m = getGpMatch(c, p);
        if (!m) return false;
        return gpMatchFilter === "matched" ? m.matched : !m.matched;
      }),
    [challans, rowMatchesAll, gpMatchFilter, getGpMatch]
  );
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = React.useMemo(
    () => filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE),
    [filteredRows, clientPage]
  );
  // Filter দিয়ে page সংখ্যা কমে গেলে বড় page-এ আটকে খালি টেবিল দেখাত
  useEffect(() => {
    if (totalPages > 0 && clientPage > totalPages) setClientPage(totalPages);
  }, [totalPages, clientPage]);
  const totalQtyAll = React.useMemo(
    () => filteredRows.reduce((sum, { p }) => sum + (Number(p.quantity) || 0), 0),
    [filteredRows]
  );
  // Admin-only running total shown in the Amount filter-row cell.
  const totalAmountAll = React.useMemo(
    () => filteredRows.reduce((sum, { c, p }) => sum + effOf(c, p).amount, 0),
    [filteredRows, effOf]
  );

  /**
   * Bulk Remarks — stamps one Remarks value onto every challan currently
   * shown by the active filters. Mirrors the Bulk CSD button on the
   * Delivered page. Empty value clears Remarks on those challans.
   */
  const handleBulkRemarks = React.useCallback(async () => {
    if (filteredRows.length === 0) {
      Swal.fire({ icon: "info", title: "No rows", text: "Apply filters first or load data." });
      return;
    }

    const seen = new Set();
    const challanIds = [];
    for (const { c } of filteredRows) {
      if (!c._id || seen.has(c._id)) continue;
      seen.add(c._id);
      challanIds.push(c._id);
    }

    const { value, isDismissed } = await Swal.fire({
      title: `Set Remarks for ${challanIds.length} challan${challanIds.length > 1 ? "s" : ""}`,
      input: "text",
      inputLabel: "Remarks",
      inputPlaceholder: "Type Remarks — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Apply to all",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;

    try {
      const res = await axiosSecure.patch("/challans/bulk-remarks", {
        remarks: value || "",
        challanIds,
      });
      await fetchChallans(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: value
          ? `Remarks "${value}" applied to ${res.data?.touched ?? challanIds.length} challans`
          : `Remarks cleared on ${res.data?.touched ?? challanIds.length} challans`,
        showConfirmButton: false, timer: 2000,
      });
    } catch (err) {
      console.error("bulk remarks failed", err);
      Swal.fire("Error", "Bulk Remarks failed", "error");
    }
  }, [axiosSecure, fetchChallans, filteredRows]);

  /**
   * Bulk Trip Do — Delivered page-এর মতোই: active filter-এ যে rows
   * দেখা যাচ্ছে, তার প্রতিটা product-এ এক Trip Do value বসায়। ফাঁকা
   * value দিলে clear হয়। Shared endpoint দুই collection-এই লেখে,
   * তাই Delivered page-ও সাথে সাথে sync হয়ে যায়।
   */
  const handleBulkTripDo = React.useCallback(async () => {
    if (filteredRows.length === 0) {
      Swal.fire({ icon: "info", title: "No rows", text: "Apply filters first or load data." });
      return;
    }

    // De-duplicate per (challanId, productId)
    const seen = new Set();
    const targets = [];
    for (const { c, p } of filteredRows) {
      if (!c._id || !p._id) continue;
      const key = `${c._id}|${p._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      targets.push({ challanId: c._id, productId: p._id });
    }

    const { value, isDismissed } = await Swal.fire({
      title: `Set Trip Do for ${targets.length} row${targets.length > 1 ? "s" : ""}`,
      input: "text",
      inputLabel: "Trip Do number",
      inputPlaceholder: "e.g. 4681835 — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Apply to all",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;

    try {
      const res = await axiosSecure.patch("/deliveries/bulk-trip-do", {
        tripDo: value || "",
        targets,
      });
      await fetchChallans(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: value
          ? `Trip Do "${value}" applied to ${res.data?.touched ?? targets.length} rows`
          : `Trip Do cleared on ${res.data?.touched ?? targets.length} rows`,
        showConfirmButton: false, timer: 2000,
      });
    } catch (err) {
      console.error("bulk trip-do failed", err);
      const msg = err?.response?.status === 403 ? "Only admins can edit Trip Do" : "Bulk Trip Do failed";
      Swal.fire("Error", msg, "error");
    }
  }, [axiosSecure, fetchChallans, filteredRows]);

  /**
   * Split a product row by quantity — Delivered page-এর হুবহু একই feature,
   * শুধু এখানে source of truth canonical `challans` collection।
   *
   * কেন দরকার: qty 2-এর একটা row-এর অর্ধেকে আলাদা Trip Do বসাতে হলে আগে
   * challan dispatch হয়ে Delivered page-এ যাওয়া পর্যন্ত অপেক্ষা করতে হতো।
   * এখন pending অবস্থাতেই All-Challan থেকেই ভাগ করা যায়।
   *
   * `splitQty` unit নতুন একটা row-এ চলে যায় — একই product/model/capacity/
   * rate, নতুন _id, কিন্তু Trip Do ছাড়া — আর original row-এর qty ঠিক
   * ততটাই কমে। এরপর দুটো row-এ আলাদা Trip Do বসানো যায়।
   *
   * Guards (server-এও একই check আছে, এটা শুধু আগেভাগে বলে দেওয়া):
   *   - qty > 1 না হলে ভাগ করার কিছু নেই
   *   - splitQty অবশ্যই 1 থেকে (qty - 1); original row কখনো 0 হবে না
   *     (সেটা delete, split নয়)
   */
  const splitProductRow = React.useCallback(async (challan, product) => {
    const currentQty = Number(product.quantity) || 0;
    if (currentQty <= 1) {
      Swal.fire({ icon: "info", title: "Nothing to split", text: "This row only has 1 qty." });
      return;
    }

    const { value, isDismissed } = await Swal.fire({
      title: `Split row (qty ${currentQty})`,
      html:
        `<div style="font-size:13px;color:#475569;margin-bottom:10px;">` +
        `Enter the quantity to peel off into a new row. ` +
        `The new row will be a copy of this product with no Trip Do, ` +
        `so you can set a different Trip Do on it.` +
        `</div>` +
        `<div style="font-size:12px;color:#64748b;">` +
        `Allowed: 1 to ${currentQty - 1}` +
        `</div>`,
      input: "number",
      inputValue: 1,
      inputAttributes: { min: 1, max: currentQty - 1, step: 1 },
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      confirmButtonText: "Split",
      inputValidator: (v) => {
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0) return "Must be a positive integer";
        if (n >= currentQty) return `Must be less than ${currentQty} (original row must keep at least 1)`;
        return null;
      },
    });
    if (isDismissed) return;

    const splitQty = Number(value);

    try {
      const res = await axiosSecure.post("/challans/split-product", {
        challanId: challan._id,
        productId: product._id,
        splitQty,
      });
      await fetchChallans(monthRef.current, yearRef.current, searchRef.current);
      // Challan ইতিমধ্যে dispatch হয়ে থাকলে server trip-এর embedded copy-ও
      // ভাগ করে দেয় — কয়টা trip sync হলো সেটা জানিয়ে দিই, নাহলে user
      // বুঝবে না Delivered page-ও বদলে গেছে।
      const synced = Number(res?.data?.syncedTrips) || 0;
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: `Split: ${currentQty} → ${currentQty - splitQty} + ${splitQty}`,
        text: synced > 0 ? `${synced} trip${synced > 1 ? "s" : ""} also updated` : undefined,
        showConfirmButton: false, timer: 2000,
      });
    } catch (err) {
      console.error("split-product failed", err);
      const msg = err?.response?.status === 403
        ? "Only admins can split rows"
        : err?.response?.data?.message || "Failed to split row";
      Swal.fire("Error", msg, "error");
    }
  }, [axiosSecure, fetchChallans]);

  const getOptionsFor = React.useCallback((field) => {
    const map = new Map();
    let hasBlank = false;
    challans.forEach(c => {
      (c.products || []).forEach(p => {
        if (!rowMatchesAll(c, p, field)) return;
        let val;
        if (field === "productName" || field === "model") val = p[field]?.toString().trim();
        else if (field === "tripDo") val = p.tripDo?.toString().trim();
        else if (field === "location") val = resolveLocation(c);    // fall back to compute for older challans
        else if (field === "date") val = formatDate(c);
        // Rate — derived, not a stored field.  0 falls through to the
        // blank bucket below, which becomes the "(No rate)" option.
        else if (field === "rate") { const r = effOf(c, p).rate; val = r ? String(r) : ""; }
        // Capacity — rate-এর মতোই derived; খালি হলে blank bucket-এ পড়ে
        // এবং "(No capacity)" option হিসেবে দেখা যায়।
        else if (field === "capacity") val = effOf(c, p).capacity?.toString().trim();
        // CSD / Unit — table cell গুলো uppercase-এ দেখায়, dropdown-ও তাই
        // uppercase দেখাবে যাতে মিলিয়ে পড়তে সুবিধা হয়। check() case-
        // insensitive, তাই filter matching-এ কোনো প্রভাব নেই।
        else if (field === "csd" || field === "unit") val = c[field]?.toString().trim().toUpperCase();
        else val = c[field]?.toString().trim();
        if (val) {
          if (!map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        } else {
          hasBlank = true;   // some row has an empty value for this column
        }
      });
    });
    const sorted = Array.from(map.values()).sort((a, b) => {
      // Date column: newest first (parse dd/mm/yyyy).  Others: alphabetical.
      if (field === "date") {
        const toTs = (d) => { const [dd, mm, yy] = d.split("/"); return new Date(`${yy}-${mm}-${dd}`).getTime(); };
        return toTs(b) - toTs(a);
      }
      // Rate column: numeric ascending — নাহলে "1050" আসত "650"-এর আগে
      if (field === "rate") return Number(a) - Number(b);
      // Capacity: "20 AH", "100 AH", "12V" — সংখ্যা ধরে natural sort, নাহলে
      // alphabetical-এ "100 AH" চলে আসত "20 AH"-র আগে।
      if (field === "capacity") {
        const num = (s) => { const m = String(s).match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
        const na = num(a), nb = num(b);
        if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
        return a.localeCompare(b);
      }
      return a.localeCompare(b);
    });
    // Blank option goes last so real values stay easy to scan.
    if (hasBlank) sorted.push(BLANK_OPTION);
    return sorted;
  }, [challans, rowMatchesAll, effOf]);

  const activeFilterGroups = [
    { label: "Date",     values: dateFilter,        clear: () => { setDateFilter([]);        setClientPage(1); } },
    { label: "Trip No",  values: tripNumberFilter,  clear: () => { setTripNumberFilter([]);  setClientPage(1); } },
    { label: "Customer", values: customerFilter,    clear: () => { setCustomerFilter([]);    setClientPage(1); } },
    { label: "Address",  values: addressFilter,     clear: () => { setAddressFilter([]);     setClientPage(1); } },
    { label: "Thana",    values: thanaFilter,       clear: () => { setThanaFilter([]);       setClientPage(1); } },
    { label: "District", values: districtFilter,    clear: () => { setDistrictFilter([]);    setClientPage(1); } },
    { label: "Location", values: locationFilter,    clear: () => { setLocationFilter([]);    setClientPage(1); }, adminOnly: true },
    { label: "Receiver", values: receiverFilter,    clear: () => { setReceiverFilter([]);    setClientPage(1); } },
    { label: "Zone",     values: zoneFilter,        clear: () => { setZoneFilter([]);        setClientPage(1); } },
    { label: "Product",  values: productNameFilter, clear: () => { setProductNameFilter([]); setClientPage(1); } },
    { label: "Model",    values: modelFilter,       clear: () => { setModelFilter([]);       setClientPage(1); } },
    { label: "Rate",     values: rateFilter,        clear: () => { setRateFilter([]);        setClientPage(1); }, adminOnly: true },
    { label: "Capacity", values: capacityFilter,    clear: () => { setCapacityFilter([]);    setClientPage(1); }, adminOnly: true },
    { label: "CSD",      values: csdFilter,         clear: () => { setCsdFilter([]);         setClientPage(1); }, adminOnly: true },
    { label: "Unit",     values: unitFilter,        clear: () => { setUnitFilter([]);        setClientPage(1); }, adminOnly: true },
    { label: "Trip Do",  values: tripDoFilter,      clear: () => { setTripDoFilter([]);      setClientPage(1); }, adminOnly: true },
    { label: "Remarks",  values: remarksFilter,     clear: () => { setRemarksFilter([]);     setClientPage(1); }, adminOnly: true },
    ...(statusFilter ? [{ label: "Status", values: [statusFilter], clear: () => { setStatusFilter(""); setClientPage(1); } }] : []),
  ].filter(f => f.values.length > 0 && (isAdmin || !f.adminOnly));

  const totalActiveFilters = activeFilterGroups.reduce((s, f) => s + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#f97316">
          <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#f97316",
      confirmButtonText: "Export", cancelButtonText: "Cancel",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      let exportData = [];
      // Fixed export column set/order (per spec):
      //   Customer, Receiver No, Address, District, Thana, Location, Model,
      //   Qty, Rate, Amount, Product, Capacity
      // Location / Rate / Amount / Capacity are admin-only, so non-admin
      // exports simply skip those columns while keeping the rest in order.
      const toRow = (c, p) => {
        const eff = resolveProductRate(c, p);
        return {
          Customer: c.customerName,
          "Receiver No": c.receiverNumber,
          Address: c.address,
          District: c.district || "",
          Thana: c.thana || "",
          ...(isAdmin ? { Location: resolveLocation(c) || "" } : {}),
          Model: p.model,
          Qty: Number(p.quantity) || 0,
          ...(isAdmin ? { Rate: eff.rate || 0, Amount: eff.amount || 0 } : {}),
          Product: p.productName,
          ...(isAdmin ? { Capacity: eff.capacity || "" } : {}),
          ...(isAdmin ? {
            "Trip Do": p.tripDo || "",
            "GP Match": (() => { const m = getGpMatch(c, p); return m ? (m.matched ? "Matched" : "Not Matched") : ""; })(),
            CSD: c.csd || "", Unit: c.unit || "", Remarks: c.remarks || "",
          } : {}),
        };
      };
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(({ c, p }) => toRow(c, p));
      } else {
        // Full month — search active থাকলে state-এ search result থাকে
        // (limit 200), পুরো month নয়; তখন month data আলাদা fetch করতে হয়
        let monthData = challans;
        if (searchText) {
          const res = await axiosSecure.get(`/challans?month=${month}&year=${year}`);
          monthData = res.data.data || [];
        }
        exportData = monthData.flatMap(c => (c.products || []).map(p => toRow(c, p)));
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ChallanReport");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `Challan_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

      {/* ══ HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/30">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Challan Inventory</h2>
          </div>

          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 shrink-0">
                {new Set(filteredRows.map(({ c }) => c._id)).size} challans
              </span>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
                Qty: {totalQtyAll.toLocaleString()}
              </span>
            </>
          )}

          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
              <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
            </span>
          ))}
          {totalActiveFilters > 0 && (
            <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">
              Clear all
            </button>
          )}

          <div className="hidden sm:block flex-1" />

          {isMobile && (
            <button onClick={() => setShowMobileFilters(true)}
              className={`${tbtn} relative ${totalActiveFilters > 0 ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
            </button>
          )}

          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); setClientPage(1); }}>
            {MONTHS_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>
            ))}
          </select>

          <input type="number"
            className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none focus:border-orange-400`}
            value={year} onChange={e => { const y = parseInt(e.target.value); if (!Number.isNaN(y)) { setYear(y); setClientPage(1); } }} />

          <button onClick={handleResetAll}
            className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {isAdmin && (
            <button onClick={handleBulkTripDo}
              className={`${tbtn} bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              <span className="hidden sm:inline">Bulk Trip Do</span><span className="sm:hidden">TDO</span>
            </button>
          )}

          {isAdmin && (
            <button onClick={handleBulkRemarks}
              className={`${tbtn} bg-purple-600 text-white border-purple-600 hover:bg-purple-700`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              <span className="hidden sm:inline">Bulk Remarks</span><span className="sm:hidden">RMK</span>
            </button>
          )}

          <button onClick={handleExportExcel}
            className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">XLS</span>
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <LoadingSpinner variant="auto" />
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 m-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="font-semibold text-slate-600">No challans found</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : isMobile ? (

          /* ── MOBILE ── */
          <div className="h-full overflow-y-auto p-2">
            {paginatedRows.map(({ c, p }, idx) => (
              <MobileCard key={`${c._id}-${idx}`} c={c} p={p} axiosSecure={axiosSecure} refetchChallans={refetchChallans} isAdmin={isAdmin} gpMatch={getGpMatch(c, p)} onSplit={isAdmin ? splitProductRow : null} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-1">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">
                  ← Prev
                </button>
                <span className="text-xs text-slate-500 font-medium">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">
                  Next →
                </button>
              </div>
            )}
          </div>

        ) : (

          /* ── DESKTOP ── */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="border-collapse w-full" style={{ minWidth: "980px" }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {[
                        "Date","Trip Number","Status","Customer","Address","Thana","District",
                        ...(isAdmin ? ["Location"] : []),
                        "Receiver No","Zone","Product","Model","Qty",
                        ...(isAdmin ? ["Rate","Amount","Capacity"] : []),
                        ...(isAdmin ? ["CSD","Unit"] : []),
                        ...(isAdmin ? ["Trip Do"] : []),
                        ...(isAdmin ? ["GP Match"] : []),
                        ...(isAdmin ? ["Remarks"] : []),
                        "Action",
                      ].map(h => (
                        <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">
                          {h}
                        </th>
                      ))}
                    </tr>

                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="p-1 border-r border-slate-200">
                        <MultiSelect options={getOptionsFor("date")} selected={dateFilter} onChange={setFilter(setDateFilter)} />
                      </th>
                      <th className="p-1 border-r border-slate-200">
                        <MultiSelect options={getOptionsFor("tripNumber")} selected={tripNumberFilter} onChange={setFilter(setTripNumberFilter)} />
                      </th>
                      <th className="p-1 border-r border-slate-200">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setClientPage(1); }}
                          className={`w-full px-1.5 py-1 text-[11px] rounded-lg border outline-none ${statusFilter ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="return-pending">Return-Pending</option>
                          <option value="delivered">Delivered</option>
                          <option value="re-delivered">Re-Delivered</option>
                        </select>
                      </th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("customerName")}   selected={customerFilter}    onChange={setFilter(setCustomerFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("address")}        selected={addressFilter}     onChange={setFilter(setAddressFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("thana")}          selected={thanaFilter}       onChange={setFilter(setThanaFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("district")}       selected={districtFilter}    onChange={setFilter(setDistrictFilter)} /></th>
                      {isAdmin && (
                        <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("location")}       selected={locationFilter}    onChange={setFilter(setLocationFilter)} /></th>
                      )}
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("receiverNumber")} selected={receiverFilter}    onChange={setFilter(setReceiverFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}           selected={zoneFilter}        onChange={setFilter(setZoneFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("productName")}    selected={productNameFilter} onChange={setFilter(setProductNameFilter)} /></th>
                      <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}          selected={modelFilter}       onChange={setFilter(setModelFilter)} /></th>
                      <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQtyAll.toLocaleString()}</th>
                      {isAdmin && (
                        <>
                          {/* Rate — derived column filter.  "(No rate)" বাছলে
                              যেসব row-এ rate resolve হয়নি সেগুলো আসে। */}
                          <th className="p-1 border-r border-slate-200 min-w-[86px]">
                            <MultiSelect
                              options={getOptionsFor("rate")}
                              selected={rateFilter}
                              onChange={setFilter(setRateFilter)}
                              blankLabel="(No rate)"
                            />
                          </th>
                          <th className="p-1 border-r border-slate-200 text-center text-xs font-black text-slate-700">
                            {totalAmountAll.toLocaleString()}
                          </th>
                          {/* Capacity — derived column filter.  "(No capacity)"
                              বাছলে যেসব row-এ capacity বসেনি সেগুলো আসে। */}
                          <th className="p-1 border-r border-slate-200 min-w-[92px]">
                            <MultiSelect
                              options={getOptionsFor("capacity")}
                              selected={capacityFilter}
                              onChange={setFilter(setCapacityFilter)}
                              blankLabel="(No capacity)"
                            />
                          </th>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <th className="p-1 border-r border-slate-200 min-w-[92px]">
                            <MultiSelect
                              options={getOptionsFor("csd")}
                              selected={csdFilter}
                              onChange={setFilter(setCsdFilter)}
                              blankLabel="(No CSD)"
                            />
                          </th>
                          <th className="p-1 border-r border-slate-200 min-w-[80px]">
                            <MultiSelect
                              options={getOptionsFor("unit")}
                              selected={unitFilter}
                              onChange={setFilter(setUnitFilter)}
                              blankLabel="(No unit)"
                            />
                          </th>
                        </>
                      )}
                      {isAdmin && (
                        <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("tripDo")} selected={tripDoFilter} onChange={setFilter(setTripDoFilter)} /></th>
                      )}
                      {isAdmin && (
                        <th className="p-1 border-r border-slate-200">
                          <select value={gpMatchFilter} onChange={e => { setGpMatchFilter(e.target.value); setClientPage(1); }}
                            className={`w-full px-1.5 py-1 text-[11px] rounded-lg border outline-none ${gpMatchFilter ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                            <option value="">All</option>
                            <option value="matched">✓ Matched</option>
                            <option value="unmatched">✗ No Match</option>
                          </select>
                        </th>
                      )}
                      {isAdmin && (
                        <th className="p-1 border-r border-slate-200"><MultiSelect options={getOptionsFor("remarks")} selected={remarksFilter} onChange={setFilter(setRemarksFilter)} /></th>
                      )}
                      <th className="p-1" />
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRows.map(({ c, p }, idx) => (
                      <tr key={`${c._id}-${idx}`}
                        className={`border-b border-slate-100 text-[12px] transition-colors ${
                          (c.status === "delivered" || c.status === "re-delivered")
                            ? "bg-emerald-50/40 hover:bg-emerald-50"
                            : "hover:bg-orange-50/30 even:bg-slate-50/40"
                        }`}>
                        <td className="px-2.5 py-2 text-black whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-2.5 py-2 text-black whitespace-nowrap font-mono text-[11px] font-semibold">
                          {c.tripNumber || <span className="text-slate-300 font-sans">—</span>}
                        </td>
                        <td className="px-2.5 py-2"><StatusBadge status={c.status} /></td>
                        <td className="px-2.5 py-2 text-black max-w-[140px] truncate" title={c.customerName}> {c.customerName}</td>
                        <td className="px-2.5 py-2 text-black max-w-[140px] truncate" title={c.address}>{c.address}</td>
                        <td className="px-2.5 py-2 text-black max-w-[140px] truncate" title={c.thana}>{c.thana || "—"}</td>
                        <td className="px-2.5 py-2 text-black max-w-[140px] truncate" title={c.district}>{c.district || "—"}</td>
                        {isAdmin && (
                          <td className="px-2.5 py-2"><LocationBadge value={resolveLocation(c)} /></td>
                        )}
                        <td className="px-2.5 py-2 text-black">{c.receiverNumber}</td>
                        <td className="px-2.5 py-2 text-black">{c.zone}</td>
                        <td className="px-2.5 py-2 text-black whitespace-nowrap">{p.productName || "—"}</td>
                        {/* Model — পুরো নাম দেখানো হয়, truncate নেই। লম্বা model
                            নামের জন্য column নিজে চওড়া হবে (whitespace-nowrap)। */}
                        <td className="px-2.5 py-2 text-black whitespace-nowrap" title={p.model}>{p.model?.toUpperCase()}</td>
                        {/* Qty + Split — Delivered page-এর মতোই admin qty > 1
                            হলে row-টা দুই ভাগ করতে পারে, যাতে অংশবিশেষে
                            আলাদা Trip Do বসানো যায়। */}
                        <td className="px-2.5 py-2 text-center font-black text-black">
                          <div className="inline-flex items-center justify-center gap-1">
                            <span>{p.quantity}</span>
                            {isAdmin && p._id && Number(p.quantity) > 1 && (
                              <button
                                type="button"
                                onClick={() => splitProductRow(c, p)}
                                title={`Split this row (qty ${p.quantity}) into two — peel off some qty into a new row so it can take a different Trip Do`}
                                className="inline-flex items-center justify-center w-4 h-4 rounded border border-sky-200 text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors"
                              >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="6" y1="3" x2="6" y2="15"/>
                                  <circle cx="18" cy="6" r="3"/>
                                  <circle cx="6" cy="18" r="3"/>
                                  <path d="M18 9a9 9 0 0 1-9 9"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        {isAdmin && (() => {
                          const eff = effOf(c, p);
                          return (
                            <>
                              <td className="px-2.5 py-2 text-amber-500 font-bold whitespace-nowrap">{eff.rate ? `${eff.rate}` : "—"}</td>
                              <td className="px-2.5 py-2 text-green-600 font-bold whitespace-nowrap">{eff.amount ? `${eff.amount.toLocaleString()}` : "—"}</td>
                              <td className="px-2.5 py-2 text-black whitespace-nowrap">{eff.capacity || "—"}</td>
                            </>
                          );
                        })()}
                        {isAdmin && (
                          <>
                            {/* CSD/Unit — Gate Pass Inventory-র Sync button দিয়ে
                                matched gate pass থেকে আসে */}
                            <td className="px-2.5 py-2 text-black font-mono text-[11px] whitespace-nowrap">{c.csd?.toUpperCase() || <span className="text-slate-300 font-sans">—</span>}</td>
                            <td className="px-2.5 py-2 text-black whitespace-nowrap">{c.unit?.toUpperCase() || <span className="text-slate-300">—</span>}</td>
                          </>
                        )}
                        {isAdmin && (
                          <td className="px-2.5 py-2 min-w-[90px]" title={p.tripDo || ""}>
                            <TripDoCell
                              challan={c}
                              product={p}
                              editingTripDo={editingTripDo}
                              setEditingTripDo={setEditingTripDo}
                              savingTripDo={savingTripDo}
                              onSave={saveTripDo}
                            />
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-2.5 py-2 whitespace-nowrap">
                            <GpMatchBadge match={getGpMatch(c, p)} />
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-2.5 py-2" title={c.remarks || ""}>
                            <RemarksCell
                              challan={c}
                              editingRemarks={editingRemarks}
                              setEditingRemarks={setEditingRemarks}
                              savingRemarks={savingRemarks}
                              onSave={saveRemarks}
                            />
                          </td>
                        )}
                        <td className="px-2.5 py-2">
                          <ChallanActionDropdown challan={c} product={p} axiosSecure={axiosSecure} refetchChallans={refetchChallans} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                  <p className="text-xs text-slate-500 font-medium">
                    {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold transition-colors">
                      ← Prev
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="px-1.5 text-slate-400 text-xs">…</span>
                      ) : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-3 py-1.5 text-xs border rounded-lg transition-colors font-semibold ${
                            clientPage === p
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-slate-200 bg-white hover:bg-slate-100"
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showMobileFilters && (
        <MobileFilterSheet
          onClose={() => setShowMobileFilters(false)}
          getOptionsFor={getOptionsFor}
          rateFilter={rateFilter} setRateFilter={setRateFilter}
          capacityFilter={capacityFilter} setCapacityFilter={setCapacityFilter}
          csdFilter={csdFilter} setCsdFilter={setCsdFilter}
          unitFilter={unitFilter} setUnitFilter={setUnitFilter}
          customerFilter={customerFilter} setCustomerFilter={setCustomerFilter}
          addressFilter={addressFilter} setAddressFilter={setAddressFilter}
          thanaFilter={thanaFilter} setThanaFilter={setThanaFilter}
          districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
          locationFilter={locationFilter} setLocationFilter={setLocationFilter}
          receiverFilter={receiverFilter} setReceiverFilter={setReceiverFilter}
          zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
          productNameFilter={productNameFilter} setProductNameFilter={setProductNameFilter}
          modelFilter={modelFilter} setModelFilter={setModelFilter}
          remarksFilter={remarksFilter} setRemarksFilter={setRemarksFilter}
          dateFilter={dateFilter} setDateFilter={setDateFilter}
          tripNumberFilter={tripNumberFilter} setTripNumberFilter={setTripNumberFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          setClientPage={setClientPage}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default AllChallan;