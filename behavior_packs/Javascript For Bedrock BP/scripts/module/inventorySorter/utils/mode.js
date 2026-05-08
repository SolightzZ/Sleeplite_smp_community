import { SORTING_MODES } from "../config.js";

export const normalizeMode = (mode) => {
  const m = (mode ?? "type").toLowerCase();
  return SORTING_MODES[m] ?? "type";
};
