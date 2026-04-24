import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { deleteUser, sendEmailVerification, signOut } from "firebase/auth";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { auth } from "../Authentication/Firebase.config";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUserProfile } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  // ─────────────────────────────────────────────────────────────
  // FIX #1 — Registration with rollback on any post-create failure
  // FIX #47 — Email verification email sent after DB save
  // ─────────────────────────────────────────────────────────────
  const handleRegistration = async (data) => {
    if (!data.photo?.[0]) {
      toast.error("Please upload a profile photo");
      return;
    }

    setLoading(true);
    let firebaseUserCreated = false;
    let createdUser = null;

    try {
      // Step 1: Firebase signup
      const res = await registerUser(data.email, data.password);
      firebaseUserCreated = true;
      createdUser = res.user;

      try {
        // Step 2: Upload photo
        const imgFormData = new FormData();
        imgFormData.append("image", data.photo[0]);
        const imageRes = await axios.post(`${API}/upload-image`, imgFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const photoURL = imageRes.data?.url;
        if (!photoURL) throw new Error("Photo upload failed — no URL returned");

        // Step 3: Update Firebase profile
        await updateUserProfile({ displayName: data.name, photoURL });

        // Step 4: Save to DB via /register (uses Firebase ID token directly —
        // no app JWT needed, so /jwt never needs to bypass email verification)
        const idToken = await createdUser.getIdToken();
        const dbRes = await axios.post(`${API}/register`, {
          idToken,
          displayName: data.name,
          photoURL,
        });

        if (!dbRes.data?.success) {
          throw new Error(dbRes.data?.message || "Failed to save user");
        }

        // Step 5: Send email verification
        try {
          await sendEmailVerification(createdUser);
        } catch (verErr) {
          console.warn("Could not send verification email (non-fatal):", verErr);
        }

        // Step 6: Sign user out — they must verify before logging in
        await signOut(auth);

        toast.success(
          "✅ Registration Successful! Please check your inbox and verify your email before logging in.",
          { duration: 6000 }
        );
        navigate("/login");
      } catch (innerErr) {
        console.error("Post-registration step failed:", innerErr);

        if (firebaseUserCreated && createdUser) {
          // Best-effort: remove from DB if Step 4 already saved it
          try {
            const idToken = await createdUser.getIdToken();
            await axios.delete(`${API}/users/self`, { headers: { Authorization: `Bearer ${idToken}` } });
          } catch (_) {}

          try {
            await deleteUser(createdUser);
          } catch (rollbackErr) {
            console.error("Firebase rollback failed:", rollbackErr);
            // Rollback failed — orphan account exists in Firebase.
            // Tell the user explicitly so they don't get stuck in a loop.
            toast.error(
              "Registration failed and we couldn't fully clean up. " +
              "Please contact support or try logging in — your account may already exist.",
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
      else if (error.code === "auth/weak-password") toast.error("❌ Password is too weak (min 6 chars)");
      else if (error.code === "auth/invalid-email") toast.error("❌ Invalid email address");
      else if (error.message?.includes("Photo upload")) toast.error("❌ Photo upload failed");
      else toast.error(error.message || "❌ Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {loading && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center rounded-2xl">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
          <p className="text-center text-xs text-gray-500 mb-6">
            You'll need to verify your email after signing up.
          </p>

          <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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