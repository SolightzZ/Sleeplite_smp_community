import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
  Player,
} from "@minecraft/server";
import { CONFIG, PASS_THROUGH_BLOCKS, SHOT_LIBRARY } from "./Config";

//  Globals
const playerStates = new Map();
const blockCache = new Map();

//  Math helpers
const cloneVec3 = (v) => ({ x: v.x, y: v.y, z: v.z });
const cloneVec2 = (v) => ({ x: v.x, y: v.y });

const normalizeYaw = (y) => ((((y + 180) % 360) + 360) % 360) - 180;
const angleDiff = (a, b) => Math.abs(normalizeYaw(a - b));

const dist3 = (a, b) => {
  const dx = a.x - b.x,
    dy = a.y - b.y,
    dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const lerp3 = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

const rotateRel = (yaw, fwd, right, up = 0) => {
  const r = (yaw * Math.PI) / 180;
  return {
    x: -Math.sin(r) * fwd + Math.cos(r) * right,
    y: up,
    z: Math.cos(r) * fwd + Math.sin(r) * right,
  };
};

const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const faceTarget = (from, to) => {
  const dx = to.x - from.x,
    dy = to.y - from.y,
    dz = to.z - from.z;
  const horiz = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
  return {
    pitch: -((Math.atan2(dy, horiz) * 180) / Math.PI),
    yaw: normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI)),
  };
};

//  Block cache
function getBlockTypeId(dimension, pos) {
  try {
    const x = Math.floor(pos.x),
      y = Math.floor(pos.y),
      z = Math.floor(pos.z);
    const key = `${dimension.id}:${x},${y},${z}`;
    const cached = blockCache.get(key);
    if (cached !== undefined) return cached === "\0" ? undefined : cached;
    try {
      const typeId = dimension.getBlock({ x, y, z })?.typeId;
      blockCache.set(key, typeId ?? "\0");
      return typeId;
    } catch {
      blockCache.set(key, "\0");
      return undefined;
    }
  } catch (error) {
    console.error("getBlockTypeId: " + error);
  }
}

const isPassable = (dim, pos) => {
  return PASS_THROUGH_BLOCKS.has(getBlockTypeId(dim, pos) ?? "");
};

function liftAbove(dim, pos, skipLift = false) {
  try {
    if (skipLift) return pos;
    let p = cloneVec3(pos);
    for (let i = 0; i < 6; i++) {
      if (isPassable(dim, p)) return p;
      p = { x: p.x, y: p.y + 0.5, z: p.z };
    }
    return p;
  } catch (error) {
    console.error("liftAbove: " + error);
  }
}

function pullCamera(dim, focus, desired, shotH = 0) {
  try {
    const travel = dist3(focus, desired);
    if (travel <= 0.001) return liftAbove(dim, desired, shotH > 5);
    const steps = Math.min(
      24,
      Math.max(2, Math.ceil(travel / CONFIG.collisionStep)),
    );
    let safe = cloneVec3(focus);
    for (let i = 1; i <= steps; i++) {
      const sample = lerp3(focus, desired, i / steps);
      if (!isPassable(dim, sample)) {
        const retreat = Math.min(1, CONFIG.collisionBuffer / travel);
        return liftAbove(dim, lerp3(safe, focus, retreat), shotH > 5);
      }
      safe = sample;
    }
    return liftAbove(dim, desired, shotH > 5);
  } catch (error) {
    console.error("pullCamera: " + error);
  }
}

//  State management
function ensureState(player) {
  try {
    let s = playerStates.get(player.id);
    if (s) return s;
    const loc = player.location;
    const rot = player.getRotation();
    s = {
      lastPosition: cloneVec3(loc),
      lastRotation: cloneVec2(rot),
      dimensionId: player.dimension.id,
      idleTicks: 0,
      idleSeconds: CONFIG.defaultIdleSeconds,
      idleSecondsCache: CONFIG.defaultIdleSeconds,
      warningSecondsCache: CONFIG.warningSeconds,
      warningShown: false,
      isAfk: false,
      anchor: cloneVec3(loc),
      baseYaw: rot.y,
      sequence: [],
      sequenceIndex: 0,
      shotTicks: 0,
      waveClock: Math.random() * Math.PI * 2,
    };
    playerStates.set(player.id, s);
    return s;
  } catch (error) {
    console.error("ensureState: " + error);
  }
}

function refreshBaseline(player, s) {
  try {
    s.lastPosition = cloneVec3(player.location);
    s.lastRotation = cloneVec2(player.getRotation());
    s.dimensionId = player.dimension.id;
  } catch (error) {
    console.error("refreshBaseline: " + error);
  }
}

function hasMoved(player, s) {
  try {
    if (player.dimension.id !== s.dimensionId) return true;
    const loc = player.location;
    const rot = player.getRotation();
    return (
      Math.abs(loc.x - s.lastPosition.x) > CONFIG.movementTolerance ||
      Math.abs(loc.y - s.lastPosition.y) > CONFIG.movementTolerance ||
      Math.abs(loc.z - s.lastPosition.z) > CONFIG.movementTolerance ||
      angleDiff(rot.y, s.lastRotation.y) > CONFIG.rotationTolerance ||
      Math.abs(rot.x - s.lastRotation.x) > CONFIG.rotationTolerance
    );
  } catch (error) {
    console.error("hasMoved: " + error);
  }
}

function buildSequence(baseYaw, seed) {
  try {
    const start = seed % SHOT_LIBRARY.length;
    return SHOT_LIBRARY.map((t, i) => {
      const mirror = ((seed >> (i % 8)) & 1) === 1 ? -1 : 1;
      return {
        yaw: normalizeYaw(baseYaw + (t.yawOffset || 0) * mirror),
        distance: t.distance,
        height: t.height,
        slide: t.slide,
        bob: t.bob,
        duration: t.duration,
        targetUp: t.targetUp,
        targetForward: t.targetForward ?? 0,
        targetRight: (t.targetRight ?? 0) * mirror,
      };
    });
  } catch (error) {
    console.error("buildSequence: " + error);
  }
}

//  AFK enter / exit
function startAfk(player, s) {
  try {
    s.isAfk = true;
    s.idleTicks = s.idleSecondsCache;
    s.anchor = cloneVec3(player.location);
    s.baseYaw = player.getRotation().y;
    s.sequence = buildSequence(s.baseYaw, hashStr(player.id));
    s.sequenceIndex = 0;
    s.shotTicks = 0;
    s.waveClock = Math.random() * Math.PI * 2;
    s.warningShown = false;

    player.runCommand("hud @s hide all");
    player.runCommand(`camera @s fov_set ${CONFIG.cinematicFov}`);

    cinematicScheduler.enqueue(player.id);
  } catch (error) {
    console.error("startAfk: " + error);
  }
}

function stopAfk(player, s) {
  try {
    s.isAfk = false;
    s.idleTicks = 0;
    s.warningShown = false;

    cinematicScheduler.dequeue(player.id);

    player.runCommand("camera @s clear");
    player.runCommand("camera @s fov_clear 0.2 linear");
    player.runCommand("hud @s reset");
  } catch (error) {
    console.error("stopAfk: " + error);
  }
}

// Camera frame builder
function getCameraFrame(player, s) {
  try {
    const shot = s.sequence[s.sequenceIndex];
    const progress = shot.duration <= 0 ? 0 : s.shotTicks / shot.duration;
    const breath = Math.sin(s.waveClock + progress * Math.PI * 2);
    const drift = Math.cos(s.waveClock * 0.7 + progress * Math.PI * 2);
    const anchor = s.anchor;
    const loc = player.location;

    const desiredOff = rotateRel(
      shot.yaw,
      shot.distance,
      drift * shot.slide,
      shot.height + breath * shot.bob,
    );
    const desired = {
      x: anchor.x + desiredOff.x,
      y: anchor.y + desiredOff.y,
      z: anchor.z + desiredOff.z,
    };

    const targetOff = rotateRel(
      s.baseYaw,
      shot.targetForward,
      shot.targetRight,
      shot.targetUp,
    );
    const target = {
      x: loc.x + targetOff.x,
      y: loc.y + targetOff.y,
      z: loc.z + targetOff.z,
    };

    const position = pullCamera(player.dimension, target, desired, shot.height);
    return { position, rotation: faceTarget(position, target) };
  } catch (error) {
    console.error("getCameraFrame: " + error);
  }
}

// CinematicScheduler
class CinematicScheduler {
  constructor() {
    this.afkSet = new Set();
    this.intervalId = undefined;
  }

  enqueue(playerId) {
    this.afkSet.add(playerId);
    if (this.intervalId === undefined) {
      this.intervalId = system.runInterval(() => this.tick(), 1);
    }
  }

  dequeue(playerId) {
    this.afkSet.delete(playerId);
    if (this.afkSet.size === 0) this.stop();
  }

  tick() {
    if (this.afkSet.size === 0) {
      this.stop();
      return;
    }

    const players = world.getAllPlayers();
    for (const player of players) {
      if (!this.afkSet.has(player.id)) continue;

      const s = playerStates.get(player.id);
      if (!s?.isAfk) {
        this.dequeue(player.id);
        continue;
      }

      try {
        const frame = getCameraFrame(player, s);
        const p = frame.position,
          r = frame.rotation;
        player.runCommand(
          `camera @s set minecraft:free pos ${p.x.toFixed(3)} ${p.y.toFixed(3)} ${p.z.toFixed(3)} rot ${r.pitch.toFixed(3)} ${r.yaw.toFixed(3)}`,
        );
      } catch (e) {
        console.warn(`[AFK] camera tick error for ${player.id}: ${e}`);
      }

      s.shotTicks++;
      const shot = s.sequence[s.sequenceIndex];
      if (s.shotTicks >= shot.duration) {
        s.sequenceIndex = (s.sequenceIndex + 1) % s.sequence.length;
        s.shotTicks = 0;
        s.waveClock = Math.random() * Math.PI * 2;
      }
    }
  }

  stop() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

const cinematicScheduler = new CinematicScheduler();

function handleIdlePoller() {
  try {
    blockCache.clear();
    const players = world.getAllPlayers();

    for (const player of players) {
      const s = ensureState(player);

      if (s.isAfk) {
        // ตรวจ movement ถ้า player ขยับให้ออก AFK
        if (hasMoved(player, s)) {
          stopAfk(player, s);
          refreshBaseline(player, s);
          s.anchor = cloneVec3(player.location);
        }
        continue;
      }

      if (hasMoved(player, s)) {
        // reset idle
        refreshBaseline(player, s);
        s.idleTicks = 0;
        s.warningShown = false;
        try {
          player.onScreenDisplay.setActionBar("");
        } catch {}
        s.anchor = cloneVec3(player.location);
        continue;
      }

      // ไม่ขยับ — นับ idle ขึ้น 1 วินาที
      s.idleTicks++;

      const totalSecs = s.idleSecondsCache;
      const warnSecs = s.warningSecondsCache;
      const remaining = totalSecs - s.idleTicks;

      // warning zone
      if (!s.warningShown && remaining <= warnSecs) {
        s.warningShown = true;
      }
      if (s.warningShown && remaining > 0) {
        try {
          player.onScreenDisplay.setActionBar(
            `§eAFK Cinematic in §c${remaining}s`,
          );
        } catch {}
      }

      // trigger AFK
      if (s.idleTicks >= totalSecs) {
        startAfk(player, s);
      }
    }
  } catch (error) {
    console.error("handleIdlePoller: " + error);
  }
}

function playerLeaveAfk(playerId) {
  try {
    if (!playerId) return;
    cinematicScheduler.dequeue(playerId);
    playerStates.delete(playerId);
  } catch (error) {
    console.error("playerLeaveAfk: " + error);
  }
}

function setPlayerIdleTime(player, seconds) {
  try {
    const s = ensureState(player);
    const clamped = Math.max(
      CONFIG.minIdleSeconds,
      Math.min(CONFIG.maxIdleSeconds, Math.floor(seconds)),
    );
    s.idleSeconds = clamped;
    s.idleTicks = 0;
    s.idleSecondsCache = clamped;
    s.warningSecondsCache = Math.min(
      CONFIG.warningSeconds,
      Math.max(1, clamped - 1),
    );
    s.warningShown = false;
    refreshBaseline(player, s);
    player.sendMessage(`§7[AFK] Start time set to §e${clamped}§7 seconds.`);
  } catch (error) {
    console.error("setPlayerIdleTime: " + error);
  }
}

function startCinematicNow(player) {
  try {
    const s = ensureState(player);
    if (s.isAfk) {
      player.sendMessage("§7[AFK] Cinematic is already running.");
      return;
    }
    refreshBaseline(player, s);
    startAfk(player, s);
  } catch (error) {
    console.error("startCinematicNow: " + error);
  }
}

//  Command
const quckCommandAFK = (origin) => {
  try {
    const player = origin.sourceEntity;
    if (!player?.isValid) return { status: CustomCommandStatus.Failure };
    system.run(() => startCinematicNow(player));
  } catch (error) {
    console.error("quckCommandAFK: " + error);
  }
};

function registerCommandAFK(init) {
  try {
    init.customCommandRegistry.registerCommand(
      {
        name: "addon:afk",
        description: "Enter AFK Cinematic mode immediately.",
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
      },
      quckCommandAFK,
    );
  } catch (e) {
    console.error("registerCommandAFK:", e);
  }
}

export {
  handleIdlePoller,
  registerCommandAFK,
  setPlayerIdleTime,
  playerLeaveAfk,
};
