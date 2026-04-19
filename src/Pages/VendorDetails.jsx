

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
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { role } = useRole();
  const isVendorRole = role === "vendor";

  const [vendor, setVendor] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driverImg, setDriverImg] = useState("");
  const [formOpen, setFormOpen] = useState(false); // mobile form toggle

  useEffect(() => {
    Promise.all([fetchVendor(), fetchVehicles()]).finally(() => setLoading(false));
  }, [id]);

  const fetchVendor = async () => {
    const res = await axiosSecure.get(`/vendors/${id}`);
    setVendor(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axiosSecure.get(`/vendors/${id}`);
    setVehicles(res.data.vehicles || []);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
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
      vehicleModel: form.vehicleModel.value,
      driverName: form.driverName.value,
      driverPhone: form.driverPhone.value,
      driverImg,
    });
    if (res.data.insertedId) {
      Swal.fire({ icon: "success", title: "Vehicle Registered", confirmButtonColor: "#0f172a" });
      form.reset();
      setDriverImg("");
      setFormOpen(false);
      fetchVehicles();
    }
  };

  if (loading) return <LoadingSpinner text="Loading Profile..." />;

  return (
    <div className="flex flex-col h-full gap-3 sm:gap-4">

      {/* ── Vendor Header Card ── */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-4 gap-3">

        {/* Vendor info */}
        <div className="sm:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-slate-100 shrink-0">
            {vendor.vendorImg
              ? <img src={vendor.vendorImg} alt={vendor.vendorName} className="w-full h-full object-cover" />
              : <Briefcase size={24} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Verified Partner
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">{vendor.vendorName}</h1>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {vendor.vendorAddress && (
                <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] sm:text-xs">
                  <MapPin size={10} className="text-slate-400 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{vendor.vendorAddress}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] sm:text-xs font-bold">
                <Phone size={10} className="text-slate-400 shrink-0" /> {vendor.vendorPhone}
              </span>
              <button
                onClick={() => navigate(`/vendor-trip-summary/${id}`)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition shadow-sm"
              >
                <ReceiptText size={10} /> Trip Summary
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles count */}
        <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-row sm:flex-col justify-between sm:justify-center items-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10"><Truck size={60} /></div>
          <p className="text-slate-400 text-[10px] italic font-medium sm:mb-1">Registered Vehicles</p>
          <h2 className="text-3xl sm:text-4xl font-black">{vehicles.length}</h2>
        </div>
      </div>

      {/* ── Add Vehicle Form (non-vendor) ── */}
      {!isVendorRole && (
        <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Form header — clickable on ALL devices */}
          <div
            className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer select-none"
            onClick={() => setFormOpen(prev => !prev)}
          >
            <div className="flex items-center gap-2">
              <Plus size={14} className={`transition-transform duration-200 ${formOpen ? "rotate-45" : ""} text-slate-700`} />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Register New Vehicle</h3>
            </div>
            {/* Toggle indicator — all devices */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {formOpen ? "▲ Close" : "▼ Open"}
            </span>
          </div>

          {/* Form body — togglable on ALL devices */}
          <div className={`${formOpen ? "block" : "hidden"}`}>
            <form onSubmit={handleAddVehicle} className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                {/* Driver photo */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Driver Photo</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition min-h-[38px]">
                      {uploading
                        ? <Loader2 className="animate-spin text-slate-400" size={13} />
                        : <Camera size={13} className="text-slate-400" />}
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Photo</span>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    {driverImg && <img src={driverImg} className="w-9 h-9 rounded-lg object-cover border border-emerald-500 shrink-0" alt="" />}
                  </div>
                </div>

                {/* Other fields */}
                {[
                  { name: "vehicleModel",  label: "Vehicle Model", ph: "e.g. Tata ACE" },
                  { name: "vehicleNumber", label: "Vehicle No.",   ph: "DHAKA-X" },
                  { name: "driverName",    label: "Driver Name",   ph: "Full Name" },
                  { name: "driverPhone",   label: "Driver Phone",  ph: "017XXXXXXXX" },
                ].map(f => (
                  <div key={f.name} className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                    <input
                      type="text" name={f.name} placeholder={f.ph}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                disabled={uploading}
                className="mt-3 w-full bg-slate-900 text-white py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-black transition shadow active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                <Plus size={13} /> {uploading ? "Uploading..." : "Add Vehicle to Fleet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Vehicle List ── */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

        {/* Section header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-slate-700" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Vehicle Inventory</h3>
          </div>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{vehicles.length} vehicles</span>
        </div>

        {/* ── Mobile card list (< sm) ── */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-slate-100">
          {vehicles.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center opacity-20 gap-2">
              <Truck size={36} />
              <p className="text-xs font-black uppercase tracking-widest italic">No Vehicles Found</p>
            </div>
          ) : vehicles.map((v, index) => (
            <div key={v._id} className="p-3 space-y-2">
              {/* Driver row */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                  {v.driverImg
                    ? <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={16} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{v.driverName}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                    <PhoneCall size={9} className="text-slate-400" /> {v.driverPhone}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400">#{index + 1}</span>
              </div>

              {/* Vehicle info pills */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase">
                  <Truck size={9} className="text-slate-400" /> {v.vehicleNumber}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase">
                  {v.vehicleModel || "Standard"}
                </span>
              </div>

              {/* Actions */}
              {!isVendorRole && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={async () => {
                      const { value: fv } = await Swal.fire({
                        title: '<h2 class="text-base font-black text-slate-800 uppercase">Update Vehicle</h2>',
                        html: `<div class="space-y-3 text-left">
                          <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Model</label>
                          <input id="sw-model" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.vehicleModel || ''}"></div>
                          <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plate Number</label>
                          <input id="sw-number" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.vehicleNumber}"></div>
                          <div class="grid grid-cols-2 gap-2">
                            <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Name</label>
                            <input id="sw-name" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.driverName}"></div>
                            <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Phone</label>
                            <input id="sw-phone" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.driverPhone}"></div>
                          </div>
                        </div>`,
                        focusConfirm: false, showCancelButton: true,
                        confirmButtonText: "Save", confirmButtonColor: "#0f172a",
                        preConfirm: () => ({
                          vehicleModel: document.getElementById("sw-model").value,
                          vehicleNumber: document.getElementById("sw-number").value,
                          driverName: document.getElementById("sw-name").value,
                          driverPhone: document.getElementById("sw-phone").value,
                        }),
                      });
                      if (fv) {
                        try {
                          await axiosSecure.put(`/vehicles/${id}/${v._id}`, fv);
                          Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
                          fetchVehicles();
                        } catch { Swal.fire("Error", "Update failed", "error"); }
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={async () => {
                      const r = await Swal.fire({ title: "Delete?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48", confirmButtonText: "Delete" });
                      if (r.isConfirmed) {
                        try {
                          await axiosSecure.delete(`/vehicles/${id}/${v._id}`);
                          fetchVehicles();
                          Swal.fire({ icon: "success", title: "Removed", timer: 1500, showConfirmButton: false });
                        } catch { Swal.fire("Error", "Failed", "error"); }
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Desktop table (>= sm) ── */}
        <div className="hidden sm:flex flex-1 min-h-0 overflow-auto flex-col">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center w-10">SL</th>
                <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Driver</th>
                <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Model</th>
                <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Vehicle No.</th>
                <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center hidden md:table-cell">Contact</th>
                {!isVendorRole && (
                  <th className="px-3 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.length > 0 ? vehicles.map((v, index) => (
                <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0">
                        {v.driverImg
                          ? <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={14} /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{v.driverName}</p>
                        {/* Phone shown inline on sm when Contact column hidden */}
                        <p className="text-[9px] text-slate-400 font-bold md:hidden">{v.driverPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase">
                      {v.vehicleModel || "Standard"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase">
                      <Truck size={10} className="text-slate-400" /> {v.vehicleNumber}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black">
                      <PhoneCall size={10} className="text-slate-400" /> {v.driverPhone}
                    </span>
                  </td>
                  {!isVendorRole && (
                    <td className="px-3 py-2.5">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={async () => {
                            const { value: fv } = await Swal.fire({
                              title: '<h2 class="text-base font-black text-slate-800 uppercase">Update Vehicle</h2>',
                              html: `<div class="space-y-3 text-left">
                                <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Model</label>
                                <input id="sw-model" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.vehicleModel || ''}"></div>
                                <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plate Number</label>
                                <input id="sw-number" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.vehicleNumber}"></div>
                                <div class="grid grid-cols-2 gap-2">
                                  <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Name</label>
                                  <input id="sw-name" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.driverName}"></div>
                                  <div><label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver Phone</label>
                                  <input id="sw-phone" class="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none mt-1" value="${v.driverPhone}"></div>
                                </div>
                              </div>`,
                              focusConfirm: false, showCancelButton: true,
                              confirmButtonText: "Save", confirmButtonColor: "#0f172a",
                              preConfirm: () => ({
                                vehicleModel: document.getElementById("sw-model").value,
                                vehicleNumber: document.getElementById("sw-number").value,
                                driverName: document.getElementById("sw-name").value,
                                driverPhone: document.getElementById("sw-phone").value,
                              }),
                            });
                            if (fv) {
                              try {
                                await axiosSecure.put(`/vehicles/${id}/${v._id}`, fv);
                                Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
                                fetchVehicles();
                              } catch { Swal.fire("Error", "Update failed", "error"); }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={async () => {
                            const r = await Swal.fire({ title: "Delete?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48", confirmButtonText: "Delete" });
                            if (r.isConfirmed) {
                              try {
                                await axiosSecure.delete(`/vehicles/${id}/${v._id}`);
                                fetchVehicles();
                                Swal.fire({ icon: "success", title: "Removed", timer: 1500, showConfirmButton: false });
                              } catch { Swal.fire("Error", "Failed", "error"); }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20 gap-2">
                      <Truck size={36} />
                      <p className="text-xs font-black uppercase tracking-widest italic">No Vehicles Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;