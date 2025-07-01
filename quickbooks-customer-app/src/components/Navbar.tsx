import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          QuickBooks ( Intuit ) - Sandbox
        </Link>
        <div className="flex items-center space-x-4">
          {/* <Link to="/customers" className="hover:text-blue-200">
            Customers
          </Link> */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}