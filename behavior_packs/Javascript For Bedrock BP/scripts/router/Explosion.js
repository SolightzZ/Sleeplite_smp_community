import { world } from "@minecraft/server";
import { handleExplosionPreEvent } from "../module/protection/system";

world.beforeEvents.explosion.subscribe(handleExplosionPreEvent);
