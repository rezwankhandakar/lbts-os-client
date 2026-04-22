
// ═══════════════════════════════════════════════════════════════════
// AuthProvider.jsx — Secure Firebase Authentication (v2)
// ═══════════════════════════════════════════════════════════════════
//
// FIXES IN THIS VERSION (Fix #12):
//   - Race condition guard: only the LATEST onAuthStateChanged callback
//     applies its result. Rapid-fire auth state changes (e.g., tab focus,
//     token refresh) no longer leave stale user in state.
//   - Unmount guard: component unmount no longer triggers setState warnings.
//   - Failed token exchange during mount → cleanly resolves to logged-out.
//
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
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

  // Race guard — only the most-recent auth callback's result is applied
  const latestAuthRequestId = useRef(0);
  // Unmount guard — stop setState after unmount
  const isMounted = useRef(true);

  // ─────────────────────────────────────────────────────────────
  // Token Management
  // ─────────────────────────────────────────────────────────────
  const saveToken = async (firebaseUser) => {
    if (!firebaseUser) {
      removeToken();
      return null;
    }

    try {
      const idToken = await firebaseUser.getIdToken(false);
      const res = await axios.post(
        `${BASE_URL}/jwt`,
        { idToken },
        { timeout: 15000 }
      );

      if (res.data?.success && res.data?.token) {
        localStorage.setItem('access-token', res.data.token);
        return res.data;
      }

      console.error('Unexpected /jwt response:', res.data);
      removeToken();
      return null;
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || err?.message;

      console.error(`Token exchange failed [${status} ${code || ''}]:`, message);

      if (status === 401 || status === 400) {
        removeToken();
      }
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
        await signOut(auth).catch(() => {});
        throw new Error('Registration succeeded but token exchange failed');
      }

      if (isMounted.current) setUser(res.user);
      return res;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await saveToken(res.user);

      if (!tokenResult) {
        await signOut(auth).catch(() => {});
        throw new Error('Login succeeded in Firebase but server rejected the session');
      }

      if (isMounted.current) setUser(res.user);
      return res;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      removeToken();
      await signOut(auth);
      if (isMounted.current) setUser(null);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const updateUserProfile = async (profile) => {
    await updateProfile(auth.currentUser, profile);
    if (isMounted.current) setUser({ ...auth.currentUser });
  };

  // ─────────────────────────────────────────────────────────────
  // Auth State Observer (FIX #12 — race-condition guarded)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Stamp this callback's request id; discard result if a newer
      // callback has started before our async work finishes.
      const myRequestId = ++latestAuthRequestId.current;

      if (currentUser) {
        const tokenResult = await saveToken(currentUser);

        // Check if we are still the latest request & component is mounted
        if (myRequestId !== latestAuthRequestId.current || !isMounted.current) {
          return; // Stale — newer callback took over, abort.
        }

        if (tokenResult) {
          setUser(currentUser);
        } else {
          removeToken();
          setUser(null);
        }
      } else {
        if (myRequestId !== latestAuthRequestId.current || !isMounted.current) {
          return;
        }
        removeToken();
        setUser(null);
      }

      if (isMounted.current) setLoading(false);
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Proactive App-JWT Refresh (every 6 days — JWT expires at 7d)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
    const interval = setInterval(async () => {
      if (auth.currentUser && isMounted.current) {
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