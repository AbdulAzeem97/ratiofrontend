import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Building } from 'lucide-react';

interface OrderInfoFormProps {
  orderInfo: {
    factory?: string;
    po?: string;
    job?: string;
    brand?: string;
    item?: string;
  };
  onOrderInfoChange: (info: any) => void;
}

const OrderInfoForm: React.FC<OrderInfoFormProps> = ({ orderInfo, onOrderInfoChange }) => {
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onOrderInfoChange({
      ...orderInfo,
      [field]: value
    });
  };

  const filledFields = Object.values(orderInfo).filter(v => v).length;

  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center">
          <Building className="w-4 h-4 mr-2 text-orange-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Order Information
          </span>
          {filledFields > 0 && (
            <span className="ml-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-bold shadow-sm">
              {filledFields}/5
            </span>
          )}
        </div>
        <div className="transition-transform duration-200 group-hover:scale-110">
          {showForm ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {showForm && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Factory</label>
              <input
                type="text"
                value={orderInfo.factory || ''}
                onChange={(e) => handleInputChange('factory', e.target.value)}
                placeholder="Factory name"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">PO Number</label>
              <input
                type="text"
                value={orderInfo.po || ''}
                onChange={(e) => handleInputChange('po', e.target.value)}
                placeholder="PO-12345"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Job ID</label>
              <input
                type="text"
                value={orderInfo.job || ''}
                onChange={(e) => handleInputChange('job', e.target.value)}
                placeholder="JOB-001"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Brand</label>
              <input
                type="text"
                value={orderInfo.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Brand name"
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Item Description</label>
            <input
              type="text"
              value={orderInfo.item || ''}
              onChange={(e) => handleInputChange('item', e.target.value)}
              placeholder="Product description"
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            />
          </div>
          
          {filledFields > 0 && (
            <div className="mt-3 p-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200/50 dark:border-orange-700/30">
              <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
                ✅ Order information will be included in exported reports
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderInfoForm;