import { useState } from 'react';
import { auth, googleProvider, db } from '../firebase/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; // Importing the CSS file

const SignIn = () => {
  const [role, setRole] = useState('participant');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');

    // Participants must enter a team code so we can link them to a team doc
    if (role === 'participant' && !teamCode.trim()) {
      setError('Please enter your Team Code.');
      return;
    }

    try {
      let teamId = null;

      if (role === 'participant') {
        // Look up the team by its code
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('teamCode', '==', teamCode.trim().toUpperCase()));
        const teamSnap = await getDocs(q);

        if (teamSnap.empty) {
          setError('No team found with that code. Check with your admin.');
          return;
        }
        teamId = teamSnap.docs[0].id;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Firestore Reference
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role,
        ...(teamId && { teamId }),
      };

      if (!userSnap.exists()) {
        // Create new user with selected role
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date()
        });
      } else {
        await updateDoc(userRef, {
          ...userData,
          lastLogin: new Date() // Optional: track when they last signed in
        });
      }

      // Redirect to specific dashboard
      navigate(`/${role}-dashboard`);

    } catch (error) {
      console.error("Error signing in: ", error);
      setError('Sign-in failed. Please check your Firebase configuration.');
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

        {role === 'participant' && (
          <div className="input-group">
            <label className="input-label">Team Code</label>
            <input
              className="role-select"
              type="text"
              placeholder="e.g. TEDX07"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
            />
          </div>
        )}

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <button className="google-btn" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;