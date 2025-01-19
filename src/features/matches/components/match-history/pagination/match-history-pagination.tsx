// COMPONENTS
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/components/ui/pagination";

type MatchHistoryPaginationProps = {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

export const MatchHistoryPagination = ({
    currentPage,
    totalPages,
    setCurrentPage
}: MatchHistoryPaginationProps) => {
    return (
        <div className="mt-4 flex justify-center">
            <Pagination>
                <PaginationContent>
                    {currentPage > 1 && (
                        <PaginationItem>
                            <PaginationPrevious 
                                onClick={() => setCurrentPage(currentPage - 1)} 
                            />
                        </PaginationItem>
                    )}

                    {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i} className="hidden sm:inline-block">
                            <PaginationLink 
                                onClick={() => setCurrentPage(i + 1)}
                                isActive={currentPage === i + 1}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem className="sm:hidden">
                        <PaginationLink>{currentPage} / {totalPages}</PaginationLink>
                    </PaginationItem>
                    
                    {currentPage < totalPages && (
                        <PaginationItem>
                            <PaginationNext 
                                onClick={() => setCurrentPage(currentPage + 1)} 
                            />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    );
};