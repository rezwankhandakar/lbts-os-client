
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { Edit3, Trash2, Eye, Phone, MapPin, X, Loader2, User, Search } from "lucide-react";

const AllVendor = () => {
    const axiosSecure = useAxiosSecure();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [editVendor, setEditVendor] = useState(null);

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

    const handleDelete = (id) => {
        Swal.fire({
            title: "Confirm Deletion",
            text: "This record will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1e293b", // Deep Slate
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Yes, Delete",
            customClass: { popup: 'rounded-xl' }
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
        const updatedVendor = {
            vendorName: form.vendorName.value,
            vendorImg: form.vendorImg.value,
            vendorAddress: form.vendorAddress.value,
            vendorPhone: form.vendorPhone.value,
        };

        const res = await axiosSecure.patch(`/vendors/${editVendor._id}`, updatedVendor);
        if (res.data.modifiedCount > 0) {
            Swal.fire({ icon: "success", title: "Success", text: "Profile updated!", timer: 1500, showConfirmButton: false });
            setEditVendor(null);
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
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Vendor Directory</h1>
                        <p className="text-slate-600 text-[13px] mt-1">Manage partner profiles and logistics contact info.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="bg-slate-900 px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-3 border border-slate-800">
                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Total</span>
                            <span className="text-white font-black text-lg border-l pl-3 border-slate-700">{vendors.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center w-16">#</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Vendor Profile</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Contact No.</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {vendors.map((vendor, index) => (
                                <tr key={vendor._id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-4 text-center text-[12px] font-bold text-slate-400">{index + 1}</td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-300 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                                                {vendor.vendorImg ? (
                                                    <img src={vendor.vendorImg} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-[15px] leading-tight tracking-tight">{vendor.vendorName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-100 px-1.5 py-0.5 rounded w-fit">ID: {vendor._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                                <Phone size={12} />
                                            </div>
                                            <span className="text-[13px] font-bold">{vendor.vendorPhone}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 text-slate-600">
                                            <MapPin size={14} className="mt-0.5 text-slate-400" />
                                            <span className="text-[13px] font-medium leading-relaxed max-w-[220px]">{vendor.vendorAddress}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2.5">
                                            <button 
                                                onClick={() => navigate(`/vendor-details/${vendor._id}`)}
                                                className="h-9 w-9 flex items-center justify-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-90"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setEditVendor(vendor)}
                                                className="h-9 w-9 flex items-center justify-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm active:scale-90"
                                                title="Edit"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(vendor._id)}
                                                className="h-9 w-9 flex items-center justify-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-90"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {editVendor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-300 overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-5 border-b bg-slate-50">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Update Vendor Data</h2>
                            <button onClick={() => setEditVendor(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={22} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Name</label>
                                    <input type="text" name="vendorName" defaultValue={editVendor.vendorName} className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-semibold text-slate-800" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone</label>
                                    <input type="text" name="vendorPhone" defaultValue={editVendor.vendorPhone} className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-semibold text-slate-800" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logo / Image URL</label>
                                <input type="text" name="vendorImg" defaultValue={editVendor.vendorImg} className="w-full text-[12px] p-3 rounded-lg border border-slate-300 bg-slate-50 outline-none font-mono text-slate-600" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered Address</label>
                                <textarea name="vendorAddress" defaultValue={editVendor.vendorAddress} rows="3" className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-semibold text-slate-800" required />
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setEditVendor(null)} className="flex-1 py-3 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest border border-slate-200 rounded-lg">Dismiss</button>
                                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white text-[11px] font-black rounded-lg shadow-xl hover:bg-black transition-all uppercase tracking-widest active:scale-95">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllVendor;