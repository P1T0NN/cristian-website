import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const MatchCardLoading = () => {
    return (
        <Card className="w-full bg-white">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-8" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="text-right">
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
                <Skeleton className="h-8 w-full mt-3" />
            </CardContent>
        </Card>
    )
}