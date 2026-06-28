export function logError(tag, message, error) {
   console.warn(`[Economy][${tag}] ${message}: ${error?.message ?? error}`);
}
