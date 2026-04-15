
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

// --- Quick Action Link Component ---
const QL = ({ to, icon, label, color, iconBg }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-50 bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 group text-center"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform shadow-sm`}>
      <span className={color} style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <span className="text-[11px] font-bold text-gray-600 leading-tight group-hover:text-orange-600 transition-colors">{label}</span>
  </Link>
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
  const currentYear = now.getFullYear();

  useEffect(() => {
    axiosSecure.get('/dashboard-stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [axiosSecure]);

  return (
    <div className="space-y-6 pb-10">
      
      {/* ── POINT 1: COMPACT & GRAPHIC BANNER (NO BUTTON) ── */}
      <div className="relative h-40 rounded-[2.5rem] overflow-hidden shadow-lg bg-slate-900 border border-white/5">
        {/* Abstract Graphic Background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative h-full px-8 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <FiBox className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Overview</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">{user?.displayName?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <p className="text-slate-400 text-xs font-medium max-w-xs">
              Monitor your logistics flow and financial performance for <span className="text-slate-200">{monthName}</span>.
            </p>
          </div>

          {/* Decorative Visual */}
          <div className="hidden md:flex items-center gap-4">
             <div className="text-right border-r border-white/10 pr-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Live Operations</p>
                <p className="text-lg font-black text-white">LBTS-OS v3.2</p>
             </div>
             <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <MdOutlineLocalShipping size={24} className="text-orange-400" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── POINT 2: WAREHOUSE RECEIVING SUMMARY (GRID STYLE) ── */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                  <FaWarehouse size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Warehouse Receiving Summary</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <FiCalendar size={12} />
                    <span>Report for {monthName}, {currentYear}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Source: Walton Factory
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-pulse">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
              </div>
            ) : !stats?.gatePass?.unitBreakdown?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <FiBox size={40} className="mb-2" />
                <p className="text-sm">No products received yet this month</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {stats.gatePass.unitBreakdown.map((item, i) => (
                  <div key={i} className="bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 border border-slate-100 rounded-2xl p-4 transition-all duration-300 group">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 truncate">{item._id || 'Unknown'}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                        {item.qty.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shadow-sm">PCS</span>
                    </div>
                    <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── LEFT: FINANCIALS (If Admin) ── */}
        {isAdminOrCeo && (
          <div className="lg:col-span-4">
             <div className="bg-slate-900 rounded-[2rem] p-6 text-white h-full relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                  <FiActivity size={100} />
               </div>
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Net Balance</h3>
               <div className="mb-8">
                  <h2 className={`text-4xl font-black ${stats?.accounts?.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {fmt(stats?.accounts?.netBalance)}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-bold">Updated {now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 font-bold">Deposit</span>
                    <span className="text-sm font-black text-emerald-400">{fmt(stats?.accounts?.income)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 font-bold">Expense</span>
                    <span className="text-sm font-black text-rose-400">{fmt(stats?.accounts?.totalExpense)}</span>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* ── POINT 3: FULL QUICK ACTIONS (All NavLinks) ── */}
        <div className={`${isAdminOrCeo ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 h-full shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> System Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
              <QL to="/" icon={<FiHome />} label="Home" color="text-slate-600" iconBg="bg-slate-50" />
              <QL to="/add-gate-pass" icon={<FaPlusCircle />} label="Add Gate Pass" color="text-blue-500" iconBg="bg-blue-50" />
              <QL to="/all-gate-pass" icon={<FaFileInvoice />} label="GP Inventory" color="text-blue-500" iconBg="bg-blue-50" />
              <QL to="/add-challan" icon={<FiPlusCircle />} label="Add Challan" color="text-green-500" iconBg="bg-green-50" />
              <QL to="/all-challan" icon={<FiFileText />} label="Challan Inventory" color="text-green-500" iconBg="bg-green-50" />
              <QL to="/add-vendor" icon={<FiTruck />} label="Add Vendor" color="text-purple-500" iconBg="bg-purple-50" />
              <QL to="/all-vendor" icon={<FiUsers />} label="Vendor DB" color="text-purple-500" iconBg="bg-purple-50" />
              <QL to="/create-delivery" icon={<MdOutlineLocalShipping />} label="Create Delivery" color="text-orange-500" iconBg="bg-orange-50" />
              <QL to="/deliverd" icon={<FiCheckCircle />} label="Delivered" color="text-orange-500" iconBg="bg-orange-50" />
              <QL to="/trip-inventory" icon={<MdInventory2 />} label="Trip Inventory" color="text-orange-500" iconBg="bg-orange-50" />
              <QL to="/car-rent" icon={<MdOutlineLocalShipping />} label="Car Rent" color="text-rose-500" iconBg="bg-rose-50" />
              {isAdminOrCeo && (
                <>
                  <QL to="/user-management" icon={<FiUsers />} label="Users" color="text-indigo-500" iconBg="bg-indigo-50" />
                  <QL to="/accounts" icon={<FiActivity />} label="Accounts" color="text-emerald-500" iconBg="bg-emerald-50" />
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] pt-4">
        LBTS-OS · Intelligent Logistics Management
      </p>
    </div>
  );
};

export default Home;