
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, adminCreateUser } from '../lib/supabase';
import { Profile, UserRole, UserStatus } from '../types';
import { 
  Users as UsersIcon, Search, Plus, MoreVertical, X, Loader2, Mail, Lock, User, AlertCircle, 
  Briefcase, Wand2, Eye, EyeOff, Edit, Trash2, UserX, Eye as EyeIcon, UserCheck, ShieldCheck, 
  ShieldOff, CheckCircle2, XCircle, CheckSquare
} from 'lucide-react';

// --- UTILITIES & CONFIG ---

// Custom Icons for Roles
const Consultant = (props: any) => <Briefcase {...props} />;
const Mentor = (props: any) => <UsersIcon {...props} />;
const Validation = (props: any) => <CheckSquare {...props} />;
const Admin = (props: any) => <ShieldCheck {...props} />;

const generatePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const roleConfig: Record<UserRole, { description: string; icon: React.ElementType; color: string }> = {
  CONSULTANT: { description: "Accès de base pour ses propres missions.", icon: Consultant, color: "text-blue-600" },
  MENTOR: { description: "Peut superviser des consultants.", icon: Mentor, color: "text-indigo-600" },
  VALIDATION: { description: "Accès pour la validation finale des rapports.", icon: Validation, color: "text-amber-600" },
  ADMIN: { description: "Accès complet à toute la plateforme.", icon: Admin, color: "text-purple-600" },
};

const avatarColors = [
  'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-violet-100 text-violet-700', 'bg-fuchsia-100 text-fuchsia-700'
];
const getAvatarColor = (name: string | null) => {
  if (!name) return avatarColors[0];
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const index = Math.abs(hash % avatarColors.length);
  return avatarColors[index];
};

// --- SUB-COMPONENTS ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 p-4 rounded-lg shadow-2xl animate-[fadeInDown_0.3s_ease-out] ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100"><X size={18} /></button>
    </div>
  );
};

const ConfirmationModal = ({ title, message, onConfirm, Icon, buttonText, buttonClass, processing, closeModal }: any) => (
   <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center animate-[fadeInUp_0.2s_ease-out]">
     <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-opacity-10 ${buttonClass.includes('red') ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
       <Icon size={32} />
     </div>
     <h3 className="text-xl font-bold text-slate-900">{title}</h3>
     <p className="text-sm text-slate-500 mt-2">{message}</p>
     <div className="flex justify-center gap-4 mt-8">
       <button onClick={closeModal} disabled={processing} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors">Annuler</button>
       <button onClick={onConfirm} disabled={processing} className={`px-6 py-2.5 text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 w-36 ${buttonClass}`}>
         {processing ? <Loader2 className="animate-spin" size={18} /> : buttonText}
       </button>
     </div>
   </div>
);


// --- MAIN COMPONENT ---
export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<'CREATE' | 'EDIT' | 'CONFIRM_DEACTIVATE' | 'CONFIRM_HIDE' | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [formUser, setFormUser] = useState({ email: '', password: '', fullName: '', role: 'CONSULTANT' as UserRole });
  const [editUser, setEditUser] = useState({ fullName: '', role: 'CONSULTANT' as UserRole });
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      setFetchError("Impossible de charger les utilisateurs. Vérifiez les permissions (RLS).");
      setUsers([]);
    } else {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchUsers]);

  const resetForms = () => {
    setFormUser({ email: '', password: '', fullName: '', role: 'CONSULTANT' });
    setEditUser({ fullName: '', role: 'CONSULTANT' });
    setSelectedUser(null);
    setShowPassword(false);
  };

  const openModal = (type: typeof modal, user: Profile | null = null) => {
    resetForms();
    setModal(type);
    if (user) {
      setSelectedUser(user);
      if (type === 'EDIT') setEditUser({ fullName: user.full_name, role: user.role });
    }
  };

  const closeModal = () => {
    if (processing) return;
    setModal(null);
    setTimeout(resetForms, 200);
  };

  const handleApiCall = async (apiCall: () => Promise<any>, successMessage: string) => {
    setProcessing(true);
    try {
      await apiCall();
      showToast(successMessage, 'success');
      fetchUsers();
      closeModal();
    } catch (err: any) {
      const msg = err.message.includes("User already registered") ? "Cette adresse email est déjà utilisée." : err.message;
      showToast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (formUser.password.length < 8) {
      showToast("Le mot de passe doit faire au moins 8 caractères.", 'error');
      return;
    }
    handleApiCall(
      () => adminCreateUser(formUser.email, formUser.password, formUser.fullName, formUser.role),
      "Utilisateur créé avec succès."
    );
  };
  
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    handleApiCall(
      async () => supabase.from('profiles').update({ full_name: editUser.fullName, role: editUser.role }).eq('id', selectedUser.id).throwOnError(),
      "Utilisateur mis à jour."
    );
  };
  
  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const newStatus: UserStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    handleApiCall(
      async () => supabase.from('profiles').update({ status: newStatus }).eq('id', selectedUser.id).throwOnError(),
      `Le compte a été ${newStatus === 'ACTIVE' ? 'réactivé' : 'désactivé'}.`
    );
  };

  const handleToggleHidden = () => {
    if (!selectedUser) return;
    const newHiddenState = !selectedUser.is_hidden;
    handleApiCall(
      async () => supabase.from('profiles').update({ is_hidden: newHiddenState }).eq('id', selectedUser.id).throwOnError(),
      `Le compte a été ${newHiddenState ? 'masqué' : 'affiché'}.`
    );
  };

  const filteredUsers = users.filter(u => 
    (showHidden || !u.is_hidden) &&
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const roleFilterButtons = ['ALL', ...Object.keys(roleConfig)] as const;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 mt-1 font-medium">Gérez les comptes, rôles et accès à la plateforme.</p>
        </div>
        <button onClick={() => openModal('CREATE')} className="bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition flex items-center gap-2">
          <Plus size={18} /> Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {roleFilterButtons.map(role => {
              const isActive = roleFilter === role;
              return (
                <button 
                  key={role} 
                  onClick={() => setRoleFilter(role === 'ALL' ? 'ALL' : role as UserRole)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>
                  {role === 'ALL' ? 'Tous' : role}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 self-center ml-auto">
             <label htmlFor="showHidden" className="text-xs font-bold text-slate-600 cursor-pointer">Masqués</label>
             <input type="checkbox" id="showHidden" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-[minmax(0,_3fr)_minmax(0,_1fr)_minmax(0,_1fr)_auto] items-center px-4 py-2 border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Utilisateur</span>
          <span>Rôle</span>
          <span>Statut</span>
          <span className="text-right">Actions</span>
        </div>
        
        {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={24} /></div>
         : fetchError ? <div className="p-16 text-center text-red-600"><AlertCircle size={40} className="mx-auto" /><p className="font-bold mt-2">Erreur</p><p className="text-sm">{fetchError}</p></div>
         : filteredUsers.length === 0 ? <div className="p-16 text-center text-slate-400"><UsersIcon size={48} className="mx-auto opacity-20" /><p className="font-medium mt-2">Aucun utilisateur trouvé pour ce filtre.</p></div>
         : filteredUsers.map((user) => (
            <div key={user.id} className={`grid grid-cols-[minmax(0,_3fr)_minmax(0,_1fr)_minmax(0,_1fr)_auto] items-center px-4 py-3 border-b border-slate-100 group transition-colors ${user.status === 'INACTIVE' ? 'opacity-60' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3 min-w-0"><div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs border ${getAvatarColor(user.full_name)}`}>{user.full_name?.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="font-bold text-slate-800 truncate">{user.full_name}</p><p className="text-slate-500 text-xs truncate">{user.email}</p></div></div>
              <div><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${ user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}><ShieldCheck size={12}/>{user.role}</span></div>
              <div><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${ user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{user.status === 'ACTIVE' ? <UserCheck size={12}/> : <UserX size={12}/>}{user.status === 'ACTIVE' ? 'Actif' : 'Inactif'}</span></div>
              <div className="relative text-right">
                <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="p-2 text-slate-400 hover:text-slate-700 bg-transparent group-hover:bg-slate-200/60 rounded-full opacity-0 group-hover:opacity-100 transition-all"><MoreVertical size={18} /></button>
                {activeMenu === user.id && (<div ref={menuRef} className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20 animate-[fadeIn_0.1s]"><button onClick={() => { openModal('EDIT', user); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50"><Edit size={14} /> Modifier</button><button onClick={() => { openModal('CONFIRM_DEACTIVATE', user); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50">{user.status === 'ACTIVE' ? <><ShieldOff size={14}/>Désactiver</> : <><ShieldCheck size={14}/>Réactiver</>}</button><button onClick={() => { openModal('CONFIRM_HIDE', user); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-red-600 hover:bg-red-50">{user.is_hidden ? <><EyeIcon size={14}/>Afficher</> : <><Trash2 size={14}/>Masquer</>}</button></div>)}
              </div>
            </div>
          ))}
      </div>
      
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-[fadeIn_0.2s]" onClick={closeModal}>
          <div className="w-full" onClick={e => e.stopPropagation()}>
          {modal === 'CREATE' && (
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto animate-[fadeInUp_0.2s] max-h-[95vh] flex overflow-hidden">
              {/* Left Panel - Illustration */}
              <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-slate-100 p-12 text-center border-r border-slate-200">
                <svg className="w-48 h-48 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 13.62C16 15.15 14.71 16.14 13.26 16.14H10.74C9.29 16.14 8 15.15 8 13.62V11.53C8 9.99 9.29 9 10.74 9H13.26C14.71 9 16 9.99 16 11.53V13.62Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17.5V16.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5 22V20.59C14.5 19.03 13.24 17.75 11.7 17.75H10.15C8.61 17.75 7.35 19.03 7.35 20.59V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.5 17.5V16.09C19.5 14.53 18.24 13.25 16.7 13.25H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.5 17.5V16.09C4.5 14.53 5.76 13.25 7.3 13.25H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 2V3.41C9.5 4.97 8.24 6.25 6.7 6.25H5.15C3.61 6.25 2.35 4.97 2.35 3.41V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.65 3.41V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.65 3.41C21.65 4.97 20.39 6.25 18.85 6.25H17.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-2xl font-bold text-slate-800 mt-6">Agrandir votre équipe</h2>
                <p className="text-slate-500 mt-2 text-sm max-w-xs">Créez un nouvel accès pour un collaborateur en définissant son rôle et ses informations en quelques clics.</p>
              </div>
              
              {/* Right Panel - Form */}
              <div className="w-full md:w-1/2 flex flex-col bg-white">
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Nouveau collaborateur</h3>
                  <button onClick={closeModal} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleCreateUser} className="p-8 space-y-6 overflow-y-auto flex-1">
                  <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Nom Complet</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={16} /><input type="text" placeholder="Ex: Awa Diop" required value={formUser.fullName} onChange={e => setFormUser({...formUser, fullName: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Email</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={16} /><input type="email" placeholder="Ex: a.diop@force-n.sn" required value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                  
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Rôle</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(roleConfig).map(([role, config]) => (
                        <button type="button" key={role} onClick={() => setFormUser({...formUser, role: role as UserRole})} className={`p-4 rounded-lg border-2 text-left transition-all ${formUser.role === role ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <div className={`flex items-center gap-2 font-bold ${config.color}`}><config.icon size={16}/> {role}</div>
                          <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5"><div className="flex justify-between items-center"><label className="text-sm font-bold text-slate-700">Mot de passe</label><button type="button" onClick={() => { setFormUser({...formUser, password: generatePassword()}); setShowPassword(true); }} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Wand2 size={12}/>Générer</button></div><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400" size={16} /><input type={showPassword ? "text" : "password"} required minLength={8} value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </form>
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors">Annuler</button>
                  <button onClick={handleCreateUser} disabled={processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm w-48 flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                    {processing ? <Loader2 className="animate-spin" size={18} /> : 'Créer le compte'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {modal === 'EDIT' && selectedUser && (
             <div className="relative bg-white rounded-xl shadow-2xl max-w-lg mx-auto animate-[fadeInUp_0.2s] max-h-[95vh] flex flex-col">
              <div className="px-6 py-5 border-b flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg border-2 ${getAvatarColor(selectedUser.full_name)}`}>{selectedUser.full_name?.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className="text-lg font-bold">Modifier le profil</h3>
                  <p className="text-sm text-slate-500">{selectedUser.full_name}</p>
                </div>
              </div>
              <form onSubmit={handleUpdateUser} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Nom Complet</label><div className="relative"><User className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="text" required value={editUser.fullName} onChange={e => setEditUser({...editUser, fullName: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Rôle</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <button type="button" key={role} onClick={() => setEditUser({...editUser, role: role as UserRole})} className={`p-4 rounded-lg border-2 text-left transition-all ${editUser.role === role ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className={`flex items-center gap-2 font-bold ${config.color}`}><config.icon size={16}/> {role}</div>
                        <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
              <div className="px-8 py-5 bg-slate-50 border-t flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-100">Annuler</button>
                <button onClick={handleUpdateUser} disabled={processing} className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold text-sm w-48 flex justify-center">{processing ? <Loader2 className="animate-spin" size={18} /> : 'Enregistrer'}</button>
              </div>
            </div>
          )}
          {modal === 'CONFIRM_DEACTIVATE' && selectedUser && (<ConfirmationModal title={selectedUser.status === 'ACTIVE' ? 'Désactiver le compte' : 'Réactiver le compte'} message={`Êtes-vous sûr ? L'utilisateur ${selectedUser.status === 'ACTIVE' ? 'ne pourra plus se connecter' : 'retrouvera son accès'}.`} onConfirm={handleToggleStatus} Icon={ShieldOff} buttonText={selectedUser.status === 'ACTIVE' ? 'Désactiver' : 'Réactiver'} buttonClass="bg-orange-600 hover:bg-orange-700" processing={processing} closeModal={closeModal}/>)}
          {modal === 'CONFIRM_HIDE' && selectedUser && (<ConfirmationModal title={selectedUser.is_hidden ? 'Afficher le compte' : 'Masquer le compte'} message={`Le compte de ${selectedUser.full_name} sera ${selectedUser.is_hidden ? 'de nouveau visible' : 'caché de la liste par défaut'}.`} onConfirm={handleToggleHidden} Icon={Trash2} buttonText={selectedUser.is_hidden ? 'Afficher' : 'Masquer'} buttonClass="bg-red-600 hover:bg-red-700" processing={processing} closeModal={closeModal}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
