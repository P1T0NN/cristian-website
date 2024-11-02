// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

type DebtsTableLoadingProps = {
    isCurrentUserAdmin: boolean
}

export const DebtsTableLoading = ({ 
    isCurrentUserAdmin 
}: DebtsTableLoadingProps) => {
    return (
        <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Player Owes</TableHead>
                        <TableHead>I Owe</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Added By</TableHead>
                        {isCurrentUserAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            {isCurrentUserAdmin && (
                                <TableCell>
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}