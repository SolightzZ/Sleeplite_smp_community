import { Registry } from '../../../events/registry.js';
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui';
import { PREDEFINED_RANKS } from '../constants/constants.js';
import { refreshNameTag } from '../core/nametag.js';
import {
   addRank,
   getActiveRank,
   getAllServerRanks,
   getOwnedRanks,
   removeRanks,
   renameRank,
   setActiveRank,
} from '../core/tagManager.js';
import { isValidPlayer } from '../utils/player.js';
import { addSound } from '../../../plugin/utils.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';

const getPredefinedRankList = () => {
   const entries = Object.entries(PREDEFINED_RANKS);
   return entries.map(([key, icon]) => ({
      key,
      label: `${icon} ${key}`,
      full: icon,
   }));
};

const showMenuAdd = (admin, target) => {
   if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

   cache.playSound(admin, 'block.smithing_table.use');

   const predefined = getPredefinedRankList();
   const predefinedLabels = predefined.map((p) => p.label);
   const existingRanks = getAllServerRanks();
   const existingList = existingRanks.length ? existingRanks : ['(ไม่มี)'];

   const form = new ModalFormData();
   form.title('เพิ่ม / เปลี่ยนยศ');
   form.dropdown('เลือกยศสำเร็จรูป:', ['-- เลือก --', ...predefinedLabels]);
   form.textField('หรือตั้งชื่อยศใหม่:', 'เช่น [Admin]');
   form.dropdown('หรือเลือกจากที่มีอยู่:', existingList);

   form.show(admin).then((res) => {
      if (res.canceled) return;

      const predefinedIndex = Number(res.formValues[0] ?? 0);
      const input = String(res.formValues[1] ?? '').trim();
      const existingIndex = Number(res.formValues[2] ?? 0);

      let rank = '';
      if (predefinedIndex > 0) {
         rank = predefined[predefinedIndex - 1].full;
      } else if (input) {
         rank = input;
      } else if (existingList[existingIndex] !== '(ไม่มี)') {
         rank = existingList[existingIndex];
      }

      if (rank) {
         addRank(target, rank);
         refreshNameTag(target);
         cache.playSound(admin, 'random.levelup');
         cache.sendMessage(admin, `§a[RANK] ตั้งยศ '${rank}' เรียบร้อย`);
      }
   });
};

const showMenuEdit = (admin, target) => {
   if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

   const owned = getOwnedRanks(target);
   if (!owned.length) {
      cache.playSound(admin, 'block.false_permissions');
      return cache.sendMessage(admin, '§c[RANK] ไม่มียศ');
   }

   cache.playSound(admin, 'block.grindstone.use');

   const activeRank = getActiveRank(target);
   const defaultIndex = activeRank ? owned.indexOf(activeRank) : 0;

   const form = new ModalFormData();
   form.title('แก้ไขชื่อยศ');
   form.dropdown('เลือกยศ:', owned, { defaultValueIndex: Math.max(0, defaultIndex) });

   form.show(admin).then((res) => {
      if (res.canceled) return;

      const oldName = owned[Number(res.formValues[0])];

      const renameForm = new ModalFormData();
      renameForm.title('เปลี่ยนชื่อยศ');
      renameForm.textField('ชื่อใหม่', oldName, { defaultValue: oldName });

      renameForm.show(admin).then((r) => {
         if (r.canceled) return;

         const newName = String(r.formValues[0] ?? '').trim();
         if (newName && newName !== oldName) {
            renameRank(target, oldName, newName);
         } else {
            setActiveRank(target, oldName);
         }
         refreshNameTag(target);
         cache.playSound(admin, 'random.orb');
      });
   });
};

const showConfirmDelete = (admin, target, ranks) => {
   const form = new MessageFormData();
   form.title('ยืนยันลบยศ');
   form.body(`ยศที่จะลบ:\n${ranks.join('\n')}`);
   form.button1('Confirm (ลบ)');
   form.button2('Cancel (ยกเลิก)');

   form.show(admin).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
         removeRanks(target, ranks);
         refreshNameTag(target);
         cache.playSound(admin, 'random.anvil_break');
      }
   });
};

const showMenuRemove = (admin, target) => {
   if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

   const owned = getOwnedRanks(target);
   if (!owned.length) {
      cache.playSound(admin, 'block.false_permissions');
      return;
   }

   cache.playSound(admin, 'block.loom.use');

   const form = new ModalFormData().title('ลบยศ');
   for (let i = 0; i < owned.length; i++) {
      form.toggle(owned[i], { defaultValue: false });
   }

   form.show(admin).then((res) => {
      if (res.canceled) return;

      const toDelete = [];
      for (let i = 0; i < owned.length; i++) {
         if (res.formValues[i]) toDelete.push(owned[i]);
      }

      if (toDelete.length) {
         showConfirmDelete(admin, target, toDelete);
      }
   });
};

const showActions = (admin, target) => {
   if (!isValidPlayer(admin) || !isValidPlayer(target)) return;

   cache.playSound(admin, 'block.cartography_table.use');

   const current = getActiveRank(target) || '(ไม่มี)';
   const count = getOwnedRanks(target).length;
   const form = new ActionFormData();

   form.title(`จัดการ: ${target.name}`);
   form.body(`ยศที่ใช้อยู่: ${current}\nจำนวนยศที่มี: ${count}`);
   form.button('เพิ่ม / เปลี่ยนยศ', 'textures/ui/sidebar_icons/categories');
   form.button('แก้ไขชื่อยศ', 'textures/ui/sidebar_icons/classic_skins');
   form.button('ลบยศ', 'textures/ui/icons/icon_trending');

   form.show(admin).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
         showMenuAdd(admin, target);
      } else if (res.selection === 1) {
         showMenuEdit(admin, target);
      } else if (res.selection === 2) {
         showMenuRemove(admin, target);
      }
   });
};

export const showMainMenu = (admin) => {
   if (!isValidPlayer(admin)) return;

   cache.playSound(admin, 'block.loom.use');

   const players = [...Registry.getPlayers()];
   const form = new ActionFormData();
   form.title('Manager Ranks  | ระบบจัดการยศ');
   form.body('§7เลือกผู้เล่นที่ต้องการจัดการ:');

   for (let i = 0; i < players.length; i++) {
      form.button(players[i].nameTag);
   }

   form.show(admin).then((res) => {
      if (res.canceled) return;

      const target = players[res.selection];
      if (pcheck(target)) showActions(admin, target);
   });
};

