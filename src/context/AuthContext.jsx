import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext();


export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  //  Current authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  //  Form state (generic, can be used for login or signup)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  //  Persist currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  //  Update form input
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  //  Reset form
  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', password: '', company: '' });
  }, []);

  //  Login function
  const login = useCallback((e) => {
    e.preventDefault();

    // Simulate fetching user from database (later: Supabase)
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (
      storedUser &&
      storedUser.email === formData.email &&
      storedUser.password === formData.password
    ) {
      setCurrentUser(storedUser);
      resetForm();
      navigate('/home');
    } else {
      alert('Invalid email or password');
    }
  }, [formData, navigate, resetForm]);

  //  Logout function
  const logout = useCallback(() => {
    setCurrentUser(null);
    navigate('/login');
  }, [navigate]);

  //  Registration function
  const register = useCallback((e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      alert('Email and password required');
      return;
    }

    // Save user in localStorage (Supabase will come in later)
    localStorage.setItem('registeredUser', JSON.stringify(formData));

    setCurrentUser(formData);
    resetForm();
    navigate('/home');
  }, [formData, navigate, resetForm]);

  return (
    <AuthContext.Provider
      value={{
        formData,
        handleInputChange,
        resetForm,
        currentUser,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
