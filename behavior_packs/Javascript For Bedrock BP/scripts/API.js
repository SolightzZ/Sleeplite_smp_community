// API.js
import { system, world } from "@minecraft/server";
import {
  http,
  HttpRequest,
  HttpRequestMethod,
  HttpHeader,
} from "@minecraft/server-net";

// HELPER FUNCTIONS
function getPlayerInventory(player) {
  const inventory = player.getComponent("minecraft:inventory");
  return inventory?.container;
}

function getPlayerEquipment(player) {
  return player.getComponent("minecraft:equippable");
}

function getItemComponent(entity) {
  return entity.getComponent("minecraft:item");
}

function getHealthComponent(entity) {
  return entity.getComponent("minecraft:health");
}

function addItemToPlayer(player, itemStack) {
  const inventory = getPlayerInventory(player);
  if (inventory) {
    return inventory.addItem(itemStack);
  }
  return itemStack.amount;
}

function transferItemFromPlayer(fromPlayer, slotIndex, toContainer) {
  const fromInventory = getPlayerInventory(fromPlayer);
  if (fromInventory) {
    fromInventory.transferItem(slotIndex, toContainer);
    return true;
  }
  return false;
}

function setPlayerEquipment(player, slot, itemStack) {
  const equipment = getPlayerEquipment(player);
  if (equipment) {
    equipment.setEquipment(slot, itemStack);
    return true;
  }
  return false;
}

function getPlayerEquippedItem(player, slot) {
  const equipment = getPlayerEquipment(player);
  return equipment?.getEquipment(slot);
}

function healEntityToFull(entity) {
  const health = getHealthComponent(entity);
  health?.resetToMaxValue();
}

function getEntityHealth(entity) {
  const health = getHealthComponent(entity);
  return health?.currentValue ?? 0;
}

function isItemType(entity, itemTypeId) {
  if (entity.typeId !== "minecraft:item") return false;
  const itemComp = getItemComponent(entity);
  return itemComp?.itemStack.typeId === itemTypeId;
}

// GET PLAYER DATA
function getPlayerData(player) {
  if (!player?.isValid) return null;

  const health = player.getComponent("minecraft:health");
  const xp = player.getComponent("minecraft:experience");
  const food = player.getComponent("minecraft:food");
  const inventory = player.getComponent("minecraft:inventory");

  return {
    // 🧍 BASIC
    name: player.name,
    id: player.id,
    typeId: player.typeId,
    nameTag: player.nameTag,

    // POSITION
    location: player.location,
    dimension: player.dimension.id,
    rotation: player.getRotation(),
    headLocation: player.getHeadLocation(),

    velocity: player.getVelocity ? player.getVelocity() : { x: 0, y: 0, z: 0 },
    viewDirection: player.getViewDirection
      ? player.getViewDirection()
      : { x: 0, y: 0, z: 0 },

    // STATUS
    health: health ? health.currentValue : 0,
    maxHealth: health ? health.effectiveMax : 20,

    // HUNGER
    hunger: food ? food.currentValue : 20,
    saturation: food ? food.defaultValue : 20,

    // XP
    level: player.level ?? 0,
    xpCurrent: player.xpEarnedAtCurrentLevel ?? 0,
    xpToNextLevel: player.totalXpNeededForNextLevel ?? 0,

    // STATE
    isSneaking: player.isSneaking,
    isSprinting: player.isSprinting,
    isJumping: player.isJumping ?? false,
    isOnGround: player.isOnGround,
    isFlying: player.isFlying,
    isGliding: player.isGliding,
    isSwimming: player.isSwimming,
    isClimbing: player.isClimbing ?? false,
    isFalling: player.isFalling ?? false,
    isInWater: player.isInWater ?? false,
    isSleeping: player.isSleeping ?? false,
    isEmoting: player.isEmoting ?? false,

    // SYSTEM
    gamemode: getGamemode(player),
    permission: player.playerPermissionLevel,
    commandPermission: player.commandPermissionLevel,

    // INPUT
    selectedSlot: player.selectedSlotIndex,
    input: player.inputInfo
      ? {
          isMoving: player.inputInfo.isMoving,
          moveMode: player.inputInfo.moveMode,
        }
      : {},

    // TARGET
    target: player.target?.id ?? null,

    // TAGS
    tags: player.getTags(),

    // INVENTORY
    inventory: getInventoryData(inventory),

    // EXTRA
    scoreboard: player.scoreboardIdentity?.id ?? null,
  };
}

// GET INVENTORY DATA

function getInventoryData(inventoryComp) {
  if (!inventoryComp || !inventoryComp.container) {
    return { items: [], size: 0, emptySlots: 0 };
  }

  const container = inventoryComp.container;
  const size = container.size;
  const emptySlots = container.emptySlotsCount;
  const items = [];

  for (let i = 0; i < size; i++) {
    const item = container.getItem(i);
    if (item) {
      items.push({
        slot: i,
        typeId: item.typeId,
        name: item.nameTag ?? null,
        amount: item.amount,
        maxAmount: item.maxAmount,
        durability: item.getComponent("minecraft:durability")?.damage ?? null,
        enchantments: getEnchantments(item),
      });
    }
  }

  return {
    size: size,
    emptySlots: emptySlots,
    usedSlots: items.length,
    items: items,
  };
}

// GET ENCHANTMENTS
function getEnchantments(itemStack) {
  const enchantComp = itemStack.getComponent("minecraft:enchantable");
  if (!enchantComp) return [];

  const enchantments = [];
  try {
    const enchants = enchantComp.getEnchantments();
    for (const enchant of enchants) {
      enchantments.push({
        type: enchant.type.id,
        level: enchant.level,
      });
    }
  } catch (e) {
    console.warn("enchantment error:", e);
  }
  return enchantments;
}

// GAMEMODE
function getGamemode(player) {
  try {
    return player.getGameMode();
  } catch (e) {
    console.warn("gamemode error:", e);
    return "unknown";
  }
}

// SEND API (BATCH)
function sendAllPlayersData() {
  try {
    const players = world.getAllPlayers();

    if (players.length === 0) return;

    const playerDataArray = [];
    for (const player of players) {
      const data = getPlayerData(player);
      if (data) {
        playerDataArray.push(data);
      } else {
        console.warn("No data for player:", player.name);
      }
    }

    if (playerDataArray.length === 0) return;

    const req = new HttpRequest(
      "https://unfitting-discount-lantern.ngrok-free.dev/player/update",
    );
    req.method = HttpRequestMethod.Post;
    req.headers = [new HttpHeader("Content-Type", "application/json")];
    req.body = JSON.stringify(playerDataArray);

    http
      .request(req)
      .then((res) => {
        if (res.status === 200) {
          console.log(`HTTP ${res.status}`);
        } else {
          console.warn(`HTTP ${res.status}`);
        }
      })
      .catch((e) => {
        console.warn("HTTP ERROR:", e);
      });
  } catch (e) {
    console.warn("[CRITICAL ERROR]:", e);
  }
}

// LOOP
system.runInterval(() => {
  sendAllPlayersData();
}, 40);
