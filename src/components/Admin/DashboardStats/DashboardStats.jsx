import "./DashboardStats.css";

export default function DashboardStats({
    stallNumber,
    waitingTeams,
    playingTeams,
    verifiedTeams,
}) {

    const stats = [
        {
            title: "Assigned Stall",
            value: stallNumber,
            icon: "🏁",
            color: "red",
        },
        {
            title: "Waiting",
            value: waitingTeams,
            icon: "⏳",
            color: "orange",
        },
        {
            title: "Playing",
            value: playingTeams,
            icon: "🎮",
            color: "blue",
        },
        {
            title: "Verified",
            value: verifiedTeams,
            icon: "✅",
            color: "green",
        },
    ];

    return (

        <section className="dashboard-stats">

            {stats.map((stat) => (

                <div
                    key={stat.title}
                    className={`stat-card ${stat.color}`}
                >

                    <div className="stat-icon">

                        {stat.icon}

                    </div>

                    <div className="stat-content">

                        <h2>{stat.value}</h2>

                        <p>{stat.title}</p>

                    </div>

                </div>

            ))}

        </section>

    );

}