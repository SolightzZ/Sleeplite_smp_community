import { system } from "@minecraft/server";
import { RegisterHelp } from "../help/help.js";
import { registerCommandAFK } from "../module/AFKCinematic/index.js";
import { registerCommands } from "../module/customCommands/Register.js";
import { registerCustomCommandIventory } from "../module/inventorySorter/index.js";
import { RegisterRewards } from "../module/rewards/system.js";
import { registerCustomCommandTakeASeat } from "../module/simpleSit/index.js";

system.beforeEvents.startup.subscribe((init) => {
  try {
    registerCommands(init);
    registerCommandAFK(init);
    registerCustomCommandIventory(init);
    registerCustomCommandTakeASeat(init);
    RegisterRewards(init);
    RegisterHelp(init);
  } catch (error) {
    console.error("[Startup] Failed to register commands: " + error);
  }
});
