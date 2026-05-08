import { world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";

const CONFIG = {
  ITEM: "minecraft:command_block",
  PREFIX_RANK: "rank:",
  PREFIX_ACTIVE: "active:",
  DEFAULT_RANK: "",
};

const RANK_LEN = CONFIG.PREFIX_RANK.length;
const ACTIVE_LEN = CONFIG.PREFIX_ACTIVE.length;

const isValidPlayer = (player) =>
  player?.typeId === "minecraft:player" && player.isValid;

const getOwnedRanks = (player, tags = player.getTags()) => {
  const out = [];
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_RANK)) out.push(tags[i].slice(RANK_LEN));
  }
  return out;
};

const getActiveRank = (player, tags = player.getTags()) => {
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE)) return tags[i].slice(ACTIVE_LEN);
  }
  return null;
};

const getAllServerRanks = () => {
  const ranks = new Set();
  const players = world.getPlayers();
  for (let i = 0; i < players.length; i++) {
    const tags = players[i].getTags();
    for (let j = 0; j < tags.length; j++) {
      if (tags[j].startsWith(CONFIG.PREFIX_RANK)) ranks.add(tags[j].slice(RANK_LEN));
    }
  }
  const arr = [];
  for (const r of ranks) arr.push(r);
  return arr.sort();
};

const refreshNameTag = (player) => {
  if (!isValidPlayer(player)) return;
  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  const owned = getOwnedRanks(player, tags);
  const display = active || (owned.length === 0 ? CONFIG.DEFAULT_RANK : "");
  player.nameTag = display ? `${display} ${player.name}` : player.name;
};

const setActiveRank = (player, rankName) => {
  const tags = player.getTags();
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE)) player.removeTag(tags[i]);
  }
  if (rankName) player.addTag(CONFIG.PREFIX_ACTIVE + rankName);
  refreshNameTag(player);
};

const addRank = (player, rankName) => {
  if (!rankName) return;
  const tags = player.getTags();
  const full = CONFIG.PREFIX_RANK + rankName;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === full) return;
  }
  player.addTag(full);
  setActiveRank(player, rankName);
};

const renameRank = (player, oldName, newName) => {
  if (!oldName || !newName || oldName === newName) return;
  const tags = player.getTags();
  player.removeTag(CONFIG.PREFIX_RANK + oldName);
  player.addTag(CONFIG.PREFIX_RANK + newName);
  if (getActiveRank(player, tags) === oldName) setActiveRank(player, newName);
};

const removeRanks = (player, ranks) => {
  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  let removedActive = false;

  for (let i = 0; i < ranks.length; i++) {
    player.removeTag(CONFIG.PREFIX_RANK + ranks[i]);
    if (ranks[i] === active) removedActive = true;
  }

  if (removedActive) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE)) player.removeTag(tags[i]);
    }
    refreshNameTag(player);
  }
};

const menuAdd = (admin, target) => {
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
};

const menuEdit = (admin, target) => {
  const owned = getOwnedRanks(target);
  if (!owned.length) return admin.sendMessage("§c[RANK] ไม่มียศ");

  const form = new ModalFormData().title("แก้ไขชื่อยศ").dropdown("เลือกยศ:", owned);

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
        if (newName && newName !== oldName) renameRank(target, oldName, newName);
      });
  });
};

const confirmDelete = (admin, target, ranks) => {
  new MessageFormData()
    .title("ยืนยัน")
    .body(ranks.join("\n"))
    .button1("ลบ")
    .button2("ยกเลิก")
    .show(admin)
    .then((res) => {
      if (res.selection === 0) removeRanks(target, ranks);
    });
};

const menuRemove = (admin, target) => {
  const owned = getOwnedRanks(target);
  if (!owned.length) return;

  const form = new ModalFormData().title("ลบยศ");
  for (let i = 0; i < owned.length; i++) form.toggle(owned[i], { defaultValue: false });

  form.show(admin).then((res) => {
    if (res.canceled) return;
    const del = [];
    for (let i = 0; i < owned.length; i++) {
      if (res.formValues[i]) del.push(owned[i]);
    }
    if (del.length) confirmDelete(admin, target, del);
  });
};

const showActions = (admin, target) => {
  const tags = target.getTags();
  const current = getActiveRank(target, tags) || "(ไม่มี)";
  const count = getOwnedRanks(target, tags).length;

  new ActionFormData()
    .title(`จัดการ: ${target.name}`)
    .body(`ยศที่ใช้อยู่: ${current}\nจำนวนยศที่มี: ${count}`)
    .button("เพิ่ม / เปลี่ยนยศ")
    .button("แก้ไขชื่อยศ")
    .button("ลบยศ")
    .show(admin)
    .then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) menuAdd(admin, target);
      else if (res.selection === 1) menuEdit(admin, target);
      else if (res.selection === 2) menuRemove(admin, target);
    });
};

const showMainMenu = (admin) => {
  const players = world.getPlayers();
  const form = new ActionFormData()
    .title("ระบบจัดการยศ")
    .body("เลือกผู้เล่นที่ต้องการจัดการ:");

  for (let i = 0; i < players.length; i++) form.button(players[i].nameTag);

  form.show(admin).then((res) => {
    if (res.canceled) return;
    const target = players[res.selection];
    if (target?.isValid) showActions(admin, target);
  });
};

export const playerJoinNameTag = (event) => {
  const player = event.player;
  if (isValidPlayer(player)) refreshNameTag(player);
};

export const chatrankssitemUse = ({ source }) => {
  if (source?.isValid) showMainMenu(source);
};
