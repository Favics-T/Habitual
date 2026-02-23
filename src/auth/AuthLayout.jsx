import React from 'react';
import { Outlet } from 'react-router-dom';
import Image from '../assets/OnboardingImage.jpg';

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="hidden w-2/5 items-center justify-center p-6 lg:flex">
        <img
          src={Image}
          alt="Welcome to Habitual"
          className="h-[85vh] w-full rounded-3xl object-cover shadow-xl"
        />
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
