import { world } from '@minecraft/server';

import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { Config } from '../config.js';
import { buildBorderPoints } from '../utils/helpers.js';
import { zoneDatabase } from './database.js';
import { cache } from '../../../shared/cache.js';

// สถานะ
const activeBorders = new Map();

// วนเรนเดอร์ขอบเขต (ทุก 40 ticks)
export const renderBorderParticles = () => {
   try {
      if (activeBorders.size === 0) return;

      const onlineNames = new Set();
      for (const entry of Registry.getEntries()) {
         onlineNames.add(entry.player.name);
      }

      const expiredNames = [];

      for (const [name, state] of activeBorders) {
         try {
            if (!onlineNames.has(name) || state.ticks >= Config.BorderDuration) {
               expiredNames.push(name);
               continue;
            }

            for (const point of state.points) {
               state.dimension.spawnParticle(Config.ParticleId, point);
            }
            state.ticks += 1;
         } catch (error) {
            logError('Protection', 'Border error ' + name, error);
            expiredNames.push(name);
         }
      }

      for (const name of expiredNames) {
         activeBorders.delete(name);
      }
   } catch (error) {
      logError('Protection', 'Particle loop', error);
      activeBorders.clear();
   }
};

// API สาธารณะ
export const showBorder = async (player) => {
   try {
      const zone = zoneDatabase.zones[player.name];
      if (!zone) return cache.sendMessage(player, `[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

      const dimension = cache.getDimension(zone.dimension);
      const points = buildBorderPoints(zone.start, Config.ParticleStep);
      activeBorders.set(player.name, {
         points,
         dimension,
         ticks: 0,
      });
   } catch (error) {
      cache.sendMessage(player, `[x] แสดงขอบเขตโพรเทคไม่ได้`);
      logError('Protection', 'showBorder', error);
   }
};

export const clearBorderVisuals = (name) => {
   activeBorders.delete(name);
};
