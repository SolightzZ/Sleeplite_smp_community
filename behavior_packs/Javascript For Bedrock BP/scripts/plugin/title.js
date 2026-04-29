import { world, system } from "@minecraft/server";

const BOSS_IDS = ["minecraft:ender_dragon", "minecraft:wither"];
const BOSS_TAG = "boss";

const TICK_DELAY = 5;
const TITLE_TICKS = 80;
const DISPLAY_RADIUS = 100;
const DISPLAY_RADIUS_SQ = DISPLAY_RADIUS * DISPLAY_RADIUS;

const modwarden = "mob.warden.death";
const weatherthunder = "ambient.weather.thunder";
const mc = "minecraft:";
const withershoot = "mob.wither.shoot";

const formatName = (entityId) => {
  return entityId
    .replace(mc, "")
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

const getNearbyPlayers = (entity) => {
  const { x, y, z } = entity.location;
  const dimId = entity.dimension.id;

  return world.getPlayers().filter((p) => {
    if (p.dimension.id !== dimId) return false;

    const dx = p.location.x - x;
    const dy = p.location.y - y;
    const dz = p.location.z - z;

    return dx * dx + dy * dy + dz * dz <= DISPLAY_RADIUS_SQ;
  });
};

const displayBossTitle = (entity, name, subtitle, isDeathEvent) => {
  let charIndex = 0;

  const finalSound = isDeathEvent ? modwarden : weatherthunder;

  const titleOptions = {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: TITLE_TICKS,
    subtitle,
  };

  const animate = () => {
    if (!entity || !entity.dimension) return;

    const players = getNearbyPlayers(entity);
    if (!players.length) {
      system.runTimeout(animate, TICK_DELAY);
      return;
    }

    if (charIndex > name.length) return;

    const currentTitle =
      charIndex === name.length
        ? isDeathEvent
          ? `§c- ${name} -`
          : `§e- ${name} -`
        : name.slice(0, charIndex + 1);

    for (const player of players) {
      player.onScreenDisplay.setTitle(currentTitle, titleOptions);
      player.playSound(withershoot);

      if (charIndex === name.length) {
        player.playSound(finalSound, { volume: 0.5, pitch: 1 });
      }
    }

    charIndex++;
    system.runTimeout(animate, TICK_DELAY);
  };

  animate();
};

export function itile_main(event) {
  const entity = event.entity;
  if (!entity) return;

  if (!BOSS_IDS.includes(entity.typeId)) return;
  if (entity.hasTag(BOSS_TAG)) return;

  entity.addTag(BOSS_TAG);
  displayBossTitle(entity, formatName(entity.typeId), "Spawn", false);
}
