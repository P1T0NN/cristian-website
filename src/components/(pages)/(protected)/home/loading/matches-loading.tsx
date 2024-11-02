'use client'

// LIBRARIES
import { motion } from 'framer-motion'

// COMPONENTS
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const LoadingMatchCard = () => (
    <Card className="w-full h-full hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-1" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

const LoadingMatchesRow = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-4"
    >
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <LoadingMatchCard />
                </motion.div>
            ))}
        </div>
    </motion.div>
)

export const MatchesLoading = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="flex flex-col items-center space-y-8"
        >
            <LoadingMatchesRow />
            <LoadingMatchesRow />
            <LoadingMatchesRow />
        </motion.div>
    )
}