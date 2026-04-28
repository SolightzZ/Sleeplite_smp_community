import { world, Player, ItemStack } from "@minecraft/server";
import { CONFIG, DEFAULTS, MESSAGES } from "./constants.js";
import { getBalance, setBalance, addBalance, removeBalance, getInterestDate, setInterestDate, initializeInterest } from "./database.js";

export function getThailandDate() {
  const now = new Date();
  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours() + CONFIG.TIMEZONE_OFFSET,
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
}

export function getDateIntValue(date = null) {
  const d = date || getThailandDate();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return parseInt(`${day}${month}${year}`);
}

export function parseDateIntValue(value) {
  const s = value.toString().padStart(8, "0");
  const day = parseInt(s.substring(0, 2));
  const month = parseInt(s.substring(2, 4)) - 1;
  const year = parseInt(s.substring(4, 8));
  return new Date(year, month, day);
}

export function formatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function getDateTime() {
  const d = getThailandDate();
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function countDiamonds(player) {
  try {
    const inv = player.getComponent("inventory").container;
    let total = 0;

    for (let i = 0; i < inv.size; i++) {
      const stack = inv.getItem(i);
      if (stack?.typeId === CONFIG.DIAMOND_ITEM_ID) {
        total += stack.amount;
      }
    }

    return total;
  } catch (e) {
    console.warn("[INV] countDiamonds:", player?.name, e);
    return 0;
  }
}

export function getEmptySlots(player) {
  try {
    const inv = player.getComponent("inventory").container;
    let empty = 0;

    for (let i = 0; i < inv.size; i++) {
      if (!inv.getItem(i)) empty++;
    }

    return empty;
  } catch (e) {
    console.warn("[INV] getEmptySlots:", player?.name, e);
    return 0;
  }
}

export function getInventoryCapacity(player) {
  try {
    const inv = player.getComponent("inventory").container;
    let capacity = 0;

    for (let i = 0; i < inv.size; i++) {
      const stack = inv.getItem(i);
      if (!stack) {
        capacity += CONFIG.MAX_STACK_SIZE;
      } else if (stack.typeId === CONFIG.DIAMOND_ITEM_ID) {
        capacity += CONFIG.MAX_STACK_SIZE - stack.amount;
      }
    }

    return capacity;
  } catch (e) {
    console.warn("[INV] getInventoryCapacity:", player?.name, e);
    return 0;
  }
}

export function removeDiamondsFromInventory(player, amount) {
  const inv = player.getComponent("inventory").container;
  let remaining = amount;

  for (let i = 0; i < inv.size && remaining > 0; i++) {
    const stack = inv.getItem(i);
    if (stack?.typeId === CONFIG.DIAMOND_ITEM_ID) {
      const take = Math.min(stack.amount, remaining);
      remaining -= take;

      const newAmount = stack.amount - take;
      if (newAmount > 0) {
        stack.amount = newAmount;
        inv.setItem(i, stack);
      } else {
        inv.setItem(i, null);
      }
    }
  }

  return remaining;
}

function addDiamondsToInventory(player, amount) {
  const inv = player.getComponent("inventory").container;
  let remaining = amount;

  for (let i = 0; i < inv.size && remaining > 0; i++) {
    const stack = inv.getItem(i);
    if (stack?.typeId === CONFIG.DIAMOND_ITEM_ID && stack.amount < CONFIG.MAX_STACK_SIZE) {
      const give = Math.min(remaining, CONFIG.MAX_STACK_SIZE - stack.amount);
      stack.amount += give;
      inv.setItem(i, stack);
      remaining -= give;
    }
  }

  for (let i = 0; i < inv.size && remaining > 0; i++) {
    if (!inv.getItem(i)) {
      const give = Math.min(remaining, CONFIG.MAX_STACK_SIZE);
      inv.setItem(i, new ItemStack(CONFIG.DIAMOND_ITEM_ID, give));
      remaining -= give;
    }
  }

  return remaining;
}

export function requirePaper(player) {
  try {
    const inv = player.getComponent("inventory").container;

    for (let i = 0; i < inv.size; i++) {
      const item = inv.getItem(i);
      if (item?.typeId === CONFIG.PAPER_ITEM_ID && (!item.getLore || item.getLore().length === 0)) {
        if (item.amount > 1) {
          item.amount--;
          inv.setItem(i, item);
        } else {
          inv.setItem(i, null);
        }
        return true;
      }
    }

    player.sendMessage(MESSAGES.ERROR.NO_PAPER);
    return false;
  } catch (e) {
    console.warn("[PAPER] requirePaper:", player?.name, e);
    return false;
  }
}

export function giveSlip(player, lines) {
  try {
    const slip = new ItemStack(CONFIG.PAPER_ITEM_ID, 1);
    slip.setLore(lines);

    const inv = player.getComponent("inventory").container;
    const leftover = inv.addItem(slip);

    if (leftover?.amount > 0) {
      player.dimension.spawnItem(leftover, player.location);
    }
  } catch (e) {
    console.warn("[SLIP] giveSlip:", player?.name, e);
  }
}

export function createDepositSlip(player, amount, newBalance) {
  giveSlip(player, [
    "§r§eประเภท: §fฝาก",
    `§r§eผู้เล่น: §f${player.name}`,
    `§r§eจำนวน: §f${amount.toLocaleString()}`,
    `§r§eยอดคงเหลือ: §f${newBalance.toLocaleString()}`,
    `§r§eวันที่: §f${getDateTime()}`,
  ]);
}

export function createWithdrawSlip(player, amount, newBalance) {
  giveSlip(player, [
    "§r§eประเภท: §fถอน",
    `§r§eผู้เล่น: §f${player.name}`,
    `§r§eจำนวน: §f${amount.toLocaleString()}`,
    `§r§eยอดคงเหลือ: §f${newBalance.toLocaleString()}`,
    `§r§eวันที่: §f${getDateTime()}`,
  ]);
}

export function createTransferSlip(player, targetName, amount, newBalance) {
  giveSlip(player, [
    "§r§eประเภท: §fโอน",
    `§r§eไปยัง: §f${targetName}`,
    `§r§eจำนวน: §f${amount.toLocaleString()}`,
    `§r§8-----------------------`,
    `§r§eผู้เล่น: §f${player.name}`,
    `§r§eยอดคงเหลือ: §f${newBalance.toLocaleString()}`,
    `§r§eวันที่: §f${getDateTime()}`,
  ]);
}

export function depositDiamond(player, amount) {
  try {
    const diamonds = countDiamonds(player);
    const toDeposit = Math.min(amount, diamonds);
    if (toDeposit < 1) return 0;

    const remaining = removeDiamondsFromInventory(player, toDeposit);
    const deposited = toDeposit - remaining;

    if (deposited > 0) {
      addBalance(player, deposited);
      initializeInterest(player);
    }

    return deposited;
  } catch (e) {
    console.warn("[BANK] depositDiamond:", player?.name, amount, e);
    return 0;
  }
}

export function withdrawDiamond(player, amount) {
  try {
    const balance = getBalance(player);
    if (amount < 1 || balance < amount) return 0;

    const capacity = getInventoryCapacity(player);
    if (capacity < amount) return 0;

    setBalance(player, balance - amount);
    initializeInterest(player);

    const leftover = addDiamondsToInventory(player, amount);

    if (leftover > 0) {
      setBalance(player, balance);
      return 0;
    }

    return amount;
  } catch (e) {
    console.warn("[BANK] withdrawDiamond:", player?.name, amount, e);
    return 0;
  }
}

export function claimInterest(player) {
  try {
    const balance = getBalance(player);

    if (balance <= 0) {
      initializeInterest(player);
      return 0;
    }

    const lastClaimValue = getInterestDate(player);
    const lastClaimTime = lastClaimValue > 0 ? parseDateIntValue(lastClaimValue).getTime() : 0;
    const nextClaimTime = lastClaimTime + CONFIG.INTEREST_COOLDOWN_MS;

    if (Date.now() < nextClaimTime) return 0;

    const interestAmount = Math.floor(balance * CONFIG.INTEREST_RATE);
    addBalance(player, interestAmount);
    setInterestDate(player, getDateIntValue(new Date()));

    return interestAmount;
  } catch (e) {
    console.warn("[BANK] claimInterest:", player?.name, e);
    return 0;
  }
}

export function getInterestStatus(player) {
  try {
    const balance = getBalance(player);
    const lastClaimValue = getInterestDate(player);
    const lastClaimDate = parseDateIntValue(lastClaimValue);
    const interest = balance > 0 ? Math.floor(balance * CONFIG.INTEREST_RATE) : 0;

    const lastDateStr = lastClaimValue === 0 ? "ยังไม่เคยรับ" : formatDate(lastClaimDate);

    let statusText;
    if (balance <= 0) {
      statusText = "เงินต้น 0 ไม่มีดอกเบี้ย";
    } else if (lastClaimValue === 0) {
      statusText = "สามารถรับดอกเบี้ยได้ (ครั้งแรก)";
    } else if (Date.now() >= lastClaimDate.getTime() + CONFIG.INTEREST_COOLDOWN_MS) {
      statusText = "§aสามารถรับดอกเบี้ยได้แล้ว!§r";
    } else {
      const daysRemaining = Math.ceil((lastClaimDate.getTime() + CONFIG.INTEREST_COOLDOWN_MS - Date.now()) / (1000 * 60 * 60 * 24));
      const nextClaimDate = formatDate(new Date(lastClaimDate.getTime() + CONFIG.INTEREST_COOLDOWN_MS));
      statusText = `รออีก ${daysRemaining} วัน (รับได้: ${nextClaimDate})`;
    }

    return { balance, interest, lastDateStr, statusText };
  } catch (e) {
    console.warn("[BANK] getInterestStatus:", e);
    return {
      balance: 0,
      interest: 0,
      lastDateStr: "ไม่มี",
      statusText: "เกิดข้อผิดพลาด",
    };
  }
}

export function getTransferTargets(player) {
  try {
    return world.getAllPlayers().filter((p) => p.id !== player.id);
  } catch (e) {
    console.warn("[BANK] getTransferTargets:", e);
    return [];
  }
}

export function executeTransfer(sender, target, amount) {
  try {
    const senderBalance = getBalance(sender);
    if (senderBalance < amount) {
      sender.sendMessage(MESSAGES.ERROR.INSUFFICIENT_FUNDS);
      return false;
    }

    const newBalance = removeBalance(sender, amount);
    addBalance(target, amount);

    createTransferSlip(sender, target.name, amount, newBalance);

    sender.sendMessage(MESSAGES.SUCCESS.TRANSFER_SENDER(sender.name, amount, target.name));
    target.sendMessage(MESSAGES.SUCCESS.TRANSFER_RECEIVER(target.name, amount, sender.name));

    return true;
  } catch (e) {
    console.warn("[BANK] executeTransfer:", sender?.name, "->", target?.name, amount, e);
    return false;
  }
}
