import { system } from '@minecraft/server';
import { cache } from '../shared/cache.js';
import { pcheck } from './../shared/player.js';
import { logError } from './logger.js';

const _registry = new Map();
const _entriesBuf = [];
const _playersBuf = [];

export const Registry = {
   add(player) {
      if (!pcheck(player) || _registry.has(player.id)) return;
      _registry.set(player.id, {
         player,
         data: { kills: 0, deaths: 0, coins: 0, afkTicks: 0 },
         joinedAt: Date.now(),
      });
   },

   remove(playerId) {
      _registry.delete(playerId);
   },

   get(id) {
      return _registry.get(id) ?? null;
   },

   getData(id) {
      return _registry.get(id)?.data ?? null;
   },

   getAll() {
      return _registry;
   },

   getEntries() {
      _entriesBuf.length = 0;
      for (const entry of _registry.values()) {
         if (pcheck(entry.player)) {
            _entriesBuf.push(entry);
         }
      }
      return _entriesBuf;
   },

   getPlayers() {
      _playersBuf.length = 0;
      for (const entry of _registry.values()) {
         if (pcheck(entry.player)) {
            _playersBuf.push(entry.player);
         }
      }
      return _playersBuf;
   },

   sweep() {
      for (const [id, entry] of _registry) {
         if (!pcheck(entry.player)) {
            _registry.delete(id);
         }
      }
   },

   get size() {
      return _registry.size;
   },

   init() {
      try {
         for (const player of cache.getAllPlayers()) {
            this.add(player);
         }
      } catch (error) {
         logError('Registry', 'Failed to initialize existing players', error);
      }
   },
};

system.runInterval(() => {
   Registry.sweep();
}, 600);
