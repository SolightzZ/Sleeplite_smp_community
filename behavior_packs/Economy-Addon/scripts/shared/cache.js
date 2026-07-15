import { BlockComponentTypes, EntityComponentTypes, ItemComponentTypes, system, world } from '@minecraft/server';

export const pcheck = (entity) => !!(entity && entity.isValid);

const _dimensions = new Map();

const _components = new WeakMap();

const _dynCache = new Map();

const _playerDynCache = new Map();

let _playersCache = null;

let _spawnCache = null;

let _validCache = new WeakMap();

let _tick = -1;

function _ensureTick() {
   const t = system.currentTick;
   if (t === _tick) return;
   _tick = t;
   _playersCache = null;
   _spawnCache = null;
   _dynCache.clear();
   _playerDynCache.clear();
   _validCache = new WeakMap();
}

class ApiCache {
   getDimension(id) {
      let dim = _dimensions.get(id);
      if (dim === undefined) {
         dim = world.getDimension(id);
         _dimensions.set(id, dim);
      }
      return dim;
   }

   getComponent(entity, typeId) {
      if (!entity) return undefined;
      let map = _components.get(entity);
      if (map === undefined) {
         map = new Map();
         _components.set(entity, map);
      }
      if (map.has(typeId)) return map.get(typeId);
      const comp = entity.getComponent(typeId);
      map.set(typeId, comp);
      return comp;
   }

   getInventory(player) {
      const comp = this.getComponent(player, EntityComponentTypes.Inventory);
      return comp ? comp.container : null;
   }

   getEquippable(player) {
      return this.getComponent(player, EntityComponentTypes.Equippable) ?? null;
   }

   getEnchantable(item) {
      return this.getComponent(item, ItemComponentTypes.Enchantable) ?? null;
   }

   getDurability(item) {
      return this.getComponent(item, ItemComponentTypes.Durability) ?? null;
   }

   getBlockInventory(block) {
      const comp = this.getComponent(block, BlockComponentTypes.Inventory);
      return comp ? comp.container : null;
   }

   getPlayers() {
      _ensureTick();
      if (_playersCache === null) _playersCache = world.getPlayers();
      return _playersCache;
   }

   getDefaultSpawnLocation() {
      _ensureTick();
      if (_spawnCache === null) _spawnCache = world.getDefaultSpawnLocation();
      return _spawnCache;
   }

   getDynamicProperty(key) {
      _ensureTick();
      if (_dynCache.has(key)) return _dynCache.get(key);
      const value = world.getDynamicProperty(key);
      _dynCache.set(key, value);
      return value;
   }

   setDynamicProperty(key, value) {
      _dynCache.set(key, value);
      return world.setDynamicProperty(key, value);
   }

   invalidateDynamicProperty(key) {
      _dynCache.delete(key);
   }

   getPlayerDynamicProperty(player, key) {
      _ensureTick();
      const k = player.id + ' ' + key;
      if (_playerDynCache.has(k)) return _playerDynCache.get(k);
      const value = player.getDynamicProperty(key);
      _playerDynCache.set(k, value);
      return value;
   }

   setPlayerDynamicProperty(player, key, value) {
      const k = player.id + ' ' + key;
      _playerDynCache.set(k, value);
      return player.setDynamicProperty(key, value);
   }

   invalidatePlayerDynamicProperty(player, key) {
      _playerDynCache.delete(player.id + ' ' + key);
   }

   isValid(entity) {
      _ensureTick();
      if (_validCache.has(entity)) return _validCache.get(entity);
      const v = entity.isValid;
      _validCache.set(entity, v);
      return v;
   }

   playSound(player, soundId, options) {
      if (!pcheck(player)) return;
      player.dimension.playSound(soundId, player.location, options);
   }

   sendMessage(entity, message) {
      if (!pcheck(entity)) return;
      entity.sendMessage(message);
   }

   runCommand(dimension, command) {
      if (!dimension) return null;
      return dimension.runCommand(command);
   }
}

export const cache = new ApiCache();
