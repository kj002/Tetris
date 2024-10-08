/** Block properties */

export type TetrisType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

//defining tetris piece structure
export interface TetrisPiece {
  type: TetrisType;
  blocks: number[][];
}

/** User input */

export type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyR";

/** State processing */
export type Board = (SVGElement | null)[][];

export type State = Readonly<{
  gameEnd: boolean;
  x: number;
  y: number;
  playerLevel: number;
  playerScore: number;
  playerHighScore: number;
  board: Board;
  currentPiece: {
    x: number;
    y: number;
    blocks: number[][];
    colour: string;
    rotation: number;
  };
  currentPieceIndex: number;
  currentRotationIndex: number;
  nextPieceIndex: number;
}>;

