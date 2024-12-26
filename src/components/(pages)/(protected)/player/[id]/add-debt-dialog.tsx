"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddDebtForm } from "./add-debt-form";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER_ACTIONS
import { addDebt } from "@/actions/server_actions/mutations/debt/addDebt";

type AddDebtDialogProps = {
   initialPlayerName?: string;
   addedBy: string;
}

export const AddDebtDialog = ({
   initialPlayerName,
   addedBy
}: AddDebtDialogProps) => {
   const t = useTranslations("AddDebtPage");

   const [isPending, startTransition] = useTransition();

   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [selectedOption, setSelectedOption] = useState<'player' | 'cristian'>('player');

   const { addDebtSchema } = useZodSchemas();

   const { formData, errors, handleInputChange, handleSubmit } = useForm({
       initialValues: {
           player_name: initialPlayerName as string,
           player_debt: 0,
           cristian_debt: 0,
           reason: '',
           added_by: addedBy
       },
       validationSchema: addDebtSchema,
       onSubmit: async (values) => {
           startTransition(async () => {
               const result = await addDebt({
                   addDebtData: values
               });
               
               if (result.success) {
                   toast.success(result.message);
                   setIsDialogOpen(false);
               } else {
                   toast.error(result.message);
               }
           });
       },
   });

   return (
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
               <Button variant="outline">{t('addDebt')}</Button>
           </DialogTrigger>

           <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                   <DialogTitle>{t('addDebt')}</DialogTitle>
                   <DialogDescription>{t('addDebtDescription')}</DialogDescription>
               </DialogHeader>

               <div className="py-4">
                   <AddDebtForm 
                       formData={formData}
                       errors={errors}
                       handleInputChange={handleInputChange}
                       selectedOption={selectedOption}
                       setSelectedOption={setSelectedOption}
                       initialPlayerName={initialPlayerName}
                   />
               </div>

               <DialogFooter>
                   <Button disabled={isPending} onClick={handleSubmit}>
                       {isPending ? t('adding') : t('add')}
                   </Button>
               </DialogFooter>
           </DialogContent>
       </Dialog>
   );
};