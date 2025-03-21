// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

// SERVICES
import { getUserLocale } from '../services/server/locale';

export const formatTime = (timeStr: string): string => {
    const date = new Date(`2000-01-01T${timeStr}`);
    const hours = date.getHours();
    //const minutes = date.getMinutes();
    
    if (hours >= 12) {
        // PM: Use 24-hour format
        return format(date, 'HH:mm') + 'PM';
    } else {
        // AM: Use 12-hour format
        return format(date, 'hh:mm') + 'AM';
    }
};

export const formatDate = async (dateStr: string, showTomorrow: boolean = false): Promise<string> => {
    const locale = await getUserLocale();
    const date = new Date(dateStr);
    const localeObj = locale === 'es' ? es : undefined;

    if (locale === "es") {
        if (isToday(date)) return "Hoy";
        if (isTomorrow(date) && showTomorrow) return "Mañana";
        return format(date, "EEEE, d 'de' MMMM", { locale: es });
    } else {
        if (isToday(date)) return "Today";
        if (isTomorrow(date) && showTomorrow) return "Tomorrow";
        return format(date, "EEEE, do MMMM", { locale: localeObj });
    }
};

/**
 * Returns the current date in YYYY-MM-DD format
 */
export const getCurrentDateString = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

/**
 * Returns the current time in HH:MM format
 */
export const getCurrentTimeString = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`; // Format: HH:MM
};

/**
 * Returns current date and time strings for use in queries
 */
export const getCurrentDateTimeStrings = () => {
    return {
        currentDate: getCurrentDateString(),
        currentTime: getCurrentTimeString()
    };
};

/**
 * Returns a date string for N days ago
 * @param daysAgo Number of days to go back
 */
export const getDateDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

/**
 * Returns the current date and time as a Date object
 */
export const getCurrentDateTime = (): Date => {
    return new Date();
};