import { Observable, map, scan } from "rxjs";
import { Board, State } from "./types";
import { Block, Constants, tetrisRotations, tetrisTypes } from "./constants";
import { svg } from "./view";

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
export const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
  ) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
  };

/**************************** Creating random numbers *************************************/
/**
 * A random number generator using Linear Congruential Generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 *
 * provides a stream of random numbers from the source stream
 *
 * source: fit2102, tutorial 4
 */
abstract class RNG {
  // LCG using GCC's constants
  private static m = 0x80000000; // 2**31
  private static a = 1103515245;
  private static c = 12345;
  /**
   * Call `hash` repeatedly to generate the sequence of hashes.
   * @param seed
   * @returns a hash of the seed
   */
  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;
  /**
   * Takes hash value and scales it to the range [0, 6]
   *
   * @param hash
   * @returns random number in the range of [0,6]
   *
   * source: ChatGPT
   */
  public static scale = (hash: number) => {
    const value = (2 * hash) / (RNG.m - 1) - 1;
    return (value + 1) * 3;
  };
}

export function createRngStreamFromSource<T>(source$: Observable<T>) {
  return function createRngStream(seed: number = 0): Observable<number> {
    const randomNumberStream = source$.pipe(
      scan((acc, _) => RNG.hash(acc), seed),
      map((num) => RNG.scale(num))
    );
    return randomNumberStream;
  };
}

/**************************** Creating blocks *************************************/

/** Calculates the size of a Tetris block piece based on its type.
 *
 *
 * @param tetrisType
 * @returns width and height properties of the block or
 * @returns null if the type doesn't exist.
 */
export const getBlockSize = (blocks: Number[][]) => {
  return {
    width: blocks[0].length,
    height: blocks.length,
  };
};

/**************************** Checking Collisions and Valid Positions *************************************/
/** Higher-order curried function used for checking if the piece can move accross the board,
 * which checks for collision with boundary and blocks. Takes in the game board and returns a function which
 * checks if the given piece can be moved by chosen dx and dy by avoiding collision.
 *
 * @param board A board of 2D Array of SVG elements or null values
 * @param piece Current tetris piece
 * @param {dx, dy} - Change in x and y coordinates
 * @returns boolean true - valid position to move, false - invalid position to move
 */
export const canMove =
    (board: Board) =>
    (piece: { x: number; y: number; blocks: number[][]; rotation: number }) =>
    (dx: number, dy: number) => {
    const isValidPosition = (x: number, y: number): boolean =>
        x >= 0 && x < Constants.GRID_WIDTH && y < Constants.GRID_HEIGHT;

    const hasCollision = (x: number, y: number): boolean =>
        !isValidPosition(x, y);

    return piece.blocks.every((row, rowIndex) =>
        row.every((cell, colIndex) => {
        if (cell === 0) return true; // Skip empty cells
        // Calculate the position of the cell after the move
        const newX = piece.x + colIndex;
        const newY = piece.y + rowIndex + dy;

        if (!isValidPosition(newX, newY) || hasCollision(newX, newY)) {
            console.log("here");
            return false; // Collision detected
        }

        // Check if the space is already occupied by another block
        if (dy === 1 && board[newY][newX] !== null) {
            console.log("here");
            return false; // Space is occupied
        }

        return true;
      })
    );
  };



/** Clears the piece from board by setting the values of the cells in the board to null.
 * @param board A board of 2D Array of SVG elements or null values
 * @param piece Current tetris piece
 * @returns updated rows of board
 */
export function clearPieceFromBoard(
  board: Board,
  piece: { x: number; y: number; blocks: number[][] }
): Board {
  const { x, y } = piece;
  return board.map((row, rowIdx) =>
    rowIdx < y || rowIdx >= y + piece.blocks.length
      ? row
      : row.map((cell, colIdx) =>
          colIdx < x || colIdx >= x + piece.blocks[0].length ? cell : null
        )
  );
}
/** Updates the game board using specified indices for row and column.
 *
 * @param board A board of 2D Array of either SVGElements or null values
 * @param rowIndex index of row
 * @param colIndex index of column
 * @param block current block
 * @returns new updated board
 */
export const updateBoard = (
  board: Board,
  rowIndex: number,
  colIndex: number,
  block: SVGElement
): Board => {
  const newBoard = board.map((row, r) =>
    r === rowIndex
      ? row.map((cell, c) => (c === colIndex ? block : cell))
      : row
  );
  return newBoard;
};
/** Creates a block represented by a SVG 'Rect' element depending on the cell value. If it is not equal to 1,
 * it returns null meaning no block's cube is occupying that cell. If it 1, it returns a SVG 'rect' value.
 *
 * @param cell Cell value of the grid board
 * @param rowIndex index of row
 * @param colIndex Index f column
 * @param blockColour Colour of the block piece following TetrisColours
 * @param checkNextX Making next position of x valid
 * @param checkNextY Making next position of y valid
 * @returns SVGElement or null
 */
export const createBlockFromCell = (
  cell: number,
  rowIndex: number,
  colIndex: number,
  blockColour: string,
  checkNextX: number,
  checkNextY: number
) => {
  if (cell !== 1) return null;
  const x = colIndex * Block.WIDTH;
  const y = rowIndex * Block.HEIGHT;
  return createSvgElement(svg.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${x + Block.WIDTH * checkNextX}`,
    y: `${y + Block.WIDTH * checkNextY}`,
    style: `fill: ${blockColour}`, // Use the block color
  });
};
/** Updates the board by adding the specific row of blocks with set attributes.*/
export const addRowToBoard = (
  board: Board,
  row: number[],
  rowIndex: number,
  blockColor: string,
  checkNextX: number,
  checkNextY: number
) => {
  //iterates over each cell in the row, calling createBlockFromCell() to create SVG elements into a block
  //when the function returns a value not null, it positions that block appropriately and updates the board.
  //if null is returned, it returns a new board.
  return row.reduce((newBoard, cell, colIndex) => {
    const block = createBlockFromCell(
      cell,
      rowIndex,
      colIndex,
      blockColor,
      checkNextX,
      checkNextY
    );
    return block
      ? updateBoard(
          newBoard,
          rowIndex + checkNextY,
          colIndex + checkNextX,
          block
        )
      : newBoard;
  }, board);
};
/** Updates the game board with new piece and clears the old one.
 *
 * @param currentPiece
 * @param oldBoard
 * @param blocks
 * @param blockColor
 * @param checkNextX
 * @param checkNextY
 * @returns cleared board
 */
export const createAndUpdateBoard = (
  currentPiece: {
    x: number;
    y: number;
    blocks: number[][];
    rotation: number;
  },
  oldBoard: Board,
  blocks: number[][],
  blockColor: string,
  checkNextX: number,
  checkNextY: number
) => {
  // Assuming clearPieceFromBoard is a pure function that returns a new board
  const clearedBoard = clearPieceFromBoard(oldBoard, currentPiece);
  //iterates over each block row to update the new board with rows occupied by the new piece.
  return blocks.reduce((newBoard, row, rowIndex) => {
    return addRowToBoard(
      newBoard,
      row,
      rowIndex,
      blockColor,
      checkNextX,
      checkNextY
    );
  }, clearedBoard);
};
/** Responsible for rotating the current block piece. It determines the piece's type and possible rotations
 * from the datat structures made and calculates the index of the upcoming rotated form of the piece.
 * It gives an updated piece by creating a copy of the block and updating its properties with the rotated
 * block's property.
 *
 * Source: ChatGPT
 *
 * @param s
 * @returns updated piece if rotated or
 * @returns s if rotation cannot happen
 */
export const rotatePiece = (s: State) => {
  const currentType = tetrisTypes[s.currentPieceIndex];
  const rotations = tetrisRotations[currentType];
  // Calculate the next rotation index (cyclically)
  const nextRotationIndex = (s.currentRotationIndex + 1) % rotations.length;
  // Update the current piece's blocks based on the new rotation
  const rotatedBlocks = rotations[nextRotationIndex];
  // Clone the current piece and update its blocks
  const updatedPiece = {
    ...s.currentPiece,
    blocks: rotatedBlocks,
  };
  // Ensure the rotation is valid (no collisions)
  if (canMove(s.board)(updatedPiece)) {
    return {
      ...s,
      rotationIndex: nextRotationIndex,
      currentPiece: updatedPiece,
    };
  }
  return s; // Rotation not allowed
};