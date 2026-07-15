import { CommandPermissionLevel } from '@minecraft/server';

export const NAMESPACE = 'addon';
export const ADDON_VERSION = '1.0.0';

export const LOG_TAG = 'CustomCommands';

export const COMMAND = {
   name: 'addon:server',
   description: '§7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ',
   permissionLevel: CommandPermissionLevel.Any,
};

export const DEFAULT_ICON = 'textures/items/xbox4';

export const UI_TITLES = {
   serverMenu: 'เลือกเซิร์ฟเวอร์',
   customInput: 'กรอกเซิร์ฟเวอร์',
   confirm: 'ยืนยันการเชื่อมต่อ',
};

export const UI_BUTTONS = {
   customIp: 'กรอก IP ด้วยตัวเอง',
   confirm: 'ตกลง',
   back: 'กลับ',
};

export const UI_TEXT = {
   ipLabel: 'IP Address:',
   ipPlaceholder: 'เช่น 192.168.0.1 หรือ zeqa.net',
   portLabel: 'Port Number:',
   portPlaceholder: 'เช่น 19132',
   confirmBody: (serverName, ipAddress, portNumber) =>
      `§7ชื่อเซิร์ฟเวอร์: ${serverName}\nIP Address: ${ipAddress}\n§7Port Number: ${portNumber}`,
   customServerLabel: 'เซิร์ฟเวอร์ที่กำหนดเอง',
};

export const MESSAGES = {
   INVALID_IP: '§c[x] IP หรือ Port ไม่ถูกต้อง โปรดลองอีกครั้ง',
   TRANSFER_START: (ip, port) => `§a[/] กำลังย้ายคุณไปยัง ${ip}:${port}...`,
   TRANSFER_FAIL: '§c[x] ไม่สามารถย้ายผู้เล่นได้ อาจเกิดจากข้อจำกัดของเครือข่าย',
};
