import React from 'react';

const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 border shadow-md ${
        theme === 'dark'
          ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
      }`}
      title="Toggle Light / Dark Mode"
    >
      <span>{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;