"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// NEXTJS IMPORTS
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";

// SERVER ACTIONS
import { addFriend } from "../../actions/server_actions/addFriend";

interface AddFriendButtonProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const AddFriendButton = ({
    matchIdFromParams,
    teamNumber
}: AddFriendButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [friendName, setFriendName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleAddFriend = () => {
        if (!friendName.trim() || !phoneNumber.trim()) {
            toast.error(t("fillAllFields"));
            return;
        }

        startTransition(async () => {
            const response = await addFriend({
                matchIdFromParams,
                teamNumber,
                friendName: friendName.trim(),
                phoneNumber: phoneNumber.trim()
            });

            if (response.success && response.data) {
                setOpen(false);
                setFriendName("");
                setPhoneNumber("");
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                >
                    {t("addFriend")}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("addFriendTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("addFriendDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Input
                            id="friendName"
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            placeholder={t("enterFriendName")}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder={t("enterPhoneNumber")}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleAddFriend}
                        disabled={isPending}
                    >
                        {t("addFriend")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
