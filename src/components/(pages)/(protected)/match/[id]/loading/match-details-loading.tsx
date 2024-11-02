// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// LUCIDE ICONS
import { MapPin, Calendar, Clock, Coins } from 'lucide-react';

export const MatchDetailsLoading = () => {
    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">
                    <Skeleton className="h-8 w-48" />
                </CardTitle>

                <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </CardHeader>

            <CardContent>
                <div className="mt-4 grid gap-4">
                    <div className="flex items-center space-x-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />

                        <div className="flex-1">
                            <Skeleton className="h-5 w-full max-w-[200px]" />
                        </div>

                        <Skeleton className="h-8 w-24" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <Skeleton className="h-5 w-32" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <Skeleton className="h-5 w-24" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};