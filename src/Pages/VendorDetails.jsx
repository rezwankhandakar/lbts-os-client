
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import {
  Truck, Phone, MapPin, User, Plus, Loader2, ClipboardList,
  Briefcase, Camera, Edit3, Trash2, PhoneCall, ReceiptText, ArrowLeft
} from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";
import useRole from "../hooks/useRole";

const VendorDetails = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { role }    = useRole();
  const isVendorRole = role === "vendor";

  const [vendor,    setVendor]    = useState({});
  const [vehicles,  setVehicles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driverImg, setDriverImg] = useState("");
  const [formOpen,  setFormOpen]  = useState(false);

  useEffect(() => {
    Promise.all([fetchVendor(), fetchVehicles()]).finally(() => setLoading(false));
  }, [id]);

  const fetchVendor   = async () => { const res = await axiosSecure.get(`/vendors/${id}`); setVendor(res.data); };
  const fetchVehicles = async () => { const res = await axiosSecure.get(`/vendors/${id}`); setVehicles(res.data.vehicles || []); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await axiosSecure.post("/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        setDriverImg(res.data.url);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Driver Photo Uploaded", showConfirmButton: false, timer: 1500 });
      }
    } catch { Swal.fire("Error", "Image upload failed", "error"); }
    finally { setUploading(false); }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const form = e.target;
    const res = await axiosSecure.post("/vehicles", {
      vendorId: id,
      vehicleNumber: form.vehicleNumber.value,
      vehicleModel:  form.vehicleModel.value,
      driverName:    form.driverName.value,
      driverPhone:   form.driverPhone.value,
      driverImg,
    });
    if (res.data.insertedId) {
      Swal.fire({ icon: "success", title: "Vehicle Registered ✅", confirmButtonColor: "#f97316" });
      form.reset(); setDriverImg(""); setFormOpen(false); fetchVehicles();
    }
  };

  const editVehicleSwal = async (v) => {
    const { value: fv } = await Swal.fire({
      title: '<h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Update Vehicle</h3>',
      html: `<div class="space-y-3 text-left">
        <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Model</label>
        <input id="sw-model"  class="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none mt-1 focus:border-orange-400" value="${v.vehicleModel || ''}"></div>
        <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plate Number</label>
        <input id="sw-number" class="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none mt-1 focus:border-orange-400" value="${v.vehicleNumber}"></div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Name</label>
          <input id="sw-name"  class="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none mt-1 focus:border-orange-400" value="${v.driverName}"></div>
          <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Phone</label>
          <input id="sw-phone" class="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none mt-1 focus:border-orange-400" value="${v.driverPhone}"></div>
        </div>
      </div>`,
      focusConfirm: false, showCancelButton: true,
      confirmButtonText: "Save Changes", confirmButtonColor: "#f97316",
      preConfirm: () => ({
        vehicleModel:  document.getElementById("sw-model").value,
        vehicleNumber: document.getElementById("sw-number").value,
        driverName:    document.getElementById("sw-name").value,
        driverPhone:   document.getElementById("sw-phone").value,
      }),
    });
    if (fv) {
      try {
        await axiosSecure.put(`/vehicles/${id}/${v._id}`, fv);
        Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
        fetchVehicles();
      } catch { Swal.fire("Error", "Update failed", "error"); }
    }
  };

  const deleteVehicle = async (vid) => {
    const r = await Swal.fire({ title: "Delete Vehicle?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete" });
    if (r.isConfirmed) {
      try {
        await axiosSecure.delete(`/vehicles/${id}/${vid}`);
        fetchVehicles();
        Swal.fire({ icon: "success", title: "Removed!", timer: 1500, showConfirmButton: false });
      } catch { Swal.fire("Error", "Failed", "error"); }
    }
  };

  if (loading) return <LoadingSpinner text="Loading Profile..." />;

  const inp = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  return (
    <div className="flex flex-col gap-3 sm:gap-4 page-enter pb-6">

      {/* ── Back button ── */}
      <button onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      {/* ── Vendor Header ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

        {/* Vendor info */}
        <div className="sm:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-100 flex-shrink-0 bg-slate-100">
            {vendor.vendorImg
              ? <img src={vendor.vendorImg} alt={vendor.vendorName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-slate-300"><Briefcase size={28} /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Partner
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{vendor.vendorName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {vendor.vendorAddress && (
                <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs">
                  <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{vendor.vendorAddress}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs font-bold">
                <Phone size={10} className="text-slate-400" /> {vendor.vendorPhone}
              </span>
              <button onClick={() => navigate(`/vendor-trip-summary/${id}`)}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm">
                <ReceiptText size={11} /> Trip Summary
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles count */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-row sm:flex-col justify-between sm:justify-center items-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-[0.07]"><Truck size={70} /></div>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest sm:mb-1.5">Registered Vehicles</p>
          <h2 className="text-4xl font-black text-white">{vehicles.length}</h2>
        </div>
      </div>

      {/* ── Add Vehicle Form ── */}
      {!isVendorRole && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div
            className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer select-none"
            onClick={() => setFormOpen(p => !p)}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${formOpen ? 'bg-orange-500' : 'bg-slate-200'}`}>
                <Plus size={13} className={`transition-transform duration-200 ${formOpen ? "rotate-45 text-white" : "text-slate-600"}`} />
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Register New Vehicle</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {formOpen ? "▲ Close" : "▼ Open"}
            </span>
          </div>

          {formOpen && (
            <form onSubmit={handleAddVehicle} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Driver photo */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Driver Photo</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/30 cursor-pointer transition">
                      {uploading
                        ? <Loader2 size={13} className="animate-spin text-orange-500" />
                        : <Camera size={13} className="text-slate-400" />}
                      <span className="text-[10px] font-bold text-slate-600">Photo</span>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    {driverImg && <img src={driverImg} className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-400 flex-shrink-0" alt="" />}
                  </div>
                </div>

                {[
                  { name: "vehicleModel",  label: "Vehicle Model", ph: "e.g. Tata ACE" },
                  { name: "vehicleNumber", label: "Vehicle No.",   ph: "DHAKA-XXXX" },
                  { name: "driverName",    label: "Driver Name",   ph: "Full Name" },
                  { name: "driverPhone",   label: "Driver Phone",  ph: "017XXXXXXXX" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input type="text" name={f.name} placeholder={f.ph} className={inp} required />
                  </div>
                ))}
              </div>

              <button disabled={uploading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600
                  text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20
                  transition active:scale-[0.99] disabled:bg-slate-300">
                <Plus size={13} /> {uploading ? "Uploading..." : "Add Vehicle to Fleet"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Vehicle List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList size={14} className="text-slate-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Vehicle Inventory</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
            {vehicles.length} vehicles
          </span>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="sm:hidden">
          {vehicles.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-300 gap-2">
              <Truck size={32} />
              <p className="text-xs font-black uppercase tracking-widest">No Vehicles Found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vehicles.map((v, i) => (
                <div key={v._id} className="p-4 space-y-3">
                  {/* Driver row */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      {v.driverImg
                        ? <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={18} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 uppercase leading-tight">{v.driverName}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <PhoneCall size={10} className="text-slate-400 shrink-0" />
                        <span className="font-mono">{v.driverPhone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-300 font-black shrink-0">#{i + 1}</span>
                  </div>

                  {/* Vehicle badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-wide">
                      <Truck size={10} className="text-slate-400" /> {v.vehicleNumber}
                    </span>
                    {v.vehicleModel && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-slate-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wide">
                        {v.vehicleModel}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!isVendorRole && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => editVehicleSwal(v)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-blue-200 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition">
                        <Edit3 size={12} /> Edit
                      </button>
                      <button onClick={() => deleteVehicle(v._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-10">#</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Model</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vehicle No.</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hidden md:table-cell">Contact</th>
                {!isVendorRole && <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.length > 0 ? vehicles.map((v, i) => (
                <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-slate-400 text-center">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        {v.driverImg
                          ? <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={13} /></div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase truncate">{v.driverName}</p>
                        <p className="text-[9px] text-slate-400 md:hidden">{v.driverPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase">
                      {v.vehicleModel || "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">
                      <Truck size={9} className="text-slate-400" /> {v.vehicleNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-mono">
                      <PhoneCall size={9} className="text-slate-400" /> {v.driverPhone}
                    </span>
                  </td>
                  {!isVendorRole && (
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => editVehicleSwal(v)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => deleteVehicle(v._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan="6" className="py-16 text-center">
                  <div className="flex flex-col items-center text-slate-300 gap-2">
                    <Truck size={32} /><p className="text-xs font-black uppercase tracking-widest">No Vehicles Found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;