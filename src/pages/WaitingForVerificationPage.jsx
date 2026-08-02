import QRCode from "react-qr-code";
import Timer from "../components/Timer/Timer";
import "./WaitingForVerificationPage.css";

export default function WaitingForVerificationPage({ team, stallNum, stallProgress, handleLogout }) {
  const qrData = JSON.stringify({
    v: 1,
    type: "TEAM",
    id: team.teamId,
  });

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
            
            <div className="team-qr-display-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", padding: "20px", background: "#111", borderRadius: "15px", border: "1px solid #333", margin: "15px 0" }}>
              <QRCode
                value={qrData}
                size={180}
                fgColor="#ffffff"
                bgColor="#111111"
              />
              <div>
                <span className="qr-box-label" style={{ display: "block", color: "#888", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>Team Verification ID</span>
                <div className="team-id-glowing-box font-mono" style={{ color: "#e10600", fontSize: "1.2rem", fontWeight: "bold", textShadow: "0 0 8px rgba(225, 6, 0, 0.4)" }}>{team.teamId}</div>
                <p className="team-name-label" style={{ margin: "5px 0 0 0", fontSize: "1.2rem", color: "#fff", fontWeight: "600" }}>{team.teamName}</p>
              </div>
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
