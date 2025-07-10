import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../services/api';
import PaymentList from '../components/PaymentList';
import { Payment } from '../types';
import Loading from '../components/Loading';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response :any= await paymentService.getAll();
        console.log(response.data.payments,'data')
        setPayments(response.data.payments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payments');
        setLoading(false);
        console.error('Error fetching payments:', err);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <Loading name="Payments" />;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Link
          to="/payments/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Payment
        </Link>
      </div>
      <PaymentList payments={payments} />
    </div>
  );
}