import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; // Importing the CSS file

const SignIn = () => {
  const [role, setRole] = useState('participant');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Firestore Reference
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let finalRole = role;

      if (!userSnap.exists()) {
        // Create new user with selected role
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role,
          createdAt: new Date()
        });
      }else{
        await updateDoc(userRef, {
        role: role,
        lastLogin: new Date() // Optional: track when they last signed in
      });
      }

      // Redirect to specific dashboard
      navigate(`/${role}-dashboard`);
      
    } catch (error) {
      console.error("Error signing in: ", error);
      alert("Sign-in failed. Please check your Firebase configuration.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="signin-title">
          SIGN<span>IN</span>
        </h1>
        <p className="signin-subtitle">Ideas Worth Spreading</p>

        <div className="input-group">
          <label className="input-label">Select your Role</label>
          <select 
            className="role-select" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="participant">Participant</option>
          </select>
        </div>

        <button className="google-btn" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;