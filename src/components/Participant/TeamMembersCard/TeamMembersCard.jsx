import "./TeamMembersCard.css";

export default function TeamMembersCard({
    team,
}) {

    if (!team) return null;

    const leaderName = team.leader?.name || team.leader?.email || team.leader?.displayName || "Team Leader";
    const leaderEmail = team.leader?.email || "";
    const members = Array.isArray(team.members)
        ? team.members.map((member) => {
            if (typeof member === "string") {
                return {
                    name: member,
                    email: "",
                };
            }

            return {
                name: member?.name || member?.email || "Team Member",
                email: member?.email || "",
            };
        })
        : [];

    return (

        <section className="team-members-card">

            <div className="card-header">

                <div>

                    <h2>{team.teamName}</h2>

                    <p>

                        Team Information

                    </p>

                </div>

                <div className="team-badge">

                    {team.teamId}

                </div>

            </div>

            <div className="leader-card">

                <h3>Team Leader</h3>

                <div className="member-item">

                    <div className="avatar">

                        {team.leader?.name?.charAt(0)}

                    </div>

                    <div>

                        <strong>

                            {leaderName}

                        </strong>

                        <span>

                            {leaderEmail}

                        </span>

                    </div>

                </div>

            </div>

            <div className="members-list">

                <h3>Team Members</h3>

                {

                    members.map((member, index) => (

                        <div
                            key={index}
                            className="member-item"
                        >

                            <div className="avatar secondary">

                                {member.name.charAt(0)}

                            </div>

                            <div>

                                <strong>

                                    {member.name}

                                </strong>

                                <span>

                                    {member.email}

                                </span>

                            </div>

                        </div>

                    ))

                }

            </div>

            <div className="team-stats">

                <div className="stat-box">

                    <span>

                        Hint Coins

                    </span>

                    <strong>

                        🪙 {team.coins}

                    </strong>

                </div>

                <div className="stat-box">

                    <span>

                        Total Score

                    </span>

                    <strong>

                        {team.totalScore}

                    </strong>

                </div>

            </div>

        </section>

    );

}