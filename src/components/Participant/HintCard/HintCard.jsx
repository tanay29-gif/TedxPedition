import "./HintCard.css";

export default function HintCard({
    coins,
    hintUnlocked,
    hintText,
    onUnlockHint,
    loading,
}) {

    return (

        <section className="hint-card">

            <div className="hint-header">

                <div>

                    <h2>Hints</h2>

                    <p>
                        Spend one Hint Coin to reveal a hint.
                    </p>

                </div>

                <div className="coin-badge">

                    🪙 {coins}

                </div>

            </div>

            {

                hintUnlocked ? (

                    <div className="hint-box">

                        <h3>Hint</h3>

                        <p>{hintText}</p>

                    </div>

                ) : (

                    <div className="locked-box">

                        <div className="lock-icon">

                            🔒

                        </div>

                        <p>

                            Hint Locked

                        </p>

                        <small>

                            Spend one Hint Coin to unlock.

                        </small>

                    </div>

                )

            }

            <button

                className="unlock-btn"

                disabled={hintUnlocked || loading || coins <= 0}

                onClick={onUnlockHint}

            >

                {

                    loading

                    ? "Unlocking..."

                    : hintUnlocked

                        ? "Hint Unlocked"

                        : "Unlock Hint"

                }

            </button>

        </section>

    );

}