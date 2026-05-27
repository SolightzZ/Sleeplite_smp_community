import { removeMagnetUser } from "./core/state.js";
import { showMagnetMenu } from "./ui/menu.js";

export const onMagnetUse = ({ source }) => {
  if (source && source.isValid) showMagnetMenu(source);
};

export const onMagnetPlayerLeave = (playerId) => removeMagnetUser(playerId);

export const onMagnetPlayerDie = (event) => {
  if (event.deadEntity?.typeId === "minecraft:player") {
    removeMagnetUser(event.deadEntity.id);
  }
};
