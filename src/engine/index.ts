export type Dir = "U" | "D" | "L" | "R";

export const DELTA: Record<Dir, { dr: number; dc: number }> = {
  U: { dr: -1, dc: 0 },
  D: { dr: 1, dc: 0 },
  L: { dr: 0, dc: -1 },
  R: { dr: 0, dc: 1 },
};

export interface Cell {
  r: number;
  c: number;
}

export interface Snake {
  id: number;
  color: string;     // Hex color
  dir: Dir;          // Exit direction of the head
  cells: Cell[];     // [cola ... cabeza], connected orthogonally and no self-intersection
  errored: boolean;  // True if tapped while blocked (turns white)
}

export interface Level {
  id: number;
  size: number;
  droplets: number;
  difficulty: string;
  snakes: Snake[];
}

export const head = (s: Snake): Cell => s.cells[s.cells.length - 1];

/**
 * Checks if a snake can exit the board.
 * A snake can exit if the straight ray from its head in its exit direction
 * is clear of ALL OTHER snakes. Its own body cells do not block it.
 */
export function canExit(snake: Snake, snakes: Snake[], size: number): boolean {
  const occupied = new Set<string>();
  for (const s of snakes) {
    if (s.id === snake.id) continue;
    for (const c of s.cells) {
      occupied.add(`${c.r},${c.c}`);
    }
  }

  const { dr, dc } = DELTA[snake.dir];
  const h = head(snake);
  let r = h.r + dr;
  let c = h.c + dc;

  while (r >= 0 && r < size && c >= 0 && c < size) {
    if (occupied.has(`${r},${c}`)) {
      return false; // Obstacle found
    }
    r += dr;
    c += dc;
  }
  return true; // Ray reached the board edge without obstacles
}

/**
 * Checks if all snakes have been cleared from the board.
 */
export const isSolved = (snakes: Snake[]): boolean => snakes.length === 0;

/**
 * Determines if a given set of snakes is solvable.
 * Uses a greedy approach: if there's any snake that can exit, we remove it
 * and continue until no more can exit. Since removing a snake only frees up
 * space (never blocks), the greedy order is guaranteed to be correct if solvable.
 */
export function isSolvable(snakes: Snake[], size: number): boolean {
  const board = snakes.map((s) => ({ ...s }));
  let changed = true;
  while (changed) {
    changed = false;
    const index = board.findIndex((s) => canExit(s, board, size));
    if (index >= 0) {
      board.splice(index, 1);
      changed = true;
    }
  }
  return board.length === 0;
}

/**
 * Generates a list of cell coordinates for the exit ray of a head cell in a given direction.
 */
export function getExitRayCells(headCell: Cell, dir: Dir, size: number): Cell[] {
  const ray: Cell[] = [];
  const { dr, dc } = DELTA[dir];
  let r = headCell.r + dr;
  let c = headCell.c + dc;
  while (r >= 0 && r < size && c >= 0 && c < size) {
    ray.push({ r, c });
    r += dr;
    c += dc;
  }
  return ray;
}

/**
 * Level Generator via Construction Inversa (Reverse Construction)
 * Generates a guaranteed solvable level.
 * 
 * 1. Decide an elimination order p1, p2, ..., pN.
 * 2. Insert snakes in reverse order: pN, p(N-1), ..., p1.
 * 3. For each snake:
 *    - Pick a head cell and a direction that is clear of already placed snakes in its exit direction.
 *    - Grow the body backwards randomly without hitting placed snakes, itself, or its own exit ray.
 * 4. Verify using isSolvable.
 */
export function generateSolvableLevel(
  id: number,
  size: number,
  numSnakes: number,
  minLength: number,
  maxLength: number,
  difficulty: string,
  colorPalette: string[]
): Level {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const placedSnakes: Snake[] = [];
    let occupied = new Set<string>();
    let snakeIdCounter = 1;

    let success = true;

    for (let sIdx = 0; sIdx < numSnakes; sIdx++) {
      // Find possible head positions and directions that can exit
      // given current occupied cells (reverse order means this snake will exit before the already placed ones,
      // so its exit ray must be clear of already placed ones)
      const candidates: { h: Cell; dir: Dir }[] = [];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (occupied.has(`${r},${c}`)) continue;

          // Check each exit direction
          const directions: Dir[] = ["U", "D", "L", "R"];
          for (const dir of directions) {
            // Check if exit ray is clear of already placed snakes
            const ray = getExitRayCells({ r, c }, dir, size);
            const isRayClear = ray.every((cell) => !occupied.has(`${cell.r},${cell.c}`));
            if (isRayClear) {
              candidates.push({ h: { r, c }, dir });
            }
          }
        }
      }

      if (candidates.length === 0) {
        success = false;
        break;
      }

      // Shuffle candidates and try to grow
      shuffleArray(candidates);

      let placedThisSnake = false;

      for (const cand of candidates) {
        const headCell = cand.h;
        const dir = cand.dir;

        // The body length is chosen randomly
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

        // Try to grow the snake body backwards
        // Head is cells[length-1], tail is cells[0]
        // Let's grow from head backwards: path starts at headCell
        const path: Cell[] = [headCell];
        const rayCellsSet = new Set(getExitRayCells(headCell, dir, size).map((c) => `${c.r},${c.c}`));

        let growSuccess = true;
        for (let step = 1; step < length; step++) {
          const currentTip = path[path.length - 1];
          const neighbors: Cell[] = [];
          
          for (const d of ["U", "D", "L", "R"] as Dir[]) {
            const nr = currentTip.r + DELTA[d].dr;
            const nc = currentTip.c + DELTA[d].dc;

            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              const coordStr = `${nr},${nc}`;
              // Must not be occupied by already placed snakes
              if (occupied.has(coordStr)) continue;
              // Must not be occupied by current snake's body
              if (path.some((p) => p.r === nr && p.c === nc)) continue;
              // Must not be on the head's exit ray (to keep it beautiful and uncluttered)
              if (rayCellsSet.has(coordStr)) continue;

              neighbors.push({ r: nr, c: nc });
            }
          }

          if (neighbors.length === 0) {
            growSuccess = false;
            break;
          }

          // Pick a random neighbor to grow
          const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
          path.push(nextCell);
        }

        if (growSuccess) {
          // Reverse path to match [cola ... cabeza] format
          const finalCells = [...path].reverse();

          // Select color
          const color = colorPalette[sIdx % colorPalette.length];

          const newSnake: Snake = {
            id: snakeIdCounter++,
            color,
            dir,
            cells: finalCells,
            errored: false,
          };

          placedSnakes.unshift(newSnake); // Unshift so that p_i is placed in front (p1 first, which exits first)
          
          // Mark cells as occupied
          for (const cell of finalCells) {
            occupied.add(`${cell.r},${cell.c}`);
          }

          placedThisSnake = true;
          break;
        }
      }

      if (!placedThisSnake) {
        success = false;
        break;
      }
    }

    if (success && placedSnakes.length === numSnakes) {
      // Final sanity check
      if (isSolvable(placedSnakes, size)) {
        return {
          id,
          size,
          droplets: 4,
          difficulty,
          snakes: placedSnakes,
        };
      }
    }
  }

  // Fallback default level if generation fails
  return getFallbackLevel(id, size, difficulty, colorPalette);
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Fallback static level in case generation is too constrained.
 */
function getFallbackLevel(id: number, size: number, difficulty: string, colorPalette: string[]): Level {
  // A simple 6x6 level with 4 snakes
  const snakes: Snake[] = [
    {
      id: 1,
      color: colorPalette[0],
      dir: "R",
      cells: [
        { r: 2, c: 1 },
        { r: 2, c: 2 },
        { r: 2, c: 3 },
      ],
      errored: false,
    },
    {
      id: 2,
      color: colorPalette[1],
      dir: "D",
      cells: [
        { r: 0, c: 4 },
        { r: 1, c: 4 },
        { r: 2, c: 4 },
      ],
      errored: false,
    },
    {
      id: 3,
      color: colorPalette[2],
      dir: "U",
      cells: [
        { r: 4, c: 1 },
        { r: 3, c: 1 },
        { r: 2, c: 1 }, // Note this blocks cell 2,1 but in fallback we keep it solvable
      ],
      errored: false,
    },
  ];

  // Adjust cells to guarantee simple solvability
  const cleanSnakes: Snake[] = [
    {
      id: 1,
      color: colorPalette[0],
      dir: "R",
      cells: [
        { r: 1, c: 1 },
        { r: 1, c: 2 },
        { r: 1, c: 3 }, // Head at 1,3 exit to Right (1,4 and 1,5 are empty)
      ],
      errored: false,
    },
    {
      id: 2,
      color: colorPalette[1],
      dir: "D",
      cells: [
        { r: 2, c: 2 },
        { r: 3, c: 2 },
        { r: 4, c: 2 }, // Head at 4,2 exit to Down (5,2 is empty)
      ],
      errored: false,
    },
    {
      id: 3,
      color: colorPalette[2],
      dir: "L",
      cells: [
        { r: 3, c: 5 },
        { r: 3, c: 4 },
        { r: 3, c: 3 }, // Head at 3,3 exit to Left (blocks 3,2, which is occupied by snake 2. Snake 2 must exit first!)
      ],
      errored: false,
    },
  ];

  return {
    id,
    size: 6,
    droplets: 4,
    difficulty,
    snakes: cleanSnakes,
  };
}
