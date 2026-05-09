import { system } from "@minecraft/server";
import { SEAT_ENTITY_ID } from "../constants.js";
import { startGlobalSeatCheck } from "./seat-checker.js";

export const activeSeats = new Map();

export const registerSeat = (entity, spawnLoc, dim, blockLoc) => {
  activeSeats.set(entity.id, {
    seatEntity: entity,
    dimension: dim,
    spawnLocation: { x: spawnLoc.x, y: spawnLoc.y, z: spawnLoc.z },
    blockLocation: blockLoc,
  });
  startGlobalSeatCheck();
};

export const spawnSeat = (dim, spawnLoc, rot, player, blockLoc) => {
  system.runTimeout(() => {
    try {
      const seat = dim.spawnEntity(SEAT_ENTITY_ID, spawnLoc);
      seat.setRotation(rot);
      seat.getComponent("minecraft:rideable")?.addRider(player);
      registerSeat(seat, spawnLoc, dim, blockLoc);
    } catch (e) {
      console.error("[ simpleSit ] spawnSeat: " + e);
    }
  }, 5);
};
