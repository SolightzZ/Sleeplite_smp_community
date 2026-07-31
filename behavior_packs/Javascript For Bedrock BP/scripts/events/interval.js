import { system } from '@minecraft/server';
import { logError } from './logger.js';

const _intervals = [];

export const Interval = {
   register(fn, ticks) {
      _intervals.push({ fn, ticks, counter: 0 });
   },

   tick() {
      for (let i = 0; i < _intervals.length; i++) {
         const iv = _intervals[i];
         iv.counter++;

         if (iv.counter < iv.ticks) continue;
         iv.counter = 0;
         try {
            iv.fn();
         } catch (error) {
            const name = iv.fn?.name || `anonymous_interval[${i}]`;
            logError('Interval', `${name} error`, error);
         }
      }
   },
};

system.runInterval(() => {
   try {
      Interval.tick();
   } catch (error) {
      logError('Tick', 'main loop error', error);
   }
}, 1);
