import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import Input from './component/Input';
import { AuthContext } from '../context/auth-context';

function SocialOption({ icon, text }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default function Login() {
  const { formData, handleInputChange, login } = useContext(AuthContext);

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-sm text-slate-500">Log in and continue your habit streak.</p>
        <div className="mt-4 flex gap-3">
          <SocialOption text="Google" icon={<FcGoogle />} />
          <SocialOption text="Facebook" icon={<FaFacebookF />} />
        </div>
      </div>

      <div className="flex items-center">
        <hr className="grow border-slate-200" />
        <span className="px-3 text-xs font-semibold text-slate-400">OR</span>
        <hr className="grow border-slate-200" />
      </div>

      <form onSubmit={login} className="flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          value={formData.email}
          placeholder="Enter your email"
          onChange={handleInputChange}
        />
        <Input
          name="password"
          type="password"
          value={formData.password}
          placeholder="Enter your password"
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-700 p-2.5 font-semibold text-white transition hover:bg-emerald-800"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account?{' '}
        <Link to="/signup" className="font-bold text-emerald-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
