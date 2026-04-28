import { world } from "@minecraft/server";
import { onCropBreak } from "./event.js";

world.beforeEvents.playerBreakBlock.subscribe(onCropBreak);
