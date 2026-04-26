export const Configuration = {
  MaximumZonesInServer: 10,
  ZoneSideLength: 30,
  MaximumFriendsPerZone: 4,
  ParticleTypeId: "minecraft:endrod",
  ParticleStepDistance: 3,
  BorderDisplayDurationTicks: 60,
  LocationCacheLimit: 1000,
  AdministratorTag: "admin",
  CooldownMilliseconds: 10000,
  RequiredBlockToCreateZone: "minecraft:diamond_block",
};

export const HalfZone = Configuration.ZoneSideLength / 2;

export const TextColorCodes = {
  Error: "§c",
  Success: "§a",
  Warning: "§6",
  Info: "§7",
};

export const UserMessages = {
  InvalidForm: `[x] ข้อมูลฟอร์มไม่ถูกต้อง!`,
  PlayerHasNoZone: `[x] คุณไม่มีโซน!`,
  ServerZoneLimitReached: `[x] ถึงขีดจำกัดจำนวนโซน (${Configuration.MaximumZonesInServer})!`,
  PlayerAlreadyHasZone: `[x] คุณมีโซนอยู่แล้ว!`,
  OnlyOverworld: `[x] ใช้ได้เฉพาะใน Overworld!`,
  HeightOutOfRange: `[x] เกินขอบเขตความสูงที่อนุญาต!`,
  NeedRequiredBlock: `[x] คุณต้องมี Diamond Block!`,
  ZoneOverlap: `[x] โซนนี้ทับกับโซนอื่น!`,
  ZoneCreated: `${TextColorCodes.Success}สร้างโซนขนาด ${Configuration.ZoneSideLength}x${Configuration.ZoneSideLength} สำเร็จ!`,
  ZoneDeleted: `${TextColorCodes.Success}ลบโซนเรียบร้อยแล้ว!`,
  NoOnlinePlayers: "ไม่มีผู้เล่นออนไลน์",
  FriendListFull: `[x] คุณมีเพื่อนครบ ${Configuration.MaximumFriendsPerZone} คนแล้ว!`,
  FriendAlreadyAdded: `[x] ผู้เล่นนี้เป็นเพื่อนคุณอยู่แล้ว!`,
  FriendNotInList: `[x] ผู้เล่นนี้ไม่ได้เป็นเพื่อนคุณ!`,
  FriendAdded: (name) => `${TextColorCodes.Success}[/] เพิ่ม ${name} ในโซนเรียบร้อยแล้ว!`,
  FriendRemoved: (name) => `${TextColorCodes.Warning}[/] ลบ ${name} ออกจากโซนเรียบร้อยแล้ว!`,
  AdministratorOnly: `[x] เฉพาะผู้ดูแลระบบเท่านั้น!`,
  NoZonesInServer: `[x] ไม่มีโซนในระบบ!`,
  InvalidZoneSelection: `[x] เลือกโซนไม่ถูกต้อง!`,
  ZoneNotFound: `[x] ไม่พบโซนนี้!`,
  ZoneDeletedByAdministrator: (owner) => `${TextColorCodes.Warning}[/] ลบโซนของ ${owner} เรียบร้อยแล้ว!`,
  YourZoneDeletedByAdministrator: `โซนของคุณถูกลบโดยผู้ดูแลระบบ!`,
  TeleportSuccess: (owner) => `${TextColorCodes.Success}[/] เทเลพอร์ตไปโซน ${owner}`,
};

export const buildEdgeOffsets = (size) => {
  const offsets = [];
  const zero = 0,
    z = size;

  for (const y of [zero, z]) for (const k of [zero, z]) offsets.push(["x", zero, y, k]);
  for (const x of [zero, z]) for (const k of [zero, z]) offsets.push(["y", x, zero, k]);
  for (const x of [zero, z]) for (const y of [zero, z]) offsets.push(["z", x, y, zero]);

  return offsets;
};

export const EdgeOffsets = buildEdgeOffsets(Configuration.ZoneSideLength);
