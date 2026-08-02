import "./ScoreForm.css";

export default function ScoreForm({
    score,
    setScore,
    bonus,
    setBonus,
    penalty,
    setPenalty,
    remarks,
    setRemarks,
}) {

    return (

        <section className="score-form-card">

            <div className="section-title">

                <h2>Challenge Evaluation</h2>

                <p>
                    Assign the score for this challenge.
                </p>

            </div>

            <div className="score-grid">

                <div className="input-group">

                    <label>Base Score</label>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) =>
                            setScore(e.target.value)
                        }
                    />

                </div>

                <div className="input-group">

                    <label>Bonus</label>

                    <input
                        type="number"
                        min="0"
                        value={bonus}
                        readOnly
                        className="readonly-input"
                    />

                </div>

                <div className="input-group">

                    <label>Penalty</label>

                    <input
                        type="number"
                        min="0"
                        value={penalty}
                        onChange={(e) =>
                            setPenalty(e.target.value)
                        }
                    />

                </div>

            </div>

            <div className="remarks-group">

                <label>Remarks</label>

                <textarea

                    rows="5"

                    value={remarks}

                    onChange={(e)=>
                        setRemarks(e.target.value)
                    }

                    placeholder="Write remarks for this team..."

                />

            </div>

        </section>

    );

}