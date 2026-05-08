import { system } from "@minecraft/server";
import { Configuration, TextColorCodes, UserMessages } from "../config.js";
import { zoneDatabase } from "./database.js";
import { playerHasAccessToZone } from "../utils/validation.js";
import { clearVisualStateForPlayer } from "./protection.js";
import { openMainMenuForPlayer, userInterfaceLockByPlayer } from "../ui/menu.js";

export function handleBlockEditPreEvent(event) {
  const { player, block } = event;
  const zone = zoneDatabase.findZoneByLocation(block.location);
  if (
    zone &&
    !playerHasAccessToZone(player, zone.ownerName, zoneDatabase.zoneByOwnerName)
  ) {
    event.cancel = true;
  }
}

export function handleEntityInteractPreEvent(event) {
  const { player, target } = event;
  if (!target?.typeId?.startsWith("minecraft:player")) return;

  const zone = zoneDatabase.findZoneByLocation(target.location);
  if (
    zone &&
    !playerHasAccessToZone(player, zone.ownerName, zoneDatabase.zoneByOwnerName)
  ) {
    event.cancel = true;
  }
}

export function handleExplosionPreEvent(event) {
  const loc = event.location;

  const zoneValues = Object.values(zoneDatabase.zoneByOwnerName);
  const zonesLen = zoneValues.length;
  if (zonesLen === 0) return;

  let nearZone = false;
  const radius = 8;

  for (let i = 0; i < zonesLen; i++) {
    const zone = zoneValues[i];
    if (
      loc.x >= zone.start.x - radius &&
      loc.x <= zone.end.x + radius &&
      loc.y >= zone.start.y - radius &&
      loc.y <= zone.end.y + radius &&
      loc.z >= zone.start.z - radius &&
      loc.z <= zone.end.z + radius
    ) {
      nearZone = true;
      break;
    }
  }

  if (!nearZone) return;

  const impacted = event.getImpactedBlocks();
  const impactedLen = impacted.length;
  for (let i = 0; i < impactedLen; i++) {
    if (zoneDatabase.findZoneByLocation(impacted[i].location)) {
      event.cancel = true;
      return;
    }
  }
}

export const ZoneProtection_OnItemUse = ({ source }) => {
  if (source && source.isValid) {
    openMainMenuForPlayer(source);
  }
};

export const ZoneProtection_OnChat = (event) => {
  const { sender: player, message } = event;
  if (message !== "!json") return;

  event.cancel = true;
  system.run(() => {
    try {
      if (!player.hasTag(Configuration.AdministratorTag))
        return player.sendMessage(UserMessages.AdministratorOnly);
      if (!Object.keys(zoneDatabase.zoneByOwnerName).length)
        return player.sendMessage(UserMessages.NoZonesInServer);

      const zoneData = Object.entries(zoneDatabase.zoneByOwnerName).map(
        ([owner, { start, end, friends }]) => ({
          owner,
          start: { x: start.x, y: start.y, z: start.z },
          end: { x: end.x, y: end.y, z: end.z },
          friends: friends.length ? friends : [],
        }),
      );
      console.warn(`[/] DataZone: ${JSON.stringify(zoneData, null, 2)}`);
    } catch (error) {
      player.sendMessage(`[x] Failed to load zone data`);
      console.warn(`${TextColorCodes.Error}Error !json: ${error}`);
    }
  });
};

export function clearVisualStateForPlayers(event) {
  const playerName = event;
  clearVisualStateForPlayer(playerName);
  userInterfaceLockByPlayer.delete(playerName);
  console.log("playerName:", playerName);
}
