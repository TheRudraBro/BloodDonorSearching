import React from 'react';

const Header = () => {
  return (
    <div className="card bg-slate-900 border border-red-500/20 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
      <div className="card-body text-white text-center py-8">
        <div className="inline-flex items-center justify-center space-x-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-semibold text-sm tracking-widest uppercase">
            Emergency Blood Network
          </span>
        </div>
        <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight">
          Blood Finder Organized By <span className="text-red-500">PMH</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base mt-2">
          Instant Donor Registry, Smart Search, and AI-Powered Compatibility Matching Score.
        </p>
      </div>
    </div>
  );
};

export default Header;