import { world } from "@minecraft/server";

import "./economy/system.js";
import "./DailyFoodLimit/main.js";
import "./Protection/system.js";
import "./CustomCommand/system.js";
import "./tools/crops/index.js";
import "./tools/hammer/index.js";
import "./Inventory_Sorter/commands.js";

// Plugins
import "./plugins/chatrankss.js";
import "./plugins/Welcome.js";
import "./plugins/Report.js";

// New Addons
import "./plugins/afkcinematics.js";
import "./plugins/index.js";


// API TEST
// import "./API.js";
import "./MLChatbot.js"

import { handlePlayerDimensionChange } from "./BiomeType/system.js";
import { LlightentityHitBlock } from "./light/main.js";
import { onGravestoneInteract } from "./Others/gravestones_entity.js";
import { touch } from "./EndPortalFrame/play.js";

import { onItemUse } from "./A_itemUse.js";
import { onEntityDeath } from "./B_entityDie.js";
import { onChatMessage } from "./C_chatSend.js";
import { onEntitySpawn } from "./D_EntitySpawn.js";
import { onPlayerLeave } from "./F_playerLeave.js";

world.afterEvents.itemUse.subscribe(onItemUse);
world.afterEvents.entityDie.subscribe(onEntityDeath);
world.beforeEvents.chatSend.subscribe(onChatMessage);
world.afterEvents.entitySpawn.subscribe(onEntitySpawn);
world.afterEvents.playerLeave.subscribe(onPlayerLeave);
world.beforeEvents.playerInteractWithBlock.subscribe(touch);
world.afterEvents.playerDimensionChange.subscribe(handlePlayerDimensionChange);
world.afterEvents.entityHitBlock.subscribe(LlightentityHitBlock);
world.beforeEvents.playerInteractWithEntity.subscribe(onGravestoneInteract);

import "./Others/RuntimeInfo.js";
