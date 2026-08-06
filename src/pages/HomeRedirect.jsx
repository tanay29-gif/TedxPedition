import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomeRedirect() {
    const { user, adminData, teamData, loading } = useAuth();

    if (loading) {
        return (
            <div className="dashboard-loading-screen">
                <div className="spinner"></div>
                <h2>Loading credentials...</h2>
            </div>
        );
    }
    if (!user) {
    return <Navigate to="/" replace />;
    }

    if (adminData) {
        if (
            adminData.role === "Super Admin" ||
            adminData.role === "stall_admin"
        ) {
            return <Navigate to="/super-admin" replace />;
        }

        return <Navigate to="/admin" replace />;
    }

    if (teamData) {
        return <Navigate to="/participant" replace />;
    }

    return <Navigate to="/no-team" replace />;
}
export default HomeRedirect;