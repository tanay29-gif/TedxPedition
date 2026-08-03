import "./LeaderboardPreview.css";

export default function LeaderboardPreview({

    leaderboardData = []

}) {

    const teams = [...leaderboardData]
        .sort((a, b) => {

            if (b.totalScore !== a.totalScore) {

                return b.totalScore - a.totalScore;

            }

            return a.totalTime - b.totalTime;

        })
        .slice(0, 5);

    return (

        <section className="leaderboard-card">

            <div className="leaderboard-header">

                <h2>Leaderboard</h2>

                <span>Top 5 Teams</span>

            </div>

            {

                teams.length === 0 ? (

                    <div className="leaderboard-empty">

                        No scores available yet.

                    </div>

                ) : (

                    <div className="leaderboard-list">

                        {

                            teams.map((team, index) => (

                                <div
                                    className="leaderboard-row"
                                    key={team.id}
                                >

                                    <div className="rank-circle">

                                        {index + 1}

                                    </div>

                                    <div className="team-details">

                                        <strong>

                                            {team.teamName}

                                        </strong>

                                        <small>

                                            {team.id}

                                        </small>

                                    </div>

                                    <div className="team-score">

                                        <strong>

                                            {team.totalScore}

                                        </strong>

                                        <span>

                                            pts

                                        </span>

                                    </div>

                                </div>

                            ))

                        }

                    </div>

                )

            }

        </section>

    );

}