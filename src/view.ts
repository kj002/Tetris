import { Block, Viewport, tetrisBlocks, tetrisColours } from "./constants";
import { updateBlockAttributes } from "./state";
import { State } from "./types";
import { createSvgElement } from "./util";

  // Canvas elements
  export const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  export const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;
  const title = document.querySelector("#title") as HTMLElement;

  /** Rendering (side effects) */

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  export const render = (s: State) => {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    while (preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }

    updateBlockAttributes(s.board);
    s.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell) {
          svg.appendChild(cell);
        }
      });
    });

    const colours = Object.values(tetrisColours);
    // Add a block to the preview canvas
    tetrisBlocks[s.nextPieceIndex].blocks.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          const x = colIndex * Block.WIDTH;
          const y = rowIndex * Block.HEIGHT;

          const block = createSvgElement(svg.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${x + Block.WIDTH * 3}`,
            y: `${y + Block.WIDTH * 1}`,
            style: `fill: ${colours[s.nextPieceIndex]}`, // Use the block color
          });

          preview.appendChild(block);
        }
      });
    });

    // Update the text fields
    levelText.innerHTML = `${s.playerLevel}`;
    scoreText.innerHTML = `${s.playerScore}`;
    highScoreText.innerHTML = `${s.playerHighScore}`;
    title.innerHTML = "Tetris";

    if (s.gameEnd) title.innerHTML = "Game Over";
  };