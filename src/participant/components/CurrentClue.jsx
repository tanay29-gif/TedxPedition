const CurrentClue = ({ team }) => {
  return (
    <div className="card">
      <h3>Current Clue</h3>
      <p>{team.currentClue || 'Waiting for your first clue...'}</p>
    </div>
  );
};

export default CurrentClue;
