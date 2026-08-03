import { useEffect, useState } from "react";
import "./Timer.css";

export default function Timer({ startedAt, endedAt, className = "" }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const getMs = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().getTime();
    }
    if (typeof timestamp === "object" && timestamp.seconds) {
      return timestamp.seconds * 1000;
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (typeof timestamp === "number" || typeof timestamp === "string") {
      return new Date(timestamp).getTime();
    }
    return null;
  };

  useEffect(() => {
    const startMs = getMs(startedAt);
    const endMs = getMs(endedAt);

    if (!startMs) {
      setElapsedSeconds(0);
      return;
    }

    if (endMs) {
      const diffSecs = Math.max(0, Math.floor((endMs - startMs) / 1000));
      setElapsedSeconds(diffSecs);
      return;
    }

    // Timer is active and running
    const updateTimer = () => {
      const currentMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((currentMs - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer(); // run once immediately
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [startedAt, endedAt]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className={`stall-timer ${className} ${!endedAt && startedAt ? "active" : ""}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-digits">{startedAt ? formatTime(elapsedSeconds) : "00:00"}</span>
    </div>
  );
}
