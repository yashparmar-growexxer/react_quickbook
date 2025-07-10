import { useState, useEffect } from 'react';
import { Customer, Item } from '../types';
import { invoiceService } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate
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
  console.log(formData, "formdata")

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
    item: false
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...initialData,
        CustomerRef: initialData.CustomerRef || { value: '', name: '' },
        Line: initialData.lineItems?.map((item: any) => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount,
          Description: item.description,
          SalesItemLineDetail: {
            ItemRef: {
              value: item.itemId,
              name: items.find(i => i.Id === item.itemId)?.Name || item.description
            },
            Qty: item.quantity,
            UnitPrice: item.unitPrice
          }
        })) || []
      });

      // Pre-fill the first item in edit mode (if exists)
      if (initialData.lineItems?.length > 0) {
        const firstItem = initialData.lineItems[0];
        setNewLineItem({
          SalesItemLineDetail: {
            ItemRef: {
              value: firstItem.itemId,
              name: items.find(i => i.Id === firstItem.itemId)?.Name || firstItem.description
            },
            Qty: firstItem.quantity,
            UnitPrice: firstItem.unitPrice
          },
          Description: firstItem.description,
          Amount: firstItem.amount
        });
      }
    }
  }, [initialData, isEditMode, items]);

  // useEffect(() => {
  //   if (isEditMode && initialData) {
  //     setFormData({
  //       ...initialData,
  //       CustomerRef: initialData.CustomerRef || { value: '', name: '' },
  //       Line: initialData.lineItems?.map((item: any) => ({
  //         DetailType: 'SalesItemLineDetail',
  //         Amount: item.amount,
  //         Description: item.description,
  //         SalesItemLineDetail: {
  //           ItemRef: {
  //             value: item.itemId,
  //             name: items.find(i => i.Id === item.itemId)?.Name || item.description
  //           },
  //           Qty: item.quantity,
  //           UnitPrice: item.unitPrice
  //         }
  //       })) || []
  //     });
  //   }
  // }, [initialData, isEditMode, items]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {
      customer: !formData.CustomerRef?.value,
      item: formData.Line.length === 0
    };

    setErrors(newErrors);

    if (newErrors.customer || newErrors.item) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare the data for API
    const apiData = {
      CustomerRef: {
        value: formData.CustomerRef.value
      },
      TxnDate: formData.TxnDate,
      DueDate: formData.DueDate,
      Line: formData.Line.map((item: any) => ({
        DetailType: 'SalesItemLineDetail',
        Amount: item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice, // Calculate amount
        Description: item.Description,
        SalesItemLineDetail: {
          ItemRef: {
            value: item.SalesItemLineDetail.ItemRef.value
          },
          Qty: item.SalesItemLineDetail.Qty,
          UnitPrice: item.SalesItemLineDetail.UnitPrice
        }
      })),
      CustomerMemo: formData.CustomerMemo,
      // Include these only in edit mode
      ...(isEditMode && initialData && {
        Id: initialData.Id,
        SyncToken: initialData.SyncToken || '0'
      })
    };

    onSubmit(apiData);
  };
  const addLineItem = () => {
    if (!newLineItem.SalesItemLineDetail.ItemRef.value) {
      setErrors(prev => ({ ...prev, item: true }));
      return;
    }

    const selectedItem = items.find(item => item.Id === newLineItem.SalesItemLineDetail.ItemRef.value);
    const amount = newLineItem.SalesItemLineDetail.Qty * newLineItem.SalesItemLineDetail.UnitPrice;

    const newLine = {
      DetailType: 'SalesItemLineDetail',
      Amount: amount,
      Description: newLineItem.Description || selectedItem?.Name,
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

    setNewLineItem({
      SalesItemLineDetail: {
        ItemRef: { value: '', name: '' },
        Qty: 1,
        UnitPrice: 0
      },
      Description: '',
      Amount: 0
    });

    setErrors(prev => ({ ...prev, item: false }));
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
    return formData.Line.reduce((sum: number, item: any) => sum + item.Amount, 0);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Customer and Date Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer*</label>
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
            required
          >
            <option value="">Select an item</option>
            {items.map(item => (
              <option
                key={item.Id}
                value={item.Id}
                selected={isEditMode && newLineItem.SalesItemLineDetail.ItemRef.value === item.Id}
              >
                {item.Name} (${item.UnitPrice})
              </option>
            ))}
          </select>
          {errors.customer && (
            <p className="mt-1 text-sm text-red-600">Customer is required</p>
          )}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={formData.DueDate}
            onChange={(e) => setFormData({
              ...formData,
              DueDate: e.target.value
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      {/* Line Items Section */}
      {/* Line Items List */}
      <div className="space-y-2">
        {formData?.Line?.map((item: any, index: number) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded bg-white">
            <div>
              <p className="font-medium">{item.Description}</p>
              <p className="text-sm text-gray-500">
                {item.SalesItemLineDetail?.Qty} x ${item.SalesItemLineDetail?.UnitPrice}
              </p>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-4">
                ${(item.SalesItemLineDetail?.Qty * item.SalesItemLineDetail?.UnitPrice).toFixed(2)}
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
      </div>

      {/* Customer Memo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Memo</label>
        <textarea
          value={formData?.CustomerMemo}
          onChange={(e) => setFormData({
            ...formData,
            CustomerMemo: e.target.value
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={3}
        />
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