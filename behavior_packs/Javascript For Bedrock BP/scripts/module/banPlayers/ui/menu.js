import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui';
import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { cache } from '../../../shared/cache.js';
import { banReasons, kickReasons } from '../config.js';
import { banPlayer, getBanList, kickAndNotify, unbanPlayer } from '../core/ban.js';
import { formatDate, formatRemaining } from '../utils/format.js';
import { isAdmin, validateDuration, validatePlayerName } from '../utils/validation.js';
import { pcheck } from './../../../shared/player.js';

const uiLockSet = new Set();

// ตรวจสอบการยกเลิกฟอร์มหรือสถานะผู้เล่น
const formGuard = async (form, player) => {
   const response = await form.show(player);

   if (response.canceled) return null;
   if (!pcheck(player)) return null;
   return response;
};

// ดึงดัชนีแบบปลอดภัยจากแบบฟอร์ม
const getFormIndex = (formValues, index) => {
   const val = formValues[index];
   return typeof val === 'number' ? val : -1;
};

// สร้างข้อความเหตุผลโดยรวมค่าจาก Dropdown และ Text Field
const buildReason = (formValues, reasonIndex, extraIndex, presets) => {
   const idx = getFormIndex(formValues, reasonIndex);
   let reason = '';

   if (idx >= 0 && idx < presets.length) reason = presets[idx];
   const extra = String(formValues[extraIndex] ?? '').trim();

   if (extra) reason += `: ${extra}`;
   return reason;
};

// ครอบฟังก์ชันของฟอร์มด้วย try/catch และการบันทึกข้อผิดพลาด
const withFormError = (name, handler) => async (player) => {
   try {
      await handler(player);
   } catch (error) {
      cache.sendMessage(player, `[x] เกิดข้อผิดพลาดในการดำเนินงาน`);
      logError('Ban', name + ' error', error);
   }
};

const buildBanlistBody = () => {
   const bans = getBanList();
   if (bans.length === 0) return '§7ไม่มีรายชื่อผู้เล่นที่ถูกแบนในระบบ';

   const lines = bans.map((ban, i) => {
      const remaining = ban.duration === 0 ? '§cถาวร' : `§e${formatRemaining(ban.expiresAt)}`;
      return `§7${i + 1}. §f${ban.name}\n   §7สาเหตุ: §f${ban.reason}\n   §7ระยะเวลาที่เหลือ: ${remaining}\n   §7ดำเนินการโดย: §f${ban.bannedBy} §7(${formatDate(ban.bannedAt)})`;
   });

   return lines.join('\n§7------------------------------\n');
};

export const openBanMenu = async (arg) => {
   const player = arg?.source ?? arg;
   if (!pcheck(player)) return;
   if (uiLockSet.has(player.name)) return cache.sendMessage(player, `[x] กรุณารอสักครู่ขณะระบบกำลังประมวลผล`);
   uiLockSet.add(player.name);

   try {
      cache.playSound(player, 'trial_spawner.charge_activate');
      const admin = isAdmin(player);

      const form = new ActionFormData();
      form.title('Ban | จัดการผู้เล่น');
      form.body('               จัดการผู้เล่นสำหรับผู้ดูแลระบบ');
      form.divider();

      if (admin) {
         form.button('แบนผู้เล่น', 'textures/ui/sidebar_icons/squaredonut');
         form.button('ปลดแบนผู้เล่น', 'textures/ui/sidebar_icons/promotag');
         form.button('เตะผู้เล่น', 'textures/ui/icons/icon_multiplayer');
      }
      form.button('รายชื่อผู้เล่นที่ถูกแบน', 'textures/ui/sidebar_icons/wish_list');
      form.label('                @Sleeplite 2026');
      const response = await formGuard(form, player);
      if (!response) return;
      const selection = response.selection;

      if (admin && selection === 0) await showBanForm(player);
      else if (admin && selection === 1) await showUnbanForm(player);
      else if (admin && selection === 2) await showKickForm(player);
      else await showBanlist(player);
   } catch (error) {
      cache.playSound(player, 'block.false_permissions');
      cache.sendMessage(player, `[x] เกิดข้อผิดพลาดในการเปิดเมนู`);
      logError('Ban', 'openMenu error', error);
   } finally {
      uiLockSet.delete(player.name);
   }
};

const showBanForm = withFormError('showBanForm', async (adminPlayer) => {
   const onlinePlayers = Registry.getPlayers().filter((p) => !isAdmin(p));
   const playerNames = onlinePlayers.map((p) => p.name);

   const form = new ModalFormData();
   form.title('แบนผู้เล่น');

   if (playerNames.length > 0) {
      form.dropdown('เลือกรายชื่อผู้เล่นออนไลน์', playerNames, {
         defaultValueIndex: 0,
      });
   }
   form.textField('หรือระบุชื่อผู้เล่นด้วยตนเอง', 'พิมพ์ชื่อผู้เล่นที่นี่');
   form.textField('ระยะเวลาแบน (ตัวอย่างเช่น 7d, 7h, 30m, 30s หรือ perm สำหรับถาวร)', '7h');
   form.dropdown('ระบุสาเหตุ', banReasons, { defaultValueIndex: 0 });
   form.textField('รายละเอียดเพิ่มเติม (ถ้ามี)', '');

   const response = await formGuard(form, adminPlayer);
   if (!response) return;

   let targetName = '';
   let offset = 0;

   if (playerNames.length > 0) {
      const selectedIndex = getFormIndex(response.formValues, 0);
      if (selectedIndex >= 0 && selectedIndex < playerNames.length) {
         targetName = playerNames[selectedIndex];
      }
      offset = 1;
   }

   const manualName = response.formValues[offset];
   if (!targetName && manualName) {
      targetName = String(manualName).trim();
   }

   if (!targetName || !validatePlayerName(targetName)) {
      cache.playSound(adminPlayer, 'block.false_permissions');
      return cache.sendMessage(adminPlayer, `[x] รูปแบบชื่อผู้เล่นไม่ถูกต้อง`);
   }

   const durationStr = String(response.formValues[offset + 1] ?? 'perm');
   const durationResult = validateDuration(durationStr);

   if (!durationResult.ok) {
      cache.playSound(adminPlayer, 'block.false_permissions');
      return cache.sendMessage(adminPlayer, `[x] รูปแบบเวลาไม่ถูกต้อง กรุณาใช้รูปแบบ เช่น 7d (วัน), 7h (ชั่วโมง), 30m (นาที) หรือ perm (ถาวร)`);
   }

   const reason = buildReason(response.formValues, offset + 2, offset + 3, banReasons);

   banPlayer(targetName, reason, durationResult.seconds, adminPlayer);
});

const showUnbanForm = withFormError('showUnbanForm', async (adminPlayer) => {
   const bans = getBanList();
   if (bans.length === 0) {
      return cache.sendMessage(adminPlayer, `[x] ไม่พบรายชื่อผู้เล่นที่ถูกแบนในขณะนี้`);
   }
   const banNames = bans.map((b) => `${b.name} (${b.reason})`);

   const form = new ModalFormData();
   form.title('ปลดแบนผู้เล่น');
   form.dropdown('เลือกรายชื่อผู้เล่นที่ต้องการปลดแบน', banNames, {
      defaultValueIndex: 0,
   });

   const response = await formGuard(form, adminPlayer);
   if (!response) return;

   const index = getFormIndex(response.formValues, 0);
   if (index < 0 || index >= bans.length) return;

   const selected = bans[index];
   const confirm = new MessageFormData();
   confirm.title('ยืนยันการปลดแบน');
   confirm.body(`§7คุณต้องการปลดแบนผู้เล่น\n§f${selected.name} §7หรือไม่?\n\n§7สาเหตุ: §f${selected.reason}\n§7ดำเนินการโดย: §f${selected.bannedBy}`);
   confirm.button1('ตกลง');
   confirm.button2('ยกเลิก');

   const confirmResponse = await confirm.show(adminPlayer);
   if (confirmResponse.canceled || confirmResponse.selection !== 0) {
      cache.playSound(adminPlayer, 'random.break');
      return;
   }

   unbanPlayer(selected.name, adminPlayer);
});

const showKickForm = withFormError('showKickForm', async (adminPlayer) => {
   const allPlayers = Registry.getPlayers();
   const otherPlayers = allPlayers.filter((p) => p.name !== adminPlayer.name && !isAdmin(p));
   const playerNames = otherPlayers.map((p) => p.name);

   if (playerNames.length === 0) {
      return cache.sendMessage(adminPlayer, `[x] ไม่พบผู้เล่นอื่นในเซิร์ฟเวอร์ขณะนี้`);
   }

   const form = new ModalFormData();
   form.title('เชิญผู้เล่นออกจากเซิร์ฟเวอร์');
   form.dropdown('เลือกรายชื่อผู้เล่น', playerNames, { defaultValueIndex: 0 });
   form.dropdown('เลือกเหตุผลการเชิญออก', kickReasons, {
      defaultValueIndex: 0,
   });
   form.textField('รายละเอียดเพิ่มเติม (ถ้ามี)', '');

   const response = await formGuard(form, adminPlayer);
   if (!response) return;

   const playerIndex = getFormIndex(response.formValues, 0);
   if (playerIndex < 0 || playerIndex >= playerNames.length) return;

   const targetName = playerNames[playerIndex];
   const reason = buildReason(response.formValues, 1, 2, kickReasons);

   for (const target of cache.getPlayers()) {
      if (target.name === targetName && pcheck(target)) {
         kickAndNotify(target, reason, adminPlayer.name);
         return;
      }
   }

   cache.sendMessage(adminPlayer, `§c[x] ไม่พบผู้เล่นชื่อ ${targetName} ในเซิร์ฟเวอร์`);
});

const showBanlist = async (player) => {
   const form = new ActionFormData();

   form.title('รายชื่อผู้ที่ถูกแบน');
   form.body(buildBanlistBody());
   form.button('ปิด');

   const response = await formGuard(form, player);
   if (!response) return;
};
