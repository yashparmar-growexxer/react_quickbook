import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import InvoiceForm from '../components/InvoiceForm';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { staticItems } from '../services/items';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersRes = await customerService.getAll();
        setCustomers(customersRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await invoiceService.create(data);
      toast.success('Invoice created successfully!');
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading name="invoice data" />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <button 
          onClick={() => navigate('/invoices')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Invoices
        </button>
      </div>
      <InvoiceForm 
        customers={customers}
        items={staticItems}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}