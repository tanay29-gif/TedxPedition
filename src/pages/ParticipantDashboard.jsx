import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";
import { getTeamByLeaderEmail } from "../services/firestore/teams";
import { startStall, getProgress, markHintUsed } from "../services/firestore/progress";
import { getStallByOrder } from "../services/firestore/stalls";
import { updateActiveTeam } from "../services/realtime/activeTeams";
import { getHint } from "../services/firestore/hints";
import { updateTeam } from "../services/firestore/teams";

import Timer from "../components/Timer/Timer";
import HintDialog from "../components/HintDialog/HintDialog";
import QRScanner from "../components/QRScanner/QRScanner";

import ChallengePage from "./ChallengePage";
import WaitingForVerificationPage from "./WaitingForVerificationPage";
import FinalLocation from "./FinalLocation";
import FinishPage from "./FinishPage";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [activeHintMessage, setActiveHintMessage] = useState("");
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
    if (!team?.currentStall) return;

    const fetchStallMeta = async () => {
      try {
        const stallMeta = await getStallByOrder(team.currentStall);
        setCurrentStallMeta(stallMeta);

        // Fetch hint text if already used
        const stallProg = progress?.[`stall${team.currentStall}`];
        if (stallProg?.hintUsed) {
          const hintDoc = await getHint(`STALL0${team.currentStall}`);
          setHintText(hintDoc?.hint || `Hint for Stall ${team.currentStall}`);
        } else {
          setHintText("");
        }
      } catch (err) {
        console.error("Error fetching stall metadata:", err);
      }
    };

    fetchStallMeta();
  }, [team?.currentStall, progress?.[`stall${team?.currentStall}`]?.hintUsed]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  // Participant scans a QR Code to unlock a stall
  const handleStallQRScan = async (scannedCode) => {
    setErrorMsg("");
    // Expecting QR code value to be STALL01, STALL02, etc. or URL ending with it
    let stallId = scannedCode.trim().toUpperCase();
    if (stallId.includes("STALL")) {
      const match = stallId.match(/STALL0?([1-7])/);
      if (match) {
        stallId = `STALL0${match[1]}`;
      }
    }

    const expectedStallId = `STALL0${team.currentStall}`;

    if (stallId !== expectedStallId) {
      setErrorMsg(`Invalid Stall QR code. Your current assigned stall is Stall ${team.currentStall}.`);
      return;
    }

    try {
      // 1. Record start in Firestore progress
      await startStall(team.id, team.currentStall);

      // 2. Set activeTeam status to PLAYING in Realtime Database
      await updateActiveTeam(team.id, {
        currentStall: team.currentStall,
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
      await markHintUsed(team.id, team.currentStall);

      // 3. Fetch hint content
      const hintDoc = await getHint(`STALL0${team.currentStall}`);
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

  const currentStallNum = team.currentStall;
  const stallProgress = progress?.[`stall${currentStallNum}`];
  
  // Game finished completely (all 7 stages done)
  if (currentStallNum > 7 || (currentStallNum === 7 && progress?.stall7?.completed)) {
    return <FinishPage team={team} progress={progress} handleLogout={handleLogout} />;
  }

  // Active view routing based on game state
  // Stall 7 is Final Location stage
  if (currentStallNum === 7) {
    return <FinalLocation team={team} progress={progress} handleLogout={handleLogout} />;
  }

  // Stall 1-6 playing states
  const hasStarted = !!stallProgress?.startedAt;
  const hasEnded = !!stallProgress?.endedAt;
  const isVerified = !!stallProgress?.completed;

  // State: Finished playing, waiting for admin approval
  if (hasStarted && hasEnded && !isVerified) {
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
  if (hasStarted && !hasEnded) {
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
  const defaultClue = currentStallMeta?.clue || "Locate the stall on your campus map to start the challenge.";

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
          <div className="glass-card team-profile-card">
            <h3>Team Profile</h3>
            <div className="profile-details">
              <div className="detail-item">
                <span className="label">Team Name:</span>
                <span className="value text-highlight">{team.teamName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Team ID:</span>
                <span className="value font-mono">{team.teamId}</span>
              </div>
              {team.members && (
                <div className="detail-item members-item">
                  <span className="label">Members:</span>
                  <ul className="members-list">
                    {team.members.map((m, idx) => (
                      <li key={idx}>👤 {m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card stat-metric-card glow-red">
            <h3>Hint Coins</h3>
            <div className="metric-display">
              <span className="metric-icon">🪙</span>
              <span className="metric-value">{team.coins}</span>
            </div>
            <p className="metric-desc">Available to unlock clues at active stalls.</p>
          </div>

          <div className="glass-card stat-metric-card">
            <h3>Current Score</h3>
            <div className="metric-display">
              <span className="metric-icon">🏆</span>
              <span className="metric-value">{team.totalScore} pts</span>
            </div>
            <p className="metric-desc">Leaderboard position updates in real-time.</p>
          </div>
        </section>

        <section className="glass-card active-stall-card glow-red pulsing-border">
          <div className="stall-card-header">
            <span className="badge">STALL {currentStallNum} OF 6</span>
            <h2>Active Stall: {currentStallMeta?.name || `Stall ${currentStallNum}`}</h2>
          </div>

          <div className="stall-clue-box">
            <h4>📍 Destination Clue</h4>
            <p className="clue-text">{defaultClue}</p>
          </div>

          {errorMsg && <div className="scanner-error-box">⚠️ {errorMsg}</div>}

          <div className="stall-action-box">
            <button onClick={() => setIsScannerOpen(true)} className="btn btn-primary start-stall-btn">
              📷 Scan Stall QR Code to Start
            </button>
            <p className="action-hint">Reach the stall location and scan the host QR to start the timer.</p>
          </div>
        </section>
      </main>

      {/* Dialog Modals */}
      {isScannerOpen && (
        <QRScanner
          title={`Scan Stall ${currentStallNum} QR`}
          placeholder={`Enter Stall Code (e.g. STALL0${currentStallNum})`}
          onScanSuccess={handleStallQRScan}
          onClose={() => {
            setIsScannerOpen(false);
            setErrorMsg("");
          }}
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