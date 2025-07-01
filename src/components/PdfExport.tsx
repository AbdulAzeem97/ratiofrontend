// import React, { useState } from 'react';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { Download, FileText, Table } from 'lucide-react';
// import { OptimizationResult, OptimizationSummary, OrderInfo } from '../types/types';
// import * as XLSX from 'xlsx';

// interface PdfExportProps {
//   summary: OptimizationSummary;
//   results: OptimizationResult[];
//   orderInfo?: OrderInfo;
// }

// const PdfExport: React.FC<PdfExportProps> = ({ summary, results, orderInfo }) => {
//   const [isExporting, setIsExporting] = useState(false);

//   const exportToPdf = () => {
//     if (!summary || !results || results.length === 0) {
//       return;
//     }

//     setIsExporting(true);

//     const doc = new jsPDF();

//     // Header - Company name
//     doc.setFontSize(18);
//     doc.setFont('helvetica', 'bold');
//     doc.text('HORIZON SOURCING', 105, 15, { align: 'center' });

//     // Right aligned date
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 200, 10, { align: 'right' });

//     // Subtitle
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text('UPS OPTIMIZATION REPORT', 105, 25, { align: 'center' });

//     let currentY = 35;

//     // Order Information Section (if provided)
//     if (orderInfo && Object.values(orderInfo).some(value => value)) {
//       const orderData = [];
//       if (orderInfo.factory) orderData.push(['Factory', orderInfo.factory]);
//       if (orderInfo.po) orderData.push(['PO', orderInfo.po]);
//       if (orderInfo.job) orderData.push(['Job', orderInfo.job]);
//       if (orderInfo.brand) orderData.push(['Brand', orderInfo.brand]);
//       if (orderInfo.item) orderData.push(['Item', orderInfo.item]);

//       if (orderData.length > 0) {
//         autoTable(doc, {
//           startY: currentY,
//           head: [['Order Information', '']],
//           body: orderData,
//           theme: 'grid',
//           headStyles: { fillColor: [200, 200, 200], textColor: 0 },
//           styles: { fontSize: 10, textColor: 0 },
//         });
//         currentY = (doc as any).lastAutoTable.finalY + 10;
//       }
//     }

//     // Summary section
//     const compactSummaryData = [
//       ['No. of UPS', summary.upsCapacity.toString(), 'Total Sheets', (summary.totalSheets || 0).toString()],
//       ['Total Plates', summary.totalPlates.toString(), 'Required Order Qty', summary.totalItems.toString()],
//       ['Qty Produced', summary.totalProduced.toString(), 'Excess Qty', summary.totalExcess.toString()],
//       ['Excess %', `${summary.wastePercentage}%`, '', ''],
//     ];

//     autoTable(doc, {
//       startY: currentY,
//       head: [['Metric', 'Value', 'Metric', 'Value']],
//       body: compactSummaryData,
//       theme: 'grid',
//       headStyles: { fillColor: [220, 220, 220], textColor: 0 },
//       styles: { fontSize: 10, textColor: 0 },
//     });

//     currentY = (doc as any).lastAutoTable.finalY + 10;

//     // Sort results by PLATE
//     const sortedResults = [...results].sort((a, b) => a.PLATE.localeCompare(b.PLATE));

//     // Prepare table headers
//     const headers = ['Color', 'Size', 'Required Qty', 'Plate', 'UPS', 'Sheets', 'Qty Produced', 'Excess Qty'];
    
//     // Add optional columns if they exist in the data
//     const optionalColumns = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'RATIO', 'RUN', 'SHEET'];
//     const existingOptionalColumns = optionalColumns.filter(col => 
//       sortedResults.some(result => result[col as keyof OptimizationResult])
//     );
    
//     headers.push(...existingOptionalColumns.map(col => col.replace('_', ' ')));

//     // Data table
//     autoTable(doc, {
//       startY: currentY,
//       head: [headers],
//       body: sortedResults.map((r, i) => {
//         const isNewPlate = i === 0 || r.PLATE !== sortedResults[i - 1].PLATE;

//         // Optional column values first
//         const optionalValues = existingOptionalColumns.map(col => {
//           const value = r[col as keyof OptimizationResult];
//           return value ? value.toString() : '';
//         });

//         const fixedValues = [
//           r.COLOR,
//           r.SIZE,
//           r.QTY.toString(),
//           r.PLATE,
//           r.OPTIMAL_UPS.toString(),
//           isNewPlate ? r.SHEETS_NEEDED.toString() : '',
//           r.QTY_PRODUCED.toString(),
//           r.EXCESS.toString(),
//         ];

//         // Combine optional + fixed
//         const row = [...optionalValues, ...fixedValues];

//         return row;
        
//         // // Add optional column values
//         // existingOptionalColumns.forEach(col => {
//         //   const value = r[col as keyof OptimizationResult];
//         //   row.push(value ? value.toString() : '');
//         // });
        
//         // return row;
//       }),
//       theme: 'striped',
//       headStyles: { fillColor: [220, 220, 220], textColor: 0 },
//       styles: { fontSize: 8, textColor: 0 },
//     });

//     // Summary line at the bottom
//     const totalQtyProduced = results.reduce((sum, r) => sum + r.QTY_PRODUCED, 0);
//     const totalExcess = results.reduce((sum, r) => sum + r.EXCESS, 0);
  
//     const summaryLine = [
//       'Total Summary',
//       '',
//       summary.totalItems.toString(),
//       summary.totalPlates.toString(),
//       summary.upsCapacity.toString(),
//       summary.totalSheets.toString(),
//       totalQtyProduced.toString(),
//       totalExcess.toString(),
//     ];
    
//     // Add empty cells for optional columns
//     existingOptionalColumns.forEach(() => summaryLine.push(''));

//     autoTable(doc, {
//       body: [summaryLine],
//       theme: 'grid',
//       styles: { fontStyle: 'bold', textColor: 0, fontSize: 8 },
//     });

//     // Footer - Generated by & page number
//     const pageCount = doc.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.text('Generated by Horizon Sourcing', 10, 290);
//       doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: 'right' });
//     }

//     doc.save('UPS_Optimization_Results.pdf');
//     setIsExporting(false);
//   };

//   const exportToExcel = () => {
//     if (!summary || !results || results.length === 0) {
//       return;
//     }

//     setIsExporting(true);

//     // Prepare data for Excel
//     const excelData = [];
    
//     // Order information
//     if (orderInfo && Object.values(orderInfo).some(value => value)) {
//       excelData.push(['Order Information', '']);
//       if (orderInfo.factory) excelData.push(['Factory', orderInfo.factory]);
//       if (orderInfo.po) excelData.push(['PO', orderInfo.po]);
//       if (orderInfo.job) excelData.push(['Job', orderInfo.job]);
//       if (orderInfo.brand) excelData.push(['Brand', orderInfo.brand]);
//       if (orderInfo.item) excelData.push(['Item', orderInfo.item]);
//       excelData.push(['', '']);
//     }
    
//     // Summary
//     excelData.push(
//       ['Metric', 'Value', 'Metric', 'Value'],
//       // ['No. of UPS', summary.upsCapacity, 'Total Sheets', summary.totalSheets],
//       // ['Total Plates', summary.totalPlates, 'Required Order Qty', summary.totalItems],
//       // ['Qty Produced', summary.totalProduced, 'Excess Qty', summary.totalExcess],
//       // ['Excess %', `${summary.wastePercentage}%`, '', ''],
//       ['No. of UPS', summary.upsCapacity.toString(), 'Total Sheets', (summary.totalSheets || 0).toString()],
//       ['Required Order Qty', summary.totalItems.toString(), 'Total Plates', summary.totalPlates.toString()],
//       ['Qty Produced', summary.totalProduced.toString(), 'Excess Qty', summary.totalExcess.toString()],
//       [ 'Efficiency ', '','Excess %', `${summary.wastePercentage}%`],
//       ['', '', '', '']
//     );
    
//     // Results headers
//     const headers = ['Color', 'Size', 'Required Qty', 'Plate', 'UPS', 'Sheets', 'Qty Produced', 'Excess Qty'];
//     const optionalColumns = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'RATIO', 'RUN', 'SHEET'];
//     const existingOptionalColumns = optionalColumns.filter(col => 
//       results.some(result => result[col as keyof OptimizationResult])
//     );
//     headers.push(...existingOptionalColumns.map(col => col.replace('_', ' ')));
    
//     excelData.push(headers);
    
//     // Results data
//     excelData.push(...results.map((r, i) => {
//       const isNewPlate = i === 0 || r.PLATE !== results[i - 1].PLATE;
//       const row = [
//         r.COLOR,
//         r.SIZE,
//         r.QTY,
//         r.PLATE,
//         r.OPTIMAL_UPS,
//         isNewPlate ? r.SHEETS_NEEDED : '',
//         r.QTY_PRODUCED,
//         r.EXCESS,
//       ];
      
//       existingOptionalColumns.forEach(col => {
//         const value = r[col as keyof OptimizationResult];
//         row.push(value || '');
//       });
      
//       return row;
//     }));

//     // Create a worksheet and workbook
//     const ws = XLSX.utils.aoa_to_sheet(excelData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'UPS Optimization Report');

//     // Export to Excel
//     XLSX.writeFile(wb, 'UPS_Optimization_Results.xlsx');
//     setIsExporting(false);
//   };

//   return (
//     <div className="flex space-x-3">
//       <button
//         onClick={exportToPdf}
//         className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
//       >
//         {isExporting ? (
//           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//         ) : (
//           <FileText className="w-4 h-4 mr-2" />
//         )}
//         {isExporting ? 'Exporting...' : 'PDF'}
//       </button>

//       <button
//         onClick={exportToExcel}
//         className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
//       >
//         {isExporting ? (
//           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//         ) : (
//           <Table className="w-4 h-4 mr-2" />
//         )}
//         {isExporting ? 'Exporting...' : 'Excel'}
//       </button>
//     </div>
//   );
// };

// export default PdfExport;

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Table } from 'lucide-react';
import { OptimizationResult, OptimizationSummary, OrderInfo } from '../types/types';
import * as XLSX from 'xlsx';

interface PdfExportProps {
  summary: OptimizationSummary;
  results: OptimizationResult[];
  orderInfo?: OrderInfo;
}

const PdfExport: React.FC<PdfExportProps> = ({ summary, results, orderInfo }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = () => {
    if (!summary || !results || results.length === 0) {
      return;
    }

    setIsExporting(true);

    const doc = new jsPDF();

    // Header - Company name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HORIZON SOURCING', 105, 15, { align: 'center' });

    // Right aligned date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 200, 10, { align: 'right' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UPS OPTIMIZATION REPORT', 105, 25, { align: 'center' });

    let currentY = 35;

    // Order Information Section (if provided)
    if (orderInfo && Object.values(orderInfo).some(value => value)) {
      const orderData = [];
      if (orderInfo.factory) orderData.push(['Factory', orderInfo.factory]);
      if (orderInfo.po) orderData.push(['PO', orderInfo.po]);
      if (orderInfo.job) orderData.push(['Job', orderInfo.job]);
      if (orderInfo.brand) orderData.push(['Brand', orderInfo.brand]);
      if (orderInfo.item) orderData.push(['Item', orderInfo.item]);

      if (orderData.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Order Information', '']],
          body: orderData,
          theme: 'grid',
          headStyles: { fillColor: [200, 200, 200], textColor: 0 },
          styles: { fontSize: 10, textColor: 0 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    const efficiency = (100- summary.wastePercentage).toFixed(1);

    // Summary section
    const compactSummaryData = [
      // ['No. of UPS', summary.upsCapacity.toString(), 'Total Sheets', (summary.totalSheets || 0).toString()],
      // ['Total Plates', summary.totalPlates.toString(), 'Required Order Qty', summary.totalItems.toString()],
      // ['Qty Produced', summary.totalProduced.toString(), 'Excess Qty', summary.totalExcess.toString()],
      // ['Excess %', `${summary.wastePercentage}%`, '', ''],
      ['No. of UPS', summary.upsCapacity.toString(), 'Total Sheets', (summary.totalSheets || 0).toString()],
      ['Required Order Qty', summary.totalItems.toString(), 'Total Plates', summary.totalPlates.toString()],
      ['Qty Produced', summary.totalProduced.toString(), 'Excess Qty', summary.totalExcess.toString()],
      [ 'Efficiency ', `${efficiency}%`,'Excess %', `${summary.wastePercentage}%`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Metric', 'Value']],
      body: compactSummaryData,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0 },
      styles: { fontSize: 10, textColor: 0 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Sort results by PLATE
    const sortedResults = [...results].sort((a, b) => a.PLATE.localeCompare(b.PLATE));

    // Prepare table headers
    //const headers = ['Color', 'Size', 'Required Qty', 'Plate', 'UPS', 'Sheets', 'Qty Produced', 'Excess Qty'];
    
    // Add optional columns if they exist in the data
    const optionalColumns = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'EP_NO', 'RUN', 'SHEET'];
    const existingOptionalColumns = optionalColumns.filter(col => 
      sortedResults.some(result => result[col as keyof OptimizationResult])
    );

    // Map optional headers (replacing _ with space)
    const optionalHeaders = existingOptionalColumns.map(col => col.replace('_', ' '));

    // Fixed headers
    const fixedHeaders = ['Color', 'Size', 'Required Qty', 'Plate', 'UPS', 'Sheets', 'Qty Produced', 'Excess Qty'];
        
    const headers= [...optionalHeaders, ...fixedHeaders];

    // Data table
    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body: sortedResults.map((r, i) => {
        const isNewPlate = i === 0 || r.PLATE !== sortedResults[i - 1].PLATE;
        // const row = [
        //   r.COLOR,
        //   r.SIZE,
        //   r.QTY.toString(),
        //   r.PLATE,
        //   r.OPTIMAL_UPS.toString(),
        //   isNewPlate ? r.SHEETS_NEEDED.toString() : '',
        //   r.QTY_PRODUCED.toString(),
        //   r.EXCESS.toString(),
        // ];
        
        // // Add optional column values
        // existingOptionalColumns.forEach(col => {
        //   const value = r[col as keyof OptimizationResult];
        //   row.push(value ? value.toString() : '');
        // });
        
        // return row;
        // Optional column values first
        const optionalValues = existingOptionalColumns.map(col => {
          const value = r[col as keyof OptimizationResult];
          return value ? value.toString() : '';
        });

        const fixedValues = [
          r.COLOR,
          r.SIZE,
          r.QTY.toString(),
          r.PLATE,
          r.OPTIMAL_UPS.toString(),
          isNewPlate ? r.SHEETS_NEEDED.toString() : '',
          r.QTY_PRODUCED.toString(),
          r.EXCESS.toString(),
        ];

        // Combine optional + fixed
        const row = [...optionalValues, ...fixedValues];

        return row;
        
        // // Add optional column values
        // existingOptionalColumns.forEach(col => {
        //   const value = r[col as keyof OptimizationResult];
        //   row.push(value ? value.toString() : '');
        // });
        
        // return row;
      }),
      theme: 'striped',
      headStyles: { fillColor: [220, 220, 220], textColor: 0 },
      styles: { fontSize: 8, textColor: 0 },
    });

    // Summary line at the bottom
    const totalQtyProduced = results.reduce((sum, r) => sum + r.QTY_PRODUCED, 0);
    const totalExcess = results.reduce((sum, r) => sum + r.EXCESS, 0);
  
    const summaryLine = [
      'Total Summary',
      '',
      summary.totalItems.toString(),
      summary.totalPlates.toString(),
      summary.upsCapacity.toString(),
      summary.totalSheets.toString(),
      totalQtyProduced.toString(),
      totalExcess.toString(),
    ];
    
    // Add empty cells for optional columns
    existingOptionalColumns.forEach(() => summaryLine.push(''));

    autoTable(doc, {
      body: [summaryLine],
      theme: 'grid',
      styles: { fontStyle: 'bold', textColor: 0, fontSize: 8 },
    });

    // Footer - Generated by & page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Generated by Horizon Sourcing', 10, 290);
      doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: 'right' });
    }

    doc.save('UPS_Optimization_Results.pdf');
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!summary || !results || results.length === 0) {
      return;
    }

    setIsExporting(true);

    // Prepare data for Excel
    const excelData = [];
    
    // Order information
    if (orderInfo && Object.values(orderInfo).some(value => value)) {
      excelData.push(['Order Information', '']);
      if (orderInfo.factory) excelData.push(['Factory', orderInfo.factory]);
      if (orderInfo.po) excelData.push(['PO', orderInfo.po]);
      if (orderInfo.job) excelData.push(['Job', orderInfo.job]);
      if (orderInfo.brand) excelData.push(['Brand', orderInfo.brand]);
      if (orderInfo.item) excelData.push(['Item', orderInfo.item]);
      excelData.push(['', '']);
    }
    
    // Summary
    excelData.push(
      ['Metric', 'Value', 'Metric', 'Value'],
      ['No. of UPS', summary.upsCapacity, 'Total Sheets', summary.totalSheets],
      ['Total Plates', summary.totalPlates, 'Required Order Qty', summary.totalItems],
      ['Qty Produced', summary.totalProduced, 'Excess Qty', summary.totalExcess],
      ['Excess %', `${summary.wastePercentage}%`, '', ''],
      ['', '', '', '']
    );
    
    // Results headers
    // const headers = ['Color', 'Size', 'Required Qty', 'Plate', 'UPS', 'Sheets', 'Qty Produced', 'Excess Qty'];
    const optionalColumns = ['ITEM_DESCRIPTION', 'ITEM_CODE', 'PRICE', 'EP_NO', 'RUN', 'SHEET'];
    const existingOptionalColumns = optionalColumns.filter(col => 
      results.some(result => result[col as keyof OptimizationResult])
    );
    // headers.push(...existingOptionalColumns.map(col => col.replace('_', ' ')));

    // Prepare headers: Optional first, then fixed ones
    const headers = [
      ...existingOptionalColumns.map(col => col.replace('_', ' ')), // Optional headers first
      'Color',
      'Size',
      'Required Qty',
      'Plate',
      'UPS',
      'Sheets',
      'Qty Produced',
      'Excess Qty'
    ];
    
    excelData.push(headers);
    
    // Results data
    excelData.push(...results.map((r, i) => {
      const isNewPlate = i === 0 || r.PLATE !== results[i - 1].PLATE;

      // Optional values first
      const optionalValues = existingOptionalColumns.map(col => r[col as keyof OptimizationResult] || '');
      // const fixedValues1 = [
      //   r.COLOR,
      //   r.SIZE,
      //   r.QTY,
      //   r.PLATE,
      //   r.OPTIMAL_UPS,
      //   isNewPlate ? r.SHEETS_NEEDED : '',
      //   r.QTY_PRODUCED,
      //   r.EXCESS,
      // ];
      
      // Fixed values
      const fixedValues1 = [
        r.COLOR,
        r.SIZE,
        r.QTY,
        r.PLATE,
        r.OPTIMAL_UPS,
        isNewPlate ? r.SHEETS_NEEDED : '',
        r.QTY_PRODUCED,
        r.EXCESS,
      ];

      // Combine both
      const rows = [...optionalValues, ...fixedValues1];

      return rows;
      // existingOptionalColumns.forEach(col => {
      //   const value = r[col as keyof OptimizationResult];
      //   row.push(value || '');
      // });
      
      // return row;
    }));

    // Create a worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UPS Optimization Report');

    // Export to Excel
    XLSX.writeFile(wb, 'UPS_Optimization_Results.xlsx');
    setIsExporting(false);
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={exportToPdf}
        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'PDF'}
      </button>

      <button
        onClick={exportToExcel}
        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
        ) : (
          <Table className="w-4 h-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Excel'}
      </button>
    </div>
  );
};

export default PdfExport;