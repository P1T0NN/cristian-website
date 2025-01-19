// COMPONENTS
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-40 mb-2" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <Skeleton className="w-16 h-16 rounded-full mb-2" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}