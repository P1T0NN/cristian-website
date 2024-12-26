"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// SERVER ACTIONS
import { leaveMatch } from "@/actions/server_actions/mutations/match/leaveTeam";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type PlayerLeaveTeamButtonProps = {
    matchIdFromParams: string;
    setShowSubstituteDialog: (isVisible: boolean) => void;
}

export const PlayerLeaveTeamButton = ({
    matchIdFromParams,
    setShowSubstituteDialog
}: PlayerLeaveTeamButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLeaveTeam = () => {
        startTransition(async () => {
            const response = await leaveMatch({
                matchIdFromParams: matchIdFromParams
            });
    
            if (response.success) {
                toast.success(response.message);
            } else if (response.metadata && response.metadata.canRequestSubstitute) {
                setShowSubstituteDialog(true);
            } else {
                toast.error(response.message);
            }
            setIsDialogOpen(false);
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('leaving')}
                        </>
                    ) : (
                        t('leaveTeam')
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmLeaveMatchTitle')}</DialogTitle>
                    <DialogDescription>{t('confirmLeaveMatchDescription')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleLeaveTeam} disabled={isPending}>
                        {isPending ? t('leaving') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION leave_match(
    p_auth_user_id UUID,
    p_match_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_current_time TIMESTAMP;
    v_eight_hours_before_match TIMESTAMP;
    v_updated_places_occupied INT;
    v_updated_balance NUMERIC;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_player FROM match_players WHERE match_id = p_match_id AND user_id = p_auth_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

    IF v_current_time > v_eight_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    -- Refund the player if they paid
    IF v_player.has_entered_with_balance THEN
        UPDATE users
        SET balance = balance + v_match.price::numeric
        WHERE id = p_auth_user_id
        RETURNING balance INTO v_updated_balance;
    END IF;

    -- Remove the player from the match
    DELETE FROM match_players
    WHERE match_id = p_match_id AND user_id = p_auth_user_id;

    -- Update the places occupied
    UPDATE matches
    SET places_occupied = places_occupied - 1
    WHERE id = p_match_id
    RETURNING places_occupied INTO v_updated_places_occupied;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_LEFT_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_balance', v_updated_balance,
            'updated_places_occupied', v_updated_places_occupied
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR', 
            'message', SQLERRM,
            'sqlstate', SQLSTATE,
            'detail', COALESCE(SQLERRM, 'Unknown error'),
            'context', 'leave_match function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION leave_match(UUID, UUID) TO anon, authenticated;

*/