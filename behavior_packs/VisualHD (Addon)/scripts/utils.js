
export const MSG = { PREFIX: 'xVis', IMPACT_COUNT: 34, FLAME_COUNT: 8, DROWN_COUNT: 17 };

export const IMPACT_MSGS = Array.from({ length: MSG.IMPACT_COUNT }, (_, i) => (i >= 1 && i <= 3 ? `xVisImpactFixed${i}` : `xVisImpact${i}`));
export const FLAME_MSGS = Array.from({ length: MSG.FLAME_COUNT }, (_, i) => `xVisFlameImpact${i}`);
export const DROWN_MSGS = Array.from({ length: MSG.DROWN_COUNT }, (_, i) => (i === 1 ? `xVisDrowningFixed${i}` : `xVisDrowning${i}`));

export const DAMAGE_CAUSE = {
   IMPACT: new Set([
      'contact',
      'entityAttack',
      'fall',
      'magic',
      'projectile',
      'stalactite',
      'stalagmite',
      'entityExplosion',
      'blockExplosion',
      'anvil',
      'maceSmash',
      'ramAttack',
      'sonicBoom',
      'flyIntoWall',
   ]),
   EXPLOSION: new Set(['entityExplosion', 'blockExplosion', 'anvil', 'maceSmash', 'ramAttack', 'sonicBoom', 'flyIntoWall']),
   FLAME: new Set(['fire', 'fireTick', 'fireworks', 'lava', 'lightning', 'magma', 'campfire', 'soulCampfire']),
};

export const BLOOD_PARTICLES = ['xvisuals:blood_drop0', 'xvisuals:blood_drop1', 'xvisuals:blood_drop2'];

export const EFFECT_MAP = {
   poison: 'xVisPoison',
   fire_resistance: 'xVisFireResistance',
   resistance: 'xVisResistance',
   regeneration: 'xVisRegeneration',
   slow_falling: 'xVisSlowFalling',
   speed: 'xVisSpeed',
   strength: 'xVisStrength',
   slowness: 'xVisSlowness',
   jump_boost: 'xVisJumpBoost',
   night_vision: 'xVisNightVision',
   invisibility: 'xVisInvisibility',
   water_breathing: 'xVisWaterBreathing',
   weakness: 'xVisWeakness',
   wither: 'xVisWither',
   levitation: 'xVisLevitation',
   wind_charged: 'xVisWindCharged',
   weaving: 'xVisWeaving',
   oozing: 'xVisOozing',
   infested: 'xVisInfested',
};

export const SEV_MSGS = ['xVisWeakDamage', 'xVisHardDamage', 'xVisStrongDamage'];
export const EXP_MSGS = ['xVisWeakExplosion', 'xVisHardExplosion', 'xVisStrongExplosion'];
export const EXP_SOUNDS = [
   { id: 'x.visuals.ear_ring.0', volume: 0.15 },
   { id: 'x.visuals.ear_ring.0', volume: 0.35 },
   { id: 'x.visuals.ear_ring.1', volume: 0.25 },
];

export const getExpTier = (damage) => (damage < 4 ? -1 : damage < 9 ? 0 : damage < 14 ? 1 : 2);

export const MAX_HURT = 64;
export const HURT_MASK = 63;
export const MAX_EFF = 32;
export const EFF_MASK = 31;

export const randElem = (arr) => arr[(Math.random() * arr.length) | 0];


export const buildHurtEffect = (damage, cause) => {
   const { IMPACT, EXPLOSION, FLAME } = DAMAGE_CAUSE;
   const parts = new Array(4);

   let partIndex = 0,
      sound = null,
      blood = null;

   parts[partIndex++] = SEV_MSGS[damage < 7 ? 0 : damage < 14 ? 1 : 2];

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

   if (cause === 'drowning') {
      parts[partIndex++] = randElem(DROWN_MSGS);
      sound = { id: 'mob.drowned.death', volume: 0.8 };
   }

   parts.length = partIndex;

   return { message: parts.join('\n'), sound, bloodParticle: blood };
};
