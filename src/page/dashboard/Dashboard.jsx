import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/auth-context';

const HABITS_KEY = 'habitual_habits';
const SHARED_SNAPSHOTS_KEY = 'habitual_shared_snapshots';
const FRIENDS_KEY = 'habitual_friends';
const THEME_KEY = 'habitual_theme';

const getToday = () => new Date().toISOString().slice(0, 10);

const getDateOffset = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const getHabitsStore = () => JSON.parse(localStorage.getItem(HABITS_KEY) || '{}');

const getSnapshotsStore = () => JSON.parse(localStorage.getItem(SHARED_SNAPSHOTS_KEY) || '{}');

const getFriendsStore = () => JSON.parse(localStorage.getItem(FRIENDS_KEY) || '{}');

const getUserHabits = (email) => {
  const store = getHabitsStore();
  return store[email] || [];
};

const getUserSnapshots = (email) => {
  const store = getSnapshotsStore();
  return store[email] || [];
};

const getUserFriends = (email) => {
  const store = getFriendsStore();
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

const saveUserSnapshots = (email, snapshots) => {
  const store = getSnapshotsStore();
  localStorage.setItem(
    SHARED_SNAPSHOTS_KEY,
    JSON.stringify({
      ...store,
      [email]: snapshots,
    }),
  );
};

const saveUserFriends = (email, friends) => {
  const store = getFriendsStore();
  localStorage.setItem(
    FRIENDS_KEY,
    JSON.stringify({
      ...store,
      [email]: friends,
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

const getWeekCompletions = (habits) => {
  const keys = [0, -1, -2, -3, -4, -5, -6].map((offset) => getDateOffset(offset));
  return habits.reduce(
    (count, habit) => count + habit.completedDates.filter((date) => keys.includes(date)).length,
    0,
  );
};

const getHeatmapData = (habits, days = 14) => {
  const map = {};
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = getDateOffset(-i);
    map[key] = 0;
  }

  habits.forEach((habit) => {
    habit.completedDates.forEach((date) => {
      if (map[date] !== undefined) map[date] += 1;
    });
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
};

const getHeatColor = (count) => {
  if (count >= 4) return 'bg-emerald-700';
  if (count >= 2) return 'bg-emerald-500';
  if (count === 1) return 'bg-emerald-300';
  return 'bg-slate-200';
};

const getAchievementBadges = ({ bestStreak, completionRate, total, doneToday, weekCompletions }) => {
  const badges = [];
  if (doneToday > 0) badges.push('Action Taker');
  if (total >= 5) badges.push('Habit Builder');
  if (bestStreak >= 7) badges.push('7-Day Streak');
  if (completionRate >= 80 && total > 0) badges.push('Consistency Pro');
  if (weekCompletions >= 15) badges.push('High Momentum');
  return badges;
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString();
};

const getReminderStatus = (habit, today) => {
  if (!habit.reminderTime || habit.completedDates.includes(today)) return '';
  const now = new Date();
  const [hours, minutes] = habit.reminderTime.split(':').map(Number);
  const reminder = new Date();
  reminder.setHours(hours || 0, minutes || 0, 0, 0);
  const diffMins = Math.round((reminder.getTime() - now.getTime()) / 60000);

  if (diffMins >= 0 && diffMins <= 60) return 'Due within 1 hour';
  if (diffMins < 0 && diffMins >= -120) return 'Overdue';
  return '';
};

export default function Dashboard() {
  const { currentUser, getCurrentGoal, logout } = useContext(AuthContext);
  const [habits, setHabits] = useState(() => getUserHabits(currentUser?.email));
  const [sharedSnapshots, setSharedSnapshots] = useState(() => getUserSnapshots(currentUser?.email));
  const [friends, setFriends] = useState(() => getUserFriends(currentUser?.email));
  const [form, setForm] = useState({
    name: '',
    category: '',
    frequency: 'daily',
    priority: 'medium',
    reminderTime: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [friendName, setFriendName] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const fileInputRef = useRef(null);
  const today = getToday();

  const goal = getCurrentGoal();
  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const upsertHabits = (nextHabits) => {
    setHabits(nextHabits);
    saveUserHabits(currentUser.email, nextHabits);
  };

  const upsertFriends = (nextFriends) => {
    setFriends(nextFriends);
    saveUserFriends(currentUser.email, nextFriends);
  };

  const upsertSnapshots = (nextSnapshots) => {
    setSharedSnapshots(nextSnapshots);
    saveUserSnapshots(currentUser.email, nextSnapshots);
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      frequency: 'daily',
      priority: 'medium',
      reminderTime: '',
      notes: '',
    });
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newHabit = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      frequency: form.frequency,
      priority: form.priority,
      reminderTime: form.reminderTime,
      notes: form.notes.trim(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    upsertHabits([newHabit, ...habits]);
    resetForm();
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
      priority: habit.priority || 'medium',
      reminderTime: habit.reminderTime || '',
      notes: habit.notes || '',
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
            priority: form.priority,
            reminderTime: form.reminderTime,
            notes: form.notes.trim(),
          }
        : habit
    ));

    upsertHabits(nextHabits);
    setEditingId('');
    resetForm();
  };

  const handleExportSnapshot = () => {
    const payload = {
      type: 'habitual-share-snapshot',
      version: 1,
      generatedAt: new Date().toISOString(),
      owner: {
        name: currentUser?.name || 'Habitual User',
        email: currentUser?.email || '',
        goal: goal || '',
      },
      summary: {
        weekCompletions: getWeekCompletions(habits),
        totalHabits: habits.length,
      },
      habits,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `habitual-${(currentUser?.name || 'snapshot').replace(/\s+/g, '-').toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSnapshot = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed?.type !== 'habitual-share-snapshot' || !Array.isArray(parsed?.habits)) {
        alert('Invalid snapshot file.');
        return;
      }

      const importedHabits = parsed.habits;
      const friendSnapshot = {
        id: crypto.randomUUID(),
        ownerName: parsed.owner?.name || 'Friend',
        ownerEmail: parsed.owner?.email || '',
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        weekCompletions: parsed.summary?.weekCompletions ?? getWeekCompletions(importedHabits),
        totalHabits: parsed.summary?.totalHabits ?? importedHabits.length,
      };

      const alreadyExists = sharedSnapshots.some(
        (item) => item.ownerEmail && item.ownerEmail === friendSnapshot.ownerEmail,
      );

      if (alreadyExists) {
        const replaced = sharedSnapshots.map((item) => (
          item.ownerEmail && item.ownerEmail === friendSnapshot.ownerEmail ? friendSnapshot : item
        ));
        upsertSnapshots(replaced);
      } else {
        upsertSnapshots([friendSnapshot, ...sharedSnapshots]);
      }
    } catch {
      alert('Could not import snapshot.');
    } finally {
      event.target.value = '';
    }
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    const trimmed = friendName.trim();
    if (!trimmed) return;
    const exists = friends.some((name) => name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    upsertFriends([...friends, trimmed]);
    setFriendName('');
  };

  const removeFriend = (nameToRemove) => {
    upsertFriends(friends.filter((friend) => friend !== nameToRemove));
  };

  let visibleHabits = habits.filter((habit) => {
    const reminderMatch = habit.reminderTime ? habit.reminderTime : '';
    const text = `${habit.name} ${habit.category} ${habit.notes || ''} ${reminderMatch}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });

  if (filter === 'completed') {
    visibleHabits = visibleHabits.filter((habit) => habit.completedDates.includes(today));
  }
  if (filter === 'pending') {
    visibleHabits = visibleHabits.filter((habit) => !habit.completedDates.includes(today));
  }
  if (filter === 'high') {
    visibleHabits = visibleHabits.filter((habit) => habit.priority === 'high');
  }
  if (sortBy === 'streak_desc') {
    visibleHabits = [...visibleHabits].sort(
      (a, b) => calculateStreak(b.completedDates) - calculateStreak(a.completedDates),
    );
  }
  if (sortBy === 'name_asc') {
    visibleHabits = [...visibleHabits].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortBy === 'created_desc') {
    visibleHabits = [...visibleHabits].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const total = habits.length;
  const doneToday = habits.filter((habit) => habit.completedDates.includes(today)).length;
  const completionRate = total ? Math.round((doneToday / total) * 100) : 0;
  const bestStreak = habits.reduce(
    (max, habit) => Math.max(max, calculateStreak(habit.completedDates)),
    0,
  );
  const weekCompletions = getWeekCompletions(habits);
  const consistency = Math.min(100, Math.round((weekCompletions / Math.max(total * 7, 1)) * 100));
  const stats = { total, doneToday, completionRate, bestStreak, weekCompletions, consistency };

  const heatmap = getHeatmapData(habits, 14);
  const badges = getAchievementBadges(stats);

  const myScore = {
    ownerName: currentUser?.name || 'Me',
    ownerEmail: currentUser?.email || '',
    weekCompletions: weekCompletions,
    totalHabits: total,
    generatedAt: new Date().toISOString(),
  };

  const leaderboard = [myScore, ...sharedSnapshots]
    .sort((a, b) => b.weekCompletions - a.weekCompletions)
    .slice(0, 8);

  return (
    <div
      className={`min-h-screen px-3 py-6 transition-colors sm:px-4 sm:py-8 md:px-8 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-linear-to-r from-emerald-700 to-teal-600 p-4 text-white shadow-lg sm:rounded-3xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100">Personal Workspace</p>
              <h1 className="text-2xl font-bold sm:text-3xl">{currentUser?.name || 'Habitual User'}</h1>
              {goal && (
                <p className="mt-2 text-sm text-emerald-100">
                  Goal: <span className="font-semibold text-white">{goal}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                type="button"
                onClick={handleExportSnapshot}
                className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"
              >
                Export Snapshot
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-slate-950/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-slate-950/30"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Habits</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.total}</h2>
          </article>
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed Today</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.doneToday}</h2>
          </article>
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Best Streak</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.bestStreak}</h2>
          </article>
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Weekly Completions</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.weekCompletions}</h2>
          </article>
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily Completion</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.completionRate}%</h2>
          </article>
          <article className={`rounded-2xl p-4 shadow-sm lg:col-span-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Consistency Score</p>
            <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.consistency}%</h2>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className={`rounded-2xl p-5 shadow-sm lg:col-span-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">14-Day Consistency</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Darker = more completions</p>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {heatmap.map((item) => (
                <div key={item.date} className="space-y-1 text-center">
                  <div
                    className={`h-7 rounded-md ${getHeatColor(item.count)}`}
                    title={`${item.date}: ${item.count} completions`}
                  />
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.date.slice(5)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.length === 0 && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No badges yet. Keep completing habits daily.</p>
              )}
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          </article>

          <article className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Friends Leaderboard</h2>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No backend: share/export snapshot JSON and import each other&apos;s files.
            </p>
            <div className="mt-3 space-y-2">
              {leaderboard.map((entry, index) => (
                <div key={`${entry.ownerEmail}-${entry.ownerName}-${index}`} className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {index + 1}. {entry.ownerName}
                    </p>
                    <p className="text-sm font-bold text-emerald-700">{entry.weekCompletions}</p>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Habits: {entry.totalHabits} | Updated: {formatDate(entry.generatedAt)}
                  </p>
                </div>
              ))}
              {leaderboard.length === 1 && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Import a friend snapshot to compare progress.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 w-full rounded-xl border px-3 py-2 text-sm font-semibold ${
                isDark
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Import Friend Snapshot
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportSnapshot}
              className="hidden"
            />
          </article>
        </section>

        <section className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {editingId ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <form
            onSubmit={editingId ? handleUpdate : handleAddHabit}
            className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Habit name"
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category"
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm((prev) => ({ ...prev, reminderTime: e.target.value }))}
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <input
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes or why this habit matters"
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring md:col-span-2 xl:col-span-2 ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <div className="flex gap-2 md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white hover:bg-emerald-800"
              >
                {editingId ? 'Update Habit' : 'Add Habit'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId('');
                    resetForm();
                  }}
                  className={`rounded-xl border px-3 py-2 font-semibold ${
                    isDark
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits, categories, notes..."
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring lg:col-span-2 ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            >
              <option value="created_desc">Newest first</option>
              <option value="streak_desc">Highest streak</option>
              <option value="name_asc">Name A-Z</option>
            </select>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {['all', 'pending', 'completed', 'high'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold capitalize sm:text-sm ${
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
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className={`text-lg font-semibold sm:text-xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Today&apos;s Habits</h2>
          <div className="mt-4 space-y-3">
            {visibleHabits.length === 0 && (
              <p className={`rounded-xl p-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                No habits in this filter.
              </p>
            )}
            {visibleHabits.map((habit) => {
              const isDoneToday = habit.completedDates.includes(today);
              const streak = calculateStreak(habit.completedDates);
              const reminderStatus = getReminderStatus(habit, today);
              return (
                <article
                  key={habit.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isDark ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-semibold sm:text-base ${
                        isDoneToday
                          ? 'text-slate-500 line-through'
                          : isDark
                            ? 'text-slate-100'
                            : 'text-slate-900'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {habit.category} | {habit.frequency} | Priority: {habit.priority || 'medium'} | Streak: {streak} day
                      {streak === 1 ? '' : 's'}
                    </p>
                    {habit.notes && <p className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{habit.notes}</p>}
                    {(habit.reminderTime || reminderStatus) && (
                      <p className="mt-1 text-xs text-amber-700">
                        Reminder: {habit.reminderTime || '--:--'} {reminderStatus ? `| ${reminderStatus}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
                    <button
                      type="button"
                      onClick={() => handleToggleToday(habit.id)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold sm:py-1 ${
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
                      className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 sm:py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(habit.id)}
                      className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-200 sm:py-1"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={`rounded-2xl p-5 shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Friends List (Local)</h2>
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Keep your small private circle here. This list stays only in local storage.
          </p>
          <form onSubmit={handleAddFriend} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Add friend name"
              className={`w-full rounded-xl border px-3 py-2 outline-none ring-emerald-500 focus:ring ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200'
              }`}
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Add Friend
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {friends.length === 0 && (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No friends added yet.</p>
            )}
            {friends.map((friend) => (
              <button
                key={friend}
                type="button"
                onClick={() => removeFriend(friend)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {friend} x
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
