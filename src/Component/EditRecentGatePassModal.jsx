

import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

const EditRecentGatePassModal = ({ open, onClose, gp, p, axiosSecure, refreshGatePass }) => {
  const [formData, setFormData] = useState({
    tripDo: "",
    tripDate: "",
    customerName: "",
    csd: "",
    unit: "",
    vehicleNo: "",
    zone: "",
    productName: "",
    model: "",
    quantity: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (gp && p) {
      setFormData({
        tripDo: gp.tripDo || "",
        tripDate: gp.tripDate?.slice(0, 10) || "",
        customerName: gp.customerName || "",
        csd: gp.csd || "",
        unit: gp.unit || "",
        vehicleNo: gp.vehicleNo || "",
        zone: gp.zone || "",
        productName: p.productName || "",
        model: p.model || "",
        quantity: p.quantity || ""
      });
    }
  }, [gp, p]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update product
      await axiosSecure.put(`/gate-pass/${gp._id}/product/${p._id}`, {
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity),
      });

      // Update main gate pass
      await axiosSecure.patch(`/gate-pass/${gp._id}`, {
        tripDo: formData.tripDo,
        tripDate: formData.tripDate,
        customerName: formData.customerName,
        csd: formData.csd,
        unit: formData.unit,
        vehicleNo: formData.vehicleNo,
        zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });

      onClose();
      refreshGatePass();

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Gate pass updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Something went wrong!",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4 relative">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Edit Recent Gate Pass</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {/* ⭐ Required attribute added to all fields */}
          <input required type="text" name="tripDo" placeholder="Trip Do" value={formData.tripDo} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required type="date" name="tripDate" value={formData.tripDate} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required type="text" name="customerName" placeholder="Customer" value={formData.customerName} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          
          <div className="flex gap-2">
             <input required type="text" name="csd" placeholder="CSD" value={formData.csd} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
             <input required type="text" name="unit" placeholder="Unit" value={formData.unit} onChange={handleChange} className="border px-2 py-1 rounded w-full bg-blue-50" />
          </div>

          <input required type="text" name="vehicleNo" placeholder="Vehicle No" value={formData.vehicleNo} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required type="text" name="zone" placeholder="Zone" value={formData.zone} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required type="text" name="productName" placeholder="Product" value={formData.productName} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required type="text" name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          <input required min="1" type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="border px-2 py-1 rounded w-full" />

          <div className="flex justify-end gap-2 mt-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition-colors">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecentGatePassModal;