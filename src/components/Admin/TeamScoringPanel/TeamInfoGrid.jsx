import Timer from "../../Timer/Timer";
import "./TeamInfoGrid.css";

export default function TeamInfoGrid({
    selectedTeam,
    selectedTeamStallProgress,
}) {

    if (!selectedTeam || !selectedTeamStallProgress) return null;

    return (

        <section className="team-info-grid">

            <div className="info-card">

                <span className="info-label">
                    Current Stall
                </span>

                <strong className="info-value">
                    Stall {selectedTeam.currentStall}
                </strong>

            </div>

            <div className="info-card">

                <span className="info-label">
                    Status
                </span>

                <strong
                    className={`status-value ${selectedTeamStallProgress.status?.toLowerCase()}`}
                >
                    {selectedTeamStallProgress.status}
                </strong>

            </div>

            <div className="info-card">

                <span className="info-label">
                    Elapsed Time
                </span>

                <strong className="info-value">

                    <Timer
                        startedAt={selectedTeamStallProgress.startedAt}
                        endedAt={selectedTeamStallProgress.endedAt}
                    />

                </strong>

            </div>

            <div className="info-card">

                <span className="info-label">
                    Hint Coins Left
                </span>

                <strong className="info-value">
                    {selectedTeamStallProgress.hintCoinsRemaining}
                </strong>

            </div>

        </section>

    );

}