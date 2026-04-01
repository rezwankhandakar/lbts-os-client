

// import React, { useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import axios from "axios"; // Standard axios for external API
// import Swal from "sweetalert2";
// import { UserPlus, Image as ImageIcon, MapPin, Phone, RotateCcw, Save, Camera, Loader2 } from "lucide-react";

// const AddVendor = () => {
//   const axiosSecure = useAxiosSecure();
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

//   // ✅ Image Upload Logic to ImgBB
//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Show local preview
//     setPreview(URL.createObjectURL(file));
//     setUploading(true);

//     const imgFormData = new FormData();
//     imgFormData.append("image", file);

//     try {
//       const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;
//       const res = await axios.post(image_API_URL, imgFormData);
      
//       if (res.data.success) {
//         setFormData({ ...formData, vendorImg: res.data.data.url });
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
//       }
//     } catch (error) {
//       Swal.fire("Error", "Failed to add vendor.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
//       {/* Page Header */}
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

//       {/* Main Form Card */}
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
//                   <img
//                     src={formData.vendorImg}
//                     alt="Preview"
//                     className="w-full h-full object-cover"
//                   />
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
//                     {/* Image Upload Field */}
//                 <div>
//                   <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">
//                     Vendor Photo
//                   </label>
//                   <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
//                     <div className="flex items-center gap-3">
//                       <Camera size={20} className="text-slate-400" />
//                       <span className="text-sm font-bold text-slate-600">
//                         {uploading ? "Uploading to Cloud..." : "Select Business Image"}
//                       </span>
//                     </div>
//                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
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
//                   disabled={loading}
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





import React, { useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { UserPlus, Image as ImageIcon, MapPin, Phone, RotateCcw, Save, Camera, Loader2 } from "lucide-react";

const AddVendor = () => {
  const axiosSecure = useAxiosSecure();
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

  // ✅ Backend এর মাধ্যমে upload — imgbb key আর frontend এ নেই
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
    setFormData({
      vendorName: "",
      vendorImg: "",
      vendorAddress: "",
      vendorPhone: "",
    });
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
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add vendor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <UserPlus size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Add New Vendor
          </h1>
        </div>
        <p className="text-slate-500 ml-12">
          Establish a new vendor profile to manage drivers and logistics efficiently.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* Left Side: Info/Preview */}
          <div className="bg-slate-900 p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Vendor Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a clear image and provide accurate contact details for better coordination.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800">
                {formData.vendorImg ? (
                  <img src={formData.vendorImg} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-600" size={40} />
                )}
              </div>
              <p className="mt-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Image Preview
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-2 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">

                {/* Vendor Name */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                    />
                    <UserPlus className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">
                    Vendor Photo
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-emerald-400 transition-all">
                    <div className="flex items-center gap-3">
                      {uploading
                        ? <Loader2 size={20} className="text-slate-400 animate-spin" />
                        : <Camera size={20} className="text-slate-400" />
                      }
                      <span className="text-sm font-bold text-slate-600">
                        {uploading ? "Uploading to Cloud..." : "Select Business Image"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                      />
                      <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                      />
                      <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  {loading ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Vendor
                    </>
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
