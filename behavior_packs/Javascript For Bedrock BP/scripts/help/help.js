import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { dy } from "./help_Durability.js";

const HELP_TEXT = `§8--------- §eHelper §8---------
§7[§a/§7] /addon:help §7Help - คําสั่งต่างๆ
§7[§a/§7] /server §7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ
§7[§a/§7] /msg §7Private Message (/msg steve Hi) - ส่งข้อความส่วนตัว
§7[§a/§7] /sit §7Sit - ที่นั่ง
§7[§a/§7] /rw §7Rwards - รับรางวัลล็อกอิน
§7[§a/§7] /r §7Inventory Sorter (/r max) - เรียงไอเทมในตัว
§7[§a/§7] /c §7Chest Sorter (/c chess) - เรียงไอเทมในกล่อง
§7[§a/§7] !xz §7Nether Calculator (!xz หรือ !xz -200 200) - คำนวณพิกัดเนเทอร์
§7[§a/§7] !d §7Durability & Player name - แสดงความทนทานไอเทมในตัว และ แสดงแท็กชื่อ
`;

const ADMIN_HELP_TEXT = `§8--------- §cHelper Admin §8---------
§7[§c/§7] !json - แสดงข้อมูล JSON Protection
§7[§c/§7] !reset-login - รีเซ็ตข้อมูล Reward
§7[§c/§7] !check-reward - แสดงข้อมูลล็อกอิน JSON Reward
`;

const showHelp = (player) => {
  player.sendMessage(HELP_TEXT);
  if (player.hasTag("admin")) player.sendMessage(ADMIN_HELP_TEXT);
};

export const helpmain = (event) => {
  const msg = event.message;
  if (!msg) return;

  const c0 = msg.charCodeAt(0);
  if (c0 !== 33) return;

  const command = msg.trim().toLowerCase();

  if (command === "!help") {
    event.cancel = true;
    const player = event.sender;
    if (player?.isValid) showHelp(player);
    return;
  }

  if (command === "!d") {
    event.cancel = true;
    const player = event.sender;
    if (player?.isValid) system.runTimeout(() => {
      if (player.isValid) dy(player);
    }, 20);
  }
};

export const RegisterHelp = (init) => {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:help",
      description: "Help - คําสั่งต่างๆ",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const player = origin.sourceEntity;
      if (!player?.isValid) {
        return { status: CustomCommandStatus.Failure, message: "§cใช้ได้เฉพาะผู้เล่น" };
      }
      showHelp(player);
      return { status: CustomCommandStatus.Success };
    },
  );
};
