import React from 'react';
import { Link, Outlet } from 'react-router';

const RootLayout = () => {
    return (
        <div className="drawer lg:drawer-open">
  <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Navbar */}
<nav className="navbar w-full bg-orange-400 shadow-md text-white px-4 py-2 flex items-center justify-between">
  {/* Sidebar toggle icon */}
  <label
    htmlFor="my-drawer-4"
    aria-label="open sidebar"
    className="btn btn-square btn-ghost mr-4"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
      <path d="M9 4v16"></path>
      <path d="M14 10l2 2l-2 2"></path>
    </svg>
  </label>

  {/* Main navbar content */}
  <div className="w-full flex items-center justify-between">
    {/* Left: Search */}
    <div className="flex-1 text-black max-w-sm">
      <input
        type="text"
        placeholder="Search..."
        className="input input-bordered w-full"
      />
    </div>

    {/* Right: Profile */}
    <div className="flex-1 flex justify-end items-center gap-4 m">
        <Link to="/register" className="font-semibold">
        Register
      </Link>
        <Link to="/register" className="font-semibold">
        Login
      </Link>
        <Link to="/register" className="font-semibold">
        Logout
      </Link>
        <Link to="/register" className="font-semibold">
        User-name
      </Link>
        <Link to="/register" className="font-semibold">
        profile
      </Link>
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