import { system } from "@minecraft/server";
import { zoneDatabase } from "./core/database.js";
import { onBlockEdit, onChat, onEntityHurt, onEntityInteract, onExplosion, onItemUse } from "./core/events.js";

system.run(() => zoneDatabase.load());

export { onBlockEdit, onChat, onEntityHurt, onEntityInteract, onExplosion, onItemUse };
