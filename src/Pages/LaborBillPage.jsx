import React, { useState, useEffect, useCallback, useMemo } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import LoadingSpinner from "../Component/LoadingSpinner";

const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();

const LaborBillPage = () => {
  const axiosSecure = useAxiosSecure();
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [isMobile, setIsMobile] = useState(false);

  /* Filters */
  const [floorFilter,    setFloorFilter]    = useState("");  // "" | "1"–"15" | "carrying"
  const [searchText,     setSearchText]     = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/labor-bill?month=${month}&year=${year}`);
      if (res.data.success) setRows(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [month, year, axiosSecure]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (floorFilter === "carrying") return r.carrying && !r.floor;
      if (floorFilter)               return String(r.floor) === floorFilter;
      if (searchText) {
        const s = searchText.toLowerCase();
        return [r.customerName, r.zone, r.address, r.district, r.thana, r.carrying]
          .some(v => v?.toLowerCase().includes(s));
      }
      return true;
    });
  }, [rows, floorFilter, searchText]);

  /* Summary */
  const summary = useMemo(() => {
    const byFloor = {};
    let carryCount = 0;
    filteredRows.forEach(r => {
      if (r.floor) {
        byFloor[r.floor] = (byFloor[r.floor] || 0) + 1;
      }
      if (r.carrying) carryCount++;
    });
    const totalPics = filteredRows.reduce((s, r) =>
      s + (r.products || []).reduce((ps, p) => ps + Number(p.quantity || 0), 0), 0);
    return { byFloor, carryCount, totalPics, total: filteredRows.length };
  }, [filteredRows]);

  const YEARS = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

  const handleExport = () => {
    if (!filteredRows.length) return Swal.fire({ icon: "warning", title: "No Data" });
    const data = [];
    filteredRows.forEach(r => {
      (r.products || []).forEach(p => {
        data.push({
          Date:        new Date(r.createdAt).toLocaleDateString("en-GB"),
          "Trip No":   r.tripNumber || "",
          Customer:    r.customerName,
          Zone:        r.zone,
          Address:     r.address,
          District:    r.district,
          Thana:       r.thana,
          Receiver:    r.receiverNumber,
          Product:     p.productName,
          Model:       p.model,
          Qty:         Number(p.quantity) || 0,
          Floor:       r.floor || "",
          Carrying:    r.carrying || "",
          Note:        r.note || "",
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labor Bill");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `LaborBill_${MONTHS_FULL[month-1]}_${year}.xlsx`
    );
    Swal.fire({ icon: "success", title: "Exported!", text: `${data.length} rows`, timer: 1500, showConfirmButton: false });
  };

  const tbtn = "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all shrink-0 font-semibold whitespace-nowrap";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">

          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-sm">🏢</div>
            <h2 className="text-sm font-black text-slate-800">Labor Bill</h2>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-wide">Admin Only</span>
          </div>

          {/* Counts */}
          <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 font-semibold">
            {filteredRows.length} entries
          </span>
          {summary.totalPics > 0 && (
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
              Qty: {summary.totalPics.toLocaleString()}
            </span>
          )}

          <div className="hidden sm:block flex-1" />

          {/* Search */}
          <input value={searchText} onChange={e => setSearchText(e.target.value)}
            placeholder="Customer / Zone / Address…"
            className={`${tbtn} border-slate-200 bg-white text-slate-700 w-44 focus:outline-none focus:border-orange-400`} />

          {/* Month / Year */}
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none`}
            value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{isMobile ? MONTHS_SHORT[i] : m}</option>)}
          </select>
          <select className={`${tbtn} border-slate-200 text-slate-700 bg-white focus:outline-none w-20`}
            value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Export */}
          <button onClick={handleExport} className={`${tbtn} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Export</span><span className="sm:hidden">XLS</span>
          </button>
        </div>

        {/* Floor filter chips */}
        {rows.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button onClick={() => setFloorFilter("")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${!floorFilter ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              সব ({rows.length})
            </button>
            {Object.entries(summary.byFloor).sort((a,b)=>Number(a[0])-Number(b[0])).map(([fl, count]) => (
              <button key={fl} onClick={() => setFloorFilter(floorFilter === fl ? "" : fl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${floorFilter === fl ? "bg-emerald-600 text-white border-emerald-600" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                {fl} তলা ({count})
              </button>
            ))}
            {summary.carryCount > 0 && (
              <button onClick={() => setFloorFilter(floorFilter === "carrying" ? "" : "carrying")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${floorFilter === "carrying" ? "bg-amber-600 text-white border-amber-600" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
                🚐 Carrying ({summary.carryCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">🏢</div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">
                {rows.length === 0
                  ? `${MONTHS_FULL[month-1]} ${year}-তে কোনো Floor/Carrying entry নেই`
                  : "Filter অনুযায়ী কোনো entry নেই"}
              </p>
              <p className="text-sm mt-1 text-slate-400">Delivered page-এ 🏢 button দিয়ে entry করো</p>
            </div>
          </div>
        ) : isMobile ? (
          /* ── Mobile cards ── */
          <div className="h-full overflow-y-auto p-2 space-y-2">
            {filteredRows.map((r, idx) => {
              const pics = (r.products || []).reduce((s, p) => s + Number(p.quantity || 0), 0);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{r.customerName}</p>
                      <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {r.floor && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">
                          {r.floor} তলা
                        </span>
                      )}
                      {r.carrying && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold truncate max-w-[100px]">
                          🚐 {r.carrying}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2 text-[10px]">
                    {[["Zone", r.zone],["District", r.district],["Thana", r.thana],["Receiver", r.receiverNumber]].map(([l,v]) => (
                      <div key={l}><span className="text-slate-400 font-bold uppercase text-[9px]">{l}: </span>
                        <span className="text-slate-600">{v || "—"}</span></div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-2 space-y-1">
                    {(r.products || []).map((p, pi) => (
                      <div key={pi} className="flex items-center justify-between">
                        <span className="text-xs text-slate-700 font-medium">{p.productName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{p.model}</span>
                          <span className="text-xs font-black text-slate-800">{p.quantity} pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {r.note && <p className="mt-1.5 text-[10px] text-amber-600 italic">📝 {r.note}</p>}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400">{r.tripNumber}</span>
                    <span className="text-[10px] font-black text-indigo-600">মোট {pics} pcs</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Desktop table ── */
          <div className="h-full flex flex-col mx-3 my-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse text-[12px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 text-left">
                      {["Date","Trip","Customer","Zone","Address","District","Thana","Receiver","Product","Model","Qty","Floor","Carrying","Note"].map(h => (
                        <th key={h} className="px-2 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-white/5 last:border-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, ridx) => {
                      const productRows = r.products?.length ? r.products : [{}];
                      return productRows.map((p, pidx) => (
                        <tr key={`${ridx}-${pidx}`}
                          className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/20 ${ridx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                          {pidx === 0 ? <>
                            <td className="px-2 py-1.5 text-slate-500 whitespace-nowrap" rowSpan={productRows.length}>{new Date(r.createdAt).toLocaleDateString("en-GB")}</td>
                            <td className="px-2 py-1.5 text-slate-400 font-mono text-[10px]" rowSpan={productRows.length}>{r.tripNumber}</td>
                            <td className="px-2 py-1.5 font-semibold text-slate-800 max-w-[100px]" rowSpan={productRows.length}><span className="block truncate">{r.customerName}</span></td>
                            <td className="px-2 py-1.5 text-slate-600" rowSpan={productRows.length}><span className="block truncate">{r.zone}</span></td>
                            <td className="px-2 py-1.5 text-slate-500 max-w-[100px]" rowSpan={productRows.length} title={r.address}><span className="block truncate">{r.address}</span></td>
                            <td className="px-2 py-1.5 text-slate-500" rowSpan={productRows.length}><span className="block truncate">{r.district}</span></td>
                            <td className="px-2 py-1.5 text-slate-500" rowSpan={productRows.length}><span className="block truncate">{r.thana}</span></td>
                            <td className="px-2 py-1.5 text-slate-600" rowSpan={productRows.length}><span className="block truncate">{r.receiverNumber}</span></td>
                          </> : null}
                          <td className="px-2 py-1.5"><span className="block truncate">{p.productName}</span></td>
                          <td className="px-2 py-1.5 font-mono text-[11px] text-slate-500 uppercase"><span className="block truncate">{p.model}</span></td>
                          <td className="px-2 py-1.5 text-center font-black text-slate-700">{p.quantity}</td>
                          {pidx === 0 ? <>
                            <td className="px-2 py-1.5 text-center" rowSpan={productRows.length}>
                              {r.floor ? (
                                <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">{r.floor}F</span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-2 py-1.5 max-w-[90px]" rowSpan={productRows.length}>
                              {r.carrying ? (
                                <span className="block truncate text-[11px] font-semibold text-amber-600">{r.carrying}</span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-2 py-1.5 max-w-[80px]" rowSpan={productRows.length}>
                              {r.note ? <span className="block truncate text-[10px] text-amber-600 italic">{r.note}</span> : <span className="text-slate-300">—</span>}
                            </td>
                          </> : null}
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborBillPage;