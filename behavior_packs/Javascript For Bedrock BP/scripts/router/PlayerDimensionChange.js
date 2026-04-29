import { world } from "@minecraft/server";
import { handlePlayerDimensionChange } from "../module/biometype/system";

world.afterEvents.playerDimensionChange.subscribe(handlePlayerDimensionChange);
