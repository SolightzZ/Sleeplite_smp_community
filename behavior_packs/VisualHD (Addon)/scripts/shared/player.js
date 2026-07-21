const HEALTH = 'minecraft:health';
const healthCache = new Map();
const CACHE_MAX = 100;
const accessOrder = [];

export const pcheck = (player) => player != null && player.isValid === true;

export const getValid = (player) => {
   if (!pcheck(player)) return null;
   return { player, id: player.id };
};

const getHealthComponent = (player) => {
   if (!pcheck(player)) return null;
   const id = player.id;
   let comp = healthCache.get(id);
   if (comp !== undefined) {
      const idx = accessOrder.indexOf(id);
      if (idx > 0) {
         accessOrder.splice(idx, 1);
         accessOrder.push(id);
      }
      return comp;
   }
   if (healthCache.size >= CACHE_MAX) {
      const oldest = accessOrder.shift();
      healthCache.delete(oldest);
   }
   comp = player.getComponent(HEALTH);
   healthCache.set(id, comp);
   accessOrder.push(id);
   return comp;
};

export const getHealthPercent = (player) => {
   const comp = getHealthComponent(player);
   if (!comp) return null;
   return (comp.currentValue / comp.effectiveMax) * 100;
};

export const clearPlayerCache = (playerId) => {
   healthCache.delete(playerId);
   const idx = accessOrder.indexOf(playerId);
   if (idx >= 0) accessOrder.splice(idx, 1);
};
