// COMPONENTS
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default async function loading() {
    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Skeleton className="h-10 w-[150px]" />
            </CardFooter>
        </Card>
    );
}