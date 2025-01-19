// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

export default async function loading() {
    const t = await getTranslations("PlayerPage");

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="pb-0">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <div className="flex items-center mt-1 space-x-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
    
                <CardContent className="pt-6">
                    <div className="grid gap-4 mb-6">
                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        ))}
                    </div>
        
                    <Skeleton className="h-10 w-32 mb-6" />
                    
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
        
                    {/* Debts Table Loading */}
                    <div className="mt-8">
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("date")}</TableHead>
                                    <TableHead>{t("playerOwes")}</TableHead>
                                    <TableHead>{t("iOwe")}</TableHead>
                                    <TableHead>{t("reason")}</TableHead>
                                    <TableHead>{t("addedBy")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}