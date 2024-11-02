// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { AddLocationDialog } from "@/components/(pages)/(protected)/(admin)/add_location/add-location-dialog";
import { LocationTable } from "@/components/(pages)/(protected)/(admin)/add_location/location-table";
import { LocationTableLoading } from "@/components/(pages)/(protected)/(admin)/add_location/loading/locations-table-loading";

export default async function AddLocationPage() {
    const t = await getTranslations("AddLocationPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t("locations")}</h1>
                <AddLocationDialog authToken={authToken} />
            </div>
            
            <Suspense fallback={<LocationTableLoading />}>
                <LocationTable authToken={authToken} />
            </Suspense>
        </div>
    );
}