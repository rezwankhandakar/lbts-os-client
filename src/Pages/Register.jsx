
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { deleteUser, sendEmailVerification, signOut } from "firebase/auth";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { auth } from "../Authentication/Firebase.config";
import {
  FiPackage, FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiUploadCloud, FiCheckCircle
} from "react-icons/fi";

const STEPS = ["Account Info", "Profile Photo", "Set Password"];

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUserProfile } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleRegistration = async (data) => {
    if (!data.photo?.[0]) {
      toast.error("Please upload a profile photo");
      return;
    }
    setLoading(true);
    let firebaseUserCreated = false;
    let createdUser = null;

    try {
      const res = await registerUser(data.email, data.password);
      firebaseUserCreated = true;
      createdUser = res.user;

      try {
        const imgFormData = new FormData();
        imgFormData.append("image", data.photo[0]);
        const imageRes = await axios.post(`${API}/upload-image`, imgFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const photoURL = imageRes.data?.url;
        if (!photoURL) throw new Error("Photo upload failed — no URL returned");

        await updateUserProfile({ displayName: data.name, photoURL });

        const idToken = await createdUser.getIdToken();
        const dbRes = await axios.post(`${API}/register`, {
          idToken,
          displayName: data.name,
          photoURL,
        });

        if (!dbRes.data?.success) {
          throw new Error(dbRes.data?.message || "Failed to save user");
        }

        try {
          await sendEmailVerification(createdUser);
        } catch (verErr) {
          console.warn("Could not send verification email (non-fatal):", verErr);
        }

        await signOut(auth);

        toast.success(
          "✅ Registration Successful! Please verify your email before logging in.",
          { duration: 6000 }
        );
        navigate("/login");
      } catch (innerErr) {
        console.error("Post-registration step failed:", innerErr);

        if (firebaseUserCreated && createdUser) {
          try {
            const idToken = await createdUser.getIdToken();
            await axios.delete(`${API}/users/self`, { headers: { Authorization: `Bearer ${idToken}` } });
          } catch (_) {}

          try {
            await deleteUser(createdUser);
          } catch (rollbackErr) {
            console.error("Firebase rollback failed:", rollbackErr);
            toast.error(
              "Registration failed and we couldn't fully clean up. Please contact support.",
              { duration: 10000 }
            );
            setLoading(false);
            navigate("/login");
            return;
          }
        }
        throw innerErr;
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") toast.error("❌ Email already in use");
      else if (error.code === "auth/weak-password")   toast.error("❌ Password is too weak (min 6 chars)");
      else if (error.code === "auth/invalid-email")   toast.error("❌ Invalid email address");
      else if (error.message?.includes("Photo upload")) toast.error("❌ Photo upload failed");
      else toast.error(error.message || "❌ Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 " +
    "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col items-center justify-center p-12 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249,115,22,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/6 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-xs w-full space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <FiPackage className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                LBTS <span className="text-orange-500">OS</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                Logistics Operations System
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white leading-tight">
              Join the team.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                Get started today.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create your account to manage logistics operations, gate passes, challans and more.
            </p>
          </div>

          {/* Steps preview */}
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-orange-400">{i + 1}</span>
                </div>
                <span className="text-slate-300 text-sm">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <FiCheckCircle size={13} className="text-emerald-500" />
            Email verification required after sign-up
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiPackage className="text-white" size={18} />
            </div>
            <span className="text-xl font-black text-slate-900">
              LBTS <span className="text-orange-500">OS</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-black text-slate-900">Create your account</h2>
            <p className="text-slate-500 text-sm mt-1">
              You'll need to verify your email after signing up.
            </p>
          </div>

          {/* Overlay loader */}
          {loading && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
                <div className="w-10 h-10 border-3 border-t-orange-500 border-slate-200 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-700">Creating account...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register("name", { required: true })}
                  placeholder="Enter your full name"
                  className={inputBase}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">Name is required</p>}
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FiUser size={22} />
                    </div>
                  )}
                </div>

                {/* Upload area */}
                <label className="flex-1 flex flex-col items-center justify-center gap-1.5 px-4 py-3
                  border-2 border-dashed border-slate-200 rounded-xl cursor-pointer
                  hover:border-orange-300 hover:bg-orange-50/50 transition-all group">
                  <FiUploadCloud size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                  <span className="text-xs text-slate-500 group-hover:text-orange-600 font-medium text-center">
                    Click to upload photo
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    {...register("photo", { required: true })}
                    onChange={handleImagePreview}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.photo && <p className="text-xs text-red-500 mt-1 font-medium">Profile photo is required</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="you@company.com"
                  className={inputBase}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">Email is required</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true, minLength: 6 })}
                  placeholder="Minimum 6 characters"
                  className={`${inputBase} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.password?.type === "required" && (
                <p className="text-xs text-red-500 mt-1 font-medium">Password is required</p>
              )}
              {errors.password?.type === "minLength" && (
                <p className="text-xs text-red-500 mt-1 font-medium">Minimum 6 characters required</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600
                text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all
                active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Create Account <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-bold">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
            LBTS-OS · Secure Access Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
