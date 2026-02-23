import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import ProgressBar from '../ProgressBar';
import GoalOption from './GoalOption';

const goals = [
  'Build discipline and consistency',
  'Reduce stress and feel balanced',
  'Improve fitness and energy',
  'Increase focus and productivity',
];

export default function OnboardingStep() {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { saveGoal, getCurrentGoal } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedGoal) return;
    saveGoal(selectedGoal);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-3xl sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">
          Build better routines with Habitual
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Pick a goal so we can personalize your dashboard.
        </p>

        <div className="mt-6 flex justify-center">
          <ProgressBar currentStep={1} totalSteps={2} />
        </div>

        <p className="mt-8 font-semibold text-slate-700">Select your primary goal</p>
        <div className="mx-auto mt-6 w-full max-w-md space-y-3">
          {goals.map((goal) => (
            <GoalOption
              key={goal}
              label={goal}
              selected={selectedGoal === goal}
              onClick={() => setSelectedGoal(goal)}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedGoal}
            className={`w-full rounded-xl py-3 font-semibold text-white transition ${
              selectedGoal
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'cursor-not-allowed bg-emerald-300'
            }`}
          >
            Continue
          </button>
        </div>

        {getCurrentGoal() && (
          <p className="mt-4 text-sm text-slate-500">
            Existing goal: <span className="font-semibold text-slate-700">{getCurrentGoal()}</span>
          </p>
        )}
      </div>
    </div>
  );
}
