"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { AnimatePresence, motion } from "framer-motion";

// TYPES
import type { typesMatch } from "@/types/typesMatch"

type AnimationNoMatchesProps = {
    serverMatchesData: typesMatch[];
}

export const AnimationNoMatches = ({
    serverMatchesData
}: AnimationNoMatchesProps) => {
    const t = useTranslations("MatchPage");

    return (
        <AnimatePresence>
            {serverMatchesData.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                >
                    <p className="text-muted-foreground">
                        {t('noMatchesFound')}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}