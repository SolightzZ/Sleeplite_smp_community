import { world } from "@minecraft/server";
import { handleExplosionPreEvent } from "../module/protection/index";


world.beforeEvents.explosion.subscribe(handleExplosionPreEvent);
