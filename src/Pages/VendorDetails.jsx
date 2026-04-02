

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router";
// import axios from "axios";
// import Swal from "sweetalert2";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { Truck, Phone, MapPin, User, Plus, Loader2, ClipboardList, Briefcase, Camera, Edit3, Trash2, PhoneCall } from "lucide-react";

// const VendorDetails = () => {
//   const { id } = useParams();
//   const axiosSecure = useAxiosSecure();

//   const [vendor, setVendor] = useState({});
//   const [vehicles, setVehicles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [driverImg, setDriverImg] = useState("");

//   useEffect(() => {
//     const loadData = async () => {
//       await Promise.all([fetchVendor(), fetchVehicles()]);
//       setLoading(false);
//     };
//     loadData();
//   }, [id]);

//   const fetchVendor = async () => {
//     const res = await axiosSecure.get(`/vendors/${id}`);
//     setVendor(res.data);
//   };

// const fetchVehicles = async () => {
//   const res = await axiosSecure.get(`/vendors/${id}`);
//   // Sorasori vendor document-er bhetor theke array-ti set kora
//   setVehicles(res.data.vehicles || []); 
// };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploading(true);
//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;
//       const res = await axios.post(image_API_URL, formData);
//       if (res.data.success) {
//         setDriverImg(res.data.data.url);
//         Swal.fire({
//           toast: true,
//           position: "top-end",
//           icon: "success",
//           title: "Driver Photo Uploaded",
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     } catch (error) {
//       Swal.fire("Error", "Image upload failed", "error");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleAddVehicle = async (e) => {
//     e.preventDefault();
//     const form = e.target;

//     const vehicleData = {
//       vendorId: id,
//       vehicleNumber: form.vehicleNumber.value,
//       vehicleModel: form.vehicleModel.value, // ✅ Added Vehicle Model
//       driverName: form.driverName.value,
//       driverPhone: form.driverPhone.value,
//       driverImg: driverImg,
//     };

//     const res = await axiosSecure.post("/vehicles", vehicleData);
//     if (res.data.insertedId) {
//       Swal.fire({
//         icon: "success",
//         title: "Vehicle Registered",
//         confirmButtonColor: "#0f172a",
//       });
//       form.reset();
//       setDriverImg("");
//       fetchVehicles();
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <Loader2 className="animate-spin text-slate-400 mb-2" size={32} />
//         <p className="text-slate-500 text-sm font-medium tracking-wide">Loading Profile...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 md:p-10 bg-[#F1F5F9] min-h-screen font-sans">
//       <div className="max-w-7xl mx-auto space-y-8">
        
//         {/* Header & Vendor Card */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
//             <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden border-2 border-slate-100">
//               {vendor.vendorImg ? (
//                 <img src={vendor.vendorImg} alt={vendor.vendorName} className="w-full h-full object-cover" />
//               ) : (
//                 <Briefcase size={40} />
//               )}
//             </div>
//             <div className="flex-1">
//               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">
//                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//                 Verified Partner
//               </div>
//               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{vendor.vendorName}</h1>
//               <div className="mt-4 flex flex-wrap gap-4">
//                 <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
//                   <MapPin size={14} className="text-slate-400" />
//                   <span className="text-sm font-medium">{vendor.vendorAddress}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
//                   <Phone size={14} className="text-slate-400" />
//                   <span className="text-sm font-bold tracking-tight">{vendor.vendorPhone}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
//              <div className="absolute top-0 right-0 p-4 opacity-10">
//                 <Truck size={100} />
//              </div>
             
//              <h2 className="text-5xl font-black">{vehicles.length}</h2>
//              <p className="text-slate-400 text-xs mt-2 italic font-medium">Registered Vehicles</p>
//           </div>
//         </div>

//         {/* Add Vehicle Section */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
//             <Plus size={18} className="text-slate-800" />
//             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Register New Vehicle</h3>
//           </div>
//           <form onSubmit={handleAddVehicle} className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Photo</label>
//                 <div className="flex items-center gap-3">
//                   <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
//                     {uploading ? <Loader2 className="animate-spin text-slate-400" size={16} /> : <Camera size={16} className="text-slate-400" />}
//                     <span className="text-[11px] font-bold text-slate-600 uppercase">Img</span>
//                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
//                   </label>
//                   {driverImg && <img src={driverImg} className="w-10 h-10 rounded-lg object-cover border border-emerald-500" alt="" />}
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Model</label>
//                 <input type="text" name="vehicleModel" placeholder="e.g. Tata ACE" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Number</label>
//                 <input type="text" name="vehicleNumber" placeholder="DHAKA-METRO-X" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Name</label>
//                 <input type="text" name="driverName" placeholder="Full Name" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Phone</label>
//                 <input type="text" name="driverPhone" placeholder="017XXXXXXXX" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
//               </div>
//             </div>
//             <button disabled={uploading} className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300">
//               <Plus size={16} /> {uploading ? "Uploading..." : "Add Vehicle to Fleet"}
//             </button>
//           </form>
//         </div>

//         {/* Vehicle Table */}
//       <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
//   <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
//     <div className="flex items-center gap-2">
//       <ClipboardList size={18} className="text-slate-800" />
//       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Vehicle Inventory</h3>
//     </div>
//     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-tighter">Live Database</span>
//   </div>

//   <div className="overflow-x-auto">
//     <table className="w-full text-left border-collapse">
//       <thead className="bg-slate-50 border-b border-slate-200">
//         <tr>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-12">SL</th>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver Details</th>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle Model</th>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vehicle Number</th>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Contact</th>
//           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-slate-100">
//         {vehicles.length > 0 ? (
//           vehicles.map((v, index) => (
//             <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
//               <td className="px-6 py-4 text-[12px] font-bold text-center">{index + 1}</td>
              
//               {/* Driver Details */}
//               <td className="px-6 py-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
//                     {v.driverImg ? (
//                       <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-slate-400">
//                         <User size={18} />
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{v.driverName}</p>
//                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {v._id.slice(-6)}</p>
//                   </div>
//                 </div>
//               </td>

//               {/* ✅ Vehicle Model Column */}
//               <td className="px-6 py-4">
//                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
//                   <span className="text-[11px] font-black uppercase tracking-wider">{v.vehicleModel || "Standard"}</span>
//                 </div>
                
//               </td>

//               {/* Vehicle Number */}
//               <td className="px-6 py-4 text-center">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
//                   <Truck size={12} className="text-slate-400" />
//                   <span className="text-[11px] font-black uppercase tracking-wider">{v.vehicleNumber}</span>
//                 </div>
//               </td>

//               {/* Contact Info */}
//               <td className="px-6 py-4 text-center">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
//                   <PhoneCall size={12} className="text-slate-400" />
//                   <span className="text-[11px] font-black uppercase tracking-wider">{v.driverPhone}</span>
//                 </div>
//               </td>

//               {/* Actions */}
//               <td className="px-6 py-4">
//                 <div className="flex justify-center items-center gap-2">
//                   <button
//                     onClick={async () => {
//                       const { value: formValues } = await Swal.fire({
//                         title: '<h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Update Fleet Asset</h2>',
//                         html: `
//                           <div class="space-y-4 text-left p-1">
//                             <div>
//                               <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Model</label>
//                               <input id="swal-model" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Model" value="${v.vehicleModel || ''}">
//                             </div>
//                             <div>
//                               <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
//                               <input id="swal-number" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Plate" value="${v.vehicleNumber}">
//                             </div>
//                             <div class="grid grid-cols-2 gap-3">
//                               <div>
//                                 <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
//                                 <input id="swal-name" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Name" value="${v.driverName}">
//                               </div>
//                               <div>
//                                 <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Phone</label>
//                                 <input id="swal-phone" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Phone" value="${v.driverPhone}">
//                               </div>
//                             </div>
//                           </div>
//                         `,
//                         focusConfirm: false,
//                         showCancelButton: true,
//                         confirmButtonText: 'Save Changes',
//                         confirmButtonColor: '#0f172a',
//                         customClass: {
//                           popup: 'rounded-3xl border border-slate-100 shadow-2xl',
//                           confirmButton: 'rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest'
//                         },
//                         preConfirm: () => ({
//                           vehicleModel: document.getElementById('swal-model').value,
//                           vehicleNumber: document.getElementById('swal-number').value,
//                           driverName: document.getElementById('swal-name').value,
//                           driverPhone: document.getElementById('swal-phone').value,
//                         })
//                       });

//                       if (formValues) {
//                         try {
//                           await axiosSecure.put(`/vehicles/${id}/${v._id}`, formValues);
//                           Swal.fire({ icon: 'success', title: 'Asset Updated', timer: 1500, showConfirmButton: false });
//                           fetchVehicles();
//                         } catch (err) { Swal.fire('Error', 'Update failed', 'error'); }
//                       }
//                     }}
//                     className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
//                     title="Edit Asset"
//                   >
//                     <Edit3 size={16} />
//                   </button>

//                   <button
//                     onClick={async () => {
//                       const result = await Swal.fire({
//                         title: 'Confirm Deletion',
//                         text: 'This action cannot be undone.',
//                         icon: 'warning',
//                         showCancelButton: true,
//                         confirmButtonColor: '#e11d48',
//                         cancelButtonColor: '#f1f5f9',
//                         confirmButtonText: 'Yes, Delete',
//                         customClass: {
//                           popup: 'rounded-3xl',
//                           confirmButton: 'rounded-xl px-6 py-2 text-[11px] font-black uppercase tracking-widest',
//                           cancelButton: 'rounded-xl px-6 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500'
//                         }
//                       });
//                       if (result.isConfirmed) {
//                         try {
//                          await axiosSecure.delete(`/vehicles/${id}/${v._id}`);
//                           fetchVehicles();
//                           Swal.fire({ icon: 'success', title: 'Asset Removed', timer: 1500, showConfirmButton: false });
//                         } catch (err) { Swal.fire('Error', 'Deletion failed', 'error'); }
//                       }
//                     }}
//                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
//                     title="Delete Asset"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan="6" className="py-24 text-center">
//               <div className="flex flex-col items-center justify-center opacity-20">
//                 <Truck size={48} className="mb-2" />
//                 <p className="text-sm font-black uppercase tracking-widest italic">No Assets Found in Inventory</p>
//               </div>
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// </div>
//       </div>
//     </div>
//   );
// };

// export default VendorDetails;






import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Truck, Phone, MapPin, User, Plus, Loader2, ClipboardList, Briefcase, Camera, Edit3, Trash2, PhoneCall } from "lucide-react";
import LoadingSpinner from "../Component/LoadingSpinner";

const VendorDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();

  const [vendor, setVendor] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driverImg, setDriverImg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchVendor(), fetchVehicles()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const fetchVendor = async () => {
    const res = await axiosSecure.get(`/vendors/${id}`);
    setVendor(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axiosSecure.get(`/vendors/${id}`);
    setVehicles(res.data.vehicles || []);
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
        setDriverImg(res.data.url);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Driver Photo Uploaded",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire("Error", "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const form = e.target;

    const vehicleData = {
      vendorId: id,
      vehicleNumber: form.vehicleNumber.value,
      vehicleModel: form.vehicleModel.value,
      driverName: form.driverName.value,
      driverPhone: form.driverPhone.value,
      driverImg: driverImg,
    };

    const res = await axiosSecure.post("/vehicles", vehicleData);
    if (res.data.insertedId) {
      Swal.fire({
        icon: "success",
        title: "Vehicle Registered",
        confirmButtonColor: "#0f172a",
      });
      form.reset();
      setDriverImg("");
      fetchVehicles();
    }
  };

  if (loading) return <LoadingSpinner text="Loading Profile..." />;

  return (
    <div className="p-6 md:p-10 bg-[#F1F5F9] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & Vendor Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden border-2 border-slate-100">
              {vendor.vendorImg ? (
                <img src={vendor.vendorImg} alt={vendor.vendorName} className="w-full h-full object-cover" />
              ) : (
                <Briefcase size={40} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Partner
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{vendor.vendorName}</h1>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm font-medium">{vendor.vendorAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-sm font-bold tracking-tight">{vendor.vendorPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Truck size={100} />
            </div>
            <h2 className="text-5xl font-black">{vehicles.length}</h2>
            <p className="text-slate-400 text-xs mt-2 italic font-medium">Registered Vehicles</p>
          </div>
        </div>

        {/* Add Vehicle Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Plus size={18} className="text-slate-800" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Register New Vehicle</h3>
          </div>
          <form onSubmit={handleAddVehicle} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Photo</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                    {uploading
                      ? <Loader2 className="animate-spin text-slate-400" size={16} />
                      : <Camera size={16} className="text-slate-400" />
                    }
                    <span className="text-[11px] font-bold text-slate-600 uppercase">Img</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  {driverImg && (
                    <img src={driverImg} className="w-10 h-10 rounded-lg object-cover border border-emerald-500" alt="" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Model</label>
                <input type="text" name="vehicleModel" placeholder="e.g. Tata ACE" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Number</label>
                <input type="text" name="vehicleNumber" placeholder="DHAKA-METRO-X" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Name</label>
                <input type="text" name="driverName" placeholder="Full Name" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Driver Phone</label>
                <input type="text" name="driverPhone" placeholder="017XXXXXXXX" className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-semibold" required />
              </div>
            </div>
            <button
              disabled={uploading}
              className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              <Plus size={16} /> {uploading ? "Uploading..." : "Add Vehicle to Fleet"}
            </button>
          </form>
        </div>

        {/* Vehicle Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-800" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Vehicle Inventory</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-tighter">Live Database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-12">SL</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle Model</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vehicle Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.length > 0 ? (
                  vehicles.map((v, index) => (
                    <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-[12px] font-bold text-center">{index + 1}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                            {v.driverImg ? (
                              <img src={v.driverImg} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{v.driverName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {v._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                          <span className="text-[11px] font-black uppercase tracking-wider">{v.vehicleModel || "Standard"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                          <Truck size={12} className="text-slate-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider">{v.vehicleNumber}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                          <PhoneCall size={12} className="text-slate-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider">{v.driverPhone}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={async () => {
                              const { value: formValues } = await Swal.fire({
                                title: '<h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Update Fleet Asset</h2>',
                                html: `
                                  <div class="space-y-4 text-left p-1">
                                    <div>
                                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Model</label>
                                      <input id="swal-model" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Model" value="${v.vehicleModel || ''}">
                                    </div>
                                    <div>
                                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
                                      <input id="swal-number" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Plate" value="${v.vehicleNumber}">
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                      <div>
                                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                                        <input id="swal-name" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Name" value="${v.driverName}">
                                      </div>
                                      <div>
                                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Phone</label>
                                        <input id="swal-phone" class="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="Phone" value="${v.driverPhone}">
                                      </div>
                                    </div>
                                  </div>
                                `,
                                focusConfirm: false,
                                showCancelButton: true,
                                confirmButtonText: 'Save Changes',
                                confirmButtonColor: '#0f172a',
                                customClass: {
                                  popup: 'rounded-3xl border border-slate-100 shadow-2xl',
                                  confirmButton: 'rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest'
                                },
                                preConfirm: () => ({
                                  vehicleModel: document.getElementById('swal-model').value,
                                  vehicleNumber: document.getElementById('swal-number').value,
                                  driverName: document.getElementById('swal-name').value,
                                  driverPhone: document.getElementById('swal-phone').value,
                                })
                              });

                              if (formValues) {
                                try {
                                  await axiosSecure.put(`/vehicles/${id}/${v._id}`, formValues);
                                  Swal.fire({ icon: 'success', title: 'Asset Updated', timer: 1500, showConfirmButton: false });
                                  fetchVehicles();
                                } catch (err) {
                                  Swal.fire('Error', 'Update failed', 'error');
                                }
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Asset"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Confirm Deletion',
                                text: 'This action cannot be undone.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#e11d48',
                                cancelButtonColor: '#f1f5f9',
                                confirmButtonText: 'Yes, Delete',
                                customClass: {
                                  popup: 'rounded-3xl',
                                  confirmButton: 'rounded-xl px-6 py-2 text-[11px] font-black uppercase tracking-widest',
                                  cancelButton: 'rounded-xl px-6 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500'
                                }
                              });
                              if (result.isConfirmed) {
                                try {
                                  await axiosSecure.delete(`/vehicles/${id}/${v._id}`);
                                  fetchVehicles();
                                  Swal.fire({ icon: 'success', title: 'Asset Removed', timer: 1500, showConfirmButton: false });
                                } catch (err) {
                                  Swal.fire('Error', 'Deletion failed', 'error');
                                }
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Asset"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                        <Truck size={48} className="mb-2" />
                        <p className="text-sm font-black uppercase tracking-widest italic">No Assets Found in Inventory</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;