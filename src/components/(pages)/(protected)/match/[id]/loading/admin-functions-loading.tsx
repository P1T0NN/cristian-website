// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminFunctionsLoading = () => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-32" />
                ))}
            </CardContent>
        </Card>
    );
};

