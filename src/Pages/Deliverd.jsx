import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import usePageParam from "../hooks/usePageParam";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const ITEMS_PER_PAGE = 100;

/* ── Multi-select dropdown ── */
const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const label = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} sel`;
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-0.5 px-1.5 py-0.5 text-[11px] rounded border transition-all text-left leading-tight
          ${selected.length > 0 ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}
      >
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-0.5 shrink-0">
          {selected.length > 0 && (
            <span className="text-gray-400 hover:text-gray-700 leading-none cursor-pointer text-[10px]"
              onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>
          )}
          <svg width="7" height="7" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} />
          </svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-gray-200 rounded shadow-xl min-w-[140px] w-max max-w-[200px] overflow-hidden"
          style={{
            zIndex: 9999,
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
            left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 205) : 0,
          }}
        >
          <div className="p-1.5 border-b border-gray-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none" />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-gray-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${selected.includes(opt) ? "bg-gray-50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                    className="w-3 h-3 cursor-pointer accent-gray-800 shrink-0" />
                  <span className="truncate">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <button onClick={() => onChange([])}
                className="w-full text-[10px] text-gray-400 uppercase tracking-widest py-1 hover:text-gray-700 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Type filter ── */
const TypeSelect = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`w-full px-1 py-0.5 text-[11px] rounded border outline-none transition-all
      ${value ? "border-gray-600 bg-gray-100 text-gray-800" : "border-gray-300 bg-white text-gray-400"}`}>
    <option value="">All</option>
    <option value="delivery">Delivery</option>
    <option value="return">Return</option>
  </select>
);

/* ── Mobile Card ── */
const MobileCard = ({ row }) => {
  const { challan, product, date, isReturn, note, returnNote } = row;
  const displayNote = isReturn ? returnNote : note;
  return (
    <div className={`border rounded-lg p-3 mb-2 shadow-sm ${isReturn ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-gray-400">{date.toLocaleDateString("en-GB")}</span>
        {isReturn
          ? <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded text-[10px] font-bold uppercase">↩ Return</span>
          : <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold uppercase">↗ Delivery</span>
        }
      </div>
      <div className="mb-1.5">
        <span className="font-semibold text-gray-800 text-sm">{challan.customerName}</span>
        {challan.zone && <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{challan.zone}</span>}
      </div>
      {challan.address && <p className="text-[11px] text-gray-500 mb-1.5 leading-tight">{challan.address}</p>}
      <div className="grid grid-cols-3 gap-1 mb-2 text-xs">
        <div><span className="text-[10px] text-gray-400 block">District</span><span className="text-gray-600 truncate block">{challan.district || "—"}</span></div>
        <div><span className="text-[10px] text-gray-400 block">Thana</span><span className="text-gray-600 truncate block">{challan.thana || "—"}</span></div>
        <div><span className="text-[10px] text-gray-400 block">Receiver</span><span className="text-gray-600 truncate block">{challan.receiverNumber || "—"}</span></div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-700 truncate block">{product.productName}</span>
          <span className="text-[10px] text-gray-400 uppercase">{product.model}</span>
        </div>
        <div className="text-right shrink-0 ml-2">
          <span className="text-[10px] text-gray-400 block">Qty</span>
          <span className="font-bold text-gray-800 text-sm">{product.quantity}</span>
        </div>
      </div>
      {displayNote && <p className={`mt-1.5 text-[10px] italic truncate ${isReturn ? "text-orange-500" : "text-amber-600"}`}>{displayNote}</p>}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const DeliveredPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries,        setDeliveries]        = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [clientPage, setClientPage] = usePageParam("page");
  const [isMobile,          setIsMobile]          = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [customerFilter, setCustomerFilter] = useState([]);
  const [zoneFilter,     setZoneFilter]     = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [thanaFilter,    setThanaFilter]    = useState([]);
  const [productFilter,  setProductFilter]  = useState([]);
  const [modelFilter,    setModelFilter]    = useState([]);
  const [addressFilter,  setAddressFilter]  = useState([]);
  const [receiverFilter, setReceiverFilter] = useState([]);
  const [dateFilter,     setDateFilter]     = useState("");
  const [typeFilter,     setTypeFilter]     = useState("");
  const [noteFilter,     setNoteFilter]     = useState([]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year,  setYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const setFilter = (setter) => (val) => { setter(val); };

  const fetchDeliveries = async (m, y, search) => {
    setLoading(true);
    try {
      const url = search
        ? `/deliveries?search=${encodeURIComponent(search)}&page=1&limit=5000`
        : `/deliveries?month=${m}&year=${y}&page=1&limit=5000`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchDeliveries(month, year, searchText); }, [month, year, searchText]);

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setCustomerFilter([]); setZoneFilter([]); setDistrictFilter([]);
    setThanaFilter([]); setProductFilter([]); setModelFilter([]);
    setAddressFilter([]); setReceiverFilter([]); setDateFilter("");
    setTypeFilter(""); setNoteFilter([]); setShowMobileFilters(false);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
  };

  const buildRows = () => {
    const rows = [];
    deliveries.forEach(trip => {
      (trip.challans || []).forEach(challan => {
        const isReturn = challan.isReturn === true;
        const rowType = isReturn ? "return" : "delivery";
        if (typeFilter && typeFilter !== rowType) return;
        (challan.products || []).forEach(product => {
          const s = searchText?.toLowerCase() || "";
          const matchesSearch = !searchText || [
            challan.customerName, challan.zone, challan.address,
            challan.receiverNumber, challan.district, challan.thana,
            product.productName, product.model
          ].some(v => v?.toString().toLowerCase().includes(s));
          if (!matchesSearch) return;
          const challanDate = new Date(trip.createdAt).toISOString().slice(0, 10);
          if (dateFilter && challanDate !== dateFilter) return;
          const check = (filter, val) => filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
          if (!check(customerFilter, challan.customerName)) return;
          if (!check(zoneFilter,     challan.zone))         return;
          if (!check(addressFilter,  challan.address))      return;
          if (!check(receiverFilter, challan.receiverNumber)) return;
          if (!check(districtFilter, challan.district))     return;
          if (!check(thanaFilter,    challan.thana))        return;
          if (!check(productFilter,  product.productName))  return;
          if (!check(modelFilter,    product.model))        return;
          if (noteFilter.length > 0) {
            const noteVal = isReturn ? (challan.returnNote || "") : (challan.note || "");
            if (!noteFilter.some(f => noteVal.toLowerCase() === f.toLowerCase())) return;
          }
          rows.push({
            trip, challan, product, date: new Date(trip.createdAt), isReturn, rowType,
            deliveryStatus: challan.deliveryStatus, challanReturnStatus: challan.challanReturnStatus,
            note: challan.note || "", returnNote: challan.returnNote || "",
          });
        });
      });
    });
    return rows;
  };

  const filteredRows  = buildRows();
  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE);
  const totalQtyAll   = filteredRows.reduce((s, { product }) => s + (Number(product.quantity) || 0), 0);

  const getOptionsFor = (field) => {
    const map = new Map();
    deliveries.forEach(trip => {
      (trip.challans || []).forEach(challan => {
        (challan.products || []).forEach(product => {
          const val = (field === "productName" || field === "model") ? product[field]?.trim() : challan[field]?.trim();
          if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const getNoteOptions = () => {
    const map = new Map();
    deliveries.forEach(trip => {
      (trip.challans || []).forEach(challan => {
        const isRet = challan.isReturn === true;
        const note = isRet ? (challan.returnNote || "") : (challan.note || "");
        if (note.trim() && !map.has(note.toLowerCase())) map.set(note.toLowerCase(), note.trim());
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Customer", values: customerFilter, clear: () => { setCustomerFilter([]); } },
    { label: "Zone",     values: zoneFilter,     clear: () => { setZoneFilter([]); } },
    { label: "Address",  values: addressFilter,  clear: () => { setAddressFilter([]); } },
    { label: "Receiver", values: receiverFilter, clear: () => { setReceiverFilter([]); } },
    { label: "District", values: districtFilter, clear: () => { setDistrictFilter([]); } },
    { label: "Thana",    values: thanaFilter,    clear: () => { setThanaFilter([]); } },
    { label: "Product",  values: productFilter,  clear: () => { setProductFilter([]); } },
    { label: "Model",    values: modelFilter,    clear: () => { setModelFilter([]); } },
    ...(dateFilter ? [{ label: "Date", values: [dateFilter], clear: () => { setDateFilter(""); } }] : []),
    ...(typeFilter ? [{ label: "Type", values: [typeFilter], clear: () => { setTypeFilter(""); } }] : []),
    { label: "Note",     values: noteFilter,     clear: () => { setNoteFilter([]); } },
  ].filter(f => f.values.length > 0);

  const activeFilterCount = activeFilterGroups.reduce((n, f) => n + f.values.length, 0);

  const handleExportExcel = async () => {
    const { value: exportType } = await Swal.fire({
      title: "Export to Excel",
      html: `<div style="text-align:left;padding:8px 0">
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px">Which data to export?</p>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="filtered" checked style="accent-color:#374151">
          <span><b>Filtered data</b> — currently visible (${filteredRows.length} rows)</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
          <input type="radio" name="et" value="full">
          <span><b>Full month</b> — ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}</span>
        </label>
      </div>`,
      showCancelButton: true, confirmButtonColor: "#374151",
      confirmButtonText: "Export", cancelButtonText: "Cancel",
      preConfirm: () => document.querySelector('input[name="et"]:checked')?.value || "filtered",
    });
    if (!exportType) return;
    try {
      let exportData = [];
      const toRow = (row) => ({
        Date: row.date.toLocaleDateString(), Type: row.isReturn ? "Return" : "Delivery",
        "Trip No": row.trip.tripNumber || "", Customer: row.challan.customerName,
        Zone: row.challan.zone, Address: row.challan.address,
        "Receiver Number": row.challan.receiverNumber, District: row.challan.district,
        Thana: row.challan.thana, Product: row.product.productName,
        Model: row.product.model, Qty: Number(row.product.quantity) || 0,
        "Delivery Status": row.deliveryStatus || "Pending",
        "Challan Status": row.challanReturnStatus || "—",
        Note: row.note || row.returnNote || "",
      });
      if (exportType === "filtered") {
        if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
        exportData = filteredRows.map(toRow);
      } else {
        Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}&page=1&limit=5000`);
        (res.data.data || []).forEach(trip => {
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
        Swal.close();
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
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= (isMobile ? 1 : 2))
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const COLS = [
    { key: "date",     header: "Date",     w: 78  },
    { key: "type",     header: "Type",     w: 72  },
    { key: "customer", header: "Customer", w: 90  },
    { key: "zone",     header: "Zone",     w: 65  },
    { key: "address",  header: "Address",  w: 88  },
    { key: "receiver", header: "Receiver", w: 88  },
    { key: "district", header: "District", w: 68  },
    { key: "thana",    header: "Thana",    w: 68  },
    { key: "product",  header: "Product",  w: 100 },
    { key: "model",    header: "Model",    w: 96  },
    { key: "qty",      header: "Qty",      w: 38  },
    { key: "note",     header: "Note",     w: 88  },
  ];
  const tableW = COLS.reduce((s, c) => s + c.w, 0);

  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  /* ════════════════════════════════════════════════════════════════
     RENDER — full height, no double scroll
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ══ COMPACT HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">

          {/* Title */}
          <h2 className="text-sm font-bold text-gray-800 shrink-0">Delivered Orders</h2>

          {/* Count + total qty */}
          <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
            {filteredRows.length} rows{totalPages > 1 && ` · p${clientPage}/${totalPages}`}
          </span>
          {filteredRows.length > 0 && (
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 shrink-0">
              Qty: {totalQtyAll}
            </span>
          )}

          {/* Active filter chips */}
          {activeFilterGroups.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 text-white text-[9px] rounded shrink-0">
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} sel`}
              <button onClick={f.clear} className="text-gray-400 hover:text-white ml-0.5 leading-none">✕</button>
            </span>
          ))}
          {activeFilterCount > 0 && (
            <button onClick={handleResetAll} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0">Clear all</button>
          )}

          {/* Spacer */}
          <div className="hidden sm:block flex-1" />

          {/* Mobile filter toggle */}
          {isMobile && (
            <button onClick={() => setShowMobileFilters(v => !v)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all shrink-0
                ${activeFilterCount > 0 ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
          )}

          {/* Month */}
          <select className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 focus:outline-none shrink-0"
            value={month} onChange={e => { setMonth(parseInt(e.target.value)); }}>
            {MONTHS_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>
            ))}
          </select>

          {/* Year */}
          <input type="number"
            className="border border-gray-300 px-2 py-1 rounded text-xs bg-white text-gray-700 w-16 focus:outline-none shrink-0"
            value={year} onChange={e => { setYear(parseInt(e.target.value)); }} />

          {/* Reset */}
          <button onClick={handleResetAll}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shrink-0 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Export */}
          <button onClick={handleExportExcel}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-700 transition-all shrink-0 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">XLS</span>
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 italic text-sm border border-dashed border-gray-200 rounded-lg m-3 bg-white">
            No deliveries found.
          </div>
        ) : isMobile ? (

          /* ════ MOBILE ════ */
          <div className="h-full overflow-y-auto p-2">
            {/* Mobile filter panel */}
            {showMobileFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                    <input type="date" className="w-full px-1.5 py-1 border border-gray-300 rounded text-[10px] outline-none"
                      value={dateFilter} onChange={e => { setDateFilter(e.target.value); }} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Type</label>
                    <TypeSelect value={typeFilter} onChange={setFilter(setTypeFilter)} />
                  </div>
                  {[
                    ["Customer", getOptionsFor("customerName"), customerFilter, setFilter(setCustomerFilter)],
                    ["Zone",     getOptionsFor("zone"),         zoneFilter,     setFilter(setZoneFilter)],
                    ["District", getOptionsFor("district"),     districtFilter, setFilter(setDistrictFilter)],
                    ["Thana",    getOptionsFor("thana"),        thanaFilter,    setFilter(setThanaFilter)],
                    ["Product",  getOptionsFor("productName"),  productFilter,  setFilter(setProductFilter)],
                    ["Model",    getOptionsFor("model"),        modelFilter,    setFilter(setModelFilter)],
                    ["Address",  getOptionsFor("address"),      addressFilter,  setFilter(setAddressFilter)],
                    ["Receiver", getOptionsFor("receiverNumber"), receiverFilter, setFilter(setReceiverFilter)],
                  ].map(([label, opts, sel, chg]) => (
                    <div key={label}>
                      <label className="text-[10px] text-gray-400 block mb-0.5">{label}</label>
                      <MultiSelectFilter options={opts} selected={sel} onChange={chg} placeholder="All" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 block mb-0.5">Note</label>
                    <MultiSelectFilter options={getNoteOptions()} selected={noteFilter} onChange={setFilter(setNoteFilter)} placeholder="All" />
                  </div>
                </div>
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-2 py-1.5 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  Close Filters
                </button>
              </div>
            )}
            {paginatedRows.map((row, idx) => <MobileCard key={idx} row={row} />)}
            {/* Mobile pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-1 mt-2">
                <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                  className="px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 bg-white">← Prev</button>
                <span className="text-xs text-gray-500">{clientPage} / {totalPages}</span>
                <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                  className="px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 bg-white">Next →</button>
              </div>
            )}
          </div>

        ) : (

          /* ════ DESKTOP — single scroll, pagination fixed at bottom ════ */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">

              {/* Table — scrollable */}
              <div className="overflow-auto flex-1">
                <table className="border-collapse" style={{ tableLayout: "fixed", width: tableW + "px", minWidth: "100%" }}>
                  <colgroup>
                    {COLS.map(c => <col key={c.key} style={{ width: c.w + "px" }} />)}
                  </colgroup>
                  <thead className="sticky top-0 z-20">
                    {/* Column headers */}
                    <tr className="bg-gray-800 text-white text-left">
                      {COLS.map(c => (
                        <th key={c.key} className="px-2 py-2 font-normal text-[11px] uppercase tracking-wide whitespace-nowrap border-r border-white/10 last:border-r-0">
                          {c.header}
                        </th>
                      ))}
                    </tr>
                    {/* Filter row — always visible */}
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-0.5 border-r border-gray-200">
                        <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); }}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-[10px] outline-none focus:border-gray-500 bg-white" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <TypeSelect value={typeFilter} onChange={setFilter(setTypeFilter)} />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("customerName")} selected={customerFilter} onChange={setFilter(setCustomerFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("zone")} selected={zoneFilter} onChange={setFilter(setZoneFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("address")} selected={addressFilter} onChange={setFilter(setAddressFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("receiverNumber")} selected={receiverFilter} onChange={setFilter(setReceiverFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("district")} selected={districtFilter} onChange={setFilter(setDistrictFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("thana")} selected={thanaFilter} onChange={setFilter(setThanaFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("productName")} selected={productFilter} onChange={setFilter(setProductFilter)} placeholder="All" />
                      </th>
                      <th className="p-0.5 border-r border-gray-200">
                        <MultiSelectFilter options={getOptionsFor("model")} selected={modelFilter} onChange={setFilter(setModelFilter)} placeholder="All" />
                      </th>
                      {/* Qty total */}
                      <th className="p-0.5 border-r border-gray-200 text-center font-bold text-gray-700 text-[11px]">
                        {totalQtyAll}
                      </th>
                      <th className="p-0.5">
                        <MultiSelectFilter options={getNoteOptions()} selected={noteFilter} onChange={setFilter(setNoteFilter)} placeholder="All" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => {
                      const { challan, product, date, isReturn, note, returnNote } = row;
                      const displayNote = isReturn ? returnNote : note;
                      return (
                        <tr key={idx} className={`border-b border-gray-100 transition-colors text-[12px]
                          ${isReturn ? "bg-orange-50/50 hover:bg-orange-100/50" : "hover:bg-amber-50 even:bg-gray-50/40"}`}>
                          <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                            {date.toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-1 py-1.5 overflow-hidden">
                            {isReturn
                              ? <span className="inline-flex px-1 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded text-[9px] font-bold uppercase whitespace-nowrap">↩ Return</span>
                              : <span className="inline-flex px-1 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase whitespace-nowrap">↗ Delivery</span>
                            }
                          </td>
                          <td className="px-2 py-1.5 font-medium text-gray-800 overflow-hidden">
                            <span className="block truncate">{challan.customerName}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-600 overflow-hidden">
                            <span className="block truncate">{challan.zone}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-500 overflow-hidden" title={challan.address}>
                            <span className="block truncate">{challan.address}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-600 overflow-hidden">
                            <span className="block truncate">{challan.receiverNumber}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-500 overflow-hidden">
                            <span className="block truncate">{challan.district}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-500 overflow-hidden">
                            <span className="block truncate">{challan.thana}</span>
                          </td>
                          <td className="px-2 py-1.5 overflow-hidden">
                            <span className="block truncate">{product.productName}</span>
                          </td>
                          <td className="px-2 py-1.5 text-gray-500 uppercase overflow-hidden">
                            <span className="block truncate">{product.model}</span>
                          </td>
                          <td className="px-2 py-1.5 text-center font-semibold text-gray-800">
                            {product.quantity}
                          </td>
                          <td className="px-2 py-1.5 overflow-hidden" title={displayNote || ""}>
                            {displayNote
                              ? <span className={`block truncate text-[10px] ${isReturn ? "text-orange-500" : "text-amber-600"}`}>{displayNote}</span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination — table এর নিচে fixed, scroll এর বাইরে */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
                  <p className="text-xs text-gray-500">
                    {(clientPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientPage * ITEMS_PER_PAGE, filteredRows.length)} / {filteredRows.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setClientPage(p => Math.max(1, p - 1))} disabled={clientPage === 1}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors">← Prev</button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="px-1.5 text-gray-400 text-xs">…</span>
                      ) : (
                        <button key={i} onClick={() => setClientPage(p)}
                          className={`px-2.5 py-1 text-xs border rounded transition-colors ${clientPage === p ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 hover:bg-gray-100"}`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setClientPage(p => Math.min(totalPages, p + 1))} disabled={clientPage === totalPages}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors">Next →</button>
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

export default DeliveredPage;