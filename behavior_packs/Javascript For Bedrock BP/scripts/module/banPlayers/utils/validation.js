import { CustomCommandStatus } from '@minecraft/server';
import { Config } from '../config.js';

// คืนค่าผู้เล่นจาก Origin หรือ null
export const requirePlayer = (origin) => {
   const player = origin?.sourceEntity;
   return player?.isValid ? player : null;
};

// ตรวจสอบว่าผู้เล่นเป็นผู้ดูแลระบบ (Admin) หรือไม่
export const isAdmin = (player) => {
   return player?.hasTag?.(Config.adminTag) ?? false;
};

// ตรวจสอบและคืนค่าผู้ดูแลระบบ (Admin)
export const requireAdmin = (origin) => {
   const player = requirePlayer(origin);
   if (!player) return null;
   return isAdmin(player) ? player : null;
};

// ตรวจสอบและกรองรายชื่อผู้เล่นเป้าหมายที่อยู่ในระบบ
export const requireValidTargets = (targetPlayers) => {
   if (!Array.isArray(targetPlayers) || targetPlayers.length === 0) return null;
   const valid = targetPlayers.filter((p) => p?.isValid);
   return valid.length > 0 ? valid : null;
};

// ค้นหาผู้ดูแลระบบจากรายชื่อผู้เล่นเป้าหมาย
export const findAdminTarget = (targetPlayers) => {
   for (const target of targetPlayers) {
      if (target?.isValid && isAdmin(target)) return target;
   }
   return null;
};

// สร้างผลลัพธ์การตอบกลับคำสั่ง
export const cmdResult = {
   success: { status: CustomCommandStatus.Success },
   failure: (msg) => ({ status: CustomCommandStatus.Failure, message: msg }),
};

// ตรวจสอบความถูกต้องของระยะเวลา
export const validateDuration = (input) => {
   if (typeof input !== 'string') return { ok: false };
   const trimmed = input.trim().toLowerCase();

   if (trimmed === 'perm' || trimmed === 'permanent' || trimmed === '0') {
      return { ok: true, seconds: 0 };
   }

   const match = trimmed.match(/^(\d+)\s*(s|m|h|d|w|mo|y)?$/);
   if (!match) return { ok: false };

   const value = parseInt(match[1], 10);
   if (isNaN(value) || value <= 0) return { ok: false };

   const unit = match[2] || 's';
   const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      mo: 2592000,
      y: 31536000,
   };

   const seconds = value * (multipliers[unit] || 1);

   return { ok: true, seconds };
};

// ตรวจสอบความถูกต้องของชื่อผู้เล่น
export const validatePlayerName = (name) => {
   if (!name || typeof name !== 'string') return false;
   const trimmed = name.trim();

   if (trimmed.length < 3 || trimmed.length > 16) return false;
   return /^[a-zA-Z0-9_ ]+$/.test(trimmed);
};

// ตรวจสอบผู้เล่นเป้าหมายสำหรับคำสั่ง Admin
export const validateCommandTargets = (targetPlayers, actionName) => {
   const targets = requireValidTargets(targetPlayers);
   if (!targets) {
      return { ok: false, error: '§cไม่พบผู้เล่นเป้าหมายในระบบ' };
   }
   if (findAdminTarget(targetPlayers)) {
      return {
         ok: false,
         error: `§cไม่สามารถดำเนินการ${actionName}กับผู้ดูแลระบบได้`,
      };
   }
   return { ok: true, targets };
};

// วิเคราะห์ระยะเวลาการแบนและใช้ค่าเริ่มต้นหากไม่มีการระบุ
export const getOrValidateDuration = (durationStr, defaultSecs) => {
   if (
      durationStr === undefined ||
      durationStr === null ||
      String(durationStr).trim() === ''
   ) {
      return { ok: true, seconds: defaultSecs };
   }

   return validateDuration(String(durationStr));
};
