// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

type UserDetailsProps = {
    currentUserName: string;
}

export const UserDetails = async ({
    currentUserName
}: UserDetailsProps) => {
    const t = await getTranslations("AddMatchPage");

    return (
        <CardHeader>
            <CardTitle>{t("hello")} {currentUserName}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
    )
}