import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 1400,
  className = ''
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [count, setCount] = useState<number>(0);

  // Extract number and affix (e.g. "1,203+" -> prefix "", num 1203, suffix "+")
  const match = value.match(/^([^0-9]*)([\d,]+)(.*)$/);
  const prefix = match ? match[1] : '';
  const rawNumStr = match ? match[2].replace(/,/g, '') : '';
  const suffix = match ? match[3] : '';
  const targetNum = match ? parseInt(rawNumStr, 10) : NaN;
  const isNumeric = !isNaN(targetNum);

  // Viewport intersection observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If IntersectionObserver is not supported, trigger immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Run count-up animation only when element enters the viewport
  useEffect(() => {
    if (!isInView || !isNumeric) return;

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
  }, [isInView, isNumeric, targetNum, durationMs]);

  if (!isNumeric) {
    return (
      <span
        ref={containerRef}
        className={`inline-block transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        } ${className}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={`inline-block transition-opacity duration-300 ${
        isInView ? 'opacity-100' : 'opacity-40'
      } ${className}`}
    >
      {prefix}
      {isInView ? count.toLocaleString() : '0'}
      {suffix}
    </span>
  );
};
