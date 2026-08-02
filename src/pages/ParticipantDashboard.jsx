import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { logout } from "../services/auth";
import { getHint } from "../services/firestore/hints";
import { markHintUsed, startStall } from "../services/firestore/progress";
import { getStallKey, getStallNumber, getStallProgressValue } from "../services/firestore/stallKeys";
import { getStallByOrder } from "../services/firestore/stalls";
import { getTeamByLeaderEmail, updateTeam } from "../services/firestore/teams";
import { updateActiveTeam } from "../services/realtime/activeTeams";

import HintDialog from "../components/HintDialog/HintDialog";
import CurrentStallCard from "../components/Participant/CurrentStallCard/CurrentStallCard";
import HintCard from "../components/Participant/HintCard/HintCard";
import ProgressTracker from "../components/Participant/ProgressTracker/ProgressTracker";
import TeamMembersCard from "../components/Participant/TeamMembersCard/TeamMembersCard";
import TeamQRCodeCard from "../components/Participant/TeamQRCodeCard/TeamQRCodeCard";
import TimeCard from "../components/Participant/TimeCard/TimeCard";
import QRScanner from "../components/QRScanner/QRScanner";
import TeamQR from "../components/TeamQR/TeamQR";
import ChallengePage from "./ChallengePage";
import FinalLocation from "./FinalLocation";
import FinishPage from "./FinishPage";
import WaitingForVerificationPage from "./WaitingForVerificationPage";

import "./ParticipantDashboard.css";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentStallMeta, setCurrentStallMeta] = useState(null);
  const [hintText, setHintText] = useState("");
  const [loading, setLoading] = useState(true);

  // Reusable Component states
  const [isTeamQROpen, setIsTeamQROpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load team profile and start listening for real-time changes
  useEffect(() => {
    if (!user?.email) return;

    let unsubscribeTeam = () => {};
    let unsubscribeProgress = () => {};

    const initListeners = async () => {
      try {
        const teamData = await getTeamByLeaderEmail(user.email);
        if (!teamData) {
          setLoading(false);
          return;
        }

        setTeam(teamData);

        // 1. Listen to Team updates in Realtime
        unsubscribeTeam = onSnapshot(doc(db, "teams", teamData.id), (docSnap) => {
          if (docSnap.exists()) {
            setTeam({ id: docSnap.id, ...docSnap.data() });
          }
        });

        // 2. Listen to Team Progress updates in Realtime
        unsubscribeProgress = onSnapshot(doc(db, "team_progress", teamData.id), (docSnap) => {
          if (docSnap.exists()) {
            setProgress(docSnap.data());
          } else {
            setProgress({});
          }
          setLoading(false);
        });

      } catch (err) {
        console.error("Error setting up real-time listeners:", err);
        setLoading(false);
      }
    };

    initListeners();

    return () => {
      unsubscribeTeam();
      unsubscribeProgress();
    };
  }, [user]);

  // Load Stall Metadata when currentStall changes
  useEffect(() => {
    const currentStallNum = getStallNumber(team?.currentStall);
    if (!currentStallNum) return;

    const fetchStallMeta = async () => {
      try {
        const stallMeta = await getStallByOrder(currentStallNum);
        setCurrentStallMeta(stallMeta);

        const stallProg = getStallProgressValue(progress, currentStallNum);
        if (stallProg?.hintUsed) {
          const hintDoc = await getHint(getStallKey(currentStallNum));
          setHintText(hintDoc?.hint || `Hint for Stall ${currentStallNum}`);
        } else {
          setHintText("");
        }
      } catch (err) {
        console.error("Error fetching stall metadata:", err);
      }
    };

    fetchStallMeta();
  }, [team?.currentStall, progress]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  // Participant scans a QR Code to unlock a stall
  const handleStallQRScan = async (scannedCode) => {
    setErrorMsg("");

    const expectedStallNum = getStallNumber(team?.currentStall);
    const scannedStallNum = getStallNumber(scannedCode);

    if (!expectedStallNum || !scannedStallNum || scannedStallNum !== expectedStallNum) {
      setErrorMsg(`Invalid Stall QR code. Your current assigned stall is Stall ${expectedStallNum ?? team?.currentStall}.`);
      return;
    }

    try {
      // 1. Record start in Firestore progress
      await startStall(team.id, expectedStallNum);

      // 2. Set activeTeam status to PLAYING in Realtime Database
      await updateActiveTeam(team.id, {
        currentStall: getStallKey(expectedStallNum),
        status: "PLAYING"
      });

      setIsScannerOpen(false);
    } catch (err) {
      console.error("Failed to start stall:", err);
      setErrorMsg("Error initiating stall in database. Please retry.");
    }
  };

  // Spend Hint Coin logic
  const handleUseHintConfirm = async () => {
    if (!team || team.coins <= 0) return;

    try {
      const newCoins = team.coins - 1;

      // 1. Deduct coin in teams document
      await updateTeam(team.id, { coins: newCoins });

      // 2. Mark hint used in progress document
      await markHintUsed(team.id, getStallNumber(team.currentStall));

      // 3. Fetch hint content
      const hintDoc = await getHint(getStallKey(team.currentStall));
      const text = hintDoc?.hint || `Solve the clue at the stall to move forward!`;
      setHintText(text);
      setIsHintOpen(false);
    } catch (err) {
      console.error("Error spending hint coin:", err);
      alert("Failed to spend hint coin. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <div className="spinner"></div>
        <h2>Loading your adventure...</h2>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="dashboard-error-screen glass-card glow-red">
        <h2>No Team Registered</h2>
        <p>Your account ({user?.email}) is not associated with any registered team for TEDxpedition.</p>
        <p>Please contact the event organizers at the registration desk to register your team.</p>
        <button onClick={handleLogout} className="btn btn-primary">
          Log Out
        </button>
      </div>
    );
  }

  const currentStallNum = getStallNumber(team.currentStall);
  const stallProgress = getStallProgressValue(progress, currentStallNum);
  
  // Game finished completely (all 7 stages done)
  if (currentStallNum > 7 || (currentStallNum === 7 && getStallProgressValue(progress, 7)?.status === "COMPLETED")) {
    return <FinishPage team={team} progress={progress} handleLogout={handleLogout} />;
  }

  // Active view routing based on game state
  // Stall 7 is Final Location stage
  if (currentStallNum === 7) {
    return <FinalLocation team={team} progress={progress} handleLogout={handleLogout} />;
  }

  const currentStallStatus = stallProgress?.status || "READY";

  // State: Finished playing, waiting for admin approval
  if (currentStallStatus === "VERIFYING") {
    return (
      <WaitingForVerificationPage
        team={team}
        stallNum={currentStallNum}
        stallProgress={stallProgress}
        handleLogout={handleLogout}
      />
    );
  }

  // State: Started playing, active challenge screen
  if (currentStallStatus === "PLAYING") {
    return (
      <ChallengePage
        team={team}
        progress={progress}
        stallNum={currentStallNum}
        stallProgress={stallProgress}
        stallMeta={currentStallMeta}
        hintText={hintText}
        onUseHintClick={() => setIsHintOpen(true)}
        handleLogout={handleLogout}
      />
    );
  }

  // State: Default dashboard / Reach stall Clue page (Not started yet)
  const hintUnlocked = !!hintText || !!stallProgress?.hintUsed;
  const statusLabel = currentStallStatus;
  const cardStatusClass = currentStallStatus === "PLAYING" ? "playing" : "waiting";

  return (
    <div className="participant-dashboard">
      <header className="dashboard-header">
        <div className="header-branding">
          <h2>TED<span>X</span>pedition</h2>
        </div>
        <div className="header-actions">
          <Link to="/test/leaderboard" className="btn btn-secondary leaderboard-btn">
            📊 Leaderboard
          </Link>
          <button onClick={handleLogout} className="btn btn-accent logout-btn">
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="team-status-grid">
          <TeamMembersCard team={team} />
          <HintCard
            coins={team.coins}
            hintUnlocked={hintUnlocked}
            hintText={hintText}
            onUnlockHint={() => setIsHintOpen(true)}
            loading={false}
          />
          <CurrentStallCard
            currentStall={team.currentStall}
            status={statusLabel}
            onScanQR={() => setIsScannerOpen(true)}
            gameStarted={currentStallStatus === "PLAYING"}
          />
        </section>

        <section className="glass-card active-stall-card glow-red pulsing-border">
          {errorMsg && <div className="scanner-error-box">⚠️ {errorMsg}</div>}

          <TimeCard
            startedAt={stallProgress?.startedAt}
            endedAt={stallProgress?.endedAt}
            status={currentStallStatus === "PLAYING" ? "PLAYING" : "WAITING"}
          />

          <ProgressTracker
            currentStall={getStallKey(currentStallNum)}
            progress={progress}
          />

          <TeamQRCodeCard
            teamId={team.teamId}
            teamName={team.teamName}
            status={cardStatusClass}
            onOpenQR={() => setIsTeamQROpen(true)}
          />
        </section>
      </main>

      {/* Dialog Modals */}
      {isScannerOpen && (
        <QRScanner
          title={`Scan Stall ${currentStallNum} QR`}
          placeholder={`Enter Stall Code (e.g. ${getStallKey(currentStallNum)})`}
          onScanSuccess={handleStallQRScan}
          onClose={() => {
            setIsScannerOpen(false);
            setErrorMsg("");
          }}
        />
      )}
      {isTeamQROpen && (
    <TeamQR
        team={team}
        onClose={() => setIsTeamQROpen(false)}
    />
)}


      <HintDialog
        isOpen={isHintOpen}
        coins={team.coins}
        onConfirm={handleUseHintConfirm}
        onClose={() => setIsHintOpen(false)}
      />
    </div>
  );
}