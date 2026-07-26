import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

import AdminDashboard from "./pages/AdminDashboard";
import HomeRedirect from "./pages/HomeRedirect";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import SignIn from "./pages/SignIn";

import ProtectedRoute from "./components/ProtectedRoute";
import FirestoreTest from "./pages/FirestoreTest";
import ActiveTeamTest from "./tests/ActiveTeamTest";
import AdminTest from "./tests/AdminTest";
import EventStatusTest from "./tests/EventStatusTest";
import HintTest from "./tests/HintTest";
import LeaderboardTest from "./tests/LeaderboardTest";
import ProgressTest from "./tests/ProgressTest";
import QRTest from "./tests/QRTest";
import StallTest from "./tests/StallTest";
import TeamTest from "./tests/TeamTest";
function App() {

    return (


        <Routes>
             <Route
    path="/home"
    element={<LandingPage />}
/>


            <Route
    path="/test/event-status"
    element={<EventStatusTest />}
/>


            <Route
    path="/test/active-team"
    element={<ActiveTeamTest />}
/>
            // testing the CRUD operations for the leaderboard collection in realtime database

            <Route
    path="/test/leaderboard"
    element={<LeaderboardTest />}
/>


            <Route

    path="/test/admin"

    element={<AdminTest />}

/>



            <Route

    path="/test/qr"

    element={<QRTest />}

/>

            <Route

    path="/test/hints"

    element={<HintTest />}

/>

            <Route

    path="/test/stalls"

    element={<StallTest />}

/>
//testing the CRUD operations for the progress collection in firestore
            <Route
    path="/test/progress"
    element={<ProgressTest />}
/>
            //testing the CRUD operations for the team collection in firestore
            <Route
    path="/test/team"
    element={<TeamTest />}
/>
            <Route
    path="/firestore-test"
    element={<FirestoreTest />}
/>

            <Route
                path="/"
                element={<HomeRedirect />}
            />

            <Route
                path="/login"
                element={<SignIn />}
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/participant"
                element={
                    <ProtectedRoute>
                        <ParticipantDashboard />
                    </ProtectedRoute>
                }
            />

        </Routes>

    );

}

export default App;