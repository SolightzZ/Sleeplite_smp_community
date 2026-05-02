import { ActionFormData } from "@minecraft/server-ui";
import { ItemStack } from "@minecraft/server";
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

// ให้ item จาก array [{id, amount}] เข้า inventory ของ player
const giveItems = (player, items) => {
  try {
    const inv = player.getComponent("minecraft:inventory").container;
    for (const item of items) {
      let remaining = item.amount;
      for (let i = 0; i < inv.size && remaining > 0; i++) {
        const it = inv.getItem(i);
        if (!it || it.typeId !== item.id) continue;
        const space = 64 - it.amount;
        if (space <= 0) continue;
        const add = Math.min(space, remaining);
        it.amount += add;
        remaining -= add;
        inv.setItem(i, it);
      }
      for (let i = 0; i < inv.size && remaining > 0; i++) {
        if (inv.getItem(i)) continue;
        const size = Math.min(64, remaining);
        inv.setItem(i, new ItemStack(item.id, size));
        remaining -= size;
      }
    }
  } catch (error) {
    console.error(" giveItems: " + error);
  }
};

// owner รับของที่ rider ส่งมา
function receiveItems(player) {
  try {
    const pendingIds = ownerNotifyMap.get(player.id);
    if (!pendingIds || pendingIds.size === 0) {
      player.sendMessage("[Job] ไม่มีไอเท็มให้รับ");
      form.button("Back");
      showUI(player, form, () => showMainMenu(player));
      return;
    }

    const allItems = [];
    for (const jid of pendingIds) {
      const delivery = pendingDelivery.get(jid);
      if (!delivery) continue;
      for (const item of delivery.items) allItems.push(item);
    }

    let body = "Items from completed jobs:\n\n";
    for (const item of allItems)
      body += `- ${item.id.replace("minecraft:", "")} x${item.amount}\n`;
    body += "\nPress Receive to collect all items.";

    const form = new ActionFormData();
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

      player.sendMessage(`[Job] Received ${allItems.length} item type(s)!`);
      showMainMenu(player);
    });
  } catch (error) {
    console.error("receiveItems: " + error);
  }
}

// Main Menu
const showMainMenu = (player) => {
  try {
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
  } catch (error) {
    console.error("showMainMenu: " + error);
  }
};

export { showMainMenu };
