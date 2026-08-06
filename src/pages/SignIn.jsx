import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { serverTimestamp, setDoc, doc, getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { logout, signInGoogle } from "../services/auth";
import "./SignIn.css";

function SignIn() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleLogin() {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const firebaseUser = await signInGoogle();

            if (!firebaseUser.email?.endsWith("@iitgn.ac.in")) {
                setError("Only IIT Gandhinagar accounts are allowed.");
                await logout();
                setLoading(false);
                return;
            }

            setSuccess(`Signed in as ${firebaseUser.email}`);
            setLoading(false);
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            setError("Google sign-in failed. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="signin-page">
            <div className="signin-card">
                <span className="signin-pill">TEDx Pedition</span>
                <h1>Welcome back</h1>
                <p>
                    Sign in with your IITGN Google account to continue to the event experience.
                </p>

                <hr className="signin-divider" />

                <button className="signin-button" onClick={handleLogin} disabled={loading}>
                    {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                {success && <div className="signin-success">{success}</div>}
                {error && <div className="signin-error">{error}</div>}

                {/* <div className="signin-form">
                    <Link to="/register" className="signin-button" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
                        Register a team
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default SignIn;