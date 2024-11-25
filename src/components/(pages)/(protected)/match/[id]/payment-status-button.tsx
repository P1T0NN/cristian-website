// COMPONENTS
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type PaymentStatusButtonProps = {
    status: 'paid' | 'discount' | 'gratis';
    isActive: boolean | undefined;
    onClick: (e: React.MouseEvent) => void;
    icon: React.ReactNode;
    activeClass: string;
    tooltipText: string;
    disabled?: boolean;
}

export const PaymentStatusButton = ({ 
    isActive, 
    onClick, 
    icon, 
    activeClass, 
    tooltipText, 
    disabled 
}: PaymentStatusButtonProps) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 sm:h-10 sm:w-10 ${
                        isActive 
                            ? `${activeClass} hover:${activeClass.replace('bg-', 'bg-opacity-90 ')}` 
                            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={disabled ? undefined : onClick}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    aria-label={tooltipText}
                >
                    {icon}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
)
