// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

type UserDetailsProps = {
    currentUserFullName: string;
}

export const UserDetails = async ({
    currentUserFullName
}: UserDetailsProps) => {
    const t = await getTranslations("AddMatchPage");

    return (
        <CardHeader>
            <CardTitle>{t("hello")} {currentUserFullName}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
    )
}