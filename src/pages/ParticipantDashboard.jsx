import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { logout } from "../services/auth";
import { getHint } from "../services/firestore/hints";
import { markHintUsed } from "../services/firestore/progress";
import {
  getStallKey,
  getStallNumber,
  getStallProgressValue,
} from "../services/firestore/stallKeys";
import { getStallByOrder, getStallById } from "../services/firestore/stalls";
import { getTeamByLeaderEmail, updateTeam } from "../services/firestore/teams";
// import { loadClue } from "../services/clues/clueLoader";
import {
  validateScannedStall,
  startMission,
  finishMission,
} from "../services/stalls/stallService";
import { subscribeEventStatus } from "../services/event/eventService";

import HintDialog from "../components/HintDialog/HintDialog";
import CurrentStallCard from "../components/Participant/CurrentStallCard/CurrentStallCard";
import HintCard from "../components/Participant/HintCard/HintCard";
import ProgressTracker from "../components/Participant/ProgressTracker/ProgressTracker";
import TeamMembersCard from "../components/Participant/TeamMembersCard/TeamMembersCard";
import TeamQRCodeCard from "../components/Participant/TeamQRCodeCard/TeamQRCodeCard";
import TimeCard from "../components/Participant/TimeCard/TimeCard";
import QRScanner from "../components/QRScanner/QRScanner";
import TeamQR from "../components/TeamQR/TeamQR";
import ValidationDialog from "../components/Participant/ValidationDialog/ValidationDialog";
import ChallengePage from "./ChallengePage";
import FinalLocation from "./FinalLocation";
import FinishPage from "./FinishPage";
import TravelPage from "../components/Participant/TravelPage";
// import WaitingForVerificationPage from "./WaitingForVerificationPage";

import "./ParticipantDashboard.css";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentStallMeta, setCurrentStallMeta] = useState(null);
  const [currentClue, setCurrentClue] = useState(null);
  const [hintText, setHintText] = useState("");
  const [loading, setLoading] = useState(true);

  // Reusable Component states
  const [isTeamQROpen, setIsTeamQROpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [eventState, setEventState] = useState(null);

  useEffect(() => {
    const unsubscribeEvent = subscribeEventStatus((statusData) => {
      setEventState(statusData);
    });
    return () => unsubscribeEvent();
  }, []);

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
        console.log("Team Data:", teamData);
        setTeam(teamData);

        // 1. Listen to Team updates in Realtime
        unsubscribeTeam = onSnapshot(
          doc(db, "teams", teamData.id),
          (docSnap) => {
            if (docSnap.exists()) {
              setTeam({ id: docSnap.id, ...docSnap.data() });
            }
          },
        );

        // 2. Listen to Team Progress updates in Realtime
        unsubscribeProgress = onSnapshot(
          doc(db, "team_progress", teamData.id),
          (docSnap) => {
            if (docSnap.exists()) {
              setProgress(docSnap.data());
            } else {
              setProgress({});
            }
            setLoading(false);
          },
        );
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

  // Load Stall Metadata & Clue when currentStall changes
  useEffect(() => {
    const currentStallId = team?.currentStall;

    if (!currentStallId) return;

    const fetchStallMeta = async () => {
      try {
        const stallMeta = await getStallById(currentStallId);
        setCurrentStallMeta(stallMeta);

        // const clueData = await getClue(currentStallId);

        setCurrentClue({
          title: stallMeta.clueTitle,
          description: stallMeta.clueDescription,
          clue: stallMeta.clue,
          location: stallMeta.location,
        });
        const stallProg = getStallProgressValue(progress, currentStallId);

        if (stallProg?.hintUsed) {
          const hintDoc = await getHint(currentStallId);

          setHintText(hintDoc?.location || "Location unavailable");
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

  const handleChallengeComplete = async () => {};

  // Spend Hint Coin logic
  const handleUseHintConfirm = async () => {
    console.log("handleUseHintConfirm");
    if (!team || team.coins <= 0) return;

    try {
      const newCoins = team.coins - 1;

      // 1. Deduct coin in teams document
      await updateTeam(team.id, { coins: newCoins });

      // 2. Mark hint used in progress document
      await markHintUsed(team.id, getStallNumber(team.currentStall));

      // 3. Fetch hint content
      const hintDoc = await getHint(getStallKey(team.currentStall));
      const text =
        hintDoc?.location || `Solve the clue at the stall to move forward!`;
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
        <p>
          Your account ({user?.email}) is not associated with any registered
          team for TEDxpedition.
        </p>
        <p>
          Please contact the event organizers at the registration desk to
          register your team.
        </p>
        <button onClick={handleLogout} className="btn btn-primary">
          Log Out
        </button>
      </div>
    );
  }

  if (!eventState) {
    return (
      <div className="dashboard-loading-screen">
        <div className="spinner"></div>
        <h2>Syncing event status...</h2>
      </div>
    );
  }

  if (eventState.status === "READY") {
    return (
      <div
        className="dashboard-loading-screen event-state-screen ready-state"
        style={{ textAlign: "center", gap: "30px" }}
      >
        <div
          className="tedx-brand-glow"
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          TED<span style={{ color: "var(--primary-red)" }}>X</span>pedition
        </div>
        <div
          className="spinner"
          style={{
            borderColor:
              "var(--primary-red) transparent transparent transparent",
          }}
        ></div>
        <h2 style={{ color: "var(--text-white)" }}>Waiting for Event Start</h2>
        <p
          style={{
            color: "var(--text-grey)",
            maxWidth: "400px",
            margin: "0 auto",
            fontSize: "1.1rem",
          }}
        >
          The hunt hasn't started yet. Please wait for the coordinators to
          launch the event.
        </p>
        <button
          onClick={handleLogout}
          className="btn btn-accent logout-btn"
          style={{
            marginTop: "20px",
            padding: "10px 24px",
            backgroundColor: "transparent",
            border: "1px solid var(--border-color)",
            color: "var(--text-white)",
          }}
        >
          Log Out
        </button>
      </div>
    );
  }

  if (eventState.status === "ENDED") {
    return (
      <div
        className="dashboard-loading-screen event-state-screen ended-state"
        style={{ textAlign: "center", gap: "30px" }}
      >
        <div
          className="tedx-brand-glow"
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          TED<span style={{ color: "var(--primary-red)" }}>X</span>pedition
        </div>
        <div style={{ fontSize: "4rem" }}>🏁</div>
        <h2
          style={{
            color: "var(--primary-red)",
            fontSize: "2.5rem",
            fontWeight: "800",
          }}
        >
          Event Finished
        </h2>
        <p
          style={{
            color: "var(--text-grey)",
            maxWidth: "500px",
            margin: "0 auto",
            fontSize: "1.2rem",
            lineHeight: "1.6",
          }}
        >
          TEDxpedition has officially concluded. Thank you for scanning,
          solving, and participating!
        </p>
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Link
            to="/leaderboard"
            className="btn btn-secondary leaderboard-btn"
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--primary-red)",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            📊 View Leaderboard
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-accent logout-btn"
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-white)",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const currentStallNum = getStallNumber(team.currentStall);
  const stallProgress = getStallProgressValue(progress, currentStallNum);

  // Game finished completely (all 7 stages done)
  if (
    currentStallNum > 7 ||
    (currentStallNum === 7 &&
      getStallProgressValue(progress, 7)?.status === "COMPLETED")
  ) {
    return (
      <FinishPage team={team} progress={progress} handleLogout={handleLogout} />
    );
  }

  // Active view routing based on game state
  // Stall 7 is Final Location stage
  if (currentStallNum === 7) {
    return (
      <FinalLocation
        team={team}
        progress={progress}
        handleLogout={handleLogout}
      />
    );
  }

  const currentStallStatus = stallProgress?.status || "READY";

  // State: Finished playing, waiting for admin approval
  // if (currentStallStatus === "VERIFYING") {
  //   return (
  //     <WaitingForVerificationPage
  //       team={team}
  //       stallNum={currentStallNum}
  //       stallProgress={stallProgress}
  //       handleLogout={handleLogout}
  //     />
  //   );
  // }

  // State: Travelling to next stall
  if (currentStallStatus === "TRAVELLING") {
    return (
      <>
        <TravelPage
          team={team}
          currentStallNum={currentStallNum}
          currentClue={currentClue}
          hintText={hintText}
          onUseHintClick={() => {
<<<<<<< HEAD
=======
            console.log("Hint button clicked");
>>>>>>> main
            setIsHintOpen(true);
          }}
          handleLogout={handleLogout}
        />
        <HintDialog
          isOpen={isHintOpen}
          coins={team.coins}
          onConfirm={handleUseHintConfirm}
          onClose={() => setIsHintOpen(false)}
        />
      </>
    );
  }

  // State: Started playing, active challenge screen
  if (currentStallStatus === "PLAYING" && team) {
    return (
      <ChallengePage
        team={team}
        progress={progress}
        stallNum={currentStallNum}
        stallProgress={stallProgress}
        stallMeta={currentStallMeta}
        hintText={hintText}
        onUseHintClick={() => {
<<<<<<< HEAD
=======
          console.log("Hint button clicked");
>>>>>>> main
          setIsHintOpen(true);
        }}
        onComplete={handleChallengeComplete}
        handleLogout={handleLogout}
      />
    );
  }

  // State: Default dashboard / Reach stall Clue page (Not started yet)
  const hintUnlocked = !!hintText || !!stallProgress?.hintUsed;
  const statusLabel = currentStallStatus;
  const cardStatusClass =
    currentStallStatus === "PLAYING" ? "playing" : "waiting";

  const allStallsCompleted = Object.keys(progress || {}).every(
      (stall) => progress[stall]?.status === "COMPLETED"
  );

  return (
    <div className="participant-dashboard">
      <header className="dashboard-header">
        <div className="header-branding">
          <h2>
            TED<span>X</span>pedition
          </h2>
        </div>
        <div className="header-actions">
          <Link
            to="/test/leaderboard"
            className="btn btn-secondary leaderboard-btn"
          >
            📊 Leaderboard
          </Link>
          <button onClick={handleLogout} className="btn btn-accent logout-btn">
            Log Out
          </button>
        </div>
      </header>

      {allStallsCompleted && (
        <div className="completion-message">
          Congratulations!
          <br />
          You have successfully completed all missions.
        </div>
      )}

      <main className="dashboard-content">
        <section className="team-status-grid">
          <TeamMembersCard team={team} />
          {/* <HintCard
            coins={team.coins}
            hintUnlocked={hintUnlocked}
            hintText={hintText}
            onUnlockHint={() => setIsHintOpen(true)}
            loading={false}
          />
          <CurrentStallCard
            clue={currentClue}
            status={statusLabel}
            onScanQR={() => setIsScannerOpen(true)}
          /> */}
        </section>

        <section className="glass-card active-stall-card glow-red pulsing-border">
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

      {isTeamQROpen && (
        <TeamQR team={team} onClose={() => setIsTeamQROpen(false)} />
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
