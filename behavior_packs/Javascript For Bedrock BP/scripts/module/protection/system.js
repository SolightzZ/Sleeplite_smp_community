import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  Configuration,
  TextColorCodes,
  UserMessages,
  HalfZone,
} from "./constants.js";
import { ZoneDatabase } from "./database.js";
import { playerHasAccessToZone } from "./functions.js";
import {
  showZoneBorderForPlayer,
  createZoneForPlayer,
  deleteZoneOfPlayer,
  manageZoneFriends,
  administratorDeleteAnyZone,
  administratorTeleportToZone,
  clearVisualStateForPlayer,
} from "./logic.js";

const zoneDatabase = new ZoneDatabase();
const userInterfaceLockByPlayer = new Set();

const buildMenuBodyText = (player) => {
  const zone = zoneDatabase.zoneByOwnerName[player.name];
  const friendEntry = Object.entries(zoneDatabase.zoneByOwnerName).find(
    ([_, z]) => z.friends.includes(player.name),
  );

  const lines = [
    `§7จำนวนโซน: ${Object.keys(zoneDatabase.zoneByOwnerName).length}/${Configuration.MaximumZonesInServer}`,
  ];

  if (zone || friendEntry) {
    const zoneOwner = zone ? player.name : friendEntry[0];
    const zoneData = zone || friendEntry[1];
    const center = {
      x: zoneData.start.x + HalfZone,
      y: zoneData.start.y + HalfZone,
      z: zoneData.start.z + HalfZone,
    };

    lines.push(
      `โซนของคุณ: ${zoneOwner}`,
      `เพื่อน: ${zoneData.friends.length ? zoneData.friends.join(", ") : "ไม่มี"}`,
      `จุดศูนย์กลาง: (${center.x}, ${center.y}, ${center.z})`,
    );
  } else {
    lines.push("");
  }

  return lines.join("\n");
};

const pushAction = (list, fn) => list.push(fn);

const buildMenuButtonsAndActions = (form, player, isAdministrator) => {
  const playerZone = zoneDatabase.zoneByOwnerName[player.name];
  const actions = [];

  if (!playerZone) {
    if (
      Object.keys(zoneDatabase.zoneByOwnerName).length <
      Configuration.MaximumZonesInServer
    ) {
      form.button("สร้างโซน", "textures/ui/sidebar_icons/addon");
      pushAction(actions, () => createZoneForPlayer(player, zoneDatabase));
    }
    if (isAdministrator) {
      form.button("ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      form.button(
        "เทเลพอร์ต (แอดมิน)",
        "textures/ui/sidebar_icons/my_characters",
      );
      pushAction(actions, () =>
        administratorDeleteAnyZone(player, zoneDatabase),
      );
      pushAction(actions, () =>
        administratorTeleportToZone(player, zoneDatabase),
      );
    }
  } else {
    form.button("จัดการเพื่อน", "textures/ui/sidebar_icons/wish_list");
    form.button("แสดงขอบเขต", "textures/ui/sidebar_icons/classic_skins");
    form.button("ลบโซน", "textures/ui/sidebar_icons/squaredonut");
    pushAction(actions, () => manageZoneFriends(player, zoneDatabase));
    pushAction(actions, () => showZoneBorderForPlayer(player, zoneDatabase));
    pushAction(actions, () => deleteZoneOfPlayer(player, zoneDatabase));

    if (isAdministrator) {
      form.button("ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      form.button(
        "เทเลพอร์ต (แอดมิน)",
        "textures/ui/sidebar_icons/my_characters",
      );
      pushAction(actions, () =>
        administratorDeleteAnyZone(player, zoneDatabase),
      );
      pushAction(actions, () =>
        administratorTeleportToZone(player, zoneDatabase),
      );
    }
  }
  return actions;
};

const openMainMenuForPlayer = async (player) => {
  if (userInterfaceLockByPlayer.has(player.name))
    return player.sendMessage(`[x] กรุณารอสักครู่!`);

  userInterfaceLockByPlayer.add(player.name);
  try {
    const isAdministrator = player.hasTag(Configuration.AdministratorTag);
    const form = new ActionFormData()
      .title("โซนป้องกัน")
      .body(buildMenuBodyText(player));
    const actions = buildMenuButtonsAndActions(form, player, isAdministrator);

    const { canceled, selection } = await form.show(player);
    if (canceled) return;

    if (selection < actions.length) {
      await actions[selection]();
    } else {
      player.sendMessage(`[x] เลือกเมนูไม่ถูกต้อง!`);
    }
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในเมนู!`);
    console.warn(
      `${TextColorCodes.Error}Error openMainMenuForPlayer: ${error}`,
    );
  } finally {
    userInterfaceLockByPlayer.delete(player.name);
  }
};

function handleBlockEditPreEvent(event) {
  const { player, block } = event;
  const zone = zoneDatabase.findZoneByLocation(block.location);
  if (
    zone &&
    !playerHasAccessToZone(player, zone.ownerName, zoneDatabase.zoneByOwnerName)
  ) {
    event.cancel = true;
  }
}

export { handleBlockEditPreEvent };

function handleEntityInteractPreEvent(event) {
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

export { handleEntityInteractPreEvent };

function handleExplosionPreEvent(event) {
  if (
    event
      .getImpactedBlocks()
      .some((b) => zoneDatabase.findZoneByLocation(b.location))
  ) {
    event.cancel = true;
  }
}
export { handleExplosionPreEvent };

export const ZoneProtection_OnItemUse = ({ source }) => {
  openMainMenuForPlayer(source);
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
}

system.run(() => zoneDatabase.loadAllZonesFromStorage());
