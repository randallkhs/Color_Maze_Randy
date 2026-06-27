import React from "react";
import { ArrowLeft, RotateCcw, HelpCircle, Lightbulb, Home, Settings } from "lucide-react";
import { Board } from "./Board";
import { Snake } from "../engine";

interface GameScreenProps {
  levelId: number;
  size: number;
  snakes: Snake[];
  droplets: number;
  difficulty: string;
  exitingSnakeIds: Set<number>;
  shakingSnakeIds: Set<number>;
  hintedSnakeId: number | null;
  onSnakeTap: (snake: Snake) => void;
  onExitComplete: (id: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
  onTriggerHint: () => void;
  canUndo: boolean;
  colorblindMode: boolean;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelId,
  size,
  snakes,
  droplets,
  difficulty,
  exitingSnakeIds,
  shakingSnakeIds,
  hintedSnakeId,
  onSnakeTap,
  onExitComplete,
  onUndo,
  onReset,
  onGoHome,
  onOpenSettings,
  onTriggerHint,
  canUndo,
  colorblindMode,
}) => {
  return (
    <div 
      id="game-screen-root"
      className="flex-1 flex flex-col justify-between max-w-[480px] w-full mx-auto px-4 py-6 text-white relative h-full select-none"
    >
      {/* Top Header HUD */}
      <div className="flex justify-between items-center w-full bg-indigo-950/30 border border-indigo-900/25 py-3.5 px-4 rounded-3xl backdrop-blur-sm shadow-lg mb-4">
        {/* Left: Level Label + Back to Home */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGoHome}
            className="p-2 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/50 rounded-xl text-slate-300 hover:text-white transition-all transform active:scale-95 cursor-pointer"
            title="Return Home"
          >
            <Home size={16} />
          </button>
          <div className="text-left leading-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Level</span>
            <span className="text-base font-black text-white">{levelId}</span>
          </div>
        </div>

        {/* Center: Difficulty Label + Droplets Lives */}
        <div className="flex flex-col items-center leading-none">
          {/* Difficulty text */}
          <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest mb-1.5">
            {difficulty}
          </span>
          {/* 4 Droplet Lives */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => {
              const isActive = i < droplets;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-5 transition-all duration-500 ${
                    isActive
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] scale-100 opacity-100"
                      : "bg-slate-700 opacity-20 scale-90"
                  }`}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 60%, 85% 100%, 15% 100%, 0% 60%)",
                    transitionDelay: `${i * 50}ms`
                  }}
                  title={`${droplets} droplets left`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Hint & Settings Trigger */}
        <div className="flex items-center gap-2">
          {/* Hint lightbulb */}
          <button
            onClick={onTriggerHint}
            className={`p-2 rounded-xl border transition-all transform active:scale-95 cursor-pointer ${
              hintedSnakeId
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                : "bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/50 text-slate-300 hover:text-white"
            }`}
            title="Show Hint"
          >
            <Lightbulb size={18} className={hintedSnakeId ? "fill-amber-400" : ""} />
          </button>

          {/* Settings gear */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/50 rounded-xl text-slate-300 hover:text-white transition-all transform active:scale-95 cursor-pointer"
            title="Open Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="flex-1 flex items-center justify-center py-4 w-full">
        <Board
          size={size}
          snakes={snakes}
          exitingSnakeIds={exitingSnakeIds}
          shakingSnakeIds={shakingSnakeIds}
          hintedSnakeId={hintedSnakeId}
          onSnakeTap={onSnakeTap}
          onExitComplete={onExitComplete}
          colorblindMode={colorblindMode}
        />
      </div>

      {/* Bottom Action bar */}
      <div className="grid grid-cols-2 gap-4 w-full mt-4 bg-indigo-950/20 border border-indigo-900/20 p-3 rounded-3xl backdrop-blur-sm shadow-md">
        {/* Reset level */}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-900/35 rounded-2xl font-bold text-sm text-slate-200 transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer shadow-sm shadow-indigo-950/30"
        >
          <RotateCcw size={16} />
          Reset Level
        </button>

        {/* Undo Move */}
        <button
          disabled={!canUndo}
          onClick={onUndo}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-98 shadow-sm ${
            canUndo
              ? "bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-100 cursor-pointer shadow-indigo-950/30"
              : "bg-slate-900/30 border border-slate-900/30 text-slate-600 cursor-not-allowed opacity-50"
          }`}
        >
          <span className="text-base">↩</span>
          Undo Move
        </button>
      </div>
    </div>
  );
};
