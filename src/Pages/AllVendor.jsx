
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User, ReceiptText } from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";
import useRole from "../hooks/useRole";

const AllVendor = () => {
  const axiosSecure = useAxiosSecure();
  const { role }    = useRole();
  const isVendorRole = role === "vendor";
  const roleReady    = role !== undefined;
  const navigate     = useNavigate();

  const [vendors,    setVendors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editVendor, setEditVendor] = useState(null);
  const [uploading,  setUploading]  = useState(false);
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
      title: "Delete Vendor?", text: "This record will be permanently removed.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Delete",
    }).then(async (r) => {
      if (r.isConfirmed) {
        const res = await axiosSecure.delete(`/vendors/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
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
      setEditVendor(null); setUpdatedImg("");
    }
  };

  if (!roleReady || loading) return <LoadingSpinner text="Fetching Records..." />;

  const ActionBtn = ({ onClick, icon, title, hoverClass, borderClass = "border-slate-200" }) => (
    <button onClick={onClick} title={title}
      className={`p-2 border ${borderClass} rounded-xl text-slate-500 ${hoverClass} transition-all`}>
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full page-enter">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 flex-shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight truncate">
              {isVendorRole ? "My Vendor Profile" : "Vendor Directory"}
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {isVendorRole ? "Your vendor profile and trip history" : "Manage all partner profiles"}
            </p>
          </div>
        </div>
        {!isVendorRole && (
          <div className="bg-slate-900 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-slate-800 flex-shrink-0">
            <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Total</span>
            <span className="text-white font-black text-sm border-l pl-2.5 border-slate-700">{vendors.length}</span>
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {vendors.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
            <User size={28} />
          </div>
          <p className="font-semibold text-slate-600">No vendor data found</p>
          {isVendorRole && <p className="text-slate-400 text-xs mt-1 text-center px-4">You haven't been linked to a vendor yet.</p>}
        </div>
      ) : (
        <>
          {/* ── Mobile cards ── */}
          <div className="sm:hidden flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
            {vendors.map((vendor, i) => (
              <div key={vendor._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    {vendor.vendorImg
                      ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{vendor.vendorName}</p>
                    {!isVendorRole && <p className="text-[9px] text-slate-400 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>}
                  </div>
                  {!isVendorRole && <span className="text-[9px] font-mono text-slate-400">#{i + 1}</span>}
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Phone size={11} className="text-emerald-500 flex-shrink-0" />
                    <span className="font-semibold">{vendor.vendorPhone}</span>
                  </div>
                  {vendor.vendorAddress && (
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <MapPin size={11} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{vendor.vendorAddress}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                  <button onClick={() => navigate(`/vendor-details/${vendor._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                    <Eye size={12} /> View
                  </button>
                  <button onClick={() => navigate(`/vendor-trip-summary/${vendor._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                    <ReceiptText size={12} /> Trips
                  </button>
                  {!isVendorRole && (
                    <>
                      <button onClick={() => setEditVendor(vendor)}
                        className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(vendor._id)}
                        className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden sm:flex flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-900">
                    {!isVendorRole && <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-10">#</th>}
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((vendor, i) => (
                    <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                      {!isVendorRole && <td className="px-4 py-3 text-center text-xs font-bold text-slate-400">{i + 1}</td>}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            {vendor.vendorImg
                              ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                              : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={14} /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{vendor.vendorName}</p>
                            {!isVendorRole && <p className="text-[9px] text-slate-400 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                          <Phone size={11} className="text-emerald-500 flex-shrink-0" />
                          {vendor.vendorPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-slate-600 flex items-start gap-1.5 max-w-[200px]">
                          <MapPin size={11} className="text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{vendor.vendorAddress}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-1.5">
                          <ActionBtn onClick={() => navigate(`/vendor-details/${vendor._id}`)}    icon={<Eye size={13} />}      title="View Details" hoverClass="hover:bg-slate-900 hover:text-white hover:border-slate-900" />
                          <ActionBtn onClick={() => navigate(`/vendor-trip-summary/${vendor._id}`)} icon={<ReceiptText size={13} />} title="Trip Summary" hoverClass="hover:bg-indigo-600 hover:text-white hover:border-indigo-600" borderClass="border-indigo-200 text-indigo-500" />
                          {!isVendorRole && (
                            <>
                              <ActionBtn onClick={() => setEditVendor(vendor)} icon={<Edit3 size={13} />}  title="Edit"   hoverClass="hover:bg-amber-500 hover:text-white hover:border-amber-500" />
                              <ActionBtn onClick={() => handleDelete(vendor._id)} icon={<Trash2 size={13} />} title="Delete" hoverClass="hover:bg-red-500 hover:text-white hover:border-red-500" />
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
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Edit3 size={13} className="text-amber-600" />
                </div>
                <h2 className="text-sm font-black text-slate-800">Update Vendor</h2>
              </div>
              <button onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Name</label>
                  <input type="text" name="vendorName" defaultValue={editVendor.vendorName}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Phone</label>
                  <input type="text" name="vendorPhone" defaultValue={editVendor.vendorPhone}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 bg-slate-50" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Vendor Photo</label>
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                    <img src={updatedImg || editVendor.vendorImg} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <input type="file" onChange={handleImageUpload} className="text-xs flex-1 min-w-0"
                    accept="image/jpeg,image/png,image/webp" disabled={uploading} />
                </div>
                {uploading && (
                  <p className="text-[10px] text-orange-500 animate-pulse font-bold flex items-center gap-1 mt-1">
                    <Loader2 size={10} className="animate-spin" /> Uploading...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Address</label>
                <textarea name="vendorAddress" defaultValue={editVendor.vendorAddress} rows="2"
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 bg-slate-50 resize-none" required />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 py-2.5 text-white text-xs font-black rounded-xl transition-all bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300">
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
