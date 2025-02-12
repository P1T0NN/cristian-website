// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";

export const MatchHeaderLoading = () => {
    return (
        <>
            {/* Admin Controls Loading State */}
            <div className="bg-yellow-50 border-b border-yellow-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <div className="hidden md:flex gap-3">
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                        <div className="md:hidden">
                            <Skeleton className="h-9 w-9" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Content Loading State */}
            <header className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col space-y-4">
                        <Skeleton className="h-4 w-32 bg-gray-700" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <Skeleton className="h-9 w-64 bg-gray-700" />

                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3].map((i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="bg-gray-800"
                                    >
                                        <Skeleton className="h-5 w-24 bg-gray-700" />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-5 bg-gray-700" />
                            <Skeleton className="h-5 w-32 bg-gray-700" />
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};