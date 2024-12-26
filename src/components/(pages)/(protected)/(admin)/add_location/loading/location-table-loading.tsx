// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const LocationTableLoading = async () => {
    const t = await getTranslations("AddLocationPage");

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold">{t("locations")}</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">
                            <Skeleton className="h-4 w-8" />
                        </TableHead>
                        
                        <TableHead>
                            <Skeleton className="h-4 w-24" />
                        </TableHead>

                        <TableHead>
                            <Skeleton className="h-4 w-16" />
                        </TableHead>

                        <TableHead>
                            <Skeleton className="h-4 w-12" />
                        </TableHead>

                        <TableHead>
                            <Skeleton className="h-4 w-16" />
                        </TableHead>

                        <TableHead className="text-right">
                            <Skeleton className="h-4 w-14 ml-auto" />
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4 w-[80px]" />
                            </TableCell>
                            
                            <TableCell>
                                <Skeleton className="h-4 w-[150px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[200px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}