
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import {
  FiHome, FiTruck, FiActivity, FiCheckCircle,
  FiPackage, FiPlusCircle, FiUsers, FiBox, FiCalendar,
  FiArrowUpRight, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import { FaFileInvoice, FaPlusCircle, FaWarehouse } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';
import { TbTruckDelivery, TbClipboardList, TbPackage } from 'react-icons/tb';
import { RiTruckLine } from 'react-icons/ri';
import { IoMdCash } from 'react-icons/io';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('en-IN');

/* ── Quick Action card ── */
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

/* ── Stat card ── */
const StatCard = ({ label, value, icon, color, bg, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-start justify-between gap-3 shadow-sm">
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <span className={color}>{icon}</span>
    </div>
  </div>
);

const Home = () => {
  const axiosSecure = useAxiosSecure();
  const { role, status } = useRole();
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const isFinanceRole = ['admin', 'manager', 'ceo'].includes(role) && status === 'approved';
  const now       = new Date();
  const monthName = MONTHS[now.getMonth()];
  const year      = now.getFullYear();

  useEffect(() => {
    let cancelled = false;
    axiosSecure.get('/dashboard-stats')
      .then(res  => { if (!cancelled) setStats(res.data.data); })
      .catch(err => { if (err?.response?.status !== 403) console.error(err); })
      .finally(()=> { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const netBal = stats?.accounts?.netBalance ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 page-enter">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg min-h-[110px] sm:min-h-[130px]">
        {/* dot grid */}
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
                {user?.displayName|| 'User'}
              </span>{' '}
              <span className="hidden sm:inline">👋</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium">
              Monitor logistics for{' '}
              <span className="text-slate-200 font-semibold">{monthName}, {year}</span>
            </p>
          </div>

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

      {/* ── FINANCE STATS (admin/manager/ceo) ── */}
      {isFinanceRole && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Net Balance"
            value={fmt(stats?.accounts?.netBalance)}
            icon={<FiActivity size={18} />}
            color={netBal >= 0 ? 'text-emerald-600' : 'text-red-500'}
            bg={netBal >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
            sub={`Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          />
          <StatCard
            label="Total Deposit"
            value={fmt(stats?.accounts?.income)}
            icon={<FiTrendingUp size={18} />}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Total Expense"
            value={fmt(stats?.accounts?.totalExpense)}
            icon={<FiTrendingDown size={18} />}
            color="text-rose-600"
            bg="bg-rose-50"
          />
        </div>
      )}

      {/* ── WAREHOUSE RECEIVING SUMMARY ── */}
      {role !== 'vendor' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                <FaWarehouse size={15} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 leading-tight">Warehouse Receiving Summary</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-0.5">
                  <FiCalendar size={9} />
                  <span>{monthName}, {year}</span>
                </div>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-slate-50 border border-slate-200
              rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Source: Walton Factory
            </span>
          </div>

          {/* Product grid */}
          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 animate-pulse">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : !stats?.gatePass?.unitBreakdown?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <FiBox size={32} className="mb-2" />
                <p className="text-sm font-medium">No products received this month</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {stats.gatePass.unitBreakdown.map((item, i) => (
                  <div key={i} className="bg-slate-50 hover:bg-white hover:shadow-md hover:shadow-orange-500/5
                    hover:-translate-y-0.5 border border-slate-100 rounded-xl p-3 sm:p-4 transition-all group">
                    <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1.5">
                      {item._id || 'Unknown'}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                        {item.qty.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200
                        px-1.5 py-0.5 rounded-lg shadow-sm">PCS</span>
                    </div>
                    <div className="mt-2.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">System Shortcuts</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          <QA to="/"          icon={<FiHome size={16} />}               label="Dashboard"    color="text-slate-600"   bg="bg-slate-100" />

          {role !== 'vendor' && <>
            <QA to="/add-gate-pass" icon={<FaPlusCircle size={14} />}    label="Add Gate Pass" color="text-sky-600"    bg="bg-sky-50" />
            <QA to="/all-gate-pass" icon={<FaWarehouse size={14} />}     label="GP Inventory"  color="text-sky-600"    bg="bg-sky-50" />
            <QA to="/add-challan"   icon={<TbPackage size={16} />}        label="Add Challan"   color="text-emerald-600" bg="bg-emerald-50" />
            <QA to="/all-challan"   icon={<TbClipboardList size={16} />}  label="Challan Inv."  color="text-emerald-600" bg="bg-emerald-50" />
            <QA to="/add-vendor"    icon={<FiTruck size={15} />}          label="Add Vendor"    color="text-violet-600" bg="bg-violet-50" />
            <QA to="/create-delivery" icon={<TbTruckDelivery size={16}/>} label="Create Del."   color="text-amber-600"  bg="bg-amber-50" />
            <QA to="/trip-inventory"  icon={<MdInventory2 size={16} />}   label="Trip Inv."     color="text-amber-600"  bg="bg-amber-50" />
          </>}

          <QA to="/all-vendor" icon={<FiUsers size={15} />}              label="Vendor DB"    color="text-violet-600" bg="bg-violet-50" />

          {role === 'admin' && status === 'approved' && <>
            <QA to="/user-management" icon={<FiUsers size={15} />}       label="Users"         color="text-indigo-600" bg="bg-indigo-50" />
            <QA to="/deliverd"        icon={<FiCheckCircle size={15} />}  label="Delivered"     color="text-orange-600" bg="bg-orange-50" />
          </>}

          {isFinanceRole && <>
            <QA to="/accounts" icon={<IoMdCash size={16} />}             label="Accounts"      color="text-emerald-600" bg="bg-emerald-50" />
            <QA to="/car-rent"  icon={<RiTruckLine size={15} />}         label="Car Rent"       color="text-rose-600"   bg="bg-rose-50" />
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
