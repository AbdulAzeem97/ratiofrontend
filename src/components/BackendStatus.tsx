import React from 'react';
import { Server, AlertTriangle } from 'lucide-react';

interface BackendStatusProps {
  isConnected: boolean;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ isConnected }) => {
  if (isConnected) return null; // Don't show anything when connected

  return (
    <div className="mb-4 p-3 rounded-lg border bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Backend not available - Using local optimization
        </span>
      </div>
    </div>
  );
};

export default BackendStatus;