import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-blue-600">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            
            {/* Routes Placeholder */}
            <Route path="validation" element={<div className="p-10 text-center text-slate-500">Page Validation (À venir)</div>} />
            <Route path="payments" element={<div className="p-10 text-center text-slate-500">Page Finance (À venir)</div>} />
            <Route path="missions" element={<div className="p-10 text-center text-slate-500">Page Missions (À venir)</div>} />
            <Route path="reports" element={<div className="p-10 text-center text-slate-500">Page Rapports (À venir)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
