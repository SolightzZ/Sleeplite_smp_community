import { system } from "@minecraft/server";
import { activeSeats } from "./seat-manager.js";
import { isRemovedBlock } from "../utils/block.js";
import { seatHasMoved } from "../utils/location.js";

let checkInterval = null;

const WATER = "minecraft:water";
const FLOWING_WATER = "minecraft:flowing_water";

export const startGlobalSeatCheck = () => {
  if (checkInterval !== null) return;

  checkInterval = system.runInterval(() => {
    const entries = Array.from(activeSeats.entries());
    const entriesLen = entries.length;

    for (let i = 0; i < entriesLen; i++) {
      const seatId = entries[i][0];
      const data = entries[i][1];
      const entity = data.seatEntity;
      const dim = data.dimension;
      const spawnLoc = data.spawnLocation;
      const blockLoc = data.blockLocation;

      if (!entity || !entity.isValid) {
        activeSeats.delete(seatId);
        continue;
      }

      let blockRemoved = false;
      if (blockLoc) {
        try {
          const block = dim.getBlock(blockLoc);
          blockRemoved = block ? isRemovedBlock(block.typeId) : true;
        } catch {
          blockRemoved = true;
        }
      } else {
        const underLoc = {
          x: Math.floor(entity.location.x),
          y: Math.floor(entity.location.y) - 1,
          z: Math.floor(entity.location.z),
        };
        try {
          const underBlock = dim.getBlock(underLoc);
          blockRemoved = underBlock ? isRemovedBlock(underBlock.typeId) : true;
        } catch {
          blockRemoved = true;
        }
      }

      let inWater = false;
      try {
        const seatBlock = dim.getBlock(entity.location);
        inWater = seatBlock?.typeId === WATER || seatBlock?.typeId === FLOWING_WATER;
      } catch {}

      const moved = seatHasMoved(entity.location, spawnLoc);

      const rideable = entity.getComponent("minecraft:rideable");
      let hasRider = false;
      if (rideable) {
        const riders = rideable.getRiders();
        hasRider = riders.length > 0;
      }

      if (blockRemoved || inWater || moved || !hasRider) {
        try {
          entity.remove();
        } catch {}
        activeSeats.delete(seatId);
      }
    }

    if (activeSeats.size === 0) {
      system.clearRun(checkInterval);
      checkInterval = null;
    }
  }, 10);
};
