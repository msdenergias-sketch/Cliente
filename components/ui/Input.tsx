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
        <label className="text-neon-400 text-[11px] font-bold uppercase tracking-wider mb-1 ml-1 flex items-center gap-1.5 opacity-90">
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
            w-full bg-dark-900 text-gray-200 text-sm rounded border transition-all duration-200 outline-none
            placeholder-gray-700 h-[38px]
            ${Icon ? 'pl-9 pr-3' : 'px-3'} 
            ${error 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-gray-800 focus:border-neon-500 focus:shadow-[0_0_8px_rgba(34,197,94,0.3)] hover:border-gray-700'
            }
          `}
          autoComplete="off"
          {...props}
        />
      </div>
      {error && (
        <span className="text-red-400 text-[10px] mt-0.5 ml-1 animate-fadeIn font-medium">{error}</span>
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
      <label className="text-neon-400 text-[11px] font-bold uppercase tracking-wider mb-1 ml-1 flex items-center gap-1.5 opacity-90">
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
            w-full bg-dark-900 text-gray-200 text-sm rounded border border-gray-800 
            focus:border-neon-500 focus:shadow-[0_0_8px_rgba(34,197,94,0.3)] hover:border-gray-700
            transition-all duration-200 outline-none appearance-none cursor-pointer h-[38px]
            ${Icon ? 'pl-9 pr-8' : 'px-3'} 
          `}
          {...props}
        >
          <option value="" disabled>Selecione...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 group-hover:text-neon-500 transition-colors">
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
      <label className="text-neon-400 text-[11px] font-bold uppercase tracking-wider mb-1 ml-1">
        {label}
      </label>
      <textarea
        className="bg-dark-900 border border-gray-800 text-gray-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-neon-500 focus:shadow-neon transition-all duration-200 placeholder-gray-700 resize-none"
        {...props}
      />
    </div>
  );
};