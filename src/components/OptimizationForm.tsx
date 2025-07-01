import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Minus, Plus, Zap, RotateCcw, Settings, Sparkles } from 'lucide-react';

interface OptimizationFormProps {
  onOptimize: (upsPerPlate: number, plateCount: number) => void;
  isCalculating: boolean;
  isDisabled: boolean;
  backendConnected: boolean;
}

const OptimizationForm: React.FC<OptimizationFormProps> = ({
  onOptimize,
  isCalculating,
  isDisabled,
  backendConnected,
}) => {
  const [upsPerPlate, setUpsPerPlate] = useState<number>(1);
  const [plateCount, setPlateCount] = useState<number>(1);

  const handleOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalculating || isDisabled) return;

    if (upsPerPlate <= 0) return toast.error('Units per sheet must be greater than 0');
    if (plateCount <= 0) return toast.error('Plate count must be greater than 0');
    if (upsPerPlate > 50) return toast.error('UPS cannot exceed 50');
    if (plateCount > 52) return toast.error('Plate count cannot exceed 52');

    onOptimize(upsPerPlate, plateCount);
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
    setUpsPerPlate(1);
    setPlateCount(1);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
          <Settings className="w-4 h-4 mr-2 text-indigo-500" />
          Optimization
        </h2>
        <button
          type="button"
          onClick={handleReset}
          title="Reset to defaults"
          className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <form onSubmit={handleOptimize} className="space-y-4">
        {/* UPS Per Plate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Units Per Sheet
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              1-50
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => decrement(setUpsPerPlate, 1)}
              disabled={isDisabled || isCalculating || upsPerPlate <= 1}
              className="p-2 border-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              value={upsPerPlate}
              onChange={(e) => handleNumberChange(e, setUpsPerPlate, 1, 50)}
              className="flex-1 text-center text-sm font-bold rounded-lg border-2 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 min-w-0 transition-all duration-200"
              min="1"
              max="50"
              disabled={isDisabled || isCalculating}
            />
            <button
              type="button"
              onClick={() => increment(setUpsPerPlate, 50)}
              disabled={isDisabled || isCalculating || upsPerPlate >= 50}
              className="p-2 border-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Plate Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Number of Plates
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              A-{String.fromCharCode(64 + plateCount)} (1-52)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => decrement(setPlateCount, 1)}
              disabled={isDisabled || isCalculating || plateCount <= 1}
              className="p-2 border-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              value={plateCount}
              onChange={(e) => handleNumberChange(e, setPlateCount, 1, 52)}
              className="flex-1 text-center text-sm font-bold rounded-lg border-2 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 min-w-0 transition-all duration-200"
              min="1"
              max="52"
              disabled={isDisabled || isCalculating}
            />
            <button
              type="button"
              onClick={() => increment(setPlateCount, 52)}
              disabled={isDisabled || isCalculating || plateCount >= 52}
              className="p-2 border-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Capacity Preview */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 dark:text-blue-300 font-medium">Total Capacity:</span>
            <span className="text-blue-800 dark:text-blue-200 font-bold">
              {(upsPerPlate * plateCount).toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Optimize Button */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white 
            bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
            hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105
            ${isCalculating ? 'animate-pulse' : ''}`}
          disabled={isDisabled || isCalculating}
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Optimize Layout
              {backendConnected ? (
                <Sparkles className="h-3 w-3 ml-2 text-yellow-300" />
              ) : (
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                  Local
                </span>
              )}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OptimizationForm;