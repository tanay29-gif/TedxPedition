import QRCode from "react-qr-code";
import "./TeamQRCodeCard.css";

export default function TeamQRCodeCard({
    teamId,
    teamName,
    status,
    onOpenQR,
}) {

    const qrData = JSON.stringify({
        v: 1,
        type: "TEAM",
    action: "START_CHALLENGE",
        id: teamId,
    });

    console.log("TeamQRCodeCard Rendered", teamId, teamName, status);
    return (

        <section className="team-qr-card">

            <div className="qr-header">

                <div>

                    <h2>Verification QR</h2>

                    <p>

                        Show this QR to the Stall Admin after completing
                        the challenge.

                    </p>

                </div>

                <span className={`qr-status ${status.toLowerCase()}`}>

                    {status}

                </span>

            </div>

            <div className="qr-container">

                <QRCode
                    value={qrData}
                    size={220}
                />

            </div>

            <h3>

                {teamName}

            </h3>

            <small>

                {teamId}

            </small>

            <button
                className="team-qr-btn"
                onClick={onOpenQR}
            >
                Show Team QR
            </button>

        </section>

    );

}