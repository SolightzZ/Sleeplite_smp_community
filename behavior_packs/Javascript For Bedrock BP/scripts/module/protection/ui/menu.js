import { ActionFormData } from '@minecraft/server-ui';

import { addSound } from '../../../shared/utils.js';
import { logError } from '../../../events/logger.js';
import { Config, halfZoneSize } from '../config.js';
import { showBorder } from '../core/borders.js';
import { zoneDatabase } from '../core/database.js';
import { adminDeleteZone, adminTeleport, createZone, deleteZone, manageFlags, manageMembers, uiLockSet } from '../core/protection.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';

// สร้างเนื้อหาเมนู
const buildMenuBody = (player) => {
   const zones = zoneDatabase.zones;
   const zone = zones[player.name];
   const zoneCount = Object.keys(zones).length;

   let memberZone = null;

   for (const z of Object.values(zones)) {
      if (z.members.includes(player.name)) {
         memberZone = z;
         break;
      }
   }

   const bodyLines = [`§7โพรเทค: ${zoneCount}/${Config.MaxZones}`];

   if (zone || memberZone) {
      const currentZone = zone || memberZone;
      const halfSize = halfZoneSize;
      const center = {
         x: currentZone.start.x + halfSize,
         y: currentZone.start.y + halfSize,
         z: currentZone.start.z + halfSize,
      };

      const memberList = currentZone.members.length ? currentZone.members.join(', ') : 'ไม่มี';
      const dimensionLabel = currentZone.dimension === 'minecraft:overworld' ? 'Overworld' : currentZone.dimension === 'minecraft:nether' ? 'Nether' : 'End';
      bodyLines.push(`เจ้าของ: ${currentZone.owner}`, `สมาชิก: ${memberList}`, `โลก: ${dimensionLabel}`, `ศูนย์กลาง: (${center.x}, ${center.y}, ${center.z})`);
   } else {
      bodyLines.push('');
   }

   return bodyLines.join('\n');
};

// สร้างปุ่ม
const addButton = (form, text, icon) => form.button(text, icon);

const buildMenuButtons = (form, player, isAdmin) => {
   const ownsZone = zoneDatabase.zones[player.name];
   const actions = [];
   const zoneCount = Object.keys(zoneDatabase.zones).length;

   if (!ownsZone) {
      if (zoneCount < Config.MaxZones) {
         addButton(form, 'สร้างโพรเทค', 'textures/ui/sidebar_icons/addon');
         actions.push(() => {
            cache.playSound(player, 'trial_spawner.charge_activate');
            createZone(player);
         });
      }

      if (isAdmin) {
         addButton(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
         addButton(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
         actions.push(() => {
            cache.playSound(player, 'item.spear.use');
            adminDeleteZone(player);
         });
         actions.push(() => {
            cache.playSound(player, 'random.anvil_land');
            adminTeleport(player);
         });
      }
   } else {
      addButton(form, 'ตั้งค่าสิทธิ์', 'textures/ui/profile_glyph_combined');
      addButton(form, 'จัดการสมาชิก', 'textures/ui/sidebar_icons/wish_list');
      addButton(form, 'แสดงขอบเขต', 'textures/ui/sidebar_icons/classic_skins');
      addButton(form, 'ลบโพรเทค', 'textures/ui/sidebar_icons/squaredonut');

      actions.push(() => {
         cache.playSound(player, 'block.loom.use');
         manageFlags(player);
      });
      actions.push(() => {
         cache.playSound(player, 'block.cartography_table.use');
         manageMembers(player);
      });
      actions.push(() => {
         cache.playSound(player, 'conduit.activate');
         showBorder(player);
      });
      actions.push(() => {
         cache.playSound(player, 'item.spear.use');
         deleteZone(player);
      });

      if (isAdmin) {
         addButton(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
         addButton(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
         actions.push(() => {
            cache.playSound(player, 'item.spear.use');
            adminDeleteZone(player);
         });
         actions.push(() => {
            cache.playSound(player, 'random.anvil_land');
            adminTeleport(player);
         });
      }
   }
   return actions;
};

// เมนูหลัก
export const openMenu = async (player) => {
   if (uiLockSet.has(player.name)) return cache.sendMessage(player, `[x] กรุณารอสักครู่`);

   uiLockSet.add(player.name);

   try {
      cache.playSound(player, 'trial_spawner.charge_activate');
      const isAdmin = player.hasTag(Config.AdminTag);
      const form = new ActionFormData();
      form.title('Protect | โพรเทค');

      form.body(buildMenuBody(player));
      form.divider();

      const actions = buildMenuButtons(form, player, isAdmin);
      form.label('             @Sleeplite 2026');

      const response = await form.show(player);
      if (response.canceled) {
         return;
      }
      if (!pcheck(player)) return;

      if (response.selection < actions.length) {
         await actions[response.selection]();
      } else {
         cache.playSound(player, 'block.false_permissions');
         cache.sendMessage(player, `[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
      }
   } catch (error) {
      cache.playSound(player, 'block.false_permissions');
      cache.sendMessage(player, `[x] เมนูผิดพลาด`);
      logError('Protection', 'openMenu', error);
   } finally {
      uiLockSet.delete(player.name);
   }
};
