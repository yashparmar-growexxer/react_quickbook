import { useState } from 'react';
import { Customer, Item } from '../types';

interface InvoiceFormProps {
  initialData?: any;
  customers: Customer[];
  items: Item[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function InvoiceForm({
  initialData,
  customers,
  items,
  onSubmit,
  isSubmitting
}: InvoiceFormProps) {
  const [formData, setFormData] = useState(initialData || {
    CustomerRef: { value: '' },
    TxnDate: new Date().toISOString().split('T')[0],
    Line: []
  });

  const [newLineItem, setNewLineItem] = useState({
    SalesItemLineDetail: {
      ItemRef: { value: '' },
      Qty: 1,
      UnitPrice: 0
    },
    Description: '',
    Amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Line.length === 0) {
      alert('Please add at least one line item');
      return;
    }
    onSubmit(formData);
  };

  const addLineItem = () => {
    if (!newLineItem.SalesItemLineDetail.ItemRef.value) {
      alert('Please select an item');
      return;
    }
    
    const selectedItem = items.find(item => item.Id === newLineItem.SalesItemLineDetail.ItemRef.value);
    const amount = newLineItem.SalesItemLineDetail.Qty * newLineItem.SalesItemLineDetail.UnitPrice;

    const newLine = {
      DetailType: 'SalesItemLineDetail',
      Amount: amount,
      Description: newLineItem.Description || selectedItem?.Name,
      SalesItemLineDetail: {
        ItemRef: { value: selectedItem?.Id, name: selectedItem?.Name },
        Qty: newLineItem.SalesItemLineDetail.Qty,
        UnitPrice: newLineItem.SalesItemLineDetail.UnitPrice
      }
    };

    setFormData({
      ...formData,
      Line: [...formData.Line, newLine]
    });

    // Reset the form for new line item
    setNewLineItem({
      SalesItemLineDetail: {
        ItemRef: { value: '' },
        Qty: 1,
        UnitPrice: 0
      },
      Description: '',
      Amount: 0
    });
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
    return formData.Line.reduce((sum: number, item: any) => sum + item.Amount, 0).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select
            value={formData?.CustomerRef?.value}
            onChange={(e) => setFormData({
              ...formData,
              CustomerRef: { value: e.target.value }
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.Id} value={customer.Id}>
                {customer.DisplayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.TxnDate}
            onChange={(e) => setFormData({
              ...formData,
              TxnDate: e.target.value
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Item</label>
            <select
              value={newLineItem.SalesItemLineDetail.ItemRef.value}
              onChange={(e) => {
                const selectedItem = items.find(item => item.Id === e.target.value);
                setNewLineItem({
                  ...newLineItem,
                  SalesItemLineDetail: {
                    ...newLineItem.SalesItemLineDetail,
                    ItemRef: { value: e.target.value },
                    UnitPrice: selectedItem?.UnitPrice || 0
                  },
                  Description: selectedItem?.Name || ''
                });
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select an item</option>
              {items.map(item => (
                <option key={item.Id} value={item.Id}>
                  {item.Name} (${item.UnitPrice?.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qty</label>
            <input
              type="number"
              min="1"
              value={newLineItem.SalesItemLineDetail.Qty}
              onChange={(e) => {
                const qty = parseInt(e.target.value) || 0;
                setNewLineItem({
                  ...newLineItem,
                  SalesItemLineDetail: {
                    ...newLineItem.SalesItemLineDetail,
                    Qty: qty
                  },
                  Amount: qty * newLineItem.SalesItemLineDetail.UnitPrice
                });
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newLineItem.SalesItemLineDetail.UnitPrice}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setNewLineItem({
                  ...newLineItem,
                  SalesItemLineDetail: {
                    ...newLineItem.SalesItemLineDetail,
                    UnitPrice: price
                  },
                  Amount: newLineItem.SalesItemLineDetail.Qty * price
                });
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Item
            </button>
          </div>
        </div>

        {newLineItem.SalesItemLineDetail.ItemRef.value && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">
                {newLineItem.Description || items.find(i => i.Id === newLineItem.SalesItemLineDetail.ItemRef.value)?.Name}
              </span>
              <span className="font-medium">
                ${newLineItem.Amount.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {newLineItem.SalesItemLineDetail.Qty} x ${newLineItem.SalesItemLineDetail.UnitPrice.toFixed(2)}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {formData.Line.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded bg-white">
              <div>
                <p className="font-medium">{item.Description}</p>
                <p className="text-sm text-gray-500">
                  {item.SalesItemLineDetail.Qty} x ${item.SalesItemLineDetail.UnitPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-4">${item.Amount.toFixed(2)}</span>
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
        </div>

        {formData.Line.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <div className="text-xl font-bold">
              Total: ${calculateTotal()}
            </div>
          </div>
        )}
      </div>

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
          disabled={isSubmitting || formData.Line.length === 0}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  );
}