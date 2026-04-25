
const PageLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-6">
      {/* Icon */}
      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>

      {/* Brand */}
      <div className="text-center">
        <p className="text-2xl font-black text-white tracking-tight">
          LBTS <span className="text-orange-500">OS</span>
        </p>
        <p className="text-xs text-slate-500 font-medium mt-1 tracking-wider uppercase">
          Logistics Operations System
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full load-bar" />
      </div>
    </div>
  </div>
);

export default PageLoader;
