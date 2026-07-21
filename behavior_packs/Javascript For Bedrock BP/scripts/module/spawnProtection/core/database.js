import { world } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { Config } from '../config.js';

const KEY = 'SPAWN_PROTECT_DATA';

let state = null;
let spawnCenter = null;

function getSpawnCenter() {
   if (!spawnCenter) {
      const s = world.getDefaultSpawnLocation();
      spawnCenter = { x: s.x, z: s.z };
   }
   return spawnCenter;
}

function buildCacheFromData(data) {
   const c = getSpawnCenter();
   return {
      radius: data.radius,
      enabled: data.enabled,
      flags: { ...data.flags },
      exemptList: data.exemptList,
      exemptSet: new Set(data.exemptList.map((n) => n.toLowerCase())),
      centerX: c.x,
      centerZ: c.z,
   };
}

function dataFromCache() {
   return {
      radius: state.radius,
      enabled: state.enabled,
      flags: { ...state.flags },
      exemptList: state.exemptList,
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

function loadGlobal(key, fallback) {
   const raw = world.getDynamicProperty(key);
   if (!raw) return fallback;
   try {
      return JSON.parse(raw);
   } catch {
      return fallback;
   }
}

function saveGlobal(key, value) {
   world.setDynamicProperty(key, JSON.stringify(value));
}

export function loadSpawnProtec() {
   try {
      const saved = loadGlobal(KEY, null);
      const merged = mergeDefaults(saved);
      state = buildCacheFromData(merged);
   } catch (error) {
      logError('SpawnProtec', 'loadSpawnProtec', error);
   }
}

export function getConfigSpawnProtec() {
   try {
      if (!state) loadSpawnProtec();
      return state;
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
         flags: partial.flags ? { ...current.flags, ...partial.flags } : { ...current.flags },
         exemptList: partial.exemptList ?? current.exemptList,
      });
      state = buildCacheFromData(merged);
      saveGlobal(KEY, dataFromCache());
   } catch (error) {
      logError('SpawnProtec', 'updateConfigSpawnProtec', error);
   }
}

export function resetConfigSpawnProtec() {
   try {
      const defaults = mergeDefaults(null);
      state = buildCacheFromData(defaults);
      saveGlobal(KEY, dataFromCache());
   } catch (error) {
      logError('SpawnProtec', 'resetConfigSpawnProtec', error);
   }
}
