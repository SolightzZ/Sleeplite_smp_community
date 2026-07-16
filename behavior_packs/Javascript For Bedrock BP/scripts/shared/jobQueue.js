const pending = new Set();
const playerJobCount = new Map();
const playerLastJobEnd = new Map();

export class JobQueue {
   constructor() {
      this.jobQueue = [];
      this.lastProcessedIndex = 0;
   }

   pushJob(job) {
      this.jobQueue.push(job);
   }

   popJob(idx) {
      const last = this.jobQueue.pop();
      if (idx < this.jobQueue.length) {
         this.jobQueue[idx] = last;
      }
   }

   getJob(idx) {
      return this.jobQueue[idx];
   }

   getJobQueueLength() {
      return this.jobQueue.length;
   }

   getLastProcessedIndex() {
      return this.lastProcessedIndex;
   }

   setLastProcessedIndex(idx) {
      this.lastProcessedIndex = idx;
   }

   incrementLastProcessedIndex() {
      this.lastProcessedIndex++;
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
}
