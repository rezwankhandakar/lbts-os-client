

// import React, { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";
// import { UserPlus, Image as ImageIcon, MapPin, Phone, RotateCcw, Save, Camera, Loader2 } from "lucide-react";

// const AddVendor = () => {
//   const axiosSecure = useAxiosSecure();
//   const queryClient = useQueryClient(); // ✅ add
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [preview, setPreview] = useState(null);

//   const [formData, setFormData] = useState({
//     vendorName: "",
//     vendorImg: "",
//     vendorAddress: "",
//     vendorPhone: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setPreview(URL.createObjectURL(file));
//     setUploading(true);

//     try {
//       const imgFormData = new FormData();
//       imgFormData.append("image", file);

//       const res = await axiosSecure.post("/upload-image", imgFormData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (res.data.success) {
//         setFormData(prev => ({ ...prev, vendorImg: res.data.url }));
//         Swal.fire({
//           toast: true,
//           position: "top-end",
//           icon: "success",
//           title: "Image Uploaded Successfully",
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     } catch (error) {
//       console.error("Image Upload Error:", error);
//       Swal.fire("Error", "Failed to upload image", "error");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       vendorName: "",
//       vendorImg: "",
//       vendorAddress: "",
//       vendorPhone: "",
//     });
//     setPreview(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.vendorImg) {
//       return Swal.fire("Wait!", "Please upload a vendor image first.", "warning");
//     }

//     setLoading(true);
//     try {
//       const res = await axiosSecure.post("/vendors", formData);
//       if (res.data.insertedId) {
//         Swal.fire({
//           icon: "success",
//           title: "Success!",
//           text: "Vendor has been added to the system.",
//           confirmButtonColor: "#10b981",
//         });
//         handleReset();
//         // ✅ AllVendor এর cache invalidate করো
//         queryClient.invalidateQueries({ queryKey: ["vendors"] });
//       }
//     } catch (error) {
//       Swal.fire("Error", "Failed to add vendor.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto mb-8">
//         <div className="flex items-center gap-3 mb-2">
//           <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
//             <UserPlus size={28} />
//           </div>
//           <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
//             Add New Vendor
//           </h1>
//         </div>
//         <p className="text-slate-500 ml-12">
//           Establish a new vendor profile to manage drivers and logistics efficiently.
//         </p>
//       </div>

//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="grid grid-cols-1 md:grid-cols-3">

//           {/* Left Side: Info/Preview */}
//           <div className="bg-slate-900 p-8 text-white flex flex-col justify-between">
//             <div>
//               <h3 className="text-xl font-bold mb-4">Vendor Profile</h3>
//               <p className="text-slate-400 text-sm leading-relaxed">
//                 Upload a clear image and provide accurate contact details for better coordination.
//               </p>
//             </div>

//             <div className="mt-8 flex flex-col items-center">
//               <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800">
//                 {formData.vendorImg ? (
//                   <img src={formData.vendorImg} alt="Preview" className="w-full h-full object-cover" />
//                 ) : (
//                   <ImageIcon className="text-slate-600" size={40} />
//                 )}
//               </div>
//               <p className="mt-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">
//                 Image Preview
//               </p>
//             </div>
//           </div>

//           {/* Right Side: Form */}
//           <div className="md:col-span-2 p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 gap-6">

//                 {/* Vendor Name */}
//                 <div className="relative">
//                   <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
//                     Vendor Name
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       name="vendorName"
//                       value={formData.vendorName}
//                       onChange={handleChange}
//                       required
//                       placeholder="Enter Vendor Name"
//                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
//                     />
//                     <UserPlus className="absolute left-3 top-3.5 text-slate-400" size={18} />
//                   </div>
//                 </div>

//                 {/* Image Upload Field */}
//                 <div>
//                   <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">
//                     Vendor Photo
//                   </label>
//                   <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
//                     <div className="flex items-center gap-3">
//                       {uploading
//                         ? <Loader2 size={20} className="text-slate-400 animate-spin" />
//                         : <Camera size={20} className="text-slate-400" />
//                       }
//                       <span className="text-sm font-bold text-slate-600">
//                         {uploading ? "Uploading to Cloud..." : "Select Business Image"}
//                       </span>
//                     </div>
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/jpeg,image/png,image/webp"
//                       onChange={handleImageUpload}
//                       disabled={uploading}
//                     />
//                   </label>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Phone */}
//                   <div>
//                     <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
//                       Phone Number
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         name="vendorPhone"
//                         value={formData.vendorPhone}
//                         onChange={handleChange}
//                         required
//                         placeholder="+880 1XXX-XXXXXX"
//                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
//                       />
//                       <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
//                     </div>
//                   </div>

//                   {/* Address */}
//                   <div>
//                     <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
//                       Address
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         name="vendorAddress"
//                         value={formData.vendorAddress}
//                         onChange={handleChange}
//                         required
//                         placeholder="Enter Vendor Address"
//                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
//                       />
//                       <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="flex items-center gap-2 px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
//                 >
//                   <RotateCcw size={18} />
//                   Reset
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={loading || uploading}
//                   className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
//                 >
//                   {loading ? (
//                     <span className="animate-pulse">Saving...</span>
//                   ) : (
//                     <>
//                       <Save size={18} />
//                       Save Vendor
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddVendor;





import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User, ReceiptText } from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";
import useAuth from "../hooks/useAuth";

const AllVendor = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [editVendor, setEditVendor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updatedImg, setUpdatedImg] = useState("");

  // current logged in user এর role এবং vendorName
  const [currentUserData, setCurrentUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosSecure.get(`/users/${user?.email}/role`);
        setCurrentUserData(res.data);
      } catch {
        setCurrentUserData(null);
      } finally {
        setUserDataLoading(false);
      }
    };
    if (user?.email) {
      fetchCurrentUser();
    } else {
      setUserDataLoading(false);
    }
  }, [user]);

  const isVendorRole = currentUserData?.role === 'vendor';

  // currentUserData load হওয়ার পরেই vendors fetch করো
  useEffect(() => {
    if (!userDataLoading) fetchVendors();
  }, [userDataLoading]);

  const fetchVendors = async () => {
    try {
      const res = await axiosSecure.get("/vendors");
      setVendors(res.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imgFormData = new FormData();
      imgFormData.append("image", file);
      const res = await axiosSecure.post("/upload-image", imgFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUpdatedImg(res.data.url);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Photo uploaded successfully", showConfirmButton: false, timer: 1500 });
      }
    } catch (error) {
      console.error("Upload failed", error);
      Swal.fire("Error", "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
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
      customClass: { popup: "rounded-xl" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axiosSecure.delete(`/vendors/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted", "Vendor has been removed.", "success");
          setVendors(vendors.filter((v) => v._id !== id));
        }
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedData = {
      vendorName: form.vendorName.value,
      vendorPhone: form.vendorPhone.value,
      vendorAddress: form.vendorAddress.value,
      vendorImg: updatedImg || editVendor.vendorImg,
    };
    const res = await axiosSecure.patch(`/vendors/${editVendor._id}`, updatedData);
    if (res.data.modifiedCount > 0) {
      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
      setEditVendor(null);
      setUpdatedImg("");
      fetchVendors();
    }
  };

  if (loading || userDataLoading) return <LoadingSpinner text="Fetching Records..." />;

  return (
    <div className="p-6 md:p-10 bg-[#F1F5F9] min-h-screen font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 text-center md:text-left flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
            {isVendorRole ? "My Vendor Profile" : "Vendor Directory"}
          </h1>
          <p className="text-slate-600 text-[13px] mt-1">
            {isVendorRole
              ? "আপনার vendor profile এবং trip summary দেখুন।"
              : "Manage partner profiles and logistics contact info."}
          </p>
        </div>
        {!isVendorRole && (
          <div className="bg-slate-900 px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-3 border border-slate-800">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Total</span>
            <span className="text-white font-black text-lg border-l pl-3 border-slate-700">{vendors.length}</span>
          </div>
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
            <p className="text-slate-400 italic text-sm">No vendor data found.</p>
            {isVendorRole && (
              <p className="text-slate-400 text-xs mt-2">Admin আপনাকে কোনো vendor এর সাথে link করেনি।</p>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  {!isVendorRole && (
                    <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">#</th>
                  )}
                  <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Vendor Profile</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendors.map((vendor, index) => (
                  <tr key={vendor._id} className="hover:bg-slate-50 transition-all">
                    {!isVendorRole && (
                      <td className="px-6 py-4 text-center text-[12px] font-bold text-slate-400">{index + 1}</td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-slate-100 border overflow-hidden">
                          {vendor.vendorImg
                            ? <img src={vendor.vendorImg} className="w-full h-full object-cover" alt="" />
                            : <User size={20} className="m-auto mt-2 text-slate-300" />
                          }
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[15px]">{vendor.vendorName}</p>
                          {!isVendorRole && (
                            <p className="text-[10px] text-slate-500 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-[13px]">
                        <Phone size={12} className="text-emerald-500" /> {vendor.vendorPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-600 font-medium">
                      <MapPin size={14} className="inline mr-1 text-slate-400" /> {vendor.vendorAddress}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Details — সবাই দেখতে পারবে */}
                        <button
                          onClick={() => navigate(`/vendor-details/${vendor._id}`)}
                          title="View Details"
                          className="p-2 border rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Trip Summary — সবাই দেখতে পারবে */}
                        <button
                          onClick={() => navigate(`/vendor-trip-summary/${vendor._id}`)}
                          title="Trip Summary"
                          className="p-2 border rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-indigo-500"
                        >
                          <ReceiptText size={16} />
                        </button>

                        {/* Edit ও Delete — শুধু non-vendor দেখতে পারবে */}
                        {!isVendorRole && (
                          <>
                            <button
                              onClick={() => setEditVendor(vendor)}
                              title="Edit Vendor"
                              className="p-2 border rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(vendor._id)}
                              title="Delete Vendor"
                              className="p-2 border rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
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
      )}

      {/* Edit Modal — শুধু non-vendor দেখতে পারবে */}
      {editVendor && !isVendorRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Update Vendor</h2>
              <button onClick={() => { setEditVendor(null); setUpdatedImg(""); }} className="text-slate-400 hover:text-red-500">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Legal Name</label>
                  <input type="text" name="vendorName" defaultValue={editVendor.vendorName}
                    className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                  <input type="text" name="vendorPhone" defaultValue={editVendor.vendorPhone}
                    className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Vendor Logo</label>
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
                  <div className="w-12 h-12 rounded bg-white border overflow-hidden">
                    <img src={updatedImg || editVendor.vendorImg} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <input type="file" onChange={handleImageUpload} className="text-xs w-full"
                    accept="image/jpeg,image/png,image/webp" disabled={uploading} />
                </div>
                {uploading && (
                  <p className="text-[10px] text-blue-600 animate-pulse font-bold flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Uploading...
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Address</label>
                <textarea name="vendorAddress" defaultValue={editVendor.vendorAddress} rows="3"
                  className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                  className="flex-1 py-3 text-[11px] font-black text-slate-400 border rounded-lg uppercase">
                  Dismiss
                </button>
                <button type="submit" disabled={uploading}
                  className={`flex-1 py-3 text-white text-[11px] font-black rounded-lg uppercase ${uploading ? "bg-slate-400" : "bg-slate-900 hover:bg-black"}`}>
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