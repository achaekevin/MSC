import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 1200,
  className = ''
}) => {
  // Extract number and affix (e.g. "1,203+" -> num 1203, suffix "+")
  const match = value.match(/^([^0-9]*)([\d,]+)(.*)$/);
  
  if (!match) {
    return <span className={className}>{value}</span>;
  }

  const prefix = match[1];
  const rawNumStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  const targetNum = parseInt(rawNumStr, 10);

  if (isNaN(targetNum)) {
    return <span className={className}>{value}</span>;
  }

  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Fast snappy ease-out exponential curve
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easedProgress * targetNum);
      
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(targetNum);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetNum, durationMs]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
