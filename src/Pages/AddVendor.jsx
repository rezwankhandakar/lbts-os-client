

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { UserPlus, Image as ImageIcon, MapPin, Phone, RotateCcw, Save, Camera, Loader2 } from "lucide-react";

const AddVendor = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    vendorName: "",
    vendorImg: "",
    vendorAddress: "",
    vendorPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const imgFormData = new FormData();
      imgFormData.append("image", file);

      const res = await axiosSecure.post("/upload-image", imgFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setFormData(prev => ({ ...prev, vendorImg: res.data.url }));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Image Uploaded Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFormData({ vendorName: "", vendorImg: "", vendorAddress: "", vendorPhone: "" });
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorImg) {
      return Swal.fire("Wait!", "Please upload a vendor image first.", "warning");
    }
    setLoading(true);
    try {
      const res = await axiosSecure.post("/vendors", formData);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Vendor has been added to the system.",
          confirmButtonColor: "#10b981",
        });
        handleReset();
        queryClient.invalidateQueries({ queryKey: ["vendors"] });
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add vendor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-5 md:p-8">

      {/* ── Page title ── */}
      <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
            <UserPlus size={22} />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Add New Vendor
          </h1>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm ml-10 sm:ml-12">
          Establish a new vendor profile to manage drivers and logistics efficiently.
        </p>
      </div>

      {/* ── Card ── */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* ── Left panel: preview (hidden on mobile, shown as top strip instead) ── */}

          {/* Mobile-only: compact image preview strip */}
          <div className="md:hidden bg-slate-900 px-4 py-4 flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800 shrink-0">
              {formData.vendorImg ? (
                <img src={formData.vendorImg} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-600" size={22} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Vendor Profile</h3>
              <p className="text-slate-400 text-[11px] leading-snug mt-0.5">
                Upload a clear image and accurate contact details.
              </p>
              {formData.vendorImg && (
                <span className="inline-block mt-1 text-[10px] text-emerald-400 font-bold uppercase">✓ Image uploaded</span>
              )}
            </div>
          </div>

          {/* Desktop-only: left sidebar */}
          <div className="hidden md:flex bg-slate-900 p-6 lg:p-8 text-white flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-3">Vendor Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a clear image and provide accurate contact details for better coordination.
              </p>
            </div>
            <div className="mt-8 flex flex-col items-center">
              <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800">
                {formData.vendorImg ? (
                  <img src={formData.vendorImg} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-600" size={36} />
                )}
              </div>
              <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Image Preview
              </p>
              {formData.vendorImg && (
                <span className="mt-1 text-[10px] text-emerald-400 font-bold uppercase">✓ Uploaded</span>
              )}
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="md:col-span-2 p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

              {/* Vendor Name */}
              <div>
                <label className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">
                  Vendor Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    required
                    placeholder="Enter Vendor Name"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm"
                  />
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">
                  Vendor Photo
                </label>
                <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
                  <div className="flex items-center gap-2.5">
                    {uploading
                      ? <Loader2 size={18} className="text-slate-400 animate-spin" />
                      : <Camera size={18} className="text-slate-400" />
                    }
                    <span className="text-xs sm:text-sm font-bold text-slate-600">
                      {uploading ? "Uploading..." : "Select Business Image"}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Phone + Address — stack on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="vendorPhone"
                      value={formData.vendorPhone}
                      onChange={handleChange}
                      required
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">
                    Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="vendorAddress"
                      value={formData.vendorAddress}
                      onChange={handleChange}
                      required
                      placeholder="Enter Vendor Address"
                      className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all text-sm"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 sm:px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 text-sm"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={15} /> Save Vendor</>
                  )}
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