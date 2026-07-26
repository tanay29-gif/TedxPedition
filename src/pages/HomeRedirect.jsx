import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomeRedirect() {

    const { user, adminData, loading } = useAuth();

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminData) {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/participant" replace />;
}

export default HomeRedirect;