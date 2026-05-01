import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
} from "@minecraft/server";

const CONFIG = {
  defaultIdleSeconds: 120, // เวลาที่ต้องอยู่นิ่งก่อนเข้า AFK
  warningSeconds: 5, // เวลาก่อนเข้า AFK ที่จะแจ้งเตือน

  movementTolerance: 0.15, // ระยะขยับเล็กน้อยที่ยังถือว่า "ไม่ขยับ"
  rotationTolerance: 3.0, // การหมุนกล้องที่ยังถือว่า idle

  welcomeMessageTicks: 35, // ดีเลย์ข้อความตอนเข้า cinematic (tick = 20 ต่อวินาที)

  focusHeight: 1.35, // ระดับกล้องโฟกัสตัวผู้เล่น
  cinematicFov: 30, // มุมกล้อง FOV

  minIdleSeconds: 10, // เวลาต่ำสุดที่ผู้เล่นตั้งได้
  maxIdleSeconds: 900, // เวลาสูงสุด

  collisionStep: 0.45, // ความละเอียดการเช็คชน
  collisionBuffer: 0.2, // ระยะกันกล้องชนบล็อก
};

const MAX_COLLISION_STEPS = 24;

const PASS_THROUGH_BLOCKS = new Set([
  "minecraft:air",
  "minecraft:cave_air",
  "minecraft:void_air",
  "minecraft:water",
  "minecraft:flowing_water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:short_grass",
  "minecraft:tall_grass",
  "minecraft:fern",
  "minecraft:large_fern",
  "minecraft:deadbush",
  "minecraft:vine",
  "minecraft:glow_lichen",
  "minecraft:seagrass",
  "minecraft:tall_seagrass",
  "minecraft:snow_layer",
]);

const SHOT_LIBRARY = [
  // ===== CLOSE SHOTS =====
  {
    id: "close-front",
    yawOffset: 0,
    distance: 2.2,
    height: 1.6,
    slide: 0.02,
    bob: 0.02,
    duration: 90,
    targetUp: 1.5,
  },
  {
    id: "close-left",
    yawOffset: -60,
    distance: 2.5,
    height: 1.5,
    slide: 0.03,
    bob: 0.02,
    duration: 95,
    targetUp: 1.5,
  },
  {
    id: "close-right",
    yawOffset: 60,
    distance: 2.5,
    height: 1.5,
    slide: 0.03,
    bob: 0.02,
    duration: 95,
    targetUp: 1.5,
  },
  {
    id: "close-low",
    yawOffset: 15,
    distance: 2.8,
    height: 0.6,
    slide: 0.02,
    bob: 0.015,
    duration: 100,
    targetUp: 1.7,
  },
  {
    id: "close-back",
    yawOffset: 180,
    distance: 2.7,
    height: 1.6,
    slide: 0.02,
    bob: 0.02,
    duration: 100,
    targetUp: 1.5,
  },
  // ===== MEDIUM SHOTS =====
  {
    id: "hero-center",
    yawOffset: 8,
    distance: 4.0,
    height: 1.5,
    slide: 0.04,
    bob: 0.025,
    duration: 110,
    targetUp: 1.58,
  },
  {
    id: "hero-low",
    yawOffset: -18,
    distance: 4.9,
    height: 0.75,
    slide: 0.04,
    bob: 0.02,
    duration: 105,
    targetUp: 1.72,
  },
  {
    id: "front-medium",
    yawOffset: 32,
    distance: 4.8,
    height: 1.85,
    slide: 0.05,
    bob: 0.03,
    duration: 100,
    targetUp: 1.45,
  },
  {
    id: "profile",
    yawOffset: 88,
    distance: 4.6,
    height: 1.9,
    slide: 0.06,
    bob: 0.03,
    duration: 95,
    targetUp: 1.45,
    targetRight: 0.3,
  },
  {
    id: "over-shoulder",
    yawOffset: 146,
    distance: 3.9,
    height: 1.8,
    slide: 0.03,
    bob: 0.02,
    duration: 95,
    targetUp: 1.45,
    targetForward: 2.8,
    targetRight: -0.8,
  },
  // ===== MEDIUM VARIANTS =====
  {
    id: "medium-orbit",
    yawOffset: 120,
    distance: 5.5,
    height: 2.0,
    slide: 0.07,
    bob: 0.03,
    duration: 110,
    targetUp: 1.5,
  },
  {
    id: "medium-back",
    yawOffset: -140,
    distance: 5.2,
    height: 1.7,
    slide: 0.04,
    bob: 0.025,
    duration: 100,
    targetUp: 1.5,
  },
  {
    id: "medium-top",
    yawOffset: 0,
    distance: 4.5,
    height: 4.0,
    slide: 0.03,
    bob: 0.03,
    duration: 105,
    targetUp: 1.2,
  },
  // ===== WIDE SHOTS =====
  {
    id: "hero-wide",
    yawOffset: -40,
    distance: 8.9,
    height: 3.1,
    slide: 0.08,
    bob: 0.035,
    duration: 125,
    targetUp: 1.45,
  },
  {
    id: "centered-wide",
    yawOffset: -158,
    distance: 10.4,
    height: 3.5,
    slide: 0.05,
    bob: 0.03,
    duration: 120,
    targetUp: 1.45,
  },
  {
    id: "side-silhouette",
    yawOffset: -92,
    distance: 9.8,
    height: 2.4,
    slide: 0.05,
    bob: 0.03,
    duration: 110,
    targetUp: 1.5,
  },
  {
    id: "rear-hero",
    yawOffset: 175,
    distance: 5.6,
    height: 1.55,
    slide: 0.03,
    bob: 0.02,
    duration: 100,
    targetUp: 1.45,
    targetForward: 4.6,
  },
  // ===== FAR SHOTS =====
  {
    id: "far-establishing",
    yawOffset: 126,
    distance: 15.5,
    height: 7.2,
    slide: 0.1,
    bob: 0.04,
    duration: 135,
    targetUp: 1.35,
  },
  {
    id: "epic-overlook",
    yawOffset: -112,
    distance: 18.5,
    height: 10.8,
    slide: 0.1,
    bob: 0.04,
    duration: 145,
    targetUp: 1.35,
  },
  {
    id: "far-back",
    yawOffset: 180,
    distance: 14.0,
    height: 5.0,
    slide: 0.08,
    bob: 0.035,
    duration: 130,
    targetUp: 1.4,
  },
  {
    id: "far-side",
    yawOffset: 90,
    distance: 16.0,
    height: 6.0,
    slide: 0.09,
    bob: 0.04,
    duration: 135,
    targetUp: 1.4,
  },
  // ===== EXTREME CINEMATIC =====
  {
    id: "top-down",
    yawOffset: 180,
    distance: 0,
    height: 14.5,
    slide: 0,
    bob: 0.05,
    duration: 95,
    targetUp: 1.1,
  },
  {
    id: "tower-shot",
    yawOffset: 18,
    distance: 7.2,
    height: 8.5,
    slide: 0.04,
    bob: 0.03,
    duration: 105,
    targetUp: 1.2,
  },
  {
    id: "dutch-hero",
    yawOffset: 52,
    distance: 6.8,
    height: 1.3,
    slide: 0.05,
    bob: 0.025,
    duration: 100,
    targetUp: 1.65,
  },
  // ===== EXTRA VARIETY =====
  {
    id: "orbit-close",
    yawOffset: 45,
    distance: 3.2,
    height: 1.7,
    slide: 0.06,
    bob: 0.02,
    duration: 95,
    targetUp: 1.5,
  },
  {
    id: "orbit-wide",
    yawOffset: -45,
    distance: 9.5,
    height: 3.2,
    slide: 0.08,
    bob: 0.03,
    duration: 120,
    targetUp: 1.45,
  },
  {
    id: "low-wide",
    yawOffset: 25,
    distance: 10.5,
    height: 0.8,
    slide: 0.07,
    bob: 0.03,
    duration: 120,
    targetUp: 1.8,
  },
  {
    id: "cinematic-back",
    yawOffset: 170,
    distance: 12.0,
    height: 2.5,
    slide: 0.06,
    bob: 0.03,
    duration: 130,
    targetUp: 1.4,
  },
  {
    id: "cinematic-front",
    yawOffset: 0,
    distance: 11.5,
    height: 2.8,
    slide: 0.06,
    bob: 0.03,
    duration: 130,
    targetUp: 1.4,
  },
  {
    id: "sky-orbit",
    yawOffset: 90,
    distance: 6.0,
    height: 12.0,
    slide: 0.08,
    bob: 0.04,
    duration: 120,
    targetUp: 1.2,
  },
];

// state ของผู้เล่นแต่ละคน / handle interval ของ warning และ action bar
const playerStates = new Map();
const warningIntervals = new Map();
const actionBarIntervals = new Map();

// คืน object { x, y, z } จาก location — ป้องกัน reference ค้าง
function clonePosition(location) {
  return { x: location.x, y: location.y, z: location.z };
}

// คืน object { x, y } จาก rotation — ป้องกัน reference ค้าง
function cloneRotation(rotation) {
  return { x: rotation.x, y: rotation.y };
}

// ยกเลิก system.runInterval handle แล้วลบออกจาก Map
function clearTrackedRun(store, key) {
  const handle = store.get(key);
  if (handle !== undefined) {
    system.clearRun(handle);
    store.delete(key);
  }
}

// ส่งข้อความ action bar โดยไม่ throw ถ้า player ออกไปแล้ว
function safeActionBar(player, message) {
  try {
    player.onScreenDisplay.setActionBar(message);
  } catch {}
}

// รัน command บน player โดยไม่ throw ถ้า player ออกไปแล้ว
function safeCommand(player, command) {
  try {
    player.runCommand(command);
  } catch {}
}

// ส่งข้อความ chat โดยไม่ throw ถ้า player ออกไปแล้ว
function safeChat(player, message) {
  try {
    player.sendMessage(message);
  } catch {}
}

// ยกเลิก interval ที่ค้างอยู่แล้ว clear action bar ทันที 1 ครั้ง
function clearActionBar(player) {
  clearTrackedRun(actionBarIntervals, player.id);
  safeActionBar(player, "");
}

// ยกเลิก countdown warning interval ของ player
function stopWarning(playerId) {
  clearTrackedRun(warningIntervals, playerId);
}

// คำนวณจำนวน tick ที่ต้อง idle ก่อนเข้า AFK (ใช้เป็น fallback ถ้า cache miss)
function getIdleTicks(state) {
  return Math.max(CONFIG.minIdleSeconds, state.idleSeconds) * 20;
}

// คำนวณจำนวน tick ของช่วง warning ก่อนเข้า AFK (ใช้เป็น fallback ถ้า cache miss)
function getWarningTicks(state) {
  return Math.min(
    CONFIG.warningSeconds * 20,
    Math.max(20, getIdleTicks(state) - 20),
  );
}

// เปิด interval นับถอยหลังแสดง action bar "AFK in Xs" แล้วหยุดเองเมื่อหมดเวลา
function startWarning(player, state) {
  stopWarning(player.id);
  clearTrackedRun(actionBarIntervals, player.id);

  const warningTicks = getWarningTicks(state);
  let elapsed = 0;

  const show = () => {
    const secondsLeft = Math.max(0, Math.ceil((warningTicks - elapsed) / 20));
    safeActionBar(player, `§eAFK Cinematic in §c${secondsLeft}s`);
  };

  show();

  const handle = system.runInterval(() => {
    elapsed++;
    if (elapsed >= warningTicks) {
      stopWarning(player.id);
      return;
    }
    show();
  }, 1);

  warningIntervals.set(player.id, handle);
}

// Polynomial hash ของ string → uint32 ใช้เป็น seed สำหรับ shot sequence
function hashString(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index++) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

// Wrap yaw ให้อยู่ในช่วง (-180, 180] ด้วย modulo — O(1) ไม่มี loop
function normalizeYaw(yaw) {
  return ((((yaw + 180) % 360) + 360) % 360) - 180;
}

// ความต่างระหว่างสอง yaw โดย normalize ก่อนเพื่อข้าม ±180 ได้ถูกต้อง
function angleDifference(current, previous) {
  return Math.abs(normalizeYaw(current - previous));
}

// ระยะ 3D Euclidean ระหว่างสองจุด
function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Linear interpolate ระหว่างสองจุด 3D — amount 0 = a, 1 = b
function lerpPosition(a, b, amount) {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
    z: a.z + (b.z - a.z) * amount,
  };
}

// แปลง forward/right/up ตาม yaw → offset 3D โลก ใช้คำนวณตำแหน่งกล้อง
function rotateRelative(yaw, forward, right, up = 0) {
  const radians = (yaw * Math.PI) / 180;
  return {
    x: -Math.sin(radians) * forward + Math.cos(radians) * right,
    y: up,
    z: Math.cos(radians) * forward + Math.sin(radians) * right,
  };
}

// สร้าง array shot 30 ตัวจาก SHOT_LIBRARY โดย offset yaw + สุ่ม mirror จาก seed
function buildShotSequence(baseYaw, seed) {
  const sequence = [];
  const startIndex = seed % SHOT_LIBRARY.length;

  for (let index = 0; index < SHOT_LIBRARY.length; index++) {
    const template = SHOT_LIBRARY[(startIndex + index) % SHOT_LIBRARY.length];
    const mirrored = ((seed >> (index % 8)) & 1) === 1 ? -1 : 1;
    sequence.push({
      yaw: normalizeYaw(baseYaw + template.yawOffset * mirrored),
      distance: template.distance,
      height: template.height,
      slide: template.slide,
      bob: template.bob,
      duration: template.duration,
      targetUp: template.targetUp,
      targetForward: template.targetForward ?? 0,
      targetRight: (template.targetRight ?? 0) * mirrored,
    });
  }

  return sequence;
}

// ดึง state ของ player จาก Map — ถ้ายังไม่มีให้สร้างใหม่พร้อม cache
function ensureState(player) {
  let state = playerStates.get(player.id);
  if (state) {
    return state;
  }

  state = {
    lastPosition: clonePosition(player.location),
    lastRotation: cloneRotation(player.getRotation()),
    dimensionId: player.dimension.id,
    idleTicks: 0,
    idleSeconds: CONFIG.defaultIdleSeconds,
    idleTicksCache: CONFIG.defaultIdleSeconds * 20, // cache ป้องกันคำนวณซ้ำทุก tick
    warningTicksCache: Math.min(
      CONFIG.warningSeconds * 20,
      Math.max(20, CONFIG.defaultIdleSeconds * 20 - 20),
    ),
    isAfk: false,
    anchor: clonePosition(player.location),
    baseYaw: player.getRotation().y,
    sequence: [],
    sequenceIndex: 0,
    shotTicks: 0,
    originalNameTag: player.nameTag,
    waveClock: Math.random() * Math.PI * 2,
  };

  playerStates.set(player.id, state);
  return state;
}

// บันทึก position/rotation/dimension ล่าสุดลง state — รับ cached loc/rot เพื่อไม่ access ซ้ำ
function refreshBaseline(player, state, loc, rot) {
  state.lastPosition = clonePosition(loc ?? player.location);
  state.lastRotation = cloneRotation(rot ?? player.getRotation());
  state.dimensionId = player.dimension.id;
}

// ตรวจว่า player ขยับหรือเปล่า โดยใช้ cached loc/rot จาก main loop — ไม่ access property เอง
function hasMoved(player, state, loc, rot) {
  if (player.dimension.id !== state.dimensionId) {
    return true;
  }

  const dx = Math.abs(loc.x - state.lastPosition.x);
  const dy = Math.abs(loc.y - state.lastPosition.y);
  const dz = Math.abs(loc.z - state.lastPosition.z);
  const yawDelta = angleDifference(rot.y, state.lastRotation.y);
  const pitchDelta = Math.abs(rot.x - state.lastRotation.x);

  return (
    dx > CONFIG.movementTolerance ||
    dy > CONFIG.movementTolerance ||
    dz > CONFIG.movementTolerance ||
    yawDelta > CONFIG.rotationTolerance ||
    pitchDelta > CONFIG.rotationTolerance
  );
}

// คำนวณ pitch/yaw ให้กล้องที่ from หันไปหา target
function faceTarget(from, target) {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const dz = target.z - from.z;
  const horizontal = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));

  return {
    pitch: -((Math.atan2(dy, horizontal) * 180) / Math.PI),
    yaw: normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI)),
  };
}

const blockCache = new Map();

function getBlockTypeId(dimension, position) {
  const x = Math.floor(position.x);
  const y = Math.floor(position.y);
  const z = Math.floor(position.z);
  const key = `${dimension.id}:${x},${y},${z}`;

  const cached = blockCache.get(key);
  if (cached !== undefined) return cached === "null" ? undefined : cached;

  try {
    const typeId = dimension.getBlock({ x, y, z })?.typeId;
    blockCache.set(key, typeId ?? "null");
    return typeId;
  } catch {
    blockCache.set(key, "null");
    return undefined;
  }
}

// ตรวจว่า block typeId นั้นกล้องทะลุผ่านได้ (อากาศ น้ำ หญ้า ฯลฯ)
function isPassThroughType(typeId) {
  return typeId !== undefined && PASS_THROUGH_BLOCKS.has(typeId);
}

// ตรวจว่าตำแหน่งนั้นกล้องผ่านได้ไหม — รวม query + check ในขั้นตอนเดียว
function isPassablePosition(dimension, position) {
  return isPassThroughType(getBlockTypeId(dimension, position));
}

// เลื่อนตำแหน่งขึ้น 0.5 ต่อรอบสูงสุด 6 ครั้งจนกล้องไม่อยู่ในบล็อก
// skipLift = true สำหรับ shot สูง (height > 5) เพื่อ skip การ query ที่ไม่จำเป็น
function liftAboveCollision(dimension, position, skipLift = false) {
  if (skipLift) return position;

  let lifted = clonePosition(position);

  for (let tries = 0; tries < 6; tries++) {
    if (isPassablePosition(dimension, lifted)) {
      return lifted;
    }
    lifted = { x: lifted.x, y: lifted.y + 0.5, z: lifted.z };
  }

  return lifted;
}

// Ray-march จาก focus ไปยัง desired ≤ MAX_COLLISION_STEPS ขั้น
// ถ้าชนบล็อกจะถอยหลัง collisionBuffer — skip lift ถ้า shotHeight > 5
function pullCameraForward(dimension, focus, desired, shotHeight = 0) {
  const travel = distanceBetween(focus, desired);
  if (travel <= 0.001) {
    return liftAboveCollision(dimension, desired, shotHeight > 5.0);
  }

  const steps = Math.min(
    MAX_COLLISION_STEPS,
    Math.max(2, Math.ceil(travel / CONFIG.collisionStep)),
  );
  let safe = clonePosition(focus);

  for (let index = 1; index <= steps; index++) {
    const sample = lerpPosition(focus, desired, index / steps);
    if (!isPassablePosition(dimension, sample)) {
      const retreat = Math.min(1, CONFIG.collisionBuffer / travel);
      return liftAboveCollision(
        dimension,
        lerpPosition(safe, focus, retreat),
        shotHeight > 5.0,
      );
    }
    safe = sample;
  }

  return liftAboveCollision(dimension, desired, shotHeight > 5.0);
}

// คำนวณ position + rotation กล้องสำหรับ tick นี้ รับ cached loc เพื่อไม่ access ซ้ำ
function getCameraFrame(player, state, loc) {
  const playerLoc = loc ?? player.location;
  const shot = state.sequence[state.sequenceIndex];
  const progress = shot.duration <= 0 ? 0 : state.shotTicks / shot.duration;
  const breath = Math.sin(state.waveClock + progress * Math.PI * 2);
  const drift = Math.cos(state.waveClock * 0.7 + progress * Math.PI * 2);
  const anchor = state.anchor;

  const desiredOffset = rotateRelative(
    shot.yaw,
    shot.distance,
    drift * shot.slide,
    shot.height + breath * shot.bob,
  );

  const desiredPosition = {
    x: anchor.x + desiredOffset.x,
    y: anchor.y + desiredOffset.y,
    z: anchor.z + desiredOffset.z,
  };

  const targetOffset = rotateRelative(
    state.baseYaw,
    shot.targetForward,
    shot.targetRight,
    shot.targetUp,
  );

  const target = {
    x: playerLoc.x + targetOffset.x,
    y: playerLoc.y + targetOffset.y,
    z: playerLoc.z + targetOffset.z,
  };

  const resolvedPosition = pullCameraForward(
    player.dimension,
    target,
    desiredPosition,
    shot.height,
  );
  const rotation = faceTarget(resolvedPosition, target);

  return { position: resolvedPosition, rotation };
}

// เริ่ม AFK mode: ตั้ง anchor, สร้าง shot sequence, ซ่อน HUD, ตั้ง FOV
function startAfk(player, state) {
  stopWarning(player.id);
  clearActionBar(player);

  state.isAfk = true;
  state.idleTicks = getIdleTicks(state);
  state.anchor = clonePosition(player.location);
  state.baseYaw = player.getRotation().y;
  state.sequence = buildShotSequence(state.baseYaw, hashString(player.id));
  state.sequenceIndex = 0;
  state.shotTicks = 0;
  state.waveClock = Math.random() * Math.PI * 2;
  state.originalNameTag = player.nameTag;

  player.nameTag = `§7[AFK] §f${state.originalNameTag}`;
  safeCommand(player, "hud @s hide all");
  safeCommand(player, `camera @s fov_set ${CONFIG.cinematicFov}`);
}

// ออกจาก AFK mode: reset กล้อง HUD nameTag และล้าง interval ทั้งหมด
function stopAfk(player, state) {
  state.isAfk = false;
  state.idleTicks = 0;
  state.sequenceIndex = 0;
  state.shotTicks = 0;

  safeCommand(player, "camera @s clear");
  safeCommand(player, "camera @s fov_clear 0.2 linear");
  safeCommand(player, "hud @s reset");
  player.nameTag = state.originalNameTag;

  stopWarning(player.id);
  clearTrackedRun(actionBarIntervals, player.id);
  clearActionBar(player);
}

// นับ idle tick — ใช้ cache เพื่อ trigger warning / AFK โดยไม่คำนวณซ้ำ
function updateIdlePlayer(player, state, ticksToAdd = 1) {
  for (let i = 0; i < ticksToAdd; i++) {
    state.idleTicks++;
    const idleTicks = state.idleTicksCache ?? getIdleTicks(state);
    const warningTicks = state.warningTicksCache ?? getWarningTicks(state);

    if (state.idleTicks === idleTicks - warningTicks) {
      startWarning(player, state);
    }

    if (state.idleTicks >= idleTicks) {
      startAfk(player, state);
      break;
    }
  }
}

// ส่ง camera command 1 tick แล้วเลื่อน shot index เมื่อ shot หมด duration — รับ cached loc
function updateAfkCamera(player, state, loc) {
  const frame = getCameraFrame(player, state, loc);
  safeCommand(
    player,
    `camera @s set minecraft:free pos ${frame.position.x.toFixed(3)} ${frame.position.y.toFixed(3)} ${frame.position.z.toFixed(3)} rot ${frame.rotation.pitch.toFixed(3)} ${frame.rotation.yaw.toFixed(3)}`,
  );

  state.shotTicks++;
  const shot = state.sequence[state.sequenceIndex];
  if (state.shotTicks >= shot.duration) {
    state.sequenceIndex = (state.sequenceIndex + 1) % state.sequence.length;
    state.shotTicks = 0;
    state.waveClock = Math.random() * Math.PI * 2;
  }
}

// ตั้ง idle threshold ใหม่ + อัปเดต cache ทั้งสองค่าทันที
function setPlayerIdleTime(player, seconds) {
  const state = ensureState(player);
  const clampedSeconds = Math.max(
    CONFIG.minIdleSeconds,
    Math.min(CONFIG.maxIdleSeconds, Math.floor(seconds)),
  );

  state.idleSeconds = clampedSeconds;
  state.idleTicks = 0;
  state.idleTicksCache = clampedSeconds * 20;
  state.warningTicksCache = Math.min(
    CONFIG.warningSeconds * 20,
    Math.max(20, state.idleTicksCache - 20),
  );
  stopWarning(player.id);
  refreshBaseline(player, state);

  safeChat(player, `§7[AFK] Start time set to §e${clampedSeconds}§7 seconds.`);
}

// Force เข้า AFK mode ทันทีโดยไม่รอ idle — ตรวจก่อนว่ากำลัง AFK อยู่แล้วหรือเปล่า
function startCinematicNow(player) {
  const state = ensureState(player);

  if (state.isAfk) {
    safeChat(player, "§7[AFK] Cinematic+ is already running.");
    return;
  }

  stopWarning(player.id);
  refreshBaseline(player, state);
  startAfk(player, state);
}

const quckCommandAFK = (origin) => {
  const player = origin.sourceEntity;

  if (!player || !player.isValid) {
    return { status: CustomCommandStatus.Failure };
  }

  system.run(() => {
    startCinematicNow(player);
  });
};

function registerCommandAFK(init) {
  const commandData = {
    name: "addon:afk",
    description: "Enter AFK Cinematic mode immediately.",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  };

  init.customCommandRegistry.registerCommand(commandData, quckCommandAFK);
}

export { registerCommandAFK };

// =====================================================================
//                         Main Loop
// ======================================================================

// Fast Loop (1 Tick): คุมกล้อง Cinematic ให้ลื่นไหล และให้ผู้เล่นหลุด AFK ทันทีที่ขยับตัว
system.runInterval(() => {
  blockCache.clear();

  for (const player of world.getAllPlayers()) {
    const state = ensureState(player);
    if (!state.isAfk) continue;

    const loc = player.location;
    const rot = player.getRotation();

    if (hasMoved(player, state, loc, rot)) {
      stopAfk(player, state);
      state.anchor = clonePosition(loc);
    } else {
      updateAfkCamera(player, state, loc);
    }
  }
}, 1);

// Slow Loop (20 Ticks = 1 วินาที): เช็คคนปกติว่ายืนนิ่งหรือไม่ ลดภาระเซิร์ฟเวอร์ลง 20 เท่าสำหรับคนที่ยังไม่ AFK
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const state = ensureState(player);
    if (state.isAfk) continue;

    const loc = player.location;
    const rot = player.getRotation();

    if (hasMoved(player, state, loc, rot)) {
      refreshBaseline(player, state, loc, rot);
      state.idleTicks = 0;
      if (warningIntervals.has(player.id)) {
        stopWarning(player.id);
        clearActionBar(player);
      }
      state.anchor = clonePosition(loc);
    } else {
      updateIdlePlayer(player, state, 20);
    }
  }
}, 20);

function playerLeaveAfk(playerId) {
  if (!playerId) return;

  stopWarning(playerId);
  clearTrackedRun(actionBarIntervals, playerId);
  playerStates.delete(playerId);
}
export { playerLeaveAfk };
