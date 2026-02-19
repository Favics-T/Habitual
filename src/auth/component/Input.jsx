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
        className={`border p-2 outline-none text-[#222222] border-[#A6B28B] w-full rounded-xl 
          ${icon ? "pl-10" : ""}`}
      />
    </div>
  );
}

export default Input;
