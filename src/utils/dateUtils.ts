// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';

export const formatTime = (timeStr: string): string => {
    return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
};

export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'do MMMM'); // Will output like "22nd April"
};