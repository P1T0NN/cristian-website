// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// TYPES
import type { typesUser } from "@/types/typesUser";

type UserDetailsProps = {
    serverUserData: typesUser;
}

export const UserDetails = async ({
    serverUserData
}: UserDetailsProps) => {
    const t = await getTranslations("AddMatchPage");

    return (
        <CardHeader>
            <CardTitle>{t("hello")} {serverUserData.fullName}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
    )
}