"use client";

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";

// SERVER ACTIONS
import { adminAddPlayerToMatch } from "../../actions/server_actions/adminAddPlayerToMatch";

// LUCIDE ICONS
import { UserPlus } from "lucide-react";

interface AdminAddPlayerProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const AdminAddPlayerButton = ({ 
    matchIdFromParams, 
    teamNumber 
}: AdminAddPlayerProps) => {
    const t = useTranslations("MatchPage");
    
    const [isOpen, setIsOpen] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const [playerPosition, setPlayerPosition] = useState("");
    const [isPending, startTransition] = useTransition();

    const positionOptions = [
        { value: 'Goalkeeper', label: t('goalkeeper') },
        { value: 'Defender', label: t('defender') },
        { value: 'Midfielder', label: t('midfielder') },
        { value: 'Forward', label: t('attacker') },
    ];

    const handleAddPlayer = () => {
        if (!playerName.trim() || !playerPosition) {
            toast.error(t("fillAllFields"));
            return;
        }

        startTransition(async () => {
            const result = await adminAddPlayerToMatch({
                matchIdFromParams,
                teamNumber,
                playerName: playerName.trim(),
                playerPosition
            });

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
                setPlayerName("");
                setPlayerPosition("");
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild> 
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1"
                    disabled={isPending}
                >
                    <UserPlus className="h-4 w-4" />
                    {isPending ? t("addingPlayer") : t("addPlayer")}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("addPlayerToTeam")}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="player-name">{t("playerName")}</Label>
                        <Input
                            id="player-name"
                            placeholder={t("enterPlayerName")}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            {t("playerPosition")}
                        </Label>
                        <Select
                            value={playerPosition}
                            onValueChange={setPlayerPosition}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("playerPositionPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {positionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </Button>

                    <Button 
                        onClick={handleAddPlayer}
                        disabled={isPending || !playerName.trim() || !playerPosition}
                    >
                        {isPending ? t("addingPlayer") : t("addPlayer")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};