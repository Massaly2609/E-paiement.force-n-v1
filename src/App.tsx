import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Missions from './pages/Missions';
import AdminMissions from './pages/AdminMissions';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';
import AdminValidation from './pages/AdminValidation';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

// Sous-composant pour consommer useAuth correctement
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />

        {/* Affichage conditionnel selon le rôle */}
        <Route path="missions" element={user?.role === 'ADMIN' ? <AdminMissions /> : <Missions />} />

        <Route path="validation" element={<AdminValidation />} />
        <Route path="payments" element={<div className="p-10 text-center">Finance (À venir)</div>} />
        <Route path="reports" element={<div className="p-10 text-center">Rapports (À venir)</div>} />
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