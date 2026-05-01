import { system } from "@minecraft/server";
import { handleAddPlayer, handleAFK } from "../plugin/AFK_Cinematic";
import { FlashlightRunInterval } from "../plugin/Flashlight";
import { handleSit } from "../plugin/Take_A_Seat";

const tasks = [
  { run: FlashlightRunInterval, rate: 2, last: 0 },
  { run: handleAFK, rate: 1, last: 0 },
  { run: handleAddPlayer, rate: 10, last: 0 },
  { run: handleSit, rate: 100, last: 0 },
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
