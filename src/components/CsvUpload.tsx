// import React, { useState, useRef } from 'react';
// import { Upload, FileText, Check, AlertTriangle, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
// import Papa from 'papaparse';
// import { CsvItem } from '../types/types';

// interface CsvUploadProps {
//   onUpload: (data: CsvItem[]) => void;
//   uploadedCount: number;
// }

// const CsvUpload: React.FC<CsvUploadProps> = ({ onUpload, uploadedCount }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [showRequirements, setShowRequirements] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const processFile = (file: File) => {
//     setFileName(file.name);
//     setError(null);

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         if (results.errors.length > 0) {
//           setError(`Error parsing CSV: ${results.errors[0].message}`);
//           return;
//         }

//         const data = results.data as Record<string, string>[];
        
//         // Validate required columns (case insensitive)
//         const requiredColumns = ['COLOR', 'SIZE', 'QTY'];
//         const headers = Object.keys(data[0] || {});
//         const hasRequiredColumns = requiredColumns.every(col => 
//           headers.some(header => header.toUpperCase() === col)
//         );

//         if (!hasRequiredColumns) {
//           setError('CSV file must contain COLOR, SIZE, and QTY columns');
//           return;
//         }

//         try {
//           // Map and validate data
//           const mappedData = data.map(row => {
//             // Find the column names regardless of case
//             const colorKey = headers.find(key => key.toUpperCase() === 'COLOR') || 'COLOR';
//             const sizeKey = headers.find(key => key.toUpperCase() === 'SIZE') || 'SIZE';
//             const qtyKey = headers.find(key => key.toUpperCase() === 'QTY') || 'QTY';
            
//             const qty = parseInt(row[qtyKey]);
            
//             if (isNaN(qty)) {
//               throw new Error(`Invalid quantity value: ${row[qtyKey]}`);
//             }
            
//             const item: CsvItem = {
//               COLOR: row[colorKey],
//               SIZE: row[sizeKey],
//               QTY: qty
//             };

//             // Add optional fields if they exist
//             const optionalFields = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'RATIO', 'RUN', 'SHEET'];
//             optionalFields.forEach(field => {
//               const key = headers.find(h => h.toUpperCase() === field);
//               if (key && row[key]) {
//                 if (field === 'PRICE') {
//                   const price = parseFloat(row[key]);
//                   if (!isNaN(price)) {
//                     (item as any)[field] = price;
//                   }
//                 } else {
//                   (item as any)[field] = row[key];
//                 }
//               }
//             });
            
//             return item;
//           });
          
//           onUpload(mappedData);
//         } catch (err) {
//           setError(`Invalid data format: ${err instanceof Error ? err.message : String(err)}`);
//         }
//       },
//       error: (error) => {
//         setError(`Error reading file: ${error.message}`);
//       }
//     });
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0];
//       if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
//         setError('Please upload a CSV file');
//         return;
//       }
      
//       processFile(file);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       processFile(e.target.files[0]);
//     }
//   };

//   const handleButtonClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   return (
//     <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
//           <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
//           Data Input
//         </h2>
//         {uploadedCount > 0 && (
//           <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
//             {uploadedCount}
//           </span>
//         )}
//       </div>
      
//       <div
//         className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
//           isDragging 
//             ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 scale-105' 
//             : error 
//               ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700' 
//               : fileName 
//                 ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' 
//                 : 'border-gray-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:border-gray-600 dark:hover:from-gray-700/50 dark:hover:to-blue-900/20'
//         }`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           accept=".csv"
//           className="hidden"
//           id="csv-upload"
//         />
        
//         <div className="flex flex-col items-center justify-center text-center">
//           {!fileName && !error && (
//             <>
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
//                 <Upload className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
//                 Drop CSV or click to browse
//               </h4>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Supports all standard CSV formats
//               </p>
//             </>
//           )}
          
//           {fileName && !error && (
//             <>
//               <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
//                 <Check className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
//                 ✅ Upload Successful
//               </h4>
//               <p className="text-xs text-green-600 dark:text-green-400 mb-2 flex items-center">
//                 <FileText className="h-3 w-3 mr-1" />
//                 {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
//               </p>
//             </>
//           )}
          
//           {error && (
//             <>
//               <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
//                 <AlertTriangle className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
//                 ❌ Upload Failed
//               </h4>
//               <p className="text-xs text-red-500 dark:text-red-400 mb-2">
//                 {error.length > 35 ? error.substring(0, 35) + '...' : error}
//               </p>
//             </>
//           )}
          
//           <button
//             type="button"
//             onClick={handleButtonClick}
//             className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
//           >
//             Select CSV File
//           </button>
//         </div>
//       </div>
      
//       {/* Collapsible Requirements */}
//       <div className="mt-3">
//         <button
//           onClick={() => setShowRequirements(!showRequirements)}
//           className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
//         >
//           <Info className="w-3 h-3 mr-1" />
//           Format Requirements
//           {showRequirements ? (
//             <ChevronUp className="w-3 h-3 ml-1" />
//           ) : (
//             <ChevronDown className="w-3 h-3 ml-1" />
//           )}
//         </button>
        
//         {showRequirements && (
//           <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
//             <div className="space-y-2">
//               <div>
//                 <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Required Columns:</h4>
//                 <div className="flex flex-wrap gap-1">
//                   {['COLOR', 'SIZE', 'QTY'].map(col => (
//                     <span key={col} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
//                       {col}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Optional Columns:</h4>
//                 <div className="flex flex-wrap gap-1">
//                   {['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'RATIO', 'RUN', 'SHEET'].map(col => (
//                     <span key={col} className="px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs rounded-full">
//                       {col.replace('_', ' ')}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CsvUpload;

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Check, AlertTriangle, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import { CsvItem } from '../types/types';

interface CsvUploadProps {
  onUpload: (data: CsvItem[]) => void;
  uploadedCount: number;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onUpload, uploadedCount }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  useEffect(() => {
    if (uploadedCount === 0) {
      setUploadVisible(false);
      setFileName(null);
      setError(null);
      if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    }
  }, [uploadedCount]);


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as Record<string, string>[];
        
        // Validate required columns (case insensitive)
        const requiredColumns = ['COLOR', 'SIZE', 'QTY'];
        const headers = Object.keys(data[0] || {});
        const hasRequiredColumns = requiredColumns.every(col => 
          headers.some(header => header.toUpperCase() === col)
        );

        if (!hasRequiredColumns) {
          setError('CSV file must contain COLOR, SIZE, and QTY columns');
          return;
        }

        try {
          // Map and validate data
          const mappedData = data.map(row => {
            // Find the column names regardless of case
            const colorKey = headers.find(key => key.toUpperCase() === 'COLOR') || 'COLOR';
            const sizeKey = headers.find(key => key.toUpperCase() === 'SIZE') || 'SIZE';
            const qtyKey = headers.find(key => key.toUpperCase() === 'QTY') || 'QTY';
            
            const qty = parseInt(row[qtyKey]);
            
            if (isNaN(qty)) {
              throw new Error(`Invalid quantity value: ${row[qtyKey]}`);
            }
            
            const item: CsvItem = {
              COLOR: row[colorKey],
              SIZE: row[sizeKey],
              QTY: qty
            };

            // Add optional fields if they exist
            const optionalFields = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'EP_NO', 'RUN', 'SHEET'];
            optionalFields.forEach(field => {
              const key = headers.find(h => h.toUpperCase() === field);
              if (key && row[key]) {
                if (field === 'PRICE') {
                  const price = parseFloat(row[key]);
                  if (!isNaN(price)) {
                    (item as any)[field] = price;
                  }
                } else {
                  (item as any)[field] = row[key];
                }
              }
            });
            
            return item;
          });
          
          onUpload(mappedData);
          setUploadVisible(true);

        } catch (err) {
          setError(`Invalid data format: ${err instanceof Error ? err.message : String(err)}`);
        }
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const downloadSampleCSV = () => {
      const sampleData = [
        { EP_NO: ' ', ITEM_CODE: ' ', ITEM_DESCRIPTION: ' ',  PRICE: ' ', COLOR: 'Red', SIZE: 'M', QTY: 10 },
        { EP_NO: ' ', ITEM_CODE: ' ', ITEM_DESCRIPTION: ' ',  PRICE: ' ', COLOR: 'Blue', SIZE: 'L', QTY: 15 },
        { EP_NO: ' ', ITEM_CODE: ' ', ITEM_DESCRIPTION: ' ', PRICE: ' ', COLOR: 'Green', SIZE: 'S', QTY: 5 },
      ];
  
      const csv = Papa.unparse(sampleData);
  
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sample_inventory.csv';
      link.click();
    };
  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
          Data Input
        </h2>
        {uploadedCount > 0 && uploadVisible && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
            {uploadedCount}
          </span>
        )}
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 scale-105' 
            : error 
              ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700' 
              : fileName 
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' 
                : 'border-gray-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:border-gray-600 dark:hover:from-gray-700/50 dark:hover:to-blue-900/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          id="csv-upload"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {!fileName && !error && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Drop CSV or click to browse
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports all standard CSV formats
              </p>
            </>
          )}
          
          {fileName && !error && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                ✅ Upload Successful
              </h4>
              <p className="text-xs text-green-600 dark:text-green-400 mb-2 flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
              </p>
            </>
          )}
          
          {error && (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                ❌ Upload Failed
              </h4>
              <p className="text-xs text-red-500 dark:text-red-400 mb-2">
                {error.length > 35 ? error.substring(0, 35) + '...' : error}
              </p>
            </>
          )}
          
          <button
            type="button"
            onClick={handleButtonClick}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Select CSV File
          </button>
          
        </div>
      </div>
      
      {/* Collapsible Requirements */}
      <div className="mt-3">
        <button
          onClick={() => setShowRequirements(!showRequirements)}
          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <Info className="w-3 h-3 mr-1" />
          Format Requirements
          {showRequirements ? (
            <ChevronUp className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
          )}
        </button>
         <div className="mt-5">
        <button
          onClick={downloadSampleCSV}
          className="inline-flex items-center  px-1 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download Sample CSV
        </button>
      </div>
    
        {showRequirements && (
          <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Required Columns:</h4>
                <div className="flex flex-wrap gap-1">
                  {['COLOR', 'SIZE', 'QTY'].map(col => (
                    <span key={col} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Optional Columns:</h4>
                <div className="flex flex-wrap gap-1">
                  {['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'EP_NO', 'RUN', 'SHEET'].map(col => (
                    <span key={col} className="px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs rounded-full">
                      {col.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvUpload;