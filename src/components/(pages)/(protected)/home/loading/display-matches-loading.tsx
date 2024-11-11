// COMPONENTS
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw } from "lucide-react"

export function DisplayMatchesLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Button variant="ghost" size="sm" disabled>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </div>
            {[1, 2, 3].map((index) => (
                <Skeleton key={index} className="w-full h-32" />
            ))}
        </div>
    )
}