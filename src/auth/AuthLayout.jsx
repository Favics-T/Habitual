import React from 'react';
import { Outlet } from 'react-router-dom';
import Image from '../assets/OnboardingImage.jpg';

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="hidden w-2/5 items-center justify-center p-4 lg:flex xl:p-6">
        <img
          src={Image}
          alt="Welcome to Habitual"
          className="h-[82vh] w-full rounded-3xl object-cover shadow-xl xl:h-[85vh]"
        />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
