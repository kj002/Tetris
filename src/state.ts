import { Block, Constants, tetrisColours, tetrisRotations, tetrisTypes } from "./constants";
import { Board, State } from "./types";
import { canMove, clearPieceFromBoard, createAndUpdateBoard, getBlockSize } from "./util";

export const initialState: State = {
    gameEnd: false,
    x: 4,
    y: -1,
    playerLevel: 0,
    playerScore: 0,
    playerHighScore: 0,
    board: Array.from({ length: Constants.GRID_HEIGHT }).map(() =>
      Array.from({ length: Constants.GRID_WIDTH }).map(() => null)
    ),
    currentPiece: {
      x: 0,
      y: 0,
      blocks: tetrisRotations[tetrisTypes[0]][0],
      colour: tetrisColours.I,
      rotation: 0,
    },
    currentPieceIndex: 0,
    currentRotationIndex: 0,
    nextPieceIndex: 0,
};

/** Checks if game is over based on the state of the board and the next position of the piece
 *
 * @param board Board of 2D array of SVG elements or null values
 * @param nextX next x coord of piece
 * @param nextY next Y coord of piecce
 * @returns boolean
 */
const isGameOver = (board: Board, nextX: number, nextY: number): boolean =>
  nextY === 0 && board[nextY][nextX] !== null;
  
/**
  * Updates the state by proceeding with one time step.
  * A lot of the functions changing and maintaining the state is done here.
  *
  * @param s Current state
  * @param {axis, amount} - Indicating the direction and amount of movement
  * @param random Random number to generate new piece
  * @returns Updated state
  */
export const tick = (
   s: State,
   { axis, amount }: { axis: string; amount: number },
   random: number
 ): State => {
   //determining the next positions of x and y
   //getting random value for index of the next generated piece
   const nextX = s.x + (axis === "x" ? amount : 0);
   const nextY = s.y + (axis === "y" ? amount : 0);
   const randomIndex = Math.round(random);
   const restart = axis === "x" && amount === 0;
   //sets the condition for restarting the game
   //setting the attributes back to initial state to restart everything, except the highscore
   //the index of the next piece becomes the current and a new random index is given to the next piece.
   if (restart)
     return {
       ...initialState,
       playerHighScore: s.playerHighScore,
       currentPieceIndex: s.nextPieceIndex,
       nextPieceIndex: randomIndex,
     };
   // Game hasn't ended, so continue
   const type = tetrisTypes[s.currentPieceIndex];
   const blocks = tetrisRotations[type][s.currentRotationIndex];
   const blockSize = getBlockSize(blocks);
   // Ensuring that the next position is within bounds
   const checkNextX = Math.max(0, Math.min(nextX, Constants.GRID_WIDTH));
   const checkNextY = Math.max(0, Math.min(nextY, Constants.GRID_HEIGHT));
   // Get the block color
   const blockColourKey = `${
     tetrisTypes[s.currentPieceIndex]
   }` as keyof typeof tetrisColours;
   const blockColour = tetrisColours[blockColourKey];
   // Clear the old position of the piece on the board
   const cleanBoard = clearPieceFromBoard(s.board, s.currentPiece);
   // Check if the piece is moving down or sideways or rotating
   const moveDown = axis === "y" && amount === 1;
   const moveSide = axis === "x" && amount !== 0;
   const rotate = axis === "y" && amount === 0;
   // Check if the game has ended
   const gameEnd = isGameOver(cleanBoard, nextX, nextY);
   //If the game ends, return the state as it is but update the highscore (if new made).
   if (gameEnd)
     return {
       ...s,
       playerHighScore: Math.max(s.playerHighScore, s.playerScore),
     };
   const newPiece = {
     x: checkNextX,
     y: checkNextY,
     blocks: blocks,
     colour: blockColour,
     rotation: 0,
   };
   const newBoard = createAndUpdateBoard(
     s.currentPiece,
     s.board,
     s.currentPiece.blocks,
     blockColour,
     checkNextX,
     checkNextY
   );
   if (rotate) {
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
       rotation: nextRotationIndex,
     };
     // Update the board
     const newBoard = createAndUpdateBoard(
       updatedPiece,
       cleanBoard,
       updatedPiece.blocks,
       blockColour,
       checkNextX,
       checkNextY
     );
     console.log(updatedPiece);
     // Ensure the rotation is valid (no collisions)
     if (canMove(s.board)(updatedPiece)(0, 0)) {
       return {
         ...s,
         board: newBoard,
         currentRotationIndex: nextRotationIndex,
         currentPiece: updatedPiece,
       };
     }
     console.log("here");
     return s; // Rotation not allowed
   }
   // Checks if there is collision with other pieces
   if (moveSide && !canMove(s.board)(newPiece)(amount, 0))
     return { ...s, gameEnd };
   // Checks if the piece landed by being on another piece or the bottom
   if (moveDown && !canMove(cleanBoard)(newPiece)(0, amount)) {
     // Create a function to check if a row is complete
     const isRowComplete = (row: (SVGElement | null)[]) =>
       row.every((cell) => cell !== null);
     // Determine the completed rows
     const completedRows = newBoard
       .map((row, rowIndex) => ({ row, rowIndex }))
       .filter(({ row }) => isRowComplete(row));
     // Check if there are any completed rows
     if (completedRows.length > 0) {
       // Create a new board without the completed rows
       const boardWithoutCompletedRows = newBoard.filter(
         (_, rowIndex) =>
           !completedRows.some(
             (completedRow) => completedRow.rowIndex === rowIndex
           )
       );
       // Create empty rows to fill the top
       const emptyRows = Array.from({ length: completedRows.length }).map(() =>
         Array.from({ length: Constants.GRID_WIDTH }).map(() => null)
       );
       // Combine the empty rows and the board without completed rows
       const finalBoard = [...emptyRows, ...boardWithoutCompletedRows];
       const newScore =
         s.playerScore + completedRows.length * Constants.SCORE_MULTIPLIER;
       return {
         ...initialState,
         board: finalBoard,
         playerScore: newScore,
         playerHighScore: s.playerHighScore,
         currentPieceIndex: s.nextPieceIndex,
         nextPieceIndex: randomIndex,
       };
     }
     return {
       ...s,
       x: initialState.x,
       y: initialState.y,
       board: newBoard,
       gameEnd,
       currentPiece: initialState.currentPiece,
       currentPieceIndex: s.nextPieceIndex,
       nextPieceIndex: randomIndex,
       currentRotationIndex: initialState.currentRotationIndex,
     };
   }
   // Get the next piece index
   // (if the next piece is the same as the current piece, get a new random piece)
   const nextPieceIndex =
     s.nextPieceIndex === s.currentPieceIndex ? randomIndex : s.nextPieceIndex;
   // Valid move, so update the state
   return {
     ...s,
     x: checkNextX,
     y: checkNextY,
     currentPiece: newPiece,
     nextPieceIndex,
     board: newBoard,
     gameEnd,
   };
 };
export const updateBlockAttributes = (board: Board): void => {
  board.forEach((row, rowIndex) => {
    row.forEach((cube, cellIndex) => {
      if (cube !== null) {
        cube.setAttribute("x", String(cellIndex * Block.WIDTH));
        cube.setAttribute("y", String(rowIndex * Block.HEIGHT));
      }
    });
  });
};