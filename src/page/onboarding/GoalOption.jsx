import React from 'react';

export default function GoalOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold transition ${
        selected
          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
      }`}
    >
      {label}
    </button>
  );
}
