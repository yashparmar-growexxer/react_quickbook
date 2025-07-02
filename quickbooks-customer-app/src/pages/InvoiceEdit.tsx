// src/components/InvoiceEdit.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import InvoiceForm from '../components/InvoiceForm';
import Loading from '../components/Loading';
import { Customer, Invoice, Item } from '../types';

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staticItems: Item[] = [
    {
      Id: "1",
      Name: "Web Design Service",
      Description: "Professional website design",
      UnitPrice: 500,
      Type: "Service"
    },
    {
      Id: "2",
      Name: "Website Hosting",
      Description: "Annual hosting package",
      UnitPrice: 200,
      Type: "Service"
    },
    {
      Id: "3",
      Name: "Consulting",
      Description: "Hourly consulting rate",
      UnitPrice: 150,
      Type: "Service"
    },
    {
      Id: "4",
      Name: "Laptop",
      Description: "High-performance laptop",
      UnitPrice: 1200,
      Type: "Inventory"
    },
    {
      Id: "5",
      Name: "Monitor",
      Description: "27-inch 4K monitor",
      UnitPrice: 400,
      Type: "Inventory"
    }
  ];

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

        // Transform invoice line items for the form
        const transformedInvoice = {
          ...invoiceRes.data,
          Line: invoiceRes.data?.lineItems?.map((item: any) => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.amount,
            Description: item.description,
            SalesItemLineDetail: {
              ItemRef: { value: item.itemId, name: item.description },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            }
          })) || []
        };

        setInvoice(transformedInvoice);
        setCustomers(customersRes.data);
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
      
      // Include the SyncToken for updates
      const updateData = {
        ...data,
        Id: id,
        SyncToken: invoice?.SyncToken || '0'
      };

      const response = await invoiceService.update(id, updateData);
      
      if (response.data) {
        navigate(`/invoices/${id}`, { 
          state: { 
            success: 'Invoice updated successfully',
            updatedInvoice: response.data 
          } 
        });
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
        items={staticItems}  // Using the static items here
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