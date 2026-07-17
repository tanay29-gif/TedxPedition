import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './auth/signin.jsx';
import ProtectedRoute from './component/ProctectedRoute.jsx';

import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
const AdminDashboard = () => <h1>Welcome Admin</h1>;
const ParticipantDashboard = () => <h1>Welcome Participant</h1>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        
        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute requiredRole="super-admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/participant-dashboard" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantDashboard />
          </ProtectedRoute>
        } />

        {/* Redirect root to signin if not logged in */}
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/unauthorized" element={<h1>You do not have access to this page.</h1>} />
      </Routes>
    </Router>
  );
}

export default App;