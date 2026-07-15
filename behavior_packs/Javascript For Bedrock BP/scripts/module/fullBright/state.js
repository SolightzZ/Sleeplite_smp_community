import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { effect, refreshTicks, tag } from './config.js';

export const hasBright = (player) => {
   if (!pcheck(player)) return false;
   return player.hasTag(tag);
};

const apply = (player) => {
   if (!pcheck(player) || player.hasTag(tag)) return false;

   try {
      player.addTag(tag);
   } catch {
      return false;
   }

   try {
      cache.addEffect(player, effect, refreshTicks + 200, {
         amplifier: 0,
         showParticles: false,
      });
   } catch (error) {
      logError('fullbright', 'apply failed', error);
   }

   return true;
};

const remove = (player) => {
   if (!pcheck(player) || !player.hasTag(tag)) return false;

   try {
      player.removeTag(tag);
   } catch {
      return false;
   }

   if (player.getEffect(effect)) {
      try {
         player.removeEffect(effect);
      } catch (error) {
         logError('fullbright', 'remove failed', error);
      }
   }

   return true;
};

export const toggleBright = (player) => {
   if (!pcheck(player)) return false;
   return player.hasTag(tag) ? !remove(player) : apply(player);
};

export const resetBright = (player) => {
   if (!pcheck(player)) return;

   try {
      player.removeTag(tag);
   } catch {
      // ignore
   }

   try {
      player.removeEffect(effect);
   } catch {
      // ignore
   }
};
