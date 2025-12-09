import React, { useEffect, useState } from 'react';
import { supabase, Profile, adminCreateUser, UserRole } from '../lib/supabase';
import { 
  Users as UsersIcon, Search, Plus, MoreVertical, 
  Shield, CheckCircle, X, Loader2, Mail, Lock, User
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
    try {
      await adminCreateUser(newUser.email, newUser.password, newUser.fullName, newUser.role);
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
      setNewUser({ email: '', password: '', fullName: '', role: 'CONSULTANT' }); // Reset
    } catch (err: any) {
      alert('Erreur lors de la création: ' + err.message);
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
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition flex items-center gap-2 transform active:scale-95"
        >
          <Plus size={18} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Date création</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" /> Chargement des profils...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                           <img 
                             src={user.avatar_url || `https://ui-avatars.com/api/?background=random&color=fff&name=${user.full_name}`} 
                             alt={user.full_name} 
                             className="w-10 h-10 rounded-full object-cover border border-slate-200"
                           />
                           <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.full_name}</div>
                          <div className="text-slate-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        user.role === 'VALIDATION' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {user.role === 'ADMIN' && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                        <CheckCircle size={12} /> Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 font-bold text-xs hover:underline">MODIFIER</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elegant Modal for Create User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Nouvel Utilisateur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" required
                    value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="email" required
                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="jean.dupont@force-n.sn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rôle</label>
                  <select 
                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="CONSULTANT">Consultant</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="VALIDATION">Validation</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                      type="password" required minLength={6}
                      value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="animate-spin" size={16} />}
                  {creating ? 'Création...' : 'Créer le compte'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
