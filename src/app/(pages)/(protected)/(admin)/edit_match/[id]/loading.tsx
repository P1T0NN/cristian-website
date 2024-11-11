// COMPONENTS
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
    return (
        <div className="flex w-full h-full py-10 justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-48" /> {/* CardTitle skeleton */}
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Location Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Price Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Team1 Name Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Team2 Name Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Date Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Time Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Match Type Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Match Gender Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Submit Button */}
                    <Skeleton className="h-10 w-full mt-4" />
                </CardContent>

                <CardFooter className="flex w-full">
                    <Skeleton className="h-10 w-32" /> {/* Cancel Edit Button */}
                </CardFooter>
            </Card>
        </div>
    );
}