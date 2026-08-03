import QRCode from "react-qr-code";
import "./TeamQR.css";

function TeamQR({ team, onClose }) {

    const qrData = JSON.stringify({
        v: 1,
        type: "TEAM",
        id: team.teamId,
    });
    console.log("TeamQR rendered");
console.log(team);

    return (
        <div className="qr-overlay">

            <div className="qr-card">

                <button
                    className="close-btn"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2>Team QR</h2>

                <QRCode
                    value={qrData}
                    size={220}
                />

                <h3>{team.teamName}</h3>

                <p>{team.teamId}</p>

                <small>
                    Show this QR to the Stall Admin for verification.
                </small>

            </div>

        </div>
    );
}

export default TeamQR;