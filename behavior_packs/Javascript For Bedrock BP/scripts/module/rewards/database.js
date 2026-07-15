import { logError, logWarn } from '../../events/logger.js';
import { config } from './constants.js';
import { Database } from '../../shared/database.js';

const rewardCache = new Map();

function load(player) {
   const cached = rewardCache.get(player.id);
   if (cached !== undefined) return cached;
   const data = Database.loadPlayer(player, config.dbKey, { last: null, count: 0 });
   rewardCache.set(player.id, data);
   return data;
}

function save(player, data) {
   rewardCache.set(player.id, data);
   try {
      Database.savePlayer(player, config.dbKey, data);
      return true;
   } catch (error) {
      logError('Rewards', 'Save Error', error);
      return false;
   }
}

function reset(player) {
   rewardCache.delete(player.id);
   logWarn('Rewards', 'Reward reset' + config.dbKey);
   Database.savePlayer(player, config.dbKey, undefined);
}

export { load, reset, save };
