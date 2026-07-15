import { ActionFormData } from '@minecraft/server-ui';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { icons, sounds, stripPrefix } from './config.js';
import { completeJob } from './CompleteJob.js';
import { createJob } from './CreateJob.js';
import { editJobs } from './EditJob.js';
import { deleteJobData, hasOwnerNotify, ownerNotifyMap, pendingDelivery, playerJobMap, saveData, showUI } from './Job.js';
import { viewJobs } from './ViewJob.js';

const giveItems = (player, items) => {
   if (!pcheck(player)) return;

   const inv = cache.getInventory(player);
   if (!inv) return;

   const dim = player.dimension;
   const loc = player.location;

   const invItems = cache.getContainerItems(inv);
   const itemsLen = items.length;
   for (let i = 0; i < itemsLen; i++) {
      const item = items[i];
      let remaining = item.amount;
      const typeId = item.id;

      for (let j = 0; j < invItems.length && remaining > 0; j++) {
         const it = invItems[j];
         if (!it || it.typeId !== typeId) continue;

         const space = it.maxAmount - it.amount;
         if (space <= 0) continue;

         const add = Math.min(space, remaining);
         it.amount += add;
         remaining -= add;
         inv.setItem(j, it);
      }

      for (let j = 0; j < invItems.length && remaining > 0; j++) {
         if (invItems[j]) continue;

         const newItem = cache.createItemStack(typeId, 1);
         const size = Math.min(newItem.maxAmount, remaining);
         newItem.amount = size;
         inv.setItem(j, newItem);
         remaining -= size;
      }

      while (remaining > 0) {
         const newItem = cache.createItemStack(typeId, 1);
         const size = Math.min(newItem.maxAmount, remaining);
         newItem.amount = size;
         dim.spawnItem(newItem, loc);
         remaining -= size;
      }
   }
};

function receiveItems(player) {
   if (!pcheck(player)) return;

   const pendingIds = ownerNotifyMap.get(player.id);

   if (!pendingIds || pendingIds.size === 0) {
      cache.sendMessage(player, '[Job] ไม่มีไอเท็มให้รับ');
      const form = new ActionFormData();
      form.title('รับไอเทม');
      form.body('ไม่มีไอเทมให้รับในขณะนี้');
      form.button('ย้อนกลับ');
      showUI(player, form, () => {
          cache.playSound(player, sounds.barrelClose);
          showMainMenu(player);
       });
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

   let body = 'ไอเทมจากงานที่เสร็จสิ้นแล้ว:\n\n';
   const allItemsLen = allItems.length;

   for (let i = 0; i < allItemsLen; i++) {
      const item = allItems[i];
       body += `- ${stripPrefix(item.id)} x${item.amount}\n`;
   }
   body += '\nกดรับเพื่อรวบรวมไอเทมทั้งหมด';

   form.title('รับไอเทม');
   form.body(body);
    form.button('รับทั้งหมด', icons.gift);
    form.button('ย้อนกลับ');

    showUI(player, form, (res) => {
       if (res.selection === 1) {
          cache.playSound(player, sounds.barrelClose);
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

       cache.playSound(player, sounds.anvilUse);
      if (pcheck(player)) cache.sendMessage(player, `[Job] ได้รับไอเทม ${allItems.length} เรียบร้อยแล้ว`);
      showMainMenu(player);
   });
}

export const showMainMenu = (player) => {
   if (!pcheck(player)) return;

    cache.playSound(player, sounds.villagerIdle);

   const hasPending = hasOwnerNotify(player.id);
   const activeJobId = playerJobMap.get(player.id);

   const form = new ActionFormData();
   form.title('Job Delivery | ระบบจัดส่งงาน');
   form.body('                 เลือกรายการที่ต้องการ:');
   form.divider();
    form.button('สร้างคำสั่งจัดส่ง', icons.mashup);
    form.divider();
    hasPending ? form.button('§e[!] §rรับไอเทมจัดส่ง', icons.muteOff) : form.button('รับไอเทมจัดส่ง', icons.muteOn);
    form.button('รายการคำสั่งของฉัน', icons.myContent);
    form.button('งานจัดส่งที่พร้อมรับ', icons.friends);
    form.divider();
    activeJobId ? form.button('งานที่กำลังดำเนินการ', icons.envelope) : form.button('ส่งมอบงาน', icons.howToPlay);
    form.label('                  @Sleeplite 2026');

    showUI(player, form, (res) => {
       if (res.selection === 0) {
          cache.playSound(player, sounds.barrelOpen);
          createJob(player);
       } else if (res.selection === 1) {
          cache.playSound(player, sounds.ejectItem);
          receiveItems(player);
       } else if (res.selection === 2) {
          cache.playSound(player, sounds.bookPageTurn);
          editJobs(player);
       } else if (res.selection === 3) {
          cache.playSound(player, sounds.bookPageTurn);
          viewJobs(player);
       } else if (res.selection === 4) {
          cache.playSound(player, sounds.orb);
          completeJob(player);
       }
    });
};
