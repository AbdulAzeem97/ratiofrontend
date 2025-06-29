import { create } from 'zustand';
import { CsvItem, OptimizationResult, OptimizationSummary, PrintJob, InventoryItem, CollaborationUser, OptimizationPreset, HistoricalData } from '../types/types';

interface AppState {
  // Data
  csvData: CsvItem[];
  results: OptimizationResult[];
  summary: OptimizationSummary | null;
  
  // UI State
  theme: 'light' | 'dark';
  activeTab: 'results' | 'visualization' | 'analytics' | 'inventory' | 'jobs' | 'collaboration';
  isCalculating: boolean;
  backendConnected: boolean;
  
  // Advanced Features
  printJobs: PrintJob[];
  inventory: InventoryItem[];
  collaborationUsers: CollaborationUser[];
  optimizationPresets: OptimizationPreset[];
  optimizationHistory: HistoricalData[];
  
  // Settings
  costSettings: {
    materialCostPerSheet: number;
    laborCostPerHour: number;
    machineCostPerHour: number;
    overheadPercentage: number;
  };
  
  qualitySettings: {
    prioritizeQuality: boolean;
    minimumEfficiency: number;
    maxWastePercentage: number;
  };
  
  // Actions
  setCsvData: (data: CsvItem[]) => void;
  setResults: (results: OptimizationResult[]) => void;
  setSummary: (summary: OptimizationSummary) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveTab: (tab: string) => void;
  setIsCalculating: (calculating: boolean) => void;
  setBackendConnected: (connected: boolean) => void;
  addPrintJob: (job: PrintJob) => void;
  updatePrintJob: (id: string, updates: Partial<PrintJob>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  addOptimizationPreset: (preset: OptimizationPreset) => void;
  addHistoricalData: (data: HistoricalData) => void;
  updateCostSettings: (settings: Partial<AppState['costSettings']>) => void;
  updateQualitySettings: (settings: Partial<AppState['qualitySettings']>) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  csvData: [],
  results: [],
  summary: null,
  theme: 'light',
  activeTab: 'results',
  isCalculating: false,
  backendConnected: false,
  printJobs: [],
  inventory: [],
  collaborationUsers: [],
  optimizationPresets: [
    {
      id: 'default-balanced',
      name: 'Balanced Production',
      description: 'Optimal balance between efficiency and cost',
      approach: 'smartBalanced',
      upsPerPlate: 20,
      plateCount: 3,
      costSettings: {
        materialCostPerSheet: 2.50,
        laborCostPerHour: 25.00,
        machineCostPerHour: 45.00,
        overheadPercentage: 15
      },
      qualitySettings: {
        prioritizeQuality: true,
        minimumEfficiency: 85,
        maxWastePercentage: 10
      },
      isDefault: true,
      createdBy: 'system',
      createdAt: new Date()
    },
    {
      id: 'high-efficiency',
      name: 'Maximum Efficiency',
      description: 'Minimize waste and maximize throughput',
      approach: 'aiEnhanced',
      upsPerPlate: 25,
      plateCount: 4,
      costSettings: {
        materialCostPerSheet: 2.50,
        laborCostPerHour: 25.00,
        machineCostPerHour: 45.00,
        overheadPercentage: 12
      },
      qualitySettings: {
        prioritizeQuality: false,
        minimumEfficiency: 95,
        maxWastePercentage: 5
      },
      isDefault: false,
      createdBy: 'system',
      createdAt: new Date()
    }
  ],
  optimizationHistory: [],
  costSettings: {
    materialCostPerSheet: 2.50,
    laborCostPerHour: 25.00,
    machineCostPerHour: 45.00,
    overheadPercentage: 15
  },
  qualitySettings: {
    prioritizeQuality: true,
    minimumEfficiency: 85,
    maxWastePercentage: 10
  },

  // Actions
  setCsvData: (data) => set({ csvData: data }),
  setResults: (results) => set({ results }),
  setSummary: (summary) => set({ summary }),
  setTheme: (theme) => set({ theme }),
  setActiveTab: (tab) => set({ activeTab: tab as any }),
  setIsCalculating: (calculating) => set({ isCalculating: calculating }),
  setBackendConnected: (connected) => set({ backendConnected: connected }),
  
  addPrintJob: (job) => set((state) => ({ 
    printJobs: [job, ...state.printJobs] 
  })),
  
  updatePrintJob: (id, updates) => set((state) => ({
    printJobs: state.printJobs.map(job => 
      job.id === id ? { ...job, ...updates } : job
    )
  })),
  
  addInventoryItem: (item) => set((state) => ({
    inventory: [...state.inventory, item]
  })),
  
  updateInventoryItem: (id, updates) => set((state) => ({
    inventory: state.inventory.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  addOptimizationPreset: (preset) => set((state) => ({
    optimizationPresets: [...state.optimizationPresets, preset]
  })),
  
  addHistoricalData: (data) => set((state) => ({
    optimizationHistory: [data, ...state.optimizationHistory.slice(0, 99)]
  })),
  
  updateCostSettings: (settings) => set((state) => ({
    costSettings: { ...state.costSettings, ...settings }
  })),
  
  updateQualitySettings: (settings) => set((state) => ({
    qualitySettings: { ...state.qualitySettings, ...settings }
  })),
  
  clearData: () => set({
    csvData: [],
    results: [],
    summary: null
  })
}));