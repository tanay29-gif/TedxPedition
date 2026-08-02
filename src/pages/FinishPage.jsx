import { Link } from "react-router-dom";
import { getStallProgressValue } from "../services/firestore/stallKeys";
import "./FinishPage.css";

export default function FinishPage({ team, progress, handleLogout }) {
  const getMs = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    if (typeof timestamp === "object" && timestamp.seconds) return timestamp.seconds * 1000;
    if (timestamp instanceof Date) return timestamp.getTime();
    return new Date(timestamp).getTime();
  };

  const calculateTimeBonus = (seconds) => {
    if (!seconds) return 0;
    const mins = seconds / 60;
    if (mins <= 1) return 50;
    if (mins <= 2) return 40;
    if (mins <= 3) return 30;
    if (mins <= 4) return 20;
    if (mins <= 5) return 10;
    return 0;
  };

  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Compile stall metrics
  const stallsData = [];
  let calculatedGameScore = 0;
  let calculatedTimeBonus = 0;

  for (let i = 1; i <= 6; i++) {
    const stallProg = getStallProgressValue(progress, i);
    const score = Number(stallProg?.score || 0);
    const timeTaken = Number(stallProg?.timeTaken || 0);
    const bonus = calculateTimeBonus(timeTaken);

    calculatedGameScore += score;
    calculatedTimeBonus += bonus;

    stallsData.push({
      name: `Stall ${i}`,
      score,
      timeTaken,
      bonus
    });
  }

  // Stall 7 (Final Location) has score but no time bonus
  const finalProg = getStallProgressValue(progress, 7);
  const finalScore = Number(finalProg?.score || 0);
  calculatedGameScore += finalScore;

  const coinBonus = (team.coins || 0) * 10;
  const finalTotalScore = team.totalScore || (calculatedGameScore + calculatedTimeBonus + coinBonus);

  return (
    <div className="finish-page">
      <header className="finish-header">
        <h2>TED<span>X</span>pedition</h2>
        <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
      </header>

      <main className="finish-content">
        <div className="glass-card celebration-card glow-red">
          <div className="celebration-hero">
            <span className="trophy-icon">🏆</span>
            <h1>Congratulations!</h1>
            <h2>Team {team.teamName} has completed the expedition!</h2>
            <p className="expedition-completion-subtitle font-mono">Team ID: {team.teamId}</p>
          </div>

          <div className="final-metrics-row">
            <div className="metric-box">
              <span className="metric-title">Final Score</span>
              <span className="metric-value text-red">{finalTotalScore} pts</span>
            </div>
            <div className="metric-box">
              <span className="metric-title">Total Active Time</span>
              <span className="metric-value font-mono">{formatSeconds(team.totalTime)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-title">Coins Left</span>
              <span className="metric-value text-gold">🪙 {team.coins}</span>
            </div>
          </div>

          <div className="score-breakdown-details">
            <h3>Performance Breakdown</h3>
            
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Task Score</th>
                  <th>Duration</th>
                  <th>Time Bonus</th>
                </tr>
              </thead>
              <tbody>
                {stallsData.map((stall, idx) => (
                  <tr key={idx}>
                    <td className="bold">{stall.name}</td>
                    <td>{stall.score} pts</td>
                    <td className="font-mono">{formatSeconds(stall.timeTaken)}</td>
                    <td className="text-green">+{stall.bonus} pts</td>
                  </tr>
                ))}
                <tr>
                  <td className="bold">Final Stage</td>
                  <td>{finalScore} pts</td>
                  <td className="font-mono">{formatSeconds(finalProg?.timeTaken || 0)}</td>
                  <td>-</td>
                </tr>
                <tr className="bonus-row">
                  <td className="bold">Coin Bonus</td>
                  <td colspan="2">Remaining Coins ({team.coins}) &times; 10</td>
                  <td className="text-gold">+{coinBonus} pts</td>
                </tr>
                <tr className="total-row">
                  <td className="bold">Total Score</td>
                  <td colspan="2">Game + Bonuses</td>
                  <td className="text-red bold">{finalTotalScore} pts</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="finish-actions">
            <Link to="/leaderboard" className="btn btn-primary view-ranks-btn">
              📊 View Live Ranking Leaderboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
