// Small shared state the scenes read when they draw. The game layer updates it before each frame.

export const runtime = {
  /** True while the runner stands at a stone (a hold segment). */
  atStone: false,
  /** Items collected so far (KM 5 floating items that have passed the runner). */
  collected: 0,
  /** Chai glasses at the tapri (the kettle easter egg adds a second). */
  glasses: 1,
  /** Runner is holding the paper cup from the refuel table. */
  cup: false,
  /** Runner has his arms up (finish line). */
  armsUp: false,
  /** performance.now() when the runner reached the finish; 0 otherwise. Confetti starts here. */
  finishAt: 0,
};
