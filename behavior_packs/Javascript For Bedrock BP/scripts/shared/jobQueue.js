const jobQueue = [];
const pending = new Set();
const playerJobCount = new Map();
const playerLastJobEnd = new Map();

let lastProcessedIndex = 0;

export class JobQueue {
   static pushJob(job) {
      jobQueue.push(job);
   }

   static popJob(idx) {
      const last = jobQueue.pop();
      if (idx < jobQueue.length) {
         jobQueue[idx] = last;
      }
   }

   static getJob(idx) {
      return jobQueue[idx];
   }

   static getJobQueueLength() {
      return jobQueue.length;
   }

   static getLastProcessedIndex() {
      return lastProcessedIndex;
   }

   static setLastProcessedIndex(idx) {
      lastProcessedIndex = idx;
   }

   static incrementLastProcessedIndex() {
      lastProcessedIndex++;
   }

   static getPlayerJobCount(playerId) {
      return playerJobCount.get(playerId) || 0;
   }

   static incrementPlayerJobCount(playerId) {
      const current = playerJobCount.get(playerId) || 0;
      playerJobCount.set(playerId, current + 1);
   }

   static decrementPlayerJobCount(playerId) {
      const current = playerJobCount.get(playerId) || 0;
      if (current <= 1) {
         playerJobCount.delete(playerId);
      } else {
         playerJobCount.set(playerId, current - 1);
      }
   }

   static getPlayerLastJobEnd(playerId) {
      return playerLastJobEnd.get(playerId) || 0;
   }

   static setPlayerLastJobEnd(playerId, time) {
      playerLastJobEnd.set(playerId, time);
   }

   static cleanupPlayerState(playerId) {
      playerLastJobEnd.delete(playerId);
      playerJobCount.delete(playerId);
   }

   static isPending(key) {
      return pending.has(key);
   }

   static addPending(key) {
      pending.add(key);
   }

   static removePending(key) {
      pending.delete(key);
   }
}
