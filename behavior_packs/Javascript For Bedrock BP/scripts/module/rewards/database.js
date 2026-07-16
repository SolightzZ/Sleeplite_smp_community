import { logError, logWarn } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { config } from './constants.js';

const rewardCache = new Map();

const _parse = (raw) => {
   if (!raw) return { last: null, count: 0 };
   try {
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : { last: null, count: 0 };
   } catch {
      return { last: null, count: 0 };
   }
};

function load(player) {
   const cached = rewardCache.get(player.id);
   if (cached !== undefined) return cached;
   let raw;
   try {
      raw = cache.getPlayerDynamicProperty(player, config.dbKey);
   } catch {
      raw = undefined;
   }
   const data = _parse(raw);
   rewardCache.set(player.id, data);
   return data;
}

function save(player, data) {
   rewardCache.set(player.id, data);
   try {
      cache.setPlayerDynamicProperty(player, config.dbKey, JSON.stringify(data));
      return true;
   } catch (error) {
      logError('Rewards', 'Save Error', error);
      return false;
   }
}

function reset(player) {
   rewardCache.delete(player.id);
   logWarn('Rewards', 'Reward reset' + config.dbKey);
   try {
      cache.setPlayerDynamicProperty(player, config.dbKey, undefined);
   } catch {
      // ignore
   }
}

export { load, reset, save };
