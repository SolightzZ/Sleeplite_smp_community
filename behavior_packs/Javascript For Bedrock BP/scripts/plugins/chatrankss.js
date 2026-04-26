import { world, system } from "@minecraft/server";
import {
  ModalFormData,
  ActionFormData,
  MessageFormData,
} from "@minecraft/server-ui";

const CONFIG = {
  ITEM: "minecraft:command_block",
  PREFIX_RANK: "rank:",
  PREFIX_ACTIVE: "active:",
  DEFAULT_RANK: "",
};

// RankSystem functions
function isValidPlayer(player) {
  return player && player.isValid && player.typeId === "minecraft:player";
}

function getOwnedRanks(player, tags = player.getTags()) {
  return tags
    .filter((t) => t.startsWith(CONFIG.PREFIX_RANK))
    .map((t) => t.slice(CONFIG.PREFIX_RANK.length));
}

function getActiveRank(player, tags = player.getTags()) {
  const tag = tags.find((t) => t.startsWith(CONFIG.PREFIX_ACTIVE));
  return tag ? tag.slice(CONFIG.PREFIX_ACTIVE.length) : null;
}

function getAllServerRanks() {
  const ranks = new Set();
  for (const p of world.getAllPlayers()) {
    for (const tag of p.getTags()) {
      if (tag.startsWith(CONFIG.PREFIX_RANK)) {
        ranks.add(tag.slice(CONFIG.PREFIX_RANK.length));
      }
    }
  }
  return [...ranks].sort();
}

function refreshNameTag(player) {
  if (!isValidPlayer(player)) return;

  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  const owned = getOwnedRanks(player, tags);

  const display = active || (owned.length === 0 ? CONFIG.DEFAULT_RANK : "");
  player.nameTag = display ? `${display} ${player.name}` : player.name;
}

function setActiveRank(player, rankName) {
  const tags = player.getTags();

  for (const tag of tags) {
    if (tag.startsWith(CONFIG.PREFIX_ACTIVE)) {
      player.removeTag(tag);
    }
  }

  if (rankName) player.addTag(CONFIG.PREFIX_ACTIVE + rankName);
  refreshNameTag(player);
}

function addRank(player, rankName) {
  if (!rankName) return;

  const tags = player.getTags();
  const full = CONFIG.PREFIX_RANK + rankName;
  if (tags.includes(full)) return;

  player.addTag(full);
  setActiveRank(player, rankName);
}

function renameRank(player, oldName, newName) {
  if (!oldName || !newName || oldName === newName) return;

  const tags = player.getTags();
  player.removeTag(CONFIG.PREFIX_RANK + oldName);
  player.addTag(CONFIG.PREFIX_RANK + newName);

  if (getActiveRank(player, tags) === oldName) {
    setActiveRank(player, newName);
  }
}

function removeRanks(player, ranks) {
  const tags = player.getTags();
  const active = getActiveRank(player, tags);

  let removedActive = false;
  for (const r of ranks) {
    player.removeTag(CONFIG.PREFIX_RANK + r);
    if (r === active) removedActive = true;
  }

  if (removedActive) {
    for (const t of tags) {
      if (t.startsWith(CONFIG.PREFIX_ACTIVE)) {
        player.removeTag(t);
      }
    }
    refreshNameTag(player);
  }
}

// RankGUI functions
function showMainMenu(admin) {
  const players = world.getAllPlayers();
  const form = new ActionFormData()
    .title("ระบบจัดการยศ")
    .body("เลือกผู้เล่นที่ต้องการจัดการ:");

  for (const p of players) form.button(p.nameTag);

  form.show(admin).then((res) => {
    if (!res.canceled) {
      const target = players[res.selection];
      if (target) showActions(admin, target);
    }
  });
}

function showActions(admin, target) {
  const tags = target.getTags();
  const current = getActiveRank(target, tags) || "(ไม่มี)";
  const count = getOwnedRanks(target, tags).length;

  const form = new ActionFormData()
    .title(`จัดการ: ${target.name}`)
    .body(`ยศที่ใช้อยู่: ${current}\nจำนวนยศที่มี: ${count}`)
    .button("เพิ่ม / เปลี่ยนยศ")
    .button("แก้ไขชื่อยศ")
    .button("ลบยศ");

  form.show(admin).then((res) => {
    if (res.canceled) return;
    if (res.selection === 0) menuAdd(admin, target);
    if (res.selection === 1) menuEdit(admin, target);
    if (res.selection === 2) menuRemove(admin, target);
  });
}

function menuAdd(admin, target) {
  const ranks = getAllServerRanks();
  const list = ranks.length ? ranks : ["(ไม่มี)"];

  const form = new ModalFormData()
    .title("เพิ่ม / เปลี่ยนยศ")
    .textField("ตั้งชื่อยศใหม่:", "เช่น [Admin]")
    .dropdown("หรือเลือกจากที่มีอยู่:", list);

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const input = String(res.formValues[0] ?? "").trim();
    const index = Number(res.formValues[1] ?? 0);
    const rank = input || list[index];

    if (rank && rank !== "(ไม่มี)") {
      addRank(target, rank);
      admin.sendMessage(`§a[RANK] ตั้งยศ '${rank}' เรียบร้อย`);
    }
  });
}

function menuEdit(admin, target) {
  const owned = getOwnedRanks(target);
  if (!owned.length) return admin.sendMessage("§c[RANK] ไม่มียศ");

  const form = new ModalFormData()
    .title("แก้ไขชื่อยศ")
    .dropdown("เลือกยศ:", owned);

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const oldName = owned[Number(res.formValues[0])];

    const edit = new ModalFormData()
      .title("เปลี่ยนชื่อยศ")
      .textField("ชื่อใหม่", oldName, { defaultValue: oldName });

    edit.show(admin).then((r) => {
      if (r.canceled) return;

      const newName = String(r.formValues[0] ?? "").trim();
      if (newName && newName !== oldName) {
        renameRank(target, oldName, newName);
      }
    });
  });
}

function menuRemove(admin, target) {
  const owned = getOwnedRanks(target);
  if (!owned.length) return;

  const form = new ModalFormData().title("ลบยศ");
  owned.forEach((r) => form.toggle(r, { defaultValue: false }));

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const del = owned.filter((_, i) => res.formValues[i]);
    if (del.length) confirmDelete(admin, target, del);
  });
}

function confirmDelete(admin, target, ranks) {
  const form = new MessageFormData()
    .title("ยืนยัน")
    .body(ranks.join("\n"))
    .button1("ลบ")
    .button2("ยกเลิก");

  form.show(admin).then((res) => {
    if (res.selection === 0) {
      removeRanks(target, ranks);
    }
  });
}

world.afterEvents.playerJoin.subscribe((e) => {
  const p = world.getEntity(e.playerId);
  if (isValidPlayer(p)) {
    refreshNameTag(p);
  }
});

export function chatrankssitemUse({ source }) {
  showMainMenu(source);
}

console.warn("Chat Rank loaded successfully");
