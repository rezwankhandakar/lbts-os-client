

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
    thana: "", // নতুন যোগ করা হয়েছে
    receiverNumber: "",
    zone: "",
    productName: "",
    model: "",
    quantity: "",
  });

  useEffect(() => {
    if (challan && product) {
      setFormData({
        customerName: challan.customerName || "",
        address: challan.address || "",
        district: challan.district || "", // challan থেকে ডাটা নেয়া হচ্ছে
        thana: challan.thana || "",       // challan থেকে ডাটা নেয়া হচ্ছে
        receiverNumber: challan.receiverNumber || "",
        zone: challan.zone || "",
        productName: product.productName || "",
        model: product.model || "",
        quantity: product.quantity || "",
      });
    }
  }, [challan, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Update single product
      await axiosSecure.put(
        `/challan/${challan._id}/product/${product._id}`,
        {
          productName: formData.productName,
          model: formData.model,
          quantity: Number(formData.quantity),
        }
      );

      // ✅ Update main challan (district এবং thana সহ)
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
        title: "Updated!",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
      refreshChallan();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-3">Edit Recent Challan</h3>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input required name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Customer Name"
          />

          <input required name="address"
            value={formData.address}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Address"
          />

          {/* District Input */}
          <input required name="district"
            value={formData.district}
            onChange={handleChange}
            className="input border w-full"
            placeholder="District"
          />

          {/* Thana Input */}
          <input required name="thana"
            value={formData.thana}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Thana"
          />

          <input required name="receiverNumber"
            value={formData.receiverNumber}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Receiver Number"
          />

          <input required name="zone"
            value={formData.zone}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Zone"
          />

          <hr className="my-2" />

          <input required name="model"
            value={formData.model}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Model"
          />

          <input required type="number" min="1"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="input border w-full"
            placeholder="Quantity"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="btn btn-sm">
              Cancel
            </button>
            <button type="submit"
              className="btn btn-sm btn-success text-white">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecentChallanModal;