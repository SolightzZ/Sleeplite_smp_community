import { world } from "@minecraft/server";
import * as State from "./state.js";
import * as UI from "./ui.js";

const dayState = new Map();

export function checkday() {
  const nowDay = Math.floor(world.getAbsoluteTime() / 24000);
  const lastDay = dayState.get("lastday");

  if (lastDay === undefined) {
    dayState.set("lastday", nowDay);
    return;
  }

  if (nowDay > lastDay) {
    for (const player of world.getPlayers()) {
      State.clear(player);
    }

    UI.playmovie(nowDay);
    dayState.set("lastday", nowDay);
  }
}
