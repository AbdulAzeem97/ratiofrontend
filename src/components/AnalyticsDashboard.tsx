import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { OptimizationResult, OptimizationSummary } from '../types/types';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsDashboardProps {
  results: OptimizationResult[];
  summary: OptimizationSummary;
  history: Array<{
    date: Date;
    summary: OptimizationSummary;
    itemCount: number;
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  results,
  summary,
  history,
}) => {
  // Group data by color
  const colorData = results.reduce((acc, curr) => {
    if (!acc[curr.COLOR]) {
      acc[curr.COLOR] = {
        required: 0,
        produced: 0,
        excess: 0,
      };
    }
    acc[curr.COLOR].required += curr.QTY;
    acc[curr.COLOR].produced += curr.QTY_PRODUCED;
    acc[curr.COLOR].excess += curr.EXCESS;
    return acc;
  }, {} as Record<string, { required: number; produced: number; excess: number }>);

  // Prepare data for charts
  const colors = Object.keys(colorData);
  const required = colors.map(color => colorData[color].required);
  const produced = colors.map(color => colorData[color].produced);
  const excess = colors.map(color => colorData[color].excess);

  // Generate random pastel colors
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const backgroundColors = colors.map(() => generatePastelColor());

  const productionData = {
    labels: colors,
    datasets: [
      {
        label: 'Required',
        data: required,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Produced',
        data: produced,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const wasteData = {
    labels: colors,
    datasets: [{
      label: 'Excess Units',
      data: excess,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors.map(color => color.replace('0.5', '1')),
      borderWidth: 1,
    }],
  };

  // Prepare historical efficiency data
  const efficiencyData = {
    labels: history.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [{
      label: 'Efficiency %',
      data: history.map(entry => 100 - entry.summary.wastePercentage),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Production Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Production Overview
            </h3>
          </div>
          <div className="h-64">
            <Bar
              data={productionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Waste Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Waste Distribution
            </h3>
          </div>
          <div className="h-64">
            <Pie
              data={wasteData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Efficiency Trend
            </h3>
          </div>
          <div className="h-64">
            <Line
              data={efficiencyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Efficiency %',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Waste"
          value={`${summary.wastePercentage.toFixed(1)}%`}
          trend={history.length > 1 ? (summary.wastePercentage < history[1].summary.wastePercentage) : null}
        />
        <StatCard
          title="Total Production"
          value={summary.totalProduced.toString()}
          subtitle="units"
        />
        <StatCard
          title="Plate Utilization"
          value={`${((summary.totalProduced - summary.totalExcess) / summary.totalProduced * 100).toFixed(1)}%`}
          trend={true}
        />
        <StatCard
          title="Efficiency Score"
          value={`${(100 - summary.wastePercentage).toFixed(1)}`}
          subtitle="points"
          trend={true}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: boolean | null;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        {trend !== null && (
          <span className={`ml-2 text-sm ${trend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;