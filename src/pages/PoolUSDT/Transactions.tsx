import { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import { Dialog } from "@/components/ui/Dialog";
import {
    Plus,
    Download,
    TrendingUp,
    TrendingDown,
    Wallet,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    Filter
} from "lucide-react";

// Helper functions (Added for safer formatting)
const formatCurrency = (value: number | string, currency: string = 'USD') => {
    const num = Number(value);
    if (isNaN(num)) return `0.00 ${currency}`;
    return `${num.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency}`;
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateString;
    }
};

export const Transactions = () => {
    // --- Data Fetching ---
    const { 
        transactions, 
        loading, 
        pagination, 
        fetchTransactions 
    } = useTransactions('USDT');

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const itemsPerPage = 8;

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions({ 
                page: currentPage, 
                limit: itemsPerPage, 
                search: searchTerm,
                poolId: 'USDT'
            });
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, fetchTransactions]);

    // --- Chart Logic ---
    const incomeData = [40, 55, 45, 65, 58, 75, 70]; // Normalized data points for graph
    const generateAreaPath = (data: number[]) => {
        const width = 800;
        const height = 150;
        const step = width / (data.length - 1);
        const points = data.map((val, i) => ({
            x: i * step,
            y: height - (val / 100) * height
        }));

        let d = `M${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
            d += ` C${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        const linePath = d;
        const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
        return { linePath, areaPath };
    };

    const { linePath, areaPath } = useMemo(() => generateAreaPath(incomeData), []);

    // Handle pagination from backend
    // Logic updated to handle unknown totals (totalPages = 0)
    const hasMorePages = pagination.totalPages && pagination.totalPages > 0 
        ? Number(pagination.page) < Number(pagination.totalPages) 
        : transactions.length >= Number(pagination.limit); // If full page, assume more

    const paginationInfo = {
        total: Number(pagination.total),
        totalPages: Number(pagination.totalPages),
        page: Number(pagination.page),
        limit: Number(pagination.limit),
        hasNext: hasMorePages,
        hasPrev: Number(pagination.page) > 1
    };

    const statusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'info' => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'confirmed':
            case 'completado': return 'success';
            case 'pending': 
            case 'pendiente': return 'warning';
            case 'failed':
            case 'cancelled':
            case 'fallido': return 'destructive';
            default: return 'info';
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6 py-6 text-foreground w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Transacciones</h1>
                        <p className="text-muted-foreground text-xs font-medium">Gestiona y monitorea todas las operaciones financieras.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="text-xs gap-2 h-9">
                            <Download className="h-3.5 w-3.5" />
                            Exportar
                        </Button>
                        <Button className="text-xs gap-2 h-9">
                            <Plus className="h-3.5 w-3.5" />
                            Nueva Transacción
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <Card className="shadow-lg border-t-4 border-t-primary">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Transacciones</p>
                                    <h2 className="text-xl font-bold mt-1">1,482</h2>
                                </div>
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Wallet className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px]">
                                <span className="flex items-center gap-1 text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <TrendingUp className="h-2.5 w-2.5" /> 12.5%
                                </span>
                                <span className="text-muted-foreground italic">vs mes anterior</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completadas */}
                    <Card className="shadow-lg border-t-4 border-t-emerald-500">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-muted-foreground">Completadas</p>
                                    <h2 className="text-xl font-bold mt-1">1,250</h2>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%]" />
                                </div>
                                <p className="text-[10px] font-semibold text-muted-foreground mt-1.5">85% tasa de éxito</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pendientes */}
                    <Card className="shadow-lg border-t-4 border-t-orange-500">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-muted-foreground">Pendientes</p>
                                    <h2 className="text-xl font-bold mt-1">185</h2>
                                </div>
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[10px] font-bold bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full uppercase tracking-tight">
                                    Requiere atención
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fallidas */}
                    <Card className="shadow-lg border-t-4 border-t-red-500">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-muted-foreground">Fallidas</p>
                                    <h2 className="text-xl font-bold mt-1">47</h2>
                                </div>
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                    <XCircle className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px]">
                                <span className="flex items-center gap-1 text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full">
                                    <TrendingDown className="h-2.5 w-2.5" /> 3.2%
                                </span>
                                <span className="text-muted-foreground italic">vs mes anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Section - MOVED UP */}
                <Card className="shadow-lg border-t-4 border-t-primary">
                    <CardHeader className="border-b border-border bg-muted/10 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-lg font-bold">Listado de Transacciones</CardTitle>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Input
                                        placeholder="Filtrar por ID o usuario..."
                                        className="pl-3 text-xs h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-9 text-xs gap-2">
                                        <Filter className="h-3.5 w-3.5" /> Estado
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 text-xs gap-2">
                                        <Calendar className="h-3.5 w-3.5" /> Fecha
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30">
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b">ID</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b">Usuario</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b text-right">Monto</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b text-right">Tarifa</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b text-right">Neto</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b">Fecha</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b text-center">Estado</th>
                                        <th className="pr-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-border ${loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}>
                                    {transactions.length === 0 && loading ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-slate-500 animate-pulse">
                                                Cargando transacciones...
                                            </td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-slate-500">
                                                No se encontraron transacciones
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-4 py-3 text-xs font-medium" title={tx.id}>
                                                {tx.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {tx.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-700">{tx.user?.name || 'Desconocido'}</div>
                                                        <div className="text-[10px] text-muted-foreground">{tx.user?.email || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-right text-slate-900">
                                                {formatCurrency(tx.amount || '0', tx.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground text-right font-medium">
                                                {formatCurrency(tx.fee || '0', tx.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-right text-emerald-600">
                                                {formatCurrency(tx.net || '0', tx.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-muted-foreground font-medium">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Chip 
                                                    label={tx.status} 
                                                    variant={statusVariant(tx.status)} 
                                                    className="uppercase tracking-wider text-[10px]"
                                                />
                                            </td>
                                            <td className="pr-6 py-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTx(tx);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 rotate-45" />
                                                </button>
                                            </td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-border">
                            <Pagination
                                currentPage={currentPage}
                                pagination={paginationInfo}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Graph Section - MOVED DOWN */}
                <Card className="shadow-lg border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Resumen de Ingresos</CardTitle>
                                <CardDescription className="text-xs font-medium">Histórico de los últimos 30 días</CardDescription>
                            </div>
                            <div className="flex gap-1 bg-muted p-1 rounded-md">
                                <button className="text-[10px] font-bold px-2.5 py-1 text-muted-foreground">Semana</button>
                                <button className="text-[10px] font-bold px-2.5 py-1 bg-white text-primary rounded shadow-sm">Mes</button>
                                <button className="text-[10px] font-bold px-2.5 py-1 text-muted-foreground">Año</button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-56 relative pt-4">
                        <div className="absolute left-6 h-full flex flex-col justify-between text-[10px] font-bold text-muted-foreground/50 pointer-events-none pb-12">
                            <span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>0</span>
                        </div>
                        <div className="ml-12 h-40 w-[calc(100%-48px)]">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#areaGradient)" />
                                <path d={linePath} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                                    <line key={v} x1="0" y1={v * 150} x2="800" y2={v * 150} stroke="currentColor" strokeOpacity="0.1" />
                                ))}
                            </svg>
                        </div>
                        <div className="ml-12 mt-4 flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                            <span>1 Nov</span><span>5 Nov</span><span>10 Nov</span><span>15 Nov</span><span>20 Nov</span><span>25 Nov</span><span>30 Nov</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Popout */}
            <Dialog
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                className="max-w-xl p-0 overflow-hidden"
            >
                {selectedTx && (
                    <div className="flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800">Detalles de Transacción</h3>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-12">
                            <DetailItem label="ID" value={selectedTx.id} />
                            <DetailItem label="Usuario" value={selectedTx.user?.name || 'N/A'} />
                            <DetailItem label="Tipo" value={selectedTx.type || 'N/A'} />
                            <DetailItem label="Monto" value={`${formatCurrency(selectedTx.amount, selectedTx.currency)}`} />
                            <DetailItem label="Tarifa" value={`${formatCurrency(selectedTx.fee, selectedTx.currency)}`} />
                            <DetailItem label="Neto" value={`${formatCurrency(selectedTx.net, selectedTx.currency)}`} />
                            
                            {selectedTx.txHash && (
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hash</p>
                                    <p className="text-xs font-mono text-slate-600 truncate">{selectedTx.txHash}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado</p>
                                <Chip label={selectedTx.status} variant={statusVariant(selectedTx.status)} />
                            </div>
                            
                            <DetailItem label="Fecha" value={formatDate(selectedTx.date)} />
                        </div>
                    </div>
                )}
            </Dialog>
        </Layout>
    );
};

// Helper components
const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
);
