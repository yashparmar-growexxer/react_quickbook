import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { paymentService, invoiceService } from '../services/api';
import { Payment, Invoice } from '../types';
import Loading from '../components/Loading';

export default function PaymentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    paymentRefNum: '',
    totalAmount: 0,
    unappliedAmount: 0,
    date: '',
    paymentMethodId: '1',
    appliedInvoices: [] as Array<{ invoiceId: string; amount: number }>
  });

  // Fetch payment and invoices data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentResponse:any = await paymentService.getById(id!);
        setPayment(paymentResponse.data);
        
        const invoicesResponse = await invoiceService.getAll({ 
          customerId: paymentResponse.data.customer.id,
          status: 'open'
        });
        setInvoices(invoicesResponse.data.invoices);

        setFormData({
          paymentRefNum: paymentResponse.data.paymentRefNum || '',
          totalAmount: paymentResponse.data.totalAmount,
          unappliedAmount: paymentResponse.data.unappliedAmount,
          date: paymentResponse.data.date.split('T')[0],
          paymentMethodId: paymentResponse.data.paymentMethod.id,
          appliedInvoices: paymentResponse.data.appliedInvoices || []
        });
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Amount') ? parseFloat(value)  : value
    }));
  };

  const handleInvoiceChange = (invoiceId: string, amount: number) => {
    setFormData(prev => {
      const updatedInvoices = prev.appliedInvoices.some(i => i.invoiceId === invoiceId)
        ? prev.appliedInvoices.map(i => i.invoiceId === invoiceId ? { ...i, amount } : i)
        : [...prev.appliedInvoices, { invoiceId, amount }];
      
      const totalApplied = updatedInvoices.reduce((sum, i) => sum + i.amount, 0);
      const unappliedAmount = Math.max(0, prev.totalAmount - totalApplied);

      return {
        ...prev,
        appliedInvoices: updatedInvoices,
        unappliedAmount
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validate total applied amount
      const totalApplied = formData.appliedInvoices.reduce((sum, i) => sum + i.amount, 0);
      if (totalApplied > formData.totalAmount) {
        throw new Error('Total applied amount cannot exceed payment amount');
      }

      // Prepare update payload
      const updatePayload = {
        Id: id!,
        SyncToken: payment?.syncToken || '0',
        sparse: true,
        PaymentRefNum: formData.paymentRefNum,
        TotalAmt: formData.totalAmount,
        UnappliedAmt: formData.unappliedAmount,
        TxnDate: formData.date,
        PaymentMethodRef: { value: formData.paymentMethodId },
        Line: formData.appliedInvoices.map(invoice => ({
          Amount: invoice.amount,
          LinkedTxn: [{ TxnId: invoice.invoiceId, TxnType: 'Invoice' }]
        }))
      };

      console.log('Submitting payment update:', updatePayload); // Debug log

      // Submit to QuickBooks
      const response = await paymentService.update(id!, updatePayload);
      console.log('Update successful:', response.data); // Debug log
      
      navigate(`/payments/${id}`, { state: { success: true } });
    } catch (err:any) {
      console.error('Update failed:', err.response?.data || err.message);
      setError(err.response?.data?.Fault?.Error?.[0]?.Message || 
               err.message || 
               'Failed to update payment');
    }
  };

  if (loading) return <Loading name="Payment" />;
  if (!payment) return <div className="p-4">Payment not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Payment
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
        <p className="text-gray-500">Payment ID: {payment.id}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <div className="text-red-700 font-medium">{error}</div>
          {error.includes('Amount Received') && (
            <p className="mt-2 text-sm text-red-600">
              Tip: Ensure the total payment amount covers all applied invoices.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Details Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Reference #</label>
              <input
                type="text"
                name="paymentRefNum"
                value={formData.paymentRefNum}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                name="paymentMethodId"
                value={formData.paymentMethodId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Cash</option>
                <option value="2">Credit Card</option>
                <option value="3">Check</option>
              </select>
            </div>
          </div>

          {/* Amounts Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData?.totalAmount}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unapplied Amount</label>
              <input
                type="number"
                name="unappliedAmount"
                value={formData.unappliedAmount}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Invoice Application Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Apply to Invoices</h3>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Invoice #{invoice.docNumber}</p>
                    <p className="text-sm text-gray-500">
                      Amount: ${invoice.totalAmount.toFixed(2)} | 
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(invoice.balance, formData.totalAmount)}
                      step="0.01"
                      value={
                        formData.appliedInvoices.find(i => i.invoiceId === invoice.id)?.amount || 0
                      }
                      onChange={(e) => handleInvoiceChange(invoice.id, parseFloat(e.target.value) || 0)}
                      className="w-24 border border-gray-300 rounded-md px-2 py-1 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No open invoices found for this customer.</p>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">Total Applied:</span>
              <span className="font-medium">
                ${formData.appliedInvoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-medium">Unapplied Amount:</span>
              <span className="font-medium">${formData.unappliedAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/payments/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Payment
          </button>
        </div>
      </form>
    </div>
  );
}