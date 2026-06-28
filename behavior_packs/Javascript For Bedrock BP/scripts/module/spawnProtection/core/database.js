import { world } from '@minecraft/server';
import { Config } from '../config.js';
import { logError } from '../../../events/logger.js';


const KEY = 'SPAWN_PROTECT_DATA';

let cache = null;

function buildCacheFromData(data) {
   const spawn = world.getDefaultSpawnLocation();
   return {
      radius: data.radius,
      enabled: data.enabled,
      flags: { ...data.flags },
      exemptList: data.exemptList,
      exemptSet: new Set(data.exemptList.map((n) => n.toLowerCase())),
      centerX: spawn.x,
      centerZ: spawn.z,
   };
}

function dataFromCache() {
   return {
      radius: cache.radius,
      enabled: cache.enabled,
      flags: { ...cache.flags },
      exemptList: cache.exemptList,
   };
}

function mergeDefaults(saved) {
   return {
      radius: saved?.radius ?? Config.Radius,
      enabled: saved?.enabled ?? true,
      flags: { ...Config.DefaultFlags, ...(saved?.flags || {}) },
      exemptList: saved?.exemptList ?? [],
   };
}

export function loadSpawnProtec() {
   try {
      const raw = world.getDynamicProperty(KEY);
      const merged = mergeDefaults(raw ? JSON.parse(raw) : null);
      cache = buildCacheFromData(merged);
   } catch (error) {
      logError('SpawnProtec', 'loadSpawnProtec', error);
   }
}

export function getConfigSpawnProtec() {
   try {
      if (!cache) loadSpawnProtec();
      return cache;
   } catch (error) {
      logError('SpawnProtec', 'getConfigSpawnProtec', error);
      return null;
   }
}

export function updateConfigSpawnProtec(partial) {
   try {
      const current = getConfigSpawnProtec();
      const merged = mergeDefaults({
         radius: partial.radius ?? current.radius,
         enabled: partial.enabled ?? current.enabled,
         flags: partial.flags
            ? { ...current.flags, ...partial.flags }
            : { ...current.flags },
         exemptList: partial.exemptList ?? current.exemptList,
      });
      cache = buildCacheFromData(merged);
      world.setDynamicProperty(KEY, JSON.stringify(dataFromCache()));
   } catch (error) {
      logError('SpawnProtec', 'updateConfigSpawnProtec', error);
   }
}

export function resetConfigSpawnProtec() {
   try {
      const defaults = mergeDefaults(null);
      cache = buildCacheFromData(defaults);
      world.setDynamicProperty(KEY, JSON.stringify(dataFromCache()));
   } catch (error) {
      logError('SpawnProtec', 'resetConfigSpawnProtec', error);
   }
}
