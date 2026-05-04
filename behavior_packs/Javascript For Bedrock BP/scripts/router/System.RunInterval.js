import { system } from "@minecraft/server";

import { FlashlightRunInterval } from "../plugin/Flashlight";
import { handleIdlePoller } from "../module/AFKCinematic/index.js";

const tasks = [
  { run: FlashlightRunInterval, rate: 2, last: 0 },
  { run: handleIdlePoller, rate: 20, last: 0 },
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
