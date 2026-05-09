import { world } from "@minecraft/server";
import { isValidPlayer } from "./utils/player.js";
import { showMainMenu } from "./ui/forms.js";
import { removeNameTag, refreshNameTagOnJoin } from "./core/nametag.js";

export const chatRankplayerJoin = (event) => {
  if (isValidPlayer(event.player)) refreshNameTagOnJoin(event.player);
};

export const chatRankItemUse = (event) => {
  if (event.source?.isValid) showMainMenu(event.source);
};

export const chatRankPlayerLeave = (event) => {
  if (isValidPlayer(event.player)) removeNameTag(event.player);
};
