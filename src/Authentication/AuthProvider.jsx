// ═══════════════════════════════════════════════════════════════════
// AuthProvider.jsx — Secure Firebase Authentication
// ═══════════════════════════════════════════════════════════════════
//
// CHANGES FROM OLD VERSION:
//   - saveToken() now sends Firebase ID TOKEN (cryptographic proof),
//     not just email (which was spoofable)
//   - Fixed race condition: user state is set ONLY AFTER token is saved
//   - Better error handling: failed token = signed out (no orphan sessions)
//   - Auto token refresh: firebase ID tokens auto-refresh every hour
//
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from './Firebase.config';
import { AuthContext } from './AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error('❌ VITE_API_URL not set in .env — API calls will fail');
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // Token Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Exchange Firebase ID token for our app JWT.
   * Called after login/register and on auth state changes.
   *
   * @param {FirebaseUser} firebaseUser - from firebase/auth
   * @returns {Promise<object|null>} app JWT response or null
   */
  const saveToken = async (firebaseUser) => {
    if (!firebaseUser) {
      removeToken();
      return null;
    }

    try {
      // Get a fresh Firebase ID token (auto-refreshes if needed).
      // This is a SIGNED token (Google's private key) — cannot be forged.
      const idToken = await firebaseUser.getIdToken(/* forceRefresh */ false);

      // Exchange with our server for an app JWT
      const res = await axios.post(
        `${BASE_URL}/jwt`,
        { idToken },
        { timeout: 15000 } // 15s timeout
      );

      if (res.data?.success && res.data?.token) {
        localStorage.setItem('access-token', res.data.token);
        return res.data;
      }

      // Unexpected response shape
      console.error('Unexpected /jwt response:', res.data);
      removeToken();
      return null;
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || err?.message;

      console.error(`Token exchange failed [${status} ${code || ''}]:`, message);

      // Token invalid/expired → clear local token
      if (status === 401 || status === 400) {
        removeToken();
      }
      // Don't re-throw; let the caller's flow continue
      return null;
    }
  };

  const removeToken = () => {
    localStorage.removeItem('access-token');
  };

  // ─────────────────────────────────────────────────────────────
  // Auth Actions
  // ─────────────────────────────────────────────────────────────

  const registerUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const tokenResult = await saveToken(res.user);

      if (!tokenResult) {
        // Token exchange failed despite successful Firebase registration.
        // Sign them out to avoid orphan state.
        await signOut(auth).catch(() => {});
        throw new Error('Registration succeeded but token exchange failed');
      }

      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await saveToken(res.user);

      if (!tokenResult) {
        // Firebase said "logged in" but server rejected. Sign out and fail.
        await signOut(auth).catch(() => {});
        throw new Error('Login succeeded in Firebase but server rejected the session');
      }

      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      removeToken();
      await signOut(auth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profile) => {
    await updateProfile(auth.currentUser, profile);
    // Firebase user object is mutated in place; we trigger re-render
    setUser({ ...auth.currentUser });
  };

  // ─────────────────────────────────────────────────────────────
  // Auth State Observer (runs once on mount)
  // ─────────────────────────────────────────────────────────────
  //
  // FIX FOR ISSUE #32 (race condition):
  //   OLD: setUser(currentUser) fires FIRST, then saveToken → components
  //        start API calls before token is ready → 401 → logged out.
  //   NEW: saveToken completes FIRST, then setUser → no race.
  //
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await saveToken(currentUser);
        if (tokenResult) {
          setUser(currentUser);
        } else {
          removeToken();
          setUser(null);
        }
      } else {
        removeToken();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Proactive App-JWT Refresh (every 6 days)
  // ─────────────────────────────────────────────────────────────
  // Our app JWT expires in 7d. Refresh at day 6 to avoid surprise logout
  // during an active session.
  useEffect(() => {
    if (!user) return;

    const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await saveToken(auth.currentUser);
      }
    }, SIX_DAYS);

    return () => clearInterval(interval);
  }, [user]);

  // ─────────────────────────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────────────────────────
  const authInfo = {
    user,
    loading,
    registerUser,
    signInUser,
    logOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;