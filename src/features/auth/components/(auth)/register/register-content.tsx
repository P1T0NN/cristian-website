// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { GoogleLoginButton } from "../google-login-button";
import { Separator } from "@/shared/components/ui/separator";

export const RegisterContent = async () => {
    const t = await getTranslations('AuthPage');

    return (
        <section className="flex w-full min-h-screen justify-center">
            <div className="flex flex-col pt-16 items-center space-y-7">
                <h1 className="text-2xl font-bold">{t('title')}</h1>

                <div className="flex flex-col space-y-10">
                    <GoogleLoginButton />

                    <div className="flex flex-col items-center space-y-10">
                        <Separator />
                        <div className="flex flex-col items-center space-y-2">
                            <p>
                                {t('notAMember')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};