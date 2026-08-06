import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInGoogle, logout } from "../../services/auth";
import "./Hero.css";

export default function Hero() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {

        setError("");
        setLoading(true);

        try {

            const firebaseUser = await signInGoogle();

            if (!firebaseUser.email?.endsWith("@iitgn.ac.in")) {

                setError("Only IIT Gandhinagar accounts are allowed.");

                await logout();

                setLoading(false);

                return;
            }


            // Let HomeRedirect decide where to send the user
            navigate("/", { replace: true });


        } catch (err) {

            console.error(err);

            setError("Google sign-in failed. Please try again.");

        }

        setLoading(false);

    };


    return (

        <section className="hero">

            <div className="heroText">

                <h1>
                    Discover.
                    <br/>
                    Solve.
                    <br/>
                    Explore.
                </h1>


                <p>
                    Welcome to TEDxPedition —
                    a hybrid treasure hunt combining
                    puzzles, teamwork, QR exploration,
                    and innovation across the IIT Gandhinagar campus.
                </p>


                <button
                    className="loginBtn"
                    onClick={handleLogin}
                    disabled={loading}
                >

                    {loading
                        ? "Signing in..."
                        : "Sign in with Google"}

                </button>


                {error && (
                    <p className="hero-error">
                        {error}
                    </p>
                )}

            </div>

        </section>

    );

}