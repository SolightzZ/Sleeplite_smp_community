import { logError } from './logger.js';

export function runEventHandlers(tag, handlers, event) {
   for (let i = 0; i < handlers.length; i++) {
      try {
         handlers[i](event);
      } catch (error) {
         logError(tag, `${handlers[i]?.name || `anonymous[${i}]`} error`, error);
      }
   }
}

export function runEventHandlersWithCancel(tag, handlers, event) {
   for (let i = 0; i < handlers.length; i++) {
      try {
         handlers[i](event);
         if (event.cancel) return;
      } catch (error) {
         logError(tag, `${handlers[i]?.name || `anonymous[${i}]`} error`, error);
      }
   }
}
