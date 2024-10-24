// LIBRARIES
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

// EMAIL TEMPLATES
import { VerificationEmailTemplate } from '@/email_templates/verification-email-template';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendRegisterVerificationEmailProps = {
    email: string;
    firstName: string;
    lastName: string;
    verificationToken: string;
};

export async function POST(request: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations('GenericMessages');
    const emailTemplateMessages = await getTranslations('EmailTemplateMessages');

    const body = await request.json();
    
    const { email, firstName, lastName, verificationToken }: SendRegisterVerificationEmailProps = body;

    // Construct the verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify_email?token=${verificationToken}`;

    const response = await resend.emails.send({
        from: 'Cris Futbol <onboarding@resend.dev>',
        to: email,
        subject: emailTemplateMessages('EMAIL_VERIFICATION_SUBJECT'),
        react: VerificationEmailTemplate({ verificationUrl, firstName, lastName }),
    });

    if (response.error) {
        return NextResponse.json({ success: false, message: genericMessages('REGISTER_VERIFICATION_EMAIL_FAILED') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: genericMessages('USER_CREATED') }, { status: 200 });
}