import { Player, system, world } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";
import { ADMIN_TAG, CONFIG, OPEN_ITEM_TYPE } from "./config.js";
import {
  addRank,
  getActiveRank,
  getAllServerRanks,
  getOwnedRanks,
  refreshAdvancedNameTag,
  removeRanks,
  renameRank,
} from "./rank.js";
import { addScore } from "./scoreboard.js";
import { GT_CONFIG, Storage } from "./storage.js";
import { isValidPlayer } from "./utils.js";

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
    new ModalFormData()
      .title("เปลี่ยนชื่อยศ")
      .textField("ชื่อใหม่", oldName, { defaultValue: oldName })
      .show(admin)
      .then((r) => {
        if (r.canceled) return;
        const newName = String(r.formValues[0] ?? "").trim();
        if (newName && newName !== oldName)
          renameRank(target, oldName, newName);
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
  for (let i = 0; i < owned.length; i++)
    form.toggle(owned[i], { defaultValue: false });

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
  if (isValidPlayer(event.player)) refreshAdvancedNameTag(event.player);
};

export const chatrankssitemUse = (event) => {
  if (event.source?.isValid) showMainMenu(event.source);
};

export const gamertagItemUse = (event) => {
  if (
    event.source instanceof Player &&
    event.itemStack?.typeId === OPEN_ITEM_TYPE &&
    event.source.getTags().includes(ADMIN_TAG)
  ) {
    openGamertagAdminMenu(event.source);
  }
};

function openGamertagAdminMenu(player) {
  new ActionFormData()
    .title("Gamertag Utilities")
    .body("Admin Settings")
    .button("Gamertag Stats")
    .button("Scoreboard Objectives")
    .button("Close")
    .show(player)
    .then((response) => {
      if (!response || response.canceled) return;
      if (response.selection === 0) openStatsMenu(player);
      if (response.selection === 1) openObjectiveMenu(player);
    });
}

function openStatsMenu(player) {
  const stats = Object.keys(GT_CONFIG.enabledStats);
  const form = new ActionFormData().title("Gamertag Stats");
  for (let i = 0; i < stats.length; i++) {
    const status = GT_CONFIG.enabledStats[stats[i]] ? "ON" : "OFF";
    form.button(`${stats[i].toUpperCase()}: ${status}`);
  }
  form.button("Back");
  form.show(player).then((response) => {
    if (!response || response.canceled) return;
    if (response.selection === stats.length)
      return openGamertagAdminMenu(player);
    const selectedStat = stats[response.selection];
    GT_CONFIG.enabledStats[selectedStat] =
      !GT_CONFIG.enabledStats[selectedStat];
    Storage.save(GT_CONFIG);
    openStatsMenu(player);
  });
}

function openObjectiveMenu(player) {
  const objectives = Object.keys(GT_CONFIG.scoreboardObjectives);
  const form = new ActionFormData()
    .title("Scoreboard Objectives")
    .body("Edit scoreboard objective names");
  for (let i = 0; i < objectives.length; i++) {
    const value = GT_CONFIG.scoreboardObjectives[objectives[i]];
    form.button(`${objectives[i].toUpperCase()} -> ${value}`);
  }
  form.button("Back");
  form.show(player).then((response) => {
    if (!response || response.canceled) return;
    if (response.selection === objectives.length)
      return openGamertagAdminMenu(player);
    openObjectiveEditor(player, objectives[response.selection]);
  });
}

async function openObjectiveEditor(player, objectiveKey) {
  const currentValue = String(
    GT_CONFIG.scoreboardObjectives[objectiveKey] ?? "",
  );
  const form = new ModalFormData()
    .title(`Edit Objective: ${objectiveKey}`)
    .textField("Scoreboard objective name", "kills|deaths|health", {
      defaultValue: currentValue,
    });
  const response = await form.show(player);
  if (!response || response.canceled) return;
  const newValue = String(response.formValues?.[0] ?? "").trim();
  if (!newValue) {
    player.sendMessage("§cObjective name cannot be empty.");
    return;
  }
  GT_CONFIG.scoreboardObjectives[objectiveKey] = newValue;
  Storage.save(GT_CONFIG);
  player.sendMessage(
    `§a${objectiveKey.toUpperCase()} objective is now §f"${newValue}"`,
  );
}

export function initNametagSystem() {
  const saved = Storage.load();
  if (saved && typeof saved === "object") Object.assign(GT_CONFIG, saved);
  Storage.save(GT_CONFIG);

  world.afterEvents.playerSpawn.subscribe(playerJoinNameTag);

  world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack?.typeId === CONFIG.ITEM) chatrankssitemUse(event);
    gamertagItemUse(event);
  });

  world.afterEvents.entityDie.subscribe((event) => {
    const killer = event.damageSource?.damagingEntity;
    if (killer instanceof Player)
      addScore(killer, GT_CONFIG.scoreboardObjectives.kills, 1);
  });

  system.runInterval(() => {
    if (!GT_CONFIG.enabled) return;
    const players = world.getPlayers();
    for (let i = 0; i < players.length; i++) {
      try {
        refreshAdvancedNameTag(players[i]);
      } catch {}
    }
  }, 5);
}
