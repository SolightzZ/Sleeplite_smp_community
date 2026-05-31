import { ADMIN } from "./constants/constants.js";
import { refreshNameTagOnJoin } from "./core/nametag.js";
import { showMainMenu } from "./ui/forms.js";
import { isValidPlayer } from "./utils/player.js";

export const chatRankPlayerJoin = (event) => {
  if (isValidPlayer(event.player)) refreshNameTagOnJoin(event.player);
};

export const chatRankItemUse = (event) => {
  if (!event.source?.hasTag(ADMIN)) return;
  if (event.source.isValid) showMainMenu(event.source);
};
