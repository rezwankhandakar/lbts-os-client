import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const EditGatePassModal = ({ open, onClose, gp, p, axiosSecure, setGatePasses }) => {
  const [formData, setFormData] = useState({
    tripDo: "",
    tripDate: "",
    customerName: "",
    csd: "",
    vehicleNo: "",
    zone: "",
    productName: "",
    model: "",
    quantity: ""
  });
  const {user}=useAuth()

  useEffect(() => {
    if (gp && p) {
      setFormData({
        tripDo: gp.tripDo || "",
        tripDate: gp.tripDate?.slice(0, 10) || "",
        customerName: gp.customerName || "",
        csd: gp.csd || "",
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
    await axiosSecure.put(
      `/gate-pass/${gp._id}/product/${p._id}`,
      {
        productName: formData.productName,
        model: formData.model,
        quantity: Number(formData.quantity)
      }
    );

    // ⭐ gate pass main field update
    const res = await axiosSecure.patch(`/gate-pass/${gp._id}`, {
      tripDo: formData.tripDo,
      tripDate: formData.tripDate,
      customerName: formData.customerName,
      csd: formData.csd,
      vehicleNo: formData.vehicleNo,
      zone: formData.zone,
      currentUser: user?.displayName || user?.email
    });

    setGatePasses(prev =>
      prev.map(g => (g._id === gp._id ? res.data.data : g))
    );

    onClose();

  } catch (err) {
    console.error(err);
    alert("Update failed!");
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4 relative">
        <h3 className="text-lg font-bold mb-4">Edit Gate Pass</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            name="tripDo"
            placeholder="Trip Do"
            value={formData.tripDo}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="date"
            name="tripDate"
            value={formData.tripDate}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="customerName"
            placeholder="Customer"
            value={formData.customerName}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="csd"
            placeholder="CSD"
            value={formData.csd}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="vehicleNo"
            placeholder="Vehicle No"
            value={formData.vehicleNo}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="zone"
            placeholder="Zone"
            value={formData.zone}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="productName"
            placeholder="Product"
            value={formData.productName}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGatePassModal;