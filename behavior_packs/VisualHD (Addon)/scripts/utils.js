import { BLOOD_PARTICLES, DAMAGE_CAUSE, DROWN_MSGS, DROWN_SOUND, EXP_MSGS, EXP_SOUNDS, FLAME_MSGS, IMPACT_MSGS, SEV_MSGS, THRESHOLDS } from './config.js';

const randElem = (arr) => arr[(Math.random() * arr.length) | 0];

export const deleteCooldown = (cooldowns, playerId) => cooldowns.delete(playerId);

export const isCooldownActive = (cooldowns, playerId, tick, ticks) => tick - (cooldowns.get(playerId) ?? 0) < ticks;

export const markCooldown = (cooldowns, playerId, tick) => cooldowns.set(playerId, tick);

const getExpTier = (damage) => {
   const { EXP_TIER_LOW, EXP_TIER_MED, EXP_TIER_HIGH } = THRESHOLDS;
   return damage < EXP_TIER_LOW ? -1 : damage < EXP_TIER_MED ? 0 : damage < EXP_TIER_HIGH ? 1 : 2;
};

const sevTier = (dmg) => (dmg < THRESHOLDS.DMG_SEV_WEAK ? 0 : dmg < THRESHOLDS.DMG_SEV_HARD ? 1 : 2);

export const buildHurtEffect = (damage, cause) => {
   const { IMPACT, EXPLOSION, FLAME } = DAMAGE_CAUSE;
   let msg = SEV_MSGS[sevTier(damage)];
   let sound = null;
   let blood = null;

   if (IMPACT.has(cause)) {
      blood = randElem(BLOOD_PARTICLES);
      msg += ' ' + randElem(IMPACT_MSGS);
   }

   if (EXPLOSION.has(cause)) {
      const tier = getExpTier(damage);
      if (tier >= 0) {
         msg += ' ' + EXP_MSGS[tier];
         sound = EXP_SOUNDS[tier];
      }
   }

   if (FLAME.has(cause)) msg += ' ' + randElem(FLAME_MSGS);

   if (cause === DAMAGE_CAUSE.DROWNING) {
      msg += ' ' + randElem(DROWN_MSGS);
      sound = DROWN_SOUND;
   }

   return { message: msg, sound, bloodParticle: blood };
};
