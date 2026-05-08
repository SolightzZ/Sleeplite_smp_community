import { system } from "@minecraft/server";
import { drop } from "./drop.js";
import { add, init } from "./score.js";

export function DathCounter(event) {
  const dead = event.deadEntity;
  if (dead?.typeId !== "minecraft:player") return;

  const dmg = event.damageSource;

  system.run(() => {
    if (dead.isValid) {
      drop(dead, dmg);
      add(dead);
    }
  });
}

system.run(init);
