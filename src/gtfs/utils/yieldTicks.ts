export function yieldTick(cb: () => void) {
    if (typeof setImmediate === 'function') setImmediate(cb);
    else setTimeout(cb, 0);
}
