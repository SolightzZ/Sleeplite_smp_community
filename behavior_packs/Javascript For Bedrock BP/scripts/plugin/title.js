import { Registry } from '../events/registry.js';

const BOSS_IDS = new Set(['minecraft:ender_dragon', 'minecraft:wither']);
const BOSS_TAG = 'boss';
const RADIUS = 128;
const RADIUS_SQ = RADIUS * RADIUS;

const activeAnimations = [];

const formatName = (id) => {
   const parts = id.replace('minecraft:', '').split('_');
   let text = '';

   for (const part of parts) {
      if (!part) continue;
      if (text) text += ' ';
      text += part[0].toUpperCase() + part.slice(1);
   }

   return text;
};

const collectPlayersByDimension = (players) => {
   const playersByDimension = new Map();

   for (const player of players) {
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

const getNearbyPlayers = (origin, candidates, out) => {
   if (!candidates || candidates.length === 0) return;

   const ex = origin.x;
   const ey = origin.y;
   const ez = origin.z;

   for (const player of candidates) {
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
   spawnLocation: { x: entity.location.x, y: entity.location.y, z: entity.location.z },
   finalSound: isDeath ? 'mob.warden.death' : 'ambient.weather.thunder',
   finalText: `${isDeath ? '§c' : '§e'}- ${bossName} -`,
   charIndex: 0,
   maxCharIndex: bossName.length,
});

const playAnimationStep = (animation, playersByDimension, recipients) => {
   const {
      entity,
      bossName,
      subtitle,
      spawnLocation,
      finalSound,
      finalText,
      charIndex,
      maxCharIndex,
   } = animation;
   if (!entity || !entity.isValid || charIndex > maxCharIndex) return false;

   const options = {
      fadeInDuration: 0,
      fadeOutDuration: 50,
      stayDuration: 80,
      subtitle,
   };

   const dimId = entity.dimension.id;

   recipients.length = 0;

   getNearbyPlayers(spawnLocation, playersByDimension.get(dimId), recipients);

   if (recipients.length === 0) return true;

   const isFinal = charIndex === maxCharIndex;
   const titleText = isFinal ? finalText : bossName.slice(0, charIndex + 1);

   for (const player of recipients) {
      player.onScreenDisplay.setTitle(titleText, options);
      if (isFinal) {
         player.playSound(finalSound, { volume: 0.5, pitch: 1 });
      }
   }

   animation.charIndex++;
   return animation.charIndex <= maxCharIndex;
};

export const processActiveAnimations = () => {
   if (activeAnimations.length === 0) return;

   // ดึงรายชื่อผู้เล่นออนไลน์จาก Registry เพื่อหลีกเลี่ยง overhead ของการวนหาแบบ O(N) ใน tick loop ถี่ๆ
   const onlinePlayers = Registry.getPlayers();
   const playersByDimension = collectPlayersByDimension(onlinePlayers);
   const recipients = [];

   for (let index = 0; index < activeAnimations.length; index++) {
      const animation = activeAnimations[index];
      const keepRunning = playAnimationStep(animation, playersByDimension, recipients);

      if (keepRunning) continue;
      const lastIndex = activeAnimations.length - 1;
      activeAnimations[index] = activeAnimations[lastIndex];

      activeAnimations.pop();

      index--;
   }
};

const enqueueBossTitle = (entity, subtitle, isDeath) => {
   activeAnimations.push(createAnimation(entity, formatName(entity.typeId), subtitle, isDeath));
};

export const itile_main = (event) => {
   const entity = event.entity;
   if (!entity || !entity.isValid || !BOSS_IDS.has(entity.typeId) || entity.hasTag(BOSS_TAG))
      return;
   entity.addTag(BOSS_TAG);
   enqueueBossTitle(entity, 'Spawn', false);
};
