import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { paymentService } from '../services/api';
import { Payment } from '../types';
import Loading from '../components/Loading';

export default function PaymentViewPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate= useNavigate()

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response:any = await paymentService.getById(id!);
        setPayment(response.data);
      } catch (err) {
        setError('Failed to fetch payment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  if (loading) return <Loading name="Payment" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!payment) return <div className="p-4">Payment not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
         <div className="mb-6 flex justify-between items-start">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Payments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-500">Payment #{payment.paymentRefNum || 'N/A'}</p>
        </div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <p className="text-gray-500">Payment #{payment.paymentRefNum || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <div className="mt-2 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Payment ID</span>
                <span className="text-sm text-gray-900">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(payment.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${payment.unappliedAmount === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {payment.unappliedAmount === 0 ? 'Fully Applied' : 'Partially Applied'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900">Customer</h2>
            <div className="mt-2 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <span className="text-sm text-gray-900">{payment.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Customer ID</span>
                <span className="text-sm text-gray-900">{payment.customer.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900"> </h2>
            <div className="mt-2 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Amount</span>
                <span className="text-sm text-gray-900">
                  ${payment.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Unapplied Amount</span>
                <span className="text-sm text-gray-900">
                  ${payment.unappliedAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Payment Method</span>
                <span className="text-sm text-gray-900">
                  {payment.paymentMethod.name}
                </span>
              </div>
            </div>
          </div>

          {payment.appliedInvoices?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">Applied Invoices</h2>
              <div className="mt-2 border-t border-gray-200 pt-4 space-y-2">
                {payment.appliedInvoices.map((invoice) => (
                  <div key={invoice.invoiceId} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Invoice {invoice.invoiceDocNumber || invoice.invoiceId}
                    </span>
                    <span className="text-sm text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}