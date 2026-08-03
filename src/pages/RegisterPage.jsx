import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverTimestamp, setDoc, doc, getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { logout, signInGoogle } from "../services/auth";
import "./SignIn.css";

function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [signedInUser, setSignedInUser] = useState(null);
    const [formData, setFormData] = useState({
        teamName: "",
        member1: "",
        member2: "",
        member3: ""
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleGoogleSignIn() {
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

            const existingTeamQuery = query(collection(db, "teams"), where("leaderEmail", "==", firebaseUser.email));
            const existingTeamSnapshot = await getDocs(existingTeamQuery);

            if (!existingTeamSnapshot.empty) {
                setLoading(false);
                navigate("/thank-you", { replace: true });
                return;
            }

            setSignedInUser(firebaseUser);
            setSuccess(`Signed in as ${firebaseUser.email}`);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Google sign-in failed. Please try again.");
            setLoading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!signedInUser) {
            setError("Please sign in with Google first.");
            return;
        }

        if (!formData.teamName.trim() || !formData.member1.trim() || !formData.member2.trim() || !formData.member3.trim()) {
            setError("Please fill in all team details.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const existingTeamQuery = query(collection(db, "teams"), where("leaderEmail", "==", signedInUser.email));
            const existingTeamSnapshot = await getDocs(existingTeamQuery);

            if (!existingTeamSnapshot.empty) {
                setLoading(false);
                navigate("/thank-you", { replace: true });
                return;
            }

            // 2. Check if Team Name is taken
            const nameQuery = query(collection(db, "teams"), where("teamName", "==", formData.teamName.trim()));
            const nameSnapshot = await getDocs(nameQuery);

            if (!nameSnapshot.empty) {
                setError("A team with this name already exists. Please choose another name.");
                setLoading(false);
                return;
            }


            const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
            const timeStamp = Date.now().toString().slice(-6);
            const teamId = `TEAM-${shortId}-${timeStamp}`;

            const teamMembers = [formData.member1.trim(), formData.member2.trim(), formData.member3.trim()];
            const existingQuery = query(collection(db, "teams"), where("teamName", "==", formData.teamName.trim()));
            const existingSnapshot = await getDocs(existingQuery);

            if (!existingSnapshot.empty) {
                setError("A team with this name already exists. Please choose another name.");
                setLoading(false);
                return;
            }

            await setDoc(doc(db, "teams", teamId), {
                teamId,
                teamName: formData.teamName.trim(),
                leaderEmail: signedInUser.email,
                // leaderName: signedInUser.displayName || signedInUser.email,
                coins: 3,
                currentStall: "",
                totalScore: 0,
                totalTime: 0,
                members: teamMembers,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            const sheetData = {
                teamId: teamId,
                teamName: formData.teamName.trim(),
                leaderEmail: signedInUser.email,
                member1: formData.member1.trim(),
                member2: formData.member2.trim(),
                member3: formData.member3.trim()
            };

            // Replace with your actual Apps Script Web App URL
            const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

            // Use 'no-cors' if you face issues, but 'cors' is preferred if supported
            fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // Crucial for Apps Script redirects
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sheetData),
            });


            setLoading(false);
            navigate("/thank-you", { replace: true });
        } catch (err) {
            console.error(err);
            setError("Registration failed. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="signin-page">
            <div className="signin-card">
                <span className="signin-pill">TEDx Pedition</span>
                <h1>Register your team</h1>
                <p>
                    Sign in with your IITGN Google account first, then submit your team name and the three member names.
                </p>

                <hr className="signin-divider" />

                <button className="signin-button" onClick={handleGoogleSignIn} disabled={loading}>
                    {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                {success && <div className="signin-success">{success}</div>}
                {error && <div className="signin-error">{error}</div>}

                <form className="signin-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="teamName">Team Name</label>
                        <input
                            id="teamName"
                            name="teamName"
                            value={formData.teamName}
                            onChange={handleChange}
                            placeholder="Enter team name"
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="input-group">
                            <label htmlFor="member1">Member 1 Full Name</label>
                            <input
                                id="member1"
                                name="member1"
                                value={formData.member1}
                                onChange={handleChange}
                                placeholder="Full name"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="member2">Member 2 Full Name</label>
                            <input
                                id="member2"
                                name="member2"
                                value={formData.member2}
                                onChange={handleChange}
                                placeholder="Full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="member3">Member 3 Full Name</label>
                        <input
                            id="member3"
                            name="member3"
                            value={formData.member3}
                            onChange={handleChange}
                            placeholder="Full name"
                            required
                        />
                    </div>

                    <button className="signin-button" type="submit" disabled={loading || !signedInUser}>
                        {loading ? "Registering..." : "Register Team"}
                    </button>
                </form>

                {/* <div className="signin-form">
                    <Link to="/login" className="signin-button" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
                        Back to login
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default RegisterPage;
