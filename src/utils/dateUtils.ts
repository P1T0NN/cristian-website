// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

// SERVICES
import { getUserLocale } from '@/services/server/locale';

export const formatTime = (timeStr: string): string => {
    return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
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