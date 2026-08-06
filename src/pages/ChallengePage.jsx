import { useState } from "react";
import QRScanner from "../components/QRScanner/QRScanner";
import QRCode from "react-qr-code";
import Timer from "../components/Timer/Timer";
import GameContainer from "../components/game/GameContainer";
import { getStallKey } from "../services/firestore/stallKeys";
import { getQRWord } from "../services/firestore/qr";
import { stallIdToMission } from "../utils/missionUtils";
import "./ChallengePage.css";

export default function ChallengePage({
  team,
  stallNum,
  stallProgress,
  stallMeta,
  hintText,
  onUseHintClick,
  onComplete,
  handleLogout
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);


  const qrData = JSON.stringify({
    v: 1,
    type: "TEAM",
    id: team.teamId,
    action: "FINISH_CHALLENGE",
  });

  const isOfflineGame = stallMeta?.type === "OFFLINE";


  // --- Common Submit ---
  const handleFinishStall = () => {
    setError("");
    setSuccess(true);

    // Only online games should automatically finish
    if (!isOfflineGame && onComplete) {
    onComplete();
  }
  };

  return (
    <div className="challenge-page">
      <header className="challenge-header">
        <div className="header-info">
          <span className="badge">{stallIdToMission(stallNum).toUpperCase()} ACTIVE</span>
          <h2>{stallMeta?.name || `${stallIdToMission(stallNum)} Challenge`}</h2>
        </div>
        <div className="header-status">
          <Timer startedAt={stallProgress?.startedAt} />
          <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
        </div>
      </header>

      <main className="challenge-content">
        <section className="challenge-layout">
          {/* Main workspace depending on Stall */}
          <GameContainer
            stallId={getStallKey(stallNum)}
            stallNum={stallNum}
            onComplete={handleFinishStall}
            success={success}
            setSuccess={setSuccess}
            team={team}
            error={error}
            setError={setError}
          />
          <div className="challenge-sidebar">

            {error && (
              <div className="challenge-error-box animate-shake">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="challenge-success-box">
                <h3>🎉 Challenge Completed!</h3>

                <p className="success-message">
                  Proceed to the Stall Administrator and present your Team QR Code.
                  Your timer will stop only after the admin scans your QR and verifies
                  your completion.
                </p>

                <div className="team-qr-container">
                  <div
                    style={{
                      background: "#fff",
                      padding: 16,
                      borderRadius: 12,
                      display: "inline-block",
                    }}
                  >
                    <QRCode
                      value={qrData}
                      size={180}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <div className="team-qr-details">
                    <span className="team-qr-label">
                      Team Verification ID
                    </span>

                    <div className="team-qr-id">
                      {team.teamId}
                    </div>

                    <div className="team-qr-name">
                      {team.teamName}
                    </div>
                  </div>
                </div>

                <p className="waiting-admin-text">
                  Waiting for the Stall Administrator to scan your QR...
                </p>
              </div>
            )}

            {/* Show only for ONLINE challenges */}
            {!isOfflineGame && (
              <>
                <div className="glass-card clue-panel">
                  <h4>Mission Clue</h4>

                  <p>
                    {stallMeta?.description ||
                      `${stallIdToMission(stallNum)} active task. Complete it to unlock the next destination.`}
                  </p>
                </div>

                <div className="glass-card hint-panel">
                  <h4>Mission Hint</h4>

                  {hintText ? (
                    <div className="hint-revealed">
                      <span className="hint-revealed-icon font-mono">
                        💡 Revealed Clue:
                      </span>

                      <p className="hint-revealed-text">
                        {hintText}
                      </p>
                    </div>
                  ) : (
                    <div className="hint-request">
                      <p>
                        Stuck on this mission? Use a Hint Coin to unlock a clue.
                      </p>

                      <button
                        onClick={onUseHintClick}
                        className="btn btn-accent btn-sm hint-btn"
                      >
                        💡 Spend Hint Coin
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}
