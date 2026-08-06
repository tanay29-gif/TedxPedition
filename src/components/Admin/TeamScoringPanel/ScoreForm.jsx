import "./ScoreForm.css";

export default function ScoreForm({
    score,
    setScore,

    bonus,

    penalty,
    setPenalty,

    hintUsed,
    setHintUsed,

    remarks,
    setRemarks,
}) {
    return (
        <section className="score-form-card">

            <div className="section-title">
                <h2>Challenge Evaluation</h2>
                <p>
                    Verify the team's performance before submitting.
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
                        onChange={(e) => setScore(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Bonus</label>

                    <input
                        type="number"
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
                        onChange={(e) => setPenalty(e.target.value)}
                    />
                </div>

            </div>

            <div className="hint-card">

                <div>
                    <h4>Hint Used</h4>
                    <p>
                        Enable if the team requested an offline hint.
                    </p>
                </div>

                <label className="switch">

                    <input
                        type="checkbox"
                        checked={hintUsed}
                        onChange={(e) =>
                            setHintUsed(e.target.checked)
                        }
                    />

                    <span className="slider"></span>

                </label>

            </div>

            <div className="remarks-group">

                <label>Remarks</label>

                <textarea
                    rows="5"
                    value={remarks}
                    onChange={(e) =>
                        setRemarks(e.target.value)
                    }
                    placeholder="Write remarks about the team's performance..."
                />

            </div>

        </section>
    );
}