import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { world } from '@minecraft/server';
import { getConfigSpawnProtec, updateConfigSpawnProtec, resetConfigSpawnProtec } from '../core/database.js';
import { Config } from '../config.js';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';

export function openMenuSpawnProtec(player) {
   if (!player.hasTag(Config.AdminTag)) {
      cache.sendMessage(player, '[SpawnProtect] เฉพาะแอดมินเท่านั้น');
      return;
   }
   const cfg = getConfigSpawnProtec();
   const spawn = cache.getDefaultSpawnLocation();

   const form = new ActionFormData()
      .title(' ป้องกันจุดเกิด | Spawn Protection')
      .body(
         `                   สถานะ: ${cfg.enabled ? 'เปิด' : 'ปิด'}\n` +
            `                 รัศมี: ${cfg.radius} บล็อก\n` +
            `               จุดศูนย์กลาง: ${spawn.x}, ${spawn.z}\n` +
            `                   ยกเว้น: ${cfg.exemptList.length} คน`,
      )
      .divider()
      .button(cfg.enabled ? 'ปิดระบบ' : 'เปิดระบบ', 'textures/ui/sidebar_icons/addon.png')
      .button('ตั้งค่ารัศมี', 'textures/ui/icon_recipe_construction.png')
      .button('จัดการค่าสถานะ', 'textures/ui/icon_setting.png')
      .button('จัดการรายชื่อยกเว้น', 'textures/ui/friendsbutton/navbar-friends-icon.png')
      .button('รีเซ็ตค่าเริ่มต้น', 'textures/ui/wysiwyg_reset.png')
      .divider()
      .button('ปิด');

   form
      .show(player)
      .then((r) => {
         if (r.canceled || r.selection === 5) return;
         switch (r.selection) {
            case 0:
               updateConfigSpawnProtec({ enabled: !cfg.enabled });
               cache.sendMessage(player, `[SpawnProtect] ${!cfg.enabled ? 'เปิด' : 'ปิด'}ระบบแล้ว`);
               openMenuSpawnProtec(player);
               break;
            case 1:
               showRadiusSlider(player);
               break;
            case 2:
               showFlagsForm(player);
               break;
            case 3:
               showExemptMenu(player);
               break;
            case 4:
               showResetConfirm(player);
               break;
         }
      })
      .catch((error) => {
         logError('SpawnProtec', 'openMenuSpawnProtec', error);
      });
}

function showRadiusSlider(player) {
   const cfg = getConfigSpawnProtec();
   const form = new ModalFormData().title('ตั้งค่ารัศมี').slider('รัศมี (บล็อก)', 10, 500, {
      valueStep: 10,
      defaultValue: cfg.radius,
   });

   form
      .show(player)
      .then((r) => {
         if (r.canceled) {
            openMenuSpawnProtec(player);
            return;
         }
         const newRadius = r.formValues[0];
         updateConfigSpawnProtec({ radius: newRadius });
         cache.sendMessage(player, `[SpawnProtect] ตั้งรัศมีเป็น ${newRadius} บล็อก`);
         openMenuSpawnProtec(player);
      })
      .catch((error) => {
         logError('SpawnProtec', 'showRadiusSlider', error);
      });
}

function showFlagsForm(player) {
   const cfg = getConfigSpawnProtec();
   const flagNames = ['break', 'place', 'container', 'explosion'];
   const labels = ['ทำลายบล็อก (break)', 'วางบล็อก (place)', 'เปิดหีบ/เตา (container)', 'ระเบิด (explosion)'];

   const form = new ModalFormData().title('จัดการค่าสถานะ');

   for (let i = 0; i < flagNames.length; i++) {
      form.toggle(`อนุญาต: ${labels[i]}`, {
         defaultValue: cfg.flags[flagNames[i]] ?? false,
      });
   }

   form
      .show(player)
      .then((r) => {
         if (r.canceled) {
            openMenuSpawnProtec(player);
            return;
         }
         const newFlags = {};
         for (let i = 0; i < flagNames.length; i++) {
            newFlags[flagNames[i]] = r.formValues[i];
         }
         updateConfigSpawnProtec({ flags: newFlags });
         cache.sendMessage(player, '[SpawnProtect] อัปเดตค่าสถานะแล้ว');
         openMenuSpawnProtec(player);
      })
      .catch((error) => {
         logError('SpawnProtec', 'showFlagsForm', error);
      });
}

function showExemptMenu(player) {
   const cfg = getConfigSpawnProtec();

   const form = new ActionFormData()
      .title('รายชื่อยกเว้น')
      .body(cfg.exemptList.length > 0 ? `รายชื่อ (${cfg.exemptList.length}):\n` + cfg.exemptList.join('\n') : 'ไม่มีรายชื่อ')
      .button('เพิ่มผู้เล่น')
      .button('ลบผู้เล่น')
      .divider()
      .button('กลับ');

   form
      .show(player)
      .then((r) => {
         if (r.canceled || r.selection === 2) {
            openMenuSpawnProtec(player);
            return;
         }
         switch (r.selection) {
            case 0:
               showAddExempt(player);
               break;
            case 1:
               showRemoveExempt(player);
               break;
         }
      })
      .catch((error) => {
         logError('SpawnProtec', 'showExemptMenu', error);
      });
}

function showAddExempt(player) {
   const cfg = getConfigSpawnProtec();
   const exemptSet = cfg.exemptSet;

   const candidates = world
      .getAllPlayers()
      .filter((p) => p.id !== player.id)
      .filter((p) => !exemptSet.has(p.name.toLowerCase()))
      .map((p) => p.name);

   if (candidates.length === 0) {
      cache.sendMessage(player, '[SpawnProtect] ไม่มีผู้เล่นอื่นให้เพิ่ม');
      showExemptMenu(player);
      return;
   }

   if (cfg.exemptList.length >= 50) {
      cache.sendMessage(player, '[SpawnProtect] รายชื่อยกเว้นเต็มแล้ว (สูงสุด 50 คน)');
      showExemptMenu(player);
      return;
   }

   const form = new ModalFormData().title('เพิ่มผู้ได้รับยกเว้น').dropdown('เลือกผู้เล่น', candidates);

   form
      .show(player)
      .then((r) => {
         if (r.canceled) {
            showExemptMenu(player);
            return;
         }
         const idx = r.formValues[0];
         const name = candidates[idx];

         const newList = [...cfg.exemptList, name];
         updateConfigSpawnProtec({ exemptList: newList });
         cache.sendMessage(player, `[SpawnProtect] เพิ่ม ${name} เข้ารายชื่อยกเว้นแล้ว`);
         showExemptMenu(player);
      })
      .catch((error) => {
         logError('SpawnProtec', 'showAddExempt', error);
      });
}

function showRemoveExempt(player) {
   const cfg = getConfigSpawnProtec();
   if (cfg.exemptList.length === 0) {
      cache.sendMessage(player, '[SpawnProtect] ไม่มีรายชื่อในรายชื่อยกเว้น');
      showExemptMenu(player);
      return;
   }

   const form = new ActionFormData().title('ลบผู้ได้รับยกเว้น').body('เลือกรายชื่อที่ต้องการลบ');

   for (const name of cfg.exemptList) {
      form.button(`${name}`);
   }
   form.divider();
   form.button('กลับ');

   form
      .show(player)
      .then((r) => {
         if (r.canceled || r.selection === cfg.exemptList.length) {
            showExemptMenu(player);
            return;
         }
         const removedName = cfg.exemptList[r.selection];
         const newList = cfg.exemptList.filter((_, i) => i !== r.selection);
         updateConfigSpawnProtec({ exemptList: newList });
         cache.sendMessage(player, `[SpawnProtect] ลบ ${removedName} ออกจากรายชื่อยกเว้นแล้ว`);
         showExemptMenu(player);
      })
      .catch((error) => {
         logError('SpawnProtec', 'showRemoveExempt', error);
      });
}

function showResetConfirm(player) {
   const form = new ActionFormData()
      .title('ยืนยันรีเซ็ต')
      .body('ต้องการรีเซ็ตค่าทั้งหมดเป็นค่าเริ่มต้นหรือไม่?\n(รัศมี, ค่าสถานะ, รายชื่อยกเว้น จะถูกลบทั้งหมด)')
      .button('ยืนยัน — รีเซ็ต')
      .button('ยกเลิก');

   form
      .show(player)
      .then((r) => {
         if (r.canceled || r.selection === 1) {
            openMenuSpawnProtec(player);
            return;
         }
         resetConfigSpawnProtec();
         cache.sendMessage(player, '[SpawnProtect] รีเซ็ตค่าทั้งหมดเป็นค่าเริ่มต้นแล้ว');
         openMenuSpawnProtec(player);
      })
      .catch((error) => {
         logError('SpawnProtec', 'showResetConfirm', error);
      });
}
