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
        <div className="flex w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">{t('editMatch')}</CardTitle>
                </CardHeader>

                <EditMatchDetails matchIdFromParams={id} />
            </Card>
        </div>
    );
}