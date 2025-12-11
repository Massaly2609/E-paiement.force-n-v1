import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, adminCreateUser } from '../lib/supabase';
import { Profile, UserRole, UserStatus } from '../types';
import {
  Users as UsersIcon, Search, Plus, MoreVertical, X, Loader2, Mail, Lock, User, AlertCircle,
  Briefcase, Wand2, Eye, EyeOff, Edit, Trash2, UserX, Eye as EyeIcon, UserCheck, ShieldCheck,
  ShieldOff, CheckCircle2, XCircle, CheckSquare, ChevronDown, Globe, Key, BadgeCheck,
  Sparkles, TrendingUp, BarChart3, Target, Clock, Bell, Settings, Download, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
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

const roleConfig: Record<UserRole, { description: string; icon: React.ElementType; color: string; bgColor: string }> = {
  CONSULTANT: {
    description: "Accès de base pour ses propres missions.",
    icon: Consultant,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50"
  },
  MENTOR: {
    description: "Peut superviser des consultants.",
    icon: Mentor,
    color: "text-indigo-600",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100/50"
  },
  VALIDATION: {
    description: "Accès pour la validation finale des rapports.",
    icon: Validation,
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/50"
  },
  ADMIN: {
    description: "Accès complet à toute la plateforme.",
    icon: Admin,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50"
  },
};

const avatarColors = [
  'bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 border-sky-200',
  'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-200',
  'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border-amber-200',
  'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700 border-rose-200',
  'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 border-violet-200',
  'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 text-fuchsia-700 border-fuchsia-200'
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
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-xl shadow-2xl animate-[slideInRight_0.3s_ease-out] backdrop-blur-sm border ${
      isSuccess
        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400/30'
        : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-400/30'
    }`}>
      {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};

const ConfirmationModal = ({ title, message, onConfirm, Icon, buttonText, buttonClass, processing, closeModal }: any) => (
  <div className="relative bg-gradient-to-b from-white via-white to-slate-50 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-[scaleIn_0.2s_ease-out] border border-slate-200/50">
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br ${
      buttonClass.includes('red')
        ? 'from-rose-100 to-rose-50 text-rose-500 border border-rose-200'
        : 'from-orange-100 to-orange-50 text-orange-500 border border-orange-200'
    }`}>
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>
    <div className="flex justify-center gap-4">
      <button
        onClick={closeModal}
        disabled={processing}
        className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all duration-200 hover:border-slate-400"
      >
        Annuler
      </button>
      <button
        onClick={onConfirm}
        disabled={processing}
        className={`px-8 py-3 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px] ${
          buttonClass.includes('red')
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25'
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25'
        }`}
      >
        {processing ? <Loader2 className="animate-spin" size={18} /> : buttonText}
      </button>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, value, label, color, trend }: any) => (
  <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          trend > 0
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-rose-50 text-rose-600 border border-rose-200'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-slate-500 text-sm">{label}</p>
  </div>
);

// --- PAGINATION COMPONENT ---
const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">
          Affichage de <span className="font-bold text-slate-900">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span> sur <span className="font-bold text-slate-900">{totalItems}</span> utilisateurs
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronRight size={18} />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronsRight size={18} />
        </button>
      </div>

      {/* Items Per Page Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Par page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onPageChange(1); // Reset to first page when changing items per page
            // You might want to handle this differently depending on your state management
          }}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

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
  const [formUser, setFormUser] = useState({
    email: '',
    password: generatePassword(),
    fullName: '',
    role: 'CONSULTANT' as UserRole
  });
  const [editUser, setEditUser] = useState({ fullName: '', role: 'CONSULTANT' as UserRole });
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    setFormUser({ email: '', password: generatePassword(), fullName: '', role: 'CONSULTANT' });
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
      const msg = err.message.includes("User already registered")
        ? "Cette adresse email est déjà utilisée."
        : err.message;
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
      async () => supabase.from('profiles').update({
        full_name: editUser.fullName,
        role: editUser.role
      }).eq('id', selectedUser.id).throwOnError(),
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

  // Filter users based on search and filters
  const filteredUsers = users.filter(u =>
    (showHidden || !u.is_hidden) &&
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginate filtered users
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  const roleFilterButtons = ['ALL', ...Object.keys(roleConfig)] as const;

  // Calcul des statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const hiddenUsers = users.filter(u => u.is_hidden).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-4 md:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <UsersIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Gérez les comptes, rôles et accès à la plateforme
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              <Download size={18} />
              <span>Exporter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              <Settings size={18} />
              <span>Paramètres</span>
            </button>
            <button
              onClick={() => openModal('CREATE')}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus size={20} strokeWidth={2.5} />
              <span>Nouvel Utilisateur</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={UsersIcon}
            value={totalUsers}
            label="Total Utilisateurs"
            color="from-blue-100 to-blue-200 text-blue-600"
            trend={12}
          />
          <StatsCard
            icon={UserCheck}
            value={activeUsers}
            label="Utilisateurs Actifs"
            color="from-emerald-100 to-emerald-200 text-emerald-600"
            trend={8}
          />
          <StatsCard
            icon={ShieldCheck}
            value={adminUsers}
            label="Administrateurs"
            color="from-purple-100 to-purple-200 text-purple-600"
            trend={0}
          />
          <StatsCard
            icon={Eye}
            value={hiddenUsers}
            label="Utilisateurs Masqués"
            color="from-slate-100 to-slate-200 text-slate-600"
            trend={-3}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                    className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm font-medium cursor-pointer"
                  >
                    <option value="ALL">Tous les rôles</option>
                    {Object.keys(roleConfig).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                {/* Show Hidden Toggle */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <label htmlFor="showHidden" className="text-sm font-medium text-slate-700 cursor-pointer">Afficher les masqués</label>
                  <input
                    type="checkbox"
                    id="showHidden"
                    checked={showHidden}
                    onChange={e => setShowHidden(e.target.checked)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Dernière activité
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <UsersIcon className="text-blue-500 animate-pulse" size={20} />
                          </div>
                        </div>
                        <p className="text-slate-600 font-medium">Chargement des utilisateurs...</p>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100/50 rounded-2xl mb-4">
                          <AlertCircle className="text-rose-500" size={40} />
                        </div>
                        <p className="text-rose-600 font-bold mb-2">Erreur de chargement</p>
                        <p className="text-slate-600 text-sm">{fetchError}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl mb-4">
                          <UsersIcon className="text-slate-400" size={40} />
                        </div>
                        <p className="text-slate-700 font-medium mb-1">Aucun utilisateur trouvé</p>
                        <p className="text-slate-500 text-sm">Essayez de modifier vos filtres de recherche</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => {
                    const RoleIcon = roleConfig[user.role].icon;
                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-slate-100 transition-colors duration-200 ${
                          user.status === 'INACTIVE' ? 'opacity-70' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${getAvatarColor(user.full_name)}`}>
                              {user.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">{user.full_name}</p>
                                {user.is_hidden && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Eye size={10} />
                                    Masqué
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm mt-1">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${roleConfig[user.role].bgColor} ${roleConfig[user.role].color} border border-slate-200/50 w-fit`}>
                            <RoleIcon size={12} />
                            {user.role}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border border-emerald-200'
                              : 'bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600 border border-slate-200'
                          } w-fit`}>
                            {user.status === 'ACTIVE' ? (
                              <>
                                <UserCheck size={12} />
                                Actif
                              </>
                            ) : (
                              <>
                                <UserX size={12} />
                                Inactif
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Jamais connecté'
                          }
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal('EDIT', user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                openModal(user.status === 'ACTIVE' ? 'CONFIRM_DEACTIVATE' : 'CONFIRM_DEACTIVATE', user);
                              }}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                user.status === 'ACTIVE'
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'ACTIVE' ? 'Désactiver' : 'Réactiver'}
                            >
                              {user.status === 'ACTIVE' ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                openModal('CONFIRM_HIDE', user);
                              }}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                user.is_hidden
                                  ? 'text-slate-600 hover:bg-slate-50'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                              title={user.is_hidden ? 'Afficher' : 'Masquer'}
                            >
                              {user.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-6 py-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-blue-900/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            {modal === 'CREATE' && (
              <div className="bg-gradient-to-br from-white via-white to-slate-50/90 rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/40 overflow-hidden animate-[scaleIn_0.3s_ease-out]">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-white via-white to-blue-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-md opacity-70" />
                        <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <UsersIcon className="text-white" size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Nouvel Utilisateur</h3>
                        <p className="text-slate-500 text-sm mt-1">Créez un nouveau compte collaborateur</p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleCreateUser} className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          <User className="inline mr-2" size={16} />
                          Nom Complet
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Awa Diop"
                          required
                          value={formUser.fullName}
                          onChange={e => setFormUser({...formUser, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          <Mail className="inline mr-2" size={16} />
                          Adresse Email
                        </label>
                        <input
                          type="email"
                          placeholder="Ex: a.diop@force-n.sn"
                          required
                          value={formUser.email}
                          onChange={e => setFormUser({...formUser, email: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            <Key className="inline mr-2" size={16} />
                            Mot de passe
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormUser({...formUser, password: generatePassword()});
                              setShowPassword(true);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Wand2 size={12} />
                            Générer un mot de passe sécurisé
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={formUser.password}
                            onChange={e => setFormUser({...formUser, password: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Le mot de passe doit contenir au moins 8 caractères
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Role Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-4">
                        <ShieldCheck className="inline mr-2" size={16} />
                        Sélectionner un rôle
                      </label>
                      <div className="space-y-3">
                        {Object.entries(roleConfig).map(([role, config]) => {
                          const RoleIcon = config.icon;
                          const isSelected = formUser.role === role;
                          return (
                            <button
                              type="button"
                              key={role}
                              onClick={() => setFormUser({...formUser, role: role as UserRole})}
                              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-500 shadow-lg shadow-blue-500/10'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                    <RoleIcon className={`${config.color}`} size={20} />
                                  </div>
                                  <div>
                                    <p className={`font-bold ${config.color}`}>{role}</p>
                                    <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="p-1.5 bg-blue-500 rounded-full">
                                    <CheckCircle2 className="text-white" size={16} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center gap-2">
                        {processing ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={20} />
                            Créer le compte
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Other modals */}
            {modal === 'EDIT' && selectedUser && (
              <div className="relative bg-gradient-to-br from-white via-white to-slate-50/90 rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/40 overflow-hidden animate-[scaleIn_0.3s_ease-out] max-w-lg mx-auto">
                <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-white via-white to-blue-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 ${getAvatarColor(selectedUser.full_name)}`}>
                        {selectedUser.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Modifier le profil</h3>
                        <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateUser} className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom Complet
                      </label>
                      <input
                        type="text"
                        required
                        value={editUser.fullName}
                        onChange={e => setEditUser({...editUser, fullName: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Rôle
                      </label>
                      <div className="space-y-2">
                        {Object.entries(roleConfig).map(([role, config]) => {
                          const RoleIcon = config.icon;
                          const isSelected = editUser.role === role;
                          return (
                            <button
                              type="button"
                              key={role}
                              onClick={() => setEditUser({...editUser, role: role as UserRole})}
                              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-500'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <RoleIcon className={`${config.color}`} size={18} />
                                <span className={`font-medium ${config.color}`}>{role}</span>
                                {isSelected && (
                                  <CheckCircle2 className="ml-auto text-blue-500" size={18} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50"
                    >
                      {processing ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal === 'CONFIRM_DEACTIVATE' && selectedUser && (
              <div className="flex items-center justify-center">
                <ConfirmationModal
                  title={selectedUser.status === 'ACTIVE' ? 'Désactiver le compte' : 'Réactiver le compte'}
                  message={`Êtes-vous sûr de vouloir ${selectedUser.status === 'ACTIVE' ? 'désactiver' : 'réactiver'} le compte de ${selectedUser.full_name} ?`}
                  onConfirm={handleToggleStatus}
                  Icon={selectedUser.status === 'ACTIVE' ? ShieldOff : ShieldCheck}
                  buttonText={selectedUser.status === 'ACTIVE' ? 'Désactiver' : 'Réactiver'}
                  buttonClass="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  processing={processing}
                  closeModal={closeModal}
                />
              </div>
            )}

            {modal === 'CONFIRM_HIDE' && selectedUser && (
              <div className="flex items-center justify-center">
                <ConfirmationModal
                  title={selectedUser.is_hidden ? 'Afficher le compte' : 'Masquer le compte'}
                  message={`Le compte de ${selectedUser.full_name} sera ${selectedUser.is_hidden ? 'à nouveau visible' : 'caché de la liste principale'}.`}
                  onConfirm={handleToggleHidden}
                  Icon={selectedUser.is_hidden ? Eye : EyeOff}
                  buttonText={selectedUser.is_hidden ? 'Afficher' : 'Masquer'}
                  buttonClass="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  processing={processing}
                  closeModal={closeModal}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}