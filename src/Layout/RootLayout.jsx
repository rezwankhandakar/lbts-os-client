// import React from 'react';
// import { Link, NavLink, Outlet, useNavigate } from 'react-router';
// import useAuth from '../hooks/useAuth';
// import toast from 'react-hot-toast';
// import { FiUsers } from 'react-icons/fi';
// import useRole from '../hooks/useRole';

// import { useSearch } from '../hooks/SearchContext';
// import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa';

// const RootLayout = () => {
//   const { user, logOut } = useAuth()
//   const { role, status, } = useRole()
//   const { searchText, setSearchText } = useSearch();
//   console.log(user)
//   const navigate = useNavigate();

//   const handleLogOut = () => {
//     logOut()
//       .then(() => {
//         toast.success("Logout Successful 👋");
//         navigate("/login");
//       })
//       .catch((error) => {
//         console.log(error);
//         toast.error("Logout failed");
//       });
//   };

//   //handle closeDrawer//
//   const closeDrawer = () => {
//     const drawer = document.getElementById("my-drawer-4");
//     if (drawer) drawer.checked = false;
//   };

//   return (
//     <div className="drawer lg:drawer-open">
//       <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
//       <div className="drawer-content">
//         {/* Navbar */}


//         <nav className="navbar sticky top-0 z-50 w-full bg-orange-400/95 backdrop-blur shadow-md text-white px-4 py-2">

//           {/* Sidebar Toggle */}
//           <label
//             htmlFor="my-drawer-4"
//             aria-label="open sidebar"
//             className="btn btn-square btn-ghost mr-2"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               strokeLinejoin="round"
//               strokeLinecap="round"
//               strokeWidth="2"
//               fill="none"
//               stroke="currentColor"
//               className="w-5 h-5"
//             >
//               <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
//               <path d="M9 4v16" />
//               <path d="M14 10l2 2l-2 2" />
//             </svg>
//           </label>

//           <div className="flex w-full items-center justify-between gap-4">

//             {/* 🔍 Search Bar */}
//             {/* Mobile + Desktop both visible */}
//             <div className="flex-1 max-w-xs sm:max-w-sm">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 className="input input-bordered w-full text-black"
//               />
//             </div>


//             <div className="flex items-center gap-2 md:gap-4 ml-auto">

//               {/* ================= Desktop Auth Links ================= */}
//               {!user && (
//                 <div className="hidden sm:flex items-center gap-2">
//                   <NavLink
//                     to="/register"
//                     className={({ isActive }) =>
//                       `px-3 md:px-4 py-1.5 rounded-lg font-semibold transition ${isActive
//                         ? "bg-white text-orange-500"
//                         : "text-white hover:bg-white/20"
//                       }`
//                     }
//                   >
//                     Register
//                   </NavLink>

//                   <NavLink
//                     to="/login"
//                     className={({ isActive }) =>
//                       `px-3 md:px-4 py-1.5 rounded-lg font-semibold transition ${isActive
//                         ? "bg-white text-orange-500"
//                         : "text-white hover:bg-white/20"
//                       }`
//                     }
//                   >
//                     Login
//                   </NavLink>
//                 </div>
//               )}

//               {/* ================= Username (Desktop only) ================= */}
//               {user && (
//                 <h2
//                   className="hidden sm:block md:text-xl lg:text-2xl font-bold 
//       bg-gradient-to-r from-blue-800 to-purple-700
//       bg-clip-text text-transparent"
//                 >
//                   {user?.displayName || "User"}
//                 </h2>
//               )}

//               {/* ================= Avatar Dropdown ================= */}
//               {(user || !user) && (
//                 <div className="dropdown dropdown-end sm:hidden">
//                   <div tabIndex={0} role="button">
//                     <img
//                       src={
//                         user?.photoURL ||
//                         "https://i.ibb.co/4pDNDk1/avatar.png"
//                       }
//                       className="w-9 h-9 rounded-full object-cover border-2 border-white cursor-pointer"
//                     />
//                   </div>

//                   <ul
//                     tabIndex={0}
//                     className="dropdown-content menu bg-base-100 rounded-box w-44 p-2 shadow text-black"
//                   >
//                     {!user && (
//                       <>
//                         <li>
//                           <NavLink to="/register">Register</NavLink>
//                         </li>
//                         <li>
//                           <NavLink to="/login">Login</NavLink>
//                         </li>
//                       </>
//                     )}

//                     {user && (
//                       <>
//                         <li>
//                           <NavLink to="/profile">Profile</NavLink>
//                         </li>

//                         <li>
//                           <button
//                             onClick={handleLogOut}
//                             className="text-red-500"
//                           >
//                             Logout
//                           </button>
//                         </li>
//                       </>
//                     )}
//                   </ul>
//                 </div>
//               )}

//               {/* ================= Desktop Avatar (User only) ================= */}
//               {user && (
//                 <div className="hidden sm:block dropdown dropdown-end">
//                   <div tabIndex={0} role="button">
//                     <img
//                       src={user?.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"}
//                       className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
//                     />
//                   </div>

//                   <ul
//                     tabIndex={0}
//                     className="dropdown-content menu bg-base-100 rounded-box w-44 p-2 shadow text-black"
//                   >
//                     <li>
//                       <NavLink to="/profile">Profile</NavLink>
//                     </li>

//                     <li>
//                       <button
//                         onClick={handleLogOut}
//                         className="text-red-500"
//                       >
//                         Logout
//                       </button>
//                     </li>
//                   </ul>
//                 </div>
//               )}
//             </div>



//           </div>
//         </nav>



//         {/* Page content here */}
//         <div className="p-4"><Outlet></Outlet></div>
//       </div>

//       <div className="drawer-side is-drawer-close:overflow-visible">
//         {/* <div className="drawer-side z-40"> */}
//         <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
//         {/* <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64"> */}
//         <div className="flex min-h-full flex-col items-start bg-base-200 
// w-64 pt-16 lg:pt-0 
// lg:is-drawer-open:w-64 lg:is-drawer-close:w-14">
//           {/* Sidebar content here */}
//           <ul className="menu w-full grow">
//             {/* <ul className="menu w-full grow overflow-y-auto"> */}
//             {/* List item */}
//             <li>
//               <NavLink to='/' onClick={closeDrawer} className={({ isActive }) =>
//                 `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                   ? "bg-orange-400 text-white font-semibold"
//                   : "hover:bg-green-300"
//                 }`
//               } data-tip="Homepage">
//                 {/* Home icon */}
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
//                 <span className="is-drawer-close:hidden">Home</span>
//               </NavLink>
//             </li>

//             {/* List item */}
//             {role === 'admin' && status === 'approved' && (
//               <li>
//                 <NavLink
//                   to="/user-management" onClick={closeDrawer}
//                   className={({ isActive }) =>
//                     `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                       ? "bg-orange-400 text-white font-semibold"
//                       : "hover:bg-green-300"
//                     }`
//                   }
//                   data-tip="User Management"
//                 >
//                   {/* Icon */}
//                   <FiUsers className="w-5 h-5" />
//                   <span className="is-drawer-close:hidden">User Management</span>
//                 </NavLink>
//               </li>
//             )}

//             <li>
//               <NavLink
//                 to="/add-gate-pass"
//                 onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="Add Gate Pass"
//               >
//                 <FaPlusCircle className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">Add Gate Pass</span>
//               </NavLink>

//               <NavLink
//                 to="/all-gate-pass" onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="Gate Pass"
//               >
//                 {/* Icon */}
//                 <FaFileInvoice className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">Gate Pass</span>
//               </NavLink>

//               <NavLink
//                 to="/add-challan" onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="Add Challan"
//               >
//                 {/* Icon */}
//                 <FaFileInvoice className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">Add Challan</span>
//               </NavLink>


//               <NavLink
//                 to="/all-challan" onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="All Challan"
//               >
//                 {/* Icon */}
//                 <FaFileInvoice className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">All Challan</span>
//               </NavLink>


//               <NavLink
//                 to="/add-vendor" onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="Add Vendor"
//               >
//                 {/* Icon */}
//                 <FaFileInvoice className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">Add Vendor</span>
//               </NavLink>


//               <NavLink
//                 to="/all-vendor" onClick={closeDrawer}
//                 className={({ isActive }) =>
//                   `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${isActive
//                     ? "bg-orange-400 text-white font-semibold"
//                     : "hover:bg-green-300"
//                   }`
//                 }
//                 data-tip="All Vendor"
//               >
//                 {/* Icon */}
//                 <FaFileInvoice className="w-5 h-5" />
//                 <span className="is-drawer-close:hidden">All Vendor</span>
//               </NavLink>
//             </li>


//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RootLayout;




import React, { useState } from 'react'; // useState add kora hoyeche
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import useRole from '../hooks/useRole';
import { useSearch } from '../hooks/SearchContext';
import { 
  FiUsers, FiHome, FiPlusCircle, FiFileText, 
  FiTruck, FiLogOut, FiUser, FiSearch, FiMenu, FiPackage, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa';

const RootLayout = () => {
  const { user, logOut } = useAuth();
  const { role, status } = useRole();
  const { searchText, setSearchText } = useSearch();
  const navigate = useNavigate();
  
  // Sidebar state for desktop toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logout Successful 👋");
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Logout failed");
      });
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("my-drawer-4");
    if (drawer) drawer.checked = false;
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 font-semibold scale-[1.02]"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
    }`;

  return (
    <div className="drawer lg:drawer-open font-sans bg-gray-50/50">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen transition-all duration-300">
        
        {/* ================= Modern Navbar ================= */}
        <nav className="navbar sticky top-0 z-40 w-full bg-orange-400 backdrop-blur-md border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <label htmlFor="my-drawer-4" className="btn btn-square btn-ghost text-gray-600 lg:hidden">
              <FiMenu size={24} />
            </label>

            {/* Desktop Sidebar Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="hidden lg:flex btn btn-square btn-ghost text-gray-600 hover:bg-orange-50"
            >
              {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          <div className="flex-1 px-2 mx-2">
            <div className="relative w-full max-w-sm group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <FiSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered h-10 w-full pl-10 bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-extrabold text-gray-700 leading-none tracking-tight hover:text-orange-600 transition-colors duration-300 cursor-default">
  {user?.displayName || "Guest User"}
</span>
              </div>
            )}

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar online border border-gray-100 shadow-sm">
                <div className="w-10 rounded-full">
                  <img src={user?.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"} alt="User" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[50] p-2 shadow-2xl menu menu-sm dropdown-content bg-white rounded-2xl w-56 border border-gray-100">
                {!user ? (
                  <>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase">Account</p>
                    </div>
                    <li><Link to="/profile"><FiUser /> My Profile</Link></li>
                    <li className="mt-1">
                      <button onClick={handleLogOut} className="py-2 text-red-500 hover:bg-red-50"><FiLogOut /> Sign Out</button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* ================= Page Content ================= */}
        <main className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>

      {/* ================= Sidebar Design ================= */}
      <div className={`drawer-side z-50 transition-all duration-300 ${!isSidebarOpen ? 'lg:w-0' : 'lg:w-72'}`}>
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        
        {/* Dynamic Width Sidebar Container */}
        <div className={`p-5 min-h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-72' : 'w-0 p-0 border-none'}`}>
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-4 mb-10 mt-2 whitespace-nowrap">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-200">
              <FiPackage className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none tracking-tight">IMS<span className="text-orange-500">SYSTEM</span></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Enterprise Hub</span>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto no-scrollbar pb-10 flex-1">
            {/* General */}
            <div className="whitespace-nowrap">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-4 mb-3">General</p>
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/" onClick={closeDrawer} className={linkClass}><FiHome size={18} /> Home Dashboard</NavLink></li>
                {role === 'admin' && status === 'approved' && (
                  <li><NavLink to="/user-management" onClick={closeDrawer} className={linkClass}><FiUsers size={18} /> User Control</NavLink></li>
                )}
              </ul>
            </div>

            {/* Inventory */}
            <div className="whitespace-nowrap">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-4 mb-3">Inventory Management</p>
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-gate-pass" onClick={closeDrawer} className={linkClass}><FaPlusCircle className="text-blue-500 group-[.active]:text-white" /> Create Gate Pass</NavLink></li>
                <li><NavLink to="/all-gate-pass" onClick={closeDrawer} className={linkClass}><FaFileInvoice className="text-blue-500 group-[.active]:text-white" /> Gate Pass Log</NavLink></li>
              </ul>
            </div>

            {/* Billing */}
            <div className="whitespace-nowrap">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-4 mb-3">Billing & Challan</p>
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-challan" onClick={closeDrawer} className={linkClass}><FiPlusCircle className="text-green-500 group-[.active]:text-white" /> New Challan</NavLink></li>
                <li><NavLink to="/all-challan" onClick={closeDrawer} className={linkClass}><FiFileText className="text-green-500 group-[.active]:text-white" /> Challan Records</NavLink></li>
              </ul>
            </div>

            {/* Vendor */}
            <div className="whitespace-nowrap">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-4 mb-3">Supplier Portal</p>
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-vendor" onClick={closeDrawer} className={linkClass}><FiTruck className="text-purple-500 group-[.active]:text-white" /> Add Vendor</NavLink></li>
                <li><NavLink to="/all-vendor" onClick={closeDrawer} className={linkClass}><FiUsers className="text-purple-500 group-[.active]:text-white" /> Vendor Database</NavLink></li>
              </ul>
            </div>
          </div>

          {/* Sidebar Footer */}
          {user && (
            <div className="mt-auto pt-4 border-t border-gray-100 whitespace-nowrap">
               <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">{user?.displayName?.charAt(0)}</div>
                    <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{user?.displayName}</span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">{role || "Operator"}</span>
                  </div>
                  <button onClick={handleLogOut} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><FiLogOut size={16} /></button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootLayout;