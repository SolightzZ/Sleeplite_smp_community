import { system } from "@minecraft/server";

import { handleAFKSpawn } from "../module/AFKCinematic/index.js";
import { FlashlightRunInterval } from "../module/flashlight/core/engine.js";

const tasks = [
  { run: FlashlightRunInterval, rate: 2, next: 0 },
  { run: handleAFKSpawn, rate: 20, next: 0 },
];

function runTaskList(list) {
  for (let i = 0; i < list.length; i++) {
    const task = list[i];
    if (tick < task.next) continue;
    task.next = tick + task.rate;
    task.run();
  }
}

let tick = 0;

system.runInterval(() => {
  tick++;
  runTaskList(tasks);
}, 1);
