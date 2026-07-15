import { BLOOD_PARTICLES, DAMAGE_CAUSE, DROWN_MSGS, DROWN_SOUND, EXP_MSGS, EXP_SOUNDS, FLAME_MSGS, IMPACT_MSGS, SEV_MSGS, THRESHOLDS } from './config.js';

export const randElem = (arr) => arr[(Math.random() * arr.length) | 0];

export const deleteCooldown = (cooldowns, playerId) => cooldowns.delete(playerId);

export const isCooldownActive = (cooldowns, playerId, tick, ticks) =>
   tick - (cooldowns.get(playerId) ?? 0) < ticks;

export const markCooldown = (cooldowns, playerId, tick) => cooldowns.set(playerId, tick);

export const getExpTier = (damage) => {
   const { EXP_TIER_LOW, EXP_TIER_MED, EXP_TIER_HIGH } = THRESHOLDS;
   return damage < EXP_TIER_LOW ? -1 : damage < EXP_TIER_MED ? 0 : damage < EXP_TIER_HIGH ? 1 : 2;
};

export const buildHurtEffect = (damage, cause) => {
   const { IMPACT, EXPLOSION, FLAME } = DAMAGE_CAUSE;
   const parts = new Array(4);

   let partIndex = 0,
      sound = null,
      blood = null;

   parts[partIndex++] = SEV_MSGS[damage < THRESHOLDS.DMG_SEV_WEAK ? 0 : damage < THRESHOLDS.DMG_SEV_HARD ? 1 : 2];

   if (IMPACT.has(cause)) {
      blood = randElem(BLOOD_PARTICLES);
      parts[partIndex++] = randElem(IMPACT_MSGS);
   }

   if (EXPLOSION.has(cause)) {
      const tier = getExpTier(damage);
      if (tier >= 0) {
         parts[partIndex++] = EXP_MSGS[tier];
         sound = EXP_SOUNDS[tier];
      }
   }

   if (FLAME.has(cause)) parts[partIndex++] = randElem(FLAME_MSGS);

   if (cause === DAMAGE_CAUSE.DROWNING) {
      parts[partIndex++] = randElem(DROWN_MSGS);
      sound = DROWN_SOUND;
   }

   parts.length = partIndex;

   return { message: parts.join(' '), sound, bloodParticle: blood };
};
