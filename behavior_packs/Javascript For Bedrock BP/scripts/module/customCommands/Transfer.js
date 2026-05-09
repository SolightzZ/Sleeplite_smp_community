import { system } from "@minecraft/server";
import { transferPlayer } from "@minecraft/server-admin";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { MESSAGES, SERVER_LIST } from "./Source.js";

export function showServerMenu(player) {
  if (!player.isValid) return;

  const form = new ActionFormData().title("เลือกเซิร์ฟเวอร์");

  for (let i = 0; i < SERVER_LIST.length; i++) {
    const s = SERVER_LIST[i];
    form.button(s.displayName, s.iconTexture || "textures/items/xbox4");
  }
  form.button("กรอก IP ด้วยตัวเอง");

  form
    .show(player)
    .then((response) => {
      if (!response || response.canceled) return;

      const idx = response.selection;
      if (idx === undefined) return;

      if (idx >= SERVER_LIST.length) {
        system.run(() => {
          if (player.isValid) showCustomServerInput(player);
        });
        return;
      }

      const server = SERVER_LIST[idx];
      system.run(() => {
        if (player.isValid)
          showConfirmationMenu(
            player,
            server.displayName,
            server.ipAddress,
            server.portNumber,
          );
      });
    })
    .catch((error) => {
      console.error("[ CustomCommands ] showServerMenu: " + error);
      system.run(() => {
        if (player.isValid) showCustomServerInput(player);
      });
      return;
    });
}

function showCustomServerInput(player) {
  if (!player.isValid) return;

  const form = new ModalFormData()
    .title("กรอกเซิร์ฟเวอร์")
    .textField("IP Address:", "เช่น 192.168.0.1 หรือ zeqa.net")
    .textField("Port Number:", "เช่น 19132");

  form
    .show(player)
    .then((response) => {
      if (!response || response.canceled) return;

      const values = response.formValues;
      if (!values) return;

      const ipAddress = values[0];
      const portNumber = Number(values[1]);

      if (!ipAddress || !Number.isInteger(portNumber)) {
        player.sendMessage(MESSAGES.INVALID_IP);
        return;
      }

      system.run(() => {
        if (player.isValid)
          showConfirmationMenu(
            player,
            "เซิร์ฟเวอร์ที่กำหนดเอง",
            ipAddress,
            portNumber,
          );
      });
    })
    .catch((error) => {
      console.error("[ CustomCommands ] showCustomServerInput: " + error);
      system.run(() => {
        if (player.isValid) showServerMenu(player);
      });
      return;
    });
}

function showConfirmationMenu(player, serverName, ipAddress, portNumber) {
  if (!player.isValid) return;

  const form = new ActionFormData()
    .title("ยืนยันการเชื่อมต่อ")
    .body(
      `§7ชื่อเซิร์ฟเวอร์: ${serverName}\nIP Address: ${ipAddress}\n§7Port Number: ${portNumber}`,
    )
    .button("ตกลง")
    .button("กลับ");

  form
    .show(player)
    .then((response) => {
      if (!response || response.canceled) return;

      if (response.selection !== 0) {
        system.run(() => {
          if (player.isValid) showServerMenu(player);
        });
        return;
      }

      transferPlayerToServer(player, ipAddress, portNumber);
    })
    .catch((error) => {
      console.error("[ CustomCommands ] showConfirmationMenu: " + error);
      system.run(() => {
        if (player.isValid) showServerMenu(player);
      });
      return;
    });
}

function transferPlayerToServer(player, ipAddress, portNumber) {
  if (!player.isValid) return;
  try {
    transferPlayer(player, { hostname: ipAddress, port: portNumber });
    player.sendMessage(MESSAGES.TRANSFER_START(ipAddress, portNumber));
  } catch (error) {
    console.error("[ CustomCommands ] transferPlayerToServer: " + error);
    player.sendMessage(MESSAGES.TRANSFER_FAIL);
  }
}
