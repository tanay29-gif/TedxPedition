import "./HintDialog.css";

export default function HintDialog({ isOpen, coins, onConfirm, onClose }) {
  if (!isOpen) return null;

  const hasCoins = coins > 0;

  return (
    <div className="hint-dialog-overlay">
      <div className="hint-dialog-modal ">
        <div className="hint-dialog-header">
          <h3>
    💡 Request Hint Clue
</h3>
          <button className="hint-close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="hint-dialog-body">
          {hasCoins ? (
            <>
              <div className="hint-coin-visual">
                <div className="hint-coin-icon animate-coin">🪙</div>
                <div className="hint-coin-count">{coins} Coins Remaining</div>
              </div>
              <p className="hint-prompt-text">
                Are you sure you want to spend <strong>1 Hint Coin</strong> to unlock a clue for this stall?
              </p>
              <p className="hint-warning-text">
                Hint coins are shared across the entire event. Use them wisely!
              </p>
            </>
          ) : (
            <>
              <div className="hint-coin-visual empty">
                <div className="hint-coin-icon">🚫🪙</div>
                <div className="hint-coin-count zero">0 Coins Remaining</div>
              </div>
              <p className="hint-prompt-text">
                You have spent all your Hint Coins. No hints can be unlocked.
              </p>
            </>
          )}
        </div>

        <div className="hint-dialog-footer">
          {hasCoins ? (
            <>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onConfirm}>
                Unlock Hint (-1 Coin)
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
