import { ActionFormData } from "@minecraft/server-ui";
import {
  Configuration,
  HalfZone,
  TextColorCodes,
} from "../config.js";
import { zoneDatabase } from "../core/database.js";
import {
  administratorDeleteAnyZone,
  administratorTeleportToZone,
  createZoneForPlayer,
  deleteZoneOfPlayer,
  manageZoneFriends,
  showZoneBorderForPlayer,
} from "../core/protection.js";

export const userInterfaceLockByPlayer = new Set();

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
      pushAction(actions, () => createZoneForPlayer(player));
    }
    if (isAdministrator) {
      form.button("ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      form.button(
        "เทเลพอร์ต (แอดมิน)",
        "textures/ui/sidebar_icons/my_characters",
      );
      pushAction(actions, () => administratorDeleteAnyZone(player));
      pushAction(actions, () => administratorTeleportToZone(player));
    }
  } else {
    form.button("จัดการเพื่อน", "textures/ui/sidebar_icons/wish_list");
    form.button("แสดงขอบเขต", "textures/ui/sidebar_icons/classic_skins");
    form.button("ลบโซน", "textures/ui/sidebar_icons/squaredonut");
    pushAction(actions, () => manageZoneFriends(player));
    pushAction(actions, () => showZoneBorderForPlayer(player));
    pushAction(actions, () => deleteZoneOfPlayer(player));

    if (isAdministrator) {
      form.button("ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      form.button(
        "เทเลพอร์ต (แอดมิน)",
        "textures/ui/sidebar_icons/my_characters",
      );
      pushAction(actions, () => administratorDeleteAnyZone(player));
      pushAction(actions, () => administratorTeleportToZone(player));
    }
  }
  return actions;
};

export const openMainMenuForPlayer = async (player) => {
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
