// COMPONENTS
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AddMatchLoading = () => {
    return (
        <main className="flex flex-col w-full min-h-screen">
            <div className="flex items-center justify-center flex-grow">
                <div className="flex w-full h-full py-10 justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        
                        <CardFooter>
                            <Skeleton className="h-10 w-[150px]" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </main>
    )
}