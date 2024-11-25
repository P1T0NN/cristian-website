// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { AddLocationDialog } from "@/components/(pages)/(protected)/(admin)/add_location/add-location-dialog";
import { LocationTable } from "@/components/(pages)/(protected)/(admin)/add_location/location-table";

export default async function AddLocationPage() {
    const t = await getTranslations("AddLocationPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{t("locations")}</h1>
                <AddLocationDialog authToken={authToken} />
            </div>
            
            <div className="overflow-x-auto">
                <LocationTable authToken={authToken} />
            </div>
        </div>
    );
}