import "./ScoreSummary.css";

export default function ScoreSummary({
    score,
    bonus,
    penalty,
}) {

    const baseScore = Number(score) || 0;
    const bonusScore = Number(bonus) || 0;
    const penaltyScore = Number(penalty) || 0;

    const finalScore =
        baseScore + bonusScore - penaltyScore;

    return (

        <section className="score-summary-card">

            <div className="summary-header">

                <h2>Score Summary</h2>

                <span>
                    Live Calculation
                </span>

            </div>

            <div className="summary-row">

                <span>Base Score</span>

                <strong>{baseScore}</strong>

            </div>

            <div className="summary-row">

                <span>Bonus</span>

                <strong className="positive">

                    +{bonusScore}

                </strong>

            </div>

            <div className="summary-row">

                <span>Penalty</span>

                <strong className="negative">

                    -{penaltyScore}

                </strong>

            </div>

            <hr />

            <div className="summary-total">

                <span>Final Stall Score</span>

                <h1>{finalScore}</h1>

            </div>

        </section>

    );

}