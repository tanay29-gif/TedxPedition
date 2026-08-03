import "./TeamVerificationHeader.css";

export default function TeamVerificationHeader({
    selectedTeam,
    selectedTeamStallProgress,
    onBack,
}) {

    if (!selectedTeam) return null;

    const status =
        selectedTeamStallProgress?.status || "WAITING";

    return (
        <section className="verification-header">

            <button
                className="back-btn"
                onClick={onBack}
            >
                ← Back to Dashboard
            </button>

            <div className="team-hero">

                <div className="team-avatar">
                    {selectedTeam.teamName?.charAt(0).toUpperCase()}
                </div>

                <div className="team-details">

                    <h1>{selectedTeam.teamName}</h1>

                    <p>{selectedTeam.id}</p>

                    <span
                        className={`status-badge ${status.toLowerCase()}`}
                    >
                        {status}
                    </span>

                </div>

            </div>

        </section>
    );
}