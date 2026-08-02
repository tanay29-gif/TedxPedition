import { useState } from "react";
import Timer from "../components/Timer/Timer";
import { startStall, finishStall, verifyStall, unlockNextStall } from "../services/firestore/progress";
import { getStallProgressValue } from "../services/firestore/stallKeys";
import "./FinalLocation.css";

export default function FinalLocation({ team, progress, handleLogout }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stallProgress = getStallProgressValue(progress, 7);
  const hasStarted = stallProgress?.status === "PLAYING" || !!stallProgress?.startedAt;

  const handleStartFinalStage = async () => {
    try {
      await startStall(team.id, 7);
    } catch (err) {
      console.error("Failed to start final stage:", err);
      setError("Failed to start the final stage. Please retry.");
    }
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
      // 1. Mark Stall 7 Finished (calculates timeTaken and sets status VERIFYING)
      await finishStall(team.id, 7);

      // 2. Mark Stall 7 Verified / COMPLETED
      await verifyStall(team.id, 7, {
        baseScore: 100,
        penalty: 0,
        remarks: "Solved Final Location Slogan",
        verifiedBy: "SYSTEM"
      });

      // 3. Unlock Next Stall (marks team/RTDB as FINISHED)
      await unlockNextStall(team.id, 7);

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
