import { system } from "@minecraft/server";
import { activeSeats } from "./seat-manager.js";
import { isRemovedBlock } from "../utils/block.js";
import { seatHasMoved } from "../utils/location.js";

export let globalSeatCheckInterval = null;

export function startGlobalSeatCheck() {
  if (globalSeatCheckInterval !== null) return;

  globalSeatCheckInterval = system.runInterval(() => {
    const entries = Array.from(activeSeats.entries());
    const entriesLen = entries.length;

    for (let i = 0; i < entriesLen; i++) {
      const [seatId, seatData] = entries[i];
      const { seatEntity, dimension, spawnLocation, blockLocation } = seatData;

      if (!seatEntity || !seatEntity.isValid) {
        activeSeats.delete(seatId);
        continue;
      }

      let isBlockRemoved = false;
      if (blockLocation) {
        try {
          const block = dimension.getBlock(blockLocation);
          isBlockRemoved = block ? isRemovedBlock(block.typeId) : true;
        } catch {
          isBlockRemoved = true;
        }
      } else {
        const underLocation = {
          x: Math.floor(seatEntity.location.x),
          y: Math.floor(seatEntity.location.y) - 1,
          z: Math.floor(seatEntity.location.z),
        };
        try {
          const underBlock = dimension.getBlock(underLocation);
          isBlockRemoved = underBlock ? isRemovedBlock(underBlock.typeId) : true;
        } catch {
          isBlockRemoved = true;
        }
      }

      let isSeatInWater = false;
      try {
        const seatBlock = dimension.getBlock(seatEntity.location);
        isSeatInWater = seatBlock?.typeId === "minecraft:water" || seatBlock?.typeId === "minecraft:flowing_water";
      } catch { }

      const hasMoved = seatHasMoved(seatEntity.location, spawnLocation);

      const rideable = seatEntity.getComponent("minecraft:rideable");
      let hasRider = false;
      if (rideable) {
        const riders = rideable.getRiders();
        hasRider = riders.length > 0;
      }

      if (isBlockRemoved || isSeatInWater || hasMoved || !hasRider) {
        try {
          seatEntity.remove();
        } catch { }
        activeSeats.delete(seatId);
      }
    }

    if (activeSeats.size === 0) {
      system.clearRun(globalSeatCheckInterval);
      globalSeatCheckInterval = null;
    }
  }, 10);
}
