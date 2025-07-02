import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/api';
import CustomerList from '../components/CustomerList';
import { Customer } from '../types';
import Loading from '../components/Loading'; // Import the new Loading component

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getAll();
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customers');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <Loading name={"Customers"}  />; // Use the new Loading component
  
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        {/* <Link
          to="/customers/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Customer
        </Link> */}
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}