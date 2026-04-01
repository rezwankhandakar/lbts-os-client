

// import React, { useEffect, useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import axios from "axios"; // ✅ অবশ্যই ইমপোর্ট করতে হবে
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router";
// import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User } from "lucide-react";

// const AllVendor = () => {
//     const axiosSecure = useAxiosSecure();
//     const [vendors, setVendors] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     // Edit & Upload States
//     const [editVendor, setEditVendor] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [updatedImg, setUpdatedImg] = useState("");

//     useEffect(() => {
//         fetchVendors();
//     }, []);

//     const fetchVendors = async () => {
//         try {
//             const res = await axiosSecure.get("/vendors");
//             setVendors(res.data);
//         } catch (error) {
//             console.error("Error fetching vendors:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ImgBB Image Upload Logic
//     const handleImageUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         setUploading(true);
//         const formData = new FormData();
//         formData.append("image", file);

//         try {
//             const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;
//             const res = await axios.post(image_API_URL, formData);

//             if (res.data.success) {
//                 setUpdatedImg(res.data.data.url);
//                 Swal.fire({
//                     toast: true,
//                     position: "top-end",
//                     icon: "success",
//                     title: "Photo uploaded successfully",
//                     showConfirmButton: false,
//                     timer: 1500,
//                 });
//             }
//         } catch (error) {
//             console.error("Upload failed", error);
//             Swal.fire("Error", "Image upload failed", "error");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleDelete = (id) => {
//         Swal.fire({
//             title: "Confirm Deletion",
//             text: "This record will be permanently removed.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#1e293b",
//             cancelButtonColor: "#94a3b8",
//             confirmButtonText: "Yes, Delete",
//             customClass: { popup: 'rounded-xl' }
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const res = await axiosSecure.delete(`/vendors/${id}`);
//                 if (res.data.deletedCount > 0) {
//                     Swal.fire("Deleted", "Vendor has been removed.", "success");
//                     setVendors(vendors.filter((v) => v._id !== id));
//                 }
//             }
//         });
//     };

//     const handleUpdate = async (e) => {
//         e.preventDefault();
//         const form = e.target;
//         const updatedData = {
//             vendorName: form.vendorName.value,
//             vendorPhone: form.vendorPhone.value,
//             vendorAddress: form.vendorAddress.value,
//             vendorImg: updatedImg || editVendor.vendorImg,
//         };

//         const res = await axiosSecure.patch(`/vendors/${editVendor._id}`, updatedData);
//         if (res.data.modifiedCount > 0) {
//             Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
//             setEditVendor(null);
//             setUpdatedImg("");
//             fetchVendors();
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[70vh]">
//                 <Loader2 className="animate-spin text-slate-500 mb-3" size={35} />
//                 <p className="text-slate-500 text-sm font-medium tracking-wide">Fetching Records...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 md:p-10 bg-[#F1F5F9] min-h-screen font-sans">
//             {/* Header Section */}
//             <div className="max-w-7xl mx-auto mb-8 text-center md:text-left flex justify-between items-center">
//                 <div>
//                     <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Vendor Directory</h1>
//                     <p className="text-slate-600 text-[13px] mt-1">Manage partner profiles and logistics contact info.</p>
//                 </div>
//                 <div className="bg-slate-900 px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-3 border border-slate-800">
//                     <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Total</span>
//                     <span className="text-white font-black text-lg border-l pl-3 border-slate-700">{vendors.length}</span>
//                 </div>
//             </div>

//             {/* Table Section */}
//             <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead className="bg-slate-50 border-b-2 border-slate-200">
//                             <tr>
//                                 <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">#</th>
//                                 <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Vendor Profile</th>
//                                 <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Contact</th>
//                                 <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Location</th>
//                                 <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {vendors.map((vendor, index) => (
//                                 <tr key={vendor._id} className="hover:bg-slate-50 transition-all">
//                                     <td className="px-6 py-4 text-center text-[12px] font-bold text-slate-400">{index + 1}</td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-4">
//                                             <div className="w-11 h-11 rounded-lg bg-slate-100 border overflow-hidden">
//                                                 {vendor.vendorImg ? <img src={vendor.vendorImg} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2 text-slate-300" />}
//                                             </div>
//                                             <div>
//                                                 <p className="font-bold text-slate-900 text-[15px]">{vendor.vendorName}</p>
//                                                 <p className="text-[10px] text-slate-500 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-2 text-slate-700 font-bold text-[13px]">
//                                             <Phone size={12} className="text-emerald-500" /> {vendor.vendorPhone}
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 text-[13px] text-slate-600 font-medium">
//                                         <MapPin size={14} className="inline mr-1 text-slate-400" /> {vendor.vendorAddress}
//                                     </td>
//                                     <td className="px-6 py-4 text-center">
//                                         <div className="flex justify-center gap-2">
//                                             <button onClick={() => navigate(`/vendor-details/${vendor._id}`)} className="p-2 border rounded-lg hover:bg-slate-900 hover:text-white transition-all"><Eye size={16} /></button>
//                                             <button onClick={() => setEditVendor(vendor)} className="p-2 border rounded-lg hover:bg-amber-500 hover:text-white transition-all"><Edit3 size={16} /></button>
//                                             <button onClick={() => handleDelete(vendor._id)} className="p-2 border rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Modal */}
//             {editVendor && (
//                 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border overflow-hidden">
//                         <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
//                             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Update Vendor</h2>
//                             <button onClick={() => { setEditVendor(null); setUpdatedImg(""); }} className="text-slate-400 hover:text-red-500"><X size={22} /></button>
//                         </div>
//                         <form onSubmit={handleUpdate} className="p-8 space-y-5">
//                             <div className="grid grid-cols-2 gap-5">
//                                 <div className="space-y-1.5">
//                                     <label className="text-[10px] font-black text-slate-500 uppercase">Legal Name</label>
//                                     <input type="text" name="vendorName" defaultValue={editVendor.vendorName} className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
//                                     <input type="text" name="vendorPhone" defaultValue={editVendor.vendorPhone} className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
//                                 </div>
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-[10px] font-black text-slate-500 uppercase">Vendor Logo</label>
//                                 <div className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
//                                     <div className="w-12 h-12 rounded bg-white border overflow-hidden">
//                                         <img src={updatedImg || editVendor.vendorImg} alt="preview" className="w-full h-full object-cover" />
//                                     </div>
//                                     <input type="file" onChange={handleImageUpload} className="text-xs w-full" accept="image/*" />
//                                 </div>
//                                 {uploading && <p className="text-[10px] text-blue-600 animate-pulse font-bold">Uploading...</p>}
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-[10px] font-black text-slate-500 uppercase">Address</label>
//                                 <textarea name="vendorAddress" defaultValue={editVendor.vendorAddress} rows="3" className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900" required />
//                             </div>

//                             <div className="flex gap-4 pt-4 border-t">
//                                 <button type="button" onClick={() => { setEditVendor(null); setUpdatedImg(""); }} className="flex-1 py-3 text-[11px] font-black text-slate-400 border rounded-lg uppercase">Dismiss</button>
//                                 <button type="submit" disabled={uploading} className={`flex-1 py-3 text-white text-[11px] font-black rounded-lg uppercase ${uploading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black'}`}>
//                                     {uploading ? "Uploading..." : "Save Changes"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AllVendor;




import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User } from "lucide-react";

const AllVendor = () => {
  const axiosSecure = useAxiosSecure();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [editVendor, setEditVendor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updatedImg, setUpdatedImg] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

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

  // ✅ Backend এর মাধ্যমে upload — imgbb key আর frontend এ নেই
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
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Photo uploaded successfully",
          showConfirmButton: false,
          timer: 1500,
        });
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-slate-500 mb-3" size={35} />
        <p className="text-slate-500 text-sm font-medium tracking-wide">Fetching Records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-[#F1F5F9] min-h-screen font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 text-center md:text-left flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Vendor Directory</h1>
          <p className="text-slate-600 text-[13px] mt-1">Manage partner profiles and logistics contact info.</p>
        </div>
        <div className="bg-slate-900 px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-3 border border-slate-800">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Total</span>
          <span className="text-white font-black text-lg border-l pl-3 border-slate-700">{vendors.length}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">#</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Vendor Profile</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vendors.map((vendor, index) => (
                <tr key={vendor._id} className="hover:bg-slate-50 transition-all">
                  <td className="px-6 py-4 text-center text-[12px] font-bold text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border overflow-hidden">
                        {vendor.vendorImg
                          ? <img src={vendor.vendorImg} className="w-full h-full object-cover" />
                          : <User size={20} className="m-auto mt-2 text-slate-300" />
                        }
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[15px]">{vendor.vendorName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {vendor._id.slice(-8).toUpperCase()}</p>
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
                      <button onClick={() => navigate(`/vendor-details/${vendor._id}`)} className="p-2 border rounded-lg hover:bg-slate-900 hover:text-white transition-all"><Eye size={16} /></button>
                      <button onClick={() => setEditVendor(vendor)} className="p-2 border rounded-lg hover:bg-amber-500 hover:text-white transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(vendor._id)} className="p-2 border rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editVendor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Update Vendor</h2>
              <button
                onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Legal Name</label>
                  <input
                    type="text"
                    name="vendorName"
                    defaultValue={editVendor.vendorName}
                    className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                  <input
                    type="text"
                    name="vendorPhone"
                    defaultValue={editVendor.vendorPhone}
                    className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Vendor Logo</label>
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
                  <div className="w-12 h-12 rounded bg-white border overflow-hidden">
                    <img
                      src={updatedImg || editVendor.vendorImg}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="text-xs w-full"
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Address</label>
                <textarea
                  name="vendorAddress"
                  defaultValue={editVendor.vendorAddress}
                  rows="3"
                  className="w-full text-sm p-3 rounded-lg border outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setEditVendor(null); setUpdatedImg(""); }}
                  className="flex-1 py-3 text-[11px] font-black text-slate-400 border rounded-lg uppercase"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 py-3 text-white text-[11px] font-black rounded-lg uppercase ${uploading ? "bg-slate-400" : "bg-slate-900 hover:bg-black"}`}
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