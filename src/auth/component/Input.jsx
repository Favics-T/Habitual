import React from 'react';

function Input({ placeholder, value, name, type = "text", icon, onChange }) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'on'}
        className={`w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none ring-emerald-500 focus:ring ${
          icon ? 'pl-10' : ''
        }`}
      />
    </div>
  );
}

export default Input;
