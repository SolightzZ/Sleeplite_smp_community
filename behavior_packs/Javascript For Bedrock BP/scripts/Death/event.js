import { system, Player } from "@minecraft/server";
import { drop } from "./drop.js";
import { add, init } from "./score.js";

export const DathCounter = (e) => {
  const dead = e.deadEntity;
  const ifPlayer = dead?.typeId === "minecraft:player";
  if (!ifPlayer) return;

  system.run(() => {
    drop(dead, e.damageSource);
    add(dead);
  });
};

system.run(() => {
  init();
});
