import React from "react";
import { Volume2, VolumeX, Eye, EyeOff, X, RotateCcw, Home, Play, Award, RotateCw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  colorblindMode: boolean;
  onToggleColorblind: () => void;
  onGoHome: () => void;
  onReplay: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  audioEnabled,
  onToggleAudio,
  colorblindMode,
  onToggleColorblind,
  onGoHome,
  onReplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="settings-modal"
        className="w-full max-w-[340px] bg-[#1e1b38] border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-white relative animate-scale-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-center mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">
          Settings
        </h2>

        {/* Toggle Switches */}
        <div className="space-y-4 mb-8">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#141226] rounded-2xl border border-indigo-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/15 rounded-xl text-indigo-400">
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <span className="font-semibold text-slate-200 text-sm">Sound Effects</span>
            </div>
            <button
              onClick={onToggleAudio}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                audioEnabled ? "bg-[#22C55E]" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  audioEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Colorblind Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#141226] rounded-2xl border border-indigo-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/15 rounded-xl text-pink-400">
                {colorblindMode ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
              <span className="font-semibold text-slate-200 text-sm">Colorblind Help</span>
            </div>
            <button
              onClick={onToggleColorblind}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                colorblindMode ? "bg-[#22C55E]" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  colorblindMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onGoHome}
            className="flex flex-col items-center justify-center p-3.5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.03] active:scale-95 shadow-md shadow-green-950/40 text-xs gap-1.5"
          >
            <Home size={18} />
            Homepage
          </button>
          <button
            onClick={onReplay}
            className="flex flex-col items-center justify-center p-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.03] active:scale-95 shadow-md shadow-blue-950/40 text-xs gap-1.5"
          >
            <RotateCcw size={18} />
            Replay
          </button>
        </div>
      </div>
    </div>
  );
};

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxUnlockedLevel: number;
  onSelectLevel: (level: number) => void;
  currentLevel: number;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  maxUnlockedLevel,
  onSelectLevel,
  currentLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="level-select-modal"
        className="w-full max-w-[360px] max-h-[80vh] bg-[#1e1b38] border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-white relative flex flex-col animate-scale-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-center mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
          Level Selection
        </h2>

        {/* Level Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 gap-3 my-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
          {Array.from({ length: 60 }).map((_, idx) => {
            const levelNum = idx + 1;
            const isUnlocked = levelNum <= maxUnlockedLevel;
            const isCurrent = levelNum === currentLevel;

            return (
              <button
                key={levelNum}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(levelNum);
                  onClose();
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl font-black text-sm transition-all transform duration-150 ${
                  isCurrent
                    ? "bg-pink-600 text-white ring-4 ring-pink-400/50 scale-105"
                    : isUnlocked
                    ? "bg-indigo-600/80 hover:bg-indigo-500 hover:scale-105 text-white cursor-pointer active:scale-95"
                    : "bg-slate-800 text-slate-500 opacity-40 cursor-not-allowed"
                }`}
              >
                <span>{levelNum}</span>
                {!isUnlocked && (
                  <span className="text-[9px] mt-0.5">🔒</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center text-[10px] text-slate-400 mt-4">
          Solve levels to unlock next challenges! (Up to Level 60)
        </div>
      </div>
    </div>
  );
};

interface GameOverlayProps {
  type: "win" | "fail";
  dropletsLeft: number;
  onNextLevel?: () => void;
  onReplay: () => void;
  levelId: number;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  type,
  dropletsLeft,
  onNextLevel,
  onReplay,
  levelId,
}) => {
  const isPerfect = dropletsLeft === 4 && type === "win";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        id="game-overlay"
        className="w-full max-w-[340px] bg-[#1e1b38] border-4 border-indigo-500/50 rounded-3xl p-8 shadow-2xl text-center text-white relative overflow-hidden animate-scale-in"
      >
        {/* Decorative Light Glows */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
          type === "win" ? "bg-green-500" : "bg-red-500"
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
          type === "win" ? "bg-cyan-500" : "bg-pink-500"
        }`} />

        {type === "win" ? (
          <>
            {/* Victory Icon / Ribbon */}
            <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Award className="text-white drop-shadow-md" size={44} />
            </div>

            <h2 className="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
              {isPerfect ? "PERFECT!" : "VICTORY!"}
            </h2>
            <p className="text-slate-300 text-sm mb-6 font-medium">
              Level {levelId} completed successfully!
            </p>

            {/* Perfect Badges */}
            <div className="flex items-center justify-center gap-1.5 mb-8 bg-[#141226]/60 py-2.5 px-4 rounded-2xl border border-indigo-950/50">
              <span className="text-xs text-slate-400 font-bold mr-1">Vidas:</span>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-4.5 rounded-full ${
                    i < dropletsLeft ? "bg-cyan-400 shadow-sm shadow-cyan-400/50" : "bg-slate-700 opacity-20"
                  } clip-droplet`}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 60%, 85% 100%, 15% 100%, 0% 60%)"
                  }}
                />
              ))}
              {isPerfect && (
                <span className="text-xs text-amber-400 font-black ml-2 animate-pulse">👑 PERFECT</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 relative z-10">
              {onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl font-black text-lg shadow-lg shadow-green-950/40 transform hover:scale-[1.02] transition-transform active:scale-98"
                >
                  <Play size={22} className="fill-white" />
                  Next Level
                </button>
              )}
              <button
                onClick={onReplay}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-sm text-slate-300 transform hover:scale-[1.02] transition-transform active:scale-98"
              >
                <RotateCw size={16} />
                Replay Level
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Fail Icon */}
            <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-rose-500 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-white font-black text-4xl">!</span>
            </div>

            <h2 className="text-3xl font-black mb-1 tracking-wider text-red-500">
              FAILED!
            </h2>
            <p className="text-slate-300 text-sm mb-8 font-medium">
              You ran out of droplets on Level {levelId}!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={onReplay}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 rounded-2xl font-black text-lg shadow-lg shadow-red-950/40 transform hover:scale-[1.02] transition-transform active:scale-98"
              >
                <RotateCcw size={22} />
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
