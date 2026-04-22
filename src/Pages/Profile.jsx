
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../Authentication/Firebase.config";
import useAuth from "../hooks/useAuth";
import useRole from "../hooks/useRole";
import { FiUser, FiMail, FiShield, FiLock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// ═══════════════════════════════════════════════════════════════════
// FIX #46 — Profile page with password change
// ═══════════════════════════════════════════════════════════════════
// - Shows current user info (email, role, status, email-verified badge)
// - Password change via Firebase `updatePassword()` with re-authentication
// - Resend verification email option
// ═══════════════════════════════════════════════════════════════════

const Profile = () => {
  const { user } = useAuth();
  const { role, status, vendorName } = useRole();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirmation do not match");
    }
    if (newPassword === currentPassword) {
      return toast.error("New password must be different from current");
    }

    setChanging(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error("Not logged in");

      // Step 1: Reauthenticate (Firebase requires this before sensitive ops)
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Step 2: Update password
      await updatePassword(currentUser, newPassword);

      toast.success("✅ Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPwdForm(false);
    } catch (err) {
      console.error("Password change failed:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("❌ Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        toast.error("❌ Password is too weak");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("❌ Please log out and log in again, then retry");
      } else {
        toast.error(err.message || "Password change failed");
      }
    } finally {
      setChanging(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (!auth.currentUser) throw new Error("Not logged in");
      await sendEmailVerification(auth.currentUser);
      toast.success("✅ Verification email sent");
    } catch (err) {
      console.error(err);
      toast.error("Could not send verification email");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=fff&color=f97316`}
              alt=""
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=fff&color=f97316`;
              }}
              className="w-16 h-16 rounded-full ring-4 ring-white/40 object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{user.displayName || "User"}</h2>
              <p className="text-white/80 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Info rows */}
          <InfoRow icon={<FiMail />} label="Email" value={user.email} />
          <InfoRow icon={<FiUser />} label="Name" value={user.displayName || "—"} />
          <InfoRow icon={<FiShield />} label="Role" value={<span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase">{role || "—"}</span>} />
          <InfoRow icon={<FiShield />} label="Status" value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
              status === "approved" ? "bg-green-50 text-green-700"
              : status === "pending" ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
            }`}>
              {status || "—"}
            </span>
          } />
          {vendorName && <InfoRow icon={<FiUser />} label="Vendor" value={vendorName} />}

          {/* Email verification status */}
          <InfoRow
            icon={user.emailVerified ? <FiCheckCircle className="text-green-600" /> : <FiAlertCircle className="text-amber-600" />}
            label="Email Verified"
            value={
              user.emailVerified ? (
                <span className="text-green-700 text-xs font-medium">Verified ✓</span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  className="text-xs text-orange-600 hover:underline font-medium"
                >
                  Not verified — Resend verification email
                </button>
              )
            }
          />
        </div>
      </div>

      {/* Password change card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowPwdForm(!showPwdForm)}
          className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="flex items-center gap-3 text-gray-800 font-semibold">
            <FiLock className="text-orange-500" />
            Change Password
          </span>
          <span className="text-gray-400 text-sm">{showPwdForm ? "▲" : "▼"}</span>
        </button>

        {showPwdForm && (
          <form onSubmit={handleChangePassword} className="p-5 border-t border-gray-100 space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input w-full border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 rounded-lg"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 rounded-lg"
                autoComplete="new-password"
              />
              <p className="text-[10px] text-gray-500 mt-1">At least 6 characters</p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 rounded-lg"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={changing}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {changing ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="flex items-center gap-2 text-gray-600 text-sm">
      <span className="text-orange-500">{icon}</span>
      {label}
    </span>
    <span className="text-gray-800 text-sm font-medium text-right">{value}</span>
  </div>
);

export default Profile;
