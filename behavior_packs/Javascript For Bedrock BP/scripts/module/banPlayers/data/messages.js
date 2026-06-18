// ค่าเริ่มต้นเมื่อไม่ระบุเหตุผลการแบน
export const defaultBanReason = 'ฝ่าฝืนกฎระเบียบของเซิร์ฟเวอร์';

// ค่าเริ่มต้นเมื่อไม่ระบุเหตุผลการเตะ
export const defaultKickReason =
   'ถูกดำเนินการให้ออกจากเซิร์ฟเวอร์โดยผู้ดูแลระบบ';

export const banReasons = [
   'Cheating / Hacking',
   'Griefing',
   'Harassment',
   'Spamming',
   'Exploiting Bugs',
   'Inappropriate Build',
   'Alt Account',
   'Scamming',
   'Combat Logging',
   'Other',
];

export const kickReasons = [
   'Server Restart',
   'Lag / Performance',
   'Inappropriate Behavior',
   'AFK Too Long',
   'Other',
];
