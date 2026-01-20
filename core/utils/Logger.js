/**
 * @module utils/Logger
 * Logger - Centralized logging utility for Faicey
 *
 * Provides structured logging with different levels and output formats
 * for debugging, monitoring, and development.
 */

export class Logger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.level = options.level || 'info';
    this.prefix = options.prefix || 'Faicey';
    this.timestamps = options.timestamps !== false;
    this.colors = options.colors !== false;

    // Log levels in order of verbosity
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      none: 4
    };

    this.currentLevel = this.levels[this.level] || this.levels.info;
  }

  /**
   * Format a log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Array} args - Additional arguments
   * @returns {string} - Formatted message
   */
  formatMessage(level, message, args = []) {
    let formatted = '';

    // Add timestamp
    if (this.timestamps) {
      formatted += `[${new Date().toISOString()}] `;
    }

    // Add prefix
    formatted += `[${this.prefix}] `;

    // Add level
    if (this.colors) {
      const color = this.getLevelColor(level);
      formatted += `${color}[${level.toUpperCase()}]${this.resetColor()} `;
    } else {
      formatted += `[${level.toUpperCase()}] `;
    }

    // Add message
    formatted += message;

    // Add additional arguments
    if (args.length > 0) {
      formatted += ' ' + args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
    }

    return formatted;
  }

  /**
   * Get color code for log level
   * @param {string} level - Log level
   * @returns {string} - ANSI color code
   */
  getLevelColor(level) {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    };
    return colors[level] || '\x1b[0m';
  }

  /**
   * Get reset color code
   * @returns {string} - ANSI reset code
   */
  resetColor() {
    return '\x1b[0m';
  }

  /**
   * Check if level should be logged
   * @param {string} level - Log level to check
   * @returns {boolean} - Whether to log
   */
  shouldLog(level) {
    return this.enabled && this.levels[level] >= this.currentLevel;
  }

  /**
   * Log a message at debug level
   * @param {string} message - Log message
   * @param {...*} args - Additional arguments
   */
  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, args));
    }
  }

  /**
   * Log a message at info level
   * @param {string} message - Log message
   * @param {...*} args - Additional arguments
   */
  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, args));
    }
  }

  /**
   * Log a message at warn level
   * @param {string} message - Log message
   * @param {...*} args - Additional arguments
   */
  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, args));
    }
  }

  /**
   * Log a message at error level
   * @param {string} message - Log message
   * @param {...*} args - Additional arguments
   */
  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, args));
    }
  }

  /**
   * Create a child logger with a specific prefix
   * @param {string} childPrefix - Child logger prefix
   * @returns {Logger} - Child logger instance
   */
  child(childPrefix) {
    return new Logger({
      enabled: this.enabled,
      level: this.level,
      prefix: `${this.prefix}:${childPrefix}`,
      timestamps: this.timestamps,
      colors: this.colors
    });
  }

  /**
   * Set logging level
   * @param {string} level - New log level
   */
  setLevel(level) {
    this.level = level;
    this.currentLevel = this.levels[level] || this.levels.info;
  }

  /**
   * Enable or disable logging
   * @param {boolean} enabled - Whether logging is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Enable or disable colors
   * @param {boolean} colors - Whether colors are enabled
   */
  setColors(colors) {
    this.colors = colors;
  }

  /**
   * Enable or disable timestamps
   * @param {boolean} timestamps - Whether timestamps are enabled
   */
  setTimestamps(timestamps) {
    this.timestamps = timestamps;
  }
}