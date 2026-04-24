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

      // 403 errors (e.g. EMAIL_NOT_VERIFIED, account suspended) must reach
      // the caller so it can show the correct UI. Re-throw with the original
      // response attached so Login.jsx can read error?.response?.data?.code.
      if (status === 403) {
        throw err;
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
      // No saveToken or setUser here — newly created users have unverified
      // emails. onAuthStateChanged will fire but skip them (emailVerified=false).
      // Register.jsx handles everything: photo upload, DB save, signOut.
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      let tokenResult;
      try {
        tokenResult = await saveToken(res.user);
      } catch (tokenErr) {
        // saveToken re-throws 403 (EMAIL_NOT_VERIFIED, etc.) — sign the user
        // out of Firebase so they're not in a half-logged-in state, then
        // propagate the original error so Login.jsx gets error?.response?.data?.code.
        await signOut(auth).catch(() => {});
        throw tokenErr;
      }

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
    // Force Firebase to flush its internal cache so getters return the new
    // values immediately. Without reload(), auth.currentUser.displayName may
    // still return the old value right after updateProfile() resolves.
    await auth.currentUser.reload();
    if (isMounted.current) setUser(auth.currentUser);
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
        // Skip saveToken for unverified emails — /jwt will 403 them anyway,
        // and during registration Register.jsx will signOut() immediately after.
        // Trying saveToken here causes a race: the 403 re-throw becomes an
        // unhandled error inside the observer callback.
        if (!currentUser.emailVerified) {
          if (myRequestId !== latestAuthRequestId.current || !isMounted.current) return;
          // Treat as logged-out until they verify — no app JWT issued
          removeToken();
          setUser(null);
          if (isMounted.current) setLoading(false);
          return;
        }

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
  // Session-expired handler (fired by useAxiosSecure on 401)
  // Cleanly signs out so PrivateRoute redirects to /login —
  // no hard reload, React state and unsaved form data preserved
  // for components that guard against it.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleExpired = () => {
      removeToken();
      signOut(auth).catch(() => {});
      if (isMounted.current) setUser(null);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Proactive App-JWT Refresh
  // ─────────────────────────────────────────────────────────────
  // JWT expires at 7d. We refresh when the token is >= 5 days old.
  // Two triggers:
  //   1. setInterval every 6h — catches active tabs reliably
  //   2. visibilitychange — catches tabs that were inactive/suspended
  //      and missed the interval entirely (common on mobile and laptops
  //      that sleep). On tab focus we decode the token age from its
  //      iat claim and refresh only if needed — no unnecessary calls.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    function getTokenAgeMs() {
      const token = localStorage.getItem('access-token');
      if (!token) return Infinity;
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return Date.now() - payload.iat * 1000;
      } catch {
        return Infinity;
      }
    }

    async function maybeRefresh() {
      if (!auth.currentUser || !isMounted.current) return;
      if (getTokenAgeMs() >= FIVE_DAYS_MS) {
        await saveToken(auth.currentUser);
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') maybeRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    const interval = setInterval(maybeRefresh, SIX_HOURS_MS);
    maybeRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
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