import { Level, Snake, generateSolvableLevel, isSolvable } from "../engine";

// Standard vibrant color palette
export const STANDARD_COLORS = [
  "#EC4899", // Rose
  "#EAB308", // Yellow
  "#3B82F6", // Blue
  "#A855F7", // Purple
  "#22C55E", // Green
  "#F97316", // Orange
  "#06B6D4", // Cyan
];

// Colorblind friendly color palette
export const COLORBLIND_COLORS = [
  "#56B4E9", // Sky Blue
  "#D55E00", // Vermillion
  "#009E73", // Bluish Green
  "#F0E442", // Amber / Yellow
  "#0072B2", // Blue
  "#E69F00", // Orange
  "#CC79A7", // Reddish Purple
];

export function getColorPalette(colorblind: boolean): string[] {
  return colorblind ? COLORBLIND_COLORS : STANDARD_COLORS;
}

/**
 * Handcrafted Levels for standard onboarding (Levels 1 to 5).
 * These are mapped with color indexes so they adapt to standard or colorblind palettes seamlessly.
 */
interface HandcraftedSnake {
  id: number;
  colorIndex: number;
  dir: "U" | "D" | "L" | "R";
  cells: { r: number; c: number }[];
}

interface HandcraftedLevel {
  id: number;
  size: number;
  difficulty: string;
  snakes: HandcraftedSnake[];
}

const HANDCRAFTED_LEVELS: HandcraftedLevel[] = [
  {
    id: 1,
    size: 5,
    difficulty: "Easy",
    snakes: [
      // Dependency chain: C (3) -> B (2) -> A (1)
      // A: Head (0,2), exit Down. Blocks: None. Blocked by: B (occupies 2,2)
      {
        id: 1,
        colorIndex: 0,
        dir: "D",
        cells: [
          { r: 0, c: 0 },
          { r: 0, c: 1 },
          { r: 0, c: 2 },
        ],
      },
      // B: Head (2,4), exit Left. Blocks: A. Blocked by: C (occupies 2,0)
      {
        id: 2,
        colorIndex: 1,
        dir: "L",
        cells: [
          { r: 4, c: 4 },
          { r: 3, c: 4 },
          { r: 2, c: 4 },
        ],
      },
      // C: Head (4,0), exit Right. Blocks: B (via cells at 2,0 and 3,0). Blocked by: None.
      {
        id: 3,
        colorIndex: 2,
        dir: "R",
        cells: [
          { r: 2, c: 0 },
          { r: 3, c: 0 },
          { r: 4, c: 0 },
        ],
      },
    ],
  },
  {
    id: 2,
    size: 5,
    difficulty: "Easy",
    snakes: [
      // 4 Snakes, a bit more tangled
      {
        id: 1,
        colorIndex: 0,
        dir: "R",
        cells: [
          { r: 0, c: 0 },
          { r: 1, c: 0 },
          { r: 1, c: 1 },
        ], // Head at 1,1 exit R. Blocked by Snake 2 (head at 1,3, body at 1,2)
      },
      {
        id: 2,
        colorIndex: 1,
        dir: "R",
        cells: [
          { r: 1, c: 2 },
          { r: 1, c: 3 },
        ], // Head at 1,3 exit R. Free!
      },
      {
        id: 3,
        colorIndex: 2,
        dir: "U",
        cells: [
          { r: 3, c: 2 },
          { r: 2, c: 2 },
        ], // Head at 2,2 exit U. Blocked by Snake 1 (at 1,1 or 1,2)
      },
      {
        id: 4,
        colorIndex: 3,
        dir: "D",
        cells: [
          { r: 3, c: 0 },
          { r: 4, c: 0 },
        ], // Head at 4,0 exit D. Free!
      },
    ],
  },
  {
    id: 3,
    size: 6,
    difficulty: "Normal",
    snakes: [
      {
        id: 1,
        colorIndex: 0,
        dir: "U",
        cells: [
          { r: 3, c: 1 },
          { r: 2, c: 1 },
          { r: 1, c: 1 },
        ], // Head at 1,1, exit U. Free!
      },
      {
        id: 2,
        colorIndex: 1,
        dir: "R",
        cells: [
          { r: 1, c: 2 },
          { r: 1, c: 3 },
          { r: 1, c: 4 },
        ], // Head at 1,4, exit R. Free!
      },
      {
        id: 3,
        colorIndex: 2,
        dir: "D",
        cells: [
          { r: 3, c: 3 },
          { r: 4, c: 3 },
        ], // Head at 4,3, exit D. Free!
      },
      {
        id: 4,
        colorIndex: 3,
        dir: "L",
        cells: [
          { r: 4, c: 5 },
          { r: 4, c: 4 },
        ], // Head at 4,4, exit L. Blocked by Snake 3 at 4,3
      },
      {
        id: 5,
        colorIndex: 4,
        dir: "U",
        cells: [
          { r: 3, c: 4 },
          { r: 2, c: 4 },
        ], // Head at 2,4, exit U. Blocked by Snake 2 at 1,4
      },
    ],
  },
  {
    id: 4,
    size: 6,
    difficulty: "Normal",
    snakes: [
      {
        id: 1,
        colorIndex: 0,
        dir: "R",
        cells: [
          { r: 0, c: 1 },
          { r: 0, c: 2 },
          { r: 0, c: 3 },
        ],
      },
      {
        id: 2,
        colorIndex: 1,
        dir: "D",
        cells: [
          { r: 1, c: 4 },
          { r: 2, c: 4 },
          { r: 3, c: 4 },
        ],
      },
      {
        id: 3,
        colorIndex: 2,
        dir: "L",
        cells: [
          { r: 3, c: 2 },
          { r: 3, c: 1 },
          { r: 3, c: 0 },
        ],
      },
      {
        id: 4,
        colorIndex: 3,
        dir: "U",
        cells: [
          { r: 4, c: 1 },
          { r: 3, c: 1 },
          { r: 2, c: 1 },
        ],
      },
      {
        id: 5,
        colorIndex: 4,
        dir: "R",
        cells: [
          { r: 2, c: 2 },
          { r: 2, c: 3 },
        ],
      },
    ],
  },
  {
    id: 5,
    size: 6,
    difficulty: "Normal",
    snakes: [
      {
        id: 1,
        colorIndex: 0,
        dir: "D",
        cells: [
          { r: 0, c: 2 },
          { r: 1, c: 2 },
          { r: 2, c: 2 },
        ],
      },
      {
        id: 2,
        colorIndex: 1,
        dir: "L",
        cells: [
          { r: 2, c: 5 },
          { r: 2, c: 4 },
          { r: 2, c: 3 },
        ],
      },
      {
        id: 3,
        colorIndex: 2,
        dir: "R",
        cells: [
          { r: 3, c: 1 },
          { r: 3, c: 2 },
          { r: 3, c: 3 },
        ],
      },
      {
        id: 4,
        colorIndex: 3,
        dir: "U",
        cells: [
          { r: 5, c: 2 },
          { r: 4, c: 2 },
        ],
      },
      {
        id: 5,
        colorIndex: 4,
        dir: "L",
        cells: [
          { r: 4, c: 5 },
          { r: 4, c: 4 },
          { r: 4, c: 3 },
        ],
      },
      {
        id: 6,
        colorIndex: 5,
        dir: "R",
        cells: [
          { r: 1, c: 3 },
          { r: 1, c: 4 },
        ],
      },
    ],
  },
];

/**
 * Returns a level by number, adapting standard or colorblind colors.
 * Automatically switches to generating solvable levels for Level 6+.
 */
export function getLevel(levelNum: number, colorblind: boolean): Level {
  const palette = getColorPalette(colorblind);

  // Check handcrafted level
  const handcrafted = HANDCRAFTED_LEVELS.find((l) => l.id === levelNum);
  if (handcrafted) {
    const snakes: Snake[] = handcrafted.snakes.map((hs) => ({
      id: hs.id,
      color: palette[hs.colorIndex % palette.length],
      dir: hs.dir,
      cells: hs.cells,
      errored: false,
    }));

    // Verify handcrafted level is solvable
    if (isSolvable(snakes, handcrafted.size)) {
      return {
        id: levelNum,
        size: handcrafted.size,
        droplets: 4,
        difficulty: handcrafted.difficulty,
        snakes,
      };
    }
  }

  // Otherwise, dynamically generate a perfect level based on level number!
  // Scale difficulty parameters based on level number
  let size = 6;
  let numSnakes = 4;
  let minLen = 2;
  let maxLen = 3;
  let difficulty = "Easy";

  if (levelNum <= 2) {
    size = 5;
    numSnakes = 3;
    minLen = 2;
    maxLen = 3;
    difficulty = "Easy";
  } else if (levelNum <= 5) {
    size = 6;
    numSnakes = 4;
    minLen = 2;
    maxLen = 4;
    difficulty = "Easy";
  } else if (levelNum <= 9) {
    size = 6;
    numSnakes = 5;
    minLen = 2;
    maxLen = 4;
    difficulty = "Normal";
  } else if (levelNum <= 15) {
    size = 7;
    numSnakes = 6;
    minLen = 3;
    maxLen = 4;
    difficulty = "Normal";
  } else if (levelNum <= 22) {
    size = 7;
    numSnakes = 8;
    minLen = 3;
    maxLen = 5;
    difficulty = "Hard";
  } else if (levelNum <= 30) {
    size = 8;
    numSnakes = 9;
    minLen = 3;
    maxLen = 5;
    difficulty = "Hard";
  } else if (levelNum <= 40) {
    size = 8;
    numSnakes = 11;
    minLen = 3;
    maxLen = 6;
    difficulty = "Very Difficult";
  } else {
    // Super Hard levels!
    size = Math.min(10, 8 + Math.floor((levelNum - 40) / 10));
    numSnakes = Math.min(15, 11 + Math.floor((levelNum - 40) / 5));
    minLen = 3;
    maxLen = Math.min(7, 5 + Math.floor((levelNum - 40) / 15));
    difficulty = "Super Hard";
  }

  return generateSolvableLevel(levelNum, size, numSnakes, minLen, maxLen, difficulty, palette);
}
