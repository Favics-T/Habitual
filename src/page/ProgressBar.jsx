import React from 'react';

export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  return (
    <div className="w-full max-w-md px-1 sm:px-0">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Step {currentStep}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          style={{ width: `${progress}%` }}
          className="h-full rounded-full bg-linear-to-r from-emerald-600 to-teal-500 transition-all duration-300"
        />
      </div>
    </div>
  );
}
