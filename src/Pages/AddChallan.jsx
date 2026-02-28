import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";
import Swal from "sweetalert2";

const AddChallan = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [autoData, setAutoData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [recentChallan, setRecentChallan] = useState(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      products: [{ productName: "", model: "", quantity: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  // 🔍 Autocomplete
const handleAutoSearch = async (fieldKey, field, value) => {
  if (!value) return;

  const res = await axiosSecure.get(
    `/autocomplete?collection=challan&field=${field}&search=${value}`
  );

  setAutoData((prev) => ({ ...prev, [fieldKey]: res.data }));
  setActiveField(fieldKey);
};
  // 📦 Fetch recent challan
  const fetchRecentChallan = async () => {
    try {
      const res = await axiosSecure.get("/challan/recent?limit=1");
      setRecentChallan(res.data.data?.[0] || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecentChallan();
  }, []);

  // ➕ Submit Challan
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        currentUser: user?.displayName,
        createdAt: new Date(),
      };

      const res = await axiosSecure.post("/challan", payload);

      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Challan Added",
          timer: 1500,
          showConfirmButton: false,
        });
        reset();
        fetchRecentChallan();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Failed to add challan", "error");
    }
  };

  // ❌ Delete Challan
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete?",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await axiosSecure.delete(`/challan/${id}`);
      fetchRecentChallan();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">

        {/* 📝 Form Section */}
        <div className="lg:col-span-4 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            Add Challan
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Customer Name"
                {...register("customerName", { required: true })}
                className="input border"
              />
              <input
                placeholder="Address"
                {...register("address", { required: true })}
                className="input border"
              />
              <input
                placeholder="Receiver Number"
                {...register("receiverNumber", { required: true })}
                className="input border"
              />
              <input
                placeholder="Zone"
                {...register("zone", { required: true })}
                onChange={(e) =>
                  handleAutoSearch("zone", "zone", e.target.value)
                }
                className="input border"
              />
            </div>

            {/* 📦 Products */}
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 bg-gray-50 p-2 rounded"
              >
                <div className="relative col-span-5">
                  <input
                    placeholder="Product"
                    {...register(`products.${index}.productName`)}
                    onChange={(e) =>
                      handleAutoSearch(
                        `productName-${index}`,
                        "productName",
                        e.target.value
                      )
                    }
                    className="input border w-full"
                  />
                  <AutoDropdown
                    fieldKey={`productName-${index}`}
                    autoData={autoData}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    setFormValue={(v) =>
                      setValue(`products.${index}.productName`, v)
                    }
                  />
                </div>

                <div className="relative col-span-5">
                  <input
                    placeholder="Model"
                    {...register(`products.${index}.model`)}
                    onChange={(e) =>
                      handleAutoSearch(
                        `model-${index}`,
                        "model",
                        e.target.value
                      )
                    }
                    className="input border w-full"
                  />
                  <AutoDropdown
                    fieldKey={`model-${index}`}
                    autoData={autoData}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    setFormValue={(v) =>
                      setValue(`products.${index}.model`, v)
                    }
                  />
                </div>

                <input
                  type="number"
                  placeholder="Qty"
                  {...register(`products.${index}.quantity`, {
                    required: true,
                  })}
                  className="input col-span-2 border"
                />
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  append({ productName: "", model: "", quantity: "" })
                }
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

            <button className="btn btn-primary w-full mt-4">
              Submit Challan
            </button>
          </form>
        </div>

        {/* 📄 Recent Challan */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4 h-fit">
          {recentChallan ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Recent Challan
              </h3>

              <div className="border p-3 rounded bg-green-50">
  <p><strong>Customer:</strong> {recentChallan.customerName}</p>
  <p><strong>Address:</strong> {recentChallan.address || "N/A"}</p>
  <p><strong>Receiver No:</strong> {recentChallan.receiverNumber || "N/A"}</p>
  <p><strong>Zone:</strong> {recentChallan.zone}</p>

  {recentChallan.products?.map((p, i) => (
    <div key={i} className="border p-2 mt-2 bg-white rounded">
      <p><span className="font-semibold">Product:</span> {p.productName}</p>
      <p><span className="font-semibold">Model:</span> {p.model}</p>
      <p><span className="font-semibold">Qty:</span> {p.quantity}</p>
    </div>
  ))}

  <p className="mt-2 text-sm">
    Added by: {recentChallan.currentUser}
  </p>

  <button
    onClick={() => handleDelete(recentChallan._id)}
    className="btn btn-sm btn-error w-full mt-2"
  >
    Delete
  </button>
</div>
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              No recent challan
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddChallan;