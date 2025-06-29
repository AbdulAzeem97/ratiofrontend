import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Minus, Plus, Printer, RotateCcw, Info, Settings, Zap, Brain, Calculator, Server, Cpu, DollarSign, Clock, Target, Sparkles } from 'lucide-react';
import { OptimizationApproach } from '../types/types';
import { useAppStore } from '../stores/appStore';

interface AdvancedOptimizationFormProps {
  onOptimize: (upsPerPlate: number, plateCount: number, approach: OptimizationApproach, preset?: string) => void;
  isCalculating: boolean;
  isDisabled: boolean;
  backendConnected: boolean;
}

const AdvancedOptimizationForm: React.FC<AdvancedOptimizationFormProps> = ({
  onOptimize,
  isCalculating,
  isDisabled,
  backendConnected,
}) => {
  const { optimizationPresets, costSettings, qualitySettings } = useAppStore();
  const [upsPerPlate, setUpsPerPlate] = useState<number>(20);
  const [plateCount, setPlateCount] = useState<number>(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<OptimizationApproach>('smartBalanced');
  const [selectedPreset, setSelectedPreset] = useState<string>('default-balanced');
  const [enableCostOptimization, setEnableCostOptimization] = useState(true);
  const [enableQualityControl, setEnableQualityControl] = useState(true);
  const [priorityWeight, setPriorityWeight] = useState(50);

  const handleOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalculating || isDisabled) return;

    if (upsPerPlate <= 0) return toast.error('Units per sheet must be greater than 0');
    if (plateCount <= 0) return toast.error('Plate count must be greater than 0');
    if (upsPerPlate > 50) return toast.error('UPS cannot exceed 50');
    if (plateCount > 25) return toast.error('Plate count cannot exceed 25');

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    onOptimize(upsPerPlate, plateCount, selectedApproach, selectedPreset);
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, max: number) => {
    setter((prev) => Math.min(prev + 1, max));
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, min: number) => {
    setter((prev) => Math.max(prev - 1, min));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setter(Math.max(min, Math.min(max, value)));
    }
  };

  const handleReset = () => {
    setUpsPerPlate(20);
    setPlateCount(3);
    setShowAdvanced(false);
    setSelectedApproach('smartBalanced');
    setSelectedPreset('default-balanced');
    setEnableCostOptimization(true);
    setEnableQualityControl(true);
    setPriorityWeight(50);
  };

  const loadPreset = (presetId: string) => {
    const preset = optimizationPresets.find(p => p.id === presetId);
    if (preset) {
      setUpsPerPlate(preset.upsPerPlate);
      setPlateCount(preset.plateCount);
      setSelectedApproach(preset.approach);
      setSelectedPreset(presetId);
      toast.success(`Loaded preset: ${preset.name}`);
    }
  };

  const totalUnits = upsPerPlate * plateCount;
  const isComplexProblem = upsPerPlate >= 20 || plateCount >= 3;
  const estimatedCost = totalUnits * costSettings.materialCostPerSheet;

  const approachInfo = {
    greedy: {
      icon: Zap,
      title: 'Greedy Fast',
      description: 'Fastest approach, good for quick estimates and simple layouts',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-600',
      recommended: 'Simple problems, quick results needed',
      engine: 'Frontend',
      estimatedTime: '< 1s'
    },
    smartBalanced: {
      icon: Brain,
      title: 'Smart Balanced',
      description: 'Balanced approach with intelligent distribution and waste minimization',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-300 dark:border-blue-600',
      recommended: 'Most production scenarios, best overall results',
      engine: backendConnected ? 'Backend AI' : 'Frontend',
      estimatedTime: '2-5s'
    },
    exhaustive: {
      icon: Calculator,
      title: 'Exhaustive Search',
      description: 'Most thorough optimization using constraint programming',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-600',
      recommended: 'Critical jobs, maximum efficiency required',
      engine: backendConnected ? 'Backend AI' : 'Frontend (Limited)',
      estimatedTime: '10-30s'
    },
    aiEnhanced: {
      icon: Sparkles,
      title: 'AI Enhanced',
      description: 'Advanced AI optimization with machine learning insights',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-600',
      recommended: 'Complex scenarios, maximum performance',
      engine: backendConnected ? 'Backend AI' : 'Not Available',
      estimatedTime: '15-45s'
    },
    costOptimized: {
      icon: DollarSign,
      title: 'Cost Optimized',
      description: 'Minimize total production costs while maintaining quality',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-600',
      recommended: 'Budget-conscious production runs',
      engine: backendConnected ? 'Backend AI' : 'Frontend',
      estimatedTime: '5-15s'
    },
  };

  return (
    <form onSubmit={handleOptimize} className="space-y-6">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-all duration-300 border dark:border-gray-700 
        ${isAnimating ? 'scale-95 opacity-80' : 'hover:scale-[1.02]'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            🛠 Advanced Optimization Settings
            <span className="ml-2 text-xs px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full">
              v3.0 Pro
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 rounded-lg text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Advanced Settings"
            >
              <Settings className={`h-5 w-5 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset to default"
              className="p-2 rounded-lg text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preset Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Optimization Presets
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {optimizationPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">{preset.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preset.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400">{preset.approach}</span>
                  {preset.isDefault && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* UPS Per Plate */}
          <div className="group relative">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Units Per Sheet (UPS)
              <div className="group relative inline-block">
                <Info className="ml-1 w-4 h-4 text-gray-400 group-hover:text-blue-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center z-10">
                  Number of units that can fit on a single sheet (Max: 50)
                </div>
              </div>
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => decrement(setUpsPerPlate, 1)}
                disabled={isDisabled || isCalculating || upsPerPlate <= 1}
                className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors border-gray-300 dark:border-gray-600"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={upsPerPlate}
                onChange={(e) => handleNumberChange(e, setUpsPerPlate, 1, 50)}
                className="w-24 text-center text-lg font-semibold rounded-lg border dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all py-3"
                min="1"
                max="50"
                disabled={isDisabled || isCalculating}
              />
              <button
                type="button"
                onClick={() => increment(setUpsPerPlate, 50)}
                disabled={isDisabled || isCalculating || upsPerPlate >= 50}
                className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors border-gray-300 dark:border-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Range: 1-50 UPS
            </div>
          </div>

          {/* Plate Count */}
          <div className="group relative">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Number of Plates
              <div className="group relative inline-block">
                <Info className="ml-1 w-4 h-4 text-gray-400 group-hover:text-blue-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center z-10">
                  Total number of printing plates to use (Max: 25)
                </div>
              </div>
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => decrement(setPlateCount, 1)}
                disabled={isDisabled || isCalculating || plateCount <= 1}
                className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors border-gray-300 dark:border-gray-600"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={plateCount}
                onChange={(e) => handleNumberChange(e, setPlateCount, 1, 25)}
                className="w-24 text-center text-lg font-semibold rounded-lg border dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all py-3"
                min="1"
                max="25"
                disabled={isDisabled || isCalculating}
              />
              <button
                type="button"
                onClick={() => increment(setPlateCount, 25)}
                disabled={isDisabled || isCalculating || plateCount >= 25}
                className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors border-gray-300 dark:border-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Plates A to {String.fromCharCode(64 + plateCount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Range: 1-25 plates
              </p>
            </div>
          </div>

          {/* Optimization Approach */}
          <div className="mt-6 space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Optimization Approach
              {isComplexProblem && (
                <span className="ml-2 text-xs px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full">
                  Complex Problem
                </span>
              )}
            </label>
            <div className="grid grid-cols-1 gap-4">
              {(Object.keys(approachInfo) as OptimizationApproach[]).map((approach) => {
                const info = approachInfo[approach];
                const Icon = info.icon;
                const isSelected = selectedApproach === approach;
                const isBackendEngine = info.engine.includes('Backend');
                const isAvailable = approach !== 'aiEnhanced' || backendConnected;
                
                return (
                  <button
                    key={approach}
                    type="button"
                    onClick={() => isAvailable && setSelectedApproach(approach)}
                    disabled={!isAvailable}
                    className={`flex items-start p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected && isAvailable
                        ? `${info.bg} ${info.border} shadow-lg transform scale-[1.02]`
                        : isAvailable
                        ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${info.bg} ${info.color} mr-4 flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {info.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{info.estimatedTime}</span>
                          </div>
                          {isBackendEngine ? (
                            <div className="flex items-center space-x-1">
                              <Server className="w-3 h-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                {backendConnected ? 'AI' : 'Limited'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Local
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {info.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        <strong>Best for:</strong> {info.recommended}
                      </div>
                      {!isAvailable && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                          ⚠️ Requires backend connection
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Advanced Options</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Cost Optimization</label>
                  <input
                    type="checkbox"
                    checked={enableCostOptimization}
                    onChange={(e) => setEnableCostOptimization(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Quality Control</label>
                  <input
                    type="checkbox"
                    checked={enableQualityControl}
                    onChange={(e) => setEnableQualityControl(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Priority Weight: {priorityWeight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Speed</span>
                  <span>Quality</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Production Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {totalUnits.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Total Capacity
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                ${estimatedCost.toFixed(2)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Est. Material Cost
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {plateCount}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Plates Required
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {approachInfo[selectedApproach]?.estimatedTime || 'N/A'}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Est. Time
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimize Button */}
      <button
        type="submit"
        className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white 
          bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
          hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]
          ${isCalculating ? 'animate-pulse' : ''}`}
        disabled={isDisabled || isCalculating}
      >
        {isCalculating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
            Optimizing Layout...
          </>
        ) : (
          <>
            <Printer className="h-5 w-5 mr-3" />
            Optimize Print Layout
            {isComplexProblem && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                {backendConnected ? 'AI Enhanced' : 'Local Mode'}
              </span>
            )}
          </>
        )}
      </button>
    </form>
  );
};

export default AdvancedOptimizationForm;