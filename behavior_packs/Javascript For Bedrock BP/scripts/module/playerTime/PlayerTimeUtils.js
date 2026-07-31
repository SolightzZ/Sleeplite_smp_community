export const formatPlayTime = (ms) => {
   const sec = Math.floor(ms / 1000);
   const day = Math.floor(sec / 86400);
   const hour = Math.floor((sec % 86400) / 3600);
   const min = Math.floor((sec % 3600) / 60);
   const second = sec % 60;
   return `${day}d ${hour}h ${min}m ${second}s`;
};
