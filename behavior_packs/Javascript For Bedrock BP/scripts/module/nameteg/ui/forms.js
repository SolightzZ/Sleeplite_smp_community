import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";
import { world } from "@minecraft/server";
import { ITEM, PREDEFINED_RANKS } from "../constants/index.js";
import { isValidPlayer } from "../utils/player.js";
import {
  addRank,
  getActiveRank,
  getAllServerRanks,
  getOwnedRanks,
  removeRanks,
  renameRank,
  setActiveRank,
} from "../core/tagManager.js";
import { refreshNameTag } from "../core/nametag.js";

const getPredefinedRankList = () => {
  const entries = Object.entries(PREDEFINED_RANKS);
  return entries.map(([key, icon]) => ({
    key,
    label: `${icon} ${key}`,
    full: icon,
  }));
};

export const showMenuAdd = (admin, target) => {
  if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

  const predefined = getPredefinedRankList();
  const predefinedLabels = predefined.map((p) => p.label);
  const existingRanks = getAllServerRanks();
  const existingList = existingRanks.length ? existingRanks : ["(ไม่มี)"];

  const form = new ModalFormData()
    .title("เพิ่ม / เปลี่ยนยศ")
    .dropdown("เลือกยศสำเร็จรูป:", ["-- ไม่เลือก --", ...predefinedLabels])
    .textField("หรือตั้งชื่อยศใหม่:", "เช่น [Admin]")
    .dropdown("หรือเลือกจากที่มีอยู่:", existingList);

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const predefinedIndex = Number(res.formValues[0] ?? 0);
    const input = String(res.formValues[1] ?? "").trim();
    const existingIndex = Number(res.formValues[2] ?? 0);

    let rank = "";
    if (predefinedIndex > 0) {
      rank = predefined[predefinedIndex - 1].full;
    } else if (input) {
      rank = input;
    } else if (existingList[existingIndex] !== "(ไม่มี)") {
      rank = existingList[existingIndex];
    }

    if (rank) {
      addRank(target, rank);
      refreshNameTag(target);
      admin.sendMessage(`§a[RANK] ตั้งยศ '${rank}' เรียบร้อย`);
    }
  });
};

export const showMenuEdit = (admin, target) => {
  if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

  const owned = getOwnedRanks(target);
  if (!owned.length) {
    return admin.sendMessage("§c[RANK] ไม่มียศ");
  }

  const activeRank = getActiveRank(target);
  const defaultIndex = activeRank ? owned.indexOf(activeRank) : 0;

  const form = new ModalFormData()
    .title("แก้ไขชื่อยศ")
    .dropdown("เลือกยศ:", owned, { defaultValue: Math.max(0, defaultIndex) });

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const oldName = owned[Number(res.formValues[0])];

    new ModalFormData()
      .title("เปลี่ยนชื่อยศ")
      .textField("ชื่อใหม่", oldName, { defaultValue: oldName })
      .show(admin)
      .then((r) => {
        if (r.canceled) return;

        const newName = String(r.formValues[0] ?? "").trim();
        if (newName && newName !== oldName) {
          renameRank(target, oldName, newName);
        } else {
          setActiveRank(target, oldName);
        }
        refreshNameTag(target);
      });
  });
};

const showConfirmDelete = (admin, target, ranks) => {
  new MessageFormData()
    .title("ยืนยันลบยศ")
    .body(`ยศที่จะลบ:\n${ranks.join("\n")}`)
    .button1("§cลบ")
    .button2("§aยกเลิก")
    .show(admin)
    .then((res) => {
      if (res.selection === 0) {
        removeRanks(target, ranks);
        refreshNameTag(target);
      }
    });
};

export const showMenuRemove = (admin, target) => {
  if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

  const owned = getOwnedRanks(target);
  if (!owned.length) return;

  const form = new ModalFormData().title("ลบยศ");
  for (let i = 0; i < owned.length; i++) {
    form.toggle(owned[i], { defaultValue: false });
  }

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const toDelete = [];
    for (let i = 0; i < owned.length; i++) {
      if (res.formValues[i]) toDelete.push(owned[i]);
    }

    if (toDelete.length) {
      showConfirmDelete(admin, target, toDelete);
    }
  });
};

const showActions = (admin, target) => {
  if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

  const current = getActiveRank(target) || "(ไม่มี)";
  const count = getOwnedRanks(target).length;

  new ActionFormData()
    .title(`จัดการ: ${target.name}`)
    .body(`ยศที่ใช้อยู่: ${current}\nจำนวนยศที่มี: ${count}`)
    .button("§aเพิ่ม / เปลี่ยนยศ")
    .button("§eแก้ไขชื่อยศ")
    .button("§cลบยศ")
    .show(admin)
    .then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) showMenuAdd(admin, target);
      else if (res.selection === 1) showMenuEdit(admin, target);
      else if (res.selection === 2) showMenuRemove(admin, target);
    });
};

export const showMainMenu = (admin) => {
  if (!isValidPlayer(admin)) return;

  const players = world.getPlayers();
  const form = new ActionFormData()
    .title("§lระบบจัดการยศ")
    .body("§7เลือกผู้เล่นที่ต้องการจัดการ:");

  for (let i = 0; i < players.length; i++) {
    form.button(players[i].nameTag);
  }

  form.show(admin).then((res) => {
    if (res.canceled) return;
    const target = players[res.selection];
    if (target?.isValid) showActions(admin, target);
  });
};

export const isRankItem = (itemType) => itemType === ITEM;
