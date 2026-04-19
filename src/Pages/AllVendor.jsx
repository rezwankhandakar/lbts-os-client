

import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User, ReceiptText } from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";
import useRole from "../hooks/useRole";

const AllVendor = () => {
  const axiosSecure = useAxiosSecure();
  const { role } = useRole();
  const isVendorRole = role === "vendor";
  const roleReady = role !== undefined;

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editVendor, setEditVendor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updatedImg, setUpdatedImg] = useState("");

  useEffect(() => {
    if (!roleReady) return;
    axiosSecure.get("/vendors")
      .then(res => setVendors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roleReady]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axiosSecure.post("/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        setUpdatedImg(res.data.url);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Photo uploaded", showConfirmButton: false, timer: 1500 });
      }
    } catch { Swal.fire("Error", "Image upload failed", "error"); }
    finally { setUploading(false); }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "This record will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Delete",
    }).then(async (r) => {
      if (r.isConfirmed) {
        const res = await axiosSecure.delete(`/vendors/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted", "Vendor has been removed.", "success");
          setVendors(prev => prev.filter(v => v._id !== id));
        }
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      vendorName: form.vendorName.value,
      vendorPhone: form.vendorPhone.value,
      vendorAddress: form.vendorAddress.value,
      vendorImg: updatedImg || editVendor.vendorImg,
    };
    const res = await axiosSecure.patch(`/vendors/${editVendor._id}`, data);
    if (res.data.modifiedCount > 0) {
      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
      setVendors(prev => prev.map(v => v._id === editVendor._id ? { ...v, ...data } : v));
      setEditVendor(null);
      setUpdatedImg("");
    }
  };

  if (!roleReady || loading) return <LoadingSpinner text="Fetching Records..." />;

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between mb-3 sm:mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight uppercase leading-tight truncate">
            {isVendorRole ? "My Vendor Profile" : "Vendor Directory"}
          </h1>
          <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
            {isVendorRole ? "আপনার vendor profile এবং trip summary।" : "Manage partner profiles and logistics."}
          </p>
        </div>
        {!isVendorRole && (
          <div className="bg-slate-900 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-800 shrink-0">
            <span className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">Total</span>
            <span className="text-white font-black text-sm sm:text-base border-l pl-2 sm:pl-2.5 border-slate-700">{vendors.length}</span>
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {vendors.length === 0 ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16">
          <p className="text-slate-400 italic text-sm">No vendor data found.</p>
          {isVendorRole && <p className="text-slate-400 text-xs mt-1 text-center px-4">Admin আপনাকে কোনো vendor এর সাথে link করেনি।</p>}
        </div>
      ) : (
        <>
          {/* ══ MOBILE CARD VIEW (< sm) ══ */}
          <div className="sm:hidden flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
            {vendors.map((vendor, index) => (
              <div key={vendor._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                {/* Card top row */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {vendor.vendorImg
                      ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                      : <User size={18} className="m-auto mt-2 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">{vendor.vendorName}</p>
                      {!isVendorRole && (
                        <span className="text-[8px] font-mono text-slate-400 shrink-0 mt-0.5">#{index + 1}</span>
                      )}
                    </div>
                    {!isVendorRole && (
                      <p className="text-[9px] text-slate-400 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>
                    )}
                  </div>
                </div>

                {/* Card details */}
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone size={11} className="text-emerald-500 shrink-0" />
                    <span className="font-semibold">{vendor.vendorPhone}</span>
                  </div>
                  {vendor.vendorAddress && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{vendor.vendorAddress}</span>
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/vendor-details/${vendor._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    onClick={() => navigate(`/vendor-trip-summary/${vendor._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                  >
                    <ReceiptText size={13} /> Trips
                  </button>
                  {!isVendorRole && (
                    <>
                      <button
                        onClick={() => setEditVendor(vendor)}
                        className="flex items-center justify-center p-2 border rounded-lg text-slate-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor._id)}
                        className="flex items-center justify-center p-2 border rounded-lg text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ══ DESKTOP / LAPTOP TABLE VIEW (>= sm) ══ */}
          <div className="hidden sm:flex flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    {!isVendorRole && (
                      <th className="px-3 lg:px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center w-10">#</th>
                    )}
                    <th className="px-3 lg:px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Vendor</th>
                    <th className="px-3 lg:px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Contact</th>
                    <th className="px-3 lg:px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hidden md:table-cell">Location</th>
                    <th className="px-3 lg:px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((vendor, index) => (
                    <tr key={vendor._id} className="hover:bg-slate-50/80 transition-colors">
                      {!isVendorRole && (
                        <td className="px-3 lg:px-4 py-3 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                      )}
                      <td className="px-3 lg:px-4 py-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {vendor.vendorImg
                              ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                              : <User size={14} className="m-auto mt-1.5 text-slate-300" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{vendor.vendorName}</p>
                            {!isVendorRole && (
                              <p className="text-[9px] text-slate-400 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                          <Phone size={11} className="text-emerald-500 shrink-0" />
                          {vendor.vendorPhone}
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-slate-600 flex items-start gap-1 max-w-[200px]">
                          <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{vendor.vendorAddress}</span>
                        </p>
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <div className="flex justify-center items-center gap-1 lg:gap-1.5 flex-wrap">
                          <button
                            onClick={() => navigate(`/vendor-details/${vendor._id}`)}
                            title="View Details"
                            className="p-1.5 lg:p-2 border rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-slate-500"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => navigate(`/vendor-trip-summary/${vendor._id}`)}
                            title="Trip Summary"
                            className="p-1.5 lg:p-2 border rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-indigo-500 border-indigo-200"
                          >
                            <ReceiptText size={13} />
                          </button>
                          {!isVendorRole && (
                            <>
                              <button
                                onClick={() => setEditVendor(vendor)}
                                title="Edit"
                                className="p-1.5 lg:p-2 border rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all text-slate-500"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(vendor._id)}
                                title="Delete"
                                className="p-1.5 lg:p-2 border rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-slate-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Modal ── */}
      {editVendor && !isVendorRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md border overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex justify-between items-center px-5 py-3.5 border-b bg-slate-50 shrink-0">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Update Vendor</h2>
              <button
                onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                className="text-slate-400 hover:text-red-500 transition p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Legal Name</label>
                  <input
                    type="text" name="vendorName" defaultValue={editVendor.vendorName}
                    className="w-full text-sm p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                  <input
                    type="text" name="vendorPhone" defaultValue={editVendor.vendorPhone}
                    className="w-full text-sm p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Vendor Logo</label>
                <div className="flex items-center gap-3 p-2.5 border rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded bg-white border overflow-hidden shrink-0">
                    <img src={updatedImg || editVendor.vendorImg} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file" onChange={handleImageUpload}
                    className="text-xs flex-1 min-w-0"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <p className="text-[10px] text-blue-600 animate-pulse font-bold flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Uploading...
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Address</label>
                <textarea
                  name="vendorAddress" defaultValue={editVendor.vendorAddress} rows="2"
                  className="w-full text-sm p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                  className="flex-1 py-2.5 text-xs font-black text-slate-400 border rounded-lg uppercase hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
                <button
                  type="submit" disabled={uploading}
                  className={`flex-1 py-2.5 text-white text-xs font-black rounded-lg uppercase transition ${uploading ? "bg-slate-400" : "bg-slate-900 hover:bg-black"}`}
                >
                  {uploading ? "Uploading..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllVendor;