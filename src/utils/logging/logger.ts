// LIBRARIES
import log from 'loglevel';

// UTILS
import { GenericMessages } from '@/utils/genericMessages';

const isDevelopment = process.env.NODE_ENV === 'development';

// Set log level based on environment
log.setLevel(isDevelopment ? 'debug' : 'warn');

export function logError(context: string, errorType: keyof typeof GenericMessages, originalError?: any) {
    const genericMessage = GenericMessages[errorType];

    if (isDevelopment) {
        console.error(`Error in ${context}:`, originalError);
        console.error('Generic message:', genericMessage);
    } else {
        log.error(`Error in ${context}: ${genericMessage}`, {
            context,
            errorType,
            originalError, // Include the original error for production logging
        });
    }
}

export function logInfo(message: string, meta?: any) {
    if (isDevelopment) {
        console.log(message, meta);
    } else {
        log.info(message, meta);
    }
}

export function logWarning(message: string, meta?: any) {
    if (isDevelopment) {
        console.warn(message, meta);
    } else {
        log.warn(message, meta);
    }
}

export function logDebug(message: string, meta?: any) {
    if (isDevelopment) {
        console.debug(message, meta);
    } else {
        log.debug(message, meta);
    }
}

// Utility function for sampling logs
export function sampleLog(chance: number, logFunction: Function, ...args: any[]) {
    if (Math.random() < chance) {
        logFunction(...args);
    }
}

export default log;