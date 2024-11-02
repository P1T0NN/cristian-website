// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { FilterModal } from "./filter-modal";
import { Button } from "@/components/ui/button";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { FilterValues } from "./filter-modal";

// LUCIDE ICONS
import { Filter, Calendar } from "lucide-react";

type HomeDetailsProps = {
    serverUserData: typesUser;
    activeFilters: FilterValues;
}

export const HomeDetails = async ({
    serverUserData,
    activeFilters
}: HomeDetailsProps) => {
    const t = await getTranslations("HomePage");

    return (
        <Card className="mb-8 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                        {t('welcome', { name: serverUserData.fullName })}
                    </h1>
                    <div className="flex space-x-2">
                        <FilterModal >
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </FilterModal>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mb-4">
                    <h2 className="font-semibold mb-2 flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        {Object.values(activeFilters).some(filter => filter !== '') 
                            ? t('filteredMatches')
                            : t('allMatches')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {Object.values(activeFilters).some(filter => filter !== '') 
                            ? t('filteredMessage')
                            : t('allAvailableMessage')}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}