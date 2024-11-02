// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const TeamCardLoading = () => {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle><Skeleton className="h-5 w-2/3" /></CardTitle>
                <Skeleton className="h-3 w-1/3 mt-1" />
            </CardHeader>
            <CardContent className="space-y-2">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                    </div>
                ))}
                <Button disabled className="w-full mt-2 h-8">
                    <Skeleton className="h-3 w-16 bg-primary-foreground" />
                </Button>
            </CardContent>
        </Card>
    );
};