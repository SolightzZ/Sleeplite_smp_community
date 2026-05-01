import { system, world } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";
import { CONFIG, MESSAGES, TAGS, UI_TITLES } from "./constants.js";
import {
  getAllBankPlayers,
  getBalance,
  initializeObjective,
} from "./database.js";
import {
  claimInterest,
  countDiamonds,
  createDepositSlip,
  createWithdrawSlip,
  depositDiamond,
  executeTransfer,
  getInterestStatus,
  getInventoryCapacity,
  getTransferTargets,
  requirePaper,
  withdrawDiamond,
} from "./functions.js";

function isAdmin(player) {
  if (!player.hasTag(TAGS.ADMIN)) {
    console.warn("[ADMIN] Access denied:", player.name);
    player.sendMessage(MESSAGES.ERROR.NO_PERMISSION);
    return false;
  }
  return true;
}

async function showMainMenu(player) {
  try {
    const form = new ActionFormData()
      .title(UI_TITLES.MAIN_MENU)
      .body("กรุณาเลือกเมนูด้านล่าง")
      .button("เช็คยอดเงิน", "textures/ui/achievements_pause_menu_icon")
      .button("ดอกเบี้ย", "textures/ui/icon_book_writable")
      .button("โอน", "textures/ui/dressing_room_customization")
      .button("ฝาก", "textures/ui/icon_blackfriday")
      .button("ถอน", "textures/ui/icon_deals");

    if (player.hasTag(TAGS.ADMIN)) {
      form.button("การเงิน");
    }

    const result = await form.show(player);
    if (!result || result.canceled) return;

    const actions = [
      showBalanceUI,
      showInterestClaimUI,
      transferMoneyUI,
      depositDiamondUI,
      withdrawDiamondUI,
      player.hasTag(TAGS.ADMIN) ? openAdminFinanceMenu : null,
    ].filter(Boolean);

    const action = actions[result.selection];
    if (action) {
      system.run(() => action(player));
    }
  } catch (e) {
    console.warn("[UI] showMainMenu:", player?.name, e);
    player.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

async function showBalanceUI(player) {
  try {
    const balance = getBalance(player).toLocaleString();

    await new MessageFormData()
      .title(UI_TITLES.BALANCE)
      .body(
        `----------------------\n` +
          `ธนาคาร: SLEEPLITE BANKING§r\n` +
          `ชื่อ: ${player.name}\n` +
          `ไอดี: ${player.id}\n\n` +
          `ยอดเงินของคุณ ${balance} เพชร§r\n` +
          `----------------------`,
      )
      .button1("ตกลง")
      .button2("ปิด")
      .show(player);
  } catch (e) {
    console.warn("[UI] showBalanceUI:", player?.name, e);
  }
}

async function depositDiamondUI(player) {
  try {
    const totalDiamonds = countDiamonds(player);
    if (totalDiamonds < 1) {
      return player.sendMessage(MESSAGES.ERROR.NO_DIAMONDS);
    }

    const form = await new ModalFormData()
      .title(UI_TITLES.DEPOSIT)
      .slider("จำนวนเพชรที่ต้องการฝาก", 1, totalDiamonds, {
        valueStep: 1,
        defaultValue: 1,
      })
      .show(player);

    if (!form || form.canceled) return;

    const [amount] = form.formValues ?? [1];

    if (!requirePaper(player)) return;

    const deposited = depositDiamond(player, amount);
    if (deposited < 1) {
      return player.sendMessage(MESSAGES.ERROR.DEPOSIT_FAILED);
    }

    const newBalance = getBalance(player);
    createDepositSlip(player, deposited, newBalance);
    player.sendMessage(MESSAGES.SUCCESS.DEPOSIT(deposited));
  } catch (e) {
    console.warn("[UI] depositDiamondUI:", player?.name, e);
    player.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

async function withdrawDiamondUI(player) {
  try {
    const balance = getBalance(player);
    if (balance < 1) {
      return player.sendMessage(MESSAGES.ERROR.NO_BALANCE);
    }

    const capacity = getInventoryCapacity(player);
    const maxWithdraw = Math.min(balance, capacity);

    if (maxWithdraw < 1) {
      return player.sendMessage(MESSAGES.ERROR.NO_SPACE);
    }

    const form = await new ModalFormData()
      .title(UI_TITLES.WITHDRAW)
      .slider("จำนวนเพชรที่ต้องการถอน", 1, maxWithdraw, {
        valueStep: 1,
        defaultValue: 1,
      })
      .show(player);

    if (!form || form.canceled) return;

    const [amount] = form.formValues ?? [1];

    if (!requirePaper(player)) return;

    const withdrawn = withdrawDiamond(player, amount);
    if (withdrawn < 1) {
      return player.sendMessage(MESSAGES.ERROR.WITHDRAW_FAILED);
    }

    createWithdrawSlip(player, withdrawn, getBalance(player));
    player.sendMessage(MESSAGES.SUCCESS.WITHDRAW(withdrawn));
  } catch (e) {
    console.warn("[UI] withdrawDiamondUI:", player?.name, e);
    player.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

async function transferMoneyUI(player) {
  try {
    const targets = getTransferTargets(player);
    if (!targets.length) {
      return player.sendMessage(MESSAGES.ERROR.NO_PLAYERS);
    }

    const balance = getBalance(player);
    if (balance < 1) {
      return player.sendMessage(MESSAGES.ERROR.INSUFFICIENT_FUNDS);
    }

    const form = await new ModalFormData()
      .title(UI_TITLES.TRANSFER)
      .dropdown(
        "เลือกผู้รับ",
        targets.map((p) => p.name),
      )
      .slider("จำนวนเพชร", 1, balance, { valueStep: 1, defaultValue: 1 })
      .show(player);

    if (!form || form.canceled) return;

    const [index, amount] = form.formValues ?? [];
    const target = targets[index];

    if (!target) return;

    if (!requirePaper(player)) {
      return player.sendMessage(MESSAGES.ERROR.NO_PAPER);
    }

    executeTransfer(player, target, amount);
  } catch (e) {
    console.warn("[UI] transferMoneyUI:", player?.name, e);
    player.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

async function showInterestStatusUI(player) {
  try {
    const { balance, interest, lastDateStr, statusText } =
      getInterestStatus(player);

    await new MessageFormData()
      .title(UI_TITLES.INTEREST_STATUS)
      .body(
        `วันที่รับล่าสุด: ${lastDateStr}\n` +
          `สถานะ: ${statusText}\n\n` +
          `เงินต้น: ${balance.toLocaleString()} เพชร\n` +
          `ดอกเบี้ย: ${interest.toLocaleString()} เพชร (${CONFIG.INTEREST_RATE}%)\n` +
          `รวมหลังรับ: ${(balance + interest).toLocaleString()} เพชร`,
      )
      .button1("ตกลง")
      .button2("ปิด")
      .show(player);
  } catch (e) {
    console.warn("[UI] showInterestStatusUI:", player?.name, e);
  }
}

async function showInterestClaimUI(player) {
  try {
    const amount = claimInterest(player);

    if (amount <= 0) {
      player.sendMessage(MESSAGES.INFO.INTEREST_NOT_READY);
      await showInterestStatusUI(player);
      return;
    }

    if (!requirePaper(player)) {
      return player.sendMessage(MESSAGES.ERROR.NO_PAPER);
    }

    const newBalance = getBalance(player);
    createDepositSlip(player, amount, newBalance);
    player.sendMessage(MESSAGES.SUCCESS.INTEREST_CLAIMED(amount));
  } catch (e) {
    console.warn("[UI] showInterestClaimUI:", player?.name, e);
    player.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

function getPlayerFinanceInfo(playerName) {
  const playerObj = world.getPlayers().find((p) => p.name === playerName);
  const { balance, interest, lastDateStr, statusText } =
    getInterestStatus(playerName);

  return {
    balance,
    interest,
    lastDateStr,
    statusText,
    onlineStatus: playerObj ? "§aออนไลน์" : "§cออฟไลน์",
    playerId: playerObj?.id || "§8ไม่พบ (ออฟไลน์)",
  };
}

async function showAdminDropdown(admin, playerNames) {
  if (!playerNames.length) {
    admin.sendMessage(MESSAGES.INFO.NO_BANK_PLAYERS);
    return null;
  }

  try {
    const response = await new ModalFormData()
      .title(UI_TITLES.ADMIN_FINANCE)
      .dropdown("เลือกผู้เล่น", playerNames)
      .show(admin);

    return response?.formValues?.[0] != null
      ? playerNames[response.formValues[0]]
      : null;
  } catch (e) {
    console.warn("[ADMIN] showAdminDropdown:", e);
    admin.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
    return null;
  }
}

async function displayPlayerFinance(admin, playerName) {
  try {
    const info = getPlayerFinanceInfo(playerName);

    const bodyText = [
      "§7━━━━━━━━━━━━━━━━§r",
      `§eผู้เล่น: §f${playerName}`,
      `§eไอดี: §f${info.playerId}`,
      `§eสถานะ: ${info.onlineStatus}`,
      "",
      `§eยอดเงินในธนาคาร: §f${info.balance.toLocaleString()} Diamond`,
      `§eดอกเบี้ยรอรับ: §f${info.interest.toLocaleString()} Diamond`,
      `§eรับดอกเบี้ยล่าสุด: §f${info.lastDateStr}`,
      `§eสถานะดอกเบี้ย: §f${info.statusText}`,
      "§7━━━━━━━━━━━━━━━━",
    ].join("\n");

    const form = new MessageFormData()
      .title(`ข้อมูลการเงิน: ${playerName}`)
      .body(bodyText)
      .button1("ปิดหน้าต่าง")
      .button2("เลือกผู้เล่นอีกครั้ง");

    const response = await form.show(admin);
    if (!response || response.canceled) return;

    if (response.selection === 1) {
      const allPlayers = getAllBankPlayers();
      const selectedName = await showAdminDropdown(admin, allPlayers);
      if (selectedName) {
        await displayPlayerFinance(admin, selectedName);
      }
    }
  } catch (e) {
    console.warn("[ADMIN] displayPlayerFinance:", playerName, e);
    admin.sendMessage(MESSAGES.ERROR.GENERAL_ERROR);
  }
}

async function openAdminFinanceMenu(admin) {
  if (!isAdmin(admin)) return;

  const playerNames = getAllBankPlayers();
  const selectedName = await showAdminDropdown(admin, playerNames);

  if (selectedName) {
    await displayPlayerFinance(admin, selectedName);
  }
}

export function bankingSystem({ source }) {
  showMainMenu(source);
}

system.run(() => {
  initializeObjective();
  console.warn("[BANK] System loaded successfully");
});
