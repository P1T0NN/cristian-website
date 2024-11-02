// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export const LocationTableLoading = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Location Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4 w-[80px]" />
                            </TableCell>
                            
                            <TableCell>
                                <Skeleton className="h-4 w-[150px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[200px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}