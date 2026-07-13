import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { UserPlus, Image as ImageIcon, MapPin, Phone, RotateCcw, Save, Camera, Loader2 } from "lucide-react";

const AddVendor = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);

  const [formData, setFormData] = useState({
    vendorName: "", vendorImg: "", vendorAddress: "", vendorPhone: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ── Instant local preview — আগে `preview` set হতো কিন্তু UI-তে কোথাও
    //    ব্যবহার হতো না, ফলে upload শেষ না হওয়া পর্যন্ত বক্স ফাঁকা দেখাত।
    //    পুরনো objectURL revoke করা হয় (memory leak এড়াতে)।
    setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axiosSecure.post("/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        setFormData(prev => ({ ...prev, vendorImg: res.data.url }));
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Image Uploaded", showConfirmButton: false, timer: 1500 });
      }
    } catch { Swal.fire("Error", "Failed to upload image", "error"); }
    finally { setUploading(false); }
  };

  const handleReset = () => {
    setFormData({ vendorName: "", vendorImg: "", vendorAddress: "", vendorPhone: "" });
    setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorImg) return Swal.fire("Wait!", "Please upload a vendor image first.", "warning");
    setLoading(true);
    try {
      // Trim — নাম/ফোন/ঠিকানায় লিডিং-ট্রেইলিং space নিয়ে save হতো
      const payload = {
        vendorName: formData.vendorName.trim(),
        vendorImg: formData.vendorImg,
        vendorAddress: formData.vendorAddress.trim(),
        vendorPhone: formData.vendorPhone.trim(),
      };
      const res = await axiosSecure.post("/vendors", payload);
      if (res.data.insertedId) {
        Swal.fire({ icon: "success", title: "Vendor Added!", text: "Vendor has been added to the system.", confirmButtonColor: "#f97316" });
        handleReset();
        queryClient.invalidateQueries({ queryKey: ["vendors"] });
      }
    } catch (err) {
      // Server validation message দেখাও — আগে সব ক্ষেত্রে generic error
      const msg = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || "Failed to add vendor.";
      Swal.fire("Error", msg, "error");
    }
    finally { setLoading(false); }
  };

  const inp = "w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 md:p-8 page-enter">

      {/* ── Page header ── */}
      <div className="max-w-3xl mx-auto mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Add New Vendor</h1>
            <p className="text-slate-500 text-xs mt-0.5">Create a new vendor profile for logistics management</p>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* Mobile top strip */}
          <div className="md:hidden bg-slate-900 px-4 py-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 overflow-hidden bg-slate-800 flex-shrink-0 relative">
              {(preview || formData.vendorImg)
                ? <img src={preview || formData.vendorImg} alt="Preview" className={`w-full h-full object-cover ${uploading ? "opacity-60" : ""}`} />
                : <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={22} /></div>
              }
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={18} className="text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Vendor Profile</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Upload photo & fill contact info</p>
              {formData.vendorImg && !uploading && <span className="text-[10px] text-emerald-400 font-bold">✓ Image uploaded</span>}
            </div>
          </div>

          {/* Desktop left panel */}
          <div className="hidden md:flex bg-slate-900 p-7 text-white flex-col justify-between">
            <div>
              <h3 className="text-base font-black mb-2">Vendor Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a clear photo and provide accurate contact details for efficient coordination.
              </p>
            </div>
            <div className="flex flex-col items-center mt-8">
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800 relative">
                {(preview || formData.vendorImg)
                  ? <img src={preview || formData.vendorImg} alt="Preview" className={`w-full h-full object-cover ${uploading ? "opacity-60" : ""}`} />
                  : <ImageIcon size={34} className="text-slate-600" />
                }
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={22} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Image Preview</p>
              {formData.vendorImg && !uploading && <span className="mt-1 text-[10px] text-emerald-400 font-bold">✓ Uploaded</span>}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 p-5 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Vendor Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Vendor Name</label>
                <div className="relative">
                  <UserPlus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange}
                    required placeholder="Enter vendor name" className={inp} />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Vendor Photo</label>
                <label className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-slate-50
                  border-2 border-dashed border-slate-200 rounded-xl cursor-pointer
                  hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                  {uploading
                    ? <Loader2 size={17} className="text-orange-500 animate-spin" />
                    : <Camera size={17} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                  }
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-orange-600">
                    {uploading ? "Uploading..." : "Select Vendor Image"}
                  </span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              {/* Phone + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="vendorPhone" value={formData.vendorPhone} onChange={handleChange}
                      required placeholder="+880 1XXX-XXXXXX" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="vendorAddress" value={formData.vendorAddress} onChange={handleChange}
                      required placeholder="Vendor address" className={inp} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all text-sm">
                  <RotateCcw size={14} /> Reset
                </button>
                <button type="submit" disabled={loading || uploading}
                  className="flex items-center justify-center gap-2 px-7 py-2.5 bg-orange-500 hover:bg-orange-600
                    disabled:bg-orange-300 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20
                    transition-all active:scale-95 text-sm">
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    : <><Save size={14} /> Save Vendor</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVendor;