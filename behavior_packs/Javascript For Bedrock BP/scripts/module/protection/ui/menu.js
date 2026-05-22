import { ActionFormData } from "@minecraft/server-ui";
import { Colors, Config, HalfZoneSize } from "../config.js";
import { zoneDatabase } from "../core/database.js";
import { adminDeleteZone, adminTeleport, createZone, deleteZone, manageFriends, showBorder, uiLocks } from "../core/protection.js";

export const MenuLocks = new Set();

const buildBody = (player) => {
  const zones = zoneDatabase.zones;
  const zone = zones[player.name];

  let friendOwner = null;
  let friendZone = null;
  const owners = Object.keys(zones);
  const ownersLen = owners.length;

  for (let i = 0; i < ownersLen; i++) {
    const o = owners[i];
    const z = zones[o];
    const friends = z.friends;
    const friendsLen = friends.length;

    for (let j = 0; j < friendsLen; j++) {
      if (friends[j] === player.name) {
        friendOwner = o;
        friendZone = z;
        break;
      }
    }

    if (friendOwner) break;
  }

  const lines = [`§7โซน: ${ownersLen}/${Config.MaxZones}`];

  if (zone || friendZone) {
    const owner = zone ? player.name : friendOwner;
    const z = zone || friendZone;
    const h = HalfZoneSize;

    const center = {
      x: z.start.x + h,
      y: z.start.y + h,
      z: z.start.z + h,
    };

    const friendStr = z.friends.length ? z.friends.join(", ") : "ไม่มี";
    lines.push(`เจ้าของ: ${owner}`, `เพื่อน: ${friendStr}`, `ศูนย์กลาง: (${center.x}, ${center.y}, ${center.z})`);
  } else {
    lines.push("");
  }

  return lines.join("\n");
};

const addBtn = (form, text, icon) => form.button(text, icon);

const buildButtons = (form, player, isAdmin) => {
  const hasZone = zoneDatabase.zones[player.name];
  const actions = [];
  const zoneCount = Object.keys(zoneDatabase.zones).length;

  if (!hasZone) {
    if (zoneCount < Config.MaxZones) {
      addBtn(form, "สร้างโซน", "textures/ui/sidebar_icons/addon");
      actions.push(() => createZone(player));
    }

    if (isAdmin) {
      addBtn(form, "ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      addBtn(form, "เทเลพอร์ต (แอดมิน)", "textures/ui/sidebar_icons/my_characters");
      actions.push(() => adminDeleteZone(player));
      actions.push(() => adminTeleport(player));
    }
  } else {
    addBtn(form, "จัดการเพื่อน", "textures/ui/sidebar_icons/wish_list");
    addBtn(form, "แสดงขอบเขต", "textures/ui/sidebar_icons/classic_skins");
    addBtn(form, "ลบโซน", "textures/ui/sidebar_icons/squaredonut");
    actions.push(() => manageFriends(player));
    actions.push(() => showBorder(player));
    actions.push(() => deleteZone(player));

    if (isAdmin) {
      addBtn(form, "ลบโซน (แอดมิน)", "textures/ui/sidebar_icons/promotag");
      addBtn(form, "เทเลพอร์ต (แอดมิน)", "textures/ui/sidebar_icons/my_characters");
      actions.push(() => adminDeleteZone(player));
      actions.push(() => adminTeleport(player));
    }
  }
  return actions;
};

export const openMenu = async (player) => {
  if (MenuLocks.has(player.name) || uiLocks.has(player.name)) return player.sendMessage(`[x] รอสักครู่!`);

  MenuLocks.add(player.name);
  uiLocks.add(player.name);

  try {
    const isAdmin = player.hasTag(Config.AdminTag);
    const form = new ActionFormData().title("โซนป้องกัน").body(buildBody(player));
    const actions = buildButtons(form, player, isAdmin);

    const res = await form.show(player);
    if (res.canceled) return;
    if (!player.isValid) return;

    if (res.selection < actions.length) {
      await actions[res.selection]();
    } else {
      player.sendMessage(`[x] เลือกไม่ถูกต้อง!`);
    }
  } catch (e) {
    player.sendMessage(`[x] เมนูผิดพลาด!`);
    console.warn(`[ Protection ] openMenu: ${e}`);
  } finally {
    MenuLocks.delete(player.name);
    uiLocks.delete(player.name);
  }
};
