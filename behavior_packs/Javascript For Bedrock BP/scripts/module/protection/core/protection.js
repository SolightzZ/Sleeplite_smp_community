import { system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import {
  Configuration,
  HalfZone,
  TextColorCodes,
  UserMessages,
} from "../config.js";
import {
  buildBorderPoints,
  buildNewZoneFromCenter,
  consumeRequiredBlockFromInventory,
  isFormOk,
  isNewZoneOverlappingAny,
  validateZoneCreation,
} from "../utils/validation.js";
import { zoneDatabase } from "./database.js";

const activeBorderByPlayerName = new Map();
let particleIntervalHandle = null;

const startParticleLoopIfNeeded = () => {
  if (particleIntervalHandle !== null) return;
  particleIntervalHandle = system.runInterval(renderAllBordersOnce, 40);
};

const stopParticleLoopIfIdle = () => {
  if (activeBorderByPlayerName.size === 0 && particleIntervalHandle !== null) {
    system.clearRun(particleIntervalHandle);
    particleIntervalHandle = null;
  }
};

const forceStopParticleLoop = () => {
  if (particleIntervalHandle !== null) {
    system.clearRun(particleIntervalHandle);
    particleIntervalHandle = null;
  }
};

const renderAllBordersOnce = () => {
  try {
    stopParticleLoopIfIdle();
    if (activeBorderByPlayerName.size === 0) return;

    const allPlayers = world.getPlayers();
    const playerLookup = new Map();
    for (let i = 0; i < allPlayers.length; i++) {
      playerLookup.set(allPlayers[i].name, allPlayers[i]);
    }

    const removeList = [];
    const entries = Array.from(activeBorderByPlayerName.entries());
    const entriesLen = entries.length;

    for (let i = 0; i < entriesLen; i++) {
      const [playerName, state] = entries[i];
      try {
        const currentPlayer = playerLookup.get(playerName);
        if (
          !currentPlayer ||
          state.elapsed >= Configuration.BorderDisplayDurationTicks
        ) {
          removeList.push(playerName);
          continue;
        }

        const pts = state.borderPoints;
        const ptsLen = pts.length;
        for (let j = 0; j < ptsLen; j++) {
          state.dimension.spawnParticle(Configuration.ParticleTypeId, pts[j]);
        }
        state.elapsed += 1;
      } catch (eachError) {
        console.warn(
          `${TextColorCodes.Error}Error rendering overload border for ${playerName}: ${eachError}`,
        );
        removeList.push(playerName);
      }
    }

    const removeLen = removeList.length;
    for (let i = 0; i < removeLen; i++) {
      activeBorderByPlayerName.delete(removeList[i]);
    }
    stopParticleLoopIfIdle();
  } catch (error) {
    console.warn(`${TextColorCodes.Error}Error particle loop: ${error}`);
    forceStopParticleLoop();
    activeBorderByPlayerName.clear();
  }
};

export const showZoneBorderForPlayer = async (player) => {
  try {
    const zone = zoneDatabase.zoneByOwnerName[player.name];
    if (!zone) return player.sendMessage(UserMessages.PlayerHasNoZone);

    const borderPoints = buildBorderPoints(
      zone.start,
      Configuration.ParticleStepDistance,
    );
    activeBorderByPlayerName.set(player.name, {
      zone,
      dimension: player.dimension,
      borderPoints,
      elapsed: 0,
    });
    startParticleLoopIfNeeded();
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการแสดงขอบเขต!`);
    console.warn(
      `${TextColorCodes.Error}Error showZoneBorderForPlayer: ${error}`,
    );
  }
};

export const createZoneForPlayer = async (player) => {
  try {
    const result = validateZoneCreation(player, zoneDatabase.zoneByOwnerName);
    if (!result.isValid) return player.sendMessage(result.reason);

    if (!consumeRequiredBlockFromInventory(player)) {
      return player.sendMessage(UserMessages.NeedRequiredBlock);
    }

    const newZone = buildNewZoneFromCenter(result.baseCenter);
    if (isNewZoneOverlappingAny(newZone, zoneDatabase.zoneByOwnerName)) {
      return player.sendMessage(UserMessages.ZoneOverlap);
    }

    zoneDatabase.zoneByOwnerName[player.name] = newZone;
    zoneDatabase.saveAllZonesToStorage();
    zoneDatabase.locationToZoneCache.clear();

    player.sendMessage(UserMessages.ZoneCreated);
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการสร้างโซน!`);
    console.warn(`${TextColorCodes.Error}Error createZoneForPlayer: ${error}`);
  }
};

export const deleteZoneOfPlayer = async (player) => {
  try {
    if (!zoneDatabase.zoneByOwnerName[player.name]) {
      return player.sendMessage(UserMessages.PlayerHasNoZone);
    }

    const confirm1 = new ActionFormData()
      .title("ยืนยันการลบโซน")
      .body("คุณแน่ใจหรือไม่ว่าจะลบโซน?")
      .button("ตกลง", "textures/ui/check")
      .button("ยกเลิก", "textures/ui/cancel");

    const r1 = await confirm1.show(player);
    if (!isFormOk(player, r1) || r1.selection !== 0) return;

    const confirm2 = new ActionFormData()
      .title("ยืนยันการลบโซนครั้งสุดท้าย")
      .body("กรุณายืนยันอีกครั้งเพื่อลบโซน")
      .button("ตกลง", "textures/ui/check")
      .button("ยกเลิก", "textures/ui/cancel");

    const r2 = await confirm2.show(player);
    if (!isFormOk(player, r2) || r2.selection !== 0) return;

    delete zoneDatabase.zoneByOwnerName[player.name];
    zoneDatabase.saveAllZonesToStorage();
    zoneDatabase.locationToZoneCache.clear();
    activeBorderByPlayerName.delete(player.name);

    if (Object.keys(zoneDatabase.zoneByOwnerName).length === 0)
      stopParticleLoopIfIdle();

    player.sendMessage(UserMessages.ZoneDeleted);
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการลบโซน!`);
    console.warn(`${TextColorCodes.Error}Error deleteZoneOfPlayer: ${error}`);
  }
};

export const manageZoneFriends = async (player) => {
  try {
    const zone = zoneDatabase.zoneByOwnerName[player.name];
    if (!zone) return player.sendMessage(UserMessages.PlayerHasNoZone);

    const otherPlayerNames = world
      .getPlayers()
      .map((p) => p.name)
      .filter((n) => n !== player.name);
    const form = new ModalFormData()
      .title("จัดการเพื่อน")
      .dropdown("การดำเนินการ", ["เพิ่มเพื่อน", "ลบเพื่อน"], {
        defaultValueIndex: 0,
      })
      .dropdown(
        "ผู้เล่น",
        otherPlayerNames.length
          ? otherPlayerNames
          : [UserMessages.NoOnlinePlayers],
        { defaultValueIndex: 0 },
      );

    const response = await form.show(player);
    if (!isFormOk(player, response)) return;

    const [actionIndex, playerIndex] = response.formValues;
    if (
      typeof playerIndex !== "number" ||
      playerIndex < 0 ||
      playerIndex >= otherPlayerNames.length
    ) {
      return player.sendMessage(UserMessages.InvalidForm);
    }

    const targetName = otherPlayerNames[playerIndex];
    if (!targetName) return player.sendMessage(UserMessages.InvalidForm);

    if (actionIndex === 0) {
      if (zone.friends.length >= Configuration.MaximumFriendsPerZone) {
        return player.sendMessage(UserMessages.FriendListFull);
      }
      if (zone.friends.includes(targetName)) {
        return player.sendMessage(UserMessages.FriendAlreadyAdded);
      }
      zone.friends.push(targetName);
      player.sendMessage(UserMessages.FriendAdded(targetName));
    } else {
      if (!zone.friends.includes(targetName)) {
        return player.sendMessage(UserMessages.FriendNotInList);
      }
      zone.friends = zone.friends.filter((f) => f !== targetName);
      player.sendMessage(UserMessages.FriendRemoved(targetName));
    }

    zoneDatabase.saveAllZonesToStorage();
    zoneDatabase.locationToZoneCache.clear();
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการจัดการเพื่อน!`);
    console.warn(`${TextColorCodes.Error}Error manageZoneFriends: ${error}`);
  }
};

export const administratorDeleteAnyZone = async (player) => {
  try {
    if (!player.hasTag(Configuration.AdministratorTag))
      return player.sendMessage(UserMessages.AdministratorOnly);

    const ownerNames = Object.keys(zoneDatabase.zoneByOwnerName);
    if (!ownerNames.length)
      return player.sendMessage(UserMessages.NoZonesInServer);

    const form = new ModalFormData()
      .title("ลบโซน (แอดมิน)")
      .dropdown("เลือกโซนที่จะลบ", ownerNames, { defaultValueIndex: 0 });
    const response = await form.show(player);
    if (!isFormOk(player, response)) return;

    const ownerIndex = response.formValues[0];
    if (
      typeof ownerIndex !== "number" ||
      ownerIndex < 0 ||
      ownerIndex >= ownerNames.length
    ) {
      return player.sendMessage(UserMessages.InvalidZoneSelection);
    }

    const ownerName = ownerNames[ownerIndex];
    if (!zoneDatabase.zoneByOwnerName[ownerName]) {
      return player.sendMessage(UserMessages.ZoneNotFound);
    }

    delete zoneDatabase.zoneByOwnerName[ownerName];
    zoneDatabase.saveAllZonesToStorage();
    zoneDatabase.locationToZoneCache.clear();
    activeBorderByPlayerName.delete(ownerName);

    if (Object.keys(zoneDatabase.zoneByOwnerName).length === 0)
      stopParticleLoopIfIdle();

    player.sendMessage(UserMessages.ZoneDeletedByAdministrator(ownerName));
    const allPlayers = world.getPlayers();
    const allPlayersLen = allPlayers.length;
    for (let i = 0; i < allPlayersLen; i++) {
      if (allPlayers[i].name === ownerName) {
        allPlayers[i].sendMessage(UserMessages.YourZoneDeletedByAdministrator);
        break;
      }
    }
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการลบโซนโดยแอดมิน!`);
    console.warn(
      `${TextColorCodes.Error}Error administratorDeleteAnyZone: ${error}`,
    );
  }
};

export const administratorTeleportToZone = async (player) => {
  try {
    if (!player.hasTag(Configuration.AdministratorTag))
      return player.sendMessage(UserMessages.AdministratorOnly);

    const ownerNames = Object.keys(zoneDatabase.zoneByOwnerName);
    if (!ownerNames.length)
      return player.sendMessage(UserMessages.NoZonesInServer);

    const form = new ModalFormData()
      .title("เทเลพอร์ต (แอดมิน)")
      .dropdown("เลือกโซนที่จะเทเลพอร์ต", ownerNames, { defaultValueIndex: 0 });
    const response = await form.show(player);
    if (!isFormOk(player, response)) return;

    const ownerIndex = response.formValues[0];
    if (
      typeof ownerIndex !== "number" ||
      ownerIndex < 0 ||
      ownerIndex >= ownerNames.length
    ) {
      return player.sendMessage(UserMessages.InvalidZoneSelection);
    }

    const ownerName = ownerNames[ownerIndex];
    const zone = zoneDatabase.zoneByOwnerName[ownerName];
    if (!zone) return player.sendMessage(UserMessages.ZoneNotFound);

    const center = {
      x: zone.start.x + HalfZone,
      y: zone.start.y + HalfZone,
      z: zone.start.z + HalfZone,
    };
    player.teleport(center, { dimension: player.dimension });
    player.sendMessage(UserMessages.TeleportSuccess(ownerName));
  } catch (error) {
    player.sendMessage(`[x] เกิดข้อผิดพลาดในการเทเลพอร์ต!`);
    console.warn(
      `${TextColorCodes.Error}Error administratorTeleportToZone: ${error}`,
    );
  }
};

export const clearVisualStateForPlayer = (playerName) => {
  activeBorderByPlayerName.delete(playerName);
  stopParticleLoopIfIdle();
};
