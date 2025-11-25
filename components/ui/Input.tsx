import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const NeonInput: React.FC<InputProps> = ({ label, icon: Icon, error, className, ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-neon-400 text-sm font-bold mb-2 ml-1 flex items-center gap-1.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-neon-500'}`}>
            <Icon size={20} />
          </div>
        )}
        <input
          className={`
            w-full bg-dark-900 text-gray-100 text-base rounded-lg py-3 
            ${Icon ? 'pl-10 pr-4' : 'px-4'} 
            border transition-all duration-300 outline-none
            placeholder-gray-600
            ${error 
              ? 'border-red-500 focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
              : 'border-neon-900 focus:border-neon-500 focus:shadow-neon'
            }
          `}
          autoComplete="off"
          {...props}
        />
      </div>
      {error && (
        <span className="text-red-400 text-xs mt-1 ml-1 animate-fadeIn font-medium">{error}</span>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  icon?: LucideIcon;
}

export const NeonSelect: React.FC<SelectProps> = ({ label, options, icon: Icon, className, ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-neon-400 text-sm font-bold mb-2 ml-1 flex items-center gap-1.5 tracking-wide">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-neon-500 transition-colors duration-300">
            <Icon size={20} />
          </div>
        )}
        <select
          className={`
            w-full bg-dark-900 text-gray-100 text-base rounded-lg py-3 
            ${Icon ? 'pl-10 pr-10' : 'px-4'} 
            border border-neon-900 focus:border-neon-500 focus:shadow-neon 
            transition-all duration-300 outline-none appearance-none cursor-pointer
          `}
          {...props}
        >
          <option value="" disabled>Selecione...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neon-500">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const NeonTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className, ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-neon-400 text-sm font-bold mb-2 ml-1 tracking-wide">
        {label}
      </label>
      <textarea
        className="bg-dark-900 border border-neon-900 text-gray-100 text-base rounded-lg px-4 py-3 focus:outline-none focus:border-neon-500 focus:shadow-neon transition-all duration-300 placeholder-gray-600 resize-none h-32"
        {...props}
      />
    </div>
  );
};