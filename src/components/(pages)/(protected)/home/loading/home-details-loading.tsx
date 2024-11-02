// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const HomeDetailsLoading = () => {
    return (
        <Card className="mb-8 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-9 w-2/3 bg-gradient-to-r from-primary to-primary-foreground" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                        <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                        <Skeleton className="h-6 w-1/3" />
                    </div>

                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                </div>
            </CardContent>
        </Card>
    )
}