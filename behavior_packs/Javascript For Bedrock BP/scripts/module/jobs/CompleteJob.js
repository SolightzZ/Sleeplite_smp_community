import { ItemStack, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  getPlayerById,
  buildInventoryMap,
  jobs,
  ownerNotifyMap,
  pendingDelivery,
  playerJobMap,
  saveData,
  showUI,
  stopTimer,
  timerMap,
  totalDiamond,
} from "./Job.js";
import { showMainMenu } from "./Menu.js";

export const checkJobItems = (inv, job) => {
  const invMap = buildInventoryMap(inv);
  const len = job.items.length;

  for (let i = 0; i < len; i++) {
    const item = job.items[i];
    const have = invMap.get(item.id) ?? 0;

    if (have < item.amount)
      return `${item.id.replace("minecraft:", "")} (${have}/${item.amount})`;
  }

  return null;
};

export const removeJobItems = (inv, job) => {
  const len = job.items.length;

  for (let idx = 0; idx < len; idx++) {
    const item = job.items[idx];
    let need = item.amount;
    const invSize = inv.size;

    for (let i = 0; i < invSize && need > 0; i++) {
      const it = inv.getItem(i);

      if (!it || it.typeId !== item.id) continue;
      const take = Math.min(it.amount, need);
      if (take >= it.amount) {
        need -= it.amount;
        inv.setItem(i, undefined);
      } else {
        it.amount -= take;
        need -= take;
        inv.setItem(i, it);
      }
    }
  }
};

export const giveDiamond = (player, amount) => {
  if (!player.isValid) return false;

  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;

  const invSize = inv.size;
  let freeSpace = 0;
  for (let i = 0; i < invSize; i++) {
    const it = inv.getItem(i);

    if (!it) {
      freeSpace += 64;
    } else if (it.typeId === "minecraft:diamond") {
      freeSpace += 64 - it.amount;
    }
  }

  if (freeSpace < amount) {
    player.sendMessage(
      "§c[x] ช่องเก็บของไม่เพียงพอสำหรับรับของที่ได้ (ต้องการที่ว่าง " +
        amount +
        " ช่อง)",
    );
    return false;
  }

  let remaining = amount;

  for (let i = 0; i < invSize && remaining > 0; i++) {
    const it = inv.getItem(i);

    if (it && it.typeId === "minecraft:diamond") {
      const space = 64 - it.amount;

      if (space <= 0) continue;
      const add = Math.min(space, remaining);
      it.amount += add;
      remaining -= add;
      inv.setItem(i, it);
    }
  }

  for (let i = 0; i < invSize && remaining > 0; i++) {
    if (inv.getItem(i)) continue;

    const size = Math.min(64, remaining);
    inv.setItem(i, new ItemStack("minecraft:diamond", size));
    remaining -= size;
  }
  return true;
};

export const addOwnerNotify = (ownerId, jobId_) => {
  if (!ownerNotifyMap.has(ownerId)) ownerNotifyMap.set(ownerId, new Set());
  ownerNotifyMap.get(ownerId).add(jobId_);
};

export function completeJob(player) {
  if (!player.isValid) return;

  const activeJobId = playerJobMap.get(player.id);

  if (activeJobId === undefined) {
    player.sendMessage("[Job] ไม่มีงานที่กำลังดำเนินการอยู่");
    showMainMenu(player);
    return;
  }

  let job = null;
  const len = jobs.length;

  for (let i = 0; i < len; i++) {
    if (jobs[i].id === activeJobId) {
      job = jobs[i];
      break;
    }
  }

  if (!job) {
    stopTimer(player.id);
    playerJobMap.delete(player.id);
    player.sendMessage("[Job] ไม่มีงานที่กำลังดำเนินการอยู่");
    return;
  }

  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;
  const total = totalDiamond(job);
  const invMap = buildInventoryMap(inv);

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

  let body = `ผู้ว่าจ้าง: ${job.ownerName}\nของที่ได้: ${total} เพชร\nเวลาที่เหลือ: ${timeStr}\n\nไอเทมที่ต้องการ:\n`;

  const itemsLen = job.items.length;

  for (let i = 0; i < itemsLen; i++) {
    const item = job.items[i];
    const have = invMap.get(item.id) ?? 0;
    const ok = have >= item.amount;

    body += `${ok ? "[ครบ] " : "[ขาด] "}${item.id.replace(
      "minecraft:",
      "",
    )} ${have}/${item.amount} (ของที่ได้ ${item.diamond} เพชร)\n`;
  }

  showActiveJobForm(player, job, body, total);
}

export function showActiveJobForm(player, job, body, total) {
  if (!player.isValid) return;

  const form = new ActionFormData();
  form.title("งานที่กำลังดำเนินการ");
  form.body(body);
  form.button("ส่งงาน", "textures/ui/confirm");
  form.button("ยกเลิกงาน", "textures/ui/cancel");
  form.button("ย้อนกลับ");

  showUI(player, form, (res) => {
    if (res.selection === 2) {
      showMainMenu(player);
      return;
    }

    if (res.selection === 1) {
      showCancelConfirmForm(player, job);
      return;
    }

    if (!player.isValid) return;

    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return;
    const missing = checkJobItems(inv, job);

    if (missing) {
      player.sendMessage(`[Job] รายการที่ยังไม่ครบ: ${missing}`);
      return;
    }

    if (!giveDiamond(player, total)) {
      return;
    }

    removeJobItems(inv, job);

    const deliveryItems = [];
    const itemsLen = job.items.length;
    for (let i = 0; i < itemsLen; i++) {
      deliveryItems.push({ id: job.items[i].id, amount: job.items[i].amount });
    }

    pendingDelivery.set(job.id, {
      ownerName: job.ownerName,
      items: deliveryItems,
    });

    addOwnerNotify(job.owner, job.id);

    stopTimer(player.id);
    playerJobMap.delete(player.id);

    job.status = "done";
    saveData();

    player.sendMessage(`[Job] งานเสร็จสมบูรณ์ ได้รับ ${total} เพชร`);

    const owner = getPlayerById(job.owner);
    if (owner && owner.isValid) {
      owner.sendMessage(
        `[Job] ${player.name} จัดส่งงานของคุณเรียบร้อยแล้ว! ไปที่ “รับไอเทมจัดส่ง” เพื่อรับไอเท็มของคุณ`,
      );
    }
  });
}

export function showCancelConfirmForm(player, job) {
  if (!player.isValid) return;

  const form = new ActionFormData();
  form.title("ต้องการยกเลิกการจัดส่งหรือไม่?");
  form.body(
    "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจัดส่งนี้?\n" +
      "คำสั่งซื้อจะถูกส่งกลับไปยัง “งานจัดส่งที่พร้อมรับ”\n",
  );

  form.button("ใช่, ยกเลิกเลย", "textures/ui/cancel");
  form.button("ไม่, ทำงานต่อ", "textures/ui/confirm");

  showUI(player, form, (res) => {
    if (res.selection === 1) {
      completeJob(player);
      return;
    }

    stopTimer(player.id);
    playerJobMap.delete(player.id);

    job.status = "open";
    job.takenBy = null;
    saveData();

    if (player.isValid) {
      player.sendMessage(
        "[Job] คุณได้ยกเลิกการจัดส่งเรียบร้อยแล้ว งานถูกนำกลับเข้าสู่ “งานจัดส่งที่พร้อมรับ” อีกครั้ง",
      );
    }

    const owner = getPlayerById(job.owner);
    if (owner && owner.isValid) {
      owner.sendMessage(
        `[Job] ${player.name} คุณได้ยกเลิกการจัดส่งแล้ว งานถูกส่งกลับไปยัง “งานจัดส่งที่พร้อมรับ”`,
      );
    }
  });
}
