// components/InvoiceDetail.tsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { invoiceService } from '../services/api';
import Loading from '../components/Loading';
import { Invoice } from '../types';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await invoiceService.getById(id!);
        setInvoice(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch invoice:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load invoice');
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) return <Loading name="invoice details" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <div className="mt-4 space-x-2">
          <Link 
            to="/invoices" 
            className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            Back to Invoices
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (!invoice) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.docNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(invoice.date).toLocaleDateString()} • Due {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/invoices/${invoice.id}/pdf`}
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Download PDF
          </Link>
          <Link
            to={`/invoices/${invoice.id}/send`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Send Invoice
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Invoice Summary
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">BILL TO</h4>
              <div className="text-sm text-gray-900">
                <p className="font-bold">{invoice.customer.name}</p>
                {invoice.billingAddress && (
                  <>
                    <p>{invoice.billingAddress.Line1}</p>
                    {invoice.billingAddress.Line2 && <p>{invoice.billingAddress.Line2}</p>}
                    <p>
                      {invoice.billingAddress.City}, {invoice.billingAddress.CountrySubDivisionCode} {invoice.billingAddress.PostalCode}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`text-sm font-medium ${
                  invoice.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {invoice.status} • ${invoice.balance.toFixed(2)} remaining
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  ${invoice.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Date Issued</span>
                <span className="text-sm text-gray-900">
                  {new Date(invoice.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Due Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Line Items
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.lineItems.filter((item: { quantity: any; }) => item.quantity).map((item:any, index:any) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description || `Item ${item.itemId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unitPrice?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Subtotal
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${invoice.totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Amount Paid
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${(invoice.totalAmount - invoice.balance).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  Balance Due
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${invoice.balance.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {invoice.customerMemo && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notes
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-700">{invoice.customerMemo}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Link
          to="/invoices"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Invoices
        </Link>
        <Link
          to={`/invoices/${invoice.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Edit Invoice
        </Link>
      </div>
    </div>
  );
}