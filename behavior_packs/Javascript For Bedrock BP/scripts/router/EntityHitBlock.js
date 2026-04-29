import { world } from "@minecraft/server";
import { LlightentityHitBlock } from "../module/light/main";

world.afterEvents.entityHitBlock.subscribe(LlightentityHitBlock);
