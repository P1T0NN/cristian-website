// REACTJS IMPORTS
import * as React from 'react';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

type VerificationEmailTemplateProps = {
  verificationUrl: string;
  firstName?: string;
  lastName?: string;
}

export const VerificationEmailTemplate: React.FC<Readonly<VerificationEmailTemplateProps>> = async ({
  firstName,
  lastName,
  verificationUrl,
}) => {
  const t = await getTranslations('EmailTemplateMessages');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.5, color: '#333' }}>
      <h1 style={{ color: '#4a4a4a' }}>
        {firstName} {lastName}, {t('WELCOME_MESSAGE')}
      </h1>
      <p>{t('REGISTRATION_THANK_YOU')}</p>
      <div style={{ margin: '30px 0' }}>
        <a 
          href={verificationUrl}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '14px 20px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          {t('VERIFY_YOUR_EMAIL')}
        </a>
      </div>

      <p>{t('BUTTON_NOT_WORKING')}</p>
      <p style={{ wordBreak: 'break-all' }}>{verificationUrl}</p>

      <p>{t('IGNORE_IF_NOT_SIGNED_UP')}</p>

      <p>{t('BEST_REGARDS')}<br />{t('TEAM_NAME')}</p>
    </div>
  );
};