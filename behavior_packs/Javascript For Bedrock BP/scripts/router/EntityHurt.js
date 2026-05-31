import { world } from "@minecraft/server";
import { onEntityHurt } from "../module/protection/core/events.js";
import { runEventHandlers } from "./utils.js";

world.beforeEvents.entityHurt.subscribe((ev) => {
  const hurtEntity = ev.hurtEntity;
  if (!hurtEntity || !hurtEntity.isValid) return;
  runEventHandlers("EntityHurt", [onEntityHurt], ev);
});
