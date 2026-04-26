import { system, Player } from "@minecraft/server";
import { drop } from "./drop.js";
import { add, init } from "./score.js";

export function DathCounter(e) {
  const dead = e.deadEntity;
  const IfPlayer = dead instanceof Player;
  if (!IfPlayer) return;

  system.run(() => {
    drop(dead, e.damageSource);
    add(dead);
  });
}

system.run(() => {
  init();
  console.warn("Death Counter loaded successfully");
});
