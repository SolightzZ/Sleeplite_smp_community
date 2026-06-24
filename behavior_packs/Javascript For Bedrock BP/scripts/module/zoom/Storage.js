import { logError } from '../../router/core/logger.js';
import { CONFIG_KEY, DEFAULT_CONFIG } from './Config.js';

const configCache = new Map();

export function getPlayerConfig(player) {
   const cached = configCache.get(player.id);
   if (cached) return cached;

   let config = { ...DEFAULT_CONFIG };

   try {
      const rawConfig = player.getDynamicProperty(CONFIG_KEY);

      if (typeof rawConfig === 'string') {
         const parsedConfig = JSON.parse(rawConfig);

         if (typeof parsedConfig === 'object' && parsedConfig !== null) {
            if (typeof parsedConfig.playSound === 'boolean') {
               config.playSound = parsedConfig.playSound;
            }

            if (typeof parsedConfig.hideHud === 'boolean') {
               config.hideHud = parsedConfig.hideHud;
            }
         }
      }
   } catch (error) {
      logError('Zoom', 'Failed to load player config', error);
   }

   configCache.set(player.id, config);
   return config;
}
