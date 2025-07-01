import { Customer } from '../types';

interface CustomerViewProps {
  customer: Customer;
}

export default function CustomerView({ customer }: CustomerViewProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Customer Information
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Display Name</h4>
            <p className="mt-1 text-sm text-gray-900">{customer.DisplayName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Company Name</h4>
            <p className="mt-1 text-sm text-gray-900">{customer.CompanyName || '-'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-sm text-gray-900">{customer.PrimaryEmailAddr?.Address || '-'}</p>
          </div>
             <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <p className={`mt-1 text-sm ${customer.Active == true ? 'text-green-950': 'text-red-600'} font-bold`}>
              {customer.Active ? 'Active' : 'Inactive'}
            </p>
          </div>
           <div>
            <h4 className="text-sm font-medium text-gray-500">First Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {customer.GivenName }
            </p>
          </div>
           <div>
            <h4 className="text-sm font-medium text-gray-500">Last Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {customer.FamilyName}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone</h4>
            <p className="mt-1 text-sm text-gray-900">{customer.PrimaryPhone?.FreeFormNumber || '-'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Address</h4>
            <p className="mt-1 text-sm text-gray-900">
              {customer.BillAddr?.Line1 || '-'}<br />
              {customer.BillAddr?.City || ''} {customer.BillAddr?.PostalCode || ''}<br />
              {customer.BillAddr?.Country || ''}
            </p>
          </div>
       
         
         
          {customer.Notes && (
            <div className="sm:col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <p className="mt-1 text-sm text-gray-900">{customer.Notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}