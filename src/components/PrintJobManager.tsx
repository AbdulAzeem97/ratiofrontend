import React, { useState } from 'react';
import { Play, Pause, Square, Clock, CheckCircle, AlertCircle, User, FileText, Calendar, Filter } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { PrintJob } from '../types/types';
import { format } from 'date-fns';

const PrintJobManager: React.FC = () => {
  const { printJobs, updatePrintJob } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'printing' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'estimatedDuration'>('createdAt');

  const filteredJobs = printJobs
    .filter(job => filter === 'all' || job.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'estimatedDuration':
          return (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        default:
          return 0;
      }
    });

  const handleStatusChange = (jobId: string, newStatus: PrintJob['status']) => {
    const updates: Partial<PrintJob> = { status: newStatus };
    
    if (newStatus === 'completed') {
      updates.completedAt = new Date();
    }
    
    updatePrintJob(jobId, updates);
  };

  const getStatusIcon = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'printing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'printing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Print Job Manager</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Jobs</option>
              <option value="pending">Pending</option>
              <option value="printing">Printing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="estimatedDuration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'printing', 'completed', 'failed'].map((status) => {
          const count = printJobs.filter(job => job.status === status).length;
          return (
            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {status}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
                {getStatusIcon(status as PrintJob['status'])}
              </div>
            </div>
          );
        })}
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Jobs ({filteredJobs.length})
          </h3>
          
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No print jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {job.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {format(job.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                        
                        {job.operator && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Operator: {job.operator}</span>
                          </div>
                        )}
                        
                        {job.estimatedDuration && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Est. Duration: {job.estimatedDuration}min</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Sheets:</span>
                          <span className="ml-1 font-medium">{job.summary.totalSheets}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Plates:</span>
                          <span className="ml-1 font-medium">{job.summary.totalPlates}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Efficiency:</span>
                          <span className="ml-1 font-medium">
                            {(100 - job.summary.wastePercentage).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <span className="ml-1 font-medium">{job.results.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {job.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(job.id, 'printing')}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title="Start Printing"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {job.status === 'printing' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(job.id, 'completed')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(job.id, 'failed')}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            title="Mark Failed"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {job.notes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Notes:</strong> {job.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintJobManager;