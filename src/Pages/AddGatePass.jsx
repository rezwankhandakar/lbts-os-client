
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import Swal from "sweetalert2";
import EditRecentGatePassModal from "../Component/EditRecentGatePassModal";

const AddGatePass = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [autoData, setAutoData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [recentGatePass, setRecentGatePass] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: { products: [{ productName: "", model: "", quantity: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  // Autocomplete handler
  const handleAutoSearch = async (fieldKey, field, value) => {
    if (!value) return;
    try {
      const res = await axiosSecure.get(`/autocomplete?field=${field}&search=${value}`);
      setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
      setActiveField(fieldKey);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch recent gate pass
  const fetchRecentGatePass = async () => {
    try {
      const res = await axiosSecure.get("/gate-pass?limit=1"); // recent 1
      setRecentGatePass(res.data.data?.[0] || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecentGatePass();
  }, []);

  // Add Gate Pass
  const onSubmit = async (data) => {
    try {
      const tripDateObj = new Date(data.tripDate);
      const payload = {
        ...data,
        currentUser: user.displayName,
        createdAt: new Date(),
        tripMonth: tripDateObj.getMonth() + 1,
        tripYear: tripDateObj.getFullYear(),
      };

      const res = await axiosSecure.post("/gate-pass", payload);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Gate Pass Added",
          text: "Gate pass added successfully ✅",
          timer: 1500,
          showConfirmButton: false,
        });
        reset();
        fetchRecentGatePass();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gate pass add failed ❌",
      });
    }
  };

  // Delete recent gate pass
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to Delete this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/gate-pass/${id}`);
          Swal.fire({
              title: "Deleted!",
              text: "Gate pass has been deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
        fetchRecentGatePass();
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", "Failed to delete gate pass.", "error");
      }
    }
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

 
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">

        {/* Add Gate Pass Form */}
        <div className="lg:col-span-4 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Add Gate Pass</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <input placeholder="Trip Do" {...register("tripDo", { required: true })} className="input border" />
              <input type="date" {...register("tripDate", { required: true })} className="input border" />
              <div className="relative">
                <input
                  placeholder="CSD"
                  {...register("csd", { required: true })}
                  onChange={(e) => handleAutoSearch("csd", "csd", e.target.value)}
                  className="input border w-full"
                />
                <AutoDropdown
                  fieldKey="csd"
                  autoData={autoData}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  setFormValue={(v) => setValue("csd", v)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  placeholder="Customer Name"
                  {...register("customerName", { required: true })}
                  onChange={(e) => handleAutoSearch("customerName", "customerName", e.target.value)}
                  className="input border w-full"
                />
                <AutoDropdown
                  fieldKey="customerName"
                  autoData={autoData}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  setFormValue={(v) => setValue("customerName", v)}
                />
              </div>

              <div className="relative">
                <input
                  placeholder="Vehicle No"
                  {...register("vehicleNo", { required: true })}
                  onChange={(e) => handleAutoSearch("vehicleNo", "vehicleNo", e.target.value)}
                  className="input border w-full"
                />
                <AutoDropdown
                  fieldKey="vehicleNo"
                  autoData={autoData}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  setFormValue={(v) => setValue("vehicleNo", v)}
                />
              </div>

              <div className="relative">
                <input
                  placeholder="Zone / PO"
                  {...register("zone", { required: true })}
                  onChange={(e) => handleAutoSearch("zone", "zone", e.target.value)}
                  className="input border w-full"
                />
                <AutoDropdown
                  fieldKey="zone"
                  autoData={autoData}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  setFormValue={(v) => setValue("zone", v)}
                />
              </div>
            </div>

            <div>
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 mt-2">
                  <div className="relative col-span-5">
                    <input
                      placeholder="Product"
                      {...register(`products.${index}.productName`)}
                      onChange={(e) =>
                        handleAutoSearch(`productName-${index}`, "productName", e.target.value)
                      }
                      className="input w-full border"
                    />
                    <AutoDropdown
                      fieldKey={`productName-${index}`}
                      autoData={autoData}
                      activeField={activeField}
                      setActiveField={setActiveField}
                      setFormValue={(v) => setValue(`products.${index}.productName`, v)}
                    />
                  </div>

                  <div className="relative col-span-5">
                    <input
                      placeholder="Model"
                      {...register(`products.${index}.model`)}
                      onChange={(e) =>
                        handleAutoSearch(`model-${index}`, "model", e.target.value)
                      }
                      className="input w-full border"
                    />
                    <AutoDropdown
                      fieldKey={`model-${index}`}
                      autoData={autoData}
                      activeField={activeField}
                      setActiveField={setActiveField}
                      setFormValue={(v) => setValue(`products.${index}.model`, v)}
                    />
                  </div>

                  <input
                    type="number"
                    placeholder="Qty"
                    {...register(`products.${index}.quantity`, { required: true })}
                    className="input col-span-2 border"
                  />
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => append({ productName: "", model: "", quantity: "" })}
                  className="btn btn-sm btn-outline"
                >
                  + Add Product
                </button>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(fields.length - 1)}
                    className="btn btn-sm btn-error"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Submit
            </button>
          </form>
        </div>

        {/* Recent Gate Pass */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4 h-fit">
          {recentGatePass ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">Recent Gate Pass</h3>
              <div className="border p-3 rounded bg-green-50">
                <p><strong>Trip Do:</strong> {recentGatePass.tripDo}</p>
                <p><strong>Trip Date:</strong> {recentGatePass.tripDate?.slice(0,10)}</p>
                <p><strong>Customer:</strong> {recentGatePass.customerName}</p>
                <p><strong>CSD:</strong> {recentGatePass.csd}</p>
                <p><strong>Vehicle No:</strong> {recentGatePass.vehicleNo}</p>
                <p><strong>Zone:</strong> {recentGatePass.zone}</p>

                {recentGatePass.products.map((prod, idx) => (
                  <div key={idx} className="mt-1 p-1 bg-white rounded border flex justify-between items-center">
                    <div>
                      <p><strong>Product:</strong> {prod.productName}</p>
                      <p><strong>Model:</strong> {prod.model}</p>
                      <p><strong>Qty:</strong> {prod.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(prod)}
                      className="btn btn-sm btn-outline bg-orange-400 text-white"
                    >
                      Edit
                    </button>
                  </div>
                ))}

                <p className="mt-2"><strong>Added by:</strong> {recentGatePass.currentUser}</p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDelete(recentGatePass._id)}
                    className="btn btn-sm btn-error w-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No recent gate pass</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedProduct && (
        <EditRecentGatePassModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          gp={recentGatePass}
          p={selectedProduct}
          axiosSecure={axiosSecure}
          refreshGatePass={fetchRecentGatePass} // 🔹 refresh after edit
        />
      )}
    </div>
  );
};

export default AddGatePass;