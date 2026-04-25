
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { sendPasswordResetEmail, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../Authentication/Firebase.config";
import useAuth from "../hooks/useAuth";
import { FiPackage, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";

const FEATURES = [
  "Real-time shipment & gate pass tracking",
  "Challan and delivery management",
  "Vendor database & trip summaries",
  "Financial accounts dashboard",
];

const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationPending, setVerificationPending] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const handleSignin = async (data) => {
    setLoading(true);
    setVerificationPending(null);
    try {
      await signInUser(data.email, data.password);
      toast.success("Login successful 🎉");
      navigate("/");
    } catch (error) {
      const code = error?.response?.data?.code;
      if (code === "EMAIL_NOT_VERIFIED") {
        setVerificationPending(data.email);
        toast.error("Please verify your email before logging in");
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email    = verificationPending || watch("email");
    const password = watch("password");
    if (!email || !password) { toast.error("Enter email and password to resend"); return; }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      await signOut(auth);
      toast.success("✅ Verification email sent. Please check your inbox.");
    } catch (err) {
      toast.error("Could not send verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = watch("email");
    if (!email) { toast.error("Please enter your email first"); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent ✅");
    } catch (error) {
      toast.error("Failed to send reset email");
    }
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all";

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 flex-col items-center justify-center p-12 bg-slate-950 relative overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249,115,22,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/6 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm w-full space-y-10">
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

          {/* Headline */}
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight">
              Manage your logistics<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                smarter & faster.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              One platform for gate passes, challans, vendors, deliveries and financial insights.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                <FiCheckCircle size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {/* Version badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v3.2 · Live System</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-8 bg-white">
        <div className="w-full max-w-md space-y-7">

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
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Verification banner */}
          {verificationPending && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-1">
                📧 Email not verified
              </p>
              <p className="text-xs text-amber-700 mb-2">
                Check your inbox for <strong>{verificationPending}</strong>
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-xs font-semibold text-amber-700 underline hover:text-amber-900"
              >
                Resend verification email
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleSignin)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register("email", { required: true })}
                  className={inputBase}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-medium">Email is required.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", { required: true, minLength: 6 })}
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
                <p className="text-xs text-red-500 mt-1 font-medium">Password is required.</p>
              )}
              {errors.password?.type === "minLength" && (
                <p className="text-xs text-red-500 mt-1 font-medium">At least 6 characters required.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600
                text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all
                active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-bold">
              Create account
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
            LBTS-OS · Secure Access Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
