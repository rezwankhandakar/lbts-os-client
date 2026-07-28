import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import {
  FiHome, FiTruck, FiActivity, FiCheckCircle,
  FiUsers, FiBox, FiCalendar, FiArrowUpRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { FaPlusCircle, FaWarehouse } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';
import { TbTruckDelivery, TbClipboardList, TbPackage } from 'react-icons/tb';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const num = (v) => Number(v || 0).toLocaleString();

/* % গুলো আলাদা আলাদা Math.round করলে যোগফল ৯৯/১০১ হয়ে যেত —
   largest remainder method-এ ভাগ করলে সবসময় ঠিক ১০০% হয় */
const roundShares = (values, total) => {
  if (!total || total <= 0) return values.map(() => 0);
  const raw = values.map(v => (Number(v || 0) / total) * 100);
  const floors = raw.map(Math.floor);
  const listSum = values.reduce((a, b) => a + Number(b || 0), 0);
  // লিস্ট truncated হলে (total-এর সব item দেখানো হয়নি) সাধারণ round-ই যথেষ্ট
  if (listSum !== total) return raw.map(Math.round);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) out[order[k].i] += 1;
  return out;
};

/* ═══════════════════════ Small building blocks ═══════════════════════ */

/* Segmented progress bar */
const ProgressSegments = ({ segments, total }) => (
  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
    {total > 0 && segments.map((s, i) => (
      s.value > 0 ? <div key={i} className={`h-full ${s.color} transition-all duration-700`}
        style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} /> : null
    ))}
  </div>
);

/* Ranked mini row with proportional bar */
const RankRow = ({ label, value, max, barColor, suffix = "PCS" }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-1">
      <p className="text-[10px] font-bold text-slate-600 truncate">{label || "Unknown"}</p>
      <p className="text-[10px] font-black text-slate-700 shrink-0">
        {num(value)} <span className="text-[8px] font-bold text-slate-400">{suffix}</span>
      </p>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${barColor} rounded-full transition-all duration-700`}
        style={{ width: `${max > 0 ? Math.max(4, (value / max) * 100) : 0}%` }} />
    </div>
  </div>
);

/* ছোট stat pill */
const MiniStat = ({ label, value, color = "text-slate-800", sub }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 min-w-0">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">{label}</p>
    <p className={`text-lg font-black leading-tight ${color}`}>{value}</p>
    {sub && <p className="text-[9px] font-semibold text-slate-400 truncate">{sub}</p>}
  </div>
);

/* Section card shell — consistent header for all summary cards */
const SectionCard = ({ icon, iconBg, iconColor, title, monthLabel, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 leading-tight">{title}</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-0.5">
            <FiCalendar size={9} /><span>{monthLabel}</span>
          </div>
        </div>
      </div>
      {action}
    </div>
    <div className="p-4 sm:p-5 space-y-4 flex-1">{children}</div>
  </div>
);

const ViewAllLink = ({ to, color }) => (
  <Link to={to} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition uppercase tracking-wider border ${color}`}>
    View All <FiArrowUpRight size={10} />
  </Link>
);

/* Quick Action card */
const QA = ({ to, icon, label, color, bg }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-white
      border border-slate-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5
      hover:-translate-y-0.5 transition-all duration-200 group text-center"
  >
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}>
      <span className={color}>{icon}</span>
    </div>
    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 leading-tight group-hover:text-orange-600 transition-colors">
      {label}
    </span>
  </Link>
);

/* Skeleton */
const Pulse = ({ h = "h-24" }) => <div className={`${h} bg-slate-100 rounded-xl animate-pulse`} />;

/* ═══════════════════════════ Page ═══════════════════════════ */

const Home = () => {
  const axiosSecure = useAxiosSecure();
  const { role, status } = useRole();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const monthLabel = `${monthName}, ${year}`;

  // FIX #61 — fresh=true হলে server-এর ৫-মিনিট cache bypass করে
  // টাটকা হিসাব আনে (↻ Refresh button)
  const fetchStats = async (fresh = false) => {
    if (fresh) setRefreshing(true);
    try {
      const res = await axiosSecure.get(`/dashboard-stats${fresh ? '?fresh=1' : ''}`);
      setStats(res.data.data);
      setUpdatedAt(new Date());
    } catch (err) {
      if (err?.response?.status !== 403) console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOps = !['vendor', 'user'].includes(role);
  const gp = stats?.gatePass || {};
  const ch = stats?.challan || {};
  const tr = stats?.trip || {};

  /* — Warehouse derived — */
  const gpTotalPcs = Number(gp.totalPcs || 0);
  const unitList = gp.unitBreakdown || [];
  const topUnit = unitList[0];
  // % গুলো একসাথে হিসাব — যোগফল ঠিক ১০০% থাকে
  const unitShares = roundShares(unitList.map(u => u.qty), gpTotalPcs);
  const topUnitShare = unitShares[0] || 0;

  /* — Challan derived — */
  const chMonth = ch.monthTotal || 0;
  const chDelivered = ch.delivered || 0;
  const chPending = ch.pending || 0;
  const chRtnPending = ch.returnPending || 0;
  /* Delivery Progress এখন product qty (PCS) অনুযায়ী */
  const chTotalPcs = Number(ch.totalPcs || 0);
  const chDeliveredPcs = Number(ch.deliveredPcs || 0);
  const chPendingPcs = Number(ch.pendingPcs || 0);
  const chRtnPendingPcs = Number(ch.returnPendingPcs || 0);
  const chReturnedPcs = Number(ch.returnedPcs || 0);
  const chRate = chTotalPcs > 0 ? Math.round((chDeliveredPcs / chTotalPcs) * 100) : 0;
  const chTopMax = Math.max(...(ch.productBreakdown || []).map(p => p.qty), 0);

  /* — Delivery derived — */
  const trips = tr.monthCount || 0;
  const returnRate = tr.deliveredPcs > 0 ? ((Number(tr.returnPcs || 0) / Number(tr.deliveredPcs)) * 100).toFixed(1) : 0;
  const trTopMax = Math.max(...(tr.productBreakdown || []).map(p => p.qty), 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 page-enter">

      {/* ══ HERO BANNER ══ */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg min-h-[110px] sm:min-h-[130px]">
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl" />

        <div className="relative h-full px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <FiBox size={11} className="animate-bounce" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">
                System Overview
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              Welcome,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                {user?.displayName || 'User'}
              </span>{' '}
              <span className="hidden sm:inline">👋</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium">
              Monitor logistics for{' '}
              <span className="text-slate-200 font-semibold">{monthLabel}</span>
              {updatedAt && (
                <span className="text-slate-500"> · Updated {updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* FIX #61 — ↻ Refresh: cache bypass করে টাটকা data */}
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing || loading}
              title="Refresh dashboard data"
              className="flex items-center gap-1.5 px-2.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95
                border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-wider
                transition-all disabled:opacity-40 backdrop-blur"
            >
              <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right border-r border-white/10 pr-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live System</p>
                <p className="text-base font-black text-white">LBTS-OS v3.2</p>
              </div>
              <div className="w-11 h-11 bg-white/5 backdrop-blur rounded-2xl flex items-center justify-center border border-white/10">
                <MdOutlineLocalShipping size={22} className="text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ WAREHOUSE RECEIVING SUMMARY — smart ══ */}
      {isOps && (
        <SectionCard
          icon={<FaWarehouse size={15} />} iconBg="bg-sky-50" iconColor="text-sky-600"
          title="Warehouse Receiving" monthLabel={monthLabel}
          action={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Source: Walton Factory
              </span>
              <ViewAllLink to="/all-gate-pass" color="text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-100" />
            </div>
          }
        >
          {loading ? (
            <div className="space-y-3"><Pulse h="h-14" /><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <Pulse key={i} h="h-24" />)}</div></div>
          ) : unitList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <FiBox size={32} className="mb-2" />
              <p className="text-sm font-medium">No products received this month</p>
            </div>
          ) : (
            <>
              {/* Headline */}
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-3xl font-black text-slate-800 leading-none">{num(gpTotalPcs)}</p>
                    <span className="text-[10px] font-black text-slate-400">PCS</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Received this month</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-sky-600 leading-none">{num(gp.monthCount)} <span className='text-amber-500'>Gate Pass</span></p>
                  {/* <p className="text-[9px] font-semibold text-slate-400 mt-0.5">gate passes · all-time {num(gp.totalCount)}</p> */}
                </div>
              </div>

              {/* Unit cards — real share % */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                {unitList.map((item, i) => {
                  // roundShares() থেকে আসা % — সব unit মিলিয়ে ঠিক ১০০%
                  const share = unitShares[i] || 0;
                  return (
                    <div key={i} className={`relative rounded-xl p-3 sm:p-4 border transition-all group hover:-translate-y-0.5 hover:shadow-md ${i === 0 ? "bg-sky-50/60 border-sky-200 hover:shadow-sky-500/10" : "bg-slate-50 border-slate-100 hover:bg-white hover:shadow-slate-500/5"}`}>
                      {i === 0 && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-sky-600 text-white text-[8px] font-black rounded-md uppercase tracking-wider shadow-sm">Top</span>
                      )}
                      <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1.5">{item._id || 'Unknown'}</p>
                      <div className="flex items-end justify-between gap-1">
                        <p className={`text-xl font-black transition-colors ${i === 0 ? "text-sky-700" : "text-slate-800 group-hover:text-sky-600"}`}>
                          {num(item.qty)}
                        </p>
                        <span className="text-[9px] font-black text-slate-400">{share}%</span>
                      </div>
                      <p className="text-[8px] font-semibold text-slate-400 mt-0.5">{item.passCount} pass{item.passCount > 1 ? "es" : ""}</p>
                      <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-sky-600" : "bg-sky-400"}`}
                          style={{ width: `${Math.max(4, share)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart insight */}
              {topUnit && (
                <p className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1.5">
                  📦 <b>{topUnit._id}</b> is leading — {topUnitShare}% of this month's receiving ({num(topUnit.qty)} PCS in {topUnit.passCount} pass{topUnit.passCount > 1 ? "es" : ""})
                </p>
              )}
            </>
          )}
        </SectionCard>
      )}

      {/* ══ CHALLAN + DELIVERY SUMMARY ══ */}
      {isOps && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* ── CHALLAN SUMMARY ── */}
          <SectionCard
            icon={<TbClipboardList size={17} />} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            title="Challan Summary" monthLabel={monthLabel}
            action={<ViewAllLink to="/all-challan" color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100" />}
          >
            {loading ? (
              <div className="space-y-3"><Pulse h="h-16" /><Pulse h="h-2" /><Pulse h="h-24" /></div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-3xl font-black text-emerald-600 leading-none">{num(ch.totalPcs)} <span className="text-[9px] text-slate-400">PCS</span></p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1"> this month</p>
                  </div>
                  {/* <div className="text-right">
                    <p className="text-lg font-black text-emerald-600 leading-none">{num(ch.totalPcs)} <span className="text-[9px] text-slate-400">PCS</span></p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5">All-time: {num(ch.totalCount)} challans</p>
                  </div> */}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Delivery Progress</p>
                    <p className="text-[10px] font-black text-slate-700">{chRate}% <span className="text-slate-400 font-semibold">delivered</span></p>
                  </div>
                  {/* Progress এখন product qty (PCS) অনুযায়ী — challan count নয় */}
                  <ProgressSegments total={chTotalPcs} segments={[
                    { label: "Delivered", value: chDeliveredPcs, color: "bg-emerald-500" },
                    { label: "Return-Pending", value: chRtnPendingPcs, color: "bg-amber-400" },
                    { label: "Returned", value: chReturnedPcs, color: "bg-red-400" },
                    { label: "Pending", value: chPendingPcs, color: "bg-slate-300" },
                  ]} />
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered {num(chDeliveredPcs)} <span className="text-[8px] text-slate-400">PCS</span></span>
                    {chRtnPendingPcs > 0 && <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400" /> Return-Pending {num(chRtnPendingPcs)} <span className="text-[8px] text-slate-400">PCS</span></span>}
                    {chReturnedPcs > 0 && <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-red-400" /> Returned {num(chReturnedPcs)} <span className="text-[8px] text-slate-400">PCS</span></span>}
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300" /> Pending {num(chPendingPcs)} <span className="text-[8px] text-slate-400">PCS</span></span>
                  </div>
                  <p className={`mt-2 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border ${chPendingPcs > 0 ? "text-amber-700 bg-amber-50 border-amber-100" : chMonth > 0 ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-100"}`}>
                    {chMonth === 0 ? "No challans created this month yet"
                      : chPendingPcs > 0 ? `⏳ ${num(chPendingPcs)} PCS awaiting delivery`
                      : "🎉 All products of this month are delivered"}
                  </p>
                </div>

                {(ch.productBreakdown || []).length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Top Products (Challan)</p>
                    <div className="space-y-2">
                      {ch.productBreakdown.slice(0, 5).map((p, i) => (
                        <RankRow key={i} label={p._id} value={p.qty} max={chTopMax} barColor="bg-emerald-500" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* ── DELIVERY SUMMARY ── */}
          <SectionCard
            icon={<TbTruckDelivery size={17} />} iconBg="bg-orange-50" iconColor="text-orange-600"
            title="Delivery Summary" monthLabel={monthLabel}
            action={<ViewAllLink to="/deliverd" color="text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100" />}
          >
            {loading ? (
              <div className="space-y-3"><Pulse h="h-16" /><Pulse h="h-14" /><Pulse h="h-24" /></div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-3xl font-black text-slate-800 leading-none">{num(trips)}</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Trips this month</p>
                  </div>
                  {tr.lastTripNumber && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-black text-blue-600">
                      <FiActivity size={10} className="animate-pulse" /> Last Trip {tr.lastTripNumber}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-10">
                  
                  <MiniStat label="Delivered PCS" value={num(tr.deliveredPcs)} color="text-orange-600" />
                  <MiniStat label="Returns PCS" value={tr.returnPcs || 0}
                    color={tr.returnPcs> 0 ? "text-red-500" : "text-emerald-600"}
                    />
                </div>

                {/* Delivered products — top 5 */}
                {(tr.productBreakdown || []).length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Delivered Products</p>
                    <div className="space-y-2">
                      {tr.productBreakdown.slice(0, 5).map((p, i) => (
                        <RankRow key={i} label={p._id} value={p.qty} max={trTopMax} barColor="bg-orange-500" />
                      ))}
                    </div>
                  </div>
                )}

                {(stats?.topDeliveryPoints || []).length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Hot Zones</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.topDeliveryPoints.map((z, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition">
                          {z._id || "Unknown"} <span className="text-orange-500 font-black">{z.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══ QUICK ACTIONS ══ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">System Shortcuts</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          <QA to="/" icon={<FiHome size={16} />} label="Dashboard" color="text-slate-600" bg="bg-slate-100" />

          {role !== 'vendor' && <>
            <QA to="/add-gate-pass" icon={<FaPlusCircle size={14} />} label="Add Gate Pass" color="text-sky-600" bg="bg-sky-50" />
            <QA to="/all-gate-pass" icon={<FaWarehouse size={14} />} label="GP Inventory" color="text-sky-600" bg="bg-sky-50" />
            <QA to="/add-challan" icon={<TbPackage size={16} />} label="Add Challan" color="text-emerald-600" bg="bg-emerald-50" />
            <QA to="/all-challan" icon={<TbClipboardList size={16} />} label="Challan Inv." color="text-emerald-600" bg="bg-emerald-50" />
            <QA to="/add-vendor" icon={<FiTruck size={15} />} label="Add Vendor" color="text-violet-600" bg="bg-violet-50" />
            <QA to="/create-delivery" icon={<TbTruckDelivery size={16} />} label="Create Del." color="text-amber-600" bg="bg-amber-50" />
            <QA to="/trip-inventory" icon={<MdInventory2 size={16} />} label="Trip Inv." color="text-amber-600" bg="bg-amber-50" />
          </>}

          <QA to="/all-vendor" icon={<FiUsers size={15} />} label="Vendor DB" color="text-violet-600" bg="bg-violet-50" />

          {role === 'admin' && status === 'approved' && <>
            <QA to="/user-management" icon={<FiUsers size={15} />} label="Users" color="text-indigo-600" bg="bg-indigo-50" />
            <QA to="/deliverd" icon={<FiCheckCircle size={15} />} label="Delivered" color="text-orange-600" bg="bg-orange-50" />
          </>}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
        LBTS-OS · Intelligent Logistics Management
      </p>
    </div>
  );
};

export default Home;