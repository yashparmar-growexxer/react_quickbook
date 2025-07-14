export default function Dashboard() {
  const modules = [
    { name: 'Customers', icon: '👥', path: '/customers' },
    { name: 'Invoices', icon: '🧾', path: '/invoices' },
    { name: 'Payments', icon: '💳', path: '/payments' },
    // { name: 'Estimates', icon: '📝', path: '/estimates' },
    // { name: 'Expenses', icon: '💰', path: '/expenses' },
    // { name: 'Reports', icon: '📊', path: '/reports' },
    // { name: 'Products', icon: '📦', path: '/products' },
    // { name: 'Taxes', icon: '🏛️', path: '/taxes' },
    // { name: 'Employees', icon: '👨‍💼', path: '/employees' },
    // { name: 'Vendors', icon: '🏢', path: '/vendors' },
    // { name: 'Banking', icon: '🏦', path: '/banking' },
    { name: 'Accounting', icon: '🧮', path: '/accounting' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <p className="text-gray-700 text-center font-bold text-xl">Welcome to QuickBooks </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">*  QuickBooks Modules  *</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {modules.map((module) => (
            <a
              key={module.name}
              href={module.path}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <span className="text-2xl mb-2">{module.icon}</span>
              <span className="text-sm font-medium text-gray-700 text-center">{module.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}