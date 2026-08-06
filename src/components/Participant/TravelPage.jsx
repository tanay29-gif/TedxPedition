import QRCode from "react-qr-code";
import "./TravelPage.css";

export default function TravelPage({
    team,
    currentStallNum,
    currentClue,
    hintText,
    onUseHintClick,
    handleLogout,
}) {

    const qrData = JSON.stringify({
        v: 1,
        type: "TEAM",
        id: team.teamId,
        action: "START_CHALLENGE",
    });

    return (
        <div className="travel-page">

            <header className="travel-header">

                <div>

                    <span className="travel-badge">
                        Mission {currentStallNum}
                    </span>

                    <h2>Travel to the Next Stall</h2>

                </div>

                <button
                    className="btn btn-accent"
                    onClick={handleLogout}
                >
                    Log Out
                </button>

            </header>

            <main className="travel-layout">

                {/* Left */}

                <div className="travel-main glass-card">

                    <h1>
                        🎯 Next Destination
                    </h1>

                    <div className="travel-clue-card">

                        <h3>
                            Mission Clue
                        </h3>

                        <p>
                            {currentClue?.description}
                        </p>

                    </div>

                    <div className="travel-instruction">

                        Proceed to the location described above.
                        Once you reach the stall, show the QR Code
                        below to the Stall Administrator to begin
                        your challenge.

                    </div>

                    <div className="travel-qr">

                        <div className="travel-qr-box">

                            <QRCode
                                value={qrData}
                                size={220}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                style={{
                                    width: "100%",
                                    maxWidth: "220px",
                                    height: "auto",
                                }}
                            />

                        </div>

                        <div className="travel-team">

                            <h3>{team.teamName}</h3>

                            <span>{team.teamId}</span>

                        </div>

                    </div>

                </div>

                {/* Right */}

                <aside className="travel-sidebar">

                    <div className="glass-card">

                        <h3>Hint Coins</h3>

                        <div className="coins-display">

                            🪙 {Math.max(0, team.coins)}

                        </div>

                    </div>

                    <div className="glass-card">

                        <h3>Mission Clue</h3>

                        <div className="travel-clue-card">
                            <p>{currentClue?.clue}</p>
                        </div>

                        <div className="glass-card location-card">

                            <h3>📍 Location</h3>

                            {hintText ? (
                                <div className="location-box">
                                    {hintText}
                                </div>
                            ) : (
                                <>
                                    <p>
                                        Spend one Hint Coin to reveal the exact location.
                                    </p>

                                    <button
                                        className="btn btn-primary"
                                        disabled={team.coins <= 0}
                                        onClick={onUseHintClick}
                                    >
                                        💡 Reveal Location
                                    </button>
                                </>
                            )}

                        </div>

                    </div>

                </aside>

            </main>

        </div>
    );
}