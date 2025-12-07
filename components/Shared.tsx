import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User as UserIcon } from 'lucide-react';
import { ViewState } from '../types';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) => {
  const baseStyle = "px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600",
    secondary: "bg-accent-500 text-white shadow-lg shadow-accent-500/30 hover:bg-accent-600",
    outline: "border-2 border-brand-500 text-brand-600 hover:bg-brand-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon
}: {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-1 w-full">
    {label && <label className="text-xs font-medium text-gray-500 uppercase tracking-wide ml-1">{label}</label>}
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3 ${icon ? 'pl-10' : ''} transition-colors`}
      />
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export const BottomNav = ({ 
  currentView, 
  onChangeView 
}: { 
  currentView: ViewState; 
  onChangeView: (view: ViewState) => void 
}) => {
  // If we are in detail views, strictly speaking, a real app might hide the nav or keep it.
  // We'll keep it for easy navigation in this demo.
  
  const navItems = [
    { view: ViewState.HOME, icon: <Home size={24} />, label: 'Explore' },
    // Search is integrated into Home in this simple structure, but could be separate.
    { view: ViewState.POST_AD, icon: <PlusCircle size={24} />, label: 'Post', highlight: true },
    { view: ViewState.CHAT, icon: <MessageCircle size={24} />, label: 'Chat' },
    { view: ViewState.PROFILE, icon: <UserIcon size={24} />, label: 'Profile' },
  ];

  if (currentView === ViewState.ONBOARDING || currentView === ViewState.AUTH) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-safe safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = item.view === currentView;
          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              {item.highlight ? (
                <div className={`p-3 -mt-6 rounded-full shadow-lg ${isActive ? 'bg-brand-600' : 'bg-brand-500'} text-white`}>
                  {item.icon}
                </div>
              ) : (
                item.icon
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Badge = ({ children, color = 'green' }: { children: React.ReactNode, color?: 'green' | 'blue' | 'orange' }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700"
  };
  return (
    <span className={`${colors[color]} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
      {children}
    </span>
  );
};
