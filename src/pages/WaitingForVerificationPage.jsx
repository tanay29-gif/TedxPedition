import Timer from "../components/Timer/Timer";
import "./WaitingForVerificationPage.css";

export default function WaitingForVerificationPage({ team, stallNum, stallProgress, handleLogout }) {
  return (
    <div className="verification-page">
      <header className="verification-header">
        <div className="header-info">
          <h2>TED<span>X</span>pedition</h2>
        </div>
        <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
      </header>

      <main className="verification-content">
        <div className="glass-card verification-card glow-red">
          <div className="status-anim-box">
            <div className="spinner-glow"></div>
            <span className="wait-icon">📋</span>
          </div>

          <h2>Stall {stallNum} Finished!</h2>
          <h3>Waiting for Admin Verification</h3>

          <div className="time-summary-box">
            <p>Your completion duration for this stall:</p>
            <Timer startedAt={stallProgress?.startedAt} endedAt={stallProgress?.endedAt} className="large-timer" />
          </div>

          <div className="instructions-prompt">
            <p>Please present your <strong>Team QR Code</strong> to the Stall Administrator to verify your performance.</p>
            <div className="team-qr-display-box">
              <span className="qr-box-label">Team Verification ID</span>
              <div className="team-id-glowing-box font-mono">{team.teamId}</div>
              <p className="team-name-label">{team.teamName}</p>
            </div>
            <p className="sub-instruction">
              Once the admin enters your score and clicks approve, this screen will automatically refresh and unlock your next clue!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
