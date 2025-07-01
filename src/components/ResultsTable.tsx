import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { OptimizationResult } from '../types/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsTableProps {
  results: OptimizationResult[];
}

type SortField = keyof OptimizationResult;
type SortDirection = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [sortField, setSortField] = useState<SortField>('PLATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (column: string) => {
    const newHiddenColumns = new Set(hiddenColumns);
    if (newHiddenColumns.has(column)) {
      newHiddenColumns.delete(column);
    } else {
      newHiddenColumns.add(column);
    }
    setHiddenColumns(newHiddenColumns);
  };

  const sortedResults = [...results].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4 inline-block text-gray-400" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 inline-block text-blue-500" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline-block text-blue-500" />
    );
  };

  const groupedResults = sortedResults.reduce((acc, curr) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup[0].PLATE === curr.PLATE) {
      lastGroup.push(curr);
    } else {
      acc.push([curr]);
    }
    return acc;
  }, [] as OptimizationResult[][]);

  // Define all possible columns
  const allColumns = [
    { key: 'COLOR', label: 'Color', required: true },
    { key: 'SIZE', label: 'Size', required: true },
    { key: 'QTY', label: 'Required Qty', required: true },
    { key: 'PLATE', label: 'Plate', required: true },
    { key: 'OPTIMAL_UPS', label: 'UPS', required: true },
    { key: 'SHEETS_NEEDED', label: 'Sheets', required: true },
    { key: 'QTY_PRODUCED', label: 'Qty Produced', required: true },
    { key: 'EXCESS', label: 'Excess', required: true },
    { key: 'ITEM_DESCRIPTION', label: 'Description', required: false },
    { key: 'ITEM_CODE', label: 'Item Code', required: false },
    { key: 'PRICE', label: 'Price', required: false },
    { key: 'EP_NO', label: 'EP_NO', required: false },
    { key: 'RUN', label: 'Run', required: false },
    { key: 'SHEET', label: 'Sheet', required: false },
  ];

  // Filter columns that exist in the data
  // const availableColumns = allColumns.filter(col => 
  //   col.required || results.some(result => result[col.key as keyof OptimizationResult])
  // );
  // Filter and reorder: optional first, required after
const optionalCols = allColumns.filter(col => 
  !col.required && results.some(result => result[col.key as keyof OptimizationResult])
);
const requiredCols = allColumns.filter(col => col.required);

// Combine: Optional first, then required
const availableColumns = [...optionalCols, ...requiredCols];

  const visibleColumns = availableColumns.filter(col => !hiddenColumns.has(col.key));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center"
        >
          <span className="mr-3">📊</span>
          Optimization Results
          <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({results.length} items)
          </span>
        </motion.h2>

        {/* Column Visibility Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show/Hide:</span>
          {availableColumns.filter(col => !col.required).map(col => (
            <button
              key={col.key}
              onClick={() => toggleColumnVisibility(col.key)}
              className={`flex items-center px-2 py-1 text-xs rounded transition-colors ${
                hiddenColumns.has(col.key)
                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}
            >
              {hiddenColumns.has(col.key) ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {col.label}
            </button>
          ))}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 sticky top-0 z-20">
              <tr>
                {visibleColumns.map((col) => (
                  <motion.th
                    key={col.key}
                    whileHover={{ scale: 1.02 }}
                    className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition hover:text-blue-600 dark:hover:text-blue-400 border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${
                      sortField === col.key ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleSort(col.key as SortField)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{col.label}</span>
                      {renderSortIndicator(col.key as SortField)}
                    </div>
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {groupedResults.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {/* Plate Header */}
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: groupIndex * 0.05 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 sticky top-16 z-10 border-t-2 border-blue-200 dark:border-blue-600"
                    >
                      <td colSpan={visibleColumns.length} className="px-4 py-3 font-semibold text-blue-800 dark:text-blue-200 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">📋 Plate:</span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                            >
                              {group[0].PLATE}
                            </motion.span>
                            <span className="ml-4 text-xs text-blue-600 dark:text-blue-400">
                              {group.length} items • {group[0].SHEETS_NEEDED} sheets • {group.reduce((sum, item) => sum + item.OPTIMAL_UPS, 0)} total UPS
                            </span>
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Total Produced: {group.reduce((sum, item) => sum + item.QTY_PRODUCED, 0).toLocaleString()}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Plate Items */}
                    {group.map((result, rowIndex) => (
                      <motion.tr
                        key={`${groupIndex}-${rowIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (groupIndex * group.length + rowIndex) * 0.02 }}
                        onMouseEnter={() => setHoveredRow(groupIndex * 1000 + rowIndex)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`transition-all duration-200 ${
                          hoveredRow === groupIndex * 1000 + rowIndex
                            ? 'bg-blue-50 dark:bg-blue-900/20 transform scale-[1.005] shadow-sm'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {visibleColumns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm border-r border-gray-100 dark:border-gray-700 last:border-r-0">
                            {col.key === 'COLOR' && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center space-x-2"
                              >
                                <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" 
                                     style={{ backgroundColor: result.COLOR.toLowerCase().includes('red') ? '#ef4444' : 
                                                                result.COLOR.toLowerCase().includes('blue') ? '#3b82f6' :
                                                                result.COLOR.toLowerCase().includes('green') ? '#10b981' :
                                                                result.COLOR.toLowerCase().includes('yellow') ? '#f59e0b' :
                                                                result.COLOR.toLowerCase().includes('black') ? '#1f2937' :
                                                                result.COLOR.toLowerCase().includes('white') ? '#f9fafb' :
                                                                '#6b7280' }}></div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{result.COLOR}</span>
                              </motion.div>
                            )}
                            
                            {col.key === 'SIZE' && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                                {result.SIZE}
                              </span>
                            )}
                            
                            {col.key === 'QTY' && (
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {result.QTY.toLocaleString()}
                              </span>
                            )}
                            
                            {col.key === 'PLATE' && (
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {result.PLATE}
                              </span>
                            )}
                            
                            {col.key === 'OPTIMAL_UPS' && (
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                                {result.OPTIMAL_UPS}
                              </span>
                            )}
                            
                            {col.key === 'SHEETS_NEEDED' && (
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {rowIndex === 0 ? result.SHEETS_NEEDED : ''}
                              </span>
                            )}
                            
                            {col.key === 'QTY_PRODUCED' && (
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {result.QTY_PRODUCED.toLocaleString()}
                              </span>
                            )}
                            
                            {col.key === 'EXCESS' && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  result.EXCESS > 100
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    : result.EXCESS > 0
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                }`}
                              >
                                {result.EXCESS > 0 ? (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {result.EXCESS.toLocaleString()}
                              </motion.div>
                            )}
                            
                            {col.key === 'PRICE' && result.PRICE && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                ${result.PRICE.toFixed(2)}
                              </span>
                            )}
                            
                            {!['COLOR', 'SIZE', 'QTY', 'PLATE', 'OPTIMAL_UPS', 'SHEETS_NEEDED', 'QTY_PRODUCED', 'EXCESS', 'PRICE'].includes(col.key) && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {result[col.key as keyof OptimizationResult] || '-'}
                              </span>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Table Footer with Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Total Items:</strong> {results.reduce((sum, r) => sum + r.QTY, 0).toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Total Produced:</strong> {results.reduce((sum, r) => sum + r.QTY_PRODUCED, 0).toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Total Excess:</strong> {results.reduce((sum, r) => sum + r.EXCESS, 0).toLocaleString()}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {results.length} rows • {groupedResults.length} plates
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsTable;