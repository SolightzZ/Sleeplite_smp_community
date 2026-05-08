import { system } from "@minecraft/server";
import { activeSeats } from "./seat-manager";
import { isRemovedBlock } from "../utils/block";
import { seatHasMoved } from "../utils/location";

export let globalSeatCheckInterval = null;

export function startGlobalSeatCheck() {
  if (globalSeatCheckInterval !== null) return;

  globalSeatCheckInterval = system.runInterval(() => {
    for (const [seatId, seatData] of activeSeats) {
      const { seatEntity, dimension, spawnLocation, blockLocation } = seatData;

      if (!seatEntity || !seatEntity.isValid()) {
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
      const hasRider = rideable ? rideable.getRiders().length > 0 : false;

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
