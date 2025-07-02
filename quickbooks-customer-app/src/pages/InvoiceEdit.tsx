import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import InvoiceForm from '../components/InvoiceForm';
import Loading from '../components/Loading';
import { Customer, Invoice } from '../types'; // Make sure these types are defined

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [invoiceRes, customersRes, itemsRes] = await Promise.all([
          invoiceService.getById(id!),
          customerService.getAll(),
          invoiceService.getItems() // Changed from getAll() to getItems()
        ]);
        
        // Validate responses
        if (!invoiceRes.data) throw new Error('Invoice not found');
        if (!Array.isArray(customersRes.data)) throw new Error('Failed to load customers');
        if (!Array.isArray(itemsRes)) throw new Error('Failed to load items');

        setInvoice(invoiceRes.data);
        setCustomers(customersRes.data);
        setItems(itemsRes);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: Partial<Invoice>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!id) throw new Error('Invoice ID is missing');
      
      const response = await invoiceService.update(id, data);
      
      if (response.data) {
        navigate(`/invoices/${id}`, { state: { success: true } });
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading name="invoice data" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!invoice) return <div className="p-4">Invoice not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Invoice #{invoice.docNumber}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
      
      <InvoiceForm 
        initialData={invoice}
        customers={customers}
        items={items}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}
    </div>
  );
}