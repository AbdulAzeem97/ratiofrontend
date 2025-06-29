import React from 'react';
import { BarChart, PieChart, ArrowDownUp, Package, TrendingUp, Sparkles } from 'lucide-react';
import { OptimizationSummary } from '../types/types';

interface SummaryDashboardProps {
  summary: OptimizationSummary;
  csvItemCount: number;
  history: Array<{
    date: Date;
    summary: OptimizationSummary;
    itemCount: number;
  }>;
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ summary, csvItemCount }) => {
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };
  
  const getWasteClass = (wastePercentage: number) => {
    if (wastePercentage < 5) return 'text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30';
    if (wastePercentage < 15) return 'text-yellow-600 dark:text-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30';
    return 'text-red-600 dark:text-red-400 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30';
  };

  const efficiency = 100 - summary.wastePercentage;

  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
          Optimization Summary
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          efficiency >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
          efficiency >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
        }`}>
          {efficiency.toFixed(1)}% Efficient
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Required Quantity" 
          value={summary.totalItems.toLocaleString()}
          icon={<Package className="h-5 w-5" />}
          color="bg-gradient-to-br from-blue-500 to-indigo-500"
          detail={`${csvItemCount} unique items`}
          trend="neutral"
        />
        
        <StatCard 
          title="Total Produced" 
          value={summary.totalProduced.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
          detail={`+${summary.totalExcess.toLocaleString()} excess`}
          trend="up"
        />
        
        <StatCard 
          title="Waste Percentage" 
          value={formatPercentage(summary.wastePercentage)}
          icon={<PieChart className="h-5 w-5" />}
          color={summary.wastePercentage < 10 ? "bg-gradient-to-br from-green-500 to-emerald-500" : 
                summary.wastePercentage < 20 ? "bg-gradient-to-br from-yellow-500 to-orange-500" :
                "bg-gradient-to-br from-red-500 to-pink-500"}
          detail={`${summary.totalExcess.toLocaleString()} excess units`}
          trend={summary.wastePercentage < 10 ? "down" : "up"}
        />
        
        <StatCard 
          title="Total Sheets" 
          value={summary.totalSheets.toString()}
          icon={<ArrowDownUp className="h-5 w-5" />}
          color="bg-gradient-to-br from-purple-500 to-violet-500"
          detail={`Across ${summary.totalPlates} plates`}
          trend="neutral"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  detail: string;
  trend: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, detail, trend }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '📊';
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-lg">{getTrendIcon()}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{detail}</p>
      </div>
    </div>
  );
};

export default SummaryDashboard;