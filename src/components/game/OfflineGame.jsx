import "./OfflineGame.css";

export default function OfflineGame({ game, onComplete }) {
  if (!game) return null;

const finishChallenge = () => {
  if (onComplete) {
    onComplete();
  }
};

return (
  <div className="ted-page">
    <div className="ted-container">

      <div className="ted-hero">

        <span className="ted-tag">
          OFFLINE CHALLENGE
        </span>

        <h1>{game.title}</h1>

        <p>
          This challenge must be completed physically at the stall.
          Work together with your teammates and ask the volunteer for
          verification once you have finished.
        </p>

      </div>

      <section className="ted-section">

        <h3>Challenge Description</h3>

        <div className="ted-box">
          <p>{game.description}</p>
        </div>

      </section>

      <section className="ted-section">

        <div className="finish-card">

          <h2>Volunteer Verification Required</h2>

          <p>
            Once your team completes the challenge, show it to the TEDx
            volunteer stationed here. After successful verification,
            your next challenge will be unlocked.
          </p>

          <button
            className="finish-button"
            onClick={finishChallenge}
          >
            Finish Challenge
          </button>

        </div>

      </section>

    </div>
  </div>
);
}