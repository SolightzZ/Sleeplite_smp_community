export const state = {
  jobQueue: [],
  pendingBlocks: new Set(),
  playerJobCount: new Map(),
  playerLastJobEnd: new Map(),
  runHandle: null,
  lastProcessedIndex: 0,
};

export const popJob = (idx) => {
  const last = state.jobQueue.pop();
  if (idx < state.jobQueue.length) {
    state.jobQueue[idx] = last;
  }
};
