import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  findPlayerById,
  getInvMap,
  jobs,
  ownerNotifyMap,
  pendingDelivery,
  playerJobMap,
  saveData,
  showUI,
  stopTimer,
  timerMap,
  totalDiamond,
} from "./Job";
import { showMainMenu } from "./Menu";

const checkJobItems = (inv, job) => {
  const invMap = getInvMap(inv);
  for (const item of job.items) {
    const have = invMap.get(item.id) ?? 0;
    if (have < item.amount)
      return `${item.id.replace("minecraft:", "")} (${have}/${item.amount})`;
  }
  return null;
};

const removeJobItems = (inv, job) => {
  for (const item of job.items) {
    let need = item.amount;
    for (let i = 0; i < inv.size && need > 0; i++) {
      const it = inv.getItem(i);
      if (!it || it.typeId !== item.id) continue;
      const take = Math.min(it.amount, need);
      it.amount -= take;
      need -= take;
      inv.setItem(i, it.amount <= 0 ? undefined : it);
    }
  }
};

const giveDiamond = (player, amount) => {
  const inv = player.getComponent("minecraft:inventory").container;
  let remaining = amount;
  for (let i = 0; i < inv.size && remaining > 0; i++) {
    const it = inv.getItem(i);
    if (!it || it.typeId !== "minecraft:diamond") continue;
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
    inv.setItem(i, new ItemStack("minecraft:diamond", size));
    remaining -= size;
  }
};

//  Owner notify helpers
const addOwnerNotify = (ownerId, jobId_) => {
  if (!ownerNotifyMap.has(ownerId)) ownerNotifyMap.set(ownerId, new Set());
  ownerNotifyMap.get(ownerId).add(jobId_);
};

// =========================================
// Complete Job
// =========================================
function completeJob(player) {
  const activeJobId = playerJobMap.get(player.id);
  if (activeJobId === undefined) {
    player.sendMessage("[Job] You have no active job");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  const job = jobs.find((j) => j.id === activeJobId);
  if (!job) {
    stopTimer(player.id);
    playerJobMap.delete(player.id);
    player.sendMessage("[Job] Job not found (may have been cancelled)");
    return;
  }

  const inv = player.getComponent("minecraft:inventory").container;
  const total = totalDiamond(job);
  const invMap = getInvMap(inv);

  // เวลาที่เหลือ
  const t = timerMap.get(player.id);
  let timeStr = "N/A";

  if (t) {
    const secs = Math.ceil(
      (20 * 60 * 20 - (system.currentTick - t.startTick)) / 20,
    );

    const m = Math.floor(secs / 60);
    const s = secs % 60;

    timeStr = `${m}:${String(s).padStart(2, "0")}`;
  }

  let body = `Job from: ${job.ownerName}
Reward: ${total} diamond
Time left: ${timeStr}

Items:
`;

  for (const item of job.items) {
    const have = invMap.get(item.id) ?? 0;
    const ok = have >= item.amount;

    body += `${ok ? "[OK] " : "[MISSING] "}${item.id.replace("minecraft:", "")}  ${have}/${item.amount} (${item.diamond} diamond)\n`;
  }

  const form = new ActionFormData();
  form.title("Active Job");
  form.body(body);
  form.button("Submit");
  form.button("Cancel Job");
  form.button("Back");

  showUI(player, form, (res) => {
    if (res.selection === 2) {
      showMainMenu(player);
      return;
    }

    // Cancel Job
    if (res.selection === 1) {
      const confirmForm = new ActionFormData();
      confirmForm.title("Cancel Delivery?");
      confirmForm.body(
        `Are you sure you want to cancel this delivery?\nThe order will return to the queue.\nYou will NOT receive any diamond.`,
      );
      confirmForm.button("Yes, Cancel"); // 0
      confirmForm.button("No, Keep"); // 1

      showUI(player, confirmForm, (r) => {
        if (r.selection === 1) {
          completeJob(player);
          return;
        }

        stopTimer(player.id);
        playerJobMap.delete(player.id);

        job.status = "open";
        job.takenBy = null;
        saveData();

        player.sendMessage(
          "[Job] You cancelled the delivery. It is back in the queue",
        );

        const owner = findPlayerById(job.owner);
        if (owner)
          owner.sendMessage(
            `[Job] ${player.name} cancelled the delivery. It is open again`,
          );
      });
      return;
    }

    // ── Submit ──────────────────────────────────────────────────────────────
    const inv2 = player.getComponent("minecraft:inventory").container;
    const missing = checkJobItems(inv2, job);
    if (missing) {
      player.sendMessage(`[Job] Missing: ${missing}`);
      return;
    }

    // ตัดของจาก rider
    removeJobItems(inv2, job);

    // ให้ diamond แก่ rider
    giveDiamond(player, total);

    // เก็บของไว้ใน pendingDelivery รอ owner มารับ
    const deliveryItems = job.items.map((it) => ({
      id: it.id,
      amount: it.amount,
    }));
    pendingDelivery.set(job.id, {
      ownerName: player.name,
      items: deliveryItems,
    });
    addOwnerNotify(job.owner, job.id);

    // หยุด timer
    stopTimer(player.id);
    playerJobMap.delete(player.id);

    job.status = "done";
    saveData();

    player.sendMessage(`[Job] Complete! Received ${total} diamond`);

    const owner = findPlayerById(job.owner);
    if (owner)
      owner.sendMessage(
        `[Job] ${player.name} completed your delivery! Open My Orders to receive your items`,
      );
  });
}

export { completeJob, giveDiamond };
