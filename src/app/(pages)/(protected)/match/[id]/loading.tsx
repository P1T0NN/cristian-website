// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Coins } from 'lucide-react';

export default async function loading() {
    return (
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
            {/* DisplayTeamDetailsLoading */}
            <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* MatchDetailsLoading */}
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

            {/* MatchInstructionsLoading */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardContent>
            </Card>

            {/* SwitchTeamColorsLoading */}
            <div className="flex items-center">
                <Skeleton className="h-9 w-32 mx-auto mb-4" />
            </div>

            {/* TeamCardLoading */}
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
        </div>
    );
}