"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// TYPES
import type { typesPlayer } from '@/features/matches/types/typesMatch';

// LUCIDE ICONS
import { Users, Ticket, Gift, CreditCard, XCircle } from 'lucide-react';

type StatsItemIcon = 'users' | 'ticket' | 'gift' | 'credit-card' | 'x-circle';

interface StatsItemProps {
    icon: StatsItemIcon;
    label: string;
    players: typesPlayer[];
}

const ICON_MAP = {
    'users': Users,
    'ticket': Ticket,
    'gift': Gift,
    'credit-card': CreditCard,
    'x-circle': XCircle
} as const;

const formatPlayerNames = (players: typesPlayer[]) => {
    return players.length > 0 
        ? ` (${players.map(p => {
            if (p.playerType === 'temporary') {
                return p.temporaryPlayerName;
            }
            return p.name;
        }).filter(Boolean).join(', ')})` 
        : '';
};

export const StatsItem = ({ icon, label, players }: StatsItemProps) => {
    const t = useTranslations('MatchHistoryPage');
    const Icon = ICON_MAP[icon];
    const isError = icon === 'x-circle';

    return (
        <div className="flex items-start">
            <Icon 
                className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 mt-1 
                    ${isError ? 'text-red-500' : ''}`} 
            />
            <span className="flex flex-col">
                <span>{t(label)}: {players.length}</span>
                <span className="text-[11px] text-muted-foreground whitespace-normal max-h-10 overflow-y-auto">
                    {formatPlayerNames(players)}
                </span>
            </span>
        </div>
    );
};