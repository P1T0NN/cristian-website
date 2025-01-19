// REACTJS IMPORTS
import { Suspense } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { AddLocationDialog } from "@/features/locations/components/add-location/add-location-dialog";
import { LocationTable } from "@/features/locations/components/location-table/location-table";
import { LocationTableLoading } from "@/features/locations/components/loading/location-table-loading";

export default async function AddLocationPage() {
    const t = await getTranslations("AddLocationPage");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{t("locations")}</h1>
                {/* No need for individual Suspense here, loading.tsx is sufficient since we do not fetch data here at all */}
                <AddLocationDialog />
            </div>
            
            <div className="overflow-x-auto">
                <Suspense fallback={<LocationTableLoading />}>
                    <LocationTable />
                </Suspense>
            </div>
        </div>
    );
}