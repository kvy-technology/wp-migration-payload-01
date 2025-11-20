/**
 * Logger Utility
 * 
 * Centralized logging for the migration pipeline with different log levels.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO

/**
 * Set the current log level
 * 
 * @param level - Log level to set
 * 
 * @example
 * ```ts
 * setLogLevel(LogLevel.DEBUG)
 * ```
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level
}

/**
 * Log a debug message
 * 
 * @param message - Message to log
 * @param data - Optional data to log
 * 
 * @example
 * ```ts
 * logger.debug('Processing chunk', { chunk })
 * ```
 */
export function debug(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`🔍 [DEBUG] ${message}`, data || '')
  }
}

/**
 * Log an info message
 * 
 * @param message - Message to log
 * @param data - Optional data to log
 * 
 * @example
 * ```ts
 * logger.info('Migration started', { postCount: 10 })
 * ```
 */
export function info(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`ℹ️  [INFO] ${message}`, data || '')
  }
}

/**
 * Log a warning message
 * 
 * @param message - Message to log
 * @param data - Optional data to log
 * 
 * @example
 * ```ts
 * logger.warn('Image upload failed', { url })
 * ```
 */
export function warn(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`⚠️  [WARN] ${message}`, data || '')
  }
}

/**
 * Log an error message
 * 
 * @param message - Message to log
 * @param error - Error object or data
 * 
 * @example
 * ```ts
 * logger.error('Conversion failed', error)
 * ```
 */
export function error(message: string, error?: unknown): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`❌ [ERROR] ${message}`, error || '')
  }
}

/**
 * Log migration statistics
 * 
 * @param stats - Statistics object
 * 
 * @example
 * ```ts
 * logStats({ totalPosts: 10, successfulPosts: 8, failedPosts: 2 })
 * ```
 */
export function logStats(stats: {
  totalPosts?: number
  successfulPosts?: number
  failedPosts?: number
  totalChunks?: number
  totalImages?: number
  processingTime?: number
}): void {
  console.log('\n📊 Migration Statistics:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (stats.totalPosts !== undefined) {
    console.log(`Total Posts: ${stats.totalPosts}`)
  }
  if (stats.successfulPosts !== undefined) {
    console.log(`✅ Successful: ${stats.successfulPosts}`)
  }
  if (stats.failedPosts !== undefined) {
    console.log(`❌ Failed: ${stats.failedPosts}`)
  }
  if (stats.totalChunks !== undefined) {
    console.log(`Total Chunks: ${stats.totalChunks}`)
  }
  if (stats.totalImages !== undefined) {
    console.log(`Total Images: ${stats.totalImages}`)
  }
  if (stats.processingTime !== undefined) {
    console.log(`Processing Time: ${stats.processingTime}ms`)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

export const logger = {
  debug,
  info,
  warn,
  error,
  logStats,
  setLogLevel,
}

