import { system } from "@minecraft/server";
import { zoneDatabase } from "./core/database.js";
import {
  handleBlockEditPreEvent,
  handleEntityInteractPreEvent,
  handleExplosionPreEvent,
  ZoneProtection_OnItemUse,
  ZoneProtection_OnChat,
  clearVisualStateForPlayers
} from "./core/events.js";

system.run(() => zoneDatabase.loadAllZonesFromStorage());

export {
  handleBlockEditPreEvent,
  handleEntityInteractPreEvent,
  handleExplosionPreEvent,
  ZoneProtection_OnItemUse,
  ZoneProtection_OnChat,
  clearVisualStateForPlayers
};
