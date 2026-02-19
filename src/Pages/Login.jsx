import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Authentication/Firebase.config";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { signInUser } = useAuth();

  const handleSignin = async (data) => {
    signInUser(data.email, data.password)
    .then(result =>{
      console.log(result)
      toast.success("Login Successful 🎉");
       navigate("/");
    })
  .catch((error) => {
  if (error.code === "auth/user-not-found") {
    toast.error("User not found");
  } else if (error.code === "auth/wrong-password") {
    toast.error("Wrong password");
  } else {
    toast.error("Login failed");
  }
});
  };

   
const handleForgaetPassword = () => {
  const email = watch("email");

  if (!email) {
    toast.error("Please enter your email first");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      toast.success("Password reset email sent ✅");
    })
    .catch((error) => {
      console.log(error);
      toast.error("Failed to send reset email");
    });
};



  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl rounded-2xl">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center mb-6 ">
            Welcome Back
          </h2>

         <form onSubmit={handleSubmit(handleSignin)}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-6">

                {/* Email */}
              <label className="label">Email</label>
              <input type="email" {...register('email', {
                required:
                  true
              })} className="input" placeholder="Email" />
              {errors.email?.type === "required" && <p
                className='text-red-500'>Email is Required</p>}

                {/* password */}
              <label className="label">Password</label>
              <input type="password" {...register('password', {
                required: true, minLength:6,
              })} className="input" placeholder="Password" />
              {
                errors.password?.type === 'required' && <p
                  className='text-red-500'>Password is Required.</p>
              }


              {
                errors.password?.type === 'minLength' && <p
                  className='text-red-500'> "Password must be at least 6 characters"</p>
              }


              <button className="btn btn-neutral mt-4">Login</button>
            </fieldset>
          </form>

          {/* Extra Links */}
          <div className="text-center mt-4 space-y-2">
            <p onClick={handleForgaetPassword} className="text-sm text-gray-500 hover:text-primary cursor-pointer">
              Forgot Password?
            </p>
            <p className="text-sm">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary cursor-pointer hover:underline">
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
