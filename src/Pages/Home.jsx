import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import {
  FiFileText, FiTruck, FiUsers, FiPackage,
  FiArrowRight, FiActivity, FiCheckCircle,
  FiClock, FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';
import { FaFileInvoice } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('en-IN');

const SkLight = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

/* ── Product breakdown row ── */
const ProductRow = ({ name, qty, color, max }) => (
  <div className="flex items-center gap-2 py-1">
    <span className="text-xs text-gray-600 font-medium flex-1 truncate" title={name}>{name}</span>
    <div className="w-20 bg-gray-100 rounded-full h-1.5 shrink-0">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${max > 0 ? Math.min(100, (qty/max)*100) : 0}%`, background: color }} />
    </div>
    <span className="text-xs font-bold text-gray-700 w-16 text-right shrink-0">{qty} pcs</span>
  </div>
);

/* ── Card wrapper ── */
const Card = ({ children, to, accent, className = '' }) => {
  const inner = (
    <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`} style={{ borderColor: accent + '40' }}>
      <div className="h-1 shrink-0" style={{ background: accent }} />
      <div className="p-5 flex flex-col gap-3 flex-1">{children}</div>
    </div>
  );
  return to ? (
    <Link to={to} className="group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col">
      {inner}
    </Link>
  ) : inner;
};

/* ── Card header ── */
const CardHeader = ({ icon, title, accent, sub, to }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent + '18' }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">{title}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
    {to && <FiArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />}
  </div>
);

/* ── Pill ── */
const Pill = ({ label, value, textCls, bgCls }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${textCls} ${bgCls}`}>
    {value} {label}
  </span>
);

/* ── Quick link ── */
const QuickLink = ({ to, icon, label, color, bg, border }) => (
  <Link to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${border} ${bg} hover:shadow-sm transition-all hover:-translate-y-0.5 group`}>
    <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <FiArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500" />
  </Link>
);

/* ── Recent row ── */
const RecentRow = ({ icon, primary, secondary, tag, tagColor }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-700 truncate">{primary}</p>
      <p className="text-xs text-gray-400 truncate">{secondary}</p>
    </div>
    {tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${tagColor}`}>{tag}</span>}
  </div>
);

const Home = () => {
  const axiosSecure = useAxiosSecure();
  const { role, status } = useRole();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdminOrCeo = (role === 'admin' || role === 'ceo') && status === 'approved';
  const now = new Date();
  const monthName = MONTHS[now.getMonth()];

  useEffect(() => {
    axiosSecure.get('/dashboard-stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [axiosSecure]);

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // max qty for bar scaling
  const gpMax   = Math.max(...(stats?.gatePass?.modelBreakdown?.map(x => x.qty) || [1]), 1);
  const chMax   = Math.max(...(stats?.challan?.productBreakdown?.map(x => x.qty) || [1]), 1);
  const tripMax = Math.max(...(stats?.trip?.productBreakdown?.map(x => x.qty) || [1]), 1);

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 rounded-2xl px-6 py-5 overflow-hidden shadow-lg shadow-orange-200/60">
        <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full" />
        <div className="absolute right-10 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-orange-100 text-xs font-medium">{greeting} 👋</p>
            <h1 className="text-xl font-black text-white mt-0.5">{user?.displayName?.split(' ')[0] || 'Welcome'} — LBTS Dashboard</h1>
            <p className="text-orange-100 text-xs mt-1">{monthName} {now.getFullYear()}</p>
          </div>
          {!loading && stats && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold">
                <FaFileInvoice size={11} /> {stats.gatePass.monthCount} Gate Pass
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold">
                <MdOutlineLocalShipping size={13} /> {stats.trip.monthCount} Trips
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold">
                <FiCheckCircle size={11} /> {stats.challan.delivered} Delivered
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 Summary Cards ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{monthName} {now.getFullYear()} — Summary</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Gate Pass Card */}
          <Card to="/all-gate-pass" accent="#3b82f6">
            <CardHeader icon={<FaFileInvoice size={16} />} title="Gate Pass" accent="#3b82f6"
              sub={`${monthName} · ${stats?.gatePass.monthCount ?? 0} passes`} to />
            {loading ? (
              <div className="space-y-2"><SkLight className="h-4 w-full" /><SkLight className="h-4 w-4/5" /><SkLight className="h-4 w-3/5" /></div>
            ) : !stats?.gatePass?.modelBreakdown?.length ? (
              <p className="text-xs text-gray-300 italic text-center py-4">No data this month</p>
            ) : (
              <div className="space-y-0.5">
                {stats.gatePass.modelBreakdown.map((item, i) => (
                  <ProductRow key={i} name={item._id || 'Unknown'} qty={item.qty} max={gpMax} color="#3b82f6" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50 mt-auto">
              <Pill label="total ever" value={stats?.gatePass.totalCount ?? '—'} textCls="text-blue-700" bgCls="bg-blue-50" />
            </div>
          </Card>

          {/* Challan Card */}
          <Card to="/all-challan" accent="#22c55e">
            <CardHeader icon={<FiFileText size={16} />} title="Challan" accent="#22c55e"
              sub={`${monthName} · ${stats?.challan.monthTotal ?? 0} challans`} to />
            {loading ? (
              <div className="space-y-2"><SkLight className="h-4 w-full" /><SkLight className="h-4 w-4/5" /><SkLight className="h-4 w-3/5" /></div>
            ) : !stats?.challan?.productBreakdown?.length ? (
              <p className="text-xs text-gray-300 italic text-center py-4">No data this month</p>
            ) : (
              <div className="space-y-0.5">
                {stats.challan.productBreakdown.map((item, i) => (
                  <ProductRow key={i} name={item._id || 'Unknown'} qty={item.qty} max={chMax} color="#22c55e" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50 mt-auto">
              <Pill label="delivered" value={stats?.challan.delivered ?? '—'} textCls="text-emerald-700" bgCls="bg-emerald-50" />
              <Pill label="pending"   value={stats?.challan.pending ?? '—'}   textCls="text-amber-700"   bgCls="bg-amber-50" />
              {(stats?.challan.returned ?? 0) > 0 && (
                <Pill label="returned" value={stats?.challan.returned} textCls="text-red-600" bgCls="bg-red-50" />
              )}
            </div>
          </Card>

          {/* Delivery Card */}
          <Card to="/trip-inventory" accent="#f97316">
            <CardHeader icon={<MdOutlineLocalShipping size={18} />} title="Delivery" accent="#f97316"
              sub={`${monthName} · ${stats?.trip.monthCount ?? 0} trips`} to />
            {loading ? (
              <div className="space-y-2"><SkLight className="h-4 w-full" /><SkLight className="h-4 w-4/5" /><SkLight className="h-4 w-3/5" /></div>
            ) : !stats?.trip?.productBreakdown?.length ? (
              <p className="text-xs text-gray-300 italic text-center py-4">No data this month</p>
            ) : (
              <div className="space-y-0.5">
                {stats.trip.productBreakdown.map((item, i) => (
                  <ProductRow key={i} name={item._id || 'Unknown'} qty={item.qty} max={tripMax} color="#f97316" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50 mt-auto">
              {(stats?.trip.activeCount ?? 0) > 0 && (
                <Pill label="active" value={stats.trip.activeCount} textCls="text-orange-700" bgCls="bg-orange-50" />
              )}
              <Pill label="total ever" value={stats?.trip.totalCount ?? '—'} textCls="text-gray-500" bgCls="bg-gray-50" />
            </div>
          </Card>

          {/* Accounts Card — admin/ceo only, otherwise Vendor card */}
          {isAdminOrCeo ? (
            <Card to="/accounts" accent="#6366f1">
              <CardHeader icon={<FiActivity size={16} />} title="Accounts" accent="#6366f1"
                sub={`${monthName} · Cash Flow`} to />
              {loading ? (
                <div className="space-y-2"><SkLight className="h-6 w-32" /><SkLight className="h-4 w-full" /><SkLight className="h-4 w-4/5" /><SkLight className="h-4 w-3/5" /></div>
              ) : (
                <>
                  {/* Net balance */}
                  <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${(stats?.accounts?.netBalance ?? 0) >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                    <span className="text-xs font-semibold text-gray-500">Net Balance</span>
                    <div className="flex items-center gap-1">
                      {(stats?.accounts?.netBalance ?? 0) >= 0
                        ? <FiTrendingUp size={14} className="text-emerald-500" />
                        : <FiTrendingDown size={14} className="text-red-500" />}
                      <span className={`text-lg font-black ${(stats?.accounts?.netBalance ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {fmt(stats?.accounts?.netBalance)}
                      </span>
                    </div>
                  </div>
                  {/* Income / Expense rows */}
                  <div className="space-y-1.5">
                    {[
                      { label: 'Income',         value: stats?.accounts?.income,        color: '#22c55e', icon: '+' },
                      { label: 'Expense',        value: stats?.accounts?.totalExpense,  color: '#ef4444', icon: '−' },
                      { label: 'Vendor Payment', value: stats?.accounts?.vendorPayment, color: '#6366f1', icon: '−' },
                      { label: 'Advance (Auto)', value: stats?.accounts?.autoAdv,       color: '#f59e0b', icon: '−' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{row.icon} {row.label}</span>
                        <span className="font-bold text-gray-700">{fmt(row.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card to="/all-vendor" accent="#a855f7">
              <CardHeader icon={<FiTruck size={16} />} title="Vendors" accent="#a855f7"
                sub="Registered vendors" to />
              {loading ? (
                <div className="space-y-2"><SkLight className="h-10 w-24" /><SkLight className="h-4 w-32" /></div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-1">
                  <p className="text-4xl font-black text-gray-800">{stats?.vendor.totalCount ?? 0}</p>
                  <p className="text-xs text-gray-400">Total vendors</p>
                </div>
              )}
              <div className="flex gap-1.5 pt-1 border-t border-gray-50 mt-auto">
                <Pill label="vendors" value={stats?.vendor.totalCount ?? '—'} textCls="text-purple-700" bgCls="bg-purple-50" />
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="space-y-1.5">
            <QuickLink to="/add-gate-pass"   icon={<FaFileInvoice size={14} />}         label="New Gate Pass"      color="text-blue-500"    bg="bg-blue-50"    border="border-blue-100" />
            <QuickLink to="/add-challan"     icon={<FiFileText size={14} />}             label="New Challan"        color="text-green-500"   bg="bg-green-50"   border="border-green-100" />
            <QuickLink to="/create-delivery" icon={<MdOutlineLocalShipping size={16} />} label="Create Delivery"    color="text-orange-500"  bg="bg-orange-50"  border="border-orange-100" />
            <QuickLink to="/add-vendor"      icon={<FiTruck size={14} />}                label="Add Vendor"         color="text-purple-500"  bg="bg-purple-50"  border="border-purple-100" />
            <QuickLink to="/deliverd"        icon={<FiCheckCircle size={14} />}          label="Delivered Trips"    color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100" />
            <QuickLink to="/trip-inventory"  icon={<MdInventory2 size={15} />}           label="Trip Inventory"     color="text-amber-500"   bg="bg-amber-50"   border="border-amber-100" />
            <QuickLink to="/car-rent"        icon={<FiPackage size={14} />}              label="Car Rent Bill"      color="text-rose-500"    bg="bg-rose-50"    border="border-rose-100" />
            {isAdminOrCeo && (
              <QuickLink to="/accounts"      icon={<FiActivity size={14} />}             label="Accounts Dashboard" color="text-indigo-500"  bg="bg-indigo-50"  border="border-indigo-100" />
            )}
          </div>
        </div>

        {/* Recent Gate Passes */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Gate Passes</p>
            <Link to="/all-gate-pass" className="text-xs text-orange-500 hover:underline font-semibold">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_,i) => (
              <div key={i} className="flex gap-3 py-1.5">
                <SkLight className="w-7 h-7 flex-shrink-0" />
                <div className="flex-1 space-y-1.5"><SkLight className="h-3 w-3/4" /><SkLight className="h-2.5 w-1/2" /></div>
              </div>
            ))}</div>
          ) : !stats?.recentGatePasses?.length ? (
            <div className="flex flex-col items-center py-10 text-gray-300 gap-2"><FaFileInvoice size={28} /><p className="text-xs">No gate passes yet</p></div>
          ) : stats.recentGatePasses.map((gp, i) => (
            <RecentRow key={i}
              icon={<FaFileInvoice size={12} />}
              primary={gp.tripDo || gp.vehicleNo || `Gate Pass #${i+1}`}
              secondary={`${gp.customerName || '—'} · ${gp.zone || ''}`}
              tag={`${gp.products?.reduce((s,p) => s+p.quantity, 0) ?? 0} pcs`}
              tagColor="text-blue-600 bg-blue-50 border-blue-200" />
          ))}
        </div>

        {/* Recent Challans */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Challans</p>
            <Link to="/all-challan" className="text-xs text-orange-500 hover:underline font-semibold">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_,i) => (
              <div key={i} className="flex gap-3 py-1.5">
                <SkLight className="w-7 h-7 flex-shrink-0" />
                <div className="flex-1 space-y-1.5"><SkLight className="h-3 w-3/4" /><SkLight className="h-2.5 w-1/2" /></div>
              </div>
            ))}</div>
          ) : !stats?.recentChallans?.length ? (
            <div className="flex flex-col items-center py-10 text-gray-300 gap-2"><FiFileText size={28} /><p className="text-xs">No challans yet</p></div>
          ) : stats.recentChallans.map((ch, i) => (
            <RecentRow key={i}
              icon={<FiFileText size={12} />}
              primary={ch.customerName || `Challan #${i+1}`}
              secondary={ch.address || ch.zone || '—'}
              tag={ch.status || 'pending'}
              tagColor={
                ch.status === 'delivered' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                ch.status === 'returned'  ? 'text-red-600 bg-red-50 border-red-200' :
                'text-amber-600 bg-amber-50 border-amber-200'
              } />
          ))}
        </div>

      </div>

      <p className="text-center text-xs text-gray-300 pb-2">LBTS-OS · Logistics & Transport Management System</p>
    </div>
  );
};

export default Home;