import "./CurrentStallCard.css";

export default function CurrentStallCard({
    clue,
    status,
    onScanQR,
}) {
    return (
        <section className="current-stall-card">
            <div className="stall-header">
                <div>
                    <h2>Current Mission</h2>
                    <p>
                        Scan the Stall QR to begin.
                    </p>
                </div>
                <span className={`stall-status ${status.toLowerCase()}`}>
                    {status}
                </span>
            </div>

            <div className="stall-body">
                <div className="stall-icon">
                    🧩
                </div>
                <div className="clue-details">
                    <h1>{clue?.title || "Loading Clue..."}</h1>
                    <p className="clue-description">
                        {clue?.description || "Locating active clue instructions..."}
                    </p>
                </div>
            </div>

            <button
                className="scan-stall-btn"
                onClick={onScanQR}
            >
                Scan Stall QR
            </button>
        </section>
    );
}