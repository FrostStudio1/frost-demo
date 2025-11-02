// app/components/ProjectProgressBar.tsx
import React from "react";

export interface ProjectProgressBarProps {
  current: number; // timmar förbrukat
  max: number;     // budget timmar
}
const getBarColor = (percent: number) => {
  if (percent < 70) return "bg-gradient-to-r from-blue-400 to-blue-600";
  if (percent < 100) return "bg-gradient-to-r from-yellow-400 to-red-500";
  return "bg-gradient-to-r from-red-600 to-red-700";
};

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({ current, max }) => {
  const safeMax = max > 0 ? max : 0
  const rawPercent = safeMax ? (current / safeMax) * 100 : 0
  const percent = Math.round(Number.isFinite(rawPercent) ? rawPercent : 0)
  const clampedPercent = Math.min(Math.max(percent, 0), 999)
  return (
    <div className="w-full mb-2">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span>{current} h</span>
        <span>{clampedPercent}%</span>
        <span>{max} h</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-700 ${getBarColor(clampedPercent)}`}
          style={{ width: `${Math.min(clampedPercent, 100)}%` }}
        ></div>
      </div>
      {clampedPercent >= 100 && (
        <div className="text-red-500 text-xs mt-1">🔴 Överstiger budget!</div>
      )}
    </div>
  );
};
export default ProjectProgressBar;

