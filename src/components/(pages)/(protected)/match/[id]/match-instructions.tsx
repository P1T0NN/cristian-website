"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react"

// NEXTJS IMPORTS
import { useTranslations } from "next-intl"

// LIBRARIES
import { useQueryClient } from "@tanstack/react-query"

// COMPONENTS
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

// LUCIDE ICONS
import { Pencil } from "lucide-react"

// ACTIONS
import { editMatchInstructions } from "@/actions/functions/queries/edit-match-instructions"

type MatchInstructionsProps = {
    instructions: string
    matchId: string
    authToken: string
    isAdmin: boolean
}

export const MatchInstructions = ({
    instructions,
    matchId,
    authToken,
    isAdmin
}: MatchInstructionsProps) => {
    const t = useTranslations("MatchPage");
    const queryClient = useQueryClient();

    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [editedInstructions, setEditedInstructions] = useState(instructions);

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedInstructions(e.target.value);
    };

    const handleSubmit = () => {
        startTransition(async () => {
            const response = await editMatchInstructions(authToken, matchId, editedInstructions);

            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['match', matchId] });
                setIsEditing(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedInstructions(instructions);
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-4">
                                <Textarea
                                    value={editedInstructions}
                                    onChange={handleInstructionsChange}
                                    className="min-h-[100px]"
                                    placeholder={t('enterInstructions')}
                                    disabled={isPending}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        disabled={isPending}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isPending}
                                        className="w-[150px]"
                                    >
                                        {isPending ? t('saving') : t('save')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {instructions || t('noInstructions')}
                            </div>
                        )}
                    </div>
                    {isAdmin && !isEditing && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="flex-shrink-0"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">{t('editInstructions')}</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}