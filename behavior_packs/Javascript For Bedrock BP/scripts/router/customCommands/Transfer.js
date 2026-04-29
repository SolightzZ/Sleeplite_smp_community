import { Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { transferPlayer } from "@minecraft/server-admin";
import { SERVER_LIST, MESSAGES } from "./Source.js";

export function showServerMenu(player) {
  try {
    const form = new ActionFormData().title("เลือกเซิร์ฟเวอร์");

    for (let i = 0; i < SERVER_LIST.length; i++) {
      const s = SERVER_LIST[i];
      form.button(s.displayName, s.iconTexture || "textures/items/xbox4");
    }

    form.button("กรอก IP ด้วยตัวเอง");
    form.show(player).then((response) => {
      if (!response || response.canceled) return;
      const idx = response.selection;
      if (idx === undefined) return;
      if (idx >= SERVER_LIST.length) {
        showCustomServerInput(player);
        return;
      }
      const server = SERVER_LIST[idx];
      showConfirmationMenu(
        player,
        server.displayName,
        server.ipAddress,
        server.portNumber,
      );
    });
  } catch (error) {
    console.warn("showServerMenu", error.message);
  }
}

function showCustomServerInput(player) {
  try {
    const form = new ModalFormData()
      .title("กรอกเซิร์ฟเวอร์")
      .textField("IP Address:", "เช่น 192.168.0.1")
      .textField("Port Number:", "เช่น 19132");

    form.show(player).then((response) => {
      if (!response || response.canceled) return;
      const values = response.formValues;
      if (!values) return;
      const ipAddress = values[0];
      const portNumber = Number(values[1]);
      if (!ipAddress || !Number.isInteger(portNumber)) {
        player.sendMessage(MESSAGES.INVALID_IP);
        return;
      }

      showConfirmationMenu(
        player,
        "เซิร์ฟเวอร์ที่กำหนดเอง",
        ipAddress,
        portNumber,
      );
    });
  } catch (error) {
    console.warn("showCustomServerInput", error.message);
  }
}

function showConfirmationMenu(player, serverName, ipAddress, portNumber) {
  try {
    const form = new ActionFormData()
      .title("ยืนยันการเชื่อมต่อ")
      .body(
        `§7ชื่อเซิร์ฟเวอร์: ${serverName}\nIP Address: ${ipAddress}\n§7Port Number: ${portNumber}`,
      )
      .button("ตกลง")
      .button("กลับ");

    form.show(player).then((response) => {
      if (!response || response.canceled) return;

      if (response.selection !== 0) {
        showServerMenu(player);
        return;
      }

      transferPlayerToServer(player, ipAddress, portNumber);
    });
  } catch (error) {
    console.warn("showConfirmationMenu", error.message);
  }
}

function transferPlayerToServer(player, ipAddress, portNumber) {
  try {
    transferPlayer(player, { hostname: ipAddress, port: portNumber });
    player.sendMessage(MESSAGES.TRANSFER_START(ipAddress, portNumber));
    console.warn(
      `Transferring player ${player.name} to ${ipAddress}:${portNumber}`,
    );
  } catch (error) {
    player.sendMessage(MESSAGES.TRANSFER_FAIL);
    console.warn("Player transfer error:", error.message);
  }
}
