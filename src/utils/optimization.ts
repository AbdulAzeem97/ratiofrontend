import { CsvItem, OptimizationResult, OptimizationSummary, OptimizationResponse } from '../types/types';

// Backend API configuration
const BACKEND_URL = 'http://localhost:5000';
const BACKEND_TIMEOUT = 30000; // 30 seconds

// Frontend fallback optimization for small problems
class FrontendOptimizer {
  
  static calculateSheetsNeeded(qty: number, ups: number): number {
    return Math.ceil(qty / ups);
  }

  static generateUPSCombinations(totalUPS: number, itemCount: number, maxUPS: number): number[][] {
    const combinations: number[][] = [];
    
    const generate = (current: number[], remaining: number, index: number) => {
      if (index === itemCount) {
        if (remaining === 0) {
          combinations.push([...current]);
        }
        return;
      }
      
      const minUPS = 1;
      const maxPossible = Math.min(maxUPS, remaining - (itemCount - index - 1));
      
      for (let ups = minUPS; ups <= maxPossible; ups++) {
        current[index] = ups;
        generate(current, remaining - ups, index + 1);
        
        if (combinations.length > 10000) return;
      }
    };
    
    generate(new Array(itemCount), totalUPS, 0);
    return combinations;
  }

  static assignUPSProportional(group: { QTY: number }[], upsPerPlate: number): number[] {
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

  static calculatePlateSheets(group: { QTY: number }[], ups: number[]): number {
    return Math.max(...group.map((item, i) => Math.ceil(item.QTY / ups[i])));
  }

  static getPlateLabel(index: number): string {
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

  static initialBalancedPartition<T extends { QTY: number }>(items: T[], plateCount: number): T[][] {
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

  static optimizeWithPlates(
    items: CsvItem[],
    upsPerPlate: number,
    plateCount: number
  ): OptimizationResponse {
    if (plateCount < 1) throw new Error('Plate count must be at least 1');

    if (plateCount === 1) {
      const ups = this.assignUPSProportional(items, upsPerPlate);
      const sheets = this.calculatePlateSheets(items, ups);
      const plateLabel = this.getPlateLabel(0);

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

        // Add optional fields if they exist
        if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
        if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
        if (item.PRICE) result.PRICE = item.PRICE;
        if (item.RATIO) result.RATIO = item.RATIO;
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

    // Multi-plate optimization using balanced partition
    const initialPartition = this.initialBalancedPartition(items, plateCount);
    let totalSheets = 0;
    const allResults: OptimizationResult[] = [];

    for (let p = 0; p < initialPartition.length; p++) {
      const group = initialPartition[p];
      if (group.length === 0) continue;

      const ups = this.assignUPSProportional(group, upsPerPlate);
      const sheets = this.calculatePlateSheets(group, ups);
      totalSheets += sheets;

      const plateLabel = this.getPlateLabel(p);
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

        // Add optional fields if they exist
        if (item.ITEM_DESCRIPTION) result.ITEM_DESCRIPTION = item.ITEM_DESCRIPTION;
        if (item.ITEM_CODE) result.ITEM_CODE = item.ITEM_CODE;
        if (item.PRICE) result.PRICE = item.PRICE;
        if (item.RATIO) result.RATIO = item.RATIO;
        if (item.RUN) result.RUN = item.RUN;
        if (item.SHEET) result.SHEET = item.SHEET;

        allResults.push(result);
      });
    }

    const totalItems = items.reduce((sum, item) => sum + item.QTY, 0);
    const totalProduced = allResults.reduce((sum, r) => sum + r.QTY_PRODUCED, 0);
    const totalExcess = totalProduced - totalItems;
    const wastePercentage = totalProduced ? parseFloat(((totalExcess / totalProduced) * 100).toFixed(2)) : 0;

    return {
      results: allResults,
      summary: {
        totalSheets,
        totalProduced,
        totalExcess,
        wastePercentage,
        totalItems,
        upsCapacity: upsPerPlate,
        totalPlates: plateCount
      }
    };
  }
}

// Main optimization function with backend integration
export const optimizeUpsWithPlates = async (
  items: CsvItem[],
  upsPerPlate: number,
  plateCount: number
): Promise<OptimizationResponse> => {
  
  // Validate inputs
  if (!items || items.length === 0) {
    throw new Error('No items provided for optimization');
  }
  
  if (upsPerPlate <= 0 || plateCount <= 0) {
    throw new Error('Invalid UPS per plate or plate count');
  }
  
  // Filter out items with zero quantity
  const validItems = items.filter(item => item.QTY > 0);
  
  if (validItems.length === 0) {
    throw new Error('No items with positive quantity found');
  }
  
  // Determine whether to use backend or frontend optimization
  const useBackend = validItems.length >= 10 && plateCount > 1;
  
  if (useBackend) {
    try {
      console.log('🔄 Using backend optimization...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
      
      const response = await fetch(`${BACKEND_URL}/optimize-plates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: validItems,
          upsPerPlate,
          plateCount
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('✅ Backend optimization completed successfully');
      return {
        results: data.results,
        summary: data.summary
      };
      
    } catch (error) {
      console.warn('⚠️ Backend optimization failed, falling back to frontend:', error);
      return FrontendOptimizer.optimizeWithPlates(validItems, upsPerPlate, plateCount);
    }
  } else {
    console.log('🔄 Using frontend optimization...');
    return FrontendOptimizer.optimizeWithPlates(validItems, upsPerPlate, plateCount);
  }
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