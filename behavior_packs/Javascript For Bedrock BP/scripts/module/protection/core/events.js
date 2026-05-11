import { system } from "@minecraft/server";
import { Config } from "../config.js";
import { MenuLocks, openMenu } from "../ui/menu.js";
import { hasAccess } from "../utils/validation.js";
import { zoneDatabase } from "./database.js";
import { clearVisuals, uiLocks } from "./protection.js";

const isPlayer = (entity) => entity?.typeId?.startsWith("minecraft:player");
const isZoneMap = (zones) =>
  zones && typeof zones === "object" && !Array.isArray(zones);

export const onBlockEdit = (ev) => {
  const player = ev.player;
  const block = ev.block;
  if (!player || !block) return;

  const zone = zoneDatabase.findByLocation(block.location);
  if (!zone) return;

  if (!hasAccess(player, zone.owner, zoneDatabase.zones)) {
    ev.cancel = true;
  }
};

export const onEntityInteract = (ev) => {
  const player = ev.player;
  const target = ev.target;
  if (!player || !target) return;
  if (!isPlayer(target)) return;

  const zone = zoneDatabase.findByLocation(target.location);
  if (!zone) return;

  if (!hasAccess(player, zone.owner, zoneDatabase.zones)) {
    ev.cancel = true;
  }
};

export const onEntityHurt = (ev) => {
  const target = ev.hurtEntity;
  if (!target) return;

  const zone = zoneDatabase.findByLocation(target.location);
  if (!zone) return;

  const attacker = ev.damageSource?.damagingEntity;

  if (attacker && isPlayer(attacker)) {
    if (!hasAccess(attacker, zone.owner, zoneDatabase.zones)) {
      ev.cancel = true;
    }
  } else if (attacker) {
    ev.cancel = true;
  }
};

export const onExplosion = (ev) => {
  const loc = ev.source?.location;
  if (!loc) return;

  const zones = zoneDatabase.zones;
  if (!isZoneMap(zones)) return;

  const owners = Object.keys(zones);
  const ownersLen = owners.length;
  if (ownersLen === 0) return;

  let near = false;
  const radius = 8;

  for (let i = 0; i < ownersLen; i++) {
    const z = zones[owners[i]];
    if (!z?.start || !z?.end) continue;

    if (
      loc.x >= z.start.x - radius &&
      loc.x <= z.end.x + radius &&
      loc.y >= z.start.y - radius &&
      loc.y <= z.end.y + radius &&
      loc.z >= z.start.z - radius &&
      loc.z <= z.end.z + radius
    ) {
      near = true;
      break;
    }
  }

  if (!near) return;

  const impacted = ev.getImpactedBlocks();
  const len = impacted.length;
  for (let i = 0; i < len; i++) {
    if (zoneDatabase.findByLocation(impacted[i].location)) {
      ev.cancel = true;
      return;
    }
  }
};

export const onItemUse = (ev) => {
  const source = ev.source;
  if (source && source.isValid) {
    openMenu(source);
  }
};

export const onChat = (ev) => {
  const player = ev.sender;
  const msg = ev.message;
  if (msg !== "!json") return;

  ev.cancel = true;
  system.run(() => {
    if (!player.isValid) return;
    if (!player.hasTag(Config.AdminTag)) {
      player.sendMessage(`[x] เฉพาะแอดมิน!`);
      return;
    }

    const zones = zoneDatabase.zones;
    if (!isZoneMap(zones)) {
      player.sendMessage(`[x] ไม่มีโซน!`);
      return;
    }

    const owners = Object.keys(zones);
    if (owners.length === 0) {
      player.sendMessage(`[x] ไม่มีโซน!`);
      return;
    }

    const data = [];
    const ownersLen = owners.length;
    for (let i = 0; i < ownersLen; i++) {
      const owner = owners[i];
      const z = zones[owner];
      if (!z?.start || !z?.end) continue;

      data.push({
        owner: owner,
        start: { x: z.start.x, y: z.start.y, z: z.start.z },
        end: { x: z.end.x, y: z.end.y, z: z.end.z },
        friends: z.friends,
      });
    }

    console.warn(`[/] Zones: ${JSON.stringify(data, null, 2)}`);
  });
};

export const onPlayerLeave = (playerName) => {
  clearVisuals(playerName);
  uiLocks.delete(playerName);
  MenuLocks.delete(playerName);
};
