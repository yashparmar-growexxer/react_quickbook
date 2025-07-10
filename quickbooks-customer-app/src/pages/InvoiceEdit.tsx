import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import InvoiceForm from '../components/InvoiceForm';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { staticItems } from '../services/items';

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [invoiceRes, customersRes] = await Promise.all([
          invoiceService.getById(id!),
          customerService.getAll()
        ]);
        
        if (!invoiceRes.data) throw new Error('Invoice not found');
        if (!Array.isArray(customersRes.data)) throw new Error('Failed to load customers');

        // Transform the invoice data to match the form's expected structure
        const transformedInvoice = {
          ...invoiceRes.data,
          CustomerRef: {
            value: invoiceRes.data.customer?.id || '',
            name: invoiceRes.data.customer?.displayName || ''
          },
          Line: invoiceRes.data.lineItems?.map((item: any) => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.amount,
            Description: item.description,
            SalesItemLineDetail: {
              ItemRef: { 
                value: item.itemId, 
                name: staticItems.find(i => i.Id === item.itemId)?.Name || item.description 
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            }
          })) || [],
          DocNumber: invoiceRes.data.docNumber || '',
          CustomerMemo: invoiceRes.data.CustomerMemo || ''
        };

        setInvoice(transformedInvoice);
        setCustomers(customersRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast.error('Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!id) throw new Error('Invoice ID is missing');
      
      const updateData = {
        ...data,
        Id: id,
        SyncToken: invoice?.SyncToken || '0'
      };

      const response = await invoiceService.update(id, updateData);
      
      if (response.data) {
        toast.success('Invoice updated successfully!');
        navigate(`/invoices/${id}`);
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update invoice');
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
        items={staticItems}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}