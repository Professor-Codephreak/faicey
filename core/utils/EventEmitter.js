/**
 * @module utils/EventEmitter
 * EventEmitter - Simple event emitter implementation for Faicey
 *
 * Provides event-driven communication between Faicey components
 * and plugins.
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {EventEmitter} - This instance for chaining
   */
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    listeners.push(listener);

    // Warn about too many listeners
    if (listeners.length > this.maxListeners) {
      console.warn(`Warning: Possible EventEmitter memory leak detected. ${listeners.length} listeners added for event "${event}". Use emitter.setMaxListeners() to increase limit.`);
    }

    return this;
  }

  /**
   * Add a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {EventEmitter} - This instance for chaining
   */
  once(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {EventEmitter} - This instance for chaining
   */
  off(event, listener) {
    if (!this.events.has(event)) {
      return this;
    }

    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);

    if (index > -1) {
      listeners.splice(index, 1);
    }

    return this;
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional - removes all if not specified)
   * @returns {EventEmitter} - This instance for chaining
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to listeners
   * @returns {boolean} - Whether any listeners were called
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event);
    if (listeners.length === 0) {
      return false;
    }

    // Create a copy to avoid issues if listeners are removed during emission
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }

    return true;
  }

  /**
   * Get the number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} - Number of listeners
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * Get all event names
   * @returns {Array<string>} - Array of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get all listeners for an event
   * @param {string} event - Event name
   * @returns {Array<Function>} - Array of listeners
   */
  listeners(event) {
    if (!this.events.has(event)) {
      return [];
    }
    return [...this.events.get(event)];
  }

  /**
   * Set the maximum number of listeners
   * @param {number} n - Maximum number of listeners
   * @returns {EventEmitter} - This instance for chaining
   */
  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new TypeError('Max listeners must be a positive number');
    }
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners
   * @returns {number} - Maximum number of listeners
   */
  getMaxListeners() {
    return this.maxListeners;
  }
}