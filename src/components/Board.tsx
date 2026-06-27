import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Snake, Cell, DELTA, head, canExit } from "../engine";

interface BoardProps {
  size: number;
  snakes: Snake[];
  exitingSnakeIds: Set<number>;
  shakingSnakeIds: Set<number>;
  hintedSnakeId: number | null;
  onSnakeTap: (snake: Snake) => void;
  onExitComplete: (id: number) => void;
  colorblindMode: boolean;
}

export const Board: React.FC<BoardProps> = ({
  size,
  snakes,
  exitingSnakeIds,
  shakingSnakeIds,
  hintedSnakeId,
  onSnakeTap,
  onExitComplete,
  colorblindMode,
}) => {
  const cellSize = 60; // Pixels per cell in SVG space
  const boardSize = size * cellSize;

  // Find all occupied cells by current on-board snakes
  const occupiedCells = React.useMemo(() => {
    const set = new Set<string>();
    snakes.forEach((s) => {
      if (exitingSnakeIds.has(s.id)) return; // Exiting snakes do not block dots
      s.cells.forEach((c) => set.add(`${c.r},${c.c}`));
    });
    return set;
  }, [snakes, exitingSnakeIds]);

  // Generate paths for each snake
  const getSnakePathData = (snake: Snake, isExiting: boolean) => {
    if (snake.cells.length === 0) return "";
    
    // Centers of each cell from tail to head
    let pathPoints = snake.cells.map((c) => ({
      x: c.c * cellSize + cellSize / 2,
      y: c.r * cellSize + cellSize / 2,
    }));

    if (isExiting) {
      // Add a guide point far outside the board along the head exit direction
      const h = head(snake);
      const { dr, dc } = DELTA[snake.dir];
      // Multiply by board size + extra margin to guarantee full clearance of tail
      const extMultiplier = boardSize + cellSize * 2;
      const exitPoint = {
        x: h.c * cellSize + cellSize / 2 + dc * extMultiplier,
        y: h.r * cellSize + cellSize / 2 + dr * extMultiplier,
      };
      pathPoints.push(exitPoint);
    }

    // Generate SVG path: M x0 y0 L x1 y1 L x2 y2 ...
    return pathPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
  };

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-[#13112B]/90 border-4 border-indigo-500/30 rounded-3xl p-1 shadow-2xl shadow-indigo-950/50 overflow-hidden">
      {/* Dynamic Background subtle grid pattern */}
      <svg
        id="game-board-svg"
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        className="w-full h-full select-none"
        style={{ touchAction: "none" }}
      >
        {/* Render empty cell dots to guide the user visually */}
        <g id="grid-dots">
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const key = `${r},${c}`;
              if (occupiedCells.has(key)) return null;
              
              const cx = c * cellSize + cellSize / 2;
              const cy = r * cellSize + cellSize / 2;
              return (
                <circle
                  key={key}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill="#474569"
                  opacity={0.5}
                  className="transition-opacity duration-300"
                />
              );
            })
          )}
        </g>

        {/* Render snakes */}
        <g id="snakes-container">
          {snakes.map((snake) => {
            const isExiting = exitingSnakeIds.has(snake.id);
            const isShaking = shakingSnakeIds.has(snake.id);
            const isHinted = hintedSnakeId === snake.id;

            // Calculate body length in pixels
            const bodyLength = (snake.cells.length - 1) * cellSize;
            // The extended exit segment length
            const extLen = boardSize + cellSize * 2;
            const totalLength = bodyLength + extLen;

            const pathD = getSnakePathData(snake, isExiting);

            // Calculate Head arrow points
            const h = head(snake);
            const hx = h.c * cellSize + cellSize / 2;
            const hy = h.r * cellSize + cellSize / 2;
            const arrowSize = cellSize * 0.28;

            let arrowPoints = "";
            let letterRotation = 0;
            switch (snake.dir) {
              case "R":
                arrowPoints = `${hx + arrowSize * 1.25},${hy} ${hx + arrowSize * 0.3},${hy - arrowSize * 0.7} ${hx + arrowSize * 0.3},${hy + arrowSize * 0.7}`;
                letterRotation = 0;
                break;
              case "L":
                arrowPoints = `${hx - arrowSize * 1.25},${hy} ${hx - arrowSize * 0.3},${hy - arrowSize * 0.7} ${hx - arrowSize * 0.3},${hy + arrowSize * 0.7}`;
                letterRotation = 180;
                break;
              case "U":
                arrowPoints = `${hx},${hy - arrowSize * 1.25} ${hx - arrowSize * 0.7},${hy - arrowSize * 0.3} ${hx + arrowSize * 0.7},${hy - arrowSize * 0.3}`;
                letterRotation = -90;
                break;
              case "D":
                arrowPoints = `${hx},${hy + arrowSize * 1.25} ${hx - arrowSize * 0.7},${hy + arrowSize * 0.3} ${hx + arrowSize * 0.7},${hy + arrowSize * 0.3}`;
                letterRotation = 90;
                break;
            }

            // Direction symbol or index for Colorblind mode helper text
            const dirLabel = snake.dir;

            return (
              <motion.g
                key={snake.id}
                id={`snake-g-${snake.id}`}
                animate={
                  isShaking
                    ? { x: [0, -6, 6, -6, 6, -4, 4, 0] }
                    : isHinted
                    ? { scale: [1, 1.03, 0.98, 1.03, 1] }
                    : { x: 0, scale: 1 }
                }
                transition={
                  isShaking
                    ? { duration: 0.35, ease: "easeInOut" }
                    : isHinted
                    ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                style={{ originX: `${hx}px`, originY: `${hy}px` }}
              >
                {/* 1. Touch Hitbox (Very wide transparent path) */}
                {!isExiting && (
                  <path
                    id={`snake-hitbox-${snake.id}`}
                    d={pathD}
                    stroke="transparent"
                    strokeWidth={cellSize * 0.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    className="cursor-pointer"
                    onClick={() => onSnakeTap(snake)}
                  />
                )}

                {/* 2. Glow effect for hinted snake */}
                {isHinted && !isExiting && (
                  <path
                    d={pathD}
                    stroke={snake.errored ? "#FFFFFF" : snake.color}
                    strokeWidth={cellSize * 0.78}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.4}
                    className="blur-md pointer-events-none"
                  />
                )}

                {/* 3. Snake Body (Styled line) */}
                <motion.path
                  id={`snake-body-${snake.id}`}
                  d={pathD}
                  stroke={snake.errored ? "#FFFFFF" : snake.color}
                  strokeWidth={cellSize * 0.58}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={`${bodyLength} 999999`}
                  animate={isExiting ? { strokeDashoffset: totalLength } : { strokeDashoffset: 0 }}
                  transition={{ duration: 0.55, ease: "easeIn" }}
                  onAnimationComplete={() => {
                    if (isExiting) {
                      onExitComplete(snake.id);
                    }
                  }}
                  className="pointer-events-none"
                />

                {/* 4. Colorblind Mode Inner Patterns or Indicators */}
                {colorblindMode && !isExiting && (
                  <g className="pointer-events-none opacity-80">
                    {/* Render a clean, stylized direction letter on each cell of the body */}
                    {snake.cells.map((cell, index) => {
                      const cx = cell.c * cellSize + cellSize / 2;
                      const cy = cell.r * cellSize + cellSize / 2;
                      const isHead = index === snake.cells.length - 1;
                      
                      // Draw direct text label indicator inside body cells
                      return (
                        <text
                          key={index}
                          x={cx}
                          y={cy + 4}
                          fill={snake.errored ? "#111" : "#FFF"}
                          fontSize={cellSize * 0.26}
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          opacity={isHead ? 0.3 : 0.7} // Head already has the arrow, keep it subtle
                        >
                          {dirLabel}
                        </text>
                      );
                    })}
                  </g>
                )}

                {/* 5. Head Direction Arrow (Desvanece al salir) */}
                <motion.polygon
                  id={`snake-arrow-${snake.id}`}
                  points={arrowPoints}
                  fill={snake.errored ? "#FFFFFF" : snake.color}
                  animate={isExiting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none"
                />
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
