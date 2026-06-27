import React, { useState, useEffect } from "react";
import { getLevel } from "./levels";
import { Snake, canExit, isSolved } from "./engine";
import { playClickSound, playSuccessSound, playErrorSound, playVictorySound } from "./utils/audio";
import { Homepage } from "./components/Homepage";
import { GameScreen } from "./components/GameScreen";
import { SettingsModal, LevelSelectModal, GameOverlay } from "./components/Modals";

export default function App() {
  const [gameState, setGameState] = useState<"home" | "playing">("home");
  
  // Settings & Progress Persistence
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem("currentLevel");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem("maxUnlockedLevel");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("audioEnabled");
    return saved !== "false";
  });
  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("colorblindMode");
    return saved === "true";
  });

  // Active Play States
  const [levelData, setLevelData] = useState(() => getLevel(currentLevel, colorblindMode));
  const [snakes, setSnakes] = useState<Snake[]>(() => levelData.snakes);
  const [droplets, setDroplets] = useState<number>(4);

  // Active animations & highlights
  const [exitingSnakeIds, setExitingSnakeIds] = useState<Set<number>>(new Set());
  const [shakingSnakeIds, setShakingSnakeIds] = useState<Set<number>>(new Set());
  const [hintedSnakeId, setHintedSnakeId] = useState<number | null>(null);

  // Undo Stack
  const [undoHistory, setUndoHistory] = useState<{ snakes: Snake[]; droplets: number }[]>([]);

  // Modal Overlays
  const [isWinning, setIsWinning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);

  // Loads a specific level template
  const loadLevel = (levelNum: number) => {
    const data = getLevel(levelNum, colorblindMode);
    setLevelData(data);
    setSnakes(data.snakes);
    setDroplets(4);
    setExitingSnakeIds(new Set());
    setShakingSnakeIds(new Set());
    setHintedSnakeId(null);
    setUndoHistory([]);
    setIsWinning(false);
    setIsGameOver(false);
  };

  // Sync when level changes
  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  // Handle a snake tap action
  const handleSnakeTap = (snake: Snake) => {
    if (exitingSnakeIds.has(snake.id) || isWinning || isGameOver) return;

    // Clear active hints immediately
    setHintedSnakeId(null);

    // Deep clone the snakes list for undo preservation
    const currentSnakesClone = snakes.map((s) => ({
      ...s,
      cells: s.cells.map((c) => ({ ...c })),
    }));

    const size = levelData.size;
    if (canExit(snake, snakes, size)) {
      // SUCCESS: Snake can slide out along its path!
      // Push to undo stack
      setUndoHistory((prev) => [...prev, { snakes: currentSnakesClone, droplets }]);

      playSuccessSound(audioEnabled);
      setExitingSnakeIds((prev) => {
        const next = new Set(prev);
        next.add(snake.id);
        return next;
      });
    } else {
      // BLOCKED ERROR: Snake bounces, turns white (errored) and costs 1 life droplet
      // Push mistake to undo history so they can reverse it!
      setUndoHistory((prev) => [...prev, { snakes: currentSnakesClone, droplets }]);

      playErrorSound(audioEnabled);

      // Set errored=true so the snake turns white
      setSnakes((prev) =>
        prev.map((s) => (s.id === snake.id ? { ...s, errored: true } : s))
      );

      // Trigger shake animation
      setShakingSnakeIds((prev) => {
        const next = new Set(prev);
        next.add(snake.id);
        return next;
      });

      // Deduct droplet
      setDroplets((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
        }
        return next;
      });

      // Clear shaking state after duration
      setTimeout(() => {
        setShakingSnakeIds((prev) => {
          const next = new Set(prev);
          next.delete(snake.id);
          return next;
        });
      }, 400);
    }
  };

  // Callback triggered when slide animation ends
  const handleExitComplete = (snakeId: number) => {
    setSnakes((prev) => {
      const updated = prev.filter((s) => s.id !== snakeId);

      // Check if board is fully cleared
      if (updated.length === 0) {
        setIsWinning(true);
        playVictorySound(audioEnabled);

        // Unlock next level progression
        const nextLevel = currentLevel + 1;
        if (nextLevel > maxUnlockedLevel) {
          setMaxUnlockedLevel(nextLevel);
          localStorage.setItem("maxUnlockedLevel", String(nextLevel));
        }
      }

      return updated;
    });

    setExitingSnakeIds((prev) => {
      const next = new Set(prev);
      next.delete(snakeId);
      return next;
    });
  };

  // Undo the last tap action
  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    playClickSound(audioEnabled);

    const prevHistory = [...undoHistory];
    const lastFrame = prevHistory.pop();
    if (lastFrame) {
      setSnakes(lastFrame.snakes);
      setDroplets(lastFrame.droplets);
      setUndoHistory(prevHistory);
      
      // Clear all active animations and overlays
      setExitingSnakeIds(new Set());
      setShakingSnakeIds(new Set());
      setHintedSnakeId(null);
      setIsGameOver(false);
      setIsWinning(false);
    }
  };

  // Reset the current level layout
  const handleReset = () => {
    playClickSound(audioEnabled);
    loadLevel(currentLevel);
  };

  // Highlights a solvable snake
  const handleTriggerHint = () => {
    playClickSound(audioEnabled);
    const size = levelData.size;
    const solvable = snakes.find((s) => !exitingSnakeIds.has(s.id) && canExit(s, snakes, size));
    
    if (solvable) {
      setHintedSnakeId(solvable.id);
      
      // Auto-expire the hint after 3.5 seconds
      setTimeout(() => {
        setHintedSnakeId((curr) => (curr === solvable.id ? null : curr));
      }, 3500);
    }
  };

  const handleToggleAudio = () => {
    const nextVal = !audioEnabled;
    setAudioEnabled(nextVal);
    localStorage.setItem("audioEnabled", String(nextVal));
    playClickSound(nextVal);
  };

  const handleToggleColorblind = () => {
    const nextVal = !colorblindMode;
    setColorblindMode(nextVal);
    localStorage.setItem("colorblindMode", String(nextVal));
    playClickSound(audioEnabled);

    // Instantly map current level colors to the new palette
    const data = getLevel(currentLevel, nextVal);
    setLevelData(data);
    setSnakes((curr) =>
      curr.map((s) => {
        const template = data.snakes.find((ts) => ts.id === s.id);
        return template ? { ...s, color: template.color } : s;
      })
    );
  };

  const handleStartGame = () => {
    playClickSound(audioEnabled);
    setGameState("playing");
  };

  const handleGoHome = () => {
    playClickSound(audioEnabled);
    setGameState("home");
    setIsSettingsOpen(false);
    setIsLevelSelectOpen(false);
  };

  const handleSelectLevel = (levelNum: number) => {
    playClickSound(audioEnabled);
    setCurrentLevel(levelNum);
    localStorage.setItem("currentLevel", String(levelNum));
    setGameState("playing");
  };

  const handleNextLevel = () => {
    playClickSound(audioEnabled);
    const nextLvl = currentLevel + 1;
    setCurrentLevel(nextLvl);
    localStorage.setItem("currentLevel", String(nextLvl));
    setIsWinning(false);
  };

  return (
    <div className="min-h-screen bg-[#070513] text-white flex flex-col justify-between overflow-hidden relative font-sans select-none">
      {/* Aesthetic blur background glow spheres */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-pink-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-600/5 blur-[80px] pointer-events-none" />

      {/* Main Screen Router */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
        {gameState === "home" ? (
          <Homepage
            currentLevel={currentLevel}
            difficulty={levelData.difficulty}
            onStartGame={handleStartGame}
            onOpenSettings={() => {
              playClickSound(audioEnabled);
              setIsSettingsOpen(true);
            }}
            onOpenLevelSelect={() => {
              playClickSound(audioEnabled);
              setIsLevelSelectOpen(true);
            }}
            maxUnlockedLevel={maxUnlockedLevel}
          />
        ) : (
          <GameScreen
            levelId={currentLevel}
            size={levelData.size}
            snakes={snakes}
            droplets={droplets}
            difficulty={levelData.difficulty}
            exitingSnakeIds={exitingSnakeIds}
            shakingSnakeIds={shakingSnakeIds}
            hintedSnakeId={hintedSnakeId}
            onSnakeTap={handleSnakeTap}
            onExitComplete={handleExitComplete}
            onUndo={handleUndo}
            onReset={handleReset}
            onGoHome={handleGoHome}
            onOpenSettings={() => {
              playClickSound(audioEnabled);
              setIsSettingsOpen(true);
            }}
            onTriggerHint={handleTriggerHint}
            canUndo={undoHistory.length > 0}
            colorblindMode={colorblindMode}
          />
        )}
      </div>

      {/* Universal Bottom Footer Credits */}
      <div className="text-center text-[10px] text-slate-500/60 font-medium py-3 z-10">
        Google AI Studio Build • Color Maze Escape
      </div>

      {/* Settings Modal Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          playClickSound(audioEnabled);
          setIsSettingsOpen(false);
        }}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        colorblindMode={colorblindMode}
        onToggleColorblind={handleToggleColorblind}
        onGoHome={handleGoHome}
        onReplay={handleReset}
      />

      {/* Level Selection Modal Overlay */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => {
          playClickSound(audioEnabled);
          setIsLevelSelectOpen(false);
        }}
        maxUnlockedLevel={maxUnlockedLevel}
        onSelectLevel={handleSelectLevel}
        currentLevel={currentLevel}
      />

      {/* Level Complete / Perfect Overlay */}
      {isWinning && (
        <GameOverlay
          type="win"
          dropletsLeft={droplets}
          levelId={currentLevel}
          onNextLevel={currentLevel < 60 ? handleNextLevel : undefined}
          onReplay={handleReset}
        />
      )}

      {/* Game Over Failed Overlay */}
      {isGameOver && (
        <GameOverlay
          type="fail"
          dropletsLeft={droplets}
          levelId={currentLevel}
          onReplay={handleReset}
        />
      )}
    </div>
  );
}
