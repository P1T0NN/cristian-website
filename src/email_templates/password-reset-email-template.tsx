// REACTJS IMPORTS
import * as React from 'react';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

type PasswordResetEmailTemplateProps = {
  resetUrl: string;
}

export const PasswordResetEmailTemplate: React.FC<Readonly<PasswordResetEmailTemplateProps>> = async ({
  resetUrl,
}) => {
  const t = await getTranslations('EmailTemplateMessages');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.5, color: '#333' }}>
      <h1 style={{ color: '#4a4a4a' }}>{t('EMAIL_PASSWORD_RESET_SUBJECT')}</h1>
      <p>{t('PASSWORD_RESET_REQUEST_RECEIVED')}</p>
      <p>{t('CLICK_BUTTON_RESET_PASSWORD')}</p>
      <div style={{ margin: '30px 0' }}>
        <a 
          href={resetUrl}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '14px 20px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            display: 'inline-block'
          }}
        >
          {t('RESET_YOUR_PASSWORD')}
        </a>
      </div>
      <p>{t('BUTTON_NOT_WORKING')}</p>
      <p style={{ wordBreak: 'break-all' }}>{resetUrl}</p>
      <p>{t('PASSWORD_RESET_LINK_EXPIRY')}</p>
      <p>{t('CONTACT_SUPPORT_IF_NOT_REQUESTED')}</p>
      <p>{t('BEST_REGARDS')}<br />{t('TEAM_NAME')}</p>
    </div>
  );
};