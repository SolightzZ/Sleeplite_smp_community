import { world } from "@minecraft/server";
import { onEntityHurt } from "../module/protection/index.js";

world.beforeEvents.entityHurt.subscribe((ev) => {
  try {
    const hurtEntity = ev.hurtEntity;
    if (!hurtEntity || !hurtEntity.isValid) return;
    onEntityHurt(ev);
  } catch (e) {
    console.warn("entity_hurt", e.message);
  }
});
