export const CFG = {
   deathObjective: 'Deaths',
   head: '§e[+] Welcome to Sleeplite SMP Community',
   queueDelayTicks: 150,
   dayStorageKey: 'welcome:firstJoin',
   title: {
      fadeInDuration: 0,
      fadeOutDuration: 50,
      stayDuration: 160,
   },
   welcomeSound: {
      name: 'random.toast',
      pitch: 1,
      volume: 1.0,
   },
};

export const buildSubtitle = (deaths) => `${String.fromCharCode(61360)} ${deaths}`;
