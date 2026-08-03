import "./ActionButtons.css";

export default function ActionButtons({
    score,
    submitting,
    onBack,
    onSubmit,
}) {

    const baseScore = Number(score) || 0;

    const isDisabled =
        submitting ||
        baseScore < 0 ||
        baseScore > 100;

    return (

        <section className="action-buttons">

            <button
                type="button"
                className="cancel-btn"
                onClick={onBack}
            >
                Cancel
            </button>

            <button
                type="button"
                className="verify-btn"
                disabled={isDisabled}
                onClick={onSubmit}
            >

                {
                    submitting
                        ? "Submitting..."
                        : "Verify & Unlock Next Stall"
                }

            </button>

        </section>

    );

}