import React, { useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AuthLayout from './auth/AuthLayout';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import Onboard1 from './page/onboarding/Onboard1';
import Dashboard from './page/dashboard/Dashboard';
import { AuthContext } from './context/auth-context';

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboard1" element={<Onboard1 />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default App;
