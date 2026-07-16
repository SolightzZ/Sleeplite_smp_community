const pendingWelcomes = [];

export const enqueueWelcome = (player, runAtTick) => {
   pendingWelcomes.push({ player, runAtTick });
};

export const pendingCount = () => pendingWelcomes.length;

export const popDueWelcomes = (now) => {
   const due = [];
   for (let i = pendingWelcomes.length - 1; i >= 0; i--) {
      if (pendingWelcomes[i].runAtTick <= now) {
         due.push(pendingWelcomes[i].player);
         pendingWelcomes.splice(i, 1);
      }
   }
   return due;
};
