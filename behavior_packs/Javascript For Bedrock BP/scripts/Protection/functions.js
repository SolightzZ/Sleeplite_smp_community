import { ItemStack } from "@minecraft/server";
import { Configuration, HalfZone, UserMessages, EdgeOffsets } from "./constants.js";

export const playerHasAccessToZone = (player, ownerName, zoneByOwnerName) =>
  player.name === ownerName || zoneByOwnerName[ownerName]?.friends.includes(player.name) || player.hasTag(Configuration.AdministratorTag);

export const validateZoneCreation = (player, zoneByOwnerName) => {
  if (Object.keys(zoneByOwnerName).length >= Configuration.MaximumZonesInServer) {
    return { isValid: false, reason: UserMessages.ServerZoneLimitReached };
  }
  if (zoneByOwnerName[player.name]) {
    return { isValid: false, reason: UserMessages.PlayerAlreadyHasZone };
  }
  if (player.dimension.id !== "minecraft:overworld") {
    return { isValid: false, reason: UserMessages.OnlyOverworld };
  }

  const base = { x: Math.floor(player.location.x), y: Math.floor(player.location.y) - 1, z: Math.floor(player.location.z) };
  const bottom = base.y - HalfZone;
  const top = base.y + HalfZone;

  if (bottom < -63 || top > 319) {
    return { isValid: false, reason: UserMessages.HeightOutOfRange };
  }
  return { isValid: true, baseCenter: base };
};

export const consumeRequiredBlockFromInventory = (player) => {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return false;

  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (item?.typeId === Configuration.RequiredBlockToCreateZone) {
      if (item.amount > 1) {
        container.setItem(slot, new ItemStack(Configuration.RequiredBlockToCreateZone, item.amount - 1));
      } else {
        container.setItem(slot, undefined);
      }
      return true;
    }
  }
  return false;
};

export const isBoxOverlapping = (a, b) =>
  a.start.x <= b.end.x && a.end.x >= b.start.x && a.start.y <= b.end.y && a.end.y >= b.start.y && a.start.z <= b.end.z && a.end.z >= b.start.z;

export const isNewZoneOverlappingAny = (newZone, zoneByOwnerName) => {
  for (const zone of Object.values(zoneByOwnerName)) {
    if (isBoxOverlapping(newZone, zone)) return true;
  }
  return false;
};

export const buildNewZoneFromCenter = (center) => ({
  start: { x: center.x - HalfZone, y: center.y - HalfZone, z: center.z - HalfZone },
  end: { x: center.x + HalfZone, y: center.y + HalfZone, z: center.z + HalfZone },
  friends: [],
});

export const isFormOk = (player, response) => {
  if (response.canceled || ("formValues" in response && (!response.formValues || !Array.isArray(response.formValues)))) {
    player.sendMessage(UserMessages.InvalidForm);
    return false;
  }
  return true;
};

export const buildBorderPoints = (start, step) => {
  const points = [];
  const distance = step;
  for (const [axis, offX, offY, offZ] of EdgeOffsets) {
    for (let d = 0; d <= Configuration.ZoneSideLength; d += distance) {
      const p = { x: start.x + offX, y: start.y + offY, z: start.z + offZ };
      if (axis === "x") p.x += d;
      if (axis === "y") p.y += d;
      if (axis === "z") p.z += d;
      points.push({ x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 });
    }
  }
  return points;
};
