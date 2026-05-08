import { system, world } from "@minecraft/server";

const BOSS_IDS = new Set(["minecraft:ender_dragon", "minecraft:wither"]);
const BOSS_TAG = "boss";

const TICK_DELAY = 5;
const TITLE_TICKS = 80;
const DISPLAY_RADIUS = 100;
const DISPLAY_RADIUS_SQ = DISPLAY_RADIUS * DISPLAY_RADIUS;

const SND_DEATH = "mob.warden.death";
const SND_THUNDER = "ambient.weather.thunder";
const SND_SHOOT = "mob.wither.shoot";

const formatName = (entityId) => {
  const raw = entityId.replace("minecraft:", "");
  const parts = raw.split("_");
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) out += " ";
    out += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
  }
  return out;
};

const getNearbyPlayers = (entity, out) => {
  const ex = entity.location.x;
  const ey = entity.location.y;
  const ez = entity.location.z;
  const dimId = entity.dimension.id;
  const all = world.getPlayers();
  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    if (p.dimension.id !== dimId) continue;
    const dx = p.location.x - ex;
    const dy = p.location.y - ey;
    const dz = p.location.z - ez;
    if (dx * dx + dy * dy + dz * dz <= DISPLAY_RADIUS_SQ) out.push(p);
  }
};

const displayBossTitle = (entity, name, subtitle, isDeathEvent) => {
  const finalSound = isDeathEvent ? SND_DEATH : SND_THUNDER;
  const titleOptions = {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: TITLE_TICKS,
    subtitle,
  };

  let charIndex = 0;
  const nameLen = name.length;
  const players = [];

  const animate = () => {
    if (!entity?.isValid()) return;

    players.length = 0;
    getNearbyPlayers(entity, players);

    if (players.length === 0) {
      system.runTimeout(animate, TICK_DELAY);
      return;
    }

    if (charIndex > nameLen) return;

    const isFinal = charIndex === nameLen;
    const currentTitle = isFinal
      ? (isDeathEvent ? `§c- ${name} -` : `§e- ${name} -`)
      : name.slice(0, charIndex + 1);

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player.isValid()) continue;
      player.onScreenDisplay.setTitle(currentTitle, titleOptions);
      player.playSound(SND_SHOOT);
      if (isFinal) player.playSound(finalSound, { volume: 0.5, pitch: 1 });
    }

    charIndex++;
    system.runTimeout(animate, TICK_DELAY);
  };

  animate();
};

export const itile_main = (event) => {
  const entity = event.entity;
  if (!entity?.isValid()) return;
  if (!BOSS_IDS.has(entity.typeId)) return;
  if (entity.hasTag(BOSS_TAG)) return;

  entity.addTag(BOSS_TAG);
  displayBossTitle(entity, formatName(entity.typeId), "Spawn", false);
};
