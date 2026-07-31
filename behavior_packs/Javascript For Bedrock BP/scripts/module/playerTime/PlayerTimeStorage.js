import { cache } from '../../shared/cache.js';
import { PROPERTY } from './constants.js';

export const PlayerTimeStorage = {
   getPlayTime(player) {
      return cache.getPlayerDynamicProperty(player, PROPERTY.PLAY_TIME) ?? 0;
   },

   setPlayTime(player, ms) {
      cache.setPlayerDynamicProperty(player, PROPERTY.PLAY_TIME, ms);
   },

   getLastJoin(player) {
      return cache.getPlayerDynamicProperty(player, PROPERTY.LAST_JOIN) ?? 0;
   },

   setLastJoin(player, timestamp) {
      cache.setPlayerDynamicProperty(player, PROPERTY.LAST_JOIN, timestamp);
   },

   getFirstJoin(player) {
      return cache.getPlayerDynamicProperty(player, PROPERTY.FIRST_JOIN) ?? 0;
   },

   setFirstJoin(player, timestamp) {
      cache.setPlayerDynamicProperty(player, PROPERTY.FIRST_JOIN, timestamp);
   },

   setLastSeen(player, timestamp) {
      cache.setPlayerDynamicProperty(player, PROPERTY.LAST_SEEN, timestamp);
   },
};
