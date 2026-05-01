import { world } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";

const CONFIG = {
  ITEM: "minecraft:command_block",
  PREFIX_RANK: "rank:",
  PREFIX_ACTIVE: "active:",
  DEFAULT_RANK: "",
};

// RankSystem functions
const isValidPlayer = (player) =>
  player?.typeId === "minecraft:player" && player.isValid;

const getOwnedRanks = (player, tags = player.getTags()) =>
  tags.reduce((acc, t) => {
    if (t.startsWith(CONFIG.PREFIX_RANK))
      acc.push(t.slice(CONFIG.PREFIX_RANK.length));
    return acc;
  }, []);

const getActiveRank = (player, tags = player.getTags()) =>
  tags
    .find((t) => t.startsWith(CONFIG.PREFIX_ACTIVE))
    ?.slice(CONFIG.PREFIX_ACTIVE.length) ?? null;

const getAllServerRanks = () => {
  const ranks = new Set();
  for (const p of world.getAllPlayers()) {
    for (const tag of p.getTags()) {
      if (tag.startsWith(CONFIG.PREFIX_RANK)) {
        ranks.add(tag.slice(CONFIG.PREFIX_RANK.length));
      }
    }
  }
  return [...ranks].sort();
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

  for (const tag of tags) {
    if (tag.startsWith(CONFIG.PREFIX_ACTIVE)) {
      player.removeTag(tag);
    }
  }

  if (rankName) player.addTag(CONFIG.PREFIX_ACTIVE + rankName);
  refreshNameTag(player);
};

const addRank = (player, rankName) => {
  if (!rankName) return;

  const tags = player.getTags();
  const full = CONFIG.PREFIX_RANK + rankName;
  if (tags.includes(full)) return;

  player.addTag(full);
  setActiveRank(player, rankName);
};

const renameRank = (player, oldName, newName) => {
  if (!oldName || !newName || oldName === newName) return;

  const tags = player.getTags();
  player.removeTag(CONFIG.PREFIX_RANK + oldName);
  player.addTag(CONFIG.PREFIX_RANK + newName);

  if (getActiveRank(player, tags) === oldName) {
    setActiveRank(player, newName);
  }
};

const removeRanks = (player, ranks) => {
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
};

// RankGUI functions

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
};

const confirmDelete = (admin, target, ranks) => {
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
};

const menuRemove = (admin, target) => {
  const owned = getOwnedRanks(target);
  if (!owned.length) return;

  const form = new ModalFormData().title("ลบยศ");
  owned.forEach((r) => form.toggle(r, { defaultValue: false }));

  form.show(admin).then((res) => {
    if (res.canceled) return;

    const del = owned.filter((_, i) => res.formValues[i]);
    if (del.length) confirmDelete(admin, target, del);
  });
};

const showActions = (admin, target) => {
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
};

const showMainMenu = (admin) => {
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
};

function playerJoinNameTag(event) {
  const player = world.getEntity(event.playerId);
  if (isValidPlayer(player)) {
    refreshNameTag(player);
  }
}

export { playerJoinNameTag };

export const chatrankssitemUse = ({ source }) => {
  showMainMenu(source);
};
