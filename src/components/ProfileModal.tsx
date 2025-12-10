import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User, KeyRound, Phone, Save, Loader2, X, AlertTriangle, CheckCircle,
  UploadCloud, Mail, Shield, Camera, Lock, ChevronRight, Info, Eye, EyeOff,
  Briefcase, Globe, Settings as SettingsIcon, UserCheck
} from 'lucide-react';

const Alert = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-lg text-sm font-medium animate-[fadeIn_0.3s_ease-out] border ${
      isSuccess
        ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/80 text-emerald-700 border-emerald-200'
        : 'bg-gradient-to-r from-rose-50 to-rose-50/80 text-rose-700 border-rose-200'
    }`}>
      {isSuccess ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB.");
        return;
      }
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

      if (profileError) throw profileError;

      setSuccess("Profil mis à jour avec succès !");
      await refreshUser();
      setInitialFullName(fullName);
      setInitialPhone(phone);
      setAvatarFile(null);
      setAvatarPreview(null);

    } catch (err: any) {
       console.error("Profile Update Error:", err);
       setError(err.message || "Erreur lors de la mise à jour du profil.");
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
      className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
        activeTab === tabName
          ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200 shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 border border-transparent hover:border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${activeTab === tabName ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className={`text-slate-400 ${activeTab === tabName ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
    </button>
  );

  const currentAvatar = avatarPreview || user?.avatar_url || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.full_name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-blue-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl bg-gradient-to-br from-white via-white to-slate-50/90 rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/40 overflow-hidden animate-[scaleIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
        >
          <X size={20} />
        </button>

        <div className="flex h-[600px]">
          {/* Left Panel - Content */}
          <div className="w-2/3 flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-white via-white to-blue-50/30">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl blur-sm opacity-70" />
                  <div className="relative p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                    <UserCheck className="text-white" size={22} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {activeTab === 'profile' ? 'Mon Profil' : 'Sécurité'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {activeTab === 'profile'
                      ? 'Gérez vos informations personnelles'
                      : 'Mettez à jour votre mot de passe'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {error && <Alert message={error} type="error" />}
                    {success && <Alert message={success} type="success" />}

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-8">
                      <div className="relative group">
                        <div className="relative">
                          <img
                            src={currentAvatar}
                            className="w-28 h-28 rounded-2xl border-4 border-white object-cover shadow-xl"
                            alt="Avatar"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group-hover:scale-110"
                        >
                          <Camera size={18} />
                        </button>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Photo de profil</p>
                          <p className="text-xs text-slate-500">
                            PNG, JPG jusqu'à 5MB. Recommandé 256x256px
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <User size={16} />
                            Nom Complet
                          </label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              className="relative w-full pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                              placeholder="Votre nom complet"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Mail size={16} />
                          Adresse Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Principal
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Phone size={16} />
                          Téléphone
                        </label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                          <input
                            type="tel"
                            placeholder="+221 xx xxx xx xx"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="relative w-full pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Information */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Rôle Professionnel</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                              {user?.role}
                            </span>
                            <span className="text-xs text-slate-500">• Membre depuis 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    {error && <Alert message={error} type="error" />}
                    {success && <Alert message={success} type="success" />}

                    {/* Password Requirements */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                          <Shield className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 mb-2">Exigences de sécurité</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              Au moins 8 caractères
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              Lettres majuscules et minuscules
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              Au moins un chiffre ou caractère spécial
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Lock size={16} />
                        Nouveau mot de passe
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="relative w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                          placeholder="Entrez votre nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Lock size={16} />
                        Confirmer le mot de passe
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="relative w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength */}
                    {newPassword && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Force du mot de passe</span>
                          <span className={`font-semibold ${
                            newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {newPassword.length >= 8 ? 'Fort' : 'Moyen'}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              newPassword.length >= 8 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                            }`}
                            style={{ width: `${Math.min(100, (newPassword.length / 12) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-8 py-6 border-t border-slate-200/50 bg-gradient-to-r from-white via-white to-slate-50/50 flex justify-between items-center">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                form={activeTab === 'profile' ? undefined : undefined}
                onClick={activeTab === 'profile' ? handleProfileUpdate : handlePasswordUpdate}
                disabled={loading}
                className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {activeTab === 'profile' ? 'Sauvegarde...' : 'Mise à jour...'}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {activeTab === 'profile' ? 'Sauvegarder les modifications' : 'Changer le mot de passe'}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Right Panel - Navigation */}
          <div className="w-1/3 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border-l border-slate-200/50 p-6 flex flex-col">
            {/* User Profile Summary */}
            <div className="text-center mb-8">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <img
                  src={currentAvatar}
                  className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-xl"
                  alt="Avatar"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                  <UserCheck size={10} className="text-white" />
                </div>
              </div>
              <p className="font-bold text-slate-900 text-lg truncate">{fullName}</p>
              <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                  <Briefcase size={12} />
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-3">
              <TabButton tabName="profile" label="Profil" icon={User} />
              <TabButton tabName="security" label="Sécurité" icon={Shield} />
            </div>

            {/* Additional Info */}
            <div className="mt-auto pt-6 border-t border-slate-200/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-xl border border-slate-200">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Info size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Dernière connexion</p>
                    <p className="text-xs text-slate-500">Il y a 2 heures</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-all duration-200 text-sm"
                >
                  Fermer le panneau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;