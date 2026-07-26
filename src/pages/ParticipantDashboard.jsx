import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";


function ParticipantDashboard() {

    const { user } = useAuth();
    const navigate = useNavigate();
    async function handleLogout() {

    await logout();

    navigate("/", { replace: true });

}


    return (

        <div>

            <h1>Participant Dashboard</h1>

            <hr />

            <h2>Welcome {user?.displayName}</h2>

            <p>{user?.email}</p>
             <button onClick={handleLogout}>
                Logout
            </button>

        </div>

    );

}

export default ParticipantDashboard;