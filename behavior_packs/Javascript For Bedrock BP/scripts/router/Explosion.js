import { world } from "@minecraft/server";
import { onExplosion } from "../module/protection/index.js";

world.beforeEvents.explosion.subscribe(onExplosion);
