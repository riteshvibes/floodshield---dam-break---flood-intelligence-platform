import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  formatter?: (val: number) => string;
  durationMs?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  formatter,
  durationMs = 800,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startVal = displayValue;
    const endVal = value;
    if (startVal === endVal) return;

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endVal);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, durationMs]);

  if (formatter) {
    return <span>{formatter(displayValue)}</span>;
  }

  return (
    <span>
      {decimals > 0
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toLocaleString()}
    </span>
  );
};
