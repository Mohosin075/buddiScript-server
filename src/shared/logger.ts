import path from 'path'
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import fs from 'fs'
import { TransformableInfo } from 'logform'

// Check if we're running in Vercel environment
const isVercel = process.env.VERCEL || !fs.existsSync('/var/task')

// Custom log format
const { combine, timestamp, label, printf } = format

const myFormat = printf((info: TransformableInfo) => {
  const { level, message, label, timestamp } = info
  const date = new Date(timestamp as string)
  const hour = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `{${date.toDateString()} ${hour}:${minutes}:${seconds}} [${label}] ${level}: ${message}`
})

// Common transport configuration
const getTransportConfig = (type: 'success' | 'error') => {
  const baseTransports = [new transports.Console()]
  
  if (isVercel) {
    return baseTransports
  }
  
  // Only add file transport if not in Vercel
  const filename = type === 'success' 
    ? path.join(process.cwd(), 'logs', 'winston', 'successes', 'sg-%DATE%-success.log')
    : path.join(process.cwd(), 'logs', 'winston', 'errors', 'sg-%DATE%-error.log')
  
  return [
    ...baseTransports,
    new DailyRotateFile({
      filename,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    })
  ]
}

// Success logger
const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'buddiScript 🚀' }), timestamp(), myFormat),
  transports: getTransportConfig('success'),
})

// Error logger
const errorLogger = createLogger({
  level: 'error',
  format: combine(label({ label: 'buddiScript 🐞' }), timestamp(), myFormat),
  transports: getTransportConfig('error'),
})

export { logger, errorLogger }