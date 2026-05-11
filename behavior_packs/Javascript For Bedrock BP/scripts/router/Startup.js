import { system } from "@minecraft/server";
import { RegisterHelp } from "../help/help.js";
import { registerCommandAFK } from "../module/AFKCinematic/index.js";
import { registerCommands } from "../module/customCommands/Register.js";
import { registerSortCommands } from "../module/inventorySorter/index.js";
import { RegisterRewards } from "../module/rewards/system.js";
import { registerCustomCommandTakeASeat } from "../module/simpleSit/index.js";
import { ZoomCommand } from "../module/zoom/Command.js";

const startupHandlers = [
  registerCommands,
  registerCommandAFK,
  registerSortCommands,
  registerCustomCommandTakeASeat,
  RegisterRewards,
  RegisterHelp,
  ZoomCommand,
];

system.beforeEvents.startup.subscribe((init) => {
  try {
    const len = startupHandlers.length;
    for (let i = 0; i < len; i++) {
      startupHandlers[i](init);
    }
  } catch (e) {
    console.error("[ Startup ] error: ", e.message);
  }
});
