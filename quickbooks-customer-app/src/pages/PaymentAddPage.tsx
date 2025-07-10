import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService, customerService, invoiceService } from '../services/api';
import Loading from '../components/Loading';

export default function AddPaymentPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        CustomerRef: { value: '', name: '' },
        TotalAmt: 0,
        PaymentRefNum: '',
        TxnDate: new Date().toISOString().split('T')[0],
        PaymentMethodRef: { value: '1', name: 'Cash' },
        DepositToAccountRef: { value: '', name: '' },
        UnappliedAmt: 0,
        PrivateNote: '',
        Line: [] as Array<{
            Amount: number,
            LinkedTxn: { TxnId: string, TxnType: string }
        }>
    });
    const [customers, setCustomers] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch customers on mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setCustomersLoading(true);
                const response = await customerService.getAll();
                console.log("Customers data:", response.data);

                const customerList = response.data?.map((customer: any) => ({
                    id: customer.Id || customer.value,
                    name: customer.DisplayName || customer.Name || 'Unknown Customer'
                })) || [];

                setCustomers(customerList);
            } catch (err) {
                console.error('Failed to fetch customers:', err);
                setError('Failed to load customers');
            } finally {
                setCustomersLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // Fetch customer's open invoices when customer is selected
    const handleCustomerChange = async (customerId: string) => {
        console.log(customerId, "customerId")
        if (!customerId) return;

        try {
            setInvoicesLoading(true);
            const selectedCustomer = customers.find(c => c.id === customerId);
            console.log(selectedCustomer, "selectedCustomer")
            if (!selectedCustomer) return;

            setFormData(prev => ({
                ...prev,
                CustomerRef: { value: customerId, name: selectedCustomer.name }
            }));

            const response = await invoiceService.getAll({
                customerId,
                status: 'open'
            });
            setInvoices(response.data.invoices || []);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setError('Failed to load customer invoices');
        } finally {
            setInvoicesLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('Amt') ? parseFloat(value) || 0 : value
        }));
    };

    // Improved amount input handling
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty value or valid number
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : parseFloat(value)
            }));
        }
    };

    const handleInvoiceAmountChange = (invoiceId: string, amount: number) => {
        setFormData(prev => {
            const existingIndex = prev.Line.findIndex(
                line => line.LinkedTxn.TxnId === invoiceId
            );

            const updatedLine = existingIndex >= 0
                ? prev.Line.map((line, idx) =>
                    idx === existingIndex ? { ...line, Amount: amount } : line
                )
                : [
                    ...prev.Line,
                    {
                        Amount: amount,
                        LinkedTxn: { TxnId: invoiceId, TxnType: 'Invoice' }
                    }
                ];

            const totalApplied = updatedLine.reduce((sum, line) => sum + (line.Amount || 0), 0);
            const unappliedAmt = Math.max(0, (prev.TotalAmt || 0) - totalApplied);

            return {
                ...prev,
                Line: updatedLine,
                UnappliedAmt: unappliedAmt
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.CustomerRef.value || !formData.TotalAmt || !formData.PaymentRefNum) {
                throw new Error('Customer, Amount, and Payment Reference are required');
            }

            // Prepare payload with proper number values
            const payload = {
                ...formData,
                TotalAmt: Number(formData.TotalAmt),
                UnappliedAmt: Number(formData.UnappliedAmt),
                TxnDate: formData.TxnDate || new Date().toISOString().split('T')[0],
                PaymentMethodRef: formData.PaymentMethodRef || { value: '1' },
                Line: formData.Line.map(line => ({
                    ...line,
                    Amount: Number(line.Amount)
                }))
            };

            const response = await paymentService.create(payload);
            navigate('/payments', { state: { success: true } });
        } catch (err: any) {
            console.error('Payment creation failed:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/payments')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Payments
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Add New Payment</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-md">
                    <div className="text-red-700 font-medium">{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer *
                        </label>
                        {customersLoading ? (
                            <div className="flex items-center">
                                <Loading name="customers" />
                                <span className="ml-2 text-gray-500">Loading customers...</span>
                            </div>
                        ) : (
                            <select
                                value={formData.CustomerRef.value}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={customersLoading}
                            >
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Payment Reference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Reference # *
                        </label>
                        <input
                            type="text"
                            name="PaymentRefNum"
                            value={formData.PaymentRefNum}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Payment Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount *
                        </label>
                        <input
                            type="number"
                            name="TotalAmt"
                            value={formData.TotalAmt || ''}
                            onChange={handleAmountChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            onKeyDown={(e) => {
                                // Prevent negative numbers
                                if (e.key === '-' || e.key === 'e') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            name="TxnDate"
                            value={formData.TxnDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method
                        </label>
                        <select
                            name="PaymentMethodRef"
                            value={formData.PaymentMethodRef.value}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                PaymentMethodRef: {
                                    value: e.target.value,
                                    name: e.target.options[e.target.selectedIndex].text
                                }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="1">Cash</option>
                            <option value="2">Credit Card</option>
                            <option value="3">Check</option>
                            <option value="4">Bank Transfer</option>
                        </select>
                    </div>

                    {/* Unapplied Amount (readonly) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unapplied Amount
                        </label>
                        <input
                            type="number"
                            name="UnappliedAmt"
                            value={formData.UnappliedAmt}
                            readOnly
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                        />
                    </div>
                </div>

                {/* Invoice Application Section */}
                {formData.CustomerRef.value && (
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Apply to Invoices</h3>
                        {invoicesLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loading name="invoices" />
                                <span className="ml-2 text-gray-500">Loading invoices...</span>
                            </div>
                        ) : invoices.length > 0 ? (
                            <>
                                <div className="space-y-3">
                                    {invoices.map(invoice => (
                                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="font-medium">Invoice #{invoice.docNumber}</p>
                                                <p className="text-sm text-gray-500">
                                                    Amount Due: ${invoice.balance.toFixed(2)} |
                                                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={Math.min(invoice.balance, formData.TotalAmt)}
                                                    step="0.01"
                                                    value={
                                                        formData.Line.find(line => line.LinkedTxn.TxnId === invoice.id)?.Amount || ''
                                                    }
                                                    onChange={(e) => handleInvoiceAmountChange(
                                                        invoice.id,
                                                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                    )}
                                                    className="w-24 border border-gray-300 rounded-md px-2 py-1 text-right"
                                                    onKeyDown={(e) => {
                                                        if (e.key === '-' || e.key === 'e') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total Applied:</span>
                                        <span className="font-medium">
                                            ${formData.Line.reduce((sum, line) => sum + (line.Amount || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">No open invoices found for this customer.</p>
                        )}
                    </div>
                )}

                {/* Private Note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Private Note
                    </label>
                    <input
                        type="text"
                        name="PrivateNote"
                        value={formData.PrivateNote}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <Loading name="payment" />
                                <span className="ml-2">Processing...</span>
                            </span>
                        ) : 'Create Payment'}
                    </button>
                </div>
            </form>
        </div>
    );
}