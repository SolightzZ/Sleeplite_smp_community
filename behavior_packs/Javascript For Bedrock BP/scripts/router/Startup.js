import { system } from "@minecraft/server";
import { registerCustomCommandIventory } from "../module/inventorySorter/commands.js";
import { registerCommandAFK } from "../plugin/AFK_Cinematic.js";
import { registerCustomCommandTakeASeat } from "../plugin/Take_A_Seat.js";
import { registerCommands } from "./customCommands/Register.js";

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
