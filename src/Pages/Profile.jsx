import React from "react";
import useAuth from "../hooks/useAuth";
import { FiEdit } from "react-icons/fi";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-2xl">
        
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-2xl"></div>

        <div className="card-body items-center text-center relative">
          
          {/* Avatar */}
          <div className="-mt-20">
            <img
              src={user?.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mt-3">
            {user?.displayName || "User Name"}
          </h2>

          {/* Email */}
          <p className="text-gray-500">{user?.email}</p>


          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary rounded-lg flex items-center gap-2">
              <FiEdit /> Edit Profile
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
