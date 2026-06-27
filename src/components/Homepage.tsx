import React from "react";
import { Settings, BookOpen, Lock, Calendar, Play } from "lucide-react";

interface HomepageProps {
  currentLevel: number;
  difficulty: string;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
  maxUnlockedLevel: number;
}

export const Homepage: React.FC<HomepageProps> = ({
  currentLevel,
  difficulty,
  onStartGame,
  onOpenSettings,
  onOpenLevelSelect,
  maxUnlockedLevel,
}) => {
  return (
    <div 
      id="homepage-root"
      className="flex-1 flex flex-col justify-between max-w-[450px] w-full mx-auto px-6 py-8 text-white relative h-full select-none"
    >
      {/* Header Row */}
      <div className="flex justify-between items-center w-full">
        <button
          onClick={onOpenSettings}
          className="p-3 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/50 rounded-2xl text-slate-300 hover:text-white transition-all duration-150 transform hover:scale-[1.05] active:scale-95 shadow-md"
        >
          <Settings size={22} />
        </button>
        <span className="text-xs font-black tracking-widest text-[#4f46e5] uppercase px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/15">
          v2.0 VERIFIED
        </span>
      </div>

      {/* Hero Logo Section */}
      <div className="text-center flex-1 flex flex-col justify-center items-center my-6">
        <div className="space-y-1 relative mb-6">
          {/* Main Title "COLOR MAZE" with 3D Layered Look */}
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-pink-500 to-rose-600 drop-shadow-[0_4px_12px_rgba(236,72,153,0.3)] select-none">
              COLOR
            </h1>
            <div className="flex items-center justify-center gap-1.5 -mt-2">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                MAZE
              </h1>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400/80 tracking-widest uppercase">
            Arrow Snake Escape
          </p>
        </div>

        {/* Central Visual Art - Interactive Glowing Puzzle Visual */}
        <div className="w-52 h-52 relative flex items-center justify-center bg-[#13112B]/40 rounded-[2.5rem] border-2 border-indigo-500/20 shadow-inner shadow-indigo-950/80 mb-6 group overflow-hidden">
          {/* Glowing Backdrops */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Styled Retro Board Graphic (Similar to screenshot 4) */}
          <svg viewBox="0 0 100 100" className="w-36 h-36 relative z-10 opacity-90">
            {/* Round pixel grid shape */}
            <path
              d="M 30,10 H 70 A 20,20 0 0 1 90,30 V 70 A 20,20 0 0 1 70,90 H 30 A 20,20 0 0 1 10,70 V 30 A 20,20 0 0 1 30,10 Z"
              fill="none"
              stroke="#4338ca"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            {/* Some pixel grid blocks at bottom */}
            <g opacity="0.8">
              {/* Brown ground blocks */}
              <rect x="35" y="75" width="10" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
              <rect x="45" y="75" width="10" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
              <rect x="55" y="75" width="10" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
              <rect x="40" y="65" width="10" height="10" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
              <rect x="50" y="65" width="10" height="10" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />

              {/* Colorful active blocks with diamond/star on top */}
              <rect x="35" y="55" width="10" height="10" rx="2" fill="#ec4899" stroke="#be185d" strokeWidth="0.8" />
              <rect x="45" y="55" width="10" height="10" rx="2" fill="#06b6d4" stroke="#0e7490" strokeWidth="0.8" />
              <rect x="55" y="55" width="10" height="10" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
              <rect x="45" y="45" width="10" height="10" rx="2" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />

              {/* Glowing Diamond on top */}
              <polygon points="50,34 55,40 50,46 45,40" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Play CTA Section */}
      <div className="flex flex-col items-center gap-6 mb-4">
        {/* Play Pill Button */}
        <div className="relative flex flex-col items-center w-full">
          {/* Difficulty Label above */}
          <div className="absolute -top-3.5 px-4 py-1 bg-pink-500 rounded-full shadow-lg border border-pink-400 z-10">
            <span className="text-[10px] font-black tracking-widest uppercase text-white">
              {difficulty}
            </span>
          </div>

          {/* Large Pill Button */}
          <button
            onClick={onStartGame}
            className="flex items-center justify-between w-full py-5 px-8 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white rounded-[2.5rem] font-black text-2xl tracking-wide transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-blue-950/60 border-4 border-indigo-400/40 relative group"
          >
            <span className="text-left font-black tracking-tight flex flex-col">
              <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-widest -mb-1">Tap to Play</span>
              Level {currentLevel}
            </span>
            <div className="w-12 h-12 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={22} className="fill-blue-700 stroke-none ml-0.5" />
            </div>
          </button>
        </div>

        {/* Bottom Utility Grid */}
        <div className="flex justify-between items-center w-full mt-2">
          {/* Level 50 unlock info milestone */}
          <div className="flex items-center gap-2.5 bg-indigo-950/40 border border-indigo-900/30 px-3 py-2.5 rounded-2xl">
            <div className="p-2 bg-pink-600/20 text-pink-400 rounded-xl">
              <Calendar size={18} />
            </div>
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Milestone</p>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-extrabold text-slate-200">Level 50</span>
                <Lock size={10} className="text-slate-500" />
              </div>
            </div>
          </div>

          {/* Level Selection Button ("Level Book") */}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-900/30 px-4 py-2.5 rounded-2xl transition-all duration-150 transform hover:scale-[1.05] active:scale-95 group text-left cursor-pointer"
          >
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Level Select</p>
              <span className="text-[11px] font-black text-slate-200 group-hover:text-cyan-400 transition-colors">
                Unlocked: {maxUnlockedLevel}
              </span>
            </div>
            <div className="p-2 bg-cyan-600/20 text-cyan-400 group-hover:text-cyan-300 rounded-xl transition-colors">
              <BookOpen size={18} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
