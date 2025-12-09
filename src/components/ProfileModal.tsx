
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, KeyRound, Phone, Save, Loader2, X, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';

const Alert = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg text-xs font-bold animate-[fadeIn_0.2s] ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {isSuccess ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      <span>{message}</span>
    </div>
  );
};

const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [initialFullName, setInitialFullName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      const currentName = user.full_name || '';
      const currentPhone = user.phone || '';
      setFullName(currentName);
      setPhone(currentPhone);
      setInitialFullName(currentName);
      setInitialPhone(currentPhone);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      setError(null);
      setSuccess(null);
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('profile');
    }
  }, [user, isOpen]);
  
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  }

  const handleCancel = (e: React.MouseEvent) => {
      e.preventDefault();
      setFullName(initialFullName);
      setPhone(initialPhone);
      setAvatarFile(null);
      setAvatarPreview(null);
      clearMessages();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      clearMessages();
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    let newAvatarUrl = user?.avatar_url;

    try {
      // 1. Handle avatar upload if a new file is selected
      if (avatarFile) {
        const filePath = `${user!.id}/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw new Error(`Erreur lors de l'envoi de l'image : ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarUrl = urlData.publicUrl;
      }
      
      // 2. Prepare profile data for update
      const updates: { full_name: string; phone: string; avatar_url?: string } = {
        full_name: fullName,
        phone: phone,
      };
      if (newAvatarUrl !== user?.avatar_url) {
        updates.avatar_url = newAvatarUrl;
      }

      // 3. Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id)
        .throwOnError();

      setSuccess("Profil mis à jour avec succès !");
      await refreshUser();
      setInitialFullName(fullName);
      setInitialPhone(phone);
      setAvatarFile(null);
      setAvatarPreview(null);

    } catch (err: any) {
       console.error("Profile Update Error:", err);
       setError(err.message || "Erreur lors de la mise à jour du profil. Vérifiez les permissions (RLS).");
    } finally {
       setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        setError(error.message);
    } else {
        setSuccess("Mot de passe modifié avec succès.");
        setNewPassword('');
        setConfirmPassword('');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const TabButton = ({ tabName, label, icon: Icon }: { tabName: string; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => { setActiveTab(tabName); clearMessages(); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-colors ${
        activeTab === tabName ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
  
  const currentAvatar = avatarPreview || user?.avatar_url || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.full_name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-[fadeIn_0.2s]" onClick={onClose}>
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto animate-[fadeInUp_0.2s] max-h-[95vh] flex overflow-hidden border-t-4 border-blue-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-2/3 flex flex-col bg-white">
            {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="flex flex-col h-full">
                    <div className="px-8 py-5 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Modifier mon profil</h3>
                        <p className="text-sm text-slate-500">Gérez vos informations personnelles et votre avatar.</p>
                    </div>
                    <div className="p-8 space-y-5 flex-1 overflow-y-auto">
                        {error && <Alert message={error} type="error" />}
                        {success && <Alert message={success} type="success" />}

                        <div className="flex items-center gap-6">
                           <div className="relative group">
                              <img src={currentAvatar} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" alt="Avatar" />
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <UploadCloud size={24} />
                              </button>
                              <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                           </div>
                           <div className="flex-1">
                               <label className="text-sm font-bold text-slate-700">Nom Complet</label>
                               <div className="relative mt-1.5"><User className="absolute left-3 top-3 text-slate-400" size={16}/><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Email</label><div className="relative"><input type="email" value={user?.email} disabled className="w-full pl-3 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" /></div></div>
                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Téléphone</label><div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={16}/><input type="tel" placeholder="+221 xx xxx xx xx" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                        </div>
                    </div>
                    <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end items-center gap-4">
                        <button type="button" onClick={handleCancel} className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors">Annuler</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 text-white rounded-lg font-semibold text-sm w-52 flex justify-center items-center gap-2 hover:bg-blue-800 transition-colors shadow-md shadow-blue-700/20">
                           {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'security' && (
                <form onSubmit={handlePasswordUpdate} className="flex flex-col h-full">
                    <div className="px-8 py-5 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Changer de mot de passe</h3>
                        <p className="text-sm text-slate-500">Choisissez un mot de passe fort et sécurisé.</p>
                    </div>
                    <div className="p-8 space-y-5 flex-1 overflow-y-auto">
                        {error && <Alert message={error} type="error" />}
                        {success && <Alert message={success} type="success" />}
                        <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Nouveau mot de passe</label><div className="relative"><KeyRound className="absolute left-3 top-3 text-slate-400" size={16}/><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                        <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Confirmer le mot de passe</label><div className="relative"><KeyRound className="absolute left-3 top-3 text-slate-400" size={16}/><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div></div>
                    </div>
                    <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end items-center gap-4">
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm w-56 flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/20">
                           {loading ? <Loader2 className="animate-spin" size={18} /> : 'Changer le mot de passe'}
                        </button>
                    </div>
                </form>
            )}
        </div>
        
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-50/70 p-6 border-l border-slate-200 flex flex-col">
           <div className="text-center mb-8">
             <img src={currentAvatar} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover mx-auto" alt="Avatar" />
             <p className="font-bold text-slate-800 truncate mt-3">{fullName}</p>
             <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{user?.role}</p>
           </div>
           <div className="space-y-2">
             <TabButton tabName="profile" label="Profil" icon={User} />
             <TabButton tabName="security" label="Sécurité" icon={KeyRound} />
           </div>
           <div className="mt-auto text-center">
             <button onClick={onClose} className="text-xs text-slate-400 hover:text-blue-600 font-semibold hover:underline">Fermer</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
