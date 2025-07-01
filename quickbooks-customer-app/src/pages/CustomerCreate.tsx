import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/api';
import CustomerForm from '../components/CustomerForm';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await customerService.create(data);
      navigate('/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Customer</h1>
      <CustomerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}