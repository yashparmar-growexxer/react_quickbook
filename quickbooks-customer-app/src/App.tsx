import { Navigate, Route, Routes } from "react-router-dom";
import InProgress from "./pages/InProgress";
import CustomerCreate from "./pages/CustomerCreate";
import CustomerDetail from "./pages/CustomerDetail";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import { authService } from "./services/api";
import Customers from "./pages/Customers";
import CustomerEdit from "./pages/CustomerEdit";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

   useEffect(() => {
    // This will make the component re-render when localStorage changes
    const handleStorageChange = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="customers">
            <Route index element={<Customers/>} />
            <Route path="create" element={<CustomerCreate />} />
            <Route path=":id" element={<CustomerDetail />} />
            <Route path=":id/edit" element={<CustomerEdit />} />
          </Route>

          {/* Other module routes */}
          <Route path="invoices" element={<InProgress />} />
          <Route path="payments" element={<InProgress />} />
          {/* Add other module routes */}

          {/* 404 Catch-all - must be last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;