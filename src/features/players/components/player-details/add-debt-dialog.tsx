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
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { AddDebtForm } from "./add-debt-form";

// HOOKS
import { useForm } from "@/shared/hooks/useForm";
import { useZodSchemas } from "@/shared/hooks/useZodSchema";

// SERVER_ACTIONS
import { addDebt } from "@/features/debt/actions/server_actions/addDebt";

type AddDebtDialogProps = {
   initialPlayerName?: string;
   addedBy: string;
}

export const AddDebtDialog = ({
   initialPlayerName,
   addedBy
}: AddDebtDialogProps) => {
   const t = useTranslations("PlayerPage");

   const [isPending, startTransition] = useTransition();

   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [selectedOption, setSelectedOption] = useState<'player' | 'cristian'>('player');

   const { addDebtSchema } = useZodSchemas();

   const handleOptionChange = (option: 'player' | 'cristian') => {
       setSelectedOption(option);
       
       // Reset the other debt type when changing options
       if (option === 'player') {
           // Direct form value update without event
           handleInputChange({
               target: { name: 'cristian_debt', value: '0' }
           } as unknown as React.ChangeEvent<HTMLInputElement>);
       } else {
           // Direct form value update without event
           handleInputChange({
               target: { name: 'player_debt', value: '0' }
           } as unknown as React.ChangeEvent<HTMLInputElement>);
       }
   };

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
               // Ensure values are proper numbers
               const submissionData = {
                   ...values,
                   player_debt: Number(values.player_debt),
                   cristian_debt: Number(values.cristian_debt)
               };
               
               const result = await addDebt({
                   addDebtData: submissionData
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
                       setSelectedOption={(option: 'player' | 'cristian') => handleOptionChange(option)}
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