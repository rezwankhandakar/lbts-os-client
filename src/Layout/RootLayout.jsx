
// import React, { useState, useEffect } from 'react';
// import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';
// import useAuth from '../hooks/useAuth';
// import toast from 'react-hot-toast';
// import useRole from '../hooks/useRole';
// import { useSearch } from '../hooks/SearchContext';
// import {
//   FiUsers, FiHome, FiPlusCircle, FiFileText,
//   FiTruck, FiLogOut, FiUser, FiSearch, FiMenu, FiPackage, FiX
// } from 'react-icons/fi';
// import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa';
// import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';

// // ── Nav sections config ────────────────────────────────────────────
// const NAV_SECTIONS = [
//   {
//     label: 'General',
//     items: [
//       { to: '/', icon: <FiHome size={17} />, label: 'Home' },
//     ],
//   },
//   {
//     label: 'Gate Pass',
//     items: [
//       { to: '/add-gate-pass',  icon: <FaPlusCircle size={15} />,   label: 'Add Gate Pass',       color: 'text-blue-400' },
//       { to: '/all-gate-pass',  icon: <FaFileInvoice size={15} />,  label: 'Gate Pass Inventory', color: 'text-blue-400' },
//     ],
//   },
//   {
//     label: 'Challan',
//     items: [
//       { to: '/add-challan', icon: <FiPlusCircle size={17} />, label: 'Add Challan',       color: 'text-green-400' },
//       { to: '/all-challan', icon: <FiFileText size={17} />,   label: 'Challan Inventory', color: 'text-green-400' },
//     ],
//   },
//   {
//     label: 'Vendor',
//     items: [
//       { to: '/add-vendor', icon: <FiTruck size={17} />,  label: 'Add Vendor',      color: 'text-purple-400' },
//       { to: '/all-vendor', icon: <FiUsers size={17} />,  label: 'Vendor Database', color: 'text-purple-400' },
//     ],
//   },
//   {
//     label: 'Delivery',
//     items: [
//       { to: '/create-delivery', icon: <MdOutlineLocalShipping size={18} />, label: 'Create Delivery', color: 'text-orange-400' },
//       { to: '/deliverd',        icon: <FiTruck size={17} />,                label: 'Delivered',       color: 'text-orange-400' },
//       { to: '/trip-inventory',  icon: <MdInventory2 size={17} />,           label: 'Trip Inventory',  color: 'text-orange-400' },
//     ],
//   },
//   {
//     label: 'Bill',
//     items: [
//       { to: '/car-rent', icon: <MdOutlineLocalShipping size={18} />, label: 'Car Rent', color: 'text-orange-400' },
//     ],
//   },
 
// ];

// const RootLayout = () => {
//   const { user, logOut } = useAuth();
//   const { role, status } = useRole();
//   const { searchText, setSearchText } = useSearch();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   // Reset search on route change
//   useEffect(() => {
//     setSearchText('');
//     setMobileOpen(false);
//   }, [location.pathname]);

//   // Close mobile sidebar on resize
//   useEffect(() => {
//     const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);

//   const handleLogOut = () => {
//     logOut()
//       .then(() => { toast.success('Logged out 👋'); navigate('/login'); })
//       .catch(() => toast.error('Logout failed'));
//   };

//   const linkClass = ({ isActive }) =>
//     `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
//       isActive
//         ? 'bg-orange-500 text-white shadow-md shadow-orange-200 font-semibold'
//         : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
//     }`;

//   // ── Sidebar content ────────────────────────────────────────────
//   const SidebarContent = () => (
//     <div className="flex flex-col h-full bg-white">

//       {/* Logo */}
//       <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
//         <div className="w-9 h-9 bg-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-200">
//           <FiPackage className="text-white text-lg" />
//         </div>
//         <div>
//           <span className="text-lg font-black text-gray-900 leading-none tracking-tight">
//             LBTS <span className="text-orange-500">OS</span>
//           </span>
//           <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mt-0.5">Logistics System</p>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-none">

//         {/* Admin only */}
//         {role === 'admin' && status === 'approved' && (
//           <div>
//             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-1.5">Admin</p>
//             <ul>
//               <li>
//                 <NavLink to="/user-management" className={linkClass}>
//                   <FiUsers size={17} className="flex-shrink-0" /> User Control
//                 </NavLink>
//               </li>
//               <li>
//                 <NavLink to="/accounts" className={linkClass}>
//                   {({ isActive }) => (
//                     <>
//                       <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`}>
//                         <FiPackage size={17} />
//                       </span>
//                       Accounts Dashboard
//                     </>
//                   )}
//                 </NavLink>
//               </li>
//             </ul>
//           </div>
//         )}


//         {NAV_SECTIONS.map((section) => (
//           <div key={section.label}>
//             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-1.5">
//               {section.label}
//             </p>
//             <ul className="space-y-0.5">
//               {section.items.map((item) => (
//                 <li key={item.to}>
//                   <NavLink to={item.to} className={linkClass}>
//                     {({ isActive }) => (
//                       <>
//                         <span className={`flex-shrink-0 ${isActive ? 'text-white' : (item.color || 'text-gray-400')}`}>
//                           {item.icon}
//                         </span>
//                         {item.label}
//                       </>
//                     )}
//                   </NavLink>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       {user && (
//         <div className="p-3 border-t border-gray-100">
//           <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-3 py-2.5">
//             <div className="flex items-center gap-2.5 min-w-0">
//               <img
//                 src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`}
//                 alt=""
//                 className="w-8 h-8 rounded-full flex-shrink-0 object-cover ring-2 ring-orange-100"
//                 onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`; }}
//               />
//               <div className="min-w-0">
//                 <p className="text-xs font-bold text-gray-700 truncate">{user?.displayName}</p>
//                 <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide">{role || 'User'}</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogOut}
//               title="Sign out"
//               className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
//             >
//               <FiLogOut size={15} />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

//       {/* ── Desktop Sidebar ── */}
//       <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-gray-100 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-56' : 'w-0'}`}>
//         <SidebarContent />
//       </aside>

//       {/* ── Mobile Sidebar Overlay ── */}
//       {mobileOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
//           <aside className="absolute left-0 top-0 bottom-0 w-56 shadow-2xl">
//             <SidebarContent />
//           </aside>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

//         {/* Navbar */}
//         <nav className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-orange-400 border-b border-orange-500/20 shadow-sm shadow-orange-200/50">

//           {/* Mobile menu toggle */}
//           <button
//             onClick={() => setMobileOpen(!mobileOpen)}
//             className="lg:hidden p-2 rounded-xl text-white hover:bg-orange-500 transition-colors"
//           >
//             <FiMenu size={20} />
//           </button>

//           {/* Desktop sidebar toggle */}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="hidden lg:flex p-2 rounded-xl text-white hover:bg-orange-500 transition-colors"
//           >
//             <FiMenu size={20} />
//           </button>

//           {/* Search */}
//           <div className="flex-1 max-w-sm relative">
//             <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-200" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="w-full pl-9 pr-4 py-2 bg-orange-500/40 border border-orange-300/30 rounded-full text-sm text-white placeholder-orange-200 focus:outline-none focus:bg-orange-500/60 transition-all"
//             />
//             {searchText && (
//               <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-200 hover:text-white">
//                 <FiX size={14} />
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-2 ml-auto">
//             {/* Username */}
//             <span className="hidden sm:block text-sm font-bold text-white">
//               {user?.displayName}
//             </span>

//             {/* Avatar dropdown */}
//             <div className="dropdown dropdown-end">
//               <div tabIndex={0} role="button" className="cursor-pointer">
//                 <img
//                   src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=fff&color=f97316`}
//                   alt=""
//                   className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50 hover:ring-white transition-all"
//                   onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=fff&color=f97316`; }}
//                 />
//               </div>
//               <ul tabIndex={0} className="mt-3 z-50 p-2 shadow-2xl menu menu-sm dropdown-content bg-white rounded-2xl w-52 border border-gray-100">
//                 <div className="px-3 py-2 border-b border-gray-50 mb-1">
//                   <p className="text-xs font-bold text-gray-800 truncate">{user?.displayName}</p>
//                   <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
//                 </div>
//                 <li>
//                   <Link to="/profile" className="flex items-center gap-2 text-sm">
//                     <FiUser size={14} /> My Profile
//                   </Link>
//                 </li>
//                 <li className="mt-1">
//                   <button onClick={handleLogOut} className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50">
//                     <FiLogOut size={14} /> Sign Out
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </nav>

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RootLayout;




import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import useRole from '../hooks/useRole';
import { useSearch } from '../hooks/SearchContext';
import {
  FiUsers, FiHome, FiPlusCircle, FiFileText,
  FiTruck, FiLogOut, FiUser, FiSearch, FiMenu, FiPackage, FiX
} from 'react-icons/fi';
import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa';
import { MdOutlineLocalShipping, MdInventory2 } from 'react-icons/md';

// ── Nav sections config ────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { to: '/', icon: <FiHome size={17} />, label: 'Home' },
    ],
  },
  {
    label: 'Gate Pass',
    items: [
      { to: '/add-gate-pass',  icon: <FaPlusCircle size={15} />,   label: 'Add Gate Pass',       color: 'text-blue-400' },
      { to: '/all-gate-pass',  icon: <FaFileInvoice size={15} />,  label: 'Gate Pass Inventory', color: 'text-blue-400' },
    ],
  },
  {
    label: 'Challan',
    items: [
      { to: '/add-challan', icon: <FiPlusCircle size={17} />, label: 'Add Challan',       color: 'text-green-400' },
      { to: '/all-challan', icon: <FiFileText size={17} />,   label: 'Challan Inventory', color: 'text-green-400' },
    ],
  },
  {
    label: 'Vendor',
    items: [
      { to: '/add-vendor', icon: <FiTruck size={17} />,  label: 'Add Vendor',      color: 'text-purple-400' },
      { to: '/all-vendor', icon: <FiUsers size={17} />,  label: 'Vendor Database', color: 'text-purple-400' },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { to: '/create-delivery', icon: <MdOutlineLocalShipping size={18} />, label: 'Create Delivery', color: 'text-orange-400' },
      { to: '/deliverd',        icon: <FiTruck size={17} />,                label: 'Delivered',       color: 'text-orange-400' },
      { to: '/trip-inventory',  icon: <MdInventory2 size={17} />,           label: 'Trip Inventory',  color: 'text-orange-400' },
    ],
  },
  {
    label: 'Bill',
    items: [
      { to: '/car-rent', icon: <MdOutlineLocalShipping size={18} />, label: 'Car Rent', color: 'text-orange-400' },
    ],
  },
 
];

const RootLayout = () => {
  const { user, logOut } = useAuth();
  const { role, status } = useRole();
  const { searchText, setSearchText } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset search on route change
  useEffect(() => {
    setSearchText('');
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogOut = () => {
    logOut()
      .then(() => { toast.success('Logged out 👋'); navigate('/login'); })
      .catch(() => toast.error('Logout failed'));
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
      isActive
        ? 'bg-orange-500 text-white shadow-md shadow-orange-200 font-semibold'
        : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
    }`;

  // ── Sidebar content ────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-200">
          <FiPackage className="text-white text-lg" />
        </div>
        <div>
          <span className="text-lg font-black text-gray-900 leading-none tracking-tight">
            LBTS <span className="text-orange-500">OS</span>
          </span>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mt-0.5">Logistics System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-none">

        {/* Admin only */}
        {role === 'admin' && status === 'approved' && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-1.5">Admin</p>
            <ul>
              <li>
                <NavLink to="/user-management" className={linkClass}>
                  <FiUsers size={17} className="flex-shrink-0" /> User Control
                </NavLink>
              </li>
              <li>
                <NavLink to="/accounts" className={linkClass}>
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`}>
                        <FiPackage size={17} />
                      </span>
                      Accounts Dashboard
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>
        )}


        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <span className={`flex-shrink-0 ${isActive ? 'text-white' : (item.color || 'text-gray-400')}`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {user && (
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`}
                alt=""
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover ring-2 ring-orange-100"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=f97316&color=fff`; }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">{user?.displayName}</p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide">{role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogOut}
              title="Sign out"
              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
            >
              <FiLogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-gray-100 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-56' : 'w-0'}`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Navbar */}
        <nav className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-orange-400 border-b border-orange-500/20 shadow-sm shadow-orange-200/50">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-orange-500 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-xl text-white hover:bg-orange-500 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-200" />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-orange-500/40 border border-orange-300/30 rounded-full text-sm text-white placeholder-orange-200 focus:outline-none focus:bg-orange-500/60 transition-all"
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-200 hover:text-white">
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Username */}
            <span className="hidden sm:block text-sm font-bold text-white">
              {user?.displayName}
            </span>

            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="cursor-pointer">
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=fff&color=f97316`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50 hover:ring-white transition-all"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=fff&color=f97316`; }}
                />
              </div>
              <ul tabIndex={0} className="mt-3 z-50 p-2 shadow-2xl menu menu-sm dropdown-content bg-white rounded-2xl w-52 border border-gray-100">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{user?.displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <li>
                  <Link to="/profile" className="flex items-center gap-2 text-sm">
                    <FiUser size={14} /> My Profile
                  </Link>
                </li>
                <li className="mt-1">
                  <button onClick={handleLogOut} className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50">
                    <FiLogOut size={14} /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-hidden p-4 md:p-6 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;