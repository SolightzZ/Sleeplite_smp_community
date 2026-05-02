import { system } from "@minecraft/server";
import { registerCustomCommandIventory } from "../module/inventorySorter/commands.js";
import { registerCustomCommandTakeASeat } from "../module/simpleSit/index.js";
import { registerCommands } from "./customCommands/Register.js";
import { registerCommandAFK } from "../module/AFKCinematic/index.js";

system.beforeEvents.startup.subscribe((init) => {
  try {
    registerCommands(init);
    registerCommandAFK(init);
    registerCustomCommandIventory(init);
    registerCustomCommandTakeASeat(init);
  } catch (error) {
    console.error("[Startup] Failed to register commands: " + error);
  }
});
