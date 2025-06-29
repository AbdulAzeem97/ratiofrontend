import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { CostCalculation } from '../types/types';

const CostCalculator: React.FC = () => {
  const { summary, results, costSettings, updateCostSettings } = useAppStore();
  const [calculation, setCalculation] = useState<CostCalculation | null>(null);
  const [profitMargin, setProfitMargin] = useState(20);
  const [laborHours, setLaborHours] = useState(2);
  const [machineHours, setMachineHours] = useState(1.5);

  useEffect(() => {
    if (summary && results.length > 0) {
      calculateCosts();
    }
  }, [summary, results, costSettings, profitMargin, laborHours, machineHours]);

  const calculateCosts = () => {
    if (!summary) return;

    const materialCost = summary.totalSheets * costSettings.materialCostPerSheet;
    const laborCost = laborHours * costSettings.laborCostPerHour;
    const machineCost = machineHours * costSettings.machineCostPerHour;
    const subtotal = materialCost + laborCost + machineCost;
    const overheadCost = subtotal * (costSettings.overheadPercentage / 100);
    const totalCost = subtotal + overheadCost;
    const profitAmount = totalCost * (profitMargin / 100);
    const sellingPrice = totalCost + profitAmount;

    setCalculation({
      materialCost,
      laborCost,
      machineCost,
      overheadCost,
      totalCost,
      profitMargin: profitAmount,
      sellingPrice
    });
  };

  const costBreakdown = calculation ? [
    { label: 'Materials', value: calculation.materialCost, color: 'bg-blue-500' },
    { label: 'Labor', value: calculation.laborCost, color: 'bg-green-500' },
    { label: 'Machine', value: calculation.machineCost, color: 'bg-yellow-500' },
    { label: 'Overhead', value: calculation.overheadCost, color: 'bg-purple-500' },
    { label: 'Profit', value: calculation.profitMargin, color: 'bg-emerald-500' }
  ] : [];

  const totalValue = costBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <DollarSign className="w-6 h-6 mr-2" />
          Cost Calculator
        </h2>
      </div>

      {!summary ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border dark:border-gray-700">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Run an optimization to calculate costs
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Cost Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material Cost per Sheet ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costSettings.materialCostPerSheet}
                  onChange={(e) => updateCostSettings({ materialCostPerSheet: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Labor Cost per Hour ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costSettings.laborCostPerHour}
                  onChange={(e) => updateCostSettings({ laborCostPerHour: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Machine Cost per Hour ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costSettings.machineCostPerHour}
                  onChange={(e) => updateCostSettings({ machineCostPerHour: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overhead Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costSettings.overheadPercentage}
                  onChange={(e) => updateCostSettings({ overheadPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Labor Hours
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Machine Hours
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={machineHours}
                    onChange={(e) => setMachineHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profit Margin (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{profitMargin}%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          {calculation && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Cost Breakdown
              </h3>
              
              <div className="space-y-4">
                {costBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${item.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((item.value / totalValue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Cost
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${calculation.totalCost.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Selling Price
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${calculation.sellingPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost Metrics */}
      {calculation && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost per Sheet</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(calculation.totalCost / summary.totalSheets).toFixed(2)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost per Unit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(calculation.totalCost / summary.totalProduced).toFixed(3)}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Margin</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${calculation.profitMargin.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ROI</p>
                <p className="text-2xl font-bold text-purple-600">
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculator;