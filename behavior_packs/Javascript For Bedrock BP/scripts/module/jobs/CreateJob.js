import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { diamondId, getIconForItem, icons, maxDiamondReward, maxItemAmount, maxJobItems, maxPlayerJobs, sounds, stripPrefix } from './config.js';
import { amountMap, buildInventoryMap, countItem, createJobData, jobs, selectedMap, showUI } from './Job.js';
import { showMainMenu } from './Menu.js';

const getIcon = (typeId) => getIconForItem(typeId);

const formatName = (id) => {
   const parts = id.split(':');

   return (parts.length > 1 ? parts[1] : id).replace(/_/g, ' ');
};

const searchBlock = (player) => {
   if (!pcheck(player)) return;

   const inv = cache.getInventory(player);
   if (!inv) return;

   const invMap = buildInventoryMap(inv);

       if (invMap.size === 0) {
          cache.playSound(player, sounds.fizz);
          cache.sendMessage(player, '[Job] ไม่พบไอเท็มในคลัง');
      createJob(player);
      return;
   }

   const selectedList = selectedMap.get(player.id) ?? [];

   const found = Array.from(invMap.keys())
      .sort((a, b) => formatName(a).localeCompare(formatName(b)))
      .slice(0, 50);

   const form = new ActionFormData();
    form.title(`เลือกไอเทม (${selectedList.length}/${maxJobItems})`);
   form.button('ย้อนกลับ');

   const foundLen = found.length;

   for (let i = 0; i < foundLen; i++) {
      const id = found[i];
      let count = 0;
      const selLen = selectedList.length;

      for (let j = 0; j < selLen; j++) {
         if (selectedList[j] === id) count++;
      }

       form.button(`${count > 0 ? `§9[${count}] ` : ''}${stripPrefix(id)}`, getIcon(id));
   }

   showUI(player, form, (res) => {
      if (res.selection === 0) {
          cache.playSound(player, sounds.chestClosed);
         createJob(player);
         return;
      }

      const chosen = found[res.selection - 1];
      if (!chosen) return;

      const list = [];
      const slen = selectedList.length;

      for (let i = 0; i < slen; i++) list.push(selectedList[i]);

       if (list.length >= maxJobItems) {
          cache.playSound(player, sounds.falsePermissions);
          if (pcheck(player)) cache.sendMessage(player, `[Job] เลือกได้สูงสุด ${maxJobItems} ไอเท็ม`);
         searchBlock(player);
         return;
      }

       if ((invMap.get(chosen) ?? 0) === 0) {
          cache.playSound(player, sounds.fizz);
          if (pcheck(player)) cache.sendMessage(player, '[Job] คุณไม่มีไอเท็มนี้');
         searchBlock(player);
         return;
      }

      let isDuplicate = false;
      for (let i = 0; i < slen; i++) {
         if (list[i] === chosen) {
            isDuplicate = true;
            break;
         }
      }

       if (isDuplicate) {
          cache.playSound(player, sounds.fizz);
          if (pcheck(player)) cache.sendMessage(player, '[Job] คุณได้เลือกไอเท็มนี้ไปแล้ว');
         searchBlock(player);
         return;
      }

      list.push(chosen);

      selectedMap.set(player.id, list);
      searchBlock(player);
   });
};

export function createJob(player) {
   if (!pcheck(player)) return;

   const activeJobs = [];
   const jLen = jobs.length;

   for (let i = 0; i < jLen; i++) {
      if (jobs[i].owner === player.id) activeJobs.push(jobs[i]);
   }

    if (activeJobs.length >= maxPlayerJobs) {
       cache.playSound(player, sounds.falsePermissions);
       cache.sendMessage(player, `[Job] จำนวนงานสูงสุดที่สร้างได้คือ ${maxPlayerJobs} งาน`);
      showMainMenu(player);
      return;
   }

   const selected = selectedMap.get(player.id) ?? [];
   const itemCount = selected.length === 0 ? 1 : selected.length;

   const form = new ActionFormData();
   form.title('สร้างคำสั่งจัดส่ง');
   form.body('กดที่ไอเทมเพื่อนำออก  |  กดค้นหาเพื่อเพิ่มไอเทม');
   form.button('ค้นหาไอเทม');

    if (selected.length === 0) {
       form.label(`เลือกแล้ว (0/${maxJobItems})`);
       form.button('ยังไม่ได้เลือกไอเท็ม', icons.none);
    } else {
       form.label(`เลือกแล้ว (${selected.length}/${maxJobItems})  กดเพื่อนำออก`);
       const sLen = selected.length;

       for (let i = 0; i < sLen; i++) {
           form.button(stripPrefix(selected[i]), getIcon(selected[i]));
        }
    }

    const nextIndex = 1 + itemCount;
   const backIndex = nextIndex + 1;
   form.button('ถัดไป > กำหนดจำนวน');
   form.divider();
   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
      if (!pcheck(player)) return;
      if (res.selection === 0) {
          cache.playSound(player, sounds.chestOpen);
         searchBlock(player);
      } else if (res.selection === nextIndex) {
         if (selected.length === 0) {
             cache.playSound(player, sounds.fizz);
            cache.sendMessage(player, '[Job] กรุณาเลือกอย่างน้อย 1 ไอเท็ม');
            createJob(player);
            return;
         }
         const inv = cache.getInventory(player);
         if (!inv) return;
         const invMap = buildInventoryMap(inv);

         let missing = null;
         const sLen2 = selected.length;
         for (let i = 0; i < sLen2; i++) {
            if ((invMap.get(selected[i]) ?? 0) === 0) {
               missing = selected[i];
               break;
            }
         }

          if (missing) {
             cache.playSound(player, sounds.fizz);
             cache.sendMessage(player, `[Job] ไม่พบไอเท็มในคลังแล้ว: ${stripPrefix(missing)}`);

            const filtered = [];
            for (let i = 0; i < sLen2; i++) {
               if (selected[i] !== missing) filtered.push(selected[i]);
            }
            selectedMap.set(player.id, filtered);
            createJob(player);
            return;
         }

         cache.playSound(player, sounds.stonecutterResult);
         openAmountForm(player);
      } else if (res.selection === backIndex) {
         selectedMap.delete(player.id);
         amountMap.delete(player.id);
          cache.playSound(player, sounds.barrelClose);
         showMainMenu(player);
      } else if (res.selection >= 1 && res.selection < nextIndex) {
         const filtered = [];
         const removeIdx = res.selection - 1;
         const sLen3 = selected.length;

         for (let i = 0; i < sLen3; i++) {
            if (i !== removeIdx) filtered.push(selected[i]);
         }

         selectedMap.set(player.id, filtered);
         createJob(player);
      }
   });
}

const openAmountForm = (player) => {
   if (!pcheck(player)) return;

   const selected = selectedMap.get(player.id) ?? [];
   if (selected.length === 0) {
      createJob(player);
      return;
   }

   const currentAmounts = amountMap.get(player.id) ?? [];
   const modal = new ModalFormData();
   modal.title('กำหนดจำนวน');

   const sLen = selected.length;
   for (let i = 0; i < sLen; i++) {
      const id = selected[i];
       const displayName = stripPrefix(id);
      const current = currentAmounts[i] ?? {};

       modal.textField(`${displayName} จำนวนไอเทมที่ต้องการ (1-${maxItemAmount})`, 'ระบุจำนวน...', { defaultValue: String(current.amount ?? 1) });

       modal.slider(`Diamond จำนวนเพชรที่ต้องการ  (1-${maxDiamondReward})`, 1, maxDiamondReward, {
         valueStep: 1,
         defaultValue: current.diamond ?? 1,
      });
   }

   modal.submitButton('ถัดไป > ยืนยัน');

   showUI(player, modal, (res) => {
      const values = res.formValues ?? [];
      const newAmounts = [];
      let idx = 0;

      const len = selected.length;
      for (let i = 0; i < len; i++) {
         let amount = parseInt(values[idx++]);
         let diamond = values[idx++];

         if (!Number.isFinite(amount) || amount < 1) amount = 1;
          if (amount > maxItemAmount) amount = maxItemAmount;
          if (!Number.isFinite(diamond) || diamond < 1) diamond = 1;
          if (diamond > maxDiamondReward) diamond = maxDiamondReward;

         newAmounts.push({ amount, diamond });
      }

       amountMap.set(player.id, newAmounts);
       cache.playSound(player, sounds.stonecutterResult);
       openConfirmForm(player);
   });
};

const openConfirmForm = (player) => {
   if (!pcheck(player)) return;
   const selected = selectedMap.get(player.id) ?? [];
   const amounts = amountMap.get(player.id) ?? [];

   let total = 0;
   let body = 'ยืนยันคำสั่งจัดส่ง:\n\n';

   const sLen = selected.length;
   for (let i = 0; i < sLen; i++) {
      const id = selected[i];
      const data = amounts[i] ?? {};
      const amount = data.amount ?? 1;
      const diamond = data.diamond ?? 1;
      total += diamond;
       body += `- ${stripPrefix(id)} จำนวน ${amount} ชิ้น (ของที่ได้รับ ${diamond} เพชร)\n`;
   }

   const inv = cache.getInventory(player);
   if (!inv) return;
   const haveDiam = countItem(inv, diamondId);
   body += `\nของที่ได้รับทั้งหมด: ${total} เพชร`;
   body += `\nเพชรของคุณ: ${haveDiam} / ${total}`;

   const form = new ActionFormData();
   form.title('ยืนยันคำสั่งจัดส่ง');
   form.body(body);
    form.button('ยืนยันคำสั่ง', icons.confirm);
    form.button('ย้อนกลับ (แก้ไข)', icons.debug);
    form.button('ยกเลิก', icons.cancel);

   showUI(player, form, (res) => {
      if (!pcheck(player)) return;
      if (res.selection === 1) {
          cache.playSound(player, sounds.orb);
         openAmountForm(player);
         return;
      }
      if (res.selection === 2) {
         selectedMap.delete(player.id);
         amountMap.delete(player.id);
          cache.playSound(player, sounds.vaultDeactivate);
          showMainMenu(player);
          return;
       }

       const inv2 = cache.getInventory(player);
       if (!inv2) return;
       const haveDiam2 = countItem(inv2, diamondId);

       if (haveDiam2 < total) {
          cache.playSound(player, sounds.falsePermissions);
          const warnForm = new ActionFormData();
          warnForm.title('เพชรไม่เพียงพอ');
          warnForm.body(`ต้องการ: ${total} เพชร\n` + `มีอยู่: ${haveDiam2} เพชร\n` + `ขาดอีก: ${total - haveDiam2} เพชร`);

          warnForm.button('ย้อนกลับ (แก้ไขของที่ได้รับ)', icons.debug);

          warnForm.button('ยกเลิกคำสั่ง', icons.cancel);
          showUI(player, warnForm, (r) => {
             if (r.selection === 0) openAmountForm(player);
             else {
                selectedMap.delete(player.id);
                amountMap.delete(player.id);
                cache.playSound(player, sounds.vaultDeactivate);
               showMainMenu(player);
            }
         });
         return;
      }

      let need = total;
      const invItems = cache.getContainerItems(inv2);
      for (let i = 0; i < invItems.length && need > 0; i++) {
         const it = invItems[i];
         if (!it || it.typeId !== diamondId) continue;
         const take = Math.min(it.amount, need);
         if (take >= it.amount) {
            need -= it.amount;
            inv2.setItem(i, undefined);
         } else {
            it.amount -= take;
            need -= take;
            inv2.setItem(i, it);
         }
      }

      const mapItems = [];
      for (let i = 0; i < sLen; i++) {
         const data = amounts[i] ?? {};
         mapItems.push({
            id: selected[i],
            amount: data.amount ?? 1,
            diamond: data.diamond ?? 1,
         });
      }

      createJobData({
         owner: player.id,
         ownerName: player.name,
         items: mapItems,
         status: 'open',
         takenBy: null,
      });
      selectedMap.delete(player.id);
      amountMap.delete(player.id);

       cache.playSound(player, sounds.anvilUse);
      cache.sendMessage(player, `[Job] สร้างคำสั่งจัดส่งสำเร็จแล้ว ระบบได้หัก ${total} เพชร`);
   });
};
