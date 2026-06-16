import { Registry } from '../../../router/core/registry.js';
import {
   PREFIX_RANK,
   PREFIX_ACTIVE,
   RANK_PREFIX_LENGTH,
   ACTIVE_PREFIX_LENGTH,
} from '../constants/constants.js';
import { isValidPlayer } from '../utils/player.js';

export const getOwnedRanks = (player) => {
   if (!isValidPlayer(player)) return [];

   const tags = player.getTags();
   const ranks = [];

   for (const tag of tags) {
      if (tag.startsWith(PREFIX_RANK)) {
         ranks.push(tag.slice(RANK_PREFIX_LENGTH));
      }
   }

   return ranks;
};

export const getActiveRank = (player) => {
   if (!isValidPlayer(player)) return null;

   const tags = player.getTags();
   for (const tag of tags) {
      if (tag.startsWith(PREFIX_ACTIVE)) {
         return tag.slice(ACTIVE_PREFIX_LENGTH);
      }
   }

   return null;
};

export const setActiveRank = (player, rankName) => {
   if (!isValidPlayer(player)) return false;

   const tags = player.getTags();
   for (const tag of tags) {
      if (tag.startsWith(PREFIX_ACTIVE)) {
         player.removeTag(tag);
      }
   }

   if (rankName) {
      player.addTag(PREFIX_ACTIVE + rankName);
   }

   return true;
};

export const getAllServerRanks = () => {
   const ranks = new Set();

   // ดึงผู้เล่นออนไลน์ผ่าน Registry เพื่อป้องกันการใช้หน่วยความจำและการทำงานแบบ
   const players = Registry.getPlayers();

   for (const currentPlayer of players) {
      const tags = currentPlayer.getTags();

      for (const tag of tags) {
         if (tag.startsWith(PREFIX_RANK)) {
            ranks.add(tag.slice(RANK_PREFIX_LENGTH));
         }
      }
   }

   return Array.from(ranks).sort();
};

export const addRank = (player, rankName) => {
   if (!isValidPlayer(player) || !rankName) return false;
   const fullTag = PREFIX_RANK + rankName;
   const tags = player.getTags();
   let exists = false;

   for (const tag of tags) {
      if (tag === fullTag) {
         exists = true;
         break;
      }
   }

   if (!exists) {
      player.addTag(fullTag);
   }

   setActiveRank(player, rankName);
   return true;
};

export const removeRanks = (player, ranks) => {
   if (!isValidPlayer(player) || !Array.isArray(ranks) || !ranks.length) return false;

   for (const rank of ranks) {
      player.removeTag(PREFIX_RANK + rank);
      player.removeTag(PREFIX_ACTIVE + rank);
   }
   autoSetRemainingRank(player);
   return true;
};

export const renameRank = (player, oldName, newName) => {
   if (!isValidPlayer(player) || !oldName || !newName || oldName === newName) {
      return false;
   }

   const wasActive = getActiveRank(player) === oldName;
   player.removeTag(PREFIX_RANK + oldName);
   player.removeTag(PREFIX_ACTIVE + oldName);
   player.addTag(PREFIX_RANK + newName);

   if (wasActive) {
      setActiveRank(player, newName);
   } else {
      autoSetRemainingRank(player);
   }

   return true;
};

const autoSetRemainingRank = (player) => {
   const owned = getOwnedRanks(player);

   if (owned.length === 1) {
      setActiveRank(player, owned[0]);
   } else if (owned.length === 0) {
      setActiveRank(player, null);
   }
};
