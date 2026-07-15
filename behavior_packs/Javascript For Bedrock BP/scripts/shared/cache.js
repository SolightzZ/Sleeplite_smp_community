import { BlockComponentTypes, EntityComponentTypes, ItemComponentTypes, ItemStack, system, world } from '@minecraft/server';

const _dimensions = new Map();
const _components = new WeakMap();
const _dynCache = new Map();
const _playerDynCache = new Map();

let _tick = -1;
let _playersCache = null;
let _validCache = new WeakMap();
let _spawnCache = null;

const _ensureTick = () => {
   const t = system.currentTick;
   if (t !== _tick) {
      _tick = t;
      _playersCache = null;
      _spawnCache = null;
      _dynCache.clear();
      _playerDynCache.clear();
      _validCache = new WeakMap();
   }
};

let _instance;

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
      const comp = _instance.getComponent(player, EntityComponentTypes.Inventory);
      return comp ? comp.container : null;
   }

   getInventoryComponent(player) {
      return _instance.getComponent(player, EntityComponentTypes.Inventory) ?? null;
   }

   getEquippable(player) {
      return _instance.getComponent(player, EntityComponentTypes.Equippable) ?? null;
   }

   getEnchantable(item) {
      return _instance.getComponent(item, ItemComponentTypes.Enchantable) ?? null;
   }

   getDurability(item) {
      return _instance.getComponent(item, ItemComponentTypes.Durability) ?? null;
   }

   getBlockInventory(block) {
      const comp = _instance.getComponent(block, BlockComponentTypes.Inventory);
      return comp ? comp.container : null;
   }

   getContainerItems(container) {
      const out = [];
      if (!container) return out;
      const size = container.size;
      for (let i = 0; i < size; i++) out.push(container.getItem(i));
      return out;
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

   invalidateAllDynamicProperties() {
      _dynCache.clear();
   }

   getPlayerDynamicProperty(player, key) {
      _ensureTick();
      const k = `${player.id} ${key}`;
      if (_playerDynCache.has(k)) return _playerDynCache.get(k);
      const value = player.getDynamicProperty(key);
      _playerDynCache.set(k, value);
      return value;
   }

   setPlayerDynamicProperty(player, key, value) {
      const k = `${player.id} ${key}`;
      _playerDynCache.set(k, value);
      return player.setDynamicProperty(key, value);
   }

   invalidatePlayerDynamicProperty(player, key) {
      _playerDynCache.delete(`${player.id} ${key}`);
   }

   getPlayers() {
      _ensureTick();
      if (_playersCache === null) _playersCache = world.getPlayers();
      return _playersCache;
   }

   getAllPlayers() {
      return _instance.getPlayers();
   }

   getDefaultSpawnLocation() {
      _ensureTick();
      if (_spawnCache === null) _spawnCache = world.getDefaultSpawnLocation();
      return _spawnCache;
   }

   isValid(entity) {
      _ensureTick();
      if (_validCache.has(entity)) return _validCache.get(entity);
      const v = entity.isValid;
      _validCache.set(entity, v);
      return v;
   }

   playSound(player, soundId, soundOptions) {
      if (!player || !player.isValid) return;
      const loc = player.location;
      const dir = player.getViewDirection();
      const front = { x: loc.x + dir.x, y: loc.y + dir.y, z: loc.z + dir.z };
      player.dimension.playSound(soundId, front, soundOptions);
   }

   sendMessage(entity, message) {
      if (!entity) return;
      entity.sendMessage(message);
   }

   setTitle(display, title, options) {
      if (!display) return;
      display.setTitle(title, options);
   }

   setActionBar(display, text, options) {
      if (!display) return;
      display.setActionBar(text, options);
   }

   addEffect(entity, effect, duration, amplifier, showParticles) {
      if (!entity) return;
      entity.addEffect(effect, duration, amplifier, showParticles);
   }

   createItemStack(typeId, amount = 1) {
      return new ItemStack(typeId, amount);
   }

   runCommand(dimension, command) {
      if (!dimension) return;
      return dimension.runCommand(command);
   }
}

_instance = new ApiCache();

export const cache = _instance;
