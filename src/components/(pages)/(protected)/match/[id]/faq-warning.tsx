"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// LUCIDE ICONS
import { AlertTriangle } from 'lucide-react';

export const FAQWarning = () => {
    const t = useTranslations('MatchPage');

    const scrollToFAQ = () => {
        const faqElement = document.getElementById('match-faq');
        if (faqElement) {
            faqElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div 
            className="bg-red-600 text-white p-4 rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
            onClick={scrollToFAQ}
        >
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span className="font-bold">{t('checkFAQWarning')}</span>
        </div>
    );
};