// Placement of the runner sheet's frames. The frames are drawn at different heights and a little
// off to one side of each other; these nudges (art pixels) line their feet and bodies up so that
// switching between running, standing and catching his breath does not make him jump.
// Frames are 0-based: 0-7 run, 8 stands, 9 catches his breath.
export const FRAME_NUDGE: readonly (readonly [number, number])[] = [
  [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
  [2, -2],
  [-1, -4],
];

export const FRAME = 64;
export const STAND_FRAME = 8;
export const BREATH_FRAME = 9;

/** Where his mouth is in the catching-breath frame (art pixels from the frame's top left). */
export const BREATH_MOUTH: readonly [number, number] = [46, 25];
