'use client';

import { useState, useEffect } from 'react';

interface DebateTimerProps {
  durationInSeconds: number;
  onTimeUp: () => void;
}

export function DebateTimer({ durationInSeconds, onTimeUp }: DebateTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timerColor = timeLeft < 60 ? 'text-destructive' : 'text-primary';

  return (
    <div className={`font-mono text-3xl font-bold ${timerColor}`}>
      {timeLeft > 0 ? (
        <span>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      ) : (
        <span>Time's Up!</span>
      )}
    </div>
  );
}
