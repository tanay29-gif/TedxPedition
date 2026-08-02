import "./CurrentStallCard.css";

export default function CurrentStallCard({
    currentStall,
    status,
    onScanQR,
}) {

    return (

        <section className="current-stall-card">

            <div className="stall-header">

                <div>

                    <h2>Current Challenge</h2>

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

                <div>

                    <h1>{currentStall}</h1>

                    <span>

                        Treasure Hunt Station

                    </span>

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