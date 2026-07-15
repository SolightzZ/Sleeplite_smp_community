import { COMPONENT_IDS } from '../config.js';

const HEALTH = COMPONENT_IDS.HEALTH;
const healthCache = new Map();

export const pcheck = (player) => player != null && player.isValid === true;

export const getHealthComponent = (player) => {
   if (!pcheck(player)) return null;
   const id = player.id;
   let comp = healthCache.get(id);
   if (comp !== undefined) return comp;
   comp = player.getComponent(HEALTH);
   healthCache.set(id, comp);
   return comp;
};

export const getHealthPercent = (player) => {
   const comp = getHealthComponent(player);
   if (!comp) return null;
   return (comp.currentValue / comp.effectiveMax) * 100;
};

export const clearPlayerCache = (playerId) => healthCache.delete(playerId);
