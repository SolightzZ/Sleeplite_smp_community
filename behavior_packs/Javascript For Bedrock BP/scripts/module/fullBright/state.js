import { system } from '@minecraft/server';

import { Registry } from '../../events/registry.js';
import { logError } from '../../events/logger.js';

const tag = 'bright';
const effect = 'night_vision';
const REFRESH_TICKS = 6000;

export const hasBright = (player) => {
   if (!player || !player.isValid) return false;
   return player.hasTag(tag);
};

const apply = (player) => {
   if (!player || !player.isValid || player.hasTag(tag)) return false;

   try {
      player.addTag(tag);
   } catch {
      return false;
   }

   try {
      player.addEffect(effect, REFRESH_TICKS + 200, {
         amplifier: 0,
         showParticles: false,
      });
   } catch (error) {
      logError('fullbright', 'apply failed', error);
   }

   return true;
};

const remove = (player) => {
   if (!player || !player.isValid || !player.hasTag(tag)) return false;

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
   if (!player || !player.isValid) return false;
   return player.hasTag(tag) ? !remove(player) : apply(player);
};

export const resetBright = (player) => {
   if (!player || !player.isValid) return;

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
