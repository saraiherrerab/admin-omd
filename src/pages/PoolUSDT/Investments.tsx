import { useState, useMemo, useEffect } from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { Layout } from '@/components/Layout';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import { Dialog } from "@/components/ui/Dialog";
import {
    Plus,
    Filter,
    ChevronDown,
    BarChart3,
    Coins,
    Globe,
    Bitcoin,
    Search
} from "lucide-react";

// --- Helper Functions ---
const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
        case 'cripto':
        case 'ethereum staking':
        case 'bitcoin holding':
            return <Coins className="h-4 w-4" />;
        case 'acciones':
        case 'tesla inc. stocks':
        case 's&p 500 etf':
            return <BarChart3 className="h-4 w-4" />;
        case 'etf':
            return <Globe className="h-4 w-4" />;
        default:
            return <Bitcoin className="h-4 w-4" />;
    }
};

export const Investments = () => {
    // --- Data Fetching ---
    const { 
        investments, 
        loading, 
        pagination, 
        fetchInvestments 
    } = useInvestments('USDT');

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInv, setSelectedInv] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const itemsPerPage = 6;

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvestments({ 
                page: currentPage, 
                limit: itemsPerPage, 
                search: searchTerm,
                poolId: 'USDT'
            });
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, fetchInvestments]);

    // Handle pagination from backend
    const paginationInfo = {
        total: pagination.total,
        totalPages: pagination.totalPages,
        page: pagination.page,
        limit: pagination.limit,
        hasNext: pagination.page < pagination.totalPages,
        hasPrev: pagination.page > 1
    };

    const statusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'info' => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'activo': return 'success';
            case 'pending': 
            case 'pendiente': return 'warning';
            case 'closed':
            case 'cerrado': return 'info';
            default: return 'info';
        }
    };

    const openDetails = (inv: any) => {
        setSelectedInv({
            ...inv,
            // Fallback for missing backend fields during dev/mock API mismatch
            interestRate: inv.interestRate || '0.00%',
            totalEarned: inv.totalEarned || inv.estReturn || 0,
            lastPayment: inv.lastPayment || 0,
            withReturn: inv.withReturn!==undefined ? (inv.withReturn ? 'Sí' : 'No') : 'Sí',
            startDate: inv.startDate || inv.date,
            endDate: inv.endDate,
            balance: inv.amount
        });
        setIsDetailsOpen(true);
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6 py-6 text-foreground w-full">

                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inversiones Recientes</h2>
                            <p className="text-sm text-slate-500 mt-1">Gestiona y monitorea todas tus inversiones en un solo lugar</p>
                        </div>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9 gap-2 text-xs font-bold px-5 rounded-lg shadow-sm">
                            <Plus className="h-3.5 w-3.5" />
                            Nueva Inversión
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
                    <StatCard
                        label="Total Invertido"
                        value="$620,000"
                        change="+12.5% este mes"
                        isPositive={true}
                    />
                    <StatCard
                        label="Retorno Total"
                        value="$61,560"
                        change="+8.3% este mes"
                        isPositive={true}
                    />
                    <StatCard
                        label="Inversiones Activas"
                        value="5"
                        subValue="de 8 totales"
                    />
                    <StatCard
                        label="Tasa Promedio"
                        value="9.4%"
                        change="+2.1% este mes"
                        isPositive={true}
                    />
                </div>



                <div className="mt-4">
                    {/* Integrated Filters and Search */}
                    <div className="flex items-center justify-between pb-6 gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            <input
                                placeholder="Buscar por usuario, monto..."
                                className="pl-10 h-9 text-xs w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none placeholder:text-slate-400 transition-all shadow-sm rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="h-9 px-4 text-xs font-semibold border border-orange-200 rounded-xl hover:bg-orange-50 flex items-center gap-2 text-orange-600 transition-colors bg-white"
                            >
                                <Filter className="h-3.5 w-3.5" /> Filtros
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                                    <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filtrar por</p>
                                    <button className="w-full text-left px-2 py-1.5 text-xs font-semibold hover:bg-slate-50 rounded-lg flex items-center justify-between text-slate-700">
                                        Estado <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                    <button className="w-full text-left px-2 py-1.5 text-xs font-semibold hover:bg-slate-50 rounded-lg flex items-center justify-between text-slate-700">
                                        Tasa de Retorno <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                    <button className="w-full text-left px-2 py-1.5 text-xs font-semibold hover:bg-slate-50 rounded-lg flex items-center justify-between text-slate-700">
                                        Método <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white">
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">ID</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Tipo</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Usuario</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Monto</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Tasa Retorno</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Retorno Est.</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Fecha</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-center">Estado</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-6 text-slate-500">Cargando...</td>
                                        </tr>
                                    ) : investments.length === 0 ? (
                                         <tr>
                                            <td colSpan={9} className="text-center py-6 text-slate-500">No se encontraron inversiones</td>
                                        </tr>
                                    ) : (
                                        investments.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-3 text-[11px] font-medium text-slate-900 flex items-center gap-2">
                                                {getIconForType(inv.type || inv.asset)}
                                                {inv.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-slate-600 font-medium">{inv.asset || inv.type}</td>
                                            <td className="px-4 py-3 text-[11px] text-slate-600 font-medium">{inv.user?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-[11px] font-bold text-slate-900">
                                                {typeof inv.amount === 'number' ? inv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : inv.amount} US$
                                            </td>
                                            <td className={`px-4 py-3 text-[11px] font-bold ${Number(inv.yieldRate) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {Number(inv.yieldRate) >= 0 ? '+' : ''}{inv.yieldRate}%
                                            </td>
                                            <td className="px-4 py-3 text-[11px] font-bold text-slate-900">
                                                {typeof inv.estReturn === 'number' ? inv.estReturn.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : inv.estReturn} US$
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-slate-500 font-medium">
                                                {new Date(inv.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Chip 
                                                    label={inv.status} 
                                                    variant={statusVariant(inv.status)} 
                                                    className="uppercase tracking-wider text-[10px]"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openDetails(inv)}
                                                    className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                                                >
                                                    Ver detalles
                                                </button>
                                            </td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500">Mostrando {investments.length} de {pagination.total} inversiones</p>
                        <Pagination
                            currentPage={currentPage}
                            pagination={paginationInfo}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            {/* Details Popout */}
            <Dialog
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                className="max-w-xl p-0 overflow-hidden"
            >
                {selectedInv && (
                    <div className="flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800">Detalles de Inversión</h3>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-12">
                            <DetailItem label="ID" value={selectedInv.id} />
                            <DetailItem label="Tipo" value={selectedInv.type || selectedInv.asset} />
                            <DetailItem label="Usuario" value={selectedInv.user?.name || 'N/A'} />
                            <DetailItem label="Método" value={selectedInv.method} />
                            <DetailItem label="Monto" value={`$${Number(selectedInv.amount).toLocaleString()}`} />
                            <DetailItem label="Balance Actual" value={`$${Number(selectedInv.balance).toLocaleString()}`} />
                            <DetailItem label="Tasa de Interés" value={selectedInv.interestRate} />
                            <DetailItem label="Total Ganado" value={`$${selectedInv.totalEarned}`} />
                            <DetailItem label="Último Pago" value={selectedInv.lastPayment} />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado</p>
                                <Chip label={selectedInv.status} variant={statusVariant(selectedInv.status)} />
                            </div>
                            <DetailItem label="Con Retorno" value={selectedInv.withReturn} />
                            <DetailItem label="Inicio" value={new Date(selectedInv.startDate || Date.now()).toLocaleDateString()} />
                            <DetailItem label="Fin" value={selectedInv.endDate ? new Date(selectedInv.endDate).toLocaleDateString() : '-'} />
                        </div>
                    </div>
                )}
            </Dialog>
        </Layout>
    );
};

const StatCard = ({ label, value, change, isPositive, subValue }: { label: string; value: string; change?: string; isPositive?: boolean; subValue?: string }) => (
    <Card className="border border-slate-200 rounded-2xl p-6 shadow-sm bg-white">
        <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
        <div className="flex items-end gap-2">
            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h4>
            {subValue && <span className="text-sm font-medium text-slate-400 mb-1">{subValue}</span>}
        </div>
        {change && (
            <p className={`text-sm font-bold mt-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {change}
            </p>
        )}
    </Card>
);

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
);
