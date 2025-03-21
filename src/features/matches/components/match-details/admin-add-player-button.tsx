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
import { ScrollArea } from "@/shared/components/ui/scroll-area";

// SERVER ACTIONS
import { adminAddPlayerToMatch } from "../../actions/server_actions/adminAddPlayerToMatch";

// LUCIDE ICONS
import { UserPlus, PlusCircle, X } from "lucide-react";

interface AdminAddPlayerProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

interface PlayerToAdd {
    name: string;
    position: string;
}

export const AdminAddPlayerButton = ({ 
    matchIdFromParams, 
    teamNumber 
}: AdminAddPlayerProps) => {
    const t = useTranslations("MatchPage");
    
    const [isOpen, setIsOpen] = useState(false);
    const [players, setPlayers] = useState<PlayerToAdd[]>([{ name: "", position: "" }]);
    const [isPending, startTransition] = useTransition();

    const positionOptions = [
        { value: 'Goalkeeper', label: t('goalkeeper') },
        { value: 'Defender', label: t('defender') },
        { value: 'Midfielder', label: t('midfielder') },
        { value: 'Forward', label: t('attacker') },
    ];

    const addPlayerField = () => {
        setPlayers([...players, { name: "", position: "" }]);
    };

    const removePlayerField = (index: number) => {
        if (players.length > 1) {
            const updatedPlayers = [...players];
            updatedPlayers.splice(index, 1);
            setPlayers(updatedPlayers);
        }
    };

    const updatePlayerField = (index: number, field: 'name' | 'position', value: string) => {
        const updatedPlayers = [...players];
        updatedPlayers[index] = {
            ...updatedPlayers[index],
            [field]: value
        };
        setPlayers(updatedPlayers);
    };

    const handleAddPlayers = () => {
        // Filter out empty player names
        const validPlayers = players.filter(player => player.name.trim() !== '');
        
        if (validPlayers.length === 0) {
            toast.error(t("fillAllFields"));
            return;
        }

        startTransition(async () => {
            const result = await adminAddPlayerToMatch({
                matchIdFromParams,
                teamNumber,
                players: validPlayers
            });

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
                // Reset to a single empty player field
                setPlayers([{ name: "", position: "" }]);
            } else {
                toast.error(result.message);
            }
        });
    };

    const hasAtLeastOneValidPlayer = players.some(player => player.name.trim() !== '');

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
                
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 py-4 pr-4">
                        {players.map((player, index) => (
                            <div key={index} className="space-y-4 rounded-md border p-4 relative">
                                {players.length > 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => removePlayerField(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                                
                                <div className="space-y-2">
                                    <Label htmlFor={`player-name-${index}`}>{t("playerName")}</Label>
                                    <Input
                                        id={`player-name-${index}`}
                                        placeholder={t("enterPlayerName")}
                                        value={player.name}
                                        onChange={(e) => updatePlayerField(index, 'name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        {t("playerPosition")} <span className="text-sm text-muted-foreground">{t("optional")}</span>
                                    </Label>
                                    <Select
                                        value={player.position}
                                        onValueChange={(value) => updatePlayerField(index, 'position', value)}
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
                        ))}
                        
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full flex items-center justify-center gap-2"
                            onClick={addPlayerField}
                        >
                            <PlusCircle className="h-4 w-4" />
                            {t("addAnotherPlayer")}
                        </Button>
                    </div>
                </ScrollArea>
                
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </Button>

                    <Button 
                        onClick={handleAddPlayers}
                        disabled={isPending || !hasAtLeastOneValidPlayer}
                    >
                        {isPending 
                            ? players.length > 1 ? t("addingPlayers") : t("addingPlayer") 
                            : players.length > 1 ? t("addPlayers") : t("addPlayer")
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};