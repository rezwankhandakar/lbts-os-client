

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { Link, } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { registerUser,updateUserProfile } = useAuth();


  const handleRegistration = async (data) => {
    const profileImg = data.photo[0]

    registerUser(data.email, data.password)
    .then(result=>{
      console.log(result.user)
      toast.success("Register Successful 🎉");

      // store the image in form data//
      const formData = new FormData()
      formData.append('image', profileImg)

      // send the photo to store and get the url from imgbb//
      const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`
      axios.post(image_API_URL, formData)
      .then(res =>{
        console.log('after imgage upload', res.data.data.url)

        // update user profile to firebase//
        const userProfile = {
          displayName : data.name,
          photoURL : res.data.data.url
        }
        updateUserProfile(userProfile)
        .then(()=>{
          console.log('user profile update done')
          
        })
        .catch(error =>{
          console.log(error)
        })

      })
    })
    .catch(error=>{
      console.log(error)
    })
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl rounded-2xl">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(handleRegistration)}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-6">
              


                        {/* Name */}
              <label className="label">Name</label>
              <input type="text" {...register('name', {
                required:
                  true
              })} className="input" placeholder="Enter Your Name" />
              {errors.email?.type === "required" && <p
                className='text-red-500'>Name is Required</p>}

                {/* Photo */}
              <label className="label">Photo</label>
              <input type="file" {...register('photo', {
              })} className="file-input" placeholder="Your Photo" />


                {/* email */}
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


              <button className="btn btn-neutral mt-4">Register</button>
            </fieldset>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

