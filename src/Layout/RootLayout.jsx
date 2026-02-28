import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiUsers } from 'react-icons/fi';
import useRole from '../hooks/useRole';

import { useSearch } from '../hooks/SearchContext';
import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa';

const RootLayout = () => {
  const { user, logOut } = useAuth()
  const { role, status, } = useRole()
  const { searchText, setSearchText } = useSearch();
  console.log(user)
  const navigate = useNavigate();

  const handleLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logout Successful 👋");
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Logout failed");
      });
  };

  //handle closeDrawer//
  const closeDrawer = () => {
    const drawer = document.getElementById("my-drawer-4");
    if (drawer) drawer.checked = false;
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Navbar */}


        <nav className="navbar sticky top-0 z-50 w-full bg-orange-400/95 backdrop-blur shadow-md text-white px-4 py-2">

          {/* Sidebar Toggle */}
          <label
            htmlFor="my-drawer-4"
            aria-label="open sidebar"
            className="btn btn-square btn-ghost mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
              <path d="M9 4v16" />
              <path d="M14 10l2 2l-2 2" />
            </svg>
          </label>

          <div className="flex w-full items-center justify-between gap-4">

            {/* 🔍 Search Bar */}
            {/* Mobile + Desktop both visible */}
            <div className="flex-1 max-w-xs sm:max-w-sm">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered w-full text-black"
              />
            </div>


            <div className="flex items-center gap-2 md:gap-4 ml-auto">

              {/* ================= Desktop Auth Links ================= */}
              {!user && (
                <div className="hidden sm:flex items-center gap-2">
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `px-3 md:px-4 py-1.5 rounded-lg font-semibold transition ${isActive
                        ? "bg-white text-orange-500"
                        : "text-white hover:bg-white/20"
                      }`
                    }
                  >
                    Register
                  </NavLink>

                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-3 md:px-4 py-1.5 rounded-lg font-semibold transition ${isActive
                        ? "bg-white text-orange-500"
                        : "text-white hover:bg-white/20"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                </div>
              )}

              {/* ================= Username (Desktop only) ================= */}
              {user && (
                <h2
                  className="hidden sm:block md:text-xl lg:text-2xl font-bold 
      bg-gradient-to-r from-blue-800 to-purple-700
      bg-clip-text text-transparent"
                >
                  {user?.displayName || "User"}
                </h2>
              )}

              {/* ================= Avatar Dropdown ================= */}
              {(user || !user) && (
                <div className="dropdown dropdown-end sm:hidden">
                  <div tabIndex={0} role="button">
                    <img
                      src={
                        user?.photoURL ||
                        "https://i.ibb.co/4pDNDk1/avatar.png"
                      }
                      className="w-9 h-9 rounded-full object-cover border-2 border-white cursor-pointer"
                    />
                  </div>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box w-44 p-2 shadow text-black"
                  >
                    {!user && (
                      <>
                        <li>
                          <NavLink to="/register">Register</NavLink>
                        </li>
                        <li>
                          <NavLink to="/login">Login</NavLink>
                        </li>
                      </>
                    )}

                    {user && (
                      <>
                        <li>
                          <NavLink to="/profile">Profile</NavLink>
                        </li>

                        <li>
                          <button
                            onClick={handleLogOut}
                            className="text-red-500"
                          >
                            Logout
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {/* ================= Desktop Avatar (User only) ================= */}
              {user && (
                <div className="hidden sm:block dropdown dropdown-end">
                  <div tabIndex={0} role="button">
                    <img
                      src={user?.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
                    />
                  </div>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box w-44 p-2 shadow text-black"
                  >
                    <li>
                      <NavLink to="/profile">Profile</NavLink>
                    </li>

                    <li>
                      <button
                        onClick={handleLogOut}
                        className="text-red-500"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>



          </div>
        </nav>



        {/* Page content here */}
        <div className="p-4"><Outlet></Outlet></div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        {/* <div className="drawer-side z-40"> */}
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        {/* <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64"> */}
        <div className="flex min-h-full flex-col items-start bg-base-200 
w-64 pt-16 lg:pt-0 
lg:is-drawer-open:w-64 lg:is-drawer-close:w-14">
          {/* Sidebar content here */}
          <ul className="menu w-full grow">
            {/* <ul className="menu w-full grow overflow-y-auto"> */}
            {/* List item */}
            <li>
              <NavLink to='/' onClick={closeDrawer}  className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    } data-tip="Homepage">
                {/* Home icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <span className="is-drawer-close:hidden">Home</span>
              </NavLink>
            </li>
            
            {/* List item */}
            {role === 'admin' && status === 'approved' && (
              <li>
                <NavLink
                  to="/user-management" onClick={closeDrawer}
                  className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    }
                  data-tip="User Management"
                >
                  {/* Icon */}
                  <FiUsers className="w-5 h-5" />
                  <span className="is-drawer-close:hidden">User Management</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/add-gate-pass"
                onClick={closeDrawer}
              className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    }
                data-tip="Add Gate Pass"
              >
                <FaPlusCircle className="w-5 h-5" />
                <span className="is-drawer-close:hidden">Add Gate Pass</span>
              </NavLink>

              <NavLink
                to="/all-gate-pass" onClick={closeDrawer}
               className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    }
                data-tip="Gate Pass"
              >
                {/* Icon */}
                <FaFileInvoice className="w-5 h-5" />
                <span className="is-drawer-close:hidden">Gate Pass</span>
              </NavLink>

              <NavLink
                to="/add-challan" onClick={closeDrawer}
               className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    }
                data-tip="Add Challan"
              >
                {/* Icon */}
                <FaFileInvoice className="w-5 h-5" />
                <span className="is-drawer-close:hidden">Add Challan</span>
              </NavLink>


              <NavLink
                to="/all-challan" onClick={closeDrawer}
               className={({ isActive }) =>
      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-2 px-2 py-2 rounded transition ${
        isActive
          ? "bg-orange-400 text-white font-semibold"
          : "hover:bg-green-300"
      }`
    }
                data-tip="All Challan"
              >
                {/* Icon */}
                <FaFileInvoice className="w-5 h-5" />
                <span className="is-drawer-close:hidden">All Challan</span>
              </NavLink>
            </li>


          </ul>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;