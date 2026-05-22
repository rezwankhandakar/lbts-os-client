import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import LoadingSpinner from "../Component/LoadingSpinner";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";
import { ArrowLeft } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   CarRentDetails — full-page wrapper around CarRentDetailsModal
   ───────────────────────────────────────────────────────────────
   Two fast paths (same pattern as TripDetails):
     1. Navigated from BillPage / VendorTripSummary → rental passed
        via location.state.rental → renders instantly, no fetch.
     2. Direct URL hit (bookmark / share / reload) → walks back up to
        6 months of /car-rents data to find the matching rental.

   `readOnly` can also be passed via state for vendor-summary use
   (where edits are disabled).
══════════════════════════════════════════════════════════════ */
const CarRentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();

  // Read-only flag flows from router state (set by VendorTripSummary
  // when navigating to vendor-visible rental view).  Defaults to false.
  const readOnly = !!location.state?.readOnly;

  // Optional onSaved callback hint from caller — when present, signals
  // that the caller wants to react to a save (e.g. flip a filter).  We
  // don't actually invoke it across navigation; we keep the logic
  // simple — the user will see updated data when they navigate back
  // (window-focus refetch on the source page handles it).
  const initialRental = location.state?.rental && location.state.rental._id === id
    ? location.state.rental
    : null;

  const [rental, setRental] = useState(initialRental);
  const [loading, setLoading] = useState(!initialRental);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialRental) return;
    if (!id) { setError("Missing rental id"); setLoading(false); return; }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const now = new Date();
        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = d.getMonth() + 1;
          const year  = d.getFullYear();
          const res = await axiosSecure.get(`/car-rents?month=${month}&year=${year}`);
          if (cancelled) return;
          const list = res.data?.data || [];
          const found = list.find(r => r._id === id || r._id?.toString() === id);
          if (found) {
            setRental(found);
            setLoading(false);
            return;
          }
        }
        if (!cancelled) {
          setError("Rental not found in the last 6 months");
          setLoading(false);
        }
      } catch (err) {
        console.error("fetch rental failed", err);
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load rental");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id, initialRental, axiosSecure]);

  // Local syncs from edits inside the inner component
  const handleRentalUpdate = useCallback((updated) => {
    setRental((prev) => prev ? { ...prev, ...updated } : prev);
  }, []);

  // Back navigation — `setSelectedRental(null)` from inside the inner
  // component maps here.  Goes to history if available, otherwise falls
  // back to /car-rent list so users who deep-link don't get stuck.
  const goBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/car-rent");
  }, [navigate]);

  // After-save navigation — explicitly land on /car-rent with the
  // Missing filter pre-applied so the user immediately sees the next
  // rental that still needs amounts entered.  We use `replace: true`
  // to avoid stacking the details page in history (back from the
  // list would otherwise return to a stale just-saved details page).
  const onSaveSuccess = useCallback(() => {
    navigate("/car-rent?filter=missing", { replace: true });
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner variant="auto" />;
  }

  if (error || !rental) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <p className="font-bold text-slate-700 mb-1">Rental not available</p>
        <p className="text-sm text-slate-500 mb-4 text-center max-w-md">{error || "We couldn't find this rental."}</p>
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
    <CarRentDetailsModal
      selectedRental={rental}
      setSelectedRental={goBack}
      onRentalUpdate={handleRentalUpdate}
      onSaveSuccess={onSaveSuccess}
      readOnly={readOnly}
      displayMode="page"
    />
  );
};

export default CarRentDetails;