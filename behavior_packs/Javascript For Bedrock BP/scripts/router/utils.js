/**
 * Run an array of handler functions in a for-loop, isolating each in its own
 * try/catch so that a single failure does not skip the remaining handlers.
 */
export function runEventHandlers(tag, handlers, event) {
  for (let i = 0; i < handlers.length; i++) {
    try {
      handlers[i](event);
    } catch (error) {
      console.error(`[${tag}] handler ${i} error:`, error?.message ?? error);
    }
  }
}

/**
 * Same as runEventHandlers but stops early if `event.cancel` becomes truthy.
 */
export function runEventHandlersWithCancel(tag, handlers, event) {
  for (let i = 0; i < handlers.length; i++) {
    try {
      handlers[i](event);
      if (event.cancel) return;
    } catch (error) {
      console.error(`[${tag}] handler ${i} error:`, error?.message ?? error);
    }
  }
}
