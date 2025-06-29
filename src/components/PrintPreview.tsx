import React, { useState, useRef } from 'react';
import { Eye, Download, Printer, RotateCcw, ZoomIn, ZoomOut, Move, Settings } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const PrintPreview: React.FC = () => {
  const { results, summary } = useAppStore();
  const [selectedPlate, setSelectedPlate] = useState<string>('A');
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter' | 'Custom'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [showBleed, setShowBleed] = useState(true);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  const plates = results.reduce((acc, result) => {
    if (!acc[result.PLATE]) {
      acc[result.PLATE] = [];
    }
    acc[result.PLATE].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  const plateKeys = Object.keys(plates).sort();

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  const getTextColor = (bgColor: string) => {
    const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return 'black';
    const l = parseInt(match[3]);
    return l > 70 ? 'black' : 'white';
  };

  const paperSizes = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Custom: { width: 300, height: 400 }
  };

  const currentSize = paperSizes[paperSize];
  const isLandscape = orientation === 'landscape';
  const paperWidth = isLandscape ? currentSize.height : currentSize.width;
  const paperHeight = isLandscape ? currentSize.width : currentSize.height;

  const handleExportPreview = async () => {
    if (!previewRef.current) return;

    try {
      // Use canvas-based export as fallback
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = previewRef.current.getBoundingClientRect();
      canvas.width = rect.width * 2; // Higher resolution
      canvas.height = rect.height * 2;
      
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Add text indicating this is a preview
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Plate ${selectedPlate} Preview`, 20, 30);
      ctx.fillText(`${currentPlateItems.length} items • ${totalUPS} UPS`, 20, 50);
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `plate-${selectedPlate}-preview.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export preview:', error);
      // Fallback: just save the current view info as text
      const data = `Plate ${selectedPlate} Preview\n${currentPlateItems.length} items\n${totalUPS} UPS\n${currentPlateItems[0]?.SHEETS_NEEDED || 0} sheets`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `plate-${selectedPlate}-info.txt`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentPlateItems = plates[selectedPlate] || [];
  const totalUPS = currentPlateItems.reduce((sum, item) => sum + item.OPTIMAL_UPS, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Eye className="w-6 h-6 mr-2" />
          Print Preview
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleExportPreview}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {!results.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border dark:border-gray-700">
          <Printer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Run an optimization to preview print layouts
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          {showSettings && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Print Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paper Size
                    </label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="A4">A4 (210×297mm)</option>
                      <option value="A3">A3 (297×420mm)</option>
                      <option value="Letter">Letter (8.5×11")</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orientation
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setOrientation('portrait')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm ${
                          orientation === 'portrait'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Portrait
                      </button>
                      <button
                        onClick={() => setOrientation('landscape')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm ${
                          orientation === 'landscape'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Landscape
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Bleed
                      </label>
                      <input
                        type="checkbox"
                        checked={showBleed}
                        onChange={(e) => setShowBleed(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Crop Marks
                      </label>
                      <input
                        type="checkbox"
                        checked={showCropMarks}
                        onChange={(e) => setShowCropMarks(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className={showSettings ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700">
              {/* Plate Selector */}
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {plateKeys.map((plate) => (
                      <button
                        key={plate}
                        onClick={() => setSelectedPlate(plate)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPlate === plate
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Plate {plate}
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPlateItems.length} items • {totalUPS} UPS • {currentPlateItems[0]?.SHEETS_NEEDED || 0} sheets
                  </div>
                </div>
              </div>

              {/* Print Preview */}
              <div className="p-6">
                <div 
                  className="mx-auto bg-white shadow-lg relative overflow-hidden"
                  style={{
                    width: `${(paperWidth * zoom) / 100}px`,
                    height: `${(paperHeight * zoom) / 100}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                  ref={previewRef}
                >
                  {/* Crop Marks */}
                  {showCropMarks && (
                    <>
                      {/* Corner crop marks */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black"></div>
                    </>
                  )}

                  {/* Bleed Area */}
                  {showBleed && (
                    <div className="absolute inset-2 border-2 border-dashed border-red-300"></div>
                  )}

                  {/* Content Area */}
                  <div className="absolute inset-4 border border-gray-300">
                    <div className="w-full h-full p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {currentPlateItems.map((item, idx) => {
                        const color = stringToColor(item.COLOR);
                        const textColor = getTextColor(color);
                        const cellCount = item.OPTIMAL_UPS;
                        
                        return Array.from({ length: cellCount }).map((_, unitIdx) => (
                          <div
                            key={`${idx}-${unitIdx}`}
                            style={{ backgroundColor: color, color: textColor }}
                            className="aspect-square rounded border overflow-hidden flex flex-col items-center justify-center text-center transition-all hover:scale-105 shadow-sm"
                          >
                            <span className="text-xs font-bold truncate w-full px-1">
                              {item.COLOR}
                            </span>
                            <span className="text-[10px] opacity-80 truncate w-full px-1">
                              {item.SIZE}
                            </span>
                          </div>
                        ));
                      }).flat()}
                    </div>
                  </div>

                  {/* Plate Info */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    Plate {selectedPlate} • {currentPlateItems[0]?.SHEETS_NEEDED || 0} sheets
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPreview;