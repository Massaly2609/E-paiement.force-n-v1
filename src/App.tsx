import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Missions from './pages/Missions';
import AdminMissions from './pages/AdminMissions';
import AdminValidation from './pages/AdminValidation';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />

        {/* Route dynamique Missions */}
        <Route path="missions" element={isAdmin ? <AdminMissions /> : <Missions />} />

        {/* Route Validation */}
        <Route path="validation" element={<AdminValidation />} />

        {/* Route Rapports ACTIVÉE */}
        <Route path="reports" element={<Reports />} />

        {/* Route Paiements */}
        <Route path="payments" element={<Payments />} />

        <Route path="payments" element={<div className="p-10 text-center text-slate-500">Finance (À venir)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}