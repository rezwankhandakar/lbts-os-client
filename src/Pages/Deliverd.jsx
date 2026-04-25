
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import usePageParam from "../hooks/usePageParam";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const ITEMS_PER_PAGE = 100;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Multi-select ── */
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
  const label    = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} sel`;
  const toggle   = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-0.5 px-1.5 py-0.5 text-[11px] rounded-lg border transition-all text-left ${selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
        <span className="truncate flex-1">{label}</span>
        <span className="flex items-center gap-0.5 flex-shrink-0">
          {selected.length > 0 && <span className="text-slate-400 hover:text-white cursor-pointer text-[10px]" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
          <svg width="7" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
        </span>
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[140px] w-max max-w-[210px] overflow-hidden"
          style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 215) : 0 }}>
          <div className="p-1.5 border-b border-slate-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-2 text-xs text-slate-400 text-center">No results</div>
              : filtered.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs hover:bg-slate-50 ${selected.includes(opt) ? "bg-orange-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3 h-3 accent-orange-500 flex-shrink-0" />
                  <span className="truncate text-slate-700">{opt}</span>
                </label>
              ))
            }
          </div>
          {selected.length > 0 && (
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

/* ── Mobile Card ── */
const MobileCard = ({ row }) => {
  const { challan, product, date, isReturn, note, returnNote } = row;
  const displayNote = isReturn ? returnNote : note;
  return (
    <div className={`border rounded-xl p-3 mb-2 shadow-sm ${isReturn ? "bg-orange-50/60 border-orange-200" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-400">{date.toLocaleDateString("en-GB")}</span>
        {isReturn
          ? <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[10px] font-bold">↩ Return</span>
          : <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">↗ Delivery</span>
        }
      </div>
      <div className="mb-1.5">
        <span className="font-bold text-slate-800 text-sm">{challan.customerName}</span>
        {challan.zone && <span className="ml-2 text-[10px] text-slate-500 bg-slate-100 rounded-lg px-1.5 py-0.5">{challan.zone}</span>}
      </div>
      {challan.address && <p className="text-[11px] text-slate-500 mb-1.5 leading-tight">{challan.address}</p>}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {[
          { label: "District", value: challan.district },
          { label: "Thana",    value: challan.thana },
          { label: "Receiver", value: challan.receiverNumber },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] text-slate-400 uppercase font-bold">{label}</p>
            <p className="text-[11px] text-slate-600 truncate">{value || "—"}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-800 truncate block">{product.productName}</span>
          <span className="text-[10px] text-slate-400 uppercase">{product.model}</span>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className="text-[10px] text-slate-400">Qty</p>
          <span className="font-black text-slate-800 text-sm">{product.quantity}</span>
        </div>
      </div>
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

  const [deliveries,        setDeliveries]        = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [clientPage,        setClientPage]        = usePageParam("page");
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
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
        const rowType  = isReturn ? "return" : "delivery";
        if (typeFilter && typeFilter !== rowType) return;
        (challan.products || []).forEach(product => {
          const s = searchText?.toLowerCase() || "";
          const matchesSearch = !searchText || [challan.customerName, challan.zone, challan.address, challan.receiverNumber, challan.district, challan.thana, product.productName, product.model].some(v => v?.toString().toLowerCase().includes(s));
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
          rows.push({ trip, challan, product, date: new Date(trip.createdAt), isReturn, rowType,
            deliveryStatus: challan.deliveryStatus, challanReturnStatus: challan.challanReturnStatus,
            note: challan.note || "", returnNote: challan.returnNote || "" });
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
        const note = challan.isReturn ? (challan.returnNote || "") : (challan.note || "");
        if (note.trim() && !map.has(note.toLowerCase())) map.set(note.toLowerCase(), note.trim());
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const activeFilterGroups = [
    { label: "Customer", values: customerFilter, clear: () => setCustomerFilter([]) },
    { label: "Zone",     values: zoneFilter,     clear: () => setZoneFilter([]) },
    { label: "Address",  values: addressFilter,  clear: () => setAddressFilter([]) },
    { label: "Receiver", values: receiverFilter, clear: () => setReceiverFilter([]) },
    { label: "District", values: districtFilter, clear: () => setDistrictFilter([]) },
    { label: "Thana",    values: thanaFilter,    clear: () => setThanaFilter([]) },
    { label: "Product",  values: productFilter,  clear: () => setProductFilter([]) },
    { label: "Model",    values: modelFilter,    clear: () => setModelFilter([]) },
    ...(dateFilter ? [{ label: "Date", values: [dateFilter], clear: () => setDateFilter("") }] : []),
    ...(typeFilter ? [{ label: "Type", values: [typeFilter], clear: () => setTypeFilter("") }] : []),
    { label: "Note", values: noteFilter, clear: () => setNoteFilter([]) },
  ].filter(f => f.values.length > 0);

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
      let exportData = [];
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
    .filter(p => p === 1 || p === totalPages || Math.abs(p - clientPage) <= 2)
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
              {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length} sel`}
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
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
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
                    <input type="date" className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-400 bg-white"
                      value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                  </div>
                  <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Type</p>
                    <TypeSelect value={typeFilter} onChange={setTypeFilter} />
                  </div>
                  {[
                    ["Customer", getOptionsFor("customerName"), customerFilter, setCustomerFilter],
                    ["Zone",     getOptionsFor("zone"),         zoneFilter,     setZoneFilter],
                    ["District", getOptionsFor("district"),     districtFilter, setDistrictFilter],
                    ["Thana",    getOptionsFor("thana"),        thanaFilter,    setThanaFilter],
                    ["Product",  getOptionsFor("productName"),  productFilter,  setProductFilter],
                    ["Model",    getOptionsFor("model"),        modelFilter,    setModelFilter],
                    ["Address",  getOptionsFor("address"),      addressFilter,  setAddressFilter],
                    ["Receiver", getOptionsFor("receiverNumber"), receiverFilter, setReceiverFilter],
                  ].map(([label, opts, sel, chg]) => (
                    <div key={label}>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">{label}</p>
                      <MultiSelect options={opts} selected={sel} onChange={chg} />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Note</p>
                    <MultiSelect options={getNoteOptions()} selected={noteFilter} onChange={setNoteFilter} />
                  </div>
                </div>
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-2 py-2 text-xs text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-semibold">
                  Close Filters
                </button>
              </div>
            )}
            {paginatedRows.map((row, idx) => <MobileCard key={idx} row={row} />)}
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
                      <th className="p-0.5 border-r border-slate-200">
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                          className="w-full px-1 py-0.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-orange-400 bg-white" />
                      </th>
                      <th className="p-0.5 border-r border-slate-200"><TypeSelect value={typeFilter} onChange={setTypeFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("customerName")} selected={customerFilter} onChange={setCustomerFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("zone")}         selected={zoneFilter}     onChange={setZoneFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("address")}      selected={addressFilter}  onChange={setAddressFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("receiverNumber")} selected={receiverFilter} onChange={setReceiverFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("district")}     selected={districtFilter} onChange={setDistrictFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("thana")}        selected={thanaFilter}    onChange={setThanaFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("productName")}  selected={productFilter}  onChange={setProductFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200"><MultiSelect options={getOptionsFor("model")}        selected={modelFilter}    onChange={setModelFilter} /></th>
                      <th className="p-0.5 border-r border-slate-200 text-center text-xs font-black text-slate-700">{totalQtyAll}</th>
                      <th className="p-0.5"><MultiSelect options={getNoteOptions()} selected={noteFilter} onChange={setNoteFilter} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => {
                      const { challan, product, date, isReturn, note, returnNote } = row;
                      const displayNote = isReturn ? returnNote : note;
                      return (
                        <tr key={idx} className={`border-b border-slate-100 transition-colors text-[12px] ${isReturn ? "bg-orange-50/40 hover:bg-orange-50" : "hover:bg-amber-50/30 even:bg-slate-50/40"}`}>
                          <td className="px-2 py-1.5 text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">{date.toLocaleDateString("en-GB")}</td>
                          <td className="px-1 py-1.5 overflow-hidden">
                            {isReturn
                              ? <span className="inline-flex px-1.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[9px] font-bold whitespace-nowrap">↩ Return</span>
                              : <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-bold whitespace-nowrap">↗ Delivery</span>
                            }
                          </td>
                          <td className="px-2 py-1.5 font-semibold text-slate-800 overflow-hidden"><span className="block truncate">{challan.customerName}</span></td>
                          <td className="px-2 py-1.5 text-slate-600 overflow-hidden"><span className="block truncate">{challan.zone}</span></td>
                          <td className="px-2 py-1.5 text-slate-500 overflow-hidden" title={challan.address}><span className="block truncate">{challan.address}</span></td>
                          <td className="px-2 py-1.5 text-slate-600 overflow-hidden"><span className="block truncate">{challan.receiverNumber}</span></td>
                          <td className="px-2 py-1.5 text-slate-500 overflow-hidden"><span className="block truncate">{challan.district}</span></td>
                          <td className="px-2 py-1.5 text-slate-500 overflow-hidden"><span className="block truncate">{challan.thana}</span></td>
                          <td className="px-2 py-1.5 overflow-hidden"><span className="block truncate">{product.productName}</span></td>
                          <td className="px-2 py-1.5 text-slate-500 uppercase overflow-hidden font-mono text-[11px]"><span className="block truncate">{product.model}</span></td>
                          <td className="px-2 py-1.5 text-center font-black text-slate-700">{product.quantity}</td>
                          <td className="px-2 py-1.5 overflow-hidden" title={displayNote || ""}>
                            {displayNote
                              ? <span className={`block truncate text-[10px] font-medium ${isReturn ? "text-orange-500" : "text-amber-600"}`}>{displayNote}</span>
                              : <span className="text-slate-300">—</span>
                            }
                          </td>
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

export default DeliveredPage;
