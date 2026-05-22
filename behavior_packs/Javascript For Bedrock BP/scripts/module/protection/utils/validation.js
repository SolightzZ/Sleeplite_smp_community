import { ItemStack } from "@minecraft/server";
import { Config, EdgeOffsets, HalfZoneSize } from "../config.js";

export const hasAccess = (player, owner, zones) => {
  if (player.name === owner) return true;
  if (player.hasTag(Config.AdminTag)) return true;

  const zone = zones[owner];
  if (!zone || !zone.friends) return false;

  const friends = zone.friends;
  const friendsLen = friends.length;
  for (let i = 0; i < friendsLen; i++) {
    if (friends[i] === player.name) return true;
  }
  return false;
};

export const validateZoneCreate = (player, zones) => {
  const zoneCount = Object.keys(zones).length;

  if (zoneCount >= Config.MaxZones) {
    return { ok: false, reason: `[x] ถึงขีดจำกัด ${Config.MaxZones} โซน!` };
  }

  if (zones[player.name]) {
    return { ok: false, reason: `[x] มีโซนแล้ว!` };
  }

  if (player.dimension.id !== "minecraft:overworld") {
    return { ok: false, reason: `[x] ใช้ได้เฉพาะ Overworld!` };
  }

  const base = {
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y) - 1,
    z: Math.floor(player.location.z),
  };

  const bottom = base.y - HalfZoneSize;
  const top = base.y + HalfZoneSize;

  if (bottom < -63 || top > 319) {
    return { ok: false, reason: `[x] เกินขอบเขตความสูง!` };
  }

  return { ok: true, center: base };
};

export const consumeBlock = (player) => {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return false;

  const size = container.size;
  for (let i = 0; i < size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === Config.RequiredBlock) {
      if (item.amount > 1) {
        container.setItem(i, new ItemStack(Config.RequiredBlock, item.amount - 1));
      } else {
        container.setItem(i, undefined);
      }
      return true;
    }
  }
  return false;
};

export const isOverlapping = (a, b) => {
  return a.start.x <= b.end.x && a.end.x >= b.start.x && a.start.y <= b.end.y && a.end.y >= b.start.y && a.start.z <= b.end.z && a.end.z >= b.start.z;
};

export const isZoneOverlap = (newZone, zones) => {
  const owners = Object.keys(zones);
  const ownersLen = owners.length;
  for (let i = 0; i < ownersLen; i++) {
    if (isOverlapping(newZone, zones[owners[i]])) return true;
  }
  return false;
};

export const buildZone = (center) => {
  const h = HalfZoneSize;
  return {
    start: { x: center.x - h, y: center.y - h, z: center.z - h },
    end: { x: center.x + h, y: center.y + h, z: center.z + h },
    friends: [],
  };
};

export const isFormValid = (player, response) => {
  if (response.canceled) return false;
  const hasValues = "formValues" in response;
  const valuesOk = response.formValues && Array.isArray(response.formValues);
  if (hasValues && !valuesOk) {
    player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง!`);
    return false;
  }
  return true;
};

export const buildBorderPoints = (start, step) => {
  const points = [];
  const offsetsLen = EdgeOffsets.length;

  for (let i = 0; i < offsetsLen; i++) {
    const offset = EdgeOffsets[i];
    const axis = offset[0];
    const offX = offset[1];
    const offY = offset[2];
    const offZ = offset[3];

    for (let d = 0; d <= Config.ZoneSize; d += step) {
      const p = { x: start.x + offX, y: start.y + offY, z: start.z + offZ };
      if (axis === "x") p.x += d;
      if (axis === "y") p.y += d;
      if (axis === "z") p.z += d;
      points.push({ x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 });
    }
  }

  return points;
};
