import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, adminData, teamData, loading } = useAuth();

    if (loading) {
        return (
            <div className="dashboard-loading-screen">
                <div className="spinner"></div>
                <h2>Verifying permissions...</h2>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && !adminData) {
        return <Navigate to="/participant" replace />;
    }

    if (!adminOnly && !teamData && !adminData) {
        return <Navigate to="/no-team" replace />;
    }

    return children;
}

export default ProtectedRoute;