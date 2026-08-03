import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import HomeRedirect from "./pages/HomeRedirect";
import LandingPage from "./pages/LandingPage";
import Leaderboard from "./pages/Leaderboard";
import NoTeam from "./pages/NoTeam";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import SignIn from "./pages/SignIn";
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';


function App() {
  return (

    
    <Routes>
      //later we will add protected routes for the super admin dsshboard 

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute adminOnly={true} superAdminOnly={true}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
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