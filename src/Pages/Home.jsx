import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import {
  FiFileText, FiTruck, FiArrowRight, FiActivity,
  FiCheckCircle, FiTrendingUp, FiTrendingDown, FiPackage,
} from 'react-icons/fi';
import { FaFileInvoice } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('en-IN');

const Sk = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

const BarRow = ({ name, value, label, max, color, sub }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700 truncate flex-1 mr-2" title={name}>{name}</span>
        <span className="text-xs font-black text-gray-800 shrink-0">{label ?? value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const QL = ({ to, icon, label, color, iconBg }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all group text-center"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform`}>
      <span className={color} style={{ fontSize: 17 }}>{icon}</span>
    </div>
    <span className="text-[11px] font-semibold text-gray-600 leading-tight">{label}</span>
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
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    axiosSecure.get('/dashboard-stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [axiosSecure]);

  const gpMax = Math.max(...(stats?.gatePass?.unitBreakdown?.map(x => x.qty) || [1]), 1);

  return (
    <div className="space-y-5">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0c1a3a 100%)', minHeight: 148 }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        {/* Glows */}
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.22), transparent)' }} />
        <div className="absolute -bottom-10 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent)' }} />

        {/* Road dashes */}
        <div className="absolute bottom-0 left-0 right-0 h-6 opacity-[0.12]" style={{ background: 'linear-gradient(90deg, transparent, #64748b 20%, #64748b 80%, transparent)' }} />
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-4 px-12 pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="h-px flex-1 rounded-full opacity-20" style={{ background: '#f59e0b' }} />
          ))}
        </div>

        {/* Truck SVG — decorative */}
        <div className="absolute right-5 bottom-5 pointer-events-none opacity-[0.08] hidden sm:block">
          <svg width="130" height="64" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="12" width="76" height="36" rx="3" fill="white"/>
            <line x1="20" y1="12" x2="20" y2="48" stroke="#cbd5e1" strokeWidth="1.2"/>
            <line x1="40" y1="12" x2="40" y2="48" stroke="#cbd5e1" strokeWidth="1.2"/>
            <line x1="60" y1="12" x2="60" y2="48" stroke="#cbd5e1" strokeWidth="1.2"/>
            <rect x="78" y="20" width="38" height="28" rx="3" fill="white"/>
            <rect x="88" y="22" width="22" height="13" rx="2" fill="#1e3a8a" opacity="0.5"/>
            <circle cx="20" cy="54" r="6" fill="#475569"/><circle cx="20" cy="54" r="2.5" fill="#0f172a"/>
            <circle cx="58" cy="54" r="6" fill="#475569"/><circle cx="58" cy="54" r="2.5" fill="#0f172a"/>
            <circle cx="102" cy="54" r="6" fill="#475569"/><circle cx="102" cy="54" r="2.5" fill="#0f172a"/>
            <rect x="112" y="10" width="3" height="12" rx="1.5" fill="white" opacity="0.4"/>
            <ellipse cx="113.5" cy="9" rx="4" ry="2" fill="white" opacity="0.15"/>
          </svg>
        </div>

        {/* Floating labels — right */}
        <div className="absolute top-5 right-5 flex flex-col gap-1.5 pointer-events-none hidden lg:flex">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70" />
            <span className="text-[9px] font-bold tracking-widest text-orange-400 opacity-70">LOGISTICS</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-70" />
            <span className="text-[9px] font-bold tracking-widest text-indigo-400 opacity-70">TRANSPORT</span>
          </div>
        </div>

        {/* Text */}
        <div className="relative px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f97316, #6366f1)' }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LBTS-OS · Management System</span>
          </div>
          <h1 className="text-[22px] font-black text-white leading-snug">
            {greeting}, {user?.displayName?.split(' ')[0] || 'Welcome'} 👋
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">{monthName} {now.getFullYear()}</p>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Gate Pass Card ── */}
        <Link
          to="/all-gate-pass"
          className="group bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          style={{ borderColor: '#3b82f640' }}
        >
          <div className="h-0.5" style={{ background: '#3b82f6' }} />
          <div className="p-5 flex flex-col flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#3b82f615' }}>
                  <FaFileInvoice style={{ color: '#3b82f6', fontSize: 17 }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Gate Pass</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{monthName} · Unit-wise dispatch</p>
                </div>
              </div>
              <FiArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>

            {/* Unit breakdown */}
            {loading ? (
              <div className="space-y-3 flex-1">
                {[1,2,3,4,5].map(i => <Sk key={i} className="h-8 w-full" />)}
              </div>
            ) : !stats?.gatePass?.unitBreakdown?.length ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300 flex-1">
                <FaFileInvoice size={30} />
                <p className="text-xs">No data this month</p>
              </div>
            ) : (
              <div className="flex-1 divide-y divide-gray-50">
                {stats.gatePass.unitBreakdown.map((item, i) => (
                  <BarRow
                    key={i}
                    name={item._id || 'Unknown'}
                    value={item.qty}
                    label={`${item.qty.toLocaleString()} pcs`}
                    sub={`${item.passCount} pass${item.passCount !== 1 ? 'es' : ''}`}
                    max={gpMax}
                    color="#3b82f6"
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Accounts Card (admin/ceo only) */}
          {isAdminOrCeo && (
            <Link
              to="/accounts"
              className="group bg-white rounded-2xl border shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              style={{ borderColor: '#6366f140' }}
            >
              <div className="h-0.5" style={{ background: '#6366f1' }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6366f115' }}>
                      <FiActivity style={{ color: '#6366f1', fontSize: 17 }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Accounts</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{monthName} · Cash Flow</p>
                    </div>
                  </div>
                  <FiArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <Sk className="h-16 w-full rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                      {[1,2,3,4].map(i => <Sk key={i} className="h-14 rounded-xl" />)}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Net Balance */}
                    <div className={`rounded-xl px-5 py-4 mb-4 flex items-center justify-between ${(stats?.accounts?.netBalance ?? 0) >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Net Balance</p>
                        <p className={`text-2xl font-black ${(stats?.accounts?.netBalance ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {fmt(stats?.accounts?.netBalance)}
                        </p>
                      </div>
                      {(stats?.accounts?.netBalance ?? 0) >= 0
                        ? <FiTrendingUp size={28} className="text-emerald-400" />
                        : <FiTrendingDown size={28} className="text-red-400" />}
                    </div>

                    {/* 4 metric boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Income',        value: stats?.accounts?.income,        bg: 'bg-emerald-50 border-emerald-100', txt: 'text-emerald-700', sub: 'text-emerald-500' },
                        { label: 'Expense',       value: stats?.accounts?.totalExpense,  bg: 'bg-red-50 border-red-100',         txt: 'text-red-600',     sub: 'text-red-400' },
                        { label: 'Vendor Pay',    value: stats?.accounts?.vendorPayment, bg: 'bg-indigo-50 border-indigo-100',   txt: 'text-indigo-700',  sub: 'text-indigo-400' },
                        { label: 'Advance',       value: (stats?.accounts?.autoAdv || 0) + (stats?.accounts?.manualAdv || 0),       bg: 'bg-amber-50 border-amber-100',     txt: 'text-amber-700',   sub: 'text-amber-500' },
                      ].map((r, i) => (
                        <div key={i} className={`rounded-xl border px-3 py-3 ${r.bg}`}>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${r.sub}`}>{r.label}</p>
                          <p className={`text-sm font-black leading-tight ${r.txt}`}>{fmt(r.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
              <QL to="/add-gate-pass"   icon={<FaFileInvoice />}         label="New Gate Pass"   color="text-blue-500"    iconBg="bg-blue-50" />
              <QL to="/add-challan"     icon={<FiFileText />}             label="New Challan"     color="text-green-500"   iconBg="bg-green-50" />
              <QL to="/create-delivery" icon={<MdOutlineLocalShipping />} label="Create Delivery" color="text-orange-500"  iconBg="bg-orange-50" />
              <QL to="/add-vendor"      icon={<FiTruck />}                label="Add Vendor"      color="text-purple-500"  iconBg="bg-purple-50" />
              <QL to="/deliverd"        icon={<FiCheckCircle />}          label="Delivered"       color="text-emerald-500" iconBg="bg-emerald-50" />
              <QL to="/trip-inventory"  icon={<MdInventory2 />}           label="Trip Inventory"  color="text-amber-500"   iconBg="bg-amber-50" />
              <QL to="/car-rent"        icon={<FiPackage />}              label="Car Rent Bill"   color="text-rose-500"    iconBg="bg-rose-50" />
              {isAdminOrCeo && (
                <QL to="/accounts"      icon={<FiActivity />}             label="Accounts"        color="text-indigo-500"  iconBg="bg-indigo-50" />
              )}
            </div>
          </div>

        </div>
      </div>

      <p className="text-center text-xs text-gray-300 pb-2">LBTS-OS · Logistics & Transport Management System</p>
    </div>
  );
};

export default Home;