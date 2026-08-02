import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
    const { user, adminData, teamData, loading } = useAuth();
    console.log("Protected Route");

console.log({
    loading,
    user,
    adminData,
    teamData,
    adminOnly,
    superAdminOnly
});

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

    if (superAdminOnly && adminData?.role !== "Super Admin") {
        return <Navigate to="/admin" replace />;
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