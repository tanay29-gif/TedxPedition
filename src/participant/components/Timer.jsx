import { useEffect, useState } from 'react';

// Converts a Firestore Timestamp (or Date) into milliseconds
const toMillis = (value) => {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis(); // Firestore Timestamp
  return new Date(value).getTime();
};

const formatTime = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Timer = ({ team }) => {
  const [remaining, setRemaining] = useState(null);

  const startMillis = toMillis(team.startTime);
  const limitMillis = (team.timeLimitMinutes || 0) * 60 * 1000;
  const hasTimer = Boolean(startMillis && limitMillis);

  useEffect(() => {
    if (!hasTimer) return;

    const endTime = startMillis + limitMillis;

    const tick = () => setRemaining(endTime - Date.now());

    tick(); // run immediately so there's no 1-second delay on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [hasTimer, startMillis, limitMillis]);

  return (
    <div className="card">
      <h3>Time Remaining</h3>
      {!hasTimer || remaining === null ? (
        <p>Timer hasn't started yet.</p>
      ) : (
        <p className={`highlight ${remaining <= 60000 ? 'timer-warning' : ''}`}>
          {formatTime(remaining)}
        </p>
      )}
    </div>
  );
};

export default Timer;
