import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, CheckCircle, CreditCard,
  Settings, LogOut, Menu, Bell, ChevronLeft, ChevronRight,
  Briefcase, Users, Home, Search, ChevronDown, CheckSquare
} from 'lucide-react';
import ProfileModal from './ProfileModal';

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // --- LOGIQUE DES MENUS CORRIGÉE ---
  const menuItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, route: '/dashboard' },
  ];

  if (user?.role === 'ADMIN') {
    // Menu pour l'ADMINISTRATEUR
    menuItems.push(
      { label: 'Validation', icon: CheckCircle, route: '/validation' },
      { label: 'Finance', icon: CreditCard, route: '/payments' },
      { label: 'Missions', icon: Briefcase, route: '/missions' },
      { label: 'Utilisateurs', icon: Users, route: '/users' }
    );
  } else if (user?.role === 'VALIDATION') {
    // Menu spécifique pour l'équipe VALIDATION / COMPTABLE
    menuItems.push(
      { label: 'Validation', icon: CheckSquare, route: '/validation' },
      { label: 'Finance', icon: CreditCard, route: '/payments' },
      // Le validateur n'a pas besoin de gérer les utilisateurs ou créer des missions
    );
  } else {
    // Menu pour CONSULTANT et MENTOR (Le "Sinon" par défaut)
    menuItems.push(
      { label: 'Mes Missions', icon: Briefcase, route: '/missions' },
      { label: 'Mes Rapports', icon: FileText, route: '/reports' },
      { label: 'Factures', icon: CreditCard, route: '/payments' }
    );
  }
  // -----------------------------------

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative h-full bg-gradient-to-b from-[#003366] to-[#0f172a] text-white flex flex-col transition-all duration-300 z-30 shadow-2xl ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#002855]/50 backdrop-blur-sm">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl blur-md opacity-70" />
                <div className="relative w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="text-white" size={22} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FORCE-N</h1>
                <p className="text-xs text-blue-200 font-medium">Enterprise Platform</p>
              </div>
            </div>
          ) : (
             <div className="mx-auto">
               <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                 <Briefcase className="text-white" size={22} />
               </div>
             </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:scale-110 transition-all shadow-md"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
           {!collapsed && (
             <div className="px-3 mb-2 text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">Menu Principal</div>
           )}

           {menuItems.map((item) => {
             const isActive = location.pathname.startsWith(item.route);
             return (
               <Link
                 key={item.route}
                 to={item.route}
                 onClick={() => setMobileMenuOpen(false)}
                 className={`flex items-center px-3 py-3.5 rounded-xl mb-1 transition-all duration-200 group ${
                   isActive
                   ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-white shadow-lg shadow-orange-500/10 border-l-4 border-orange-500'
                   : 'text-blue-100/80 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                 }`}
               >
                 <item.icon size={22} className={`transition-colors ${isActive ? 'text-orange-400' : 'text-blue-300 group-hover:text-white'}`} />
                 {!collapsed && <span className="ml-3 text-sm font-medium tracking-wide">{item.label}</span>}
               </Link>
             );
           })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/10 bg-[#002244]/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 mb-4 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <img src={user?.avatar_url || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.full_name}`} className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover shadow-lg" alt="Avatar" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#003366] rounded-full"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-bold">{user?.role}</p>
                  </div>
                  <ChevronDown className="text-blue-300" size={16} />
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="space-y-2 mb-4">
              <button onClick={() => setProfileModalOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-blue-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm font-medium">
                <Settings size={16} /> <span>Paramètres</span>
              </button>
            </div>
          )}

          <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 font-medium ${collapsed ? 'text-blue-300 hover:text-red-400 hover:bg-red-500/10' : 'bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-300 hover:text-white hover:from-red-500 hover:to-red-600 border border-red-500/20 hover:border-red-500'}`}>
            <LogOut size={16} /> {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Home size={16} /> <span>Dashboard</span> <ChevronRight size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-900">{menuItems.find(item => location.pathname.startsWith(item.route))?.label || 'Tableau de bord'}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg relative"><Bell size={20} /><span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span></button>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => setProfileModalOpen(true)} className="relative">
                <img src={user?.avatar_url || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.full_name}`} className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover shadow-sm" alt="Profile" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
               <Outlet />
             </div>
          </div>
        </div>
      </main>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}