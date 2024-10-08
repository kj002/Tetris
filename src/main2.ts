/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge, mergeMap } from "rxjs";
import { map, filter, scan, withLatestFrom } from "rxjs/operators";

import type { Observable } from "rxjs";
import { Constants, Viewport } from "./constants";
import { Key } from "./types";
import {createRngStreamFromSource} from "./util";
import { initialState, tick } from "./state";
import { render } from "./view";


/** Utility functions */


/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  /** The fromKey takes in user key and a value that defines the change in the user's movement keys
   * and returns a stream that produces a change when the key is pressed.
   */
  const fromKey = (
    keyCode: Key,
    change: { axis: "x" | "y"; amount: number } //defining the change in user's movement keys
  ) =>
    key$.pipe(
      filter(({ code }) => code === keyCode),
      map(() => change) //mapping the change of movement to each key
    );

  //allocating the type of movement to each user key
  const left$ = fromKey("KeyA", { axis: "x", amount: -1 });
  const right$ = fromKey("KeyD", { axis: "x", amount: 1 });
  const down$ = fromKey("KeyS", { axis: "y", amount: 1 });
  const rotate$ = fromKey("KeyW", { axis: "y", amount: 0 });
  const restart$ = fromKey("KeyR", { axis: "x", amount: 0 });

  /** Observables */

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

   /** Generates a stream of random numbers */
  const rngStream = createRngStreamFromSource(tick$);
  const rngStream$ = rngStream(1);
  /** drops the block by 1 grid every tick */
  const descend$ = tick$.pipe(mergeMap(() => [{ axis: "y", amount: 1 }]));

  const game$ = merge(left$, down$, right$, rotate$, restart$)
    .pipe(
      withLatestFrom(rngStream$),
      scan(
        (state, [change, randomIndex]) => tick(state, change, randomIndex),
        initialState
      )
    )
    .subscribe(render);
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}