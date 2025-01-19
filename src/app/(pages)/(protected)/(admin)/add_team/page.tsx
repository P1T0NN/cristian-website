// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { AddTeamDialog } from "@/features/teams/components/add-team-dialog";
import { TeamTable } from "@/features/teams/components/team-table";

export default async function AddTeamPage() {
    const t = await getTranslations("AddTeamPage");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{t("teams")}</h1>
                {/* No need for individual Suspense yet */}
                <AddTeamDialog />
            </div>
            
            <div className="overflow-x-auto">
                {/* No need for individual Suspense yet */}
                <TeamTable />
            </div>
        </div>
    )
}