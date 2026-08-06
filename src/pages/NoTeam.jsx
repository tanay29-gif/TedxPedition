import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";
import "./NoTeam.css";

export default function NoTeam() {
      const { teamData, adminData, loading } = useAuth();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // If data arrives while on this page, rescue the user
        if (!loading) {
            if (adminData) navigate("/admin");
            else if (teamData) navigate("/participant");
        }
    }, [teamData, adminData, loading, navigate]);

    if (loading) return <div>Loading...</div>;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="noteam-page">
      <header className="noteam-header">
        <h2>TED<span>X</span>pedition</h2>
      </header>

      <main className="noteam-content">
        <div className="glass-card noteam-card glow-red">
          <span className="noteam-icon">🚫👥</span>
          <h2>No Team Registered</h2>
          <p>
            Your account (<strong>{user?.email}</strong>) is not associated with any registered team.
          </p>
          <div className="noteam-instruction-box">
            <p>To participate in the TEDxpedition treasure hunt, please visit the registration desk to register your team and leader email.</p>
          </div>
          <button onClick={handleLogout} className="btn btn-primary logout-btn">
            Sign Out / Switch Account
          </button>
        </div>
      </main>
    </div>
  );
}
