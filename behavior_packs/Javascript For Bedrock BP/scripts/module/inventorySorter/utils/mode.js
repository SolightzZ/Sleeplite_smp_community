import { SortModes } from "../config.js";

export const normalizeMode = (mode) => {
  const m = (mode ?? "type").toLowerCase();
  return SortModes[m] ?? "type";
};
