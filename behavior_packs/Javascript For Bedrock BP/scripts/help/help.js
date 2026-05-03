import { system } from "@minecraft/server";
import { dy } from "./help_Durability.js";

const help = `§8--------- §eHelper §8---------
§7[§a/§7] /server §7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ
§7[§a/§7] /msg §7Private Message (/msg steve Hi) - ส่งข้อความส่วนตัว
§7[§a/§7] /r §7Inventory Sorter (/r max) - เรียงไอเทมในตัว
§7[§a/§7] /c §7Chest Sorter (/c chess) - เรียงไอเทมในกล่อง
§7[§a/§7] !xz §7Nether Calculator (!xz หรือ !xz -200 200) - คำนวณพิกัดเนเทอร์
§7[§a/§7] !d §7Durability & Player name - แสดงความทนทานไอเทมในตัว และ แสดงแท็กชื่อ
`;

const adminHelp = `§8--------- §cHelper Admin §8---------
§7[§c/§7] !json - แสดงข้อมูล JSON Protection
§7[§c/§7] !reset-login - รีเซ็ตข้อมูล Reward
§7[§c/§7] !check-reward - แสดงข้อมูลล็อกอิน JSON Reward
`;

function helpmain(event) {
  event.cancel = false;
  try {
    const { sender: player, message } = event;
    const command = message.trim().toLowerCase();

    if (command === "!help") {
      event.cancel = true;
      player.sendMessage(help);
      if (player.hasTag("admin")) {
        player.sendMessage(adminHelp);
      }
    }
    if (command === "!d") {
      event.cancel = true;
      system.runTimeout(() => dy(player), 20);
    }
  } catch (error) {
    console.warn("help_main", error.message);
  }
}

export { helpmain };
