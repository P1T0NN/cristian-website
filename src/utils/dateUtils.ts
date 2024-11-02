// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';

// SERVICES
import { getUserLocale } from '@/services/server/locale';

export const formatTime = (timeStr: string): string => {
    return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
};

export const formatDate = async (dateStr: string): Promise<string> => {
    const locale = await getUserLocale();
    
    const date = new Date(dateStr);

    if (locale === "es") {
        if (isToday(date)) return "Hoy";
        if (isTomorrow(date)) return "Mañana";
    } else {
        if (isToday(date)) return "Today";
        if (isTomorrow(date)) return "Tomorrow";
    }

    return format(date, 'do MMMM'); // Outputs like "22nd April" or "22 de abril"
};