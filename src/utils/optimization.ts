// import { CsvItem, OptimizationResult, OptimizationSummary, OptimizationResponse } from '../types/types';

// // Backend API configuration
// const BACKEND_URL = 'http://localhost:5000';
// const BACKEND_TIMEOUT = 30000; // 30 seconds

// // Frontend fallback optimization for small problems
// class FrontendOptimizer {
  
//   static calculateSheetsNeeded(qty: number, ups: number): number {
//     return Math.ceil(qty / ups);
//   }

//   static generateUPSCombinations(totalUPS: number, itemCount: number, maxUPS: number): number[][] {
//     const combinations: number[][] = [];
    
//     const generate = (current: number[], remaining: number, index: number) => {
//       if (index === itemCount) {
//         if (remaining === 0) {
//           combinations.push([...current]);
//         }
//         return;
//       }
      
//       const minUPS = 1;
//       const maxPossible = Math.min(maxUPS, remaining - (itemCount - index - 1));
      
//       for (let ups = minUPS; ups <= maxPossible; ups++) {
//         current[index] = ups;
//         generate(current, remaining - ups, index + 1);
        
//         if (combinations.length > 10000) return;
//       }
//     };
    
//     generate(new Array(itemCount), totalUPS, 0);
//     return combinations;
//   }

//   static assignUPSProportional(group: { QTY: number }[], upsPerPlate: number): number[] {
//     const totalQty = group.reduce((sum, item) => sum + item.QTY, 0);
//     let raw = group.map(item => Math.max(1, Math.round((item.QTY / totalQty) * upsPerPlate)));

//     while (raw.reduce((a, b) => a + b, 0) < upsPerPlate) {
//       const minIndex = raw.indexOf(Math.min(...raw));
//       raw[minIndex]++;
//     }
//     while (raw.reduce((a, b) => a + b, 0) > upsPerPlate) {
//       const maxIndex = raw.indexOf(Math.max(...raw));
//       if (raw[maxIndex] > 1) raw[maxIndex]--;
//       else break;
//     }
//     return raw;
//   }

//   static calculatePlateSheets(group: { QTY: number }[], ups: number[]): number {
//     return Math.max(...group.map((item, i) => Math.ceil(item.QTY / ups[i])));
//   }

//   static getPlateLabel(index: number): string {
//     const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let label = '';
//     index += 1;
//     while (index > 0) {
//       index -= 1;
//       label = letters[index % 26] + label;
//       index = Math.floor(index / 26);
//     }
//     return label;
//   }

//   static initialBalancedPartition<T extends { QTY: number }>(items: T[], plateCount: number): T[][] {
//     const plates: T[][] = Array.from({ length: plateCount }, () => []);
//     const plateLoads: number[] = Array.from({ length: plateCount }, () => 0);
//     const sorted = [...items].sort((a, b) => b.QTY - a.QTY);

//     for (const item of sorted) {
//       const lightestPlate = plateLoads.indexOf(Math.min(...plateLoads));
//       plates[lightestPlate].push(item);
//       plateLoads[lightestPlate] += item.QTY;
//     }

//     return plates;
//   }

//   static optimizeWithPlates(
//     items: CsvItem[],
//     upsPerPlate: number,
//     plateCount: number
//   ): OptimizationResponse {
//     if (plateCount < 1) throw new Error('Plate count must be at least 1');

//     if (plateCount === 1) {
//       const ups = this.assignUPSProportional(items, upsPerPlate);
//       const sheets = this.calculatePlateSheets(items, ups);
//       const plateLabel = this.getPlateLabel(0);

//       const results: OptimizationResult[] = items.map((item, i) => {
//         const produced = ups[i] * sheets;
//         const result: OptimizationResult = {
//           COLOR: item.COLOR,
//           SIZE: item.SIZE,
//           QTY: item.QTY,
//           PLATE: plateLabel,
//           OPTIMAL_UPS: ups[i],
//           SHEETS_NEEDED: sheets,
//           QTY_PRODUCED: produced,
//           EXCESS: produced - item.QTY
//         };

//         // Add optional fields if they exist
//         if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
//         if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
//         if (item.PRICE) result.PRICE = item.PRICE;
//         if (item.RATIO) result.RATIO = item.RATIO;
//         if (item.RUN) result.RUN = item.RUN;
//         if (item.SHEET) result.SHEET = item.SHEET;

//         return result;
//       });

//       const totalItems = items.reduce((sum, item) => sum + item.QTY, 0);
//       const totalProduced = sheets * upsPerPlate;
//       const totalExcess = totalProduced - totalItems;
//       const wastePercentage = totalProduced ? parseFloat(((totalExcess / totalProduced) * 100).toFixed(2)) : 0;

//       return {
//         results,
//         summary: {
//           totalSheets: sheets,
//           totalProduced,
//           totalExcess,
//           wastePercentage,
//           totalItems,
//           upsCapacity: upsPerPlate,
//           totalPlates: 1
//         }
//       };
//     }

//     // Multi-plate optimization using balanced partition
//     const initialPartition = this.initialBalancedPartition(items, plateCount);
//     let totalSheets = 0;
//     const allResults: OptimizationResult[] = [];

//     for (let p = 0; p < initialPartition.length; p++) {
//       const group = initialPartition[p];
//       if (group.length === 0) continue;

//       const ups = this.assignUPSProportional(group, upsPerPlate);
//       const sheets = this.calculatePlateSheets(group, ups);
//       totalSheets += sheets;

//       const plateLabel = this.getPlateLabel(p);
//       group.forEach((item, i) => {
//         const produced = ups[i] * sheets;
//         const result: OptimizationResult = {
//           COLOR: item.COLOR,
//           SIZE: item.SIZE,
//           QTY: item.QTY,
//           PLATE: plateLabel,
//           OPTIMAL_UPS: ups[i],
//           SHEETS_NEEDED: sheets,
//           QTY_PRODUCED: produced,
//           EXCESS: produced - item.QTY
//         };

//         // Add optional fields if they exist
//         if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
//         if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
//         if (item.PRICE) result.PRICE = item.PRICE;
//         if (item.RATIO) result.RATIO = item.RATIO;
//         if (item.RUN) result.RUN = item.RUN;
//         if (item.SHEET) result.SHEET = item.SHEET;

//         allResults.push(result);
//       });
//     }

//     const totalItems = items.reduce((sum, item) => sum + item.QTY, 0);
//     const totalProduced = allResults.reduce((sum, r) => sum + r.QTY_PRODUCED, 0);
//     const totalExcess = totalProduced - totalItems;
//     const wastePercentage = totalProduced ? parseFloat(((totalExcess / totalProduced) * 100).toFixed(2)) : 0;

//     return {
//       results: allResults,
//       summary: {
//         totalSheets,
//         totalProduced,
//         totalExcess,
//         wastePercentage,
//         totalItems,
//         upsCapacity: upsPerPlate,
//         totalPlates: plateCount
//       }
//     };
//   }
// }

// // Main optimization function with backend integration
// export const optimizeUpsWithPlates = async (
//   items: CsvItem[],
//   upsPerPlate: number,
//   plateCount: number
// ): Promise<OptimizationResponse> => {
  
//   // Validate inputs
//   if (!items || items.length === 0) {
//     throw new Error('No items provided for optimization');
//   }
  
//   if (upsPerPlate <= 0 || plateCount <= 0) {
//     throw new Error('Invalid UPS per plate or plate count');
//   }
  
//   // Filter out items with zero quantity
//   const validItems = items.filter(item => item.QTY > 0);
  
//   if (validItems.length === 0) {
//     throw new Error('No items with positive quantity found');
//   }
  
//   // Determine whether to use backend or frontend optimization
//   const useBackend = validItems.length >= 10 && plateCount > 1;
  
//   if (useBackend) {
//     try {
//       console.log('🔄 Using backend optimization...');
      
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
      
//       const response = await fetch(`${BACKEND_URL}/optimize-plates`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           tags: validItems,
//           upsPerPlate,
//           plateCount
//         }),
//         signal: controller.signal
//       });
      
//       clearTimeout(timeoutId);
      
//       if (!response.ok) {
//         throw new Error(`Backend error: ${response.status} ${response.statusText}`);
//       }
      
//       const data = await response.json();
      
//       if (data.error) {
//         throw new Error(data.error);
//       }
      
//       console.log('✅ Backend optimization completed successfully');
//       return {
//         results: data.results,
//         summary: data.summary
//       };
      
//     } catch (error) {
//       console.warn('⚠️ Backend optimization failed, falling back to frontend:', error);
//       return FrontendOptimizer.optimizeWithPlates(validItems, upsPerPlate, plateCount);
//     }
//   } else {
//     console.log('🔄 Using frontend optimization...');
//     return FrontendOptimizer.optimizeWithPlates(validItems, upsPerPlate, plateCount);
//   }
// };

// // Health check function
// export const checkBackendHealth = async (): Promise<boolean> => {
//   try {
//     const response = await fetch(`${BACKEND_URL}/`, {
//       method: 'GET'
//     });
//     return response.ok;
//   } catch {
//     return false;
//   }
// };

import { OptimizationResult, OptimizationSummary, CsvItem } from '../types/types';

function generateKGroupCombinations<T>(items: T[], k: number): T[][][] {
  const result: T[][][] = [];

  function helper(start: number, groups: T[][]) {
    if (start === items.length) {
      if (groups.length === k) {
        result.push(groups.map(group => [...group]));
      }
      return;
    }

    const item = items[start];

    for (let i = 0; i < groups.length; i++) {
      groups[i].push(item);
      helper(start + 1, groups);
      groups[i].pop();
    }

    if (groups.length < k) {
      groups.push([item]);
      helper(start + 1, groups);
      groups.pop();
    }
  }

  helper(0, []);
  return result;
}

function assignUPSProportional(group: { QTY: number }[], upsPerPlate: number): number[] {
  const totalQty = group.reduce((sum, item) => sum + item.QTY, 0);
  let raw = group.map(item => Math.max(1, Math.round((item.QTY / totalQty) * upsPerPlate)));

  while (raw.reduce((a, b) => a + b, 0) < upsPerPlate) {
    const minIndex = raw.indexOf(Math.min(...raw));
    raw[minIndex]++;
  }
  while (raw.reduce((a, b) => a + b, 0) > upsPerPlate) {
    const maxIndex = raw.indexOf(Math.max(...raw));
    if (raw[maxIndex] > 1) raw[maxIndex]--;
    else break;
  }
  return raw;
}

function calculatePlateSheets(group: { QTY: number }[], ups: number[]): number {
  return Math.max(...group.map((item, i) => Math.ceil(item.QTY / ups[i])));
}

function getPlateLabel(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let label = '';
  index += 1;
  while (index > 0) {
    index -= 1;
    label = letters[index % 26] + label;
    index = Math.floor(index / 26);
  }
  return label;
}

function initialBalancedPartition<T extends { QTY: number }>(items: T[], plateCount: number): T[][] {
  const plates: T[][] = Array.from({ length: plateCount }, () => []);
  const plateLoads: number[] = Array.from({ length: plateCount }, () => 0);
  const sorted = [...items].sort((a, b) => b.QTY - a.QTY);

  for (const item of sorted) {
    const lightestPlate = plateLoads.indexOf(Math.min(...plateLoads));
    plates[lightestPlate].push(item);
    plateLoads[lightestPlate] += item.QTY;
  }

  return plates;
}

const BACKEND_URL = 'http://192.168.2.57:5200';

export const optimizeUpsWithPlates = async (
  items: CsvItem[],
  upsPerPlate: number,
  plateCount: number
): Promise<{ results: OptimizationResult[]; summary: OptimizationSummary }> => {
  if (plateCount < 1) throw new Error('Plate count must be at least 1');

  const useBackend = items.length >= 10 && plateCount > 1;

  if (useBackend) {
    try {
      const startResponse = await fetch(`${BACKEND_URL}/optimize-plates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: items,
          upsPerPlate,
          plateCount
        })
      });

      if (!startResponse.ok) throw new Error(`Backend error: ${startResponse.statusText}`);

      const { task_id } = await startResponse.json();

      const pollInterval = 5000;
      const maxWaitTime = 30 * 60 * 1000;
      const startTime = Date.now();

      while (true) {
        const statusResponse = await fetch(`${BACKEND_URL}/task-status/${task_id}`);
        if (!statusResponse.ok) throw new Error('Failed to check task status');
        const statusData = await statusResponse.json();

        if (statusResponse.status === 200 && statusData.results) {
          return {
            results: statusData.results,
            summary: statusData.summary
          };
        }

        if (Date.now() - startTime > maxWaitTime) {
          throw new Error('Backend optimization timed out');
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    } catch (error) {
      console.error('Backend optimization failed:', error);
      throw new Error('Failed to optimize using backend.');
    }
  }

  // ✅ Now frontend fallback using your logic
  if (plateCount === 1) {
    const ups = assignUPSProportional(items, upsPerPlate);
    const sheets = calculatePlateSheets(items, ups);
    const plateLabel = getPlateLabel(0);

    const results: OptimizationResult[] = items.map((item, i) => {
      const produced = ups[i] * sheets;
      const result: OptimizationResult = {
        COLOR: item.COLOR,
        SIZE: item.SIZE,
        QTY: item.QTY,
        PLATE: plateLabel,
        OPTIMAL_UPS: ups[i],
        SHEETS_NEEDED: sheets,
        QTY_PRODUCED: produced,
        EXCESS: produced - item.QTY
      };

      // Add CEO optional fields
      if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
      if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
      if (item.PRICE) result.PRICE = item.PRICE;
      if (item.EP_NO) result.EP_NO = item.EP_NO;
      if (item.RUN) result.RUN = item.RUN;
      if (item.SHEET) result.SHEET = item.SHEET;

      return result;
    });

    const totalItems = items.reduce((sum, item) => sum + item.QTY, 0);
    const totalProduced = sheets * upsPerPlate;
    const totalExcess = totalProduced - totalItems;
    const wastePercentage = totalProduced ? parseFloat(((totalExcess / totalProduced) * 100).toFixed(2)) : 0;

    return {
      results,
      summary: {
        totalSheets: sheets,
        totalProduced,
        totalExcess,
        wastePercentage,
        totalItems,
        upsCapacity: upsPerPlate,
        totalPlates: 1
      }
    };
  }

  // ✅ Plate combination optimization
  const combinations = generateKGroupCombinations(items, plateCount);
  let bestTotalSheets = Infinity;
  let bestResult: OptimizationResult[] = [];

  const initialPartition = initialBalancedPartition(items, plateCount);
  let initialEstimate = 0;
  const initialResult: OptimizationResult[] = [];

  for (let p = 0; p < initialPartition.length; p++) {
    const group = initialPartition[p];
    const ups = assignUPSProportional(group, upsPerPlate);
    const sheets = calculatePlateSheets(group, ups);
    initialEstimate += sheets;

    const plateLabel = getPlateLabel(p);
    group.forEach((item, i) => {
      const produced = ups[i] * sheets;
      const result: OptimizationResult = {
        COLOR: item.COLOR,
        SIZE: item.SIZE,
        QTY: item.QTY,
        PLATE: plateLabel,
        OPTIMAL_UPS: ups[i],
        SHEETS_NEEDED: sheets,
        QTY_PRODUCED: produced,
        EXCESS: produced - item.QTY
      };

      if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
      if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
      if (item.PRICE) result.PRICE = item.PRICE;
      if (item.EP_NO) result.EP_NO = item.EP_NO;
      if (item.RUN) result.RUN = item.RUN;
      if (item.SHEET) result.SHEET = item.SHEET;

      initialResult.push(result);
    });
  }

  bestTotalSheets = initialEstimate;
  bestResult = initialResult;

  for (const plateGroups of combinations) {
    if (plateGroups.some(group => group.length > upsPerPlate)) continue;

    let valid = true;
    const groupUPS: number[][] = [];
    const groupSheets: number[] = [];
    let totalSheets = 0;

    for (const group of plateGroups) {
      const ups = assignUPSProportional(group, upsPerPlate);
      const sheets = calculatePlateSheets(group, ups);
      groupUPS.push(ups);
      groupSheets.push(sheets);
      totalSheets += sheets;

      if (totalSheets >= bestTotalSheets) {
        valid = false;
        break;
      }
    }
    if (!valid) continue;

    bestTotalSheets = totalSheets;
    const results: OptimizationResult[] = [];

    for (let p = 0; p < plateGroups.length; p++) {
      const group = plateGroups[p];
      const ups = groupUPS[p];
      const sheets = groupSheets[p];
      const plateLabel = getPlateLabel(p);

      group.forEach((item, i) => {
        const produced = ups[i] * sheets;
        const result: OptimizationResult = {
          COLOR: item.COLOR,
          SIZE: item.SIZE,
          QTY: item.QTY,
          PLATE: plateLabel,
          OPTIMAL_UPS: ups[i],
          SHEETS_NEEDED: sheets,
          QTY_PRODUCED: produced,
          EXCESS: produced - item.QTY
        };

        if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
        if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
        if (item.PRICE) result.PRICE = item.PRICE;
        if (item.EP_NO) result.EP_NO = item.EP_NO;
        if (item.RUN) result.RUN = item.RUN;
        if (item.SHEET) result.SHEET = item.SHEET;

        results.push(result);
      });
    }

    bestResult = results;
  }

  const totalSheets = (() => {
    const seenPlates = new Set<string>();
    let total = 0;

    for (const r of bestResult) {
      if (seenPlates.has(r.PLATE)) continue;

      seenPlates.add(r.PLATE);
      const plateItems = bestResult.filter(item => item.PLATE === r.PLATE);
      const maxSheetsForPlate = Math.max(...plateItems.map(item => item.SHEETS_NEEDED));
      total += maxSheetsForPlate;
    }

    return total;
  })();

  const totalItems = items.reduce((sum, item) => sum + item.QTY, 0);
  const totalProduced = bestResult.reduce((sum, r) => sum + r.QTY_PRODUCED, 0);
  const totalExcess = totalProduced - totalItems;
  const wastePercentage = totalProduced ? parseFloat(((totalExcess / totalProduced) * 100).toFixed(2)) : 0;

  const summary: OptimizationSummary = {
    totalSheets,
    totalProduced,
    totalExcess,
    wastePercentage,
    totalItems,
    upsCapacity: upsPerPlate,
    totalPlates: plateCount
  };

  return { results: bestResult, summary };
};

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/`, {
      method: 'GET'
    });
    return response.ok;
  } catch {
    return false;
  }
};