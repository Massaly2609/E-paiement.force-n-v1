
import React, { useEffect, useState } from 'react';
import { supabase, Profile, adminCreateUser, UserRole } from '../lib/supabase';
import { 
  Users as UsersIcon, Search, Plus, MoreVertical, 
  Shield, CheckCircle, X, Loader2, Mail, Lock, User, AlertCircle, Briefcase, ChevronDown
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'CONSULTANT' as UserRole
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    // Validation basique côté client
    if (newUser.password.length < 6) {
      setCreateError("Le mot de passe doit contenir au moins 6 caractères.");
      setCreating(false);
      return;
    }

    try {
      await adminCreateUser(newUser.email, newUser.password, newUser.fullName, newUser.role);
      
      // Succès
      setIsModalOpen(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'CONSULTANT' }); // Reset form
      
      // Feedback utilisateur
      alert(`Utilisateur ${newUser.fullName} créé avec succès !`);
      
      // Rafraîchir la liste
      setTimeout(() => {
        fetchUsers(); 
      }, 500);

    } catch (err: any) {
      console.error(err);
      // Traduction amicale des erreurs courantes
      let msg = err.message;
      if (msg.includes("Database error")) msg = "Erreur technique lors de l'enregistrement du profil. Vérifiez les données.";
      if (msg.includes("already registered")) msg = "Cette adresse email est déjà utilisée.";
      
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Gestion des Utilisateurs
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full border border-slate-200">{users.length}</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Gérez les comptes, rôles et accès à la plateforme.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setCreateError(null); }}
          className="bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Filters & Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <button className="px-3 py-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition flex items-center gap-2">
              <span className="material-icons text-sm">filter_list</span> Filtrer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Identité</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'ajout</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={24} /> 
                      <span className="font-medium">Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <UsersIcon size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Aucun utilisateur trouvé.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-300">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.full_name}</div>
                          <div className="text-slate-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'VALIDATION' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-700 font-medium text-xs">Actif</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFESSIONAL MODAL - No Blur, Clean & Solid */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Solid Dark Overlay (Standard Industry Practice) */}
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity" 
            onClick={() => !creating && setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[500px] overflow-hidden animate-[fadeInUp_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Créer un compte</h3>
                <p className="text-slate-500 text-xs mt-0.5">L'utilisateur recevra ses accès pour compléter son profil.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition"
                disabled={creating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message Area */}
            {createError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-5 overflow-y-auto">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" required
                    value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow placeholder:text-slate-400"
                    placeholder="Ex: Prénom Nom"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="email" required
                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow placeholder:text-slate-400"
                    placeholder="nom@entreprise.com"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rôle et Permissions</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                    className="w-full pl-10 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="CONSULTANT">Consultant (Accès standard)</option>
                    <option value="MENTOR">Mentor (Supervision)</option>
                    <option value="VALIDATION">Chargé de Validation (RH/Compta)</option>
                    <option value="ADMIN">Administrateur (Accès total)</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 italic ml-1">Le rôle définit les accès aux modules de la plateforme.</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mot de passe temporaire</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" required minLength={6}
                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                    placeholder="Définir un mot de passe"
                  />
                </div>
                <p className="text-xs text-slate-500 ml-1">L'utilisateur pourra le modifier plus tard.</p>
              </div>

            </form>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
                disabled={creating}
              >
                Annuler
              </button>
              <button 
                onClick={handleCreateUser}
                disabled={creating}
                className="px-6 py-2 bg-slate-900 text-white rounded-md font-semibold text-sm hover:bg-slate-800 transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {creating && <Loader2 className="animate-spin" size={16} />}
                {creating ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
