
import "./ActiveTeamsTable.css";

export default function ActiveTeamsTable({
    loading,
    activeTeamsList,
    teamsMetadata,
    selectedStallNum,
    onScoreTeam,
}) {

    if (loading) {
        return (
            <div className="active-table-card">
                <h2>Live Teams</h2>

                <div className="table-loading">
                    Loading teams...
                </div>
            </div>
        );
    }

    const teamIds = Object.keys(activeTeamsList);
    const currentStallKey = `STALL${String(selectedStallNum).padStart(2, "0")}`;

    return (

        <div className="active-table-card">

            <div className="table-header">

                <div>

                    <h2>Live Team Activity</h2>

                    <span>
                        Teams currently participating
                    </span>

                </div>

                <div className="live-dot">

                    LIVE

                </div>

            </div>

            {teamIds.length === 0 ? (

                <div className="empty-state">

                    No Active Teams

                </div>

            ) : (

                <table className="teams-table">

                    <thead>

                        <tr>

                            <th>Team</th>

                            <th>Current Stall</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {teamIds.map((teamId) => {

                            const team = activeTeamsList[teamId];

                            const meta = teamsMetadata[teamId] || {};

                            const waiting =
                                team.currentStall === currentStallKey &&
                                team.status === "VERIFYING";

                            return (

                                <tr
                                    key={teamId}
                                    className={waiting ? "waiting-row" : ""}
                                >

                                    <td>

                                        <div className="team-info">

                                            <div className="team-avatar">

                                                {meta.teamName
                                                    ? meta.teamName[0]
                                                    : "T"}

                                            </div>

                                            <div>

                                                <strong>

                                                    {meta.teamName || teamId}

                                                </strong>

                                                <small>

                                                    {teamId}

                                                </small>

                                            </div>

                                        </div>

                                    </td>

                                    <td>

                                        Stall {team.currentStall}

                                    </td>

                                    <td>

                                        <span
                                            className={`status ${team.status.toLowerCase()}`}
                                        >

                                            {team.status}

                                        </span>

                                    </td>

                                    <td>

                                        {team.currentStall === currentStallKey && (

                                            <button
                                                className="verify-btn"
                                                onClick={() =>
                                                    onScoreTeam({
                                                        id: teamId,
                                                        ...meta,
                                                    })
                                                }
                                            >

                                                Verify

                                            </button>

                                        )}

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            )}

        </div>

    );

}