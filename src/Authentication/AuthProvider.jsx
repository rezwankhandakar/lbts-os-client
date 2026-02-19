import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from './Firebase.config';
import { AuthContext } from './AuthContext';

const AuthProvider = ({children}) => {
     const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


const registerUser = ( email, password)=>{
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password)
}


const signInUser = (email,password)=>{
    setLoading(true)
    return signInWithEmailAndPassword(auth,email, password)
}

const logOut =()=>{
    setLoading(true)
    return signOut(auth)
}


const updateUserProfile = (profile)=>{
  return updateProfile(auth.currentUser, profile)
}


  // 🔹 Track Auth State
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser); // Firebase থেকে user set করা হচ্ছে
    setLoading(false);    // এখন loading শেষ
  });

  return () => unsubscribe();
}, []);

// 🔹 Context value
  const authInfo = {
    user,
    loading,
    registerUser,
    signInUser,
    logOut,
    updateUserProfile,
  };


    return (
            <AuthContext.Provider value={authInfo}>
                {children}
            </AuthContext.Provider>
    );

};

export default AuthProvider;