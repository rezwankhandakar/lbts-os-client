import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUserProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleRegistration = async (data) => {
    if (!data.photo[0]) {
      toast.error("Please upload a profile photo");
      return;
    }

    setLoading(true);
    try {
      // ✅ 1. Register user in Firebase
      await registerUser(data.email, data.password);

      // ✅ 2. Upload photo to imgbb
      const formData = new FormData();
      formData.append("image", data.photo[0]);
      const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;
      const imageRes = await axios.post(image_API_URL, formData);
      const photoURL = imageRes.data.data.url;

      // ✅ 3. Update Firebase user profile
      await updateUserProfile({ displayName: data.name, photoURL });

      // ✅ 4. Save user to own database
      const userInfo = { email: data.email, displayName: data.name, photoURL };
      const dbRes = await axiosSecure.post("/users", userInfo);
      if (dbRes.data.insertedId) {
        toast.success("✅ Registration Successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);

      // ✅ Firebase email already exists
      if (error.code === "auth/email-already-in-use") {
        toast.error("❌ Email already in use");
      } else if (error.code === "auth/weak-password") {
        toast.error("❌ Password is too weak");
      } else {
        toast.error("❌ Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center rounded-2xl">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
                placeholder="Enter Your Name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <input
                type="file"
                {...register("photo", { required: true })}
                onChange={handleImagePreview}
                className="file-input w-full"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-24 h-24 rounded-full mt-2 border border-gray-200 object-cover"
                />
              )}
              {errors.photo && <p className="text-xs text-red-500 mt-1">Profile photo is required</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
                placeholder="Enter Your Email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register("password", { required: true, minLength: 6 })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
                placeholder="Enter Your Password"
              />
              {errors.password?.type === "required" && (
                <p className="text-xs text-red-500 mt-1">Password is required</p>
              )}
              {errors.password?.type === "minLength" && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
