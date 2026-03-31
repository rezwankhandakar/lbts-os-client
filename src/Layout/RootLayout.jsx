import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import useRole from '../hooks/useRole';
import { useLocation } from "react-router";
import { useEffect } from "react";
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
   const location = useLocation();
  const navigate = useNavigate();
  


    useEffect(() => {
    setSearchText("");
  }, [location.pathname]);
  // Sidebar state for desktop toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logout Successful 👋");
        navigate("/login");
      })
      .catch(() => {
        toast.error("Logout failed");
      });
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("my-drawer-4");
    if (drawer) drawer.checked = false;
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-1.5 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 font-semibold "
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
      <div className={`drawer-side z-50 lg:z-40 transition-width duration-300 ${isSidebarOpen ? 'w-60' : 'w-0'}'}`}>
        <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
        
        {/* Dynamic Width Sidebar Container */}
       <div className={`flex flex-col bg-white min-h-full overflow-hidden ${isSidebarOpen ? 'w-60 p-5 border-r border-gray-100' : 'w-0 p-0 border-none'}`}>
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-4 mb-10 mt-2 whitespace-nowrap">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-200">
              <FiPackage className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none tracking-tight">LBTS <span className="text-orange-500">SYSTEM</span></span>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto no-scrollbar pb-1 flex-1">
            {/* General */}
            <div className="whitespace-nowrap">
              <ul className=" text-sm">
                <li><NavLink to="/" onClick={closeDrawer} className={linkClass}><FiHome size={18} /> Home</NavLink></li>
                {role === 'admin' && status === 'approved' && (
                  <li><NavLink to="/user-management" onClick={closeDrawer} className={linkClass}><FiUsers size={18} /> User Control</NavLink></li>
                )}
              </ul>
            </div>

            {/* Inventory */}
            <div className="whitespace-nowrap">
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-gate-pass" onClick={closeDrawer} className={linkClass}><FaPlusCircle className="text-blue-500 group-[.active]:text-white" /> Add Gate Pass</NavLink></li>
                <li><NavLink to="/all-gate-pass" onClick={closeDrawer} className={linkClass}><FaFileInvoice className="text-blue-500 group-[.active]:text-white" /> Gate Pass Inventory</NavLink></li>
              </ul>
            </div>

            {/* Billing */}
            <div className="whitespace-nowrap">
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-challan" onClick={closeDrawer} className={linkClass}><FiPlusCircle className="text-green-500 group-[.active]:text-white" /> Add Challan</NavLink></li>
                <li><NavLink to="/all-challan" onClick={closeDrawer} className={linkClass}><FiFileText className="text-green-500 group-[.active]:text-white" /> Challan Inventory</NavLink></li>
              </ul>
            </div>

            {/* Vendor */}
            <div className="whitespace-nowrap">
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/add-vendor" onClick={closeDrawer} className={linkClass}><FiTruck className="text-purple-500 group-[.active]:text-white" /> Add Vendor</NavLink></li>
                <li><NavLink to="/all-vendor" onClick={closeDrawer} className={linkClass}><FiUsers className="text-purple-500 group-[.active]:text-white" /> Vendor Database</NavLink></li>
              </ul>
            </div>

               {/* Delivery */}
            <div className="whitespace-nowrap">
              <ul className="space-y-1 text-sm">
                <li><NavLink to="/create-delivery" onClick={closeDrawer} className={linkClass}><FiTruck className="text-purple-500 group-[.active]:text-white" />Create Delivery</NavLink></li>               
                <li><NavLink to="/deliverd" onClick={closeDrawer} className={linkClass}><FiTruck className="text-purple-500 group-[.active]:text-white" />Deliverd</NavLink></li>               
                <li><NavLink to="/trip-inventory" onClick={closeDrawer} className={linkClass}><FiTruck className="text-purple-500 group-[.active]:text-white" />Trip Inventory</NavLink></li>               
                              
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


