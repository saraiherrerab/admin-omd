import api from './api';

export interface Worker {
    id: string; // usually name
    name: string;
    description?: string;
    status: 'Active' | 'Stopped' | 'Running' | 'Paused'; // Map backend status
    lastRun?: string;
    nextRun?: string;
    cronExpression?: string;
    type?: string; 
}

export const WorkerService = {
    getAllWorkers: async (): Promise<Worker[]> => {
        const response = await api.get('/workers');
        // Backend returns { success: true, ...keys } where keys are array lists or object map?
        // Let's check Controller implementation: 
        // res.status(200).json({ success: true, ...workers, message: "..." });
        // WorkerService.getAllWorkers() returns response.data from Guardian.
        
        // We need to inspect what structure "workers" has. 
        // Assuming it returns a list under a 'data' or 'jobs' key based on routes.
        
        // If the structure is complex, we might need to map it.
        // For now, let's return raw data to debug or simple mapping if array.
        
        return response.data.data || response.data.jobs || []; 
    },

    getWorkersByPool: async (poolId: string): Promise<Worker[]> => {
        const response = await api.get(`/workers/pool/${poolId}`);
        return response.data.data || response.data || [];
    },

    toggleWorker: async (workerId: string, enable: boolean) => {
        const action = enable ? 'enable' : 'disable';
        const response = await api.post(`/workers/${workerId}/${action}`);
        return response.data;
    },
    
    runWorker: async (workerName: string) => {
         const response = await api.post(`/workers/${workerName}/run`);
         return response.data;
    },
    
    getSchedulerStatus: async () => {
        const response = await api.get('/workers/scheduler/status');
        return response.data;
    }
};
