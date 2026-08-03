import { useNavigate } from "react-router-dom";
import { logout, signInGoogle } from "../services/auth";

function SignIn() {

    const navigate = useNavigate();

    async function handleLogin() {

        try {

            const firebaseUser = await signInGoogle();

            if (!firebaseUser.email.endsWith("@iitgn.ac.in")) {

                alert("Only IIT Gandhinagar accounts are allowed.");

                await logout();

                return;
            }

            // Go to HomeRedirect
            navigate("/", { replace: true });

        } catch (error) {

            console.error(error);

        }

    }

    return (
        <div>
            <h1>TEDxPedition</h1>

            <button onClick={handleLogin}>
                Sign in with Google
            </button>
        </div>
    );
}

export default SignIn;