// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

// SERVICES
import { getUserLocale } from '@/services/server/locale';

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