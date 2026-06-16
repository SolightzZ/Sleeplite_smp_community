export function logError(tag, message, error) {
    console.error(`[${tag}] ${message}:`, error instanceof Error ? error.message : String(error));
}

export function logWarn(tag, message) {
    console.warn(`[${tag}] ${message}`);
}
