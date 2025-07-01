import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../services/api';
import CustomerView from '../components/CustomerView';
import { Customer } from '../types';
import Loading from '../components/Loading';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await customerService.getById(id!);
                setCustomer(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch customer');
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    if (loading) return <Loading />
    if (error) return <div className="text-red-500">{error}</div>;
    if (!customer) return <div>Customer not found</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Customers
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                <Link
                    to={`/customers/${customer.Id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Edit Customer
                </Link>
            </div>
            <CustomerView customer={customer} />
        </div>
    );
}