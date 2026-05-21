import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import LoadingSpinner from "../Component/LoadingSpinner";
import TripDetailsModal from "../Component/TripDetailsModal";
import { ArrowLeft } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   TripDetails — full-page wrapper around TripDetailsModal
   ───────────────────────────────────────────────────────────────
   The page reads `:id` (trip _id) from the URL and renders the
   same component the modal uses, but with displayMode="page" so it
   fills the layout instead of overlaying.

   Two fast paths:
     1. Navigated from TripInventory  → trip object is passed in
        `location.state.trip`, so render immediately, no fetch.
     2. Direct URL hit (bookmark / share / reload) → fetch the
        current month's deliveries and pick the matching trip out.
        We use the existing /deliveries endpoint instead of adding a
        new GET-by-id route on the server — the data shape matches
        exactly what the modal expects.

   `onTripUpdate` flows back into local state so edits made inside
   stay reflected without a refetch.
══════════════════════════════════════════════════════════════ */
const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();

  // Trip passed in via router state (from TripInventoryPage) skips the
  // fetch entirely — opens instantly.  Falls back to fetch on direct URL.
  const initialTrip = location.state?.trip && location.state.trip._id === id
    ? location.state.trip
    : null;

  const [trip, setTrip] = useState(initialTrip);
  const [loading, setLoading] = useState(!initialTrip);
  const [error, setError] = useState(null);

  // ── Fetch fallback for direct URL access ──
  // The list endpoint is month-scoped; try the current month first, and
  // if not found, walk back month-by-month for up to 6 months.  Trips
  // older than 6 months are uncommon to deep-link to; if needed the
  // user can navigate via the inventory page instead.
  useEffect(() => {
    if (initialTrip) return;
    if (!id) { setError("Missing trip id"); setLoading(false); return; }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const now = new Date();
        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = d.getMonth() + 1;
          const year  = d.getFullYear();
          const res = await axiosSecure.get(`/deliveries?month=${month}&year=${year}`);
          if (cancelled) return;
          const list = res.data?.data || [];
          const found = list.find(t => t._id === id || t._id?.toString() === id);
          if (found) {
            setTrip(found);
            setLoading(false);
            return;
          }
        }
        if (!cancelled) {
          setError("Trip not found in the last 6 months");
          setLoading(false);
        }
      } catch (err) {
        console.error("fetch trip failed", err);
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load trip");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id, initialTrip, axiosSecure]);

  // ── Local state syncs from edits inside the inner component ──
  const handleTripUpdate = useCallback((updated) => {
    setTrip((prev) => prev ? { ...prev, ...updated } : prev);
  }, []);

  // ── Back navigation ──
  // Pass `navigate(-1)` so the user lands wherever they came from (usually
  // TripInventory, but could be deep-linked from elsewhere).  We bind this
  // to `setSelectedTrip` so the inner component's existing close handlers
  // (X button, footer Close, Backdrop) all map to "go back".
  const goBack = useCallback(() => {
    // If there's history (came from another page), use it; otherwise fall
    // back to the inventory list so users who land here via a shared URL
    // don't get stuck on a blank previous page.
    if (window.history.length > 1) navigate(-1);
    else navigate("/trip-inventory");
  }, [navigate]);

  // ── States ──
  if (loading) {
    return <LoadingSpinner variant="auto" />;
  }

  if (error || !trip) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <p className="font-bold text-slate-700 mb-1">Trip not available</p>
        <p className="text-sm text-slate-500 mb-4 text-center max-w-md">{error || "We couldn't find this trip."}</p>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  return (
    <TripDetailsModal
      selectedTrip={trip}
      setSelectedTrip={goBack}
      onTripUpdate={handleTripUpdate}
      displayMode="page"
    />
  );
};

export default TripDetails;