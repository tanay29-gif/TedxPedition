const TeamDetails = ({ team }) => {
  return (
    <div className="card">
      <h3>Team Details</h3>
      <p><strong>Team Name:</strong> {team.teamName}</p>
      <p><strong>Members:</strong></p>
      <ul>
        {team.members?.map((m, i) => (
          <li key={i}>{m.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TeamDetails;
