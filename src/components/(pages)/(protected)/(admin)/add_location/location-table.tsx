"use client"

// REACTJS IMPORTS
import { useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// COMPONENTS
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ACTIONS
import { deleteLocation } from "@/actions/functions/queries/delete-location";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

type LocationTableProps = {
    locations: typesLocation[];
    isLoading: boolean;
    error: unknown;
}

export const LocationTable = ({ 
    locations, 
    isLoading, 
    error 
}: LocationTableProps) => {
    const t = useTranslations("AddLocationPage");
    const queryClient = useQueryClient();
    const [locationToDelete, setLocationToDelete] = useState<typesLocation | null>(null);

    const { mutate: deleteLocationMutation } = useMutation({
        mutationFn: deleteLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success(t("locationDeletedSuccess"));
        },
        onError: () => {
            toast.error(t("locationDeletedError"));
        },
    });

    const handleDeleteClick = (location: typesLocation) => {
        setLocationToDelete(location);
    };

    const handleConfirmDelete = () => {
        if (locationToDelete) {
            deleteLocationMutation(locationToDelete.id);
            setLocationToDelete(null);
        }
    };

    if (isLoading) return <p>{t("loading")}</p>;
    if (error) return <p>{t("errorLoadingLocations")}</p>;

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("locationName")}</TableHead>
                        <TableHead>{t("locationUrl")}</TableHead>
                        <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations?.map((location) => (
                        <TableRow key={location.id}>
                            <TableCell>{location.location_name}</TableCell>
                            <TableCell>
                                <a href={location.location_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    {location.location_url}
                                </a>
                            </TableCell>
                            <TableCell>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(location)}
                                >
                                    {t("delete")}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteLocationConfirmation", { locationName: locationToDelete?.location_name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>{t("delete")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};