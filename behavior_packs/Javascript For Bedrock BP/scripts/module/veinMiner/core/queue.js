import { JobQueue as JobQueueBase } from '../../../shared/jobQueue.js';

const _queue = new JobQueueBase();

export const JobQueue = {
   pushJob: (job) => _queue.pushJob(job),
   popJob: (idx) => _queue.popJob(idx),
   getJob: (idx) => _queue.getJob(idx),
   getJobQueueLength: () => _queue.getJobQueueLength(),
   getLastProcessedIndex: () => _queue.getLastProcessedIndex(),
   setLastProcessedIndex: (idx) => _queue.setLastProcessedIndex(idx),
   incrementLastProcessedIndex: () => _queue.incrementLastProcessedIndex(),

   isPending: JobQueueBase.isPending,
   addPending: JobQueueBase.addPending,
   removePending: JobQueueBase.removePending,
   getPlayerJobCount: JobQueueBase.getPlayerJobCount,
   incrementPlayerJobCount: JobQueueBase.incrementPlayerJobCount,
   decrementPlayerJobCount: JobQueueBase.decrementPlayerJobCount,
   getPlayerLastJobEnd: JobQueueBase.getPlayerLastJobEnd,
   setPlayerLastJobEnd: JobQueueBase.setPlayerLastJobEnd,
   cleanupPlayerState: JobQueueBase.cleanupPlayerState,
};
