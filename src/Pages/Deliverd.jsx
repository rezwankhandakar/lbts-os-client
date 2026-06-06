
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import usePageParam from "../hooks/usePageParam";
import useRole from "../hooks/useRole";   // gate admin-only columns / actions
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";
import { computeLocation } from "../utils/localAddressMatcher";   // for on-the-fly fallback when older challans don't have location saved
// Local rate matcher — still used on the read path to compute a fallback
// rate for older challans that have no `rate` field saved on the product.
// The inline product-name / capacity editors were removed, so the
// typeahead helpers (suggestProducts, suggestCapacities, getCapacityOptions)
// are no longer imported.
import { findRate } from "../utils/rateMatcher";

const ITEMS_PER_PAGE = 100;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FLOORS = Array.from({ length: 15 }, (_, i) => i + 1);

/**
 * Get a challan's `location` value.  Prefer the saved field from DB; if it's
 * missing (older challan created before the auto-compute feature shipped),
 * compute it on the fly from thana + district so the column still shows
 * something useful instead of an empty dash.
 */
const resolveLocation = (challan) => {
  if (challan?.location) return challan.location;
  return computeLocation(challan?.thana, challan?.district) || null;
};

/**
 * Get a product row's effective `capacity` + `rate`.
 *
 *   1. If the DB row already has them saved (new challans), use those.
 *   2. Otherwise (older challans created before this feature shipped),
 *      run the local rate-matcher on the fly so the user still sees a
 *      sensible value in the table — without ever writing back to DB
 *      until the user explicitly edits the cell.
 *
 * This keeps the Delivered page useful for the entire historical dataset
 * without a one-time migration script.
 */
const resolveProductRate = (challan, product) => {
  const savedCap  = product?.capacity;
  const savedRate = Number(product?.rate) || 0;

  // If we already have a saved rate, trust it.  (A row can legitimately
  // have capacity="" + rate=80 for without-model items, so check rate
  // first — capacity alone isn't enough.)
  if (savedRate > 0) {
    return { capacity: savedCap || "", rate: savedRate, source: "saved" };
  }

  // Fallback: try the matcher.  Needs a location, so resolve that first.
  const loc = resolveLocation(challan);
  if (!loc) return { capacity: savedCap || "", rate: 0, source: "unresolved" };

  const r = findRate({
    productName: product?.productName,
    model: product?.model,
    location: loc,
    capacity: savedCap || "",
  });
  return {
    capacity: r.capacity || savedCap || "",
    rate: r.rate || 0,
    source: r.rate ? "computed" : "unresolved",
  };
};

const STATUS_OPTIONS = {
  deliveryStatus:      ["confirmed","not_received","call_later","received","missing"],
  challanReturnStatus: ["confirmed","not_received","call_later","received","missing"],
};

/* ── Multi-select ──
   Two synthetic options are always available in addition to the real ones:
     "__all__"   → selects every currently-filtered real option (a true
                   no-op for filtering, but useful for "select everything
                   then de-select a few")
     "__blank__" → matches rows whose value for this column is empty/null
                   (rendered as "(Blanks)" in the chip and in the menu)
   The actual filter logic in buildRows checks selected.includes("__blank__")
   separately so empty strings stay matchable. */
const ALL_TOKEN   = "__all__";
const BLANK_TOKEN = "__blank__";
const BLANK_LABEL = "(Blanks)";

const MultiSelect = ({ options, selected, onChange, placeholder = "All" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  // Visible "real" selected count (excludes BLANK token which we render
  // with a friendly label)
  const realSelected = selected.filter(v => v !== BLANK_TOKEN);
  const hasBlank = selected.includes(BLANK_TOKEN);
  const totalSel = realSelected.length + (hasBlank ? 1 : 0);

  const label =
    totalSel === 0 ? placeholder
    : totalSel === 1 ? (hasBlank && realSelected.length === 0 ? BLANK_LABEL : realSelected[0])
    : `${totalSel} sel`;

  const toggle = (v) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);

  // "Select all" toggles all currently-filtered REAL options. It never
  // pulls in (Blanks) — that stays an independent choice.
  const filteredAllSelected =
    filtered.length > 0 && filtered.every(o => selected.includes(o));
  const toggleAll = () => {
    if (filteredAllSelected) {
      // Remove the filtered ones from selection
      onChange(selected.filter(v => !filtered.includes(v)));
    } else {
      // Add every filtered option that's not already there
      const next = new Set(selected);
      for (const o of filtered) next.add(o);
      onChange([...next]);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-0.5 px-1.5 py-0.5 text-[11px] rounded-lg border transition-all text-left ${totalSel > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-0.5 flex-shrink-0">
          {totalSel > 0 && <span className="text-slate-400 hover:text-white cursor-pointer text-[10px]" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[160px] w-max max-w-[230px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 235) : 0 }}>
          <div className="p-1.5 border-b border-slate-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
          </div>
          {/* Quick toggles row — Select all (filtered) + Blanks */}
          <div className="border-b border-slate-100 bg-slate-50/60">
            <label className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-100">
              <input type="checkbox"
                checked={filteredAllSelected}
                onChange={toggleAll}
                className="w-3 h-3 accent-orange-500 flex-shrink-0" />
              <span className="font-semibold text-slate-700">
                Select all {search ? `(${filtered.length} match)` : `(${options.length})`}
              </span>
            </label>
            <label className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-100">
              <input type="checkbox"
                checked={hasBlank}
                onChange={() => toggle(BLANK_TOKEN)}
                className="w-3 h-3 accent-orange-500 flex-shrink-0" />
              <span className="italic text-slate-500">{BLANK_LABEL}</span>
            </label>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-orange-500 flex-shrink-0" />
                  <span className="truncate text-slate-700">{opt}</span>
                </label>
              ))}
          </div>
          {totalSel > 0 && (
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => onChange([])} className="w-full text-[10px] text-slate-400 uppercase py-1 hover:text-slate-700">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TypeSelect = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`w-full px-1.5 py-0.5 text-[11px] rounded-lg border outline-none transition-all ${value ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
    <option value="">All</option>
    <option value="delivery">Delivery</option>
    <option value="return">Return</option>
  </select>
);

/* ── Mobile Card ──
   `isAdmin` is passed from the parent so we can hide admin-only fields
   (capacity, rate, amount, tripDo) without making this component aware
   of the role hook. */
const MobileCard = ({ row, isAdmin, onSplit }) => {
  const { challan, product, date, isReturn, note, returnNote } = row;
  const displayNote = isReturn ? returnNote : note;
  return (
    <div className={`border rounded-xl p-3 mb-2 shadow-sm ${isReturn ? "bg-orange-50/60 border-orange-200" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-400">{date.toLocaleDateString("en-GB")}</span>
        <div className="flex items-center gap-1.5">
          {isReturn
            ? <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[10px] font-bold">↩ Return</span>
            : <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">↗ Delivery</span>
          }

        </div>
      </div>
      <div className="mb-1.5">
        <span className="font-bold text-slate-800 text-sm">{challan.customerName}</span>
        {challan.zone && <span className="ml-2 text-[10px] text-slate-500 bg-slate-100 rounded-lg px-1.5 py-0.5">{challan.zone}</span>}
      </div>
      {challan.address && <p className="text-[11px] text-slate-500 mb-1.5 leading-tight">{challan.address}</p>}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {[["CSD", challan.csd],["District", challan.district],["Thana", challan.thana],["Location", resolveLocation(challan)],["Receiver", challan.receiverNumber]].map(([l, v]) => (
          <div key={l}>
            <p className="text-[9px] text-slate-400 uppercase font-bold">{l}</p>
            {l === "Location" && v
              ? <span className={
                  `inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border ` +
                  (v === "ISD"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : v === "OSD-Metro"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-amber-50 text-amber-700 border-amber-200")
                }>{v}</span>
              : <p className="text-[11px] text-slate-600 truncate">{v || "—"}</p>
            }
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-800 truncate block">{product.productName}</span>
          <span className="text-[10px] text-slate-400 uppercase">{product.model}</span>
          {isAdmin && (product.capacity || row.effectiveCapacity) && (
            <span className={
              "block text-[10px] mt-0.5 truncate " +
              (!product.capacity && row.effectiveCapacity ? "text-blue-500 italic" : "text-slate-500")
            }>
              ⚖ {product.capacity || row.effectiveCapacity}
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2 space-y-0.5">
          <div>
            <p className="text-[10px] text-slate-400">Qty</p>
            <div className="inline-flex items-center gap-1">
              <span className="font-black text-slate-800 text-sm">{product.quantity}</span>
              {isAdmin && Number(product.quantity) > 1 && onSplit && (
                <button
                  type="button"
                  onClick={() => onSplit(challan, product)}
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
          {isAdmin && row.effectiveRate ? (
            <span className={
              "inline-block text-[10px] font-black rounded-md px-1.5 py-0.5 border " +
              (row.rateSource === "computed"
                ? "text-blue-700 bg-blue-50 border-blue-200 border-dashed"
                : "text-emerald-700 bg-emerald-50 border-emerald-200")
            }>
              ৳{row.effectiveRate}
            </span>
          ) : null}
          {isAdmin && row.effectiveAmount > 0 && (
            <span className="block text-[10px] font-black text-emerald-700">
              = ৳{row.effectiveAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {isAdmin && product.tripDo && (
        <p className="mt-1.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 inline-block">
          DO: {product.tripDo}
        </p>
      )}
      {displayNote && <p className={`mt-1.5 text-[10px] italic truncate font-medium ${isReturn ? "text-orange-500" : "text-amber-600"}`}>{displayNote}</p>}

    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const DeliveredPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();
  // Admin-only columns + actions:
  //   Location, Capacity, Rate, Amount, Trip Do columns
  //   Bulk Trip Do button (header)
  //   Same columns in the Excel export
  // Non-admin users (manager, operator, etc.) don't see these in the
  // table, the filter row, the mobile filter panel, or the exported file.
  //
  // While the role query is still loading we treat the user as
  // non-admin (safer default — a non-admin briefly seeing the admin UI
  // is worse than an admin briefly seeing the trimmed UI).
  const { role, isLoading: roleLoading } = useRole();
  const isAdmin = !roleLoading && role === "admin";

  const [deliveries,        setDeliveries]        = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [clientPage,        setClientPage]        = usePageParam("page");
  const [isMobile,          setIsMobile]          = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [customerFilter, setCustomerFilter] = useState([]);
  const [csdFilter,      setCsdFilter]      = useState([]);   // NEW: CSD column filter
  const [zoneFilter,     setZoneFilter]     = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [thanaFilter,    setThanaFilter]    = useState([]);
  const [locationFilter, setLocationFilter] = useState([]);   // NEW: Location column filter
  const [productFilter,  setProductFilter]  = useState([]);
  const [modelFilter,    setModelFilter]    = useState([]);
  const [capacityFilter, setCapacityFilter] = useState([]);   // NEW: Capacity column filter
  const [addressFilter,  setAddressFilter]  = useState([]);
  const [receiverFilter, setReceiverFilter] = useState([]);
  const [dateFilter,     setDateFilter]     = useState([]);
  const [typeFilter,     setTypeFilter]     = useState("");
  const [noteFilter,     setNoteFilter]     = useState([]);
  const [tripDoFilter,   setTripDoFilter]   = useState([]);   // NEW: Trip Do column filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchDeliveries = useCallback(async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/deliveries?search=${encodeURIComponent(search)}`
        : `/deliveries?month=${m}&year=${y}`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [axiosSecure]);

  // current month/year/search ref — window focus এ use হয়
  const monthRef  = useRef(month);
  const yearRef   = useRef(year);
  const searchRef = useRef(searchText);
  useEffect(() => { monthRef.current  = month;      }, [month]);
  useEffect(() => { yearRef.current   = year;       }, [year]);
  useEffect(() => { searchRef.current = searchText; }, [searchText]);

  useEffect(() => { setClientPage(1); fetchDeliveries(month, year, searchText); }, [month, year, searchText, fetchDeliveries]);

  // নতুন delivery add হলে (window focus) re-fetch
  useEffect(() => {
    const onFocus = () => fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchDeliveries]);

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setCsdFilter([]); setZoneFilter([]); setDistrictFilter([]);
    setThanaFilter([]); setLocationFilter([]); setProductFilter([]); setModelFilter([]);
    setCapacityFilter([]);
    setAddressFilter([]); setReceiverFilter([]); setDateFilter([]);
    setTypeFilter(""); setNoteFilter([]); setTripDoFilter([]); setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const buildRows = useCallback(() => {
    const rows = [];
    deliveries.forEach(trip => {
      (trip.challans || []).forEach(challan => {
        const isReturn = challan.isReturn === true;
        const rowType  = isReturn ? "return" : "delivery";
        if (typeFilter && typeFilter !== rowType) return;
        (challan.products || []).forEach(product => {
          const s = searchText?.toLowerCase() || "";
          const matchesSearch = !searchText || [challan.customerName, challan.csd, challan.zone, challan.address, challan.receiverNumber, challan.district, challan.thana, resolveLocation(challan), product.productName, product.model, product.tripDo].some(v => v?.toString().toLowerCase().includes(s));
          if (!matchesSearch) return;
          // Date column now behaves like the other text columns: a
          // MultiSelect over dd/mm/yyyy labels with All / (Blanks) support
          // instead of a single calendar value.
          const challanDateLabel = new Date(trip.createdAt).toLocaleDateString("en-GB");
          // Blank-aware filter:
          //   filter.length === 0       → pass-through (no filter active)
          //   filter contains __blank__ → empty values match
          //   real values are case-insensitive equality
          const check = (filter, val) => {
            if (filter.length === 0) return true;
            const v = (val ?? "").toString().trim();
            if (v === "") return filter.includes(BLANK_TOKEN);
            return filter.some(f => f !== BLANK_TOKEN && v.toLowerCase() === f.toLowerCase());
          };

          if (!check(dateFilter, challanDateLabel)) return;
          // Resolve effective capacity + rate FIRST so the rest of the
          // filter/sort/display pipeline can use the on-the-fly value
          // for older challans that don't have these fields saved.
          const eff = resolveProductRate(challan, product);

          if (!check(customerFilter, challan.customerName)) return;
          if (!check(csdFilter,      challan.csd))          return;
          if (!check(zoneFilter,     challan.zone))         return;
          if (!check(addressFilter,  challan.address))      return;
          if (!check(receiverFilter, challan.receiverNumber)) return;
          if (!check(districtFilter, challan.district))     return;
          if (!check(thanaFilter,    challan.thana))        return;
          if (!check(locationFilter, resolveLocation(challan)))     return;
          if (!check(productFilter,  product.productName))  return;
          if (!check(modelFilter,    product.model))        return;
          if (!check(capacityFilter, eff.capacity))         return;
          if (!check(tripDoFilter,   product.tripDo))       return;
          if (noteFilter.length > 0) {
            const noteVal = isReturn ? (challan.returnNote || "") : (challan.note || "");
            if (!check(noteFilter, noteVal)) return;
          }
          const qty  = Number(product.quantity) || 0;
          const rate = Number(eff.rate) || 0;
          rows.push({
            trip, challan, product,
            // Effective values — saved when present, computed otherwise.
            // All downstream consumers (cells, totals, export) read
            // these instead of product.capacity / product.rate.
            effectiveCapacity: eff.capacity,
            effectiveRate:     rate,
            effectiveAmount:   qty * rate,    // NEW — qty × rate per row
            rateSource:        eff.source,   // "saved" | "computed" | "unresolved"
            tripDo:            product.tripDo || "",  // NEW — bubble up for cell access
            csd:               challan.csd || "",      // NEW — editable per-challan CSD
            date: new Date(trip.createdAt), isReturn, rowType,
            deliveryStatus: challan.deliveryStatus,
            challanReturnStatus: challan.challanReturnStatus,
            note: challan.note || "", returnNote: challan.returnNote || "",
          });
        });
      });
    });
    return rows;
  }, [deliveries, searchText, typeFilter, dateFilter, customerFilter, csdFilter, zoneFilter, addressFilter, receiverFilter, districtFilter, thanaFilter, locationFilter, productFilter, modelFilter, capacityFilter, tripDoFilter, noteFilter]);

  const filteredRows  = useMemo(() => buildRows(), [buildRows]);
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(() => filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE), [filteredRows, clientPage]);
  const totalQtyAll   = useMemo(() => filteredRows.reduce((s, { product }) => s + (Number(product.quantity) || 0), 0), [filteredRows]);
  // Sum of (qty × effectiveRate) for all filtered rows — gives the user
  // a quick bill total for the current view.  Older rows without a
  // saved rate get a computed rate from the matcher and contribute too.
  const totalAmountAll = useMemo(
    () => filteredRows.reduce((s, r) => s + (r.effectiveAmount || 0), 0),
    [filteredRows]
  );

  // ── Filter dropdown options ────────────────────────────────────────
  // Strict mode: options come from the CURRENTLY VISIBLE rows. So if the
  // user filters Customer = "Acme", the District dropdown only shows
  // districts where Acme orders went.
  //
  // Trade-off the user accepted: once a value is selected in a column,
  // that column's dropdown collapses to just that value (since only rows
  // with that value remain visible). To add more values, remove the
  // chip via the X first.
  const getOptionsFor = useCallback((field) => {
    const map = new Map();
    for (const row of filteredRows) {
      const { challan, product } = row;
      let val;
      if (field === "date") {
        // Use the row's Date object → dd/mm/yyyy label (matches the cell
        // display and the buildRows filter).
        val = row.date ? row.date.toLocaleDateString("en-GB") : "";
      } else if (field === "capacity") {
        // Use the row's already-resolved effective capacity instead of
        // re-running resolveProductRate. Includes on-the-fly resolved
        // values for older challans.
        val = row.effectiveCapacity;
      } else if (field === "productName" || field === "model" || field === "tripDo") {
        val = product[field]?.toString().trim();
      } else if (field === "location") {
        val = resolveLocation(challan);
      } else if (field === "note") {
        // Note filter is shared between delivery (note) and return rows
        // (returnNote); pick whichever applies to this row.
        val = (row.isReturn ? row.returnNote : row.note)?.toString().trim();
      } else {
        val = challan[field]?.trim();
      }
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    }
    const values = Array.from(map.values());
    if (field === "date") {
      // Newest first — parse dd/mm/yyyy back into a timestamp.
      const toTs = (d) => { const [dd, mm, yy] = d.split("/"); return new Date(`${yy}-${mm}-${dd}`).getTime(); };
      return values.sort((a, b) => toTs(b) - toTs(a));
    }
    return values.sort((a, b) => a.localeCompare(b));
  }, [filteredRows]);

  const getNoteOptions = useCallback(() => {
    // Same strict-mode rule: only show notes that appear in the
    // currently filtered rows.
    const map = new Map();
    for (const row of filteredRows) {
      const note = row.isReturn ? (row.returnNote || "") : (row.note || "");
      const trimmed = note.trim();
      if (trimmed && !map.has(trimmed.toLowerCase())) {
        map.set(trimmed.toLowerCase(), trimmed);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [filteredRows]);

  const activeFilterGroups = [
    { label: "Date",     values: dateFilter,     clear: () => setDateFilter([]) },
    { label: "Customer", values: customerFilter, clear: () => setCustomerFilter([]) },
    { label: "CSD",      values: csdFilter,      clear: () => setCsdFilter([]) },
    { label: "Zone",     values: zoneFilter,     clear: () => setZoneFilter([]) },
    { label: "Address",  values: addressFilter,  clear: () => setAddressFilter([]) },
    { label: "Receiver", values: receiverFilter, clear: () => setReceiverFilter([]) },
    { label: "District", values: districtFilter, clear: () => setDistrictFilter([]) },
    { label: "Thana",    values: thanaFilter,    clear: () => setThanaFilter([]) },
    { label: "Location", values: locationFilter, clear: () => setLocationFilter([]), adminOnly: true },
    { label: "Product",  values: productFilter,  clear: () => setProductFilter([]) },
    { label: "Model",    values: modelFilter,    clear: () => setModelFilter([]) },
    { label: "Capacity", values: capacityFilter, clear: () => setCapacityFilter([]), adminOnly: true },
    { label: "Trip Do",  values: tripDoFilter,   clear: () => setTripDoFilter([]),  adminOnly: true },
    ...(typeFilter ? [{ label: "Type", values: [typeFilter], clear: () => setTypeFilter("") }] : []),
    { label: "Note", values: noteFilter, clear: () => setNoteFilter([]) },
  ].filter(f => f.values.length > 0 && (isAdmin || !f.adminOnly));

  const activeFilterCount = activeFilterGroups.reduce((n, f) => n + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#f97316">
          <span><b>Filtered data</b> (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${MONTHS_FULL[month - 1]} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#f97316", confirmButtonText: "Export",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      const toRow = (row) => {
        // Prefer pre-resolved row fields (buildRows path); for full-month
        // path we resolve fresh.
        const eff = (row.effectiveRate !== undefined && row.effectiveCapacity !== undefined)
          ? { capacity: row.effectiveCapacity, rate: row.effectiveRate }
          : resolveProductRate(row.challan, row.product);
        const qty = Number(row.product.quantity) || 0;
        const rate = Number(eff.rate) || 0;
        // Build the base (non-admin-visible) export row, then conditionally
        // add admin-only fields. Object spread preserves column order:
        // base fields first (up through Model), admin block in the middle,
        // then post-admin fields (Floor onward).
        return {
          Date: row.date.toLocaleDateString(), Type: row.isReturn ? "Return" : "Delivery",
          "Trip No": row.trip.tripNumber || "", Customer: row.challan.customerName,
          CSD: row.challan.csd || "",
          Zone: row.challan.zone, Address: row.challan.address,
          "Receiver Number": row.challan.receiverNumber, District: row.challan.district,
          Thana: row.challan.thana,
          ...(isAdmin ? { Location: resolveLocation(row.challan) || "" } : {}),
          Product: row.product.productName,
          Model: row.product.model,
          ...(isAdmin ? { Capacity: eff.capacity || "" } : {}),
          Qty: qty,
          ...(isAdmin ? {
            Rate: rate,
            Amount: qty * rate,
            "Trip Do": row.product.tripDo || "",
          } : {}),
          Floor: row.challan.floor || "", Carrying: row.challan.carrying || "",
          "Delivery Status": row.deliveryStatus || "Pending",
          "Challan Status": row.challanReturnStatus || "—",
          Note: row.note || row.returnNote || "",
        };
      };
      let exportData = [];
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(toRow);
      } else {
        // Full month — already in state (no limit), extra API call নেই
        deliveries.forEach(trip => {
          (trip.challans || []).forEach(challan => {
            const isReturn = challan.isReturn === true;
            (challan.products || []).forEach(product => {
              exportData.push(toRow({ trip, challan, product, date: new Date(trip.createdAt), isReturn,
                deliveryStatus: challan.deliveryStatus, challanReturnStatus: challan.challanReturnStatus,
                note: challan.note || "", returnNote: challan.returnNote || "" }));
            });
          });
        });
        if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
        `Delivered_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
      Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
    } catch { Swal.fire("Error", "Export failed", "error"); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 2)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  // ── Inline-edit state ─────────────────────────────────────────────
  // Only the Trip Do column is inline-editable now (Product and Capacity
  // are read-only on this page). editingCell tracks which
  // (challanId, productId) is currently open.
  const [editingCell, setEditingCell] = useState(null);   // { challanId, productId, value }
  const [savingCell,  setSavingCell]  = useState(false);

  // CSD inline-edit state — CSD is a per-challan field (one value per
  // challan), so we key the open editor by challanId only.
  const [editingCsd, setEditingCsd] = useState(null);     // { challanId, value }
  const [savingCsd,  setSavingCsd]  = useState(false);

  /**
   * Save an inline CSD edit for a challan.  CSD is challan-level, so the
   * endpoint needs the trip _id + the embedded challanId.  After saving
   * we re-fetch so every row sharing this challan reflects the new value.
   */
  const saveCsd = useCallback(async (trip, challan, newValue) => {
    setSavingCsd(true);
    try {
      const clean = (newValue ?? "").toString().trim();
      const tripId    = trip?._id;
      const challanId = challan.challanId || challan._id;
      await axiosSecure.patch(`/deliveries/${tripId}/challan/${challanId}/csd`, {
        csd: clean,
      });
      await fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: clean ? `CSD set to ${clean}` : "CSD cleared",
        showConfirmButton: false, timer: 1300,
      });
    } catch (err) {
      console.error("CSD save failed", err);
      Swal.fire("Error", "Failed to save CSD", "error");
    } finally {
      setSavingCsd(false);
      setEditingCsd(null);
    }
  }, [axiosSecure, fetchDeliveries]);

  /**
   * Save a single-row Trip Do edit. Uses the bulk endpoint so server-side
   * logic only lives in one place (single row = bulk with one target).
   */
  const saveTripDo = useCallback(async (challan, product, newValue) => {
    setSavingCell(true);
    try {
      const clean = (newValue ?? "").toString().trim();
      // The Delivered page reads from the deliveries collection, where each
      // embedded challan stores the canonical challan _id under the field
      // name `challanId` (not `_id`). Older code paths use `_id` for the
      // top-level trip; here we always want the embedded `challanId`.
      const challanId = challan.challanId || challan._id;
      await axiosSecure.patch("/deliveries/bulk-trip-do", {
        tripDo: clean,
        targets: [{ challanId, productId: product._id }],
      });
      await fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: clean ? `Trip Do set to ${clean}` : "Trip Do cleared",
        showConfirmButton: false, timer: 1300,
      });
    } catch (err) {
      console.error("trip Do save failed", err);
      Swal.fire("Error", "Failed to save Trip Do", "error");
    } finally {
      setSavingCell(false);
      setEditingCell(null);
    }
  }, [axiosSecure, fetchDeliveries]);

  /**
   * Bulk Trip Do — stamps one Trip Do value onto every product currently
   * shown by the active filters. Empty value clears Trip Do on those rows.
   */
  const handleBulkTripDo = useCallback(async () => {
    if (filteredRows.length === 0) {
      Swal.fire({ icon: "info", title: "No rows", text: "Apply filters first or load data." });
      return;
    }

    const { value, isDismissed } = await Swal.fire({
      title: `Set Trip Do for ${filteredRows.length} rows`,
      input: "text",
      inputLabel: "Trip Do number",
      inputPlaceholder: "e.g. 4681835 — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Apply to all",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;

    // De-duplicate targets — many rows can share the same product
    // (shouldn't happen, but be safe), then build the payload.
    // Embedded challan rows use the `challanId` field (the canonical
    // challan _id stored as a string); top-level `_id` is the trip's
    // own ObjectId, which is NOT what we want.
    const seen = new Set();
    const targets = [];
    for (const r of filteredRows) {
      const challanId = r.challan.challanId || r.challan._id;
      const key = `${challanId}|${r.product._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      targets.push({ challanId, productId: r.product._id });
    }

    try {
      const res = await axiosSecure.patch("/deliveries/bulk-trip-do", {
        tripDo: value || "",
        targets,
      });
      await fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: value
          ? `Trip Do "${value}" applied to ${res.data?.touched ?? targets.length} rows`
          : `Trip Do cleared on ${res.data?.touched ?? targets.length} rows`,
        showConfirmButton: false, timer: 2000,
      });
    } catch (err) {
      console.error("bulk trip-do failed", err);
      Swal.fire("Error", "Bulk Trip Do failed", "error");
    }
  }, [axiosSecure, fetchDeliveries, filteredRows]);

  /**
   * Bulk CSD — stamps one CSD name onto every challan currently shown by
   * the active filters. CSD is per-challan, so we de-duplicate by
   * challanId (not product). Empty value clears CSD on those challans.
   */
  const handleBulkCsd = useCallback(async () => {
    if (filteredRows.length === 0) {
      Swal.fire({ icon: "info", title: "No rows", text: "Apply filters first or load data." });
      return;
    }

    // Distinct challans across the filtered rows.
    const seen = new Set();
    const challanIds = [];
    for (const r of filteredRows) {
      const challanId = r.challan.challanId || r.challan._id;
      if (!challanId || seen.has(challanId)) continue;
      seen.add(challanId);
      challanIds.push(challanId);
    }

    const { value, isDismissed } = await Swal.fire({
      title: `Set CSD for ${challanIds.length} challan${challanIds.length > 1 ? "s" : ""}`,
      input: "text",
      inputLabel: "CSD name",
      inputPlaceholder: "Type CSD name — leave blank to clear",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      confirmButtonText: "Apply to all",
      inputValidator: () => null,   // empty allowed (clears)
    });
    if (isDismissed) return;

    try {
      const res = await axiosSecure.patch("/deliveries/bulk-csd", {
        csd: value || "",
        challanIds,
      });
      await fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: value
          ? `CSD "${value}" applied to ${res.data?.touched ?? challanIds.length} challans`
          : `CSD cleared on ${res.data?.touched ?? challanIds.length} challans`,
        showConfirmButton: false, timer: 2000,
      });
    } catch (err) {
      console.error("bulk csd failed", err);
      Swal.fire("Error", "Bulk CSD failed", "error");
    }
  }, [axiosSecure, fetchDeliveries, filteredRows]);

  /**
   * Split a product row by quantity.
   *
   * Use case: a row has qty = 2 (or any n > 1) and the user wants to
   * assign a different Trip Do to part of it.  We peel `splitQty` units
   * off into a brand-new row carrying the same product/model/capacity/
   * rate, but a fresh _id and NO tripDo.  The original row's qty is
   * reduced by the same amount.  After the split the user can edit Trip
   * Do on the new row independently from the original.
   *
   * Guards:
   *   - qty must be > 1 (nothing to split off a row of 1)
   *   - splitQty must be a positive integer strictly less than qty
   *     (we never let the original row go to 0; that's a delete, not a split)
   */
  const splitProductRow = useCallback(async (challan, product) => {
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
    const challanId = challan.challanId || challan._id;

    try {
      await axiosSecure.post("/deliveries/split-product", {
        challanId,
        productId: product._id,
        splitQty,
      });
      await fetchDeliveries(monthRef.current, yearRef.current, searchRef.current);
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: `Split: ${currentQty} → ${currentQty - splitQty} + ${splitQty}`,
        showConfirmButton: false, timer: 1800,
      });
    } catch (err) {
      console.error("split-product failed", err);
      const msg = err?.response?.data?.message || "Failed to split row";
      Swal.fire("Error", msg, "error");
    }
  }, [axiosSecure, fetchDeliveries]);

  // Table columns — action column added.
  // Capacity + Rate columns appended so the user can see the matcher's
  // result and edit it inline when needed.
  // Admin-only columns are flagged with `adminOnly: true` and filtered
  // out for non-admin users. The colgroup + tableW recompute below
  // automatically pick up the shorter list.
  const COLS = [
    { key: "date",     header: "Date",     w: 78  },
    { key: "type",     header: "Type",     w: 72  },
    { key: "customer", header: "Customer", w: 90  },
    { key: "csd",      header: "CSD",      w: 90  },
    { key: "receiver", header: "Receiver", w: 88  },
    { key: "address",  header: "Address",  w: 88  },
    { key: "district", header: "District", w: 68  },
    { key: "thana",    header: "Thana",    w: 68  },
    { key: "location", header: "Location", w: 80,  adminOnly: true },
    { key: "model",    header: "Model",    w: 140 },
    { key: "qty",      header: "Qty",      w: 60  },
    { key: "rate",     header: "Rate",     w: 60,  adminOnly: true },
    { key: "amount",   header: "Amount",   w: 80,  adminOnly: true },
    { key: "product",  header: "Product",  w: 110 },
    { key: "tripDo",   header: "Trip Do",  w: 70,  adminOnly: true },
    { key: "capacity", header: "Capacity", w: 95,  adminOnly: true },
    { key: "note",     header: "Note",     w: 88  },
    { key: "zone",     header: "Zone",     w: 65  },
  ].filter(c => isAdmin || !c.adminOnly);
  const tableW = COLS.reduce((s, c) => s + c.w, 0);
  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-sm font-black text-slate-800">Delivered Orders</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
              Qty: {totalQtyAll.toLocaleString()}
            </span>
          )}
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
              {f.label}: {f.values.length === 1 ? (f.values[0] === BLANK_TOKEN ? BLANK_LABEL : f.values[0]) : `${f.values.length} sel`}
              <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
            </span>
          ))}
          {activeFilterCount > 0 && <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">Clear all</button>}
          <div className="hidden sm:block flex-1" />
          {isMobile && (
            <button onClick={() => setShowMobileFilters(v => !v)}
              className={`${tbtn} ${activeFilterCount > 0 ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          )}
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
          </select>
          <input type="number" className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none`}
            value={year} onChange={e => setYear(parseInt(e.target.value))} />
          {isAdmin && (
            <button
              onClick={handleBulkTripDo}
              disabled={filteredRows.length === 0}
              className={`${tbtn} bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Apply a Trip Do number to every row currently shown by the filters">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h4"/></svg>
              <span className="hidden sm:inline">Bulk Trip Do</span><span className="sm:hidden">DO</span>
              {filteredRows.length > 0 && <span className="text-[9px] bg-white/20 rounded px-1">{filteredRows.length}</span>}
            </button>
          )}
          <button
            onClick={handleBulkCsd}
            disabled={filteredRows.length === 0}
            className={`${tbtn} bg-teal-600 text-white border-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Apply a CSD name to every challan currently shown by the filters">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
            <span className="hidden sm:inline">Bulk CSD</span><span className="sm:hidden">CSD</span>
          </button>
          <button onClick={handleResetAll} className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={handleExportExcel} className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span><span className="sm:hidden">XLS</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <LoadingSpinner variant="auto" />
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 m-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-semibold text-slate-600">No deliveries found</p>
            <p className="text-sm mt-1">Try adjusting filters or date range</p>
          </div>
        ) : isMobile ? (
          <div className="h-full overflow-y-auto p-2">
            {showMobileFilters && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2.5">
                  <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Date</p>
                    <MultiSelect options={getOptionsFor("date")} selected={dateFilter} onChange={setDateFilter} />
                  </div>
                  <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Type</p>
                    <TypeSelect value={typeFilter} onChange={setTypeFilter} />
                  </div>
                  {[
                    ["Customer", getOptionsFor("customerName"), customerFilter, setCustomerFilter, false],
                    ["CSD",      getOptionsFor("csd"),          csdFilter,      setCsdFilter,      false],
                    ["Zone",     getOptionsFor("zone"),         zoneFilter,     setZoneFilter,     false],
                    ["District", getOptionsFor("district"),     districtFilter, setDistrictFilter, false],
                    ["Thana",    getOptionsFor("thana"),        thanaFilter,    setThanaFilter,    false],
                    ["Location", getOptionsFor("location"),     locationFilter, setLocationFilter, true],
                    ["Product",  getOptionsFor("productName"),  productFilter,  setProductFilter,  false],
                    ["Model",    getOptionsFor("model"),        modelFilter,    setModelFilter,    false],
                    ["Capacity", getOptionsFor("capacity"),     capacityFilter, setCapacityFilter, true],
                    ["Trip Do",  getOptionsFor("tripDo"),       tripDoFilter,   setTripDoFilter,   true],
                    ["Address",  getOptionsFor("address"),      addressFilter,  setAddressFilter,  false],
                    ["Receiver", getOptionsFor("receiverNumber"), receiverFilter, setReceiverFilter, false],
                  ]
                    .filter(([, , , , adminOnly]) => isAdmin || !adminOnly)
                    .map(([label, opts, sel, chg]) => (
                    <div key={label}><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">{label}</p>
                      <MultiSelect options={opts} selected={sel} onChange={chg} /></div>
                  ))}
                  <div className="col-span-2"><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Note</p>
                    <MultiSelect options={getNoteOptions()} selected={noteFilter} onChange={setNoteFilter} /></div>
                </div>
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-2 py-2 text-xs text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-semibold">
                  Close Filters
                </button>
              </div>
            )}
            {paginatedRows.map((row, idx) => (
              <MobileCard key={idx} row={row} isAdmin={isAdmin} onSplit={splitProductRow} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-1">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                <span className="text-xs text-slate-500 font-medium">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="border-collapse" style={{ tableLayout: "fixed", width: tableW + "px", minWidth: "100%" }}>
                  <colgroup>{COLS.map(c => <col key={c.key} style={{ width: c.w + "px" }} />)}</colgroup>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-left">
                      {COLS.map(c => (
                        <th key={c.key} className="px-2 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">
                          {c.header}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      {COLS.map(c => {
                        // Each column's filter control. Keys map 1:1 to the
                        // COLS order above, so reordering COLS reorders these
                        // automatically with no risk of misalignment.
                        let el = null;
                        switch (c.key) {
                          case "date":     el = <MultiSelect options={getOptionsFor("date")} selected={dateFilter} onChange={setDateFilter} />; break;
                          case "type":     el = <TypeSelect value={typeFilter} onChange={setTypeFilter} />; break;
                          case "customer": el = <MultiSelect options={getOptionsFor("customerName")} selected={customerFilter} onChange={setCustomerFilter} />; break;
                          case "csd":      el = <MultiSelect options={getOptionsFor("csd")} selected={csdFilter} onChange={setCsdFilter} />; break;
                          case "zone":     el = <MultiSelect options={getOptionsFor("zone")} selected={zoneFilter} onChange={setZoneFilter} />; break;
                          case "address":  el = <MultiSelect options={getOptionsFor("address")} selected={addressFilter} onChange={setAddressFilter} />; break;
                          case "receiver": el = <MultiSelect options={getOptionsFor("receiverNumber")} selected={receiverFilter} onChange={setReceiverFilter} />; break;
                          case "district": el = <MultiSelect options={getOptionsFor("district")} selected={districtFilter} onChange={setDistrictFilter} />; break;
                          case "thana":    el = <MultiSelect options={getOptionsFor("thana")} selected={thanaFilter} onChange={setThanaFilter} />; break;
                          case "location": el = <MultiSelect options={getOptionsFor("location")} selected={locationFilter} onChange={setLocationFilter} />; break;
                          case "product":  el = <MultiSelect options={getOptionsFor("productName")} selected={productFilter} onChange={setProductFilter} />; break;
                          case "model":    el = <MultiSelect options={getOptionsFor("model")} selected={modelFilter} onChange={setModelFilter} />; break;
                          case "capacity": el = <MultiSelect options={getOptionsFor("capacity")} selected={capacityFilter} onChange={setCapacityFilter} />; break;
                          case "tripDo":   el = <MultiSelect options={getOptionsFor("tripDo")} selected={tripDoFilter} onChange={setTripDoFilter} />; break;
                          case "note":     el = <MultiSelect options={getNoteOptions()} selected={noteFilter} onChange={setNoteFilter} />; break;
                          case "qty":      el = <div className="text-center text-xs font-black text-slate-700">{totalQtyAll}</div>; break;
                          case "rate":     el = null; break;   // no summary — Amount carries the total
                          case "amount":   el = <div className="text-center text-[10px] font-black text-emerald-700 whitespace-nowrap">৳{totalAmountAll.toLocaleString()}</div>; break;
                          default:         el = null;
                        }
                        return <th key={c.key} className="p-0.5 border-r border-slate-200 last:border-0">{el}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => {
                      const { challan, product, date, isReturn, note, returnNote } = row;
                      const displayNote = isReturn ? returnNote : note;
                      const loc = resolveLocation(challan);
                      // Cell renderer keyed by column. Keeps the body in
                      // lockstep with COLS so the order above is the single
                      // source of truth for column sequence.
                      const renderCell = (key) => {
                        switch (key) {
                          case "date":
                            return <span className="block truncate">{date.toLocaleDateString("en-GB")}</span>;
                          case "type":
                            return isReturn
                              ? <span className="inline-flex px-1.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[9px] font-bold whitespace-nowrap">↩ Return</span>
                              : <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-bold whitespace-nowrap">↗ Delivery</span>;
                          case "customer":
                            return <span className="block truncate font-semibold text-slate-800">{challan.customerName}</span>;
                          case "csd":
                            return (
                              <CsdCell
                                row={row}
                                editingCsd={editingCsd}
                                setEditingCsd={setEditingCsd}
                                savingCsd={savingCsd}
                                onSave={saveCsd}
                              />
                            );
                          case "zone":
                            return <span className="block truncate">{challan.zone}</span>;
                          case "address":
                            return <span className="block truncate">{challan.address}</span>;
                          case "receiver":
                            return <span className="block truncate">{challan.receiverNumber}</span>;
                          case "district":
                            return <span className="block truncate">{challan.district}</span>;
                          case "thana":
                            return <span className="block truncate">{challan.thana}</span>;
                          case "location":
                            return loc
                              ? <span className={
                                  `inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border whitespace-nowrap ` +
                                  (loc === "ISD"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : loc === "OSD-Metro"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200")
                                }>{loc}</span>
                              : <span className="text-slate-300">—</span>;
                          case "product":
                            return <span className="block truncate text-slate-800">{product.productName || <span className="text-slate-300">—</span>}</span>;
                          case "model":
                            return <span className="block truncate uppercase font-mono text-[11px]">{product.model}</span>;
                          case "capacity": {
                            const savedCap   = product.capacity || "";
                            const display    = savedCap || row.effectiveCapacity || "";
                            const isComputed = !savedCap && !!row.effectiveCapacity;
                            if (!display) return <span className="text-slate-300">—</span>;
                            return (
                              <span className={"block truncate text-[11px] " + (isComputed ? "text-blue-600 italic" : "text-slate-700")}>
                                {display}
                              </span>
                            );
                          }
                          case "qty":
                            return (
                              <div className="inline-flex items-center justify-center gap-1 font-black text-slate-700">
                                <span>{product.quantity}</span>
                                {isAdmin && Number(product.quantity) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => splitProductRow(challan, product)}
                                    title={`Split this row (qty ${product.quantity}) into two — peel off some qty into a new row so it can take a different Trip Do`}
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
                            );
                          case "rate":
                            return row.effectiveRate ? (
                              <span
                                title={row.rateSource === "computed" ? "Auto-resolved from rate table (not yet saved)" : "Saved rate"}
                                className={
                                  "inline-block text-[11px] font-black rounded-md px-1.5 py-0.5 border " +
                                  (row.rateSource === "computed"
                                    ? "text-blue-700 bg-blue-50 border-blue-200 border-dashed"
                                    : "text-emerald-700 bg-emerald-50 border-emerald-200")
                                }
                              >
                                ৳{row.effectiveRate}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">—</span>
                            );
                          case "amount":
                            return row.effectiveAmount > 0
                              ? <span className="text-[11px] font-black text-emerald-700">৳{row.effectiveAmount.toLocaleString()}</span>
                              : <span className="text-slate-300 text-[10px]">—</span>;
                          case "tripDo":
                            return (
                              <TripDoCell
                                row={row}
                                editingCell={editingCell}
                                setEditingCell={setEditingCell}
                                savingCell={savingCell}
                                onSave={saveTripDo}
                              />
                            );
                          case "note":
                            return displayNote
                              ? <span className={`block truncate text-[10px] font-medium ${isReturn ? "text-orange-500" : "text-amber-600"}`}>{displayNote}</span>
                              : <span className="text-slate-300">—</span>;
                          default:
                            return null;
                        }
                      };
                      const cellAlign = (key) =>
                        key === "qty" || key === "rate" || key === "amount" ? "text-center" : "";
                      // Tooltip text for truncatable text columns (full value
                      // on hover). Interactive/badge columns get no title.
                      const cellTitle = (key) => {
                        switch (key) {
                          case "customer": return challan.customerName || "";
                          case "zone":     return challan.zone || "";
                          case "address":  return challan.address || "";
                          case "receiver": return challan.receiverNumber || "";
                          case "district": return challan.district || "";
                          case "thana":    return challan.thana || "";
                          case "product":  return product.productName || "";
                          case "model":    return product.model || "";
                          case "capacity": return product.capacity || row.effectiveCapacity || "";
                          case "note":     return displayNote || "";
                          case "csd":      return row.csd || challan.csd || "";
                          default:         return undefined;
                        }
                      };
                      return (
                        <tr key={idx} className={`border-b border-slate-100 transition-colors text-[12px] ${isReturn ? "bg-orange-50/40 hover:bg-orange-50" : "hover:bg-amber-50/30 even:bg-slate-50/40"}`}>
                          {COLS.map(c => (
                            <td key={c.key} className={`px-2 py-1.5 text-black overflow-hidden ${cellAlign(c.key)}`} title={cellTitle(c.key)}>
                              {renderCell(c.key)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
                  <p className="text-xs text-slate-500 font-medium">{(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">← Prev</button>
                    {pageNumbers.map((p, i) => p === "..." ? <span key={i} className="px-1.5 text-slate-400 text-xs">…</span> : (
                      <button key={i} onClick={() => setClientPage(p)}
                        className={`px-3 py-1.5 text-xs border rounded-lg font-semibold ${clientPage === p ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 bg-white hover:bg-slate-100"}`}>{p}</button>
                    ))}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 bg-white font-semibold">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   Inline editable cell for the Trip Do column on the Delivered page.

   Behaviour:
     - Default view shows the saved tripDo value (or "click to set")
     - Clicking switches it to an input
     - Enter → onSave; Escape → cancel
     - Blank input on Enter clears the tripDo on the row

   The editingCell shape is { challanId, productId, value } and lives
   on the page so only one cell is open at a time.
═══════════════════════════════════════════════════════════════════ */

const isTripDoEditing = (editingCell, challanId, productId) =>
  editingCell &&
  editingCell.challanId === challanId &&
  editingCell.productId === productId;

const TripDoCell = ({ row, editingCell, setEditingCell, savingCell, onSave }) => {
  const { challan, product } = row;
  const editing = isTripDoEditing(editingCell, challan._id, product._id);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!editing) {
    const display = product.tripDo || "";
    return (
      <button
        type="button"
        onClick={() =>
          setEditingCell({
            challanId: challan._id,
            productId: product._id,
            value: display,
          })
        }
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

  const value = editingCell.value ?? "";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) =>
          setEditingCell((cur) => ({ ...cur, value: e.target.value }))
        }
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditingCell(null);
          if (e.key === "Enter") {
            onSave(challan, product, (value || "").trim());
          }
        }}
        disabled={savingCell}
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

/* ════════════════════════════════════════════════════════════════════
   Inline editable cell for the CSD column on the Delivered page.

   CSD is a per-challan field (one value per challan, shared across that
   challan's product rows).  editingCsd is keyed by challanId only.
═══════════════════════════════════════════════════════════════════ */
const CsdCell = ({ row, editingCsd, setEditingCsd, savingCsd, onSave }) => {
  const { trip, challan } = row;
  const challanKey = challan.challanId || challan._id;
  const editing = editingCsd && editingCsd.challanId === challanKey;
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!editing) {
    const display = row.csd || challan.csd || "";
    return (
      <button
        type="button"
        onClick={() => setEditingCsd({ challanId: challanKey, value: display })}
        title={display ? "Click to edit CSD" : "Click to set CSD"}
        className="block w-full text-left truncate hover:bg-emerald-50 hover:text-emerald-700 px-1 -mx-1 rounded transition-colors text-[11px]"
      >
        {display ? (
          <span className="block truncate font-semibold text-slate-700">{display}</span>
        ) : (
          <span className="text-emerald-400 italic">click to set</span>
        )}
      </button>
    );
  }

  const value = editingCsd.value ?? "";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setEditingCsd((cur) => ({ ...cur, value: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditingCsd(null);
          if (e.key === "Enter") onSave(trip, challan, (value || "").trim());
        }}
        disabled={savingCsd}
        autoComplete="off"
        placeholder="CSD name"
        className="w-full px-1.5 py-0.5 border border-emerald-400 rounded text-[11px] outline-none focus:ring-2 focus:ring-emerald-300"
      />
      <div className="absolute top-full left-0 mt-0.5 text-[8px] text-slate-400">
        Enter to save · Esc to cancel
      </div>
    </div>
  );
};

export default DeliveredPage;