import { showMain } from "./functions.js";

export function startEmote({ source }) {
  if (source && source.isValid) {
    showMain(source);
  }
}
