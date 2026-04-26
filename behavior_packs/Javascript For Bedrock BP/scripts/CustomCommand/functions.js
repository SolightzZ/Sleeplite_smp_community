import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { transferPlayer } from "@minecraft/server-admin";
import { SERVER_LIST, MESSAGES } from "./constants.js";

export function showServerMenu(player) {
  try {
    const form = new ActionFormData().title("เลือกเซิร์ฟเวอร์");
    SERVER_LIST.forEach((s) =>
      form.button(s.displayName, s.iconTexture || "textures/items/xbox4"),
    );
    form.button("กรอก IP ด้วยตัวเอง");

    form.show(player).then((response) => {
      if (response.canceled) return;

      const idx = response.selection;
      if (idx < SERVER_LIST.length) {
        const server = SERVER_LIST[idx];
        showConfirmationMenu(
          player,
          server.displayName,
          server.ipAddress,
          server.portNumber,
        );
      } else {
        showCustomServerInput(player);
      }
    });
  } catch (error) {
    console.warn("showServerMenu", error);
  }
}

export function showCustomServerInput(player) {
  try {
    const form = new ModalFormData()
      .title("กรอกเซิร์ฟเวอร์")
      .textField("IP Address:", "เช่น 192.168.0.1")
      .textField("Port Number:", "เช่น 19132");

    form.show(player).then((response) => {
      if (response.canceled) return;

      const [ipAddress, portString] = response.formValues;
      const portNumber = parseInt(String(portString));
      if (!ipAddress || isNaN(portNumber)) {
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
    console.warn("showCustomServerInput", error);
  }
}

export function showConfirmationMenu(
  player,
  serverName,
  ipAddress,
  portNumber,
) {
  try {
    const form = new ActionFormData()
      .title("ยืนยันการเชื่อมต่อ")
      .body(
        `§7ชื่อเซิร์ฟเวอร์: ${serverName}\nIP Address: ${ipAddress}\n§7Port Number: ${portNumber}`,
      )
      .button("ตกลง")
      .button("กลับ");

    form.show(player).then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        transferPlayerToServer(player, ipAddress, portNumber);
      } else {
        showServerMenu(player);
      }
    });
  } catch (error) {
    console.warn("showConfirmationMenu", error);
  }
}

export function transferPlayerToServer(player, ipAddress, portNumber) {
  try {
    transferPlayer(player, { hostname: ipAddress, port: portNumber });
    player.sendMessage(MESSAGES.TRANSFER_START(ipAddress, portNumber));
    console.warn(
      `Transferring player ${player.name} to ${ipAddress}:${portNumber}`,
    );
  } catch (error) {
    player.sendMessage(MESSAGES.TRANSFER_FAIL);
    console.warn("Player transfer error:", error);
  }
}
