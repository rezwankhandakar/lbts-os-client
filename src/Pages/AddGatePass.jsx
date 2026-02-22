import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddGatePass = () => {
      const axiosSecure = useAxiosSecure();

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      products: [{ productName: "", model: "", }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });

// ✅ Submit with POST API
const onSubmit = async (data) => {
  try {
    const payload = {
      ...data,
      createdAt: new Date()
    };

    const res = await axiosSecure.post("/gate-pass", payload);

    if (res.data.insertedId) {
      toast.success("Gate Pass Added Successfully ✅");
      // Reset all fields
      reset({
        tripDo: "",
        tripDate: "",
        csd: "",
        customerName: "",
        vehicleNo: "",
        zone: "",
        products: [{ productName: "", model: "", }]
      });
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to add Gate Pass ❌");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Add Gate Pass</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Trip Do, Trip Date, CSD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Trip Do</label>
              <input
                type="text"
                placeholder="Enter Trip Do"
                {...register("tripDo", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.tripDo && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Trip Date</label>
              <input
                type="date"
                {...register("tripDate", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.tripDate && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">CSD</label>
              <input
                type="text"
                placeholder="Enter CSD"
                {...register("csd", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.csd && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
          </div>

          {/* Row 2: Customer Name, Vehicle No, Zone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="Enter Customer Name"
                {...register("customerName", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.customerName && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Vehicle No</label>
              <input
                type="text"
                placeholder="Enter Vehicle No"
                {...register("vehicleNo", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.vehicleNo && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Zone</label>
              <input
                type="text"
                placeholder="Enter Zone "
                {...register("zone", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded"
              />
              {errors.zone && <span className="text-xs text-red-500 mt-1">Required</span>}
            </div>
          </div>

          {/* Products: can add multiple rows */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Products</label>
{fields.map((item, index) => (
  <div key={item.id} className="grid grid-cols-12 gap-4 mt-2 items-end">
    
    {/* Product Name */}
    <input
      type="text"
      placeholder="Product Name"
      {...register(`products.${index}.productName`, { required: true })}
      className="input col-span-12 md:col-span-5"
    />

    {/* Model */}
    <input
      type="text"
      placeholder="Model"
      {...register(`products.${index}.model`, { required: true })}
      className="input col-span-8 md:col-span-5"
    />

    {/* Qty */}
    <input
      type="number"
      placeholder="Qty"
      {...register(`products.${index}.quantity`, { required: true })}
      className="input col-span-4 md:col-span-2"
    />
  </div>
))}

{/* Action buttons */}
<div className="flex gap-2 mt-3">
  <button
    type="button"
    onClick={() => append({ productName: "", model: "",})}
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
      Remove Last
    </button>
  )}
</div>
          </div>

          {/* Submit */}
          <div className="mt-4">
            <button type="submit" className="btn btn-primary w-full">
              Add Gate Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGatePass;
