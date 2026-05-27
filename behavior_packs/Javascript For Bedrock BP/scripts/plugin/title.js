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
const SUBTITLE_SPAWN = "Spawn";

const activeAnimations = [];
let animationIntervalId;

const formatName = (id) => {
  const parts = id.replace("minecraft:", "").split("_");
  let text = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (text) text += " ";
    text += part[0].toUpperCase() + part.slice(1);
  }

  return text;
};

const collectPlayersByDimension = (players) => {
  const playersByDimension = new Map();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    if (!player || !player.isValid) continue;
    const dimId = player.dimension.id;
    let bucket = playersByDimension.get(dimId);

    if (!bucket) {
      bucket = [];
      playersByDimension.set(dimId, bucket);
    }

    bucket.push(player);
  }

  return playersByDimension;
};

const getNearbyPlayers = (entity, candidates, out) => {
  if (!candidates || candidates.length === 0) return;

  const eloc = entity.location;
  const ex = eloc.x;
  const ey = eloc.y;
  const ez = eloc.z;

  for (let i = 0; i < candidates.length; i++) {
    const player = candidates[i];
    const dx = player.location.x - ex;
    const dy = player.location.y - ey;
    const dz = player.location.z - ez;

    if (dx * dx + dy * dy + dz * dz <= RADIUS_SQ) out.push(player);
  }
};

const createAnimation = (entity, bossName, subtitle, isDeath) => ({
  entity,
  bossName,
  subtitle,
  finalSound: isDeath ? SND_DEATH : SND_THUNDER,
  finalText: `${isDeath ? "§c" : "§e"}- ${bossName} -`,
  charIndex: 0,
  maxCharIndex: bossName.length,
});

const playAnimationStep = (animation, playersByDimension, recipients) => {
  const { entity, bossName, subtitle, finalSound, finalText, charIndex, maxCharIndex } = animation;
  if (!entity || !entity.isValid || charIndex > maxCharIndex) return false;

  const options = {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: TITLE_TICKS,
    subtitle,
  };

  const dimId = entity.dimension.id;

  recipients.length = 0;

  getNearbyPlayers(entity, playersByDimension.get(dimId), recipients);

  if (recipients.length === 0) return true;

  const isFinal = charIndex === maxCharIndex;
  const titleText = isFinal ? finalText : bossName.slice(0, charIndex + 1);

  for (let i = 0; i < recipients.length; i++) {
    const player = recipients[i];
    player.onScreenDisplay.setTitle(titleText, options);
    if (isFinal) {
      player.playSound(finalSound, { volume: 0.5, pitch: 1 });
    }
  }

  animation.charIndex++;
  return animation.charIndex <= maxCharIndex;
};

const processActiveAnimations = () => {
  if (activeAnimations.length === 0) {
    if (animationIntervalId !== undefined) {
      system.clearRun(animationIntervalId);
      animationIntervalId = undefined;
    }
    return;
  }

  const onlinePlayers = world.getPlayers();
  const playersByDimension = collectPlayersByDimension(onlinePlayers);
  const recipients = [];

  for (let i = 0; i < activeAnimations.length; i++) {
    const animation = activeAnimations[i];
    const keepRunning = playAnimationStep(animation, playersByDimension, recipients);

    if (keepRunning) continue;
    const lastIndex = activeAnimations.length - 1;
    activeAnimations[i] = activeAnimations[lastIndex];

    activeAnimations.pop();

    i--;
  }
};

const ensureAnimationLoop = () => {
  if (animationIntervalId !== undefined) return;
  animationIntervalId = system.runInterval(processActiveAnimations, TICK_DELAY);
};

const enqueueBossTitle = (entity, subtitle, isDeath) => {
  activeAnimations.push(createAnimation(entity, formatName(entity.typeId), subtitle, isDeath));
  ensureAnimationLoop();
};

export const itile_main = (event) => {
  const entity = event.entity;
  if (!entity || !entity.isValid || !BOSS_IDS.has(entity.typeId) || entity.hasTag(BOSS_TAG)) return;
  entity.addTag(BOSS_TAG);
  enqueueBossTitle(entity, SUBTITLE_SPAWN, false);
};
