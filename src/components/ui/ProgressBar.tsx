import React from 'react';

interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'teal' | 'red';
  showLabel?: boolean;
  animated?: boolean;
}

const colorMap = {
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  red: 'bg-red-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  color = 'emerald',
  showLabel = false,
  animated = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full ${sizeMap[size]} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${sizeMap[size]} ${colorMap[color]} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
