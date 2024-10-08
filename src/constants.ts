import { TetrisPiece, TetrisType } from "./types";

export const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const;
  
  export const Constants = {
   TICK_RATE_MS: 500,
   GRID_WIDTH: 10,
   GRID_HEIGHT: 20,
   SCORE_MULTIPLIER: 50,
} as const;
  
export const Block = {
   WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
   HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

export const tetrisColours: Record<TetrisType, string> = {
   I: "cyan",
   J: "blue",
   L: "orange",
   O: "yellow",
   S: "green",
   T: "purple",
   Z: "red",
};
  
export const tetrisBlocks: TetrisPiece[] = [
  {
    type: "I",
    blocks: [[1, 1, 1, 1]],
  },
  {
    //J block formation
    type: "J",
    blocks: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    //L block formation
    type: "L",
    blocks: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    //O block formation
    type: "O",
    blocks: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    //S block formation
    type: "S",
    blocks: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    //T block formation
    type: "T",
    blocks: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    //Z block formation
    type: "Z",
    blocks: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
];

//mapping each tetris type to combinations of rotations
export const tetrisRotations: Record<TetrisType, number[][][]> = {
  I: [
    // Rotation 0
    [[1, 1, 1, 1]],
    // Rotation 90 degrees (clockwise)
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],

    // Rotation 180 degrees (clockwise)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
    ],
    // Rotation 270 degrees (clockwise)
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  J: [
    // Rotation 0
    [
      [0, 0, 0],
      [0, 0, 1],
      [1, 1, 1]
    ],
    // Rotation 90 degrees (clockwise)
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    // Rotation 180 degrees (clockwise)
    [  
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    // Rotation 270 degrees (clockwise)
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  L: [
    // Rotation 0
    [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    // Rotation 90 degrees (clockwise)
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    // Rotation 180 degrees (clockwise)
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    // Rotation 270 degrees (clockwise)
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  O: [
    // Rotation 0 and Rotation 90 degrees (clockwise) are the same for O piece
    [
      [1, 1],
      [1, 1],
    ],
  ],
  S: [
    // Rotation 0 and Rotation 180 degrees (clockwise) are the same for S piece
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    // Rotation 90 degrees (clockwise)
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  T: [
    // Rotation 0
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    // Rotation 90 degrees (clockwise)
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    // Rotation 180 degrees (clockwise)
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    // Rotation 270 degrees (clockwise)
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    // Rotation 0 and Rotation 180 degrees (clockwise) are the same for Z piece
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    // Rotation 90 degrees (clockwise)
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
};

//possible Tetris piece types
export const tetrisTypes: TetrisType[] = ["I", "J", "L", "O", "S", "T", "Z"];