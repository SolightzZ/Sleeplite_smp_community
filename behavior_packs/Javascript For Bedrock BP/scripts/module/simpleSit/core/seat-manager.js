import { system } from "@minecraft/server";
import { SEAT_ENTITY_ID } from "../constants.js";
import { startGlobalSeatCheck } from "./seat-checker.js";

export const activeSeats = new Map();

export function registerSeat(seatEntity, spawnLocation, dimension, blockLocation) {
  activeSeats.set(seatEntity.id, {
    seatEntity,
    dimension,
    spawnLocation: { ...spawnLocation },
    blockLocation,
  });
  startGlobalSeatCheck();
}

export function spawnSeat(dimension, spawnLocation, rotation, player, blockLocation) {
  system.runTimeout(() => {
    try {
      const seat = dimension.spawnEntity(SEAT_ENTITY_ID, spawnLocation);
      seat.setRotation(rotation);
      seat.getComponent("minecraft:rideable")?.addRider(player);
      registerSeat(seat, spawnLocation, dimension, blockLocation);
    } catch { }
  }, 5);
}
