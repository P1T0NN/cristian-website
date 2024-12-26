// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { 
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// LUCIDE ICONS
import { Trash2 } from "lucide-react";
import { DeleteLocationButton } from "./delete-location-button";

type DeleteLocationDialogProps = {
    locationId: number;
    locationName: string;
}

export const DeleteLocationDialog = async ({
    locationId,
    locationName,
}: DeleteLocationDialogProps) => {
    const t = await getTranslations("AddLocationPage");

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 p-0"
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">{t("delete")}</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("deleteLocationConfirmation", { locationName: locationName })}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    
                    <DeleteLocationButton locationId={locationId} />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}