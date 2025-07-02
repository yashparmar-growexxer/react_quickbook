import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import InvoiceList from '../components/InvoiceList';
import Loading from '../components/Loading';
import { Invoice, Customer } from '../types';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [invoicesResponse, customersResponse] = await Promise.all([
          invoiceService.getAll(),
          customerService.getAll()
        ]);

        const fetchedInvoices = invoicesResponse.data?.invoices || [];
        if (!Array.isArray(fetchedInvoices)) {
          throw new Error('Invoices data is not an array');
        }
        setInvoices(fetchedInvoices);

        const customersData = customersResponse.data?.customers || customersResponse.data || [];
        if (!Array.isArray(customersData)) {
          throw new Error('Customers data is not an array');
        }

        const customersMap = customersData.reduce(
          (map: Record<string, Customer>, customer: Customer) => {
            if (customer?.Id) {
              map[customer.Id] = {
                Id: customer.Id,
                name: customer.name || customer.DisplayName || `Customer ${customer.Id}`,
                DisplayName: customer.DisplayName || customer.name || `Customer ${customer.Id}`,
              };
            }
            return map;
          }, {}
        );
        setCustomers(customersMap);

        setLoading(false);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 
                err.message || 
                'Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhance invoices with customer data and apply filters
  const filteredInvoices = invoices
    .map(invoice => ({
      ...invoice,
      customerName: customers[invoice.customerId]?.name || 'Unknown Customer',
      status: invoice.balance === 0 ? 'PAID' as const : 'OPEN' as const
    }))
    .filter(invoice => {
      // Apply status filter
      const statusMatch = 
        filter === 'all' || 
        (filter === 'open' && invoice.status === 'OPEN') ||
        (filter === 'paid' && invoice.status === 'PAID');
      
      // Apply search term filter if one exists
      if (!searchTerm) return statusMatch;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        statusMatch && (
          invoice.docNumber.toLowerCase().includes(searchLower) ||
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.totalAmount.toString().includes(searchTerm) ||
          invoice.status.toLowerCase().includes(searchLower)
        )
      );
    });

  if (loading) return <Loading name="invoices" />;
  
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
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <div className="flex space-x-3">
          <Link
            to="/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Invoice
          </Link>
        </div>
      </div>
      
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                name="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('open')}
              className={`px-3 py-1 text-sm rounded ${filter === 'open' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter('paid')}
              className={`px-3 py-1 text-sm rounded ${filter === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 
              'No invoices match your search criteria' : 
              'No invoices found'}
          </div>
        ) : (
          <InvoiceList invoices={filteredInvoices} />
        )}
      </div>
    </div>
  );
}