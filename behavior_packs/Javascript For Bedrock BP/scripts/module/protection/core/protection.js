import { world } from '@minecraft/server';
import { Registry } from '../../../router/core/registry.js';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { Colors, Config, halfZoneSize } from '../config.js';
import { buildZone, isZoneOverlap, validateZoneCreate } from '../utils/validation.js';
import { consumeBlock, isFormValid } from '../utils/helpers.js';
import { addSound } from '../../../plugin/utils.js';
import { zoneDatabase } from './database.js';
import { clearBorderVisuals } from './borders.js';

export const uiLockSet = new Set();

// ยืนยันการลบ
const confirmDelete = async (player) => {
   const firstform = new ActionFormData();
   firstform.title('ลบโพรเทค');
   firstform.body('คุณแน่ใจหรือไม่ว่าต้องการลบโพรเทคนี้');
   firstform.button('ตกลง', 'textures/ui/check');
   firstform.button('ยกเลิก', 'textures/ui/cancel');

   const firstResponse = await firstform.show(player);
   if (firstResponse.canceled) {
      addSound(player, 'block.false_permissions');
      return false;
   }
   if (firstResponse.selection !== 0) return false;

   const secondform = new ActionFormData();
   secondform.title('ยืนยันอีกครั้ง');
   secondform.body('กรุณายืนยันอีกครั้งเพื่อลบโพรเทค');
   secondform.button('ตกลง', 'textures/ui/check');
   secondform.button('ยกเลิก', 'textures/ui/cancel');

   const secondResponse = await secondform.show(player);
   if (secondResponse.canceled) {
      addSound(player, 'block.false_permissions');
      return false;
   }
   if (secondResponse.selection !== 0) return false;

   return true;
};

// จัดการโซน (CRUD - Create, Read, Update, Delete)
export const createZone = async (player) => {
   try {
      const result = validateZoneCreate(player, zoneDatabase.zones);
      if (!result.ok) {
         addSound(player, 'block.false_permissions');
         return player.sendMessage(result.reason);
      }

      const newZone = buildZone(result.center, result.dimension);
      if (isZoneOverlap(newZone, zoneDatabase.zones)) {
         addSound(player, 'block.false_permissions');
         return player.sendMessage(`[x] ตำแหน่งนี้ซ้อนทับกับโพรเทคอื่น`);
      }

      const confirmForm = new ActionFormData()
         .title('สร้างโพรเทค')
         .body(
            `คุณต้องการสร้างโพรเทคขนาด ${Config.ZoneSize}x${Config.ZoneSize} ที่นี่หรือไม่?\nต้องใช้ Diamond Block 1 บล็อก`,
         )
         .button('ตกลง', 'textures/ui/check')
         .button('ยกเลิก', 'textures/ui/cancel');

      const response = await confirmForm.show(player);
      if (!isFormValid(player, response) || response.selection !== 0) return;

      if (!consumeBlock(player)) {
         addSound(player, 'block.false_permissions');
         return player.sendMessage(`[x] คุณต้องมี Diamond Block ในช่องเก็บของ`);
      }

      newZone.owner = player.name;
      zoneDatabase.zones[player.name] = newZone;

      addSound(player, 'random.levelup');
      player.sendMessage(
         `${Colors.Success}[/] สร้างโพรเทค ${Config.ZoneSize}x${Config.ZoneSize} สำเร็จ`,
      );
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถสร้างโพรเทคได้`);
      console.error(`[ Protection ] createZone: ${error}`);
   }
};

export const deleteZone = async (player) => {
   try {
      if (!zoneDatabase.zones[player.name]) {
         addSound(player, 'block.false_permissions');
         return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);
      }

      const ok = await confirmDelete(player);
      if (!ok) return;

      delete zoneDatabase.zones[player.name];
      clearBorderVisuals(player.name);
      addSound(player, 'mob.pause_growth');
      player.sendMessage(`${Colors.Success}[/] ลบโพรเทคเรียบร้อย`);
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถลบโพรเทคได้`);
      console.error(`[ Protection ] deleteZone: ${error}`);
   }
};

// จัดการสมาชิก
export const manageMembers = async (player) => {
   try {
      const zone = zoneDatabase.zones[player.name];
      if (!zone) {
         addSound(player, 'block.false_permissions');
         return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);
      }

      const allPlayers = Registry.getPlayers();
      const otherPlayerNames = [];
      for (const onlinePlayer of allPlayers) {
         if (onlinePlayer.name !== player.name) otherPlayerNames.push(onlinePlayer.name);
      }

      const form = new ModalFormData()
         .title('จัดการสมาชิก')
         .dropdown('การดำเนินการ', ['เพิ่มสมาชิก', 'ลบสมาชิก'], { defaultValueIndex: 0 })
         .dropdown('ผู้เล่น', otherPlayerNames.length ? otherPlayerNames : ['ไม่มีผู้เล่น'], {
            defaultValueIndex: 0,
         });

      const response = await form.show(player);
      if (!isFormValid(player, response)) return;

      const actionIndex = response.formValues[0];
      const playerIndex = response.formValues[1];

      if (
         typeof playerIndex !== 'number' ||
         playerIndex < 0 ||
         playerIndex >= otherPlayerNames.length
      ) {
         return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);
      }

      const targetName = otherPlayerNames[playerIndex];
      if (!targetName) return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);

      if (actionIndex === 0) {
         if (zone.members.length >= Config.MaxFriends) {
            return player.sendMessage(`[x] สมาชิกเต็มแล้ว (สูงสุด ${Config.MaxFriends} คน)`);
         }
         if (zone.members.includes(targetName)) {
            return player.sendMessage(`[x] ผู้เล่นนี้เป็นสมาชิกอยู่แล้ว`);
         }
         zone.members.push(targetName);
         player.sendMessage(`${Colors.Success}[/] เพิ่ม ${targetName} เข้าเป็นสมาชิกแล้ว`);
      } else {
         const memberIndex = zone.members.indexOf(targetName);
         if (memberIndex === -1) return player.sendMessage(`[x] ผู้เล่นนี้ไม่ได้เป็นสมาชิก`);
         zone.members.splice(memberIndex, 1);
         player.sendMessage(`${Colors.Warning}[/] ลบ ${targetName} ออกจากสมาชิกแล้ว`);
      }
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถจัดการสมาชิกได้`);
      console.error(`[ Protection ] manageMembers: ${error}`);
   }
};

// จัดการสิทธิ์
export const manageFlags = async (player) => {
   try {
      const zone = zoneDatabase.zones[player.name];
      if (!zone) return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

      const flags = zone.flags ?? Config.DefaultFlags;
      const form = new ModalFormData()
         .title('ตั้งค่าสิทธิ์')
         .toggle('ทำลายบล็อก', { defaultValue: flags.break ?? true })
         .toggle('วางบล็อก', { defaultValue: flags.place ?? true })
         .toggle('ใช้งาน (ประตู/คันโยก)', { defaultValue: flags.interact ?? true })
         .toggle('เปิด (หีบ/เตา)', { defaultValue: flags.container ?? true })
         .toggle('PvP ในโพรเทค', { defaultValue: flags.damage ?? false });

      const response = await form.show(player);
      if (!isFormValid(player, response)) return;

      zone.flags = {
         ...Config.DefaultFlags,
         break: response.formValues[0],
         place: response.formValues[1],
         interact: response.formValues[2],
         container: response.formValues[3],
         damage: response.formValues[4],
      };
      player.sendMessage(`${Colors.Success}[/] ตั้งค่าสิทธิ์โพรเทคเรียบร้อย`);
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถตั้งค่าสิทธิ์ได้`);
      console.error(`[ Protection ] manageFlags: ${error}`);
   }
};

// เครื่องมือแอดมิน
export const adminDeleteZone = async (player) => {
   try {
      if (!player.hasTag(Config.AdminTag))
         return player.sendMessage(`[x] เฉพาะผู้ดูแลระบบเท่านั้น`);

      const owners = Object.keys(zoneDatabase.zones);
      if (owners.length === 0) return player.sendMessage(`[x] ยังไม่มีโพรเทคในระบบ`);

      const form = new ModalFormData();
      form.title('ลบโพรเทค (แอดมิน)');
      form.dropdown('เลือกโพรเทค', owners, { defaultValueIndex: 0 });

      const response = await form.show(player);
      if (!isFormValid(player, response)) return;

      const selectedIndex = response.formValues[0];
      if (
         typeof selectedIndex !== 'number' ||
         selectedIndex < 0 ||
         selectedIndex >= owners.length
      ) {
         return player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
      }

      const owner = owners[selectedIndex];
      if (!zoneDatabase.zones[owner]) return player.sendMessage(`[x] ไม่พบโพรเทคดังกล่าว`);

      delete zoneDatabase.zones[owner];
      clearBorderVisuals(owner);
      player.sendMessage(`${Colors.Warning}[/] ลบโพรเทคของ ${owner} แล้ว`);

      // ค้นหาผู้เล่นออนไลน์เพื่อแจ้งเตือนผ่าน Registry
      for (const onlinePlayer of Registry.getPlayers()) {
         if (onlinePlayer.name === owner) {
            onlinePlayer.sendMessage(`§cผู้ดูแลระบบลบโพรเทคของคุณแล้ว`);
            break;
         }
      }
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถลบโพรเทคได้ (แอดมิน)`);
      console.error(`[ Protection ] adminDeleteZone: ${error}`);
   }
};

// เครื่องมือแอดมิน
export const adminTeleport = async (player) => {
   try {
      if (!player.hasTag(Config.AdminTag))
         return player.sendMessage(`[x] เฉพาะผู้ดูแลระบบเท่านั้น`);

      const owners = Object.keys(zoneDatabase.zones);
      if (owners.length === 0) return player.sendMessage(`[x] ยังไม่มีโพรเทคในระบบ`);

      const form = new ModalFormData();
      form.title('เทเลพอร์ต (แอดมิน)');
      form.dropdown('เลือกโพรเทค', owners, { defaultValueIndex: 0 });

      const response = await form.show(player);
      if (!isFormValid(player, response)) return;

      const selectedIndex = response.formValues[0];
      if (
         typeof selectedIndex !== 'number' ||
         selectedIndex < 0 ||
         selectedIndex >= owners.length
      ) {
         return player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
      }

      const owner = owners[selectedIndex];
      const zone = zoneDatabase.zones[owner];
      if (!zone) return player.sendMessage(`[x] ไม่พบโพรเทคดังกล่าว`);

      if (!zone.dimension) {
         return player.sendMessage(`[x] โพรเทคไม่มีข้อมูลโลก`);
      }

      const halfSize = halfZoneSize;
      const center = {
         x: zone.start.x + halfSize,
         y: zone.start.y + halfSize,
         z: zone.start.z + halfSize,
      };
      const dimension = world.getDimension(zone.dimension);
      player.teleport(center, { dimension });
      player.sendMessage(`${Colors.Success}[/] เทเลพอร์ตไปยังโพรเทคของ ${owner}`);
   } catch (error) {
      player.sendMessage(`[x] ไม่สามารถเทเลพอร์ตได้`);
      console.error(`[ Protection ] adminTeleport: ${error}`);
   }
};
