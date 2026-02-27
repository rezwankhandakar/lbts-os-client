

import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

const EditGatePassModal = ({ open, onClose, gp, p, axiosSecure, setGatePasses }) => {
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
      // ⭐ product update
      await axiosSecure.put(`/gate-pass/${gp._id}/product/${p._id}`, {
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity),
      });

      // ⭐ gate pass main update
      const res = await axiosSecure.patch(`/gate-pass/${gp._id}`, {
        tripDo: formData.tripDo,
        tripDate: formData.tripDate,
        customerName: formData.customerName,
        csd: formData.csd,
        unit: formData.unit,
        vehicleNo: formData.vehicleNo,
        zone: formData.zone,
        currentUser: user?.displayName || user?.email,
      });

      setGatePasses((prev) =>
        prev.map((g) => (g._id === gp._id ? res.data.data : g))
      );

      onClose();

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Edit Gate Pass</h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {/* Row 1 */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Trip Do</label>
            <input
              required
              type="text"
              name="tripDo"
              value={formData.tripDo}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Trip Date</label>
            <input
              required
              type="date"
              name="tripDate"
              value={formData.tripDate}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 ml-1">Customer</label>
            <input
              required
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 3 - CSD & Unit */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">CSD</label>
            <input
              required
              type="text"
              name="csd"
              value={formData.csd}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Unit</label>
            <input
              required
              type="text"
              name="unit"
              placeholder="Unit"
              value={formData.unit}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
            />
          </div>

          {/* Row 4 */}
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Vehicle No</label>
            <input
              required
              type="text"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Zone</label>
            <input
              required
              type="text"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 5 - Product Info */}
          <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Product Details</p>
            <div className="space-y-2">
              <input
                required
                type="text"
                name="productName"
                placeholder="Product Name"
                value={formData.productName}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-1.5 rounded-lg w-full outline-none"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  name="model"
                  placeholder="Model"
                  value={formData.model}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg w-full outline-none"
                />
                <input
                  required
                  type="number"
                  min="1"
                  name="quantity"
                  placeholder="Qty"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg w-24 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGatePassModal;
