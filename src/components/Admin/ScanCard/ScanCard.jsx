import "./ScanCard.css";

export default function ScanCard({
    onScan,
    errorMsg,
}) {

    return (

        <div className="scan-card">

            <div className="scan-icon">

                📷

            </div>

            <h2>

                Scan Team QR

            </h2>

            <p>

                Scan the participant QR code to
                verify their challenge and unlock
                the scoring panel.

            </p>

            {errorMsg && (

                <div className="scan-error">

                    ⚠ {errorMsg}

                </div>

            )}

            <button
                className="scan-btn"
                onClick={onScan}
            >

                Scan QR Code

            </button>

            <div className="scan-footer">

                or manually enter a Team ID inside
                the scanner dialog.

            </div>

        </div>

    );

}