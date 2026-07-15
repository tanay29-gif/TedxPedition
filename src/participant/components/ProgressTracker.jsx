const ProgressTracker = ({ team }) => {
  const completed = team.stallsCompleted?.length || 0;
  const total = team.totalStalls || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card">
      <h3>Progress</h3>
      <p>{completed} / {total} stalls completed</p>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default ProgressTracker;
