
import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import useRole from '../hooks/useRole';
import { useSearch } from '../hooks/SearchContext';
import {
  FiHome, FiLogOut, FiUser, FiSearch, FiMenu, FiPackage, FiX,
  FiShield, FiDatabase, FiUsers, FiChevronDown
} from 'react-icons/fi';
import { FaFileInvoice, FaPlusCircle, FaWarehouse } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';
import { IoMdCash } from 'react-icons/io';
import { TbTruckDelivery, TbClipboardList, TbPackage } from 'react-icons/tb';
import { RiTruckLine } from 'react-icons/ri';

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { to: '/', icon: <FiHome size={15} />, label: 'Dashboard', color: 'text-slate-400' },
    ],
  },
  {
    label: 'Gate Pass',
    items: [
      { to: '/add-gate-pass',  icon: <FaPlusCircle size={13} />, label: 'Add Gate Pass',       color: 'text-sky-400' },
      { to: '/all-gate-pass',  icon: <FaWarehouse size={13} />,  label: 'Gate Pass Inventory', color: 'text-sky-400' },
    ],
  },
  {
    label: 'Challan',
    items: [
      { to: '/add-challan',  icon: <TbPackage size={15} />,       label: 'Add Challan',       color: 'text-emerald-400' },
      { to: '/all-challan',  icon: <TbClipboardList size={15} />, label: 'Challan Inventory', color: 'text-emerald-400' },
    ],
  },
  {
    label: 'Vendor',
    items: [
      { to: '/add-vendor', icon: <RiTruckLine size={15} />,  label: 'Add Vendor',      color: 'text-violet-400' },
      { to: '/all-vendor', icon: <FiDatabase size={14} />,   label: 'Vendor Database', color: 'text-violet-400' },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { to: '/create-delivery', icon: <TbTruckDelivery size={16} />, label: 'Create Delivery', color: 'text-amber-400' },
      { to: '/trip-inventory',  icon: <MdInventory2 size={15} />,    label: 'Trip Inventory',  color: 'text-amber-400' },
      { to: '/deliverd',  icon:<FiPackage size={14} />,    label: 'Deliverd',  color: 'text-amber-400' },
    ],
  },
];

/* ── Nav item ── */
const NavItem = ({ to, icon, label, iconColor, exact }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : iconColor}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </>
    )}
  </NavLink>
);

/* ── Section label ── */
const SectionLabel = ({ label }) => (
  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] px-3 mb-1.5 mt-1">
    {label}
  </p>
);

const RootLayout = () => {
  const { user, logOut } = useAuth();
  const { role, status } = useRole();
  const { searchText, setSearchText } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setSearchText('');
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogOut = () => {
    logOut()
      .then(() => { toast.success('Logged out successfully'); navigate('/login'); })
      .catch(() => toast.error('Logout failed'));
  };

  /* ── Sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <FiPackage className="text-white" size={15} />
        </div>
        <div>
          <span className="text-sm font-black text-white leading-none tracking-tight">
            LBTS <span className="text-orange-500">OS</span>
          </span>
          <p className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
            Logistics System
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-3.5 scrollbar-none">

        {/* Admin section */}
        {role === 'admin' && status === 'approved' && (
          <div>
            <SectionLabel label="Admin" />
            <ul className="space-y-0.5">
              <li><NavItem to="/user-management" icon={<FiShield size={14} />} label="User Control" iconColor="text-indigo-400" /></li>
            </ul>
          </div>
        )}

        {/* Finance section */}
        {['admin', 'manager', 'ceo'].includes(role) && status === 'approved' && (
          <div>
            <SectionLabel label="Finance" />
            <ul className="space-y-0.5">
              <li><NavItem to="/accounts"  icon={<IoMdCash size={16} />}   label="Accounts Dashboard" iconColor="text-emerald-400" /></li>
              <li><NavItem to="/car-rent"  icon={<RiTruckLine size={15} />} label="Car Rent"           iconColor="text-rose-400" /></li>
            </ul>
          </div>
        )}

        {/* Vendor-only section */}
        {role === 'vendor' && status === 'approved' && (
          <div>
            <SectionLabel label="Vendor" />
            <ul className="space-y-0.5">
              <li><NavItem to="/all-vendor" icon={<FiDatabase size={14} />} label="Vendor Database" iconColor="text-violet-400" /></li>
            </ul>
          </div>
        )}

        {/* General nav sections */}
        {role !== 'vendor' && NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <SectionLabel label={section.label} />
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavItem
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    iconColor={item.color}
                    exact={item.to === '/'}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      {user && (
        <div className="p-2.5 border-t border-white/5">
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`}
                alt=""
                className="w-7 h-7 rounded-full flex-shrink-0 object-cover ring-2 ring-orange-500/30"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`; }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate leading-tight">{user?.displayName}</p>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">{role || 'User'}</span>
              </div>
            </div>
            <button
              onClick={handleLogOut}
              title="Sign out"
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
            >
              <FiLogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-52 xl:w-56' : 'w-0'}`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-56 shadow-2xl z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Navbar ── */}
        <nav className="flex-shrink-0 flex items-center gap-3 px-3 sm:px-4 h-14 bg-white border-b border-slate-200 shadow-sm z-30">

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <FiMenu size={18} />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <FiMenu size={18} />
          </button>

          {/* Logo (when sidebar collapsed) */}
          {!sidebarOpen && (
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <FiPackage className="text-white" size={13} />
              </div>
              <span className="text-sm font-black text-slate-800">
                LBTS <span className="text-orange-500">OS</span>
              </span>
            </div>
          )}

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Role badge */}
            {role && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                {role}
              </span>
            )}

            {/* Username */}
            <span className="hidden md:block text-sm font-semibold text-slate-700 truncate max-w-[120px]">
              {user?.displayName}
            </span>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 group"
              >
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-orange-300 transition-all"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`; }}
                />
                <FiChevronDown size={12} className="text-slate-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    {/* Menu items */}
                    <div className="p-1.5">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors font-medium"
                      >
                        <FiUser size={13} className="text-slate-400" /> My Profile
                      </Link>
                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors font-medium mt-0.5"
                      >
                        <FiLogOut size={13} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
