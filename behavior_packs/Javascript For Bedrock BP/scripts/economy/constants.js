export const CONFIG = {
  BANK_DB_NAME: "Banking",
  BANK_DISPLAY_NAME: "Banking",
  INTEREST_RATE: 0.02,
  INTEREST_DAYS: 7,
  INTEREST_COOLDOWN_MS: 7 * 24 * 60 * 60 * 1000,
  DIAMOND_ITEM_ID: "minecraft:diamond",
  BANK_OPEN_ITEM: "addon:bank",
  PAPER_ITEM_ID: "minecraft:paper",
  MAX_STACK_SIZE: 64,
  TIMEZONE_OFFSET: 7,
};

export const MESSAGES = {
  ERROR: {
    NO_DIAMONDS: "§c[x] คุณไม่มีเพชรในกระเป๋าเพื่อฝาก",
    NO_BALANCE: "§c[x] คุณไม่มีเพชรในธนาคาร",
    NO_PAPER: "§c[x] ไม่มีกระดาษสำหรับทำสลิป",
    NO_SPACE: "§c[x] ช่องกระเป๋าไม่พอสำหรับรับเพชร",
    NO_PLAYERS: "§c[x] ไม่มีผู้เล่นออนไลน์คนอื่น",
    INSUFFICIENT_FUNDS: "§c[x] ยอดเงินไม่เพียงพอสำหรับโอน",
    NO_PERMISSION: "§c[x] คุณไม่มีสิทธิ์ใช้งานเมนูนี้",
    DEPOSIT_FAILED: "§c[x] ฝากไม่สำเร็จ",
    WITHDRAW_FAILED: "§c[x] ถอนไม่สำเร็จ",
    TRANSFER_FAILED: "§c[x] ไม่สามารถโอนได้ (เช็คยอดเงินหรือกระดาษ)",
    GENERAL_ERROR: "§c[x] เกิดข้อผิดพลาด",
  },

  SUCCESS: {
    DEPOSIT: (amount) => `§a[/] ฝาก §f${amount.toLocaleString()} §aเพชรเรียบร้อย`,
    WITHDRAW: (amount) => `§a[/] ถอน §f${amount.toLocaleString()} §aเพชรเรียบร้อย`,
    TRANSFER_SENDER: (sender, amount, target) => `§a[Banking] §f${sender} §aโอน: §f[${amount.toLocaleString()} Diamond]§a ให้:§f ${target}`,
    TRANSFER_RECEIVER: (receiver, amount, sender) => `§a[Banking] §f${receiver} §aได้รับ: §f[${amount.toLocaleString()} Diamond]§a จาก:§f ${sender}`,
    INTEREST_CLAIMED: (amount) => `§a[ดอกเบี้ย] รับดอกเบี้ย §f+${amount.toLocaleString()} §aเพชรเรียบร้อย!`,
  },

  INFO: {
    INTEREST_NOT_READY: "§e[ดอกเบี้ย] ยังไม่สามารถรับดอกเบี้ยได้",
    NO_BANK_PLAYERS: "§e[!] ยังไม่มีผู้เล่นในระบบธนาคาร",
  },
};

export const UI_TITLES = {
  MAIN_MENU: "Sleeplite Banking",
  BALANCE: "Sleeplite Banking | ยอดในธนาคาร",
  DEPOSIT: "Sleeplite Banking | ฝากเพชรเข้าธนาคาร",
  WITHDRAW: "Sleeplite Banking | ถอนเพชรจากธนาคาร",
  TRANSFER: "Sleeplite Banking | โอนเพชร",
  INTEREST_STATUS: "Sleeplite Banking | สถานะดอกเบี้ย",
  ADMIN_FINANCE: "Admin | ดูข้อมูลการเงิน",
};

export const TAGS = {
  ADMIN: "admin",
};

export const DEFAULTS = {
  BALANCE: 0,
  DATE_INT: 1012000,
  DATE_STRING: "01/01/2000 00:00",
  PLAYER_KEY: "unknown",
};
