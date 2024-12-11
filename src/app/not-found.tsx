// NEXTJS IMPORTS
import Link from 'next/link';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
    const t = await getTranslations("NotFoundPage");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-center">
                {t('message')}
            </p>
            <Link 
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
                {t('homeLink')}
            </Link>
        </div>
    )
}