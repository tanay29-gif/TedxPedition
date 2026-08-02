import "./ProgressTracker.css";

const stalls = [
    "STALL01",
    "STALL02",
    "STALL03",
    "STALL04",
    "STALL05",
    "STALL06",
];

export default function ProgressTracker({
    currentStall,
    progress,
}) {

    return (

        <section className="progress-card">

            <div className="progress-header">

                <h2>Journey Progress</h2>

                <p>

                    Complete all stalls to reach the Final Treasure.

                </p>

            </div>

            <div className="progress-grid">

                {

                    stalls.map((stall) => {

                        const completed =
                            progress?.[stall]?.completed;

                        const active =
                            currentStall === stall;

                        let status = "locked";

                        if (completed) {

                            status = "completed";

                        }

                        else if (active) {

                            status = "active";

                        }

                        return (

                            <div
                                key={stall}
                                className={`progress-box ${status}`}
                            >

                                <div className="progress-icon">

                                    {

                                        completed

                                            ? "✓"

                                            : active

                                                ? "▶"

                                                : "🔒"

                                    }

                                </div>

                                <span>

                                    {stall}

                                </span>

                            </div>

                        );

                    })

                }

            </div>

        </section>

    );

}