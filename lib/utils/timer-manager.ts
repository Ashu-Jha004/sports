// ============================================
// FILE: utils/timer-manager.ts
// Safe timer management to prevent memory leaks
// ============================================

/**
 * Timer manager class to prevent memory leaks
 * Ensures timers are properly cleaned up
 */
export class TimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Set a debounced timer - clears previous timer with same key
   */
  setDebounced(key: string, callback: () => void, delay: number): void {
    this.clear(key);

    const timer = setTimeout(() => {
      callback();
      this.timers.delete(key);
    }, delay);

    this.timers.set(key, timer);
  }

  /**
   * Clear a specific timer
   */
  clear(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Clear all timers - use on cleanup/unmount
   */
  clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Check if a timer is active
   */
  isActive(key: string): boolean {
    return this.timers.has(key);
  }

  /**
   * Get count of active timers
   */
  getActiveCount(): number {
    return this.timers.size;
  }
}

/**
 * Create a timer manager instance for the store
 * Should be created once per store instance
 */
export function createTimerManager(): TimerManager {
  return new TimerManager();
}
