import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Authentication/Firebase.config";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Login handler
  const handleSignin = async (data) => {
    setLoading(true);
    try {
      await signInUser(data.email, data.password);
      toast.success("Login Successful 🎉");
      navigate("/");
    } catch (error) {
      toast.error("Invalid email or password!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler
  const handleForgotPassword = async () => {
    const email = watch("email");
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent ✅");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      {/* Overlay loader */}
      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20 rounded-2xl">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit(handleSignin)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">Email is required.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: true, minLength: 6 })}
                className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
              />
              {errors.password?.type === "required" && (
                <p className="text-xs text-red-500 mt-1">Password is required.</p>
              )}
              {errors.password?.type === "minLength" && (
                <p className="text-xs text-red-500 mt-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 flex items-center justify-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Extra links */}
          <div className="mt-4 text-center space-y-2">
            <p
              onClick={handleForgotPassword}
              className="text-sm text-gray-500 hover:text-primary cursor-pointer transition"
            >
              Forgot Password?
            </p>
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
