import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../firebase/firebase";
import { Link } from "react-router-dom";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardRef = ref(realtimeDb, "leaderboard");
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Convert object to array
        const list = Object.keys(val).map((teamId) => ({
          teamId,
          ...val[teamId]
        }));

        // Sort: 
        // 1. totalScore DESC
        // 2. totalTime ASC (lower is better)
        // 3. currentStall DESC (further in the hunt is better)
        list.sort((a, b) => {
          if ((b.totalScore || 0) !== (a.totalScore || 0)) {
            return (b.totalScore || 0) - (a.totalScore || 0);
          }
          if ((a.totalTime || 0) !== (b.totalTime || 0)) {
            return (a.totalTime || 0) - (b.totalTime || 0);
          }
          return (b.currentStall || 0) - (a.currentStall || 0);
        });

        setLeaderboardData(list);
      } else {
        setLeaderboardData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Top 3 Teams for Podium
  const podiumTeams = leaderboardData.slice(0, 3);
  const remainingTeams = leaderboardData.slice(3);

  // Helper to get podium order: 2nd, 1st, 3rd for visual rendering
  const getPodiumOrder = (teams) => {
    if (teams.length === 0) return [];
    if (teams.length === 1) return [teams[0]];
    if (teams.length === 2) return [teams[1], teams[0]];
    return [teams[1], teams[0], teams[2]];
  };

  const podiumOrdered = getPodiumOrder(podiumTeams);

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div className="header-branding">
          <h2>TED<span>X</span>pedition Leaderboard</h2>
          <span className="live-badge font-mono">● LIVE UPDATES</span>
        </div>
        <Link to="/" className="btn btn-secondary back-home-btn">
          🏠 Home
        </Link>
      </header>

      <main className="leaderboard-content">
        {loading ? (
          <div className="leaderboard-loading">
            <div className="spinner"></div>
            <h3>Loading Live Rankings...</h3>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="glass-card empty-leaderboard glow-red">
            <h3>No Scores Logged Yet</h3>
            <p>Once teams start completing stalls, the live ranking will display here.</p>
          </div>
        ) : (
          <>
            {/* Podium Visual Section */}
            {podiumTeams.length > 0 && (
              <section className="podium-section">
                {podiumOrdered.map((team) => {
                  const originalIdx = leaderboardData.findIndex(t => t.teamId === team.teamId);
                  const rank = originalIdx + 1;
                  let medal = "🥇";
                  let rankClass = "first";
                  if (rank === 2) {
                    medal = "🥈";
                    rankClass = "second";
                  } else if (rank === 3) {
                    medal = "🥉";
                    rankClass = "third";
                  }

                  return (
                    <div key={team.teamId} className={`podium-column ${rankClass}`}>
                      <div className="podium-team-card glass-card">
                        <span className="podium-medal">{medal}</span>
                        <h4 className="podium-team-name">{team.teamName}</h4>
                        <span className="podium-team-id font-mono">{team.teamId}</span>
                        <div className="podium-score-pill">{team.totalScore} pts</div>
                        <span className="podium-time font-mono">⏱️ {formatTime(team.totalTime)}</span>
                      </div>
                      <div className={`podium-base ${rankClass}`}>
                        <span className="podium-number">{rank}</span>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Table Section for all/remaining teams */}
            <section className="glass-card leaderboard-table-card glow-red">
              <h3>Expedition Standings</h3>
              <div className="table-wrapper">
                <table className="ranks-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team ID</th>
                      <th>Team Name</th>
                      <th>Stalls Done</th>
                      <th>Total Time</th>
                      <th>Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((team, idx) => {
                      const rank = idx + 1;
                      let rankBadge = rank;
                      if (rank === 1) rankBadge = "🥇";
                      else if (rank === 2) rankBadge = "🥈";
                      else if (rank === 3) rankBadge = "🥉";

                      return (
                        <tr key={team.teamId} className={rank <= 3 ? `top-row rank-${rank}` : ""}>
                          <td className="rank-col font-mono bold">{rankBadge}</td>
                          <td className="font-mono text-muted">{team.teamId}</td>
                          <td className="bold">{team.teamName}</td>
                          <td>
                            {team.currentStall > 7 ? (
                              <span className="finished-badge font-mono">FINISHED</span>
                            ) : (
                              `Stall ${team.currentStall - 1} / 6`
                            )}
                          </td>
                          <td className="font-mono">{formatTime(team.totalTime)}</td>
                          <td className="score-col bold">{team.totalScore} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
