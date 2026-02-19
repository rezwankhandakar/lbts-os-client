import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const RootLayout = () => {
  const { user, logOut } = useAuth()
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
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Navbar */}


        <nav className="navbar w-full bg-orange-400 shadow-md text-white px-4 py-2">

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
                className="input input-bordered w-full text-black"
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 md:gap-6 ml-auto">
              {/* Register */}
              {!user && (
                <Link className="hidden sm:block font-medium hover:underline" to="/register">
                  Register
                </Link>
              )}

              {/* Login */}
              {!user && (
                <Link className="hidden sm:block font-medium hover:underline" to="/login">
                  Login
                </Link>
              )}

              {/* Username */}
              {user && (
                <h2
                  className="hidden md:flex text-2xl font-bold 
                  bg-gradient-to-r from-blue-800 to-purple-700
                  bg-clip-text text-transparent"
                >
                  {user?.displayName || "User"}
                </h2>
              )}

              {/* Profile dropdown */}
              {user && (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button">
                    <img
                      src={user?.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
                    />
                  </div>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box w-40 p-2 shadow text-black"
                  >
          
                    <li>
                     <button
  onClick={handleLogOut}
  className="w-full px-3 py-2 rounded-lg border border-red-500 text-red-500
  hover:bg-red-500 hover:text-white transition"
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
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          {/* Sidebar content here */}
          <ul className="menu w-full grow">
            {/* List item */}
            <li>
              <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                {/* Home icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <span className="is-drawer-close:hidden">Home</span>
              </button>
            </li>
            {/* List item */}
            <li>
              <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
                {/* Settings icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                <span className="is-drawer-close:hidden">Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;