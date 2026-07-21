// Tags
const ADMIN_TAG = 'admin';

// IDs
const DIAMOND_BLOCK = 'minecraft:diamond_block';
const PARTICLE_BORDER = 'minecraft:endrod';

// Limits
const MAX_ZONES = 10;
const ZONE_SIZE = 30;
const MAX_FRIENDS = 4;
const CACHE_LIMIT = 1000;

// Default Flags
const DEFAULT_FLAGS = Object.freeze({
   break: true,
   place: true,
   interact: true,
   container: true,
   damage: false,
});

// Runtime-computed values
export const halfZoneSize = ZONE_SIZE / 2;

// Edge offsets (runtime)
const buildEdgeOffsets = (size) => {
   const offsets = [];
   const zero = 0;
   const axes = [zero, size];

   for (let outerIndex = 0; outerIndex < axes.length; outerIndex++) {
      const fixedY = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axes.length; innerIndex++) {
         offsets.push(['x', zero, fixedY, axes[innerIndex]]);
      }
   }

   for (let outerIndex = 0; outerIndex < axes.length; outerIndex++) {
      const fixedX = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axes.length; innerIndex++) {
         offsets.push(['y', fixedX, zero, axes[innerIndex]]);
      }
   }

   for (let outerIndex = 0; outerIndex < axes.length; outerIndex++) {
      const fixedX = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axes.length; innerIndex++) {
         offsets.push(['z', fixedX, axes[innerIndex], zero]);
      }
   }

   return offsets;
};

export const edgeOffsets = buildEdgeOffsets(ZONE_SIZE);

export const Config = Object.freeze({
   MaxZones: MAX_ZONES,
   DefaultFlags: DEFAULT_FLAGS,
   ZoneSize: ZONE_SIZE,
   RequiredBlock: DIAMOND_BLOCK,
   BorderDuration: 60,
   ParticleId: PARTICLE_BORDER,
   ParticleStep: 3,
   CacheLimit: CACHE_LIMIT,
   AdminTag: ADMIN_TAG,
   MaxFriends: MAX_FRIENDS,
   ExplosionRadius: 8,
});

export const Colors = Object.freeze({
   Success: '§a',
   Warning: '§6',
});
