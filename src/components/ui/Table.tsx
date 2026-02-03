interface TableProps {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: any[];

}

export const Table = ({ title, subtitle, headers, rows }: TableProps) => {
    console.log(rows)
    return (
        <div className="flex flex-col gap-4 p-6 bg-background rounded-lg">
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            <table>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows && rows.length > 0 ? (
                        rows.map((row) => (
                            <tr key={row.id}>
                                {headers.map((header) => (
                                    <td key={header}>{row[header]}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="h-24 text-center">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}