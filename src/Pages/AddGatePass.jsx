
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import AutoDropdown from "../Component/AutoDropdown";

const AddGatePass = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [autoData, setAutoData] = useState({});
  const [activeField, setActiveField] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: { products: [{ productName: "", model: "", quantity: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  // Generic autocomplete handler
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

  // Submit
  const onSubmit = async (data) => {
    try {
      // const payload = { ...data, currentUser: user.displayName, createdAt: new Date() };
      const tripDateObj = new Date(data.tripDate); // Date object বানানো
const payload = {
  ...data,
  currentUser: user.displayName,
  createdAt: new Date(),
  tripMonth: tripDateObj.getMonth() + 1, // JS month 0-indexed, তাই +1
  tripYear: tripDateObj.getFullYear(),
};
      const res = await axiosSecure.post("/gate-pass", payload);
      if (res.data.insertedId) {
        toast.success("Gate Pass Added Successfully ✅");
        reset();
      }
    } catch (err) {
      toast.error("Failed ❌");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Add Gate Pass</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1 */}
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

          {/* Row 2 */}
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
                placeholder="Zone"
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

          {/* Products */}
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
    </div>
  );
};

export default AddGatePass;