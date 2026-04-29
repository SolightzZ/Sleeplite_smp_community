import { system } from "@minecraft/server";
import { registerCommands } from "./customCommands/Register.js";
import { registerCommandAFK } from "../plugin/AFK_Cinematic.js";
import { registerCustomCommandIventory } from "../module/inventorySorter/commands.js";
import { registerCustomCommandTakeASeat } from "../plugin/Take_A_Seat.js";

system.beforeEvents.startup.subscribe((init) => {
  registerCommands(init);
  registerCommandAFK(init);
  registerCustomCommandIventory(init);
  registerCustomCommandTakeASeat(init);
});
