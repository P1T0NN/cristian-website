// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

// COMPONENTS
import { ToggleMode } from "@/shared/components/ui/toggle-mode/toggle-mode";
import { ChooseLanguage } from "./header_unprotected/choose-language";

export const HeaderUnprotected = async () => {
    const locale = await getUserLocale();

    return (
        <nav className="flex w-full py-4 px-10 justify-between items-center bg-transparent">
            <h1 className="text-xl font-bold tracking-[2px]">Crys Sports</h1>

            <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                    <ChooseLanguage locale={locale} />
                </div>
                <ToggleMode />
            </div>
        </nav>
    )
}