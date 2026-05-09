import { ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { completeJob } from "./CompleteJob.js";
import { createJob } from "./CreateJob.js";
import { editJobs } from "./EditJob.js";
import {
  deleteJobData,
  hasOwnerNotify,
  ownerNotifyMap,
  pendingDelivery,
  playerJobMap,
  saveData,
  showUI,
} from "./Job.js";
import { viewJobs } from "./ViewJob.js";

export const giveItems = (player, items) => {
  if (!player.isValid) return;

  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;

  const dim = player.dimension;
  const loc = player.location;

  const itemsLen = items.length;
  for (let i = 0; i < itemsLen; i++) {
    const item = items[i];
    let remaining = item.amount;
    const typeId = item.id;

    for (let j = 0; j < inv.size && remaining > 0; j++) {
      const it = inv.getItem(j);
      if (!it || it.typeId !== typeId) continue;

      const space = it.maxAmount - it.amount;
      if (space <= 0) continue;

      const add = Math.min(space, remaining);
      it.amount += add;
      remaining -= add;
      inv.setItem(j, it);
    }

    for (let j = 0; j < inv.size && remaining > 0; j++) {
      if (inv.getItem(j)) continue;

      const newItem = new ItemStack(typeId, 1);
      const size = Math.min(newItem.maxAmount, remaining);
      newItem.amount = size;
      inv.setItem(j, newItem);
      remaining -= size;
    }

    while (remaining > 0) {
      const newItem = new ItemStack(typeId, 1);
      const size = Math.min(newItem.maxAmount, remaining);
      newItem.amount = size;
      dim.spawnItem(newItem, loc);
      remaining -= size;
    }
  }
};

export function receiveItems(player) {
  if (!player.isValid) return;

  const pendingIds = ownerNotifyMap.get(player.id);

  if (!pendingIds || pendingIds.size === 0) {
    player.sendMessage("[Job] ไม่มีไอเท็มให้รับ");
    const form = new ActionFormData();
    form.title("รับไอเทม");
    form.body("ไม่มีไอเทมให้รับในขณะนี้");
    form.button("ย้อนกลับ");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  const form = new ActionFormData();

  const allItems = [];
  for (const jid of pendingIds) {
    const delivery = pendingDelivery.get(jid);

    if (!delivery) continue;
    const itemsLen = delivery.items.length;

    for (let i = 0; i < itemsLen; i++) {
      allItems.push(delivery.items[i]);
    }
  }

  let body = "ไอเทมจากงานที่เสร็จสิ้นแล้ว:\n\n";
  const allItemsLen = allItems.length;

  for (let i = 0; i < allItemsLen; i++) {
    const item = allItems[i];
    body += `- ${item.id.replace("minecraft:", "")} x${item.amount}\n`;
  }
  body += "\nกดรับเพื่อรวบรวมไอเทมทั้งหมด";

  form.title("รับไอเทม");
  form.body(body);
  form.button("รับทั้งหมด", "textures/ui/promo_gift_small_yellow");
  form.button("ย้อนกลับ");

  showUI(player, form, (res) => {
    if (res.selection === 1) {
      showMainMenu(player);
      return;
    }

    giveItems(player, allItems);

    for (const jid of pendingIds) {
      pendingDelivery.delete(jid);
      deleteJobData(jid);
    }
    ownerNotifyMap.delete(player.id);
    saveData();

    if (player.isValid)
      player.sendMessage(`[Job] ได้รับไอเทม ${allItems.length} ประเภทเรียบร้อยแล้ว!`);
    showMainMenu(player);
  });
}

export const showMainMenu = (player) => {
  if (!player.isValid) return;

  const hasPending = hasOwnerNotify(player.id);
  const activeJobId = playerJobMap.get(player.id);

  const form = new ActionFormData();
  form.title("ระบบจัดส่งงาน");
  form.body(``);
  form.button("สร้างคำสั่งจัดส่ง", "textures/ui/MashupIcon");
  form.divider();
  hasPending
    ? form.button(
      "§e[!] §rรับไอเทมจัดส่ง",
      "textures/ui/mute_off",
    )
    : form.button("รับไอเทมจัดส่ง", "textures/ui/mute_on");
  form.button("รายการคำสั่งของฉัน", "textures/ui/sidebar_icons/my_content");
  form.button("งานจัดส่งที่พร้อมรับ", "textures/ui/FriendsDiversity");
  form.divider();
  activeJobId
    ? form.button("งานที่กำลังดำเนินการ", "textures/ui/Envelope")
    : form.button("ส่งมอบงาน", "textures/ui/how_to_play_button_default_light");
  form.label("                  @Sleeplite");

  showUI(player, form, (res) => {
    if (res.selection === 0) createJob(player);
    else if (res.selection === 1) receiveItems(player);
    else if (res.selection === 2) editJobs(player);
    else if (res.selection === 3) viewJobs(player);
    else if (res.selection === 4) completeJob(player);
  });
};
