// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EditMatchDetails } from "@/components/(pages)/(protected)/(admin)/edit_match/[id]/edit-match-details";

export default async function EditMatchPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const t = await getTranslations("EditMatchPage");

    const { id } = await params;

    return (
        <div className="flex w-full h-full py-10 justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('editMatch')}</CardTitle>
                </CardHeader>

                <EditMatchDetails matchId={id} />
            </Card>
        </div>
    );
}