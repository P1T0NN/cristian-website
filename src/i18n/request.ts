// LIBRARIES
import { getRequestConfig}  from 'next-intl/server';

// SERVICES
import { getUserLocale } from '@/services/server/locale';

export default getRequestConfig(async () => {
    const locale = await getUserLocale();

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});