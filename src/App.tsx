import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CsvUpload from './components/CsvUpload';
import OrderInfoForm from './components/OrderInfoForm';
import OptimizationForm from './components/OptimizationForm';
import SummaryDashboard from './components/SummaryDashboard';
import ResultsTable from './components/ResultsTable';
import PdfExport from './components/PdfExport';
import VisualizationPanel from './components/VisualizationPanel';
import BackendStatus from './components/BackendStatus';
import Footer from './components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CsvItem, OptimizationResult, OptimizationSummary, OrderInfo } from './types/types';
import { optimizeUpsWithPlates, checkBackendHealth } from './utils/optimization';
import {motion} from 'framer-motion';

const rotatingMessages = [
  "📦 Optimizing layout... balancing space & efficiency.",
  "🔍 Looking for the best plate configuration...",
  "🧠 AI is solving your layout like a puzzle piece.",
  "📊 Larger datasets need a bit more thinking time...",
  "📈 Building optimization model with constraints...",
  "🤖 This might take a moment — good things take time.",
];

const stages = [
  "🔍 Reading data...",
  "📐 Mapping units...",
  "🧮 Constructing model...",
  "🧠 Solving...",
  "📊 Finalizing results..."
];

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [csvData, setCsvData] = useState<CsvItem[]>([]);
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({});
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [summary, setSummary] = useState<OptimizationSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'visualization'>('results');
  const [backendConnected, setBackendConnected] = useState(false);
  const [csvUploadKey, setCsvUploadKey] = useState(0);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null); // in seconds
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);


  useEffect(() => {
    if (!estimatedTime || taskStatus !== 'processing') return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setRemainingTime(estimatedTime);
    return () => clearInterval(interval);
  }, [estimatedTime, taskStatus]);

  useEffect(() => {
    if (!isCalculating) return;

    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % rotatingMessages.length);
    }, 4000);

    const stageInterval = setInterval(() => {
      setStageIndex(i => (i + 1) % stages.length);
    }, 6000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(stageInterval);
    };
  }, [isCalculating]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check backend health on component mount
    checkBackendHealth().then(setBackendConnected);
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(() => {
      checkBackendHealth().then(setBackendConnected);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const clearData = () => {
    setCsvData([]);
    setOrderInfo({});
    setResults([]);
    setSummary(null);
    setCsvUploadKey(prev => prev + 1); // 🔄 Force re-render
    toast.info('Data cleared successfully');
  };

  const handleCsvUpload = (data: CsvItem[]) => {
    if (data.length === 0) {
      toast.error('No valid data found in the CSV file');
      return;
    }
    
    setCsvData(data);
    toast.success(`Uploaded ${data.length} items successfully`);
    setResults([]);
    setSummary(null);
  };

  const handleOptimize = async (upsPerPlate: number, plateCount: number) => {
    if (csvData.length === 0) {
      toast.error('Please upload CSV data first');
      return;
    }
    setMessageIndex(0);
    setStageIndex(0);
    setIsCalculating(true);
    setSummary(null);


    
    try {
      const startTime = Date.now();
      const { results: optimizationResults, summary: optimizationSummary } = 
        await optimizeUpsWithPlates(csvData, upsPerPlate, plateCount, (status) => setTaskStatus(status), (seconds) => setEstimatedTime(seconds));
      
      const executionTime = Date.now() - startTime;
      
      setResults(optimizationResults);
      setSummary(optimizationSummary);
      
      const backendUsed = csvData.length >= 10 && plateCount > 1;
      const optimizerType = backendUsed ? 'backend' : 'frontend';
      
      toast.success(
        `Optimization completed using ${optimizerType} in ${executionTime}ms`
      );
      
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
      setTaskStatus(null);
    }
  };

  function ProgressBar({ estimatedTime, remainingTime }: { estimatedTime: number, remainingTime: number }) {
    const progress = Math.max(0, Math.min(100, ((estimatedTime - remainingTime) / estimatedTime) * 100));

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mt-3 shadow-inner">
        <div
          className="h-full bg-green-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      <ToastContainer 
        position="top-right" 
        theme={theme}
        toastClassName="backdrop-blur-sm"
        className="mt-16"
      />
      
      <Header theme={theme} toggleTheme={toggleTheme} clearData={clearData} />
      
      <main className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Backend Status Indicator */}
        <BackendStatus isConnected={backendConnected} />
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Left Sidebar - Ultra Compact */}
          <div className="lg:col-span-1 space-y-3">
            <CsvUpload key={csvUploadKey} onUpload={handleCsvUpload} uploadedCount={csvData.length} />
            <OrderInfoForm orderInfo={orderInfo} onOrderInfoChange={setOrderInfo} />
            <OptimizationForm 
              onOptimize={handleOptimize} 
              isCalculating={isCalculating}
              isDisabled={csvData.length === 0}
              backendConnected={backendConnected}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-5 space-y-4">
            {summary && (
              <>
                <SummaryDashboard 
                  summary={summary} 
                  csvItemCount={csvData.length}
                  history={[]}
                />
                
                <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50 gap-3 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                    <div className="flex space-x-1">
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                          activeTab === 'results' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => setActiveTab('results')}
                      >
                        📊 Results
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                          activeTab === 'visualization' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => setActiveTab('visualization')}
                      >
                        🎨 Visualization
                      </button>
                    </div>
                    
                    {results.length > 0 && (
                      <div className="flex-shrink-0">
                        <PdfExport summary={summary} results={results} orderInfo={orderInfo} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {activeTab === 'results' && <ResultsTable results={results} />}
                    {activeTab === 'visualization' && <VisualizationPanel results={results} summary={summary} />}
                  </div>
                </div>
              </>
            )}
            
            {!summary && (
              <div className="bg-gradient-to-br from-white/90 via-blue-50/50 to-indigo-50/30 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-700/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500 rounded-full blur-2xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center space-y-6 w-full max-w-xl">

                  {isCalculating ? (
                    <>
                      <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-indigo-400 border-t-transparent shadow-xl"></div>

                      <div className="text-lg font-medium text-indigo-700 dark:text-indigo-300 transition-all duration-500 px-4">
                        {rotatingMessages[messageIndex]}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {stages[stageIndex]}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {taskStatus !== 'processing' && (
                          <p>Your request is in a queue... waiting to be picked.</p>
                        )}

                        {taskStatus === 'processing' && estimatedTime && remainingTime !== null && (
                        <>
                          <p>
                            Your request is now being calculated. Estimated time: {Math.ceil(estimatedTime / 60)} minute(s).
                            <motion.div
                            key={remainingTime}
                            initial={{ scale: 0.9, rotate: 0 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="inline-block ml-1 font-semibold text-indigo-600 dark:text-indigo-300"
                          >
                            {remainingTime}s left
                          </motion.div>
                          </p>
                          <ProgressBar estimatedTime={estimatedTime} remainingTime={remainingTime} />
                        </>
                        )}

                        {!taskStatus && (
                          <p>Sending request to backend...</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-indigo-400 mb-3">
                        🏭 UPS Optimizer Pro
                      </h2>

                      <p className="text-gray-600 dark:text-gray-300 max-w-md mb-4 text-lg leading-relaxed">
                        Professional printing layout optimization with advanced constraint programming and AI enhancement.
                      </p>

                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-4">
                        <li>✨ Upload your CSV data to get started</li>
                        <li>🎯 Optimize layouts with advanced algorithms</li>
                        <li>📋 Export professional reports</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;