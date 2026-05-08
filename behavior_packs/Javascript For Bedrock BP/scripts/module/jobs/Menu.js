import { ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { completeJob } from "./CompleteJob";
import { createJob } from "./CreateJob";
import { editJobs } from "./EditJob";
import {
  deleteJobData,
  hasOwnerNotify,
  ownerNotifyMap,
  pendingDelivery,
  playerJobMap,
  saveData,
  showUI,
} from "./Job";
import { viewJobs } from "./ViewJob";

export const giveItems = (player, items) => {
  if (!player.isValid) return;
  const inv = player.getComponent("minecraft:inventory").container;
  const itemsLen = items.length;
  for (let i = 0; i < itemsLen; i++) {
    const item = items[i];
    let remaining = item.amount;
    for (let j = 0; j < inv.size && remaining > 0; j++) {
      const it = inv.getItem(j);
      if (!it || it.typeId !== item.id) continue;
      const space = 64 - it.amount;
      if (space <= 0) continue;
      const add = Math.min(space, remaining);
      it.amount += add;
      remaining -= add;
      inv.setItem(j, it);
    }
    for (let j = 0; j < inv.size && remaining > 0; j++) {
      if (inv.getItem(j)) continue;
      const size = Math.min(64, remaining);
      inv.setItem(j, new ItemStack(item.id, size));
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
    form.title("Receive Items");
    form.body("No items to receive.");
    form.button("Back");
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

  let body = "Items from completed jobs:\n\n";
  const allItemsLen = allItems.length;
  for (let i = 0; i < allItemsLen; i++) {
    const item = allItems[i];
    body += `- ${item.id.replace("minecraft:", "")} x${item.amount}\n`;
  }
  body += "\nPress Receive to collect all items.";

  form.title("Receive Items");
  form.body(body);
  form.button("Receive All");
  form.button("Back");

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

    if (player.isValid) player.sendMessage(`[Job] Received ${allItems.length} item type(s)!`);
    showMainMenu(player);
  });
}

export const showMainMenu = (player) => {
  if (!player.isValid) return;

  const hasPending = hasOwnerNotify(player.id);
  const activeJobId = playerJobMap.get(player.id);

  const form = new ActionFormData();
  form.title("Job Delivery System");
  form.button("Request Delivery");
  hasPending
    ? form.button("§e[!] §rClaim Deliveries")
    : form.button("Claim Deliveries");
  form.button("My Orders");
  form.button("Available Deliveries");
  activeJobId
    ? form.button("Current Delivery")
    : form.button("Complete Delivery");
  form.label("                  @Sleeplite");

  showUI(player, form, (res) => {
    if (res.selection === 0) createJob(player);
    else if (res.selection === 1) receiveItems(player);
    else if (res.selection === 2) editJobs(player);
    else if (res.selection === 3) viewJobs(player);
    else if (res.selection === 4) completeJob(player);
  });
};
