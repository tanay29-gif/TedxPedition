const CurrentStall = ({ team }) => {
  return (
    <div className="card">
      <h3>Current Stall</h3>
      <p className="highlight">{team.currentStallName || 'Not assigned yet'}</p>
    </div>
  );
};

export default CurrentStall;
