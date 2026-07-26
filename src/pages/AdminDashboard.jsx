import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";


function AdminDashboard() {

    const { user, adminData } = useAuth();
    const navigate = useNavigate();
     async function handleLogout() {

    await logout();

    navigate("/", { replace: true });

}

    return (

        <div>

            <h1>Admin Dashboard</h1>

            <hr />

            <h2>Welcome {adminData?.name}</h2>

            <p><strong>Email:</strong> {user?.email}</p>

            <p><strong>Role:</strong> {adminData?.role}</p>

            <p><strong>Assigned Stall:</strong> {adminData?.stallAssigned}</p>
            <button onClick={handleLogout}>
                Logout
            </button>


        </div>

    );

}

export default AdminDashboard;