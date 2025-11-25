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
        <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${error ? 'text-red-400' : 'text-gray-500 group-focus-within:text-neon-500'}`}>
            <Icon size={16} />
          </div>
        )}
        <input
          className={`
            w-full bg-dark-900 text-gray-200 text-sm rounded-lg py-2.5 
            ${Icon ? 'pl-9 pr-3' : 'px-3'} 
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
        <span className="text-red-400 text-[10px] mt-0.5 ml-1 animate-fadeIn">{error}</span>
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
      <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1 flex items-center gap-1.5">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-neon-500 transition-colors duration-300">
            <Icon size={16} />
          </div>
        )}
        <select
          className={`
            w-full bg-dark-900 text-gray-200 text-sm rounded-lg py-2.5 
            ${Icon ? 'pl-9 pr-9' : 'px-3'} 
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neon-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
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
      <label className="text-neon-400 text-xs font-bold mb-1.5 ml-1">
        {label}
      </label>
      <textarea
        className="bg-dark-900 border border-neon-900 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-neon-500 focus:shadow-neon transition-all duration-300 placeholder-gray-600 resize-none h-24"
        {...props}
      />
    </div>
  );
};