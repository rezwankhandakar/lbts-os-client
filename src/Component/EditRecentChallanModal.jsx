
import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

const EditRecentChallanModal = ({
  open,
  onClose,
  challan,
  product,
  axiosSecure,
  refreshChallan,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    district: "",
    thana: "",
    receiverNumber: "",
    zone: "",
    model: "",
    productName: "", // Added
    quantity: "",
  });

  useEffect(() => {
    if (open && challan && product) {
      setFormData({
        customerName: challan.customerName || "",
        address: challan.address || "",
        district: challan.district || "",
        thana: challan.thana || "",
        receiverNumber: challan.receiverNumber || "",
        zone: challan.zone || "",
        model: product.model || "",
        productName: product.productName || "", // Added
        quantity: product.quantity || "",
      });
    }
  }, [open, challan, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosSecure.put(
        `/challan/${challan._id}/product/${product._id}`,
        {
          model: formData.model,
          productName: formData.productName, // Added
          quantity: Number(formData.quantity),
        }
      );

      await axiosSecure.patch(`/challan/${challan._id}`, {
        customerName: formData.customerName,
        address: formData.address,
        district: formData.district,
        thana: formData.thana,
        receiverNumber: formData.receiverNumber,
        zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
      refreshChallan();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Update failed!", "error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* --- Header --- */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-xl tracking-tight">Edit Recent Challan</h3>
            <p className="text-green-100 text-xs mt-0.5 opacity-90">ID: {challan?._id?.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex flex-col md:flex-row gap-8">

            {/* --- Left Column: Customer Details --- */}
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-6 bg-green-600 rounded-full"></span>
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Customer Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Customer Name</label>
                  <input
                    required name="customerName"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.customerName} onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Street Address</label>
                  <input
                    required name="address"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.address} onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Thana</label>
                    <input
                      required name="thana"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      value={formData.thana} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">District</label>
                    <input
                      required name="district"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      value={formData.district} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Phone No</label>
                    <input
                      required name="receiverNumber"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      value={formData.receiverNumber} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase ml-1">Zone</label>
                    <input
                      required name="zone"
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      value={formData.zone} onChange={handleChange}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* --- Right Column: Product & Additional Info --- */}
            <div className="flex-1 space-y-5 border-l border-gray-100 pl-0 md:pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-6 bg-blue-600 rounded-full"></span>
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Product Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">


                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">


                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase ml-1 tracking-tighter">Product Name</label>
                    <input
                      required name="productName"
                      className="w-full border border-blue-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                      value={formData.productName} onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase ml-1 tracking-tighter">Product Model</label>
                    <input
                      required name="model"
                      className="w-full border border-blue-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                      value={formData.model} onChange={handleChange}
                    />
                  </div>


                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase ml-1 tracking-tighter">Quantity</label>
                    <input
                      required name="quantity" type="number" min="1"
                      className="w-full border border-blue-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                      value={formData.quantity} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Footer / Buttons --- */}
          <div className="mt-10 flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="px-10 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-95"
            >
              Save & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecentChallanModal;