
import { Link } from "react-router";

const Forbidden = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      {/* Icon */}
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>

      {/* Code */}
      <p className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-2">Access Denied</p>
      <h1 className="text-6xl font-black text-white mb-3">403</h1>
      <p className="text-slate-400 text-sm leading-relaxed mb-8">
        You don't have permission to view this page.
        Contact your administrator to request access.
      </p>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600
            text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700
            text-slate-300 text-sm font-bold rounded-xl transition-colors border border-slate-700"
        >
          ← Go Back
        </button>
      </div>
    </div>
  </div>
);

export default Forbidden;
