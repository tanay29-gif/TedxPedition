import Timer from "../../Timer/Timer";
import "./TimeCard.css";

export default function TimerCard({
    startedAt,
    endedAt,
    status,
}) {

    return (

        <section className="timer-card">

            <div className="timer-header">

                <div>

                    <h2>Challenge Timer</h2>

                    <p>

                        Complete the challenge as fast as possible.

                    </p>

                </div>

                <span className={`timer-status ${status.toLowerCase()}`}>

                    {status}

                </span>

            </div>

            <div className="timer-display">

                <Timer
                    startedAt={startedAt}
                    endedAt={endedAt}
                />

            </div>

        </section>

    );

}