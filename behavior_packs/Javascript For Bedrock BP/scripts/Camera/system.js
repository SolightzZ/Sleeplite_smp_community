import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { playerCameraTemplates } from "./database.js";
import { chooseCameraSetting, createCameraTemplate, shareCameraTemplate, removeCameraTemplate, resetCamera } from "./functions.js";

async function showCameraMainMenu(player) {
  try {
    const form = new ActionFormData().title("Menu Camera").button("Setting Camera").button("Reset").button("Create").button("Share").button("Delete");
    const response = await form.show(player);

    if (response.canceled) return;
    const selection = response.selection;
    const actions = [chooseCameraSetting, resetCamera, createCameraTemplate, shareCameraTemplate, removeCameraTemplate];
    const selectedAction = actions[selection];

    if (!selectedAction) return;
    const templates = playerCameraTemplates.get(player.id) || [];
    const needsTemplate = selection > 2;

    if (needsTemplate && !templates.length) {
      player.onScreenDisplay.setActionBar("ไม่มีเทมเพลตสำหรับดำเนินการนี้");
      return;
    }

    system.run(async () => {
      try {
        if (
          selectedAction === chooseCameraSetting ||
          selectedAction === createCameraTemplate ||
          selectedAction === shareCameraTemplate ||
          selectedAction === removeCameraTemplate
        ) {
          await selectedAction(player, playerCameraTemplates, world);
        } else {
          await selectedAction(player);
        }
      } catch (e) {
        console.warn(`Error in action [${selection}]:` + e);
        player.sendMessage(`§c[Camera] Failed to complete operation`);
      }
    });
  } catch (error) {
    player.sendMessage(`§c[Camera] Failed to open main menu`);
    console.warn(error);
  }
}

export function showCameraMenu({ source }) {
  showCameraMainMenu(source);
}

export function playerLeaveCamera(event) {
  try {
    if (playerCameraTemplates.has) return;
    playerCameraTemplates.delete(event.playerId);
    console.warn(`Cleared camera templates for Player ID ${event.playerId}`);
  } catch (error) {
    console.warn(`[Camera] Error clearing camera templates for Player ID ${event.playerId}: ${error}`);
  }
}

console.warn("Camera loaded successfully");
