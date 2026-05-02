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
  try {
    const invMap = getInvMap(inv);
    for (const item of job.items) {
      const have = invMap.get(item.id) ?? 0;
      if (have < item.amount)
        return `${item.id.replace("minecraft:", "")} (${have}/${item.amount})`;
    }
    return null;
  } catch (error) {
    console.error(" checkJobItems: " + error);
  }
};

const removeJobItems = (inv, job) => {
  try {
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
  } catch (error) {
    console.error(" removeJobItems: " + error);
  }
};

const giveDiamond = (player, amount) => {
  try {
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
  } catch (error) {
    console.error(" giveDiamond: " + error);
  }
};

const addOwnerNotify = (ownerId, jobId_) => {
  try {
    if (!ownerNotifyMap.has(ownerId)) ownerNotifyMap.set(ownerId, new Set());
    ownerNotifyMap.get(ownerId).add(jobId_);
  } catch (error) {
    console.error(" addOwnerNotify: " + error);
  }
};

// =========================================
// Complete Job
// =========================================
function completeJob(player) {
  try {
    const activeJobId = playerJobMap.get(player.id);
    if (activeJobId === undefined) {
      player.sendMessage("[Job] คุณไม่มีงานที่กำลังทำอยู่");
      form.button("Back");
      showUI(player, form, () => showMainMenu(player));
      return;
    }

    const job = jobs.find((j) => j.id === activeJobId);
    if (!job) {
      stopTimer(player.id);
      playerJobMap.delete(player.id);
      player.sendMessage("[Job] ไม่พบงาน");
      return;
    }

    const inv = player.getComponent("minecraft:inventory").container;
    const total = totalDiamond(job);
    const invMap = getInvMap(inv);

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

    let body = `Job from: ${job.ownerName}\nReward: ${total} diamond\nTime left: ${timeStr}\n\nItems: `;
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

      if (res.selection === 1) {
        const confirmForm = new ActionFormData();
        confirmForm.title("Cancel Delivery?");
        confirmForm.body(
          `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจัดส่งนี้?\nคำสั่งซื้อจะถูกส่งกลับไปยังคิว\nคุณจะ ไม่ได้รับเพชรใดๆ`,
        );
        confirmForm.button("Yes, Cancel");
        confirmForm.button("No, Keep");

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
              `[Job] ${player.name} คุณได้ยกเลิกการจัดส่งแล้ว งานถูกส่งกลับไปยังคิว`,
            );
        });
        return;
      }

      const inv2 = player.getComponent("minecraft:inventory").container;
      const missing = checkJobItems(inv2, job);
      if (missing) {
        player.sendMessage(`[Job] รายการที่ยังไม่ครบ: ${missing}`);
        return;
      }

      // ลบ item
      removeJobItems(inv2, job);

      // ให้เพชร
      giveDiamond(player, total);

      // ส่ง item ไป ให้ owner
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

      player.sendMessage(`[Job] งานเสร็จสมบูรณ์ ได้รับ ${total} เพชร`);

      const owner = findPlayerById(job.owner);
      if (owner)
        owner.sendMessage(
          `[Job] ${player.name} จัดส่งงานของคุณเรียบร้อยแล้ว! ไปที่ “My Orders” เพื่อรับไอเท็มของคุณ`,
        );
    });
  } catch (error) {
    console.error("[Job] completeJob: " + error);
  }
}

export { completeJob, giveDiamond };
