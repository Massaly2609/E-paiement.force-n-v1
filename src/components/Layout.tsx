import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, CheckCircle, CreditCard, 
  Settings, LogOut, Menu, Bell, ChevronLeft, ChevronRight,
  Briefcase, Users
} from 'lucide-react';

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, route: '/dashboard' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push(
      { label: 'Validation', icon: CheckCircle, route: '/validation' },
      { label: 'Finance', icon: CreditCard, route: '/payments' },
      { label: 'Missions', icon: Briefcase, route: '/missions' },
      { label: 'Utilisateurs', icon: Users, route: '/users' }
    );
  } else {
    menuItems.push(
      { label: 'Mes Missions', icon: Briefcase, route: '/missions' },
      { label: 'Mes Rapports', icon: FileText, route: '/reports' },
      { label: 'Factures', icon: CreditCard, route: '/payments' }
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      
      {/* Sidebar */}
      <aside 
        className={`bg-gradient-to-b from-[#003366] to-[#0f172a] text-white flex flex-col transition-all duration-300 relative z-20 shadow-xl ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-center border-b border-white/10 bg-[#002855]/50 backdrop-blur-sm px-4">
          {!collapsed ? (
            <div className="bg-white px-3 py-1.5 rounded-lg w-full max-w-[160px] flex justify-center shadow-sm">
               <img src="https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-logo-text.png" className="h-5 object-contain" alt="Force-N" />
            </div>
          ) : (
             <div className="w-10 h-10 bg-white text-[#003366] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">F</div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white text-slate-500 hover:text-blue-600 p-1 rounded-full shadow-md border border-slate-100 z-50 hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
           {!collapsed && (
             <div className="px-3 mb-2 text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">Menu Principal</div>
           )}
           
           {menuItems.map((item) => {
             const isActive = location.pathname.startsWith(item.route);
             return (
               <Link 
                 key={item.route}
                 to={item.route}
                 className={`flex items-center px-3 py-3 rounded-r-lg mb-1 transition-all border-l-4 group ${
                   isActive 
                   ? 'bg-white/10 text-white border-orange-500 shadow-lg' 
                   : 'text-blue-100/70 border-transparent hover:bg-white/5 hover:text-white'
                 }`}
               >
                 <item.icon size={22} className={`${isActive ? 'text-orange-400' : 'group-hover:text-white'} transition-colors`} />
                 {!collapsed && <span className="ml-3 text-sm font-medium tracking-wide">{item.label}</span>}
               </Link>
             );
           })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-[#002244]/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 mb-4 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <img src={user?.avatar_url || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.full_name}`} className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover" alt="Avatar" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#002244] rounded-full"></div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">{user?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-600/90 hover:text-white text-blue-200 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide border border-white/5"
          >
            <LogOut size={16} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
             <LayoutDashboard size={18} />
             <span className="text-slate-300">/</span>
             <span className="text-slate-800 font-bold">Espace {user?.role === 'ADMIN' ? 'Administrateur' : 'Consultant'}</span>
          </div>

          <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
             </button>
             <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors">
               <Settings size={20} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <div className="max-w-[1600px] mx-auto pb-10">
             <Outlet />
           </div>
        </div>
      </main>
    </div>
  );
}
