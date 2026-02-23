import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Search, CheckCircle2, Cpu, HardDrive, RefreshCcw, XCircle, Play } from "lucide-react";
import { Layout } from '@/components/Layout';
import { WorkerService } from '@/services/workerService';
import { toast } from 'react-toastify';

interface Worker {
    id: string; // name in backend
    name: string;
    description: string;
    status: 'Active' | 'Stopped' | 'Running' | 'Paused';
    lastRun?: string;
    nextRun?: string;
    cronTime?: string;
}

export const Workers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // --- State Management ---
    const [workers, setWorkers] = useState<Worker[]>([]);

    // System Stats & History
    const [cpuLoad, setCpuLoad] = useState(65);
    const [memLoad, setMemLoad] = useState(42);
    const [history, setHistory] = useState({
        cpu: Array(40).fill(65),
        mem: Array(40).fill(42)
    });

    // --- Chart Logic ---
    const generatePath = (data: number[], width: number, height: number) => {
        if (!data || data.length === 0) return "";
        const step = width / (data.length - 1);
        return data.reduce((path, val, i) => {
            const x = i * step;
            const y = height - (val / 100) * height;
            return i === 0 ? `M${x},${y}` : `${path} L${x},${y}`;
        }, "");
    };

    const generateAreaPath = (data: number[], width: number, height: number) => {
        const linePath = generatePath(data, width, height);
        if (!linePath) return "";
        return `${linePath} L${width},${height} L0,${height} Z`;
    };

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch workers for USDT pool specifically
            const response = await WorkerService.getWorkersByPool('USDT'); 
            
            // Map backend response to frontend interface
            const mappedWorkers: Worker[] = Array.isArray(response) ? response.map((w: any) => ({
                id: w.name,
                name: w.name,
                description: w.description || 'Worker process',
                status: w.running ? 'Running' : (w.status === 'stopped' ? 'Stopped' : 'Active'), 
                lastRun: w.lastRun,
                nextRun: w.nextRun,
                cronTime: w.cronTime
            })) : [];

             if (mappedWorkers.length === 0) {
                 try {
                     const allWorkers: any = await WorkerService.getAllWorkers();
                     const usdtWorkers = Array.isArray(allWorkers) ? allWorkers.filter((w: any) => w.name?.toUpperCase().includes('USDT')) : [];
                     
                     if (usdtWorkers.length > 0) {
                         setWorkers(usdtWorkers.map((w: any) => ({
                            id: w.name,
                            name: w.name,
                            description: w.description || 'Worker process',
                            status: w.running ? 'Running' : 'Active',
                            lastRun: w.lastExecution,
                            nextRun: w.nextExecution,
                            cronTime: w.cronTime
                         })));
                     } else {
                         setWorkers([]);
                     }
                 } catch (innerError) {
                     setWorkers([]);
                 }
            } else {
                setWorkers(mappedWorkers);
            }

        } catch (error) {
            console.error("Failed to fetch workers", error);
            toast.error("Failed to load workers status");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);


    const handleToggleStatus = async (workerId: string, currentStatus: string) => {
        try {
            const isActive = currentStatus === 'Active' || currentStatus === 'Running';
            await WorkerService.toggleWorker(workerId, !isActive);
            toast.success(`Worker ${workerId} ${!isActive ? 'enabled' : 'disabled'} successfully`);
            fetchWorkers(); 
        } catch (e) {
            toast.error("Failed to update worker status");
        }
    };
    
    const handleRunNow = async (workerId: string) => {
        try {
            await WorkerService.runWorker(workerId);
            toast.success(`Worker ${workerId} execution started`);
            setTimeout(fetchWorkers, 2000);
        } catch (e) {
             toast.error("Failed to run worker manually");
        }
    }

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = workers.filter(w => w.status === 'Running' || w.status === 'Active').length;
    const inactiveCount = workers.length - activeCount;

    // Telemetry
    useEffect(() => {
        const interval = setInterval(() => {
            const nextCpu = Math.min(Math.max(cpuLoad + (Math.random() * 8 - 4), 20), 95);
            const nextMem = Math.min(Math.max(memLoad + (Math.random() * 4 - 2), 10), 90);

            setCpuLoad(nextCpu);
            setMemLoad(nextMem);

            setHistory(prev => ({
                cpu: [...prev.cpu.slice(1), nextCpu],
                mem: [...prev.mem.slice(1), nextMem]
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, [cpuLoad, memLoad]);


    return (
        <Layout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-foreground">Workers Pool USDT</h1>
                        <p className="text-muted-foreground text-sm font-medium">Gestiona los nodos y workers automatizados del pool USDT.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-10 px-3 flex items-center gap-2" onClick={fetchWorkers} disabled={loading}>
                                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid (System Load, Active, Inactive) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. System Load */}
                    <Card className="shadow-lg border-t-4 border-t-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold">System Load</CardTitle>
                            <Cpu className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">CPU Usage</span>
                                <span className="text-sm font-black text-orange-500">{Math.round(cpuLoad)}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full mb-3">
                                <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <HardDrive className="h-3 w-3" />
                                <span>Memory Utility: </span>
                                <span className="font-bold">{Math.round(memLoad)}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Active Workers */}
                    <Card className="shadow-lg border-t-4 border-t-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold">Active Workers</CardTitle>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex items-end gap-2 mb-2">
                                <div className="text-3xl font-black text-foreground">{activeCount}</div>
                                <div className="text-sm text-muted-foreground font-medium mb-1">Running Instances</div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(activeCount / workers.length) * 100}%` }} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Inactive Workers */}
                    <Card className="shadow-lg border-t-4 border-t-red-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold">Inactive Workers</CardTitle>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex items-end gap-2 mb-2">
                                <div className="text-3xl font-black text-foreground">{inactiveCount}</div>
                                <div className="text-sm text-muted-foreground font-medium mb-1">Offline Nodes</div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full">
                                <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${(inactiveCount / workers.length) * 100}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Worker Table */}
                <Card className="shadow-lg overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/10 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Estado Detallado</CardTitle>
                                <CardDescription>Registro completo de instancias de servicio individuales.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar worker..."
                                        className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full text-sm outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Descripción</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredWorkers.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 text-foreground border border-border">
                                                    <span className="text-xs font-extrabold">{worker.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{worker.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-medium">#{worker.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium max-w-xs truncate">{worker.description}</td>
                                        <td className="px-6 py-4">
                                            <Chip
                                                label={worker.status}
                                                variant={worker.status === 'Active' ? 'success' : 'destructive'}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRunNow(worker.id)}
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 text-blue-600"
                                                >
                                                    <Play className="h-3.5 w-3.5" />
                                                </Button>

                                                <div
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 border ${worker.status === 'Active' || worker.status === 'Running' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-muted border-input'}`}
                                                    onClick={() => handleToggleStatus(worker.id, worker.status)}
                                                >
                                                    <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${worker.status === 'Active' || worker.status === 'Running' ? 'translate-x-6 bg-emerald-500' : 'translate-x-0 bg-muted-foreground/40'}`} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* System Load Chart */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-8">
                        <div>
                            <CardTitle className="text-xl font-bold">System Performance</CardTitle>
                            <CardDescription className="text-xs font-medium uppercase tracking-widest">Aggregate Performance Metrics</CardDescription>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/20"></div>
                                <span>CPU ({Math.round(cpuLoad)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500 ring-2 ring-purple-500/20"></div>
                                <span>Memory ({Math.round(memLoad)}%)</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-72 pt-4 pb-8 relative px-8 overflow-hidden">
                        <div className="h-full w-full relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full flex items-center gap-2">
                                        <div className="w-full h-px bg-muted-foreground/10" />
                                        <span className="text-[8px] font-bold text-muted-foreground w-6 text-right">{100 - i * 25}%</span>
                                    </div>
                                ))}
                            </div>

                            <svg
                                className="w-full h-full overflow-visible"
                                preserveAspectRatio="none"
                                viewBox="0 0 800 160"
                            >
                                <defs>
                                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Memory Area & Line */}
                                <path
                                    d={generateAreaPath(history.mem, 800, 160)}
                                    fill="url(#purpleGradient)"
                                    className="transition-all duration-700 ease-linear"
                                />
                                <path
                                    d={generatePath(history.mem, 800, 160)}
                                    fill="none"
                                    stroke="#a855f7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-700 ease-linear"
                                />

                                {/* CPU Area & Line */}
                                <path
                                    d={generateAreaPath(history.cpu, 800, 160)}
                                    fill="url(#primaryGradient)"
                                    className="transition-all duration-700 ease-linear"
                                />
                                <path
                                    d={generatePath(history.cpu, 800, 160)}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-700 ease-linear"
                                />
                            </svg>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};
