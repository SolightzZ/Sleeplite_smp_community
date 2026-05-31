import { world } from "@minecraft/server";
import { onExplosion } from "../module/protection/core/events.js";

world.beforeEvents.explosion.subscribe(onExplosion);
