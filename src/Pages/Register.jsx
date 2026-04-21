// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Link, useNavigate } from "react-router";
// import toast from "react-hot-toast";
// import axios from "axios";
// import useAuth from "../hooks/useAuth";
// import useAxiosSecure from "../hooks/useAxiosSecure";

// const Register = () => {
//   const navigate = useNavigate();
//   const { registerUser, updateUserProfile } = useAuth();
//   const axiosSecure = useAxiosSecure();
//   const [loading, setLoading] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm();

//   const handleImagePreview = (e) => {
//     const file = e.target.files[0];
//     if (file) setPreviewImage(URL.createObjectURL(file));
//   };

//   const handleRegistration = async (data) => {
//     if (!data.photo[0]) {
//       toast.error("Please upload a profile photo");
//       return;
//     }

//     setLoading(true);
//     try {
//       // ✅ 1. Register user in Firebase
//       await registerUser(data.email, data.password);

//       // ✅ 2. Upload photo to imgbb
//       const imgFormData = new FormData();
//       imgFormData.append("image", data.photo[0]);
//       const imageRes = await axiosSecure.post("/upload-image", imgFormData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       const photoURL = imageRes.data.url;

//       // ✅ 3. Update Firebase user profile
//       await updateUserProfile({ displayName: data.name, photoURL });

//       // ✅ 4. Save user to own database
//       const userInfo = { email: data.email, displayName: data.name, photoURL };
//       const dbRes = await axiosSecure.post("/users", userInfo);
//       if (dbRes.data.insertedId) {
//         toast.success("✅ Registration Successful");
//         navigate("/");
//       }
//     } catch (error) {
//       console.error(error);

//       // ✅ Firebase email already exists
//       if (error.code === "auth/email-already-in-use") {
//         toast.error("❌ Email already in use");
//       } else if (error.code === "auth/weak-password") {
//         toast.error("❌ Password is too weak");
//       } else {
//         toast.error("❌ Registration Failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       {/* Loader overlay */}
//       {loading && (
//         <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center rounded-2xl">
//           <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
//         </div>
//       )}

//       <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl relative z-10">
//         <div className="card-body p-8">
//           <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
//             Create Account
//           </h2>

//           <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//               <input
//                 type="text"
//                 {...register("name", { required: true })}
//                 className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
//                 placeholder="Enter Your Name"
//               />
//               {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
//             </div>

//             {/* Photo */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
//               <input
//                 type="file"
//                 {...register("photo", { required: true })}
//                 onChange={handleImagePreview}
//                 className="file-input w-full"
//               />
//               {previewImage && (
//                 <img
//                   src={previewImage}
//                   alt="preview"
//                   className="w-24 h-24 rounded-full mt-2 border border-gray-200 object-cover"
//                 />
//               )}
//               {errors.photo && <p className="text-xs text-red-500 mt-1">Profile photo is required</p>}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input
//                 type="email"
//                 {...register("email", { required: true })}
//                 className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
//                 placeholder="Enter Your Email"
//               />
//               {errors.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <input
//                 type="password"
//                 {...register("password", { required: true, minLength: 6 })}
//                 className="input w-full border-gray-300 focus:border-primary focus:ring focus:ring-primary/30 rounded-lg"
//                 placeholder="Enter Your Password"
//               />
//               {errors.password?.type === "required" && (
//                 <p className="text-xs text-red-500 mt-1">Password is required</p>
//               )}
//               {errors.password?.type === "minLength" && (
//                 <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
//               )}
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
//                   Registering...
//                 </>
//               ) : (
//                 "Register"
//               )}
//             </button>
//           </form>

//           <p className="text-center text-sm mt-4 text-gray-600">
//             Already have an account?{" "}
//             <Link to="/login" className="text-primary hover:underline font-medium">
//               Login
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;






import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { deleteUser, sendEmailVerification, signOut } from "firebase/auth";
import useAuth from "../hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { auth } from "../Authentication/Firebase.config";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUserProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
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
        const imageRes = await axiosSecure.post("/upload-image", imgFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const photoURL = imageRes.data?.url;
        if (!photoURL) throw new Error("Photo upload failed — no URL returned");

        // Step 3: Update Firebase profile
        await updateUserProfile({ displayName: data.name, photoURL });

        // Step 4: Save to DB
        const dbRes = await axiosSecure.post("/users", {
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
        // Rollback on failure
        console.error("Post-registration step failed:", innerErr);
        if (firebaseUserCreated && createdUser) {
          try {
            await deleteUser(createdUser);
            console.log("Rolled back Firebase user due to failure");
          } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
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