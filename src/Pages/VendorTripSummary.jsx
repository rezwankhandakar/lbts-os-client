// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";
// import { Wallet, ReceiptText, ArrowLeft, Truck } from "lucide-react";
// import LoadingSpinner from "../Component/LoadingSpinner";
// import CarRentDetailsModal from "../Component/CarRentDetailsModal";

// const VendorTripSummary = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const axiosSecure = useAxiosSecure();

//   const [vendor, setVendor] = useState(null);
//   const [vendorLoading, setVendorLoading] = useState(true);

//   const [tripMonth, setTripMonth] = useState(new Date().getMonth() + 1);
//   const [tripYear, setTripYear] = useState(new Date().getFullYear());
//   const [trips, setTrips] = useState([]);
//   const [tripLoading, setTripLoading] = useState(false);

//   const [selectedRental, setSelectedRental] = useState(null);

//   /* ── fetch vendor ── */
//   useEffect(() => {
//     const fetchVendor = async () => {
//       try {
//         const res = await axiosSecure.get(`/vendors/${id}`);
//         setVendor(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setVendorLoading(false);
//       }
//     };
//     fetchVendor();
//   }, [id]);

//   /* ── fetch trips ── */
//   useEffect(() => {
//     if (!vendor?.vendorName) return;
//     const fetchTrips = async () => {
//       setTripLoading(true);
//       try {
//         const res = await axiosSecure.get(
//           `/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`
//         );
//         const all = res.data.data || [];
//         setTrips(
//           all.filter(t =>
//             t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase()
//           )
//         );
//       } catch (err) {
//         console.error(err);
//       }
//       setTripLoading(false);
//     };
//     fetchTrips();
//   }, [tripMonth, tripYear, vendor]);

//   /* ── modal update sync ── */
//   const handleRentalUpdate = (updatedRental) => {
//     setTrips(prev =>
//       prev.map(t => t._id === updatedRental._id ? { ...updatedRental } : t)
//     );
//     setSelectedRental(prev => prev ? { ...prev, ...updatedRental } : prev);
//   };

//   /* ── summary calculations ── */
//   const totalRent      = trips.reduce((s, t) => s + (t.rent      != null ? Number(t.rent)      : 0), 0);
//   const totalLeborBill = trips.reduce((s, t) => s + (t.leborBill != null ? Number(t.leborBill) : 0), 0);
//   const totalAdvance   = trips.reduce((s, t) => s + (t.advance   != null ? Number(t.advance)   : 0), 0);
//   const totalBill      = totalRent + totalLeborBill;
//   const totalDue       = totalBill - totalAdvance;

//   if (vendorLoading) return <LoadingSpinner text="Loading vendor..." />;
//   if (!vendor) return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* ── Page Header ── */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => navigate(-1)}
//               className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
//             >
//               <ArrowLeft size={16} />
//             </button>
//             <div>
//               <h1 className="text-xl font-black text-slate-800 tracking-tight">Trip Summary</h1>
//               <p className="text-xs text-slate-500 mt-0.5 font-medium">{vendor.vendorName}</p>
//             </div>
//           </div>

//           {/* Month/Year selector */}
//           <div className="flex items-center gap-2">
//             <select
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={tripMonth}
//               onChange={e => setTripMonth(parseInt(e.target.value))}
//             >
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i + 1}>
//                   {new Date(0, i).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="number"
//               className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400"
//               value={tripYear}
//               onChange={e => setTripYear(parseInt(e.target.value))}
//             />
//           </div>
//         </div>

//         {/* ── Summary Cards ── */}
//         {trips.length > 0 && (
//           <div className="bg-slate-800 rounded-2xl px-6 py-4">
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex flex-col px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
//                 <span className="text-[9px] text-indigo-300 uppercase font-black tracking-widest leading-none mb-1">Rent</span>
//                 <span className="text-sm font-black text-indigo-300">৳ {totalRent.toLocaleString()}</span>
//               </div>
//               <span className="text-slate-500 font-bold text-lg">+</span>
//               <div className="flex flex-col px-4 py-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
//                 <span className="text-[9px] text-sky-300 uppercase font-black tracking-widest leading-none mb-1">Lebor Bill</span>
//                 <span className="text-sm font-black text-sky-300">৳ {totalLeborBill.toLocaleString()}</span>
//               </div>
//               <span className="text-slate-500 font-bold text-lg">=</span>
//               <div className="flex flex-col px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
//                 <span className="text-[9px] text-emerald-300 uppercase font-black tracking-widest leading-none mb-1">Total Bill</span>
//                 <span className="text-sm font-black text-emerald-300">৳ {totalBill.toLocaleString()}</span>
//               </div>

//               <div className="ml-auto flex items-center gap-3">
//                 <div className="flex flex-col px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
//                   <span className="text-[9px] text-orange-300 uppercase font-black tracking-widest leading-none mb-1 flex items-center gap-1">
//                     <Wallet size={9} /> Advance
//                   </span>
//                   <span className="text-sm font-black text-orange-300">৳ {totalAdvance.toLocaleString()}</span>
//                 </div>
//                 <span className="text-slate-500 font-bold text-lg">→</span>
//                 <div className="flex flex-col px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
//                   <span className="text-[9px] text-rose-300 uppercase font-black tracking-widest leading-none mb-1">Due</span>
//                   <span className="text-sm font-black text-rose-300">৳ {totalDue.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Trip Table ── */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <ReceiptText size={16} className="text-slate-600" />
//               <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Trips</span>
//               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
//                 {trips.length}
//               </span>
//             </div>
//             <span className="text-xs text-slate-400">
//               {new Date(0, tripMonth - 1).toLocaleString("default", { month: "long" })} {tripYear}
//             </span>
//           </div>

//           {tripLoading ? (
//             <div className="py-16 text-center text-slate-400 italic text-sm">Loading trips…</div>
//           ) : trips.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="flex flex-col items-center gap-2 opacity-30">
//                 <Truck size={40} />
//                 <p className="text-sm font-black uppercase tracking-widest italic">No trips found</p>
//               </div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse text-sm">
//                 <thead>
//                   <tr className="bg-gray-800 text-white text-left">
//                     {["#", "Date", "Trip", "Driver", "Vehicle", "Point", "Rent", "Lebor Bill", "Advance", "Total", "View"].map(h => (
//                       <th key={h} className="px-4 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {trips.map((t, idx) => {
//                     const tripTotal =
//                       (t.rent      != null ? Number(t.rent)      : 0) +
//                       (t.leborBill != null ? Number(t.leborBill) : 0);
//                     return (
//                       <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
//                         <td className="px-4 py-2.5 text-[11px] font-bold text-slate-400 text-center">{idx + 1}</td>
//                         <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
//                           {new Date(t.createdAt).toLocaleDateString("en-GB")}
//                         </td>
//                         <td className="px-4 py-2.5">
//                           <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">
//                             {t.tripNumber}
//                           </span>
//                         </td>
//                         <td className="px-4 py-2.5 text-sm text-slate-700">{t.driverName}</td>
//                         <td className="px-4 py-2.5 text-xs text-slate-600 uppercase">{t.vehicleNumber}</td>
//                         <td className="px-4 py-2.5 font-semibold text-slate-700 text-center">
//                           {t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}
//                         </td>
//                         <td className="px-4 py-2.5 text-center font-semibold">
//                           {t.rent != null
//                             ? <span className="text-green-700">৳ {Number(t.rent).toLocaleString()}</span>
//                             : <span className="text-[10px] text-red-400 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Missing</span>}
//                         </td>
//                         <td className="px-4 py-2.5 text-center font-semibold">
//                           {t.leborBill != null
//                             ? <span className="text-green-700">৳ {Number(t.leborBill).toLocaleString()}</span>
//                             : <span className="text-[10px] text-orange-400 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">Missing</span>}
//                         </td>
//                         <td className="px-4 py-2.5 text-center font-semibold">
//                           {t.advance != null
//                             ? <span className="text-orange-600">৳ {Number(t.advance).toLocaleString()}</span>
//                             : <span className="text-slate-300">—</span>}
//                         </td>
//                         <td className="px-4 py-2.5 text-center font-bold">
//                           {t.rent != null || t.leborBill != null
//                             ? <span className="text-indigo-700">৳ {tripTotal.toLocaleString()}</span>
//                             : <span className="text-slate-300">—</span>}
//                         </td>
//                         <td className="px-4 py-2.5 text-center">
//                           <button
//                             onClick={() => setSelectedRental(t)}
//                             className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
//                           >
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>

//                 {/* Footer total row */}
//                 <tfoot>
//                   <tr className="bg-slate-50 border-t-2 border-slate-200 font-black text-sm">
//                     <td colSpan={6} className="px-4 py-3 text-xs text-slate-500 uppercase tracking-widest">Total</td>
//                     <td className="px-4 py-3 text-center text-indigo-700">৳ {totalRent.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-center text-indigo-700">৳ {totalLeborBill.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-center text-orange-600">৳ {totalAdvance.toLocaleString()}</td>
//                     <td className="px-4 py-3 text-center text-emerald-700">৳ {totalBill.toLocaleString()}</td>
//                     <td />
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       <CarRentDetailsModal
//         selectedRental={selectedRental}
//         setSelectedRental={setSelectedRental}
//         onRentalUpdate={handleRentalUpdate}
//       />
//     </div>
//   );
// };

// export default VendorTripSummary;







import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Wallet, ReceiptText, ArrowLeft, Truck, Briefcase } from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";
import CarRentDetailsModal from "../Component/CarRentDetailsModal";

const VendorTripSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [vendor, setVendor] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  const [tripMonth, setTripMonth] = useState(new Date().getMonth() + 1);
  const [tripYear, setTripYear] = useState(new Date().getFullYear());
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);

  const [selectedRental, setSelectedRental] = useState(null);

  /* ── fetch vendor ── */
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axiosSecure.get(`/vendors/${id}`);
        setVendor(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setVendorLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  /* ── fetch trips ── */
  useEffect(() => {
    if (!vendor?.vendorName) return;
    const fetchTrips = async () => {
      setTripLoading(true);
      try {
        const res = await axiosSecure.get(
          `/car-rents?month=${tripMonth}&year=${tripYear}&page=1&limit=5000`
        );
        const all = res.data.data || [];
        setTrips(
          all.filter(t => t.vendorName?.toLowerCase() === vendor.vendorName?.toLowerCase())
        );
      } catch (err) {
        console.error(err);
      }
      setTripLoading(false);
    };
    fetchTrips();
  }, [tripMonth, tripYear, vendor]);

  /* ── modal update sync ── */
  const handleRentalUpdate = (updatedRental) => {
    setTrips(prev => prev.map(t => t._id === updatedRental._id ? { ...updatedRental } : t));
    setSelectedRental(prev => prev ? { ...prev, ...updatedRental } : prev);
  };

  /* ── summary calculations ── */
  const totalRent      = trips.reduce((s, t) => s + (t.rent      != null ? Number(t.rent)      : 0), 0);
  const totalLeborBill = trips.reduce((s, t) => s + (t.leborBill != null ? Number(t.leborBill) : 0), 0);
  const totalAdvance   = trips.reduce((s, t) => s + (t.advance   != null ? Number(t.advance)   : 0), 0);
  const totalBill      = totalRent + totalLeborBill;
  const totalDue       = totalBill - totalAdvance;

  if (vendorLoading) return <LoadingSpinner text="Loading vendor..." />;
  if (!vendor) return <div className="p-10 text-center text-slate-400">Vendor not found.</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>

            {/* Vendor mini card */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                {vendor.vendorImg
                  ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                  : <Briefcase size={16} className="text-white" />
                }
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none">{vendor.vendorName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Trip Summary</p>
              </div>
            </div>
          </div>

          {/* Month/Year + trip count */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 rounded px-2 py-1 shadow-sm">
              {trips.length} trips
            </span>
            <select
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-sm"
              value={tripMonth}
              onChange={e => setTripMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="border border-gray-300 px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 w-20 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-sm"
              value={tripYear}
              onChange={e => setTripYear(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* ── Summary Cards ── */}
        {trips.length > 0 && (
          <div className="bg-slate-800 rounded-2xl px-6 py-5 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <span className="text-[9px] text-indigo-300 uppercase font-black tracking-widest leading-none mb-1">Rent</span>
                <span className="text-sm font-black text-indigo-300">৳ {totalRent.toLocaleString()}</span>
              </div>
              <span className="text-slate-500 font-bold text-lg">+</span>
              <div className="flex flex-col px-4 py-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                <span className="text-[9px] text-sky-300 uppercase font-black tracking-widest leading-none mb-1">Lebor Bill</span>
                <span className="text-sm font-black text-sky-300">৳ {totalLeborBill.toLocaleString()}</span>
              </div>
              <span className="text-slate-500 font-bold text-lg">=</span>
              <div className="flex flex-col px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[9px] text-emerald-300 uppercase font-black tracking-widest leading-none mb-1">Total Bill</span>
                <span className="text-sm font-black text-emerald-300">৳ {totalBill.toLocaleString()}</span>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="flex flex-col px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <span className="text-[9px] text-orange-300 uppercase font-black tracking-widest leading-none mb-1 flex items-center gap-1">
                    <Wallet size={9} /> Advance
                  </span>
                  <span className="text-sm font-black text-orange-300">৳ {totalAdvance.toLocaleString()}</span>
                </div>
                <span className="text-slate-500 font-bold text-lg">→</span>
                <div className="flex flex-col px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-[9px] text-rose-300 uppercase font-black tracking-widest leading-none mb-1">Due</span>
                  <span className="text-sm font-black text-rose-300">৳ {totalDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Trip Table ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText size={16} className="text-slate-600" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Trips</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {new Date(0, tripMonth - 1).toLocaleString("default", { month: "long" })} {tripYear}
            </span>
          </div>

          {tripLoading ? (
            <div className="py-16 text-center text-slate-400 italic text-sm">Loading trips…</div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2 opacity-30">
                <Truck size={40} />
                <p className="text-sm font-black uppercase tracking-widest italic">No trips found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white text-left">
                    {["#", "Date", "Trip", "Driver", "Vehicle", "Point", "Rent", "Lebor Bill", "Advance", "Total", "View"].map(h => (
                      <th key={h} className="px-4 py-2.5 font-normal text-xs uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t, idx) => {
                    const tripTotal =
                      (t.rent      != null ? Number(t.rent)      : 0) +
                      (t.leborBill != null ? Number(t.leborBill) : 0);
                    return (
                      <tr key={t._id} className="border-b border-gray-100 hover:bg-amber-50 even:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] font-bold text-slate-400 text-center">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{t.tripNumber}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-700">{t.driverName}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 uppercase">{t.vehicleNumber}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700 text-center">
                          {t.challans ? t.challans.filter(c => !c.isReturn).length : t.totalChallan}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.rent != null
                            ? <span className="text-green-700">৳ {Number(t.rent).toLocaleString()}</span>
                            : <span className="text-[10px] text-red-400 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">Missing</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.leborBill != null
                            ? <span className="text-green-700">৳ {Number(t.leborBill).toLocaleString()}</span>
                            : <span className="text-[10px] text-orange-400 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">Missing</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {t.advance != null
                            ? <span className="text-orange-600">৳ {Number(t.advance).toLocaleString()}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold">
                          {t.rent != null || t.leborBill != null
                            ? <span className="text-indigo-700">৳ {tripTotal.toLocaleString()}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setSelectedRental(t)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer total row */}
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-black text-sm">
                    <td colSpan={6} className="px-4 py-3 text-xs text-slate-500 uppercase tracking-widest">Total</td>
                    <td className="px-4 py-3 text-center text-indigo-700">৳ {totalRent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-indigo-700">৳ {totalLeborBill.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-orange-600">৳ {totalAdvance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-emerald-700">৳ {totalBill.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <CarRentDetailsModal
        selectedRental={selectedRental}
        setSelectedRental={setSelectedRental}
        onRentalUpdate={handleRentalUpdate}
        readOnly={true}
      />
    </div>
  );
};

export default VendorTripSummary;