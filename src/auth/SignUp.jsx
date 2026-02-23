import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import Input from './component/Input';

export default function SignUp() {
  const { formData, handleInputChange, register } = useContext(AuthContext);

  const Option = ({ icon, text }) => (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-sm text-slate-500">Start building your daily momentum.</p>
        <div className="mt-4 flex gap-3">
          <Option text="Google" icon={<FcGoogle />} />
          <Option text="Facebook" icon={<FaFacebookF />} />
        </div>
      </div>

      <div className="flex items-center">
        <hr className="grow border-slate-200" />
        <span className="px-3 text-xs font-semibold text-slate-400">OR</span>
        <hr className="grow border-slate-200" />
      </div>

      <form onSubmit={register} className="flex flex-col gap-4">
        <Input
          name="name"
          type="text"
          value={formData.name}
          placeholder="Full name"
          onChange={handleInputChange}
        />
        <Input
          name="email"
          type="email"
          value={formData.email}
          placeholder="Email address"
          onChange={handleInputChange}
        />
        <Input
          name="password"
          type="password"
          value={formData.password}
          placeholder="Create password"
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-700 p-2.5 font-semibold text-white transition hover:bg-emerald-800"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-emerald-700">
          Login
        </Link>
      </p>
    </div>
  );
}
