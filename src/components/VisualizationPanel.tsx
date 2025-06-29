import React, { useEffect, useState } from 'react';
import { OptimizationResult, OptimizationSummary } from '../types/types';

interface VisualizationPanelProps {
  results: OptimizationResult[];
  summary: OptimizationSummary;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ results, summary }) => {
  const [plates, setPlates] = useState<Record<string, OptimizationResult[]>>({});
  const [activePlate, setActivePlate] = useState<string | null>(null);

  useEffect(() => {
    // Group results by plate
    const groupedPlates = results.reduce((acc, result) => {
      const plate = result.PLATE;
      if (!acc[plate]) {
        acc[plate] = [];
      }
      acc[plate].push(result);
      return acc;
    }, {} as Record<string, OptimizationResult[]>);
    
    setPlates(groupedPlates);
    
    // Set the first plate as active
    if (Object.keys(groupedPlates).length > 0 && !activePlate) {
      setActivePlate(Object.keys(groupedPlates)[0]);
    }
  }, [results, activePlate]);

  // Generate a pastel color based on string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Create a pastel color
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };
  
  const getTextColor = (bgColor: string) => {
    // Extract the HSL values
    const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return 'black';
    
    const l = parseInt(match[3]);
    return l > 70 ? 'black' : 'white';
  };

  return (
    <div className="space-y-6 animation-fade-in">
      <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        {Object.keys(plates).map((plate) => (
          <button
            key={plate}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              activePlate === plate 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActivePlate(plate)}
          >
            Plate {plate}
          </button>
        ))}
      </div>
      
      {activePlate && plates[activePlate] && (
        <div className="relative border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded">
            {plates[activePlate][0].SHEETS_NEEDED} sheets
          </div>
          
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Plate {activePlate} Layout
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visualization */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-700 shadow-inner aspect-[4/3] overflow-hidden relative">
              <div className="absolute inset-0 border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-2"></div>
              
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 w-full h-full">
                  {plates[activePlate].map((item, idx) => {
                    const color = stringToColor(item.COLOR);
                    const textColor = getTextColor(color);
                    
                    // Calculate how many cells this item should take based on UPS
                    const cellCount = item.OPTIMAL_UPS;
                    
                    // Create array of units for this item
                    return Array.from({ length: cellCount }).map((_, unitIdx) => (
                      <div
                        key={`${idx}-${unitIdx}`}
                        style={{ backgroundColor: color, color: textColor }}
                        className="rounded border overflow-hidden flex flex-col items-center justify-center p-1 text-center transition-all hover:scale-105 shadow-sm"
                      >
                        <span className="text-xs font-bold truncate w-full">
                          {item.COLOR}
                        </span>
                        <span className="text-[10px] opacity-80 truncate w-full">
                          {item.SIZE}
                        </span>
                      </div>
                    ));
                  }).flat()}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items on Plate {activePlate}
                </h4>
                <div className="space-y-2">
                  {plates[activePlate].map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stringToColor(item.COLOR) }}
                        ></div>
                        <span className="text-gray-800 dark:text-gray-200">
                          {item.COLOR} {item.SIZE}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {item.OPTIMAL_UPS} UPS
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Production Stats
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Required</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {plates[activePlate].reduce((sum, item) => sum + item.QTY, 0)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Produced</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {plates[activePlate].reduce((sum, item) => sum + item.QTY_PRODUCED, 0)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sheets</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {plates[activePlate][0].SHEETS_NEEDED}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Excess</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {plates[activePlate].reduce((sum, item) => sum + item.EXCESS, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!activePlate && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No plate selected for visualization
          </p>
        </div>
      )}
    </div>
  );
};

export default VisualizationPanel;