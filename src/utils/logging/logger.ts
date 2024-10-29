import log from 'loglevel';
import { GenericMessages } from '@/utils/genericMessages';

const isDevelopment = process.env.NODE_ENV === 'development';

log.setLevel(isDevelopment ? 'debug' : 'warn');

type ErrorType = keyof typeof GenericMessages;
type LogFunction = (message: string, meta?: Record<string, unknown>) => void;

export function logError(context: string, errorType: ErrorType, originalError?: unknown) {
    const genericMessage = GenericMessages[errorType];

    if (isDevelopment) {
        console.error(`Error in ${context}:`, originalError);
        console.error('Generic message:', genericMessage);
    } else {
        log.error(`Error in ${context}: ${genericMessage}`, {
            context,
            errorType,
            originalError,
        });
    }
}

export function logInfo(message: string, meta?: Record<string, unknown>) {
    if (isDevelopment) {
        console.log(message, meta);
    } else {
        log.info(message, meta);
    }
}

export function logWarning(message: string, meta?: Record<string, unknown>) {
    if (isDevelopment) {
        console.warn(message, meta);
    } else {
        log.warn(message, meta);
    }
}

export function logDebug(message: string, meta?: Record<string, unknown>) {
    if (isDevelopment) {
        console.debug(message, meta);
    } else {
        log.debug(message, meta);
    }
}

export function sampleLog(chance: number, logFunction: LogFunction, ...args: [string, Record<string, unknown>?]) {
    if (Math.random() < chance) {
        logFunction(...args);
    }
}

export default log;