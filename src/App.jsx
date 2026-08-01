import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import HomeRedirect from "./pages/HomeRedirect";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import SignIn from "./pages/SignIn";
import Leaderboard from "./pages/Leaderboard";
import NoTeam from "./pages/NoTeam";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/home" element={<LandingPage />} />

      {/* Redirector logic based on auth role */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Auth Login page */}
      <Route path="/login" element={<SignIn />} />

      {/* Admin Panel (Admin Auth protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Participant Game Panel (Team Auth protected) */}
      <Route
        path="/participant"
        element={
          <ProtectedRoute>
            <ParticipantDashboard />
          </ProtectedRoute>
        }
      />

      {/* No Team registered page */}
      <Route path="/no-team" element={<NoTeam />} />

      {/* Public Live Leaderboard */}
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Fallback route back to root */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;