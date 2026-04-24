
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import {
  FiFileText, FiTruck, FiArrowRight, FiActivity,
  FiCheckCircle, FiTrendingUp, FiTrendingDown, FiPackage,
  FiHome, FiPlusCircle, FiUsers, FiBox, FiCalendar
} from 'react-icons/fi';
import { FaFileInvoice, FaPlusCircle, FaWarehouse } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('en-IN');

/* ── Quick Action Link ── */
const QL = ({ to, icon, label, color, iconBg }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5 transition-all duration-300 group text-center"
  >
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform shadow-sm`}>
      <span className={`${color} text-base sm:text-lg`}>{icon}</span>
    </div>
    <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 leading-tight group-hover:text-orange-600 transition-colors">{label}</span>
  </Link>
);

const Home = () => {
  const axiosSecure = useAxiosSecure();
  const { role, status } = useRole();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFinanceRole = ['admin', 'manager', 'ceo'].includes(role) && status === 'approved';
  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const currentYear = now.getFullYear();

  useEffect(() => {
    let cancelled = false;
    axiosSecure.get('/dashboard-stats')
      .then(res => { if (!cancelled) setStats(res.data.data); })
      .catch(err => {
        // Pending users get 403 — don't log as error, just show empty dashboard
        if (err?.response?.status !== 403) console.error(err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3 sm:space-y-5 pb-8 px-0">

      {/* ── BANNER ── */}
      <div className="relative h-28 sm:h-36 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-lg bg-slate-900 border border-white/5">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5 text-orange-400 mb-0.5 sm:mb-1">
              <FiBox className="animate-bounce" size={12} />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">System Overview</span>
            </div>
<h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
  Welcome,{' '}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
    {user?.displayName || 'User'}
  </span>{' '}👋
</h1>
            <p className="text-slate-400 text-[11px] sm:text-xs font-medium max-w-xs">
              Monitor logistics for <span className="text-slate-200">{monthName}</span>.
            </p>
          </div>

          {/* Decorative — desktop only */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right border-r border-white/10 pr-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Live Operations</p>
              <p className="text-lg font-black text-white">LBTS-OS v3.2</p>
            </div>
            <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <MdOutlineLocalShipping size={24} className="text-orange-400" />
            </div>
          </div>

          {/* Mobile: small system label */}
          <div className="md:hidden flex flex-col items-end gap-1">
            <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <MdOutlineLocalShipping size={18} className="text-orange-400" />
            </div>
            <span className="text-[9px] font-bold text-slate-500">v3.2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">

        {/* ── WAREHOUSE RECEIVING SUMMARY ── */}
        {role !== 'vendor' && ( 
           <div className="lg:col-span-12">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm p-4 sm:p-6 overflow-hidden relative">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-orange-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-orange-500 shadow-inner shrink-0">
                  <FaWarehouse size={16} className="sm:text-xl" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-tight">
                    Warehouse Receiving Summary
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">
                    <FiCalendar size={10} />
                    <span>{monthName}, {currentYear}</span>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-auto px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Source: Walton Factory
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 animate-pulse">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-100 rounded-xl sm:rounded-2xl" />)}
              </div>
            ) : !stats?.gatePass?.unitBreakdown?.length ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-gray-300">
                <FiBox size={36} className="mb-2" />
                <p className="text-sm">No products received yet this month</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                {stats.gatePass.unitBreakdown.map((item, i) => (
                  <div key={i} className="bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 group">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1.5 truncate">{item._id || 'Unknown'}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                        {item.qty.toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg shadow-sm">PCS</span>
                    </div>
                    <div className="mt-2 sm:mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
       

        {/* ── FINANCIALS (Admin/CEO only) ── */}
        {isFinanceRole && (
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 text-white h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                <FiActivity size={80} />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-6">Net Balance</h3>

              {/* Net balance number */}
              <div className="mb-4 sm:mb-8">
                <h2 className={`text-3xl sm:text-4xl font-black ${stats?.accounts?.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(stats?.accounts?.netBalance)}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-bold">
                  Updated {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Income / Expense rows */}
              <div className="space-y-2 sm:space-y-4">
                <div className="flex justify-between items-center bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold">Deposit</span>
                  <span className="text-sm font-black text-emerald-400">{fmt(stats?.accounts?.income)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold">Expense</span>
                  <span className="text-sm font-black text-rose-400">{fmt(stats?.accounts?.totalExpense)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div className={`${isFinanceRole  ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 p-4 sm:p-6 h-full shadow-sm">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-3 sm:mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              System Shortcuts
            </h3>

            {/* 3 cols on mobile, 4 on sm+ */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
  <QL to="/" icon={<FiHome />} label="Home" color="text-slate-600" iconBg="bg-slate-50" />

  {/* vendor দেখতে পাবে না */}
  {role !== 'vendor' && <>
    <QL to="/add-gate-pass" icon={<FaPlusCircle />} label="Add Gate Pass" color="text-blue-500" iconBg="bg-blue-50" />
    <QL to="/all-gate-pass" icon={<FaFileInvoice />} label="GP Inventory" color="text-blue-500" iconBg="bg-blue-50" />
    <QL to="/add-challan" icon={<FiPlusCircle />} label="Add Challan" color="text-green-500" iconBg="bg-green-50" />
    <QL to="/all-challan" icon={<FiFileText />} label="Challan Inv." color="text-green-500" iconBg="bg-green-50" />
    <QL to="/add-vendor" icon={<FiTruck />} label="Add Vendor" color="text-purple-500" iconBg="bg-purple-50" />
    <QL to="/create-delivery" icon={<MdOutlineLocalShipping />} label="Create Del." color="text-orange-500" iconBg="bg-orange-50" />
    
    <QL to="/trip-inventory" icon={<MdInventory2 />} label="Trip Inv." color="text-orange-500" iconBg="bg-orange-50" />
  </>}

  {/* vendor সহ সবাই দেখবে */}
  <QL to="/all-vendor" icon={<FiUsers />} label="Vendor DB" color="text-purple-500" iconBg="bg-purple-50" />

  {/* শুধু admin */}
  {role === 'admin' && status === 'approved' && <>
     <QL to="/user-management" icon={<FiUsers />} label="Users" color="text-indigo-500" iconBg="bg-indigo-50" />
    <QL to="/deliverd" icon={<FiCheckCircle />} label="Delivered" color="text-orange-500" iconBg="bg-orange-50" />
  </>
 }

  {/* admin + manager + ceo */}
  {isFinanceRole && (
    <QL to="/accounts" icon={<FiActivity />} label="Accounts" color="text-emerald-500" iconBg="bg-emerald-50" />
  )}
  {isFinanceRole && (
  <QL to="/car-rent" icon={<MdOutlineLocalShipping />} label="Car Rent" color="text-rose-500" iconBg="bg-rose-50" />
)}
</div>
          </div>
        </div>

      </div>

      <p className="text-center text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] pt-2">
        LBTS-OS · Intelligent Logistics Management
      </p>
    </div>
  );
};

export default Home;