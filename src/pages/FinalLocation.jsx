import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { startStall, finishStall, completeStall, updateStallScore, updateTimeTaken } from "../services/firestore/progress";
import { updateActiveTeam } from "../services/realtime/activeTeams";
import { updateLeaderboard } from "../services/realtime/leaderboard";
import { updateTeam } from "../services/firestore/teams";
import Timer from "../components/Timer/Timer";
import "./FinalLocation.css";

export default function FinalLocation({ team, progress, handleLogout }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stallProgress = progress?.stall7;
  const hasStarted = !!stallProgress?.startedAt;

  const handleStartFinalStage = async () => {
    try {
      await startStall(team.id, 7);
      await updateActiveTeam(team.id, {
        currentStall: 7,
        status: "PLAYING"
      });
    } catch (err) {
      console.error("Failed to start final stage:", err);
      setError("Failed to start the final stage. Please retry.");
    }
  };

  const getMs = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    if (typeof timestamp === "object" && timestamp.seconds) return timestamp.seconds * 1000;
    if (timestamp instanceof Date) return timestamp.getTime();
    return new Date(timestamp).getTime();
  };

  const calculateTimeBonus = (seconds) => {
    if (!seconds) return 0;
    const mins = seconds / 60;
    if (mins <= 1) return 50;
    if (mins <= 2) return 40;
    if (mins <= 3) return 30;
    if (mins <= 4) return 20;
    if (mins <= 5) return 10;
    return 0;
  };

  const handleSubmitLocation = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    const normalizedAnswer = answer.trim().toLowerCase();
    if (normalizedAnswer !== "jasubhai auditorium") {
      setError("Incorrect location! Consult your map and cards, and try again.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Mark Stall 7 Finished
      const now = new Date();
      await finishStall(team.id, 7);
      await completeStall(team.id, 7);
      await updateStallScore(team.id, 7, 100);

      // Fetch updated progress document snapshot to calculate accurate elapsed times
      const progressRef = doc(db, "team_progress", team.id);
      const progressSnap = await getDoc(progressRef);
      const freshProgress = progressSnap.exists() ? progressSnap.data() : progress;

      // 2. Calculate elapsed times and time bonuses for all 7 stalls
      let totalTimeTakenSeconds = 0;
      let totalTimeBonus = 0;
      let totalGameScore = 100; // starts with Stall 7 correct answer score (100)

      for (let i = 1; i <= 7; i++) {
        const stallProg = freshProgress?.[`stall${i}`];
        if (stallProg) {
          const start = getMs(stallProg.startedAt);
          // For stall 7 we use current time as fallback if endedAt not synced yet
          const end = getMs(stallProg.endedAt) || now.getTime();
          
          if (start && end) {
            const timeDiff = Math.max(0, Math.floor((end - start) / 1000));
            
            // Update timeTaken in Firestore progress for each stall
            await updateTimeTaken(team.id, i, timeDiff);
            
            totalTimeTakenSeconds += timeDiff;
            
            // Stalls 1-6 have time bonuses
            if (i < 7) {
              totalTimeBonus += calculateTimeBonus(timeDiff);
            }
          }

          if (stallProg.score) {
            totalGameScore += Number(stallProg.score);
          }
        }
      }

      // 3. Coin Bonus (Remaining coins * 10)
      const remainingCoins = team.coins || 0;
      const coinBonus = remainingCoins * 10;

      // 4. Final Score Formula: Game Scores + Time Bonuses + Coin Bonus
      const finalScore = totalGameScore + totalTimeBonus + coinBonus;

      // 5. Update Team profile in Firestore
      await updateTeam(team.id, {
        currentStall: 8, // sets to 8 to mark finished
        totalScore: finalScore,
        totalTime: totalTimeTakenSeconds,
        status: "FINISHED"
      });

      // 6. Update Realtime Database: Leaderboard & ActiveTeam status
      await updateLeaderboard(team.id, {
        teamName: team.teamName,
        totalScore: finalScore,
        totalTime: totalTimeTakenSeconds,
        currentStall: 8
      });

      await updateActiveTeam(team.id, {
        currentStall: 8,
        status: "FINISHED",
        updatedAt: now.getTime()
      });

    } catch (err) {
      console.error("Error submitting final location:", err);
      setError("An error occurred during score calculation. Please submit again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="final-page">
      <header className="final-header">
        <div className="header-info">
          <span className="badge final-badge font-mono">STAGE 7 OF 7</span>
          <h2>TED<span>X</span>pedition Final Stage</h2>
        </div>
        <div className="header-actions">
          {hasStarted && <Timer startedAt={stallProgress?.startedAt} />}
          <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
        </div>
      </header>

      <main className="final-content">
        <div className="glass-card final-card glow-red">
          {!hasStarted ? (
            <div className="final-intro-view">
              <span className="final-big-icon">🗺️</span>
              <h2>You've Conquered the Stalls!</h2>
              <p>
                All six stalls have been completed and verified. You have collected all six cards.
              </p>
              <p className="final-hint-prompt">
                Together, the cards form a map indicating your final destination on the campus.
              </p>
              <button onClick={handleStartFinalStage} className="btn btn-primary start-final-timer-btn">
                🏁 Start Final Hunt & Start Timer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitLocation} className="final-input-view">
              <span className="final-timer-icon pulsing-anim">📍</span>
              <h2>Where is the Final Location?</h2>
              <p>Enter the campus location indicated by your completed card map to complete the expedition.</p>
              
              <div className="final-input-container">
                <input
                  type="text"
                  placeholder="Enter location name..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="final-text-field"
                  disabled={submitting}
                  required
                />
                {error && <div className="final-error-message">⚠️ {error}</div>}
              </div>

              <button type="submit" className="btn btn-primary submit-final-location-btn" disabled={submitting}>
                {submitting ? "Calculating Final Scores..." : "🚀 Validate & Submit"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
