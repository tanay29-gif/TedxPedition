const Coins = ({ team }) => {
  return (
    <div className="card">
      <h3>Hint Coins</h3>
      <p className="highlight">🪙 {team.coins ?? 0}</p>
    </div>
  );
};

export default Coins;
