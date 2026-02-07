interface TableProps {
    title?: string;
    subtitle?: string;
    headers: string[];
    children: React.ReactNode;

}

export const Table = ({ title, subtitle, headers, children }: TableProps) => {
    // console.log(rows)
    return (
        <div className="flex flex-col gap-4 p-2 md:p-6 bg-secondary rounded-lg text-left overflow-x-auto">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            <table className="w-full">
                <thead className="hidden md:table-header-group">
                    <tr className="border-b">
                        {headers.map((header) => (
                            <th key={header} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="block md:table-row-group w-full">
                    {children}
                </tbody>
            </table>
        </div>
    )
}