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

      // ✅ Update main challan
      await axiosSecure.patch(`/challan/${challan._id}`, {
        customerName: formData.customerName,
        address: formData.address,
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
      <div className="bg-white p-4 rounded shadow w-96">
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

          <hr />

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
              className="btn btn-sm btn-success">
              Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditRecentChallanModal;