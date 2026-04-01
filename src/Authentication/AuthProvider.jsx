// import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
// import React, { useEffect, useState } from 'react';
// import { auth } from './Firebase.config';
// import { AuthContext } from './AuthContext';

// const AuthProvider = ({children}) => {
//      const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);


// const registerUser = ( email, password)=>{
//     setLoading(true)
//     return createUserWithEmailAndPassword(auth, email, password)
//      .then(res => {
//       setUser(res.user);
//       return res;
//     });
// }


// const signInUser = (email,password)=>{
//     setLoading(true)
//     return signInWithEmailAndPassword(auth,email, password)
// }

// const logOut =()=>{
//     setLoading(true)
//     return signOut(auth)
// }


// const updateUserProfile = (profile)=>{
//   return updateProfile(auth.currentUser, profile)
//   .then(() => {
//       // 🔥 profile update হলে user state refresh
//       setUser({ ...auth.currentUser });
//     });
// }


//   // 🔹 Track Auth State
//   useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//     setUser(currentUser); // Firebase থেকে user set করা হচ্ছে
//     setLoading(false);    // এখন loading শেষ
//   });

//   return () => unsubscribe();
// }, []);

// // 🔹 Context value
//   const authInfo = {
//     user,
//     loading,
//     registerUser,
//     signInUser,
//     logOut,
//     updateUserProfile,
//   };


//     return (
//             <AuthContext.Provider value={authInfo}>
//                 {children}
//             </AuthContext.Provider>
//     );

// };

// export default AuthProvider;





// AuthProvider.jsx — existing code এর মধ্যে import add করো
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from './Firebase.config';
import { AuthContext } from './AuthContext';

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Token helper ──────────────────────────────────────────────────
  const saveToken = async (email) => {
    try {
      const res = await axios.post(`${BASE_URL}/jwt`, { email });
      localStorage.setItem('access-token', res.data.token);
    } catch (err) {
      console.error('Token save failed:', err);
    }
  };

  const removeToken = () => {
    localStorage.removeItem('access-token');
  };

  // ── Register — existing function, শুধু token add করো ─────────────
  const registerUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        setUser(res.user);
        await saveToken(email); // ← এটা add করো
        return res;
      });
  };

  // ── SignIn — existing function, শুধু token add করো ───────────────
  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        await saveToken(email); // ← এটা add করো
        return res;
      });
  };

  // ── LogOut — token remove করো ────────────────────────────────────
  const logOut = () => {
    setLoading(true);
    removeToken(); // ← এটা add করো
    return signOut(auth);
  };

  // ── onAuthStateChanged — existing, কোনো change নেই ───────────────
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);

    // ✅ user থাকলে token নাও, না থাকলে remove করো
    if (currentUser?.email) {
      await saveToken(currentUser.email);
    } else {
      removeToken();
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  // updateUserProfile — existing, কোনো change নেই
  const updateUserProfile = (profile) => {
    return updateProfile(auth.currentUser, profile)
      .then(() => {
        setUser({ ...auth.currentUser });
      });
  };

  const authInfo = {
    user, loading,
    registerUser, signInUser, logOut, updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;