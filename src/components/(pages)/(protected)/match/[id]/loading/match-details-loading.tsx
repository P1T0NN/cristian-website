// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// LUCIDE ICONS
import { MapPin, Calendar, Clock, Coins } from 'lucide-react';

export const MatchDetailsLoading = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                </CardTitle>
                <div className="text-center text-lg text-muted-foreground">
                    <div className="flex justify-center gap-2">
                        <Badge variant="secondary" className="whitespace-pre-line">
                            <Skeleton className="h-4 w-16" />
                        </Badge>
                        <Badge variant="secondary">
                            <Skeleton className="h-4 w-16" />
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-muted-foreground mb-2" />
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex flex-col items-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-col items-center">
                        <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex flex-col items-center">
                        <Coins className="h-5 w-5 text-muted-foreground mb-2" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};