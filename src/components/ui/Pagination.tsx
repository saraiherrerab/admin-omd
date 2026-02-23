import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

interface PaginationProps {
    currentPage: number;
    pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    } | null;
    setCurrentPage: (page: number) => void;
}

export const Pagination = ({ currentPage, pagination, setCurrentPage }: PaginationProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-between items-center mt-4">

            <p className="text-sm text-muted-foreground">
                {t('common.pagination.page')} {currentPage} {pagination?.totalPages ? `/ ${pagination.totalPages}` : ''}
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    <ChevronLeft />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination?.hasNext}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};