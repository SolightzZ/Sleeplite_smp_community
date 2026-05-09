import { ADMIN } from "./constants/index.js";
import { refreshNameTagOnJoin, removeNameTag } from "./core/nametag.js";
import { showMainMenu } from "./ui/forms.js";
import { isValidPlayer } from "./utils/player.js";

export const chatRankplayerJoin = (event) => {
  if (isValidPlayer(event.player)) refreshNameTagOnJoin(event.player);
};

export const chatRankItemUse = (event) => {
  if (!event.source.hasTag(ADMIN)) return;
  if (event.source?.isValid) showMainMenu(event.source);
};

export const chatRankPlayerLeave = (event) => {
  if (isValidPlayer(event.player)) removeNameTag(event.player);
};
