
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";
import LoadingSpinner from "../Component/LoadingSpinner";

const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Multi-select ── */
const MultiSelectFilter = ({ options, selected, onChange, placeholder = "All" }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    const label    = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
    const toggle   = (val) => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    return (
        <div ref={ref} className="relative w-full">
            <button type="button" onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between gap-1 px-2 py-1 text-[11px] rounded-lg border transition-all text-left ${selected.length > 0 ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                <span className="truncate flex-1">{label}</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                    {selected.length > 0 && <span className="text-slate-400 hover:text-white cursor-pointer px-0.5" onClick={e => { e.stopPropagation(); onChange([]); }}>✕</span>}
                    <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? "M1 5L5 1L9 5" : "M1 1L5 5L9 1"} /></svg>
                </span>
            </button>
            {open && (
                <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl min-w-[150px] w-max max-w-[220px] overflow-hidden"
                    style={{ zIndex: 9999, top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0, left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 230) : 0 }}>
                    {options.length > 5 && (
                        <div className="p-1.5 border-b border-slate-100">
                            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
                        </div>
                    )}
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

const SimpleSelect = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
        className={`w-full px-2 py-1 text-[11px] rounded-lg border outline-none transition-all ${value ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-400"}`}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

/* ── Mobile Card ── */
const MobileCard = ({ r, onView }) => {
    const date = new Date(r.createdAt);
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-2 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <span className="text-[10px] text-slate-400 block">{date.toLocaleDateString("en-GB")}</span>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 font-mono font-bold text-slate-700 mt-0.5 inline-block">{r.tripNumber}</span>
                </div>
                <button onClick={() => onView(r)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition flex-shrink-0">View</button>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
                {[
                    { label: "Vendor",  value: r.vendorName },
                    { label: "Driver",  value: r.driverName },
                    { label: "Vehicle", value: r.vehicleNumber, upper: true },
                ].map(({ label, value, upper }) => (
                    <div key={label}>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
                        <p className={`text-xs text-slate-700 font-semibold truncate ${upper ? "uppercase" : ""}`}>{value || "—"}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100">
                <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Point</p>
                    <span className="font-black text-slate-700 text-sm">{r.point ?? "—"}</span>
                </div>
                <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Rent</p>
                    {r.rent != null
                        ? <span className="text-emerald-700 font-bold text-xs">৳{Number(r.rent).toLocaleString()}</span>
                        : <span className="px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-[9px] font-bold">Missing</span>
                    }
                </div>
                <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Lebor</p>
                    {r.leborBill != null
                        ? <span className="text-emerald-700 font-bold text-xs">৳{Number(r.leborBill).toLocaleString()}</span>
                        : <span className="px-1.5 py-0.5 bg-amber-50 text-amber-500 border border-amber-200 rounded-full text-[9px] font-bold">Missing</span>
                    }
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const CarRentPage = () => {
    const axiosSecure = useAxiosSecure();
    const { searchText, setSearchText } = useSearch();

    const [rentals,       setRentals]       = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [selectedRental,setSelectedRental]= useState(null);
    const [isMobile,      setIsMobile]      = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year,  setYear]  = useState(new Date().getFullYear());

    const [tripFilter,      setTripFilter]      = useState([]);
    const [vendorFilter,    setVendorFilter]    = useState([]);
    const [driverFilter,    setDriverFilter]    = useState([]);
    const [vehicleFilter,   setVehicleFilter]   = useState([]);
    const [dateFilter,      setDateFilter]      = useState("");
    const [rentFilter,      setRentFilter]      = useState("");
    const [leborBillFilter, setLeborBillFilter] = useState("");

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check(); window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const fetchRentals = async (m, y, search) => {
        setLoading(true);
        try {
            let url = `/car-rents?month=${m}&year=${y}&page=1&limit=5000`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const res = await axiosSecure.get(url);
            setRentals(res.data.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchRentals(month, year, searchText); }, [month, year, searchText]);

    const rentalRows = rentals.map(r => ({
        _id: r._id, tripNumber: r.tripNumber, vendorName: r.vendorName,
        vendorNumber: r.vendorNumber, driverName: r.driverName, driverNumber: r.driverNumber,
        vehicleNumber: r.vehicleNumber,
        point: r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,
        totalChallan: r.challans ? r.challans.filter(c => !c.isReturn).length : r.totalChallan,
        rent: r.rent, leborBill: r.leborBill, createdAt: r.createdAt,
        createdBy: r.createdBy, currentUser: r.currentUser, challans: r.challans,
        advance: r.advance ?? null, rentSavedBy: r.rentSavedBy ?? null,
        lastUpdatedBy: r.lastUpdatedBy ?? null, lastUpdatedAt: r.lastUpdatedAt ?? null,
    }));

    const handleRentalUpdate = (updatedRental) => {
        setRentals(prev => prev.map(r => r._id === updatedRental._id ? { ...r, ...updatedRental } : r));
        setSelectedRental(null);
    };

    const rowMatchesAll = (r, excludeField = null) => {
        const s = searchText?.toLowerCase() || "";
        const matchesSearch = !searchText || [r.tripNumber, r.vendorName, r.driverName, r.vehicleNumber].some(v => v?.toLowerCase().includes(s));
        const check = (field, filter, val) => field === excludeField || filter.length === 0 || filter.some(f => val?.toLowerCase() === f.toLowerCase());
        return matchesSearch &&
            check("tripNumber",    tripFilter,    r.tripNumber) &&
            check("vendorName",    vendorFilter,  r.vendorName) &&
            check("driverName",    driverFilter,  r.driverName) &&
            check("vehicleNumber", vehicleFilter, r.vehicleNumber) &&
            (excludeField === "date" || !dateFilter || new Date(r.createdAt).toISOString().slice(0, 10) === dateFilter) &&
            (!rentFilter      || (rentFilter      === "missing" && r.rent      == null) || (rentFilter      === "added" && r.rent      != null)) &&
            (!leborBillFilter || (leborBillFilter === "missing" && r.leborBill == null) || (leborBillFilter === "added" && r.leborBill != null));
    };

    const filteredRows = rentalRows.filter(r => rowMatchesAll(r));

    const getOptionsFor = (field) => {
        const map = new Map();
        rentalRows.forEach(r => {
            if (!rowMatchesAll(r, field)) return;
            const val = r[field]?.toString().trim();
            if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        });
        return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    };

    const handleReset = () => {
        setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
        if (setSearchText) setSearchText("");
        setTripFilter([]); setVendorFilter([]); setDriverFilter([]);
        setVehicleFilter([]); setDateFilter(""); setRentFilter(""); setLeborBillFilter("");
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Filters Cleared", showConfirmButton: false, timer: 1200 });
    };

    const activeFilterGroups = [
        { label: "Trip",    values: tripFilter,    clear: () => setTripFilter([]) },
        { label: "Vendor",  values: vendorFilter,  clear: () => setVendorFilter([]) },
        { label: "Driver",  values: driverFilter,  clear: () => setDriverFilter([]) },
        { label: "Vehicle", values: vehicleFilter, clear: () => setVehicleFilter([]) },
        ...(dateFilter      ? [{ label: "Date",  values: [dateFilter],      clear: () => setDateFilter("") }]      : []),
        ...(rentFilter      ? [{ label: "Rent",  values: [rentFilter],      clear: () => setRentFilter("") }]      : []),
        ...(leborBillFilter ? [{ label: "Lebor", values: [leborBillFilter], clear: () => setLeborBillFilter("") }] : []),
    ].filter(f => f.values.length > 0);

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
            let exportData = [];
            const toRow = (r) => ({
                Date: new Date(r.createdAt).toLocaleDateString(),
                "Trip Number": r.tripNumber, Vendor: r.vendorName,
                "Vendor Number": r.vendorNumber || "", Driver: r.driverName,
                "Driver Number": r.driverNumber || "", Vehicle: r.vehicleNumber,
                Point: r.point ?? "", Rent: r.rent ?? "", "Lebor Bill": r.leborBill ?? "",
            });
            if (exportType === "filtered") {
                if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
                exportData = filteredRows.map(toRow);
            } else {
                Swal.fire({ title: "Fetching…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const res = await axiosSecure.get(`/car-rents?month=${month}&year=${year}&page=1&limit=5000`);
                exportData = (res.data.data || []).map(toRow);
                if (!exportData.length) return Swal.fire({ icon: "warning", title: "No Data" });
                Swal.close();
            }
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CarRents");
            saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
                `CarRent_${exportType === "filtered" ? "Filtered" : "Full"}_${month}_${year}.xlsx`);
            Swal.fire({ icon: "success", title: "Exported!", text: `${exportData.length} rows`, timer: 1800, showConfirmButton: false });
        } catch { Swal.fire("Error", "Export failed", "error"); }
    };

    const totalRent      = filteredRows.reduce((s, r) => s + (r.rent      != null ? Number(r.rent)      : 0), 0);
    const totalLeborBill = filteredRows.reduce((s, r) => s + (r.leborBill != null ? Number(r.leborBill) : 0), 0);
    const totalBill      = totalRent + totalLeborBill;
    const rentMissing    = filteredRows.filter(r => r.rent == null).length;
    const leborMissing   = filteredRows.filter(r => r.leborBill == null).length;

    const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden page-enter">

            {/* ── HEADER ── */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">

                    {/* Title */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        </div>
                        <h2 className="text-sm font-black text-slate-800">Car Rent</h2>
                    </div>

                    <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
                        {filteredRows.length} trips
                    </span>

                    {/* Status badges */}
                    {rentMissing > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-0.5 shrink-0">
                            ⚠ Rent: {rentMissing}
                        </span>
                    )}
                    {leborMissing > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5 shrink-0">
                            ⚠ Lebor: {leborMissing}
                        </span>
                    )}
                    {rentMissing === 0 && leborMissing === 0 && filteredRows.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 shrink-0">
                            ✓ All complete
                        </span>
                    )}

                    {/* Totals */}
                    {filteredRows.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                                Rent <span className="font-black text-slate-800">৳{totalRent.toLocaleString()}</span>
                            </span>
                            <span className="text-slate-300 text-xs">+</span>
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                                Lebor <span className="font-black text-slate-800">৳{totalLeborBill.toLocaleString()}</span>
                            </span>
                            <span className="text-slate-300 text-xs">=</span>
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5">
                                ৳{totalBill.toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="hidden sm:block flex-1" />

                    {/* Active filter chips */}
                    {activeFilterGroups.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded-lg font-bold shrink-0">
                            {f.label}: {f.values.length === 1 ? f.values[0] : `${f.values.length}`}
                            <button onClick={f.clear} className="text-slate-400 hover:text-white ml-0.5">✕</button>
                        </span>
                    ))}
                    {activeFilterGroups.length > 0 && (
                        <button onClick={handleReset} className="text-[9px] text-red-400 hover:text-red-600 underline shrink-0 font-semibold">Clear all</button>
                    )}

                    <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
                        value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                        {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
                    </select>

                    <input type="number" className={`${tbtn} border-slate-200 text-slate-700 bg-white w-20 focus:outline-none`}
                        value={year} onChange={e => setYear(parseInt(e.target.value))} />

                    <button onClick={handleReset} className={`${tbtn} border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button onClick={handleExportExcel} className={`${tbtn} bg-rose-600 text-white border-rose-600 hover:bg-rose-700`}>
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
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        </div>
                        <p className="font-semibold text-slate-600">No records found</p>
                        <p className="text-sm mt-1">Try adjusting filters or date range</p>
                    </div>
                ) : isMobile ? (
                    <div className="h-full overflow-y-auto p-2">
                        {/* Mobile filter bar */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2.5 shadow-sm">
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Date</p>
                                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-[10px] outline-none focus:border-orange-400 bg-white" />
                            </div>
                            <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Trip</p><MultiSelectFilter options={getOptionsFor("tripNumber")} selected={tripFilter} onChange={setTripFilter} /></div>
                            <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Vendor</p><MultiSelectFilter options={getOptionsFor("vendorName")} selected={vendorFilter} onChange={setVendorFilter} /></div>
                            <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Driver</p><MultiSelectFilter options={getOptionsFor("driverName")} selected={driverFilter} onChange={setDriverFilter} /></div>
                            <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Vehicle</p><MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></div>
                            <div><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Rent</p>
                                <SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "Added" }, { value: "missing", label: "Missing" }]} />
                            </div>
                            <div className="col-span-2"><p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Lebor Bill</p>
                                <SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "Added" }, { value: "missing", label: "Missing" }]} />
                            </div>
                        </div>
                        {filteredRows.map((r, i) => <MobileCard key={i} r={r} onView={setSelectedRental} />)}
                    </div>
                ) : (
                    <div className="h-full bg-white border border-slate-200 rounded-2xl shadow-sm mx-3 my-2 overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <table className="w-full border-collapse" style={{ minWidth: "700px" }}>
                                <thead className="sticky top-0 z-20">
                                    <tr className="bg-slate-900 text-left">
                                        {["Date","Trip Number","Vendor","Driver","Vehicle","Point","Rent","Lebor Bill","Action"].map(h => (
                                            <th key={h} className="px-2.5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                                        ))}
                                    </tr>
                                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                                        <th className="p-1 border-r border-slate-200">
                                            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-orange-400 bg-white" />
                                        </th>
                                        <th className="p-1 border-r border-slate-200"><MultiSelectFilter options={getOptionsFor("tripNumber")}    selected={tripFilter}    onChange={setTripFilter} /></th>
                                        <th className="p-1 border-r border-slate-200"><MultiSelectFilter options={getOptionsFor("vendorName")}   selected={vendorFilter}  onChange={setVendorFilter} /></th>
                                        <th className="p-1 border-r border-slate-200"><MultiSelectFilter options={getOptionsFor("driverName")}   selected={driverFilter}  onChange={setDriverFilter} /></th>
                                        <th className="p-1 border-r border-slate-200"><MultiSelectFilter options={getOptionsFor("vehicleNumber")} selected={vehicleFilter} onChange={setVehicleFilter} /></th>
                                        <th className="p-1 border-r border-slate-200" />
                                        <th className="p-1 border-r border-slate-200">
                                            <SimpleSelect value={rentFilter} onChange={setRentFilter} options={[{ value: "", label: "All" }, { value: "added", label: "Added" }, { value: "missing", label: "Missing" }]} />
                                        </th>
                                        <th className="p-1 border-r border-slate-200">
                                            <SimpleSelect value={leborBillFilter} onChange={setLeborBillFilter} options={[{ value: "", label: "All" }, { value: "added", label: "Added" }, { value: "missing", label: "Missing" }]} />
                                        </th>
                                        <th className="p-1" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((r, i) => {
                                        const date = new Date(r.createdAt);
                                        return (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-amber-50/30 even:bg-slate-50/40 transition-colors text-center text-[12px]">
                                                <td className="px-2.5 py-2 text-slate-500 whitespace-nowrap text-left">{date.toLocaleDateString("en-GB")}</td>
                                                <td className="px-2.5 py-2">
                                                    <span className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 font-mono font-bold">{r.tripNumber}</span>
                                                </td>
                                                <td className="px-2.5 py-2 text-slate-700 font-medium max-w-[120px] truncate text-left">{r.vendorName}</td>
                                                <td className="px-2.5 py-2 text-slate-700 font-medium max-w-[120px] truncate text-left">{r.driverName}</td>
                                                <td className="px-2.5 py-2 text-slate-600 uppercase font-mono text-[11px]">{r.vehicleNumber}</td>
                                                <td className="px-2.5 py-2 font-black text-slate-700">{r.point ?? "—"}</td>
                                                <td className="px-2.5 py-2 font-semibold">
                                                    {r.rent != null
                                                        ? <span className="text-emerald-700">৳{Number(r.rent).toLocaleString()}</span>
                                                        : <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-[10px] font-bold">Missing</span>
                                                    }
                                                </td>
                                                <td className="px-2.5 py-2 font-semibold">
                                                    {r.leborBill != null
                                                        ? <span className="text-emerald-700">৳{Number(r.leborBill).toLocaleString()}</span>
                                                        : <span className="px-2 py-0.5 bg-amber-50 text-amber-500 border border-amber-200 rounded-full text-[10px] font-bold">Missing</span>
                                                    }
                                                </td>
                                                <td className="px-2.5 py-2">
                                                    <button onClick={() => setSelectedRental(r)}
                                                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black rounded-lg transition">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <CarRentDetailsModal
                selectedRental={selectedRental}
                setSelectedRental={setSelectedRental}
                onRentalUpdate={handleRentalUpdate}
                onSaved={() => { if (!rentFilter) setRentFilter("missing"); }}
            />
        </div>
    );
};

export default CarRentPage;
