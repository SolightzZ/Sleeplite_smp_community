import { system, world } from "@minecraft/server";

const BOSS_IDS = new Set(["minecraft:ender_dragon", "minecraft:wither"]);
const BOSS_TAG = "boss";

const TICK_DELAY = 5;
const TITLE_TICKS = 80;
const RADIUS = 100;
const RADIUS_SQ = RADIUS * RADIUS;

const SND_DEATH = "mob.warden.death";
const SND_THUNDER = "ambient.weather.thunder";
const SND_SHOOT = "mob.wither.shoot";

const formatName = (id) => {
  const raw = id.replace("minecraft:", "");
  const parts = raw.split("_");
  const len = parts.length;
  let out = "";
  for (let i = 0; i < len; i++) {
    if (i > 0) out += " ";
    out += parts[i][0].toUpperCase() + parts[i].slice(1);
  }
  return out;
};

const getNearbyPlayers = (entity, out) => {
  const ex = entity.location.x;
  const ey = entity.location.y;
  const ez = entity.location.z;
  const dimId = entity.dimension.id;
  const all = world.getPlayers();
  const allLen = all.length;

  for (let i = 0; i < allLen; i++) {
    const p = all[i];
    if (p.dimension.id !== dimId) continue;
    const dx = p.location.x - ex;
    const dy = p.location.y - ey;
    const dz = p.location.z - ez;
    if (dx * dx + dy * dy + dz * dz <= RADIUS_SQ) out.push(p);
  }
};

const displayBossTitle = (entity, name, subtitle, isDeath) => {
  const finalSound = isDeath ? SND_DEATH : SND_THUNDER;
  const opts = {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: TITLE_TICKS,
    subtitle: subtitle,
  };

  let idx = 0;
  const nameLen = name.length;
  const players = [];

  const animate = () => {
    if (!entity || !entity.isValid) return;

    players.length = 0;
    getNearbyPlayers(entity, players);

    if (players.length === 0) {
      system.runTimeout(animate, TICK_DELAY);
      return;
    }

    if (idx > nameLen) return;

    const isFinal = idx === nameLen;
    const title = isFinal
      ? isDeath
        ? `§c- ${name} -`
        : `§e- ${name} -`
      : name.slice(0, idx + 1);

    const playersLen = players.length;
    for (let i = 0; i < playersLen; i++) {
      const p = players[i];
      if (!p.isValid) continue;
      p.onScreenDisplay.setTitle(title, opts);
      p.playSound(SND_SHOOT);
      if (isFinal) p.playSound(finalSound, { volume: 0.5, pitch: 1 });
    }

    idx++;
    system.runTimeout(animate, TICK_DELAY);
  };

  animate();
};

export const itile_main = (ev) => {
  const entity = ev.entity;
  if (!entity || !entity.isValid) return;
  if (!BOSS_IDS.has(entity.typeId)) return;
  if (entity.hasTag(BOSS_TAG)) return;

  entity.addTag(BOSS_TAG);
  displayBossTitle(entity, formatName(entity.typeId), "Spawn", false);
};
