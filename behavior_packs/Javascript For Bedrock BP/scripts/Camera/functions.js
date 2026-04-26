import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { easeTypes, defaultCameraSettings, serverCameraSettings } from "./constants.js";

export function setCamera(player, duration, easeName, x, y, z, rotationX, rotationZ) {
  player.runCommand(`camera @s set minecraft:free ease ${duration} ${easeName} pos ^${x} ^${y} ^${z} rot ~${rotationX} ~${rotationZ}`);
}

export function resetCamera(player) {
  player.camera.clear();
}

export function showCameraModalForm(player, title, defaults, saveCallback) {
  new ModalFormData()
    .title(title)
    .slider("เวลา (Ease)", 1, 100, { valueStep: 1, defaultValue: defaults.time })
    .dropdown("ประเภท Ease", easeTypes, { defaultValueIndex: defaults.easeIndex })
    .slider("ตำแหน่ง X", -10, 100, { valueStep: 1, defaultValue: defaults.x })
    .slider("ตำแหน่ง Y", -10, 100, { valueStep: 1, defaultValue: defaults.y })
    .slider("ตำแหน่ง Z", -50, 100, { valueStep: 1, defaultValue: defaults.z })
    .slider("หมุน X", -90, 360, { valueStep: 5, defaultValue: defaults.rotationX })
    .slider("หมุน Z", -90, 360, { valueStep: 5, defaultValue: defaults.rotationZ })
    .show(player)
    .then((resp) => {
      if (resp.canceled || !resp.formValues) return;
      const [duration, easeIndex, x, y, z, rotationX, rotationZ] = resp.formValues;
      if (typeof easeIndex !== "number" || easeIndex < 0 || easeIndex >= easeTypes.length) {
        player.onScreenDisplay.setActionBar("เลือกประเภท Ease ไม่ถูกต้อง");
        return;
      }
      saveCallback(player, duration, easeTypes[easeIndex], x, y, z, rotationX, rotationZ);
    });
}

export function chooseCameraSetting(player, playerCameraTemplates) {
  const templates = playerCameraTemplates.get(player.id) || [];
  const form = new ActionFormData();
  form.title("เลือกการตั้งค่ากล้อง");
  form.button("ค่าเริ่มต้น").button("ค่าเซิร์ฟเวอร์");
  templates.forEach((t) => form.button(t.name));
  form.show(player).then((resp) => {
    if (resp.canceled) return;
    if (resp.selection >= 2 && resp.selection < 2 + templates.length) {
      loadCameraTemplate(player, resp.selection - 2, playerCameraTemplates);
      return;
    }
    const selected = resp.selection === 0 ? defaultCameraSettings : serverCameraSettings;
    showCameraModalForm(player, "ตั้งค่ากล้อง", selected, setCamera);
  });
}

export function createCameraTemplate(player, playerCameraTemplates) {
  showCameraModalForm(player, "ตั้งค่ากล้อง", defaultCameraSettings, (player, duration, easeName, x, y, z, rotationX, rotationZ) => {
    saveCameraTemplate(player, duration, easeName, x, y, z, rotationX, rotationZ, playerCameraTemplates);
  });
}

export function shareCameraTemplate(player, playerCameraTemplates, world) {
  const templates = playerCameraTemplates.get(player.id) || [];
  if (!templates.length) {
    player.onScreenDisplay.setActionBar("คุณไม่มีเทมเพลตที่บันทึกไว้");
    return;
  }
  new ModalFormData()
    .title("เลือกเทมเพลตเพื่อส่ง")
    .dropdown(
      "เลือกเทมเพลต",
      templates.map((t, i) => `${t.name} (${i + 1})`),
      { defaultValueIndex: 0 }
    )
    .show(player)
    .then((resp) => {
      if (resp.canceled || !resp.formValues) return;
      const [templateIndex] = resp.formValues;
      if (typeof templateIndex !== "number" || templateIndex < 0 || templateIndex >= templates.length) {
        player.onScreenDisplay.setActionBar("เลือกเทมเพลตไม่ถูกต้อง");
        return;
      }
      const players = [...world.getPlayers()];
      if (players.length < 2) {
        player.onScreenDisplay.setActionBar("ต้องมีผู้เล่นอย่างน้อย 2 คนเพื่อแชร์เทมเพลต");
        return;
      }
      new ModalFormData()
        .title("เลือกผู้เล่นเพื่อส่งเทมเพลต")
        .dropdown(
          "เลือกผู้เล่น",
          players.map((p) => p.name),
          { defaultValueIndex: 0 }
        )
        .show(player)
        .then((res) => {
          if (res.canceled || !res.formValues) return;
          const [receiverIndex] = res.formValues;
          if (typeof receiverIndex !== "number" || receiverIndex < 0 || receiverIndex >= players.length) {
            player.onScreenDisplay.setActionBar("เลือกผู้เล่นไม่ถูกต้อง");
            return;
          }
          const receiver = players[receiverIndex];
          if (receiver.name === player.name) {
            player.onScreenDisplay.setActionBar("คุณไม่สามารถส่งเทมเพลตให้ตัวเองได้");
            return;
          }
          const receiverTemplates = playerCameraTemplates.get(receiver.id) || [];
          if (receiverTemplates.length >= 5) {
            player.onScreenDisplay.setActionBar(`${receiver.name} มีเทมเพลตเต็มแล้ว`);
            return;
          }
          const templateToSend = templates[templateIndex];
          receiverTemplates.push({ ...templateToSend, name: `${receiver.name} - ${receiverTemplates.length + 1}` });
          playerCameraTemplates.set(receiver.id, receiverTemplates);
          receiver.sendMessage(`คุณได้รับเทมเพลตจาก ${player.name}: ${templateToSend.name}`);
          player.sendMessage(`คุณได้ส่งเทมเพลตให้ ${receiver.name}: ${templateToSend.name}`);
        });
    });
}

export function removeCameraTemplate(player, playerCameraTemplates) {
  const templates = playerCameraTemplates.get(player.id) || [];
  if (!templates.length) {
    player.onScreenDisplay.setActionBar("คุณไม่มีเทมเพลตที่บันทึกไว้");
    return;
  }
  new ModalFormData()
    .title("ลบเทมเพลต")
    .dropdown(
      "เลือกเทมเพลตเพื่อลบ",
      templates.map((t, i) => `${t.name} (${i + 1})`),
      { defaultValueIndex: 0 }
    )
    .show(player)
    .then((resp) => {
      if (resp.canceled || !resp.formValues) return;
      deleteCameraTemplate(player, resp.formValues[0], playerCameraTemplates);
    });
}

function saveCameraTemplate(player, duration, easeName, x, y, z, rotationX, rotationZ, playerCameraTemplates) {
  try {
    if (!player || typeof duration !== "number" || !easeName || typeof x !== "number") {
      player.onScreenDisplay.setActionBar("ข้อมูลไม่ครบหรือไม่ถูกต้อง");
      return;
    }
    const id = player.id;
    const templates = playerCameraTemplates.get(id) || [];
    if (templates.length >= 5) {
      player.onScreenDisplay.setActionBar("สามารถบันทึกเทมเพลตได้สูงสุด 5 รายการ");
      return;
    }
    const name = `${player.name} ${templates.length + 1}`;
    templates.push({ duration, easeName, x, y, z, rotationX, rotationZ, name });
    playerCameraTemplates.set(id, templates);
    player.onScreenDisplay.setActionBar(`บันทึกเทมเพลตสำเร็จ: ${name}`);
  } catch (e) {
    player.sendMessage("Template save failed");
    console.warn(`Template save failed: ` + e);
  }
}

function loadCameraTemplate(player, index, playerCameraTemplates) {
  const templates = playerCameraTemplates.get(player.id) || [];
  if (index < 0 || index >= templates.length) return;
  const { duration, easeName, x, y, z, rotationX, rotationZ } = templates[index];
  setCamera(player, duration, easeName, x, y, z, rotationX, rotationZ);
}

function deleteCameraTemplate(player, index, playerCameraTemplates) {
  const templates = playerCameraTemplates.get(player.id) || [];
  if (index < 0 || index >= templates.length) return;
  const name = templates[index].name;
  templates.splice(index, 1);
  playerCameraTemplates.set(player.id, templates);
  player.sendMessage(`ลบเทมเพลต: ${name}`);
}
