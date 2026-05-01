import { system } from "@minecraft/server";
import { drop } from "./drop.js";
import { add, init } from "./score.js";

export function DathCounter(event) {
  const dead = event.deadEntity;
  const ifPlayer = dead?.typeId === "minecraft:player";
  if (!ifPlayer) return;

  system.run(() => {
    drop(dead, event.damageSource);
    add(dead);
  });
}

system.run(() => {
  init();
});
