import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/auth-context';

const HABITS_KEY = 'habitual_habits';

const getToday = () => new Date().toISOString().slice(0, 10);

const getHabitsStore = () => JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');

const getUserHabits = (email) => {
  const store = getHabitsStore();
  return store[email] || [];
};

const saveUserHabits = (email, habits) => {
  const store = getHabitsStore();
  localStorage.setItem(
    HABITS_KEY,
    JSON.stringify({
      ...store,
      [email]: habits,
    }),
  );
};

const calculateStreak = (completedDates) => {
  if (!completedDates?.length) return 0;
  const dateSet = new Set(completedDates);
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak += 1;
  }

  return streak;
};

export default function Dashboard() {
  const { currentUser, getCurrentGoal, logout } = useContext(AuthContext);
  const [habits, setHabits] = useState(() => getUserHabits(currentUser?.email));
  const [form, setForm] = useState({ name: '', category: '', frequency: 'daily' });
  const [editingId, setEditingId] = useState('');
  const [filter, setFilter] = useState('all');
  const today = getToday();

  const goal = getCurrentGoal();

  const upsertHabits = (nextHabits) => {
    setHabits(nextHabits);
    saveUserHabits(currentUser.email, nextHabits);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newHabit = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      frequency: form.frequency,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    upsertHabits([newHabit, ...habits]);
    setForm({ name: '', category: '', frequency: 'daily' });
  };

  const handleDelete = (id) => {
    upsertHabits(habits.filter((habit) => habit.id !== id));
  };

  const handleToggleToday = (id) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;
      const isDoneToday = habit.completedDates.includes(today);
      return {
        ...habit,
        completedDates: isDoneToday
          ? habit.completedDates.filter((date) => date !== today)
          : [...habit.completedDates, today],
      };
    });

    upsertHabits(nextHabits);
  };

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setForm({
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId || !form.name.trim()) return;

    const nextHabits = habits.map((habit) => (
      habit.id === editingId
        ? {
            ...habit,
            name: form.name.trim(),
            category: form.category.trim() || 'General',
            frequency: form.frequency,
          }
        : habit
    ));

    upsertHabits(nextHabits);
    setEditingId('');
    setForm({ name: '', category: '', frequency: 'daily' });
  };

  let visibleHabits = habits;
  if (filter === 'completed') {
    visibleHabits = habits.filter((habit) => habit.completedDates.includes(today));
  }
  if (filter === 'pending') {
    visibleHabits = habits.filter((habit) => !habit.completedDates.includes(today));
  }

  const total = habits.length;
  const doneToday = habits.filter((habit) => habit.completedDates.includes(today)).length;
  const completionRate = total ? Math.round((doneToday / total) * 100) : 0;
  const bestStreak = habits.reduce(
    (max, habit) => Math.max(max, calculateStreak(habit.completedDates)),
    0,
  );
  const stats = { total, doneToday, completionRate, bestStreak };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100">Welcome back</p>
              <h1 className="text-3xl font-bold">{currentUser?.name || 'Habitual User'}</h1>
              {goal && (
                <p className="mt-2 text-sm text-emerald-100">
                  Goal: <span className="font-semibold text-white">{goal}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Habits</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</h2>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Completed Today</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{stats.doneToday}</h2>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Daily Completion</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{stats.completionRate}%</h2>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Best Streak</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{stats.bestStreak} days</h2>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingId ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <form
            onSubmit={editingId ? handleUpdate : handleAddHabit}
            className="mt-4 grid gap-3 md:grid-cols-4"
          >
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Habit name"
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring"
            />
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category (Health, Work...)"
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring"
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white hover:bg-emerald-800"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId('');
                    setForm({ name: '', category: '', frequency: 'daily' });
                  }}
                  className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Today&apos;s Habits</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'completed'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-3 py-1 text-sm font-semibold capitalize ${
                    filter === value
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {visibleHabits.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
                No habits in this filter.
              </p>
            )}
            {visibleHabits.map((habit) => {
              const isDoneToday = habit.completedDates.includes(today);
              const streak = calculateStreak(habit.completedDates);
              return (
                <article
                  key={habit.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold ${isDoneToday ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {habit.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {habit.category} | {habit.frequency} | Streak: {streak} day{streak === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleToday(habit.id)}
                      className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                        isDoneToday
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isDoneToday ? 'Completed' : 'Mark Done'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(habit)}
                      className="rounded-xl bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 hover:bg-amber-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(habit.id)}
                      className="rounded-xl bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
