// COMPONENTS
import { CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default async function loading() {
    return (
        <>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <Separator />

                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <Separator />

                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                <Skeleton className="h-10 w-full" />
            </CardContent>

            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </>
    );
};