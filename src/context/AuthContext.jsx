import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth-context';

const USERS_KEY = 'habitual_users';
const CURRENT_USER_KEY = 'habitual_current_user';
const GOALS_KEY = 'habitual_goals';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getGoals = () => JSON.parse(localStorage.getItem(GOALS_KEY) || '{}');

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      return;
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
  };

  const hasOnboardingGoal = (email) => {
    const goals = getGoals();
    return Boolean(goals[email]);
  };

  const register = (e) => {
    e.preventDefault();
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!formData.name.trim() || !normalizedEmail || !formData.password) {
      alert('Name, email, and password are required.');
      return;
    }

    const users = getUsers();
    const exists = users.some((user) => user.email === normalizedEmail);
    if (exists) {
      alert('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      email: normalizedEmail,
      password: formData.password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    resetForm();
    navigate('/onboard1');
  };

  const login = (e) => {
    e.preventDefault();
    const normalizedEmail = formData.email.trim().toLowerCase();
    const users = getUsers();
    const matchedUser = users.find((user) => user.email === normalizedEmail);

    if (!matchedUser || matchedUser.password !== formData.password) {
      alert('Invalid email or password.');
      return;
    }

    setCurrentUser(matchedUser);
    resetForm();
    navigate(hasOnboardingGoal(matchedUser.email) ? '/dashboard' : '/onboard1');
  };

  const saveGoal = (goal) => {
    if (!currentUser?.email) return;
    const goals = getGoals();
    localStorage.setItem(
      GOALS_KEY,
      JSON.stringify({
        ...goals,
        [currentUser.email]: goal,
      }),
    );
  };

  const getCurrentGoal = () => {
    if (!currentUser?.email) return '';
    return getGoals()[currentUser.email] || '';
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    formData,
    handleInputChange,
    resetForm,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    logout,
    register,
    saveGoal,
    getCurrentGoal,
    hasOnboardingGoal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
