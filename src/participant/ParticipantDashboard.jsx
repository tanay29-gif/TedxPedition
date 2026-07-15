import { useTeam } from '../hooks/useTeam.js';
import TeamDetails from './components/TeamDetails.jsx';
import CurrentStall from './components/CurrentStall.jsx';
import CurrentClue from './components/CurrentClue.jsx';
import Coins from './components/Coins.jsx';
import Timer from './components/Timer.jsx';
import ProgressTracker from './components/ProgressTracker.jsx';
import FinalLocationSubmission from './components/FinalLocationSubmission.jsx';
import GameNavigation from './components/GameNavigation.jsx';
import './ParticipantDashboard.css';

const ParticipantDashboard = () => {
  const { team, loading, error } = useTeam();

  if (loading) return <p>Loading your dashboard...</p>;

  if (error) {
    return (
      <div className="dashboard-container">
        <h2>Participant Dashboard</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>
          If you just signed in, make sure your admin has created your team
          and given you the correct Team Code.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {team.teamName}</h2>
      <div className="dashboard-grid">
        <TeamDetails team={team} />
        <CurrentStall team={team} />
        <CurrentClue team={team} />
        <Coins team={team} />
        <Timer team={team} />
        <ProgressTracker team={team} />
        <GameNavigation />
        <FinalLocationSubmission team={team} />
      </div>
    </div>
  );
};

export default ParticipantDashboard;
