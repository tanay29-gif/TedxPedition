import { useState } from 'react';
import { auth, googleProvider, db } from '../firebase/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; // Importing the CSS file

// Roles and team assignments are set up ahead of time by the admin in the
// `users` collection (one doc per person, keyed by their Firebase uid).
// Sign-in here just authenticates with Google, then looks up that doc to
// find out who this person is and where they should land.
const SignIn = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError(
          "Your account isn't registered yet. Ask your admin to add you before signing in."
        );
        setLoading(false);
        return;
      }

      const { role } = userSnap.data();

      if (!role) {
        setError('No role assigned to your account yet. Contact your admin.');
        setLoading(false);
        return;
      }

      navigate(`/${role}-dashboard`);
    } catch (error) {
      console.error('Error signing in: ', error);
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="signin-title">
          SIGN<span>IN</span>
        </h1>
        <p className="signin-subtitle">Ideas Worth Spreading</p>

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
