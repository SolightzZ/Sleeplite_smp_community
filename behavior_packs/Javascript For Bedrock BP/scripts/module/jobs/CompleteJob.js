import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { diamondId, icons, sounds, stripPrefix } from './config.js';
import { buildInventoryMap, getPlayerById, JOB_DURATION_TICKS, jobs, ownerNotifyMap, pendingDelivery, playerJobMap, saveData, showUI, stopTimer, timerMap, totalDiamond } from './Job.js';
import { showMainMenu } from './Menu.js';

const checkJobItems = (inv, job) => {
   const invMap = buildInventoryMap(inv);

   for (const item of job.items) {
      const have = invMap.get(item.id) ?? 0;

       if (have < item.amount) return `${stripPrefix(item.id)} (${have}/${item.amount})`;
   }

   return null;
};

const removeJobItems = (inv, job) => {
   for (const item of job.items) {
      let need = item.amount;
      const invItems = cache.getContainerItems(inv);

      for (let slotIndex = 0; slotIndex < invItems.length && need > 0; slotIndex++) {
         const it = invItems[slotIndex];

         if (!it || it.typeId !== item.id) continue;
         const take = Math.min(it.amount, need);
         if (take >= it.amount) {
            need -= it.amount;
            inv.setItem(slotIndex, undefined);
         } else {
            it.amount -= take;
            need -= take;
            inv.setItem(slotIndex, it);
         }
      }
   }
};

export const giveDiamond = (player, amount) => {
   if (!pcheck(player)) return false;

   const inv = cache.getInventory(player);
   if (!inv) return false;

   const invItems = cache.getContainerItems(inv);
   const invSize = invItems.length;
   let freeSpace = 0;
   for (let i = 0; i < invSize; i++) {
      const it = invItems[i];

      if (!it) {
         freeSpace += 64;
      } else if (it.typeId === diamondId) {
         freeSpace += 64 - it.amount;
      }
   }

   if (freeSpace < amount) {
      cache.sendMessage(player, '§c[x] ช่องเก็บของไม่เพียงพอสำหรับรับของที่ได้ (ต้องการที่ว่าง ' + amount + ' ช่อง)');
      return false;
   }

   let remaining = amount;

   for (let i = 0; i < invSize && remaining > 0; i++) {
      const it = invItems[i];

      if (it && it.typeId === diamondId) {
         const space = 64 - it.amount;

         if (space <= 0) continue;
         const add = Math.min(space, remaining);
         it.amount += add;
         remaining -= add;
         inv.setItem(i, it);
      }
   }

   for (let i = 0; i < invSize && remaining > 0; i++) {
      if (invItems[i]) continue;

      const size = Math.min(64, remaining);
      inv.setItem(i, cache.createItemStack(diamondId, size));
      remaining -= size;
   }
   return true;
};

const addOwnerNotify = (ownerId, jobId_) => {
   if (!ownerNotifyMap.has(ownerId)) ownerNotifyMap.set(ownerId, new Set());
   ownerNotifyMap.get(ownerId).add(jobId_);
};

export function completeJob(player) {
   if (!pcheck(player)) return;

   const activeJobId = playerJobMap.get(player.id);

   if (activeJobId === undefined) {
          cache.playSound(player, sounds.fizz);
      cache.sendMessage(player, '[Job] ไม่มีงานที่กำลังดำเนินการอยู่');
      showMainMenu(player);
      return;
   }

   let job = null;

   for (const currentJob of jobs) {
      if (currentJob.id === activeJobId) {
         job = currentJob;
         break;
      }
   }

   if (!job) {
      stopTimer(player.id);
      playerJobMap.delete(player.id);
      cache.sendMessage(player, '[Job] ไม่มีงานที่กำลังดำเนินการอยู่');
      return;
   }

   const inv = cache.getInventory(player);
   if (!inv) return;
   const total = totalDiamond(job);
   const invMap = buildInventoryMap(inv);

   const t = timerMap.get(player.id);
   let timeStr = 'N/A';

   if (t) {
      const secs = Math.ceil((JOB_DURATION_TICKS - (system.currentTick - t.startTick)) / 20);

      const m = Math.floor(secs / 60);
      const s = secs % 60;

      timeStr = `${m}:${String(s).padStart(2, '0')}`;
   }

   let body = `ผู้ว่าจ้าง: ${job.ownerName}\nของที่ได้: ${total} เพชร\nเวลาที่เหลือ: ${timeStr}\n\nไอเทมที่ต้องการ:\n`;

   for (const item of job.items) {
      const have = invMap.get(item.id) ?? 0;
      const ok = have >= item.amount;

       body += `${ok ? '[ครบ] ' : '[ขาด] '}${stripPrefix(item.id)} ${have}/${item.amount} (ของที่ได้ ${item.diamond} เพชร)\n`;
   }

   showActiveJobForm(player, job, body, total);
}

function showActiveJobForm(player, job, body, total) {
   if (!pcheck(player)) return;

   const form = new ActionFormData();
   form.title('งานที่กำลังดำเนินการ');
   form.body(body);
    form.button('ส่งงาน', icons.confirm);
    form.button('ยกเลิกงาน', icons.cancel);
   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
       if (res.selection === 2) {
          cache.playSound(player, sounds.orb);
          showMainMenu(player);
          return;
       }

      if (res.selection === 1) {
          cache.playSound(player, sounds.vaultDeactivate);
         showCancelConfirmForm(player, job);
         return;
      }

      if (!pcheck(player)) return;

      const inv = cache.getInventory(player);
      if (!inv) return;
      const missing = checkJobItems(inv, job);

       if (missing) {
          cache.playSound(player, sounds.fizz);
          cache.sendMessage(player, `[Job] รายการที่ยังไม่ครบ: ${missing}`);
         return;
      }

      if (!giveDiamond(player, total)) {
         return;
      }

      removeJobItems(inv, job);

      const deliveryItems = [];
      for (const item of job.items) {
         deliveryItems.push({ id: item.id, amount: item.amount });
      }

      pendingDelivery.set(job.id, {
         ownerName: job.ownerName,
         items: deliveryItems,
      });

      addOwnerNotify(job.owner, job.id);

      stopTimer(player.id);
      playerJobMap.delete(player.id);

      job.status = 'done';
      saveData();

       cache.playSound(player, sounds.fireworkTwinkle);
      cache.sendMessage(player, `[Job] งานเสร็จสมบูรณ์ ได้รับ ${total} เพชร`);

      const owner = getPlayerById(job.owner);
      if (pcheck(owner)) {
         cache.sendMessage(owner, `[Job] ${player.name} จัดส่งงานของคุณเรียบร้อยแล้ว! ไปที่ “รับไอเทมจัดส่ง” เพื่อรับไอเท็มของคุณ`);
      }
   });
}

function showCancelConfirmForm(player, job) {
   if (!pcheck(player)) return;

   const form = new ActionFormData();
   form.title('ต้องการยกเลิกการจัดส่งหรือไม่?');
   form.body('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจัดส่งนี้?\n' + 'คำสั่งซื้อจะถูกส่งกลับไปยัง “งานจัดส่งที่พร้อมรับ”\n');

    form.button('ใช่, ยกเลิกเลย', icons.cancel);
    form.button('ไม่, ทำงานต่อ', icons.confirm);

    showUI(player, form, (res) => {
       if (res.selection === 1) {
          cache.playSound(player, sounds.orb);
         completeJob(player);
         return;
      }

      stopTimer(player.id);
      playerJobMap.delete(player.id);

      job.status = 'open';
      job.takenBy = null;
      saveData();

      if (pcheck(player)) {
         cache.sendMessage(player, '[Job] คุณได้ยกเลิกการจัดส่งเรียบร้อยแล้ว งานถูกนำกลับเข้าสู่ “งานจัดส่งที่พร้อมรับ” อีกครั้ง');
      }

      const owner = getPlayerById(job.owner);
      if (pcheck(owner)) {
         cache.sendMessage(owner, `[Job] ${player.name} คุณได้ยกเลิกการจัดส่งแล้ว งานถูกส่งกลับไปยัง “งานจัดส่งที่พร้อมรับ”`);
      }
   });
}
