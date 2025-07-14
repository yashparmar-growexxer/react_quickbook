import { useState, useEffect } from 'react';
import { Customer, Item } from '../types';
import { toast } from 'react-toastify';

interface InvoiceFormProps {
  initialData?: any;
  customers: Customer[];
  items: Item[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export default function InvoiceForm({
  initialData,
  customers,
  items,
  onSubmit,
  isSubmitting,
  isEditMode = false
}: InvoiceFormProps) {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      CustomerRef: { value: '', name: '' },
      TxnDate: new Date().toISOString().split('T')[0],
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Line: [],
      DocNumber: '',
      CustomerMemo: ''
    };
    return initialData || defaultData;
  });

  const [newLineItem, setNewLineItem] = useState({
    SalesItemLineDetail: {
      ItemRef: { value: '', name: '' },
      Qty: 1,
      UnitPrice: 0
    },
    Description: '',
    Amount: 0
  });

  const [errors, setErrors] = useState({
    customer: false,
    items: false
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData(initialData);
    }
  }, [initialData, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors = {
      customer: !formData.CustomerRef.value,
      items: formData.Line.length === 0
    };

    setErrors(newErrors);

    if (newErrors.customer || newErrors.items) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      CustomerRef: {
        value: formData.CustomerRef.value
      },
      Line: formData.Line.map((line: any) => ({
        ...line,
        Amount: line.SalesItemLineDetail.Qty * line.SalesItemLineDetail.UnitPrice
      }))
    };

    onSubmit(submissionData);
  };

  const addLineItem = () => {
    if (!newLineItem.SalesItemLineDetail.ItemRef.value) {
      setErrors(prev => ({ ...prev, items: true }));
      toast.error('Please select an item');
      return;
    }

    const selectedItem = items.find(item => item.Id === newLineItem.SalesItemLineDetail.ItemRef.value);
    const amount = newLineItem.SalesItemLineDetail.Qty * newLineItem.SalesItemLineDetail.UnitPrice;

    const newLine = {
      DetailType: 'SalesItemLineDetail',
      Amount: amount,
      Description: newLineItem.Description || selectedItem?.Name || '',
      SalesItemLineDetail: {
        ItemRef: {
          value: selectedItem?.Id || '',
          name: selectedItem?.Name || ''
        },
        Qty: newLineItem.SalesItemLineDetail.Qty,
        UnitPrice: newLineItem.SalesItemLineDetail.UnitPrice
      }
    };

    setFormData({
      ...formData,
      Line: [...formData.Line, newLine]
    });

    // Reset new line item form
    setNewLineItem({
      SalesItemLineDetail: {
        ItemRef: { value: '', name: '' },
        Qty: 1,
        UnitPrice: 0
      },
      Description: '',
      Amount: 0
    });

    setErrors(prev => ({ ...prev, items: false }));
  };

  const removeLineItem = (index: number) => {
    const updatedLines = [...formData.Line];
    updatedLines.splice(index, 1);
    setFormData({
      ...formData,
      Line: updatedLines
    });
  };

  const calculateTotal = () => {
    return formData.Line.reduce((total: number, line: any) => {
      return total + (line.SalesItemLineDetail.Qty * line.SalesItemLineDetail.UnitPrice);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer and Dates Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer*</label>
          <select
            value={formData.CustomerRef.value}
            onChange={(e) => {
              const selectedCustomer = customers.find(c => c.Id === e.target.value);
              setFormData({
                ...formData,
                CustomerRef: {
                  value: e.target.value,
                  name: selectedCustomer?.name || selectedCustomer?.DisplayName || ''
                }
              });
              setErrors(prev => ({ ...prev, customer: false }));
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.Id} value={customer.Id}>
                {customer.name || customer.DisplayName || `Customer ${customer.Id}`}
              </option>
            ))}
          </select>
          {errors.customer && (
            <p className="mt-1 text-sm text-red-600">Please select a customer</p>
          )}
        </div>

        {/* Transaction Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.TxnDate}
            onChange={(e) => setFormData({ ...formData, TxnDate: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={formData.DueDate}
            onChange={(e) => setFormData({ ...formData, DueDate: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      {/* Line Items Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        
        {/* Existing Line Items */}
        {formData.Line.map((line: any, index: number) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded bg-white">
            <div>
              <p className="font-medium">{line.Description}</p>
              <p className="text-sm text-gray-500">
                {line.SalesItemLineDetail.Qty} x ${line.SalesItemLineDetail.UnitPrice}
              </p>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-4">
                ${(line.SalesItemLineDetail.Qty * line.SalesItemLineDetail.UnitPrice).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add New Line Item Form */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Item*</label>
            <select
              value={newLineItem.SalesItemLineDetail.ItemRef.value}
              onChange={(e) => {
                const selectedItem = items.find(item => item.Id === e.target.value);
                setNewLineItem({
                  ...newLineItem,
                  SalesItemLineDetail: {
                    ...newLineItem.SalesItemLineDetail,
                    ItemRef: {
                      value: e.target.value,
                      name: selectedItem?.Name || ''
                    },
                    UnitPrice: selectedItem?.UnitPrice || 0
                  },
                  Description: selectedItem?.Name || ''
                });
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select an item</option>
              {items.map(item => (
                <option key={item.Id} value={item.Id}>
                  {item.Name} (${item.UnitPrice})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={newLineItem.SalesItemLineDetail.Qty}
              onChange={(e) => setNewLineItem({
                ...newLineItem,
                SalesItemLineDetail: {
                  ...newLineItem.SalesItemLineDetail,
                  Qty: parseInt(e.target.value) || 1
                }
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newLineItem.SalesItemLineDetail.UnitPrice}
              onChange={(e) => setNewLineItem({
                ...newLineItem,
                SalesItemLineDetail: {
                  ...newLineItem.SalesItemLineDetail,
                  UnitPrice: parseFloat(e.target.value) || 0
                }
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Customer Memo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Memo</label>
        <textarea
          value={formData.CustomerMemo}
          onChange={(e) => setFormData({ ...formData, CustomerMemo: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={3}
        />
      </div>

      {/* Total Amount */}
      <div className="text-right">
        <p className="text-lg font-medium">
          Total: ${calculateTotal().toFixed(2)}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? isEditMode ? 'Updating...' : 'Creating...'
            : isEditMode ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}