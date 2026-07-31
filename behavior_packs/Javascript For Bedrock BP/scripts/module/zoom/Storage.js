import { CONFIG_KEY, DEFAULT_CONFIG } from './Config.js';
import { Database } from '../../shared/database.js';

const configCache = new Map();

export function getPlayerConfig(player) {
   const cached = configCache.get(player.id);
   if (cached) return cached;

   let config = { ...DEFAULT_CONFIG };

   const parsedConfig = Database.loadPlayer(player, CONFIG_KEY, null);
   if (parsedConfig && typeof parsedConfig === 'object') {
      if (typeof parsedConfig.playSound === 'boolean') {
         config.playSound = parsedConfig.playSound;
      }

      if (typeof parsedConfig.hideHud === 'boolean') {
         config.hideHud = parsedConfig.hideHud;
      }
   }

   configCache.set(player.id, config);
   return config;
}
