import { system } from "@minecraft/server";
import { handleAFKSpawn } from "../module/AFKCinematic/index.js";
import { FlashlightRunInterval } from "../module/flashlight/core/engine.js";

const tasks = [
  { fn: FlashlightRunInterval, rate: 2, next: 0 },
  { fn: handleAFKSpawn, rate: 20, next: 0 },
];

let tick = 0;

system.runInterval(() => {
  tick++;
  const len = tasks.length;
  for (let i = 0; i < len; i++) {
    const t = tasks[i];
    if (tick < t.next) continue;
    t.next = tick + t.rate;
    t.fn();
  }
}, 1);
