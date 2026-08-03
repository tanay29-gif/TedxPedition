import { onValue, ref } from "firebase/database";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveTeamsTable from "../components/Admin/ActiveTeamsTable/ActiveTeamsTable";
import AdminHeader from "../components/Admin/AdminHeader/AdminHeader";
import DashboardStats from "../components/Admin/DashboardStats/DashboardStats";
import LeaderboardPreview from "../components/Admin/LeaderboardPreview/LeaderboardPreview";
import ScanCard from "../components/Admin/ScanCard/ScanCard";
import TeamScoringPanel from "../components/Admin/TeamScoringPanel/TeamScoringPanel";
import QRScanner from "../components/QRScanner/QRScanner";
import { useAuth } from "../context/AuthContext";
import { db, realtimeDb } from "../firebase/firebase";
import { logout } from "../services/auth";
import { getProgress, verifyStall, unlockNextStall, finishStall } from "../services/firestore/progress";
import { getStallKey, getStallProgressValue } from "../services/firestore/stallKeys";
import { getTeamById } from "../services/firestore/teams";
import { calculateBonus } from "../services/scoring";
//for using the real time database 
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, adminData } = useAuth();
  const navigate = useNavigate();
  //for the leaderboard preview
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Selected Stall Admin State
  const [selectedStallNum, setSelectedStallNum] = useState(1);
  const [activeTeamsList, setActiveTeamsList] = useState({});
  const [teamsMetadata, setTeamsMetadata] = useState({});
  const [loading, setLoading] = useState(true);

  // QR Scanning and Team Selection States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamProgress, setSelectedTeamProgress] = useState(null);
  const [selectedTeamStallProgress, setSelectedTeamStallProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Score Form States
  const [scoreInput, setScoreInput] = useState("100");
  const [bonusInput, setBonusInput] = useState("0");
  const [penaltyInput, setBonusPenalty] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  //for fetching the leaderboard data from the real time database
  useEffect(() => {

    const leaderboardRef = ref(realtimeDb, "leaderboard");

    const unsubscribe = onValue(leaderboardRef, (snapshot) => {

        if(snapshot.exists()){

            const leaderboard = Object.entries(snapshot.val()).map(

                ([teamId, data]) => ({

                    id: teamId,

                    ...data

                })

            );

            setLeaderboardData(leaderboard);

        }

        else{

            setLeaderboardData([]);

        }

    });

    return () => unsubscribe();

}, []);



  // Set default stall from admin profile
  useEffect(() => {
    if (adminData?.stallAssigned) {
      // Expecting stallAssigned to be like "STALL02" or 2
      const match = String(adminData.stallAssigned).match(/STALL0?([1-7])/);
      if (match) {
        setSelectedStallNum(Number(match[1]));
      } else if (typeof adminData.stallAssigned === "number") {
        setSelectedStallNum(adminData.stallAssigned);
      }
    }
  }, [adminData]);

  // Listen to Active Teams from RTDB in Real-time
  useEffect(() => {
    const activeTeamsRef = ref(realtimeDb, "activeTeams");
    const unsubscribe = onValue(activeTeamsRef, (snapshot) => {
      if (snapshot.exists()) {
        setActiveTeamsList(snapshot.val());
      } else {
        setActiveTeamsList({});
      }
      setLoading(false);
    });

    // Fetch team metadata once (IDs to Names mapping)
    const fetchTeamsMetadata = async () => {
      try {
        const teamsColl = collection(db, "teams");
        const snap = await getDocs(teamsColl);
        const meta = {};
        snap.forEach((doc) => {
          meta[doc.id] = doc.data();
        });
        setTeamsMetadata(meta);
      } catch (err) {
        console.error("Error fetching teams metadata:", err);
      }
    };
    fetchTeamsMetadata();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const normalizeTeamId = (scannedCode) => {
    if (typeof scannedCode === "string") {
      const trimmed = scannedCode.trim();
      if (!trimmed) return "";

      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && parsed.id) {
          return String(parsed.id).trim().toUpperCase();
        }
      } catch {
        // Fall back to treating the raw string as a team ID.
      }

      return trimmed.toUpperCase();
    }

    if (typeof scannedCode === "object" && scannedCode !== null) {
      return String(scannedCode.id || "").trim().toUpperCase();
    }

    return "";
  };

  // Admin scans a Team QR code to open scoring
  const handleTeamQRScan = async (scannedCode) => {
    console.log("QR Scanned:", scannedCode);
    setErrorMsg("");

    let teamId = normalizeTeamId(scannedCode);

    if (!teamId) {
      setErrorMsg("Invalid Team QR.");
      return;
    }

    // Parse teamId in case full QR URL is scanned
    if (teamId.includes("TEAM")) {
      const match = teamId.match(/TEAM0?([0-9]+)/);
      if (match) {
        teamId = `TEAM${match[1].padStart(3, "0")}`; // Normalizes TEAM001
      }
    }

    try {
      const teamData = await getTeamById(teamId);
      if (!teamData) {
        setErrorMsg("Team not found. Please check the QR code / ID.");
        return;
      }

      await loadTeamScoringData(teamData);
      setIsScannerOpen(false);
    } catch (err) {
      console.error("Error finding scanned team:", err);
      setErrorMsg("Error communicating with database.");
    }
  };

  const loadTeamScoringData = async (teamData) => {
    setErrorMsg("");
    try {
      const progressData = await getProgress(teamData.id);
      const stallKey = getStallKey(selectedStallNum);
      const stallProg = getStallProgressValue(progressData, selectedStallNum);

      if (!stallProg) {
        setErrorMsg(`Stall ${selectedStallNum} has not been unlocked or started by this team.`);
        return;
      }

      setSelectedTeam(teamData);
      setSelectedTeamProgress(progressData);
      setSelectedTeamStallProgress(stallProg);
      
      // Calculate bonus based on the participant's completed timeTaken
      const timeTaken = stallProg.timeTaken || 0;
      const systemBonus = calculateBonus(timeTaken);

      // Default score values
      setScoreInput("100");
      setBonusInput(String(systemBonus));
      setBonusPenalty("0");
      setRemarks("");
    } catch (err) {
      console.error("Failed to load scoring details:", err);
      setErrorMsg("Failed to load team progress details.");
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || submitting) return;
    setSubmitting(true);

    try {
      // 1. Enforce finishStall if not already finished (failsafe)
      let currentStallProg = selectedTeamStallProgress;
      if (!currentStallProg.endedAt) {
        await finishStall(selectedTeam.id, selectedStallNum);
        // Reload fresh progress so we have endedAt & timeTaken
        const progressData = await getProgress(selectedTeam.id);
        currentStallProg = getStallProgressValue(progressData, selectedStallNum);
      }

      const baseStallScore = Number(scoreInput) || 0;
      const penaltyDeduction = Number(penaltyInput) || 0;

      // 2. Call verifyStall (saves score, remarks, verifiedBy, and status COMPLETED)
      await verifyStall(selectedTeam.id, selectedStallNum, {
        baseScore: baseStallScore,
        penalty: penaltyDeduction,
        remarks: remarks,
        verifiedBy: user.uid
      });

      // 3. Unlock next stall (calculates totals, updates team/RTDB leaderboard/activeTeam)
      await unlockNextStall(selectedTeam.id, selectedStallNum);

      alert("Score saved and verified successfully!");
      setSelectedTeam(null);
      setSelectedTeamProgress(null);
      setSelectedTeamStallProgress(null);

    } catch (err) {
      console.error("Error submitting admin score:", err);
      alert("Failed to submit score. Please check connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const currentStallKey = getStallKey(selectedStallNum);

  const waitingTeams = Object.values(activeTeamsList).filter(
    team =>
        team.currentStall === currentStallKey &&
        team.status === "VERIFYING"
).length;

const playingTeams = Object.values(activeTeamsList).filter(
    team =>
        team.currentStall === currentStallKey &&
        team.status === "PLAYING"
).length;

// Placeholder until we implement analytics/history
const verifiedTeams = 0;
  return (
    <div className="admin-dashboard">
   <AdminHeader
    adminData={adminData}
    user={user}
    onLogout={handleLogout}
/>
<DashboardStats
    stallNumber={selectedStallNum}
    waitingTeams={waitingTeams}
    playingTeams={playingTeams}
    verifiedTeams={verifiedTeams}
/>
      <main className="admin-content">
        {/* Stall selector header */}
        
        {selectedTeam ? (

    <TeamScoringPanel
        selectedTeam={selectedTeam}
        selectedTeamStallProgress={selectedTeamStallProgress}

        score={scoreInput}
        setScore={setScoreInput}

        bonus={bonusInput}
        setBonus={setBonusInput}

        penalty={penaltyInput}
        setPenalty={setBonusPenalty}

        remarks={remarks}
        setRemarks={setRemarks}

        submitting={submitting}

        onSubmit={handleScoreSubmit}
    />

) : (

    <>

        <section className="admin-teams-grid">

            <ScanCard
                errorMsg={errorMsg}
                onScan={() => setIsScannerOpen(true)}
            />

            <ActiveTeamsTable
                loading={loading}
                activeTeamsList={activeTeamsList}
                teamsMetadata={teamsMetadata}
                selectedStallNum={selectedStallNum}
                onScoreTeam={loadTeamScoringData}
            />

        </section>

        <LeaderboardPreview
            leaderboardData={leaderboardData}
        />

    </>

)}
      </main>

      {isScannerOpen && (
        <QRScanner
          title={`Scan Team QR (Stall ${selectedStallNum})`}
          placeholder="Enter Team ID (e.g. TEAM001)"
          onScanSuccess={handleTeamQRScan}
          onClose={() => {
            setIsScannerOpen(false);
            setErrorMsg("");
          }}
        />
      )}
    </div>
  );
}