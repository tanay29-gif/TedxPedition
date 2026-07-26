import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {

    const { user, adminData, loading } = useAuth();

    // Wait until authentication check is complete
    if (loading) {
        return <h2>Loading...</h2>;
    }

    // User is not logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // someone is logged in but is not an admin.
    if (adminOnly && !adminData) {
        return <Navigate to="/participant" replace />;
    }

    // User is allowed to access the page
    return children;
}

export default ProtectedRoute;