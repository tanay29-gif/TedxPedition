import { useNavigate } from 'react-router-dom';

// This links out to Module 4 (Games) routes. Those routes/screens don't
// exist yet — build them when you get to Module 4. The buttons are wired
// up now so the dashboard is ready to use them the moment they exist.
const GameNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>Online Games</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/games/blockly')}>
          Blockly Coding Game
        </button>
        <button onClick={() => navigate('/games/qr-puzzle')}>
          TED Talk QR Puzzle
        </button>
      </div>
    </div>
  );
};

export default GameNavigation;
