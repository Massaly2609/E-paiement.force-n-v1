import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Mission } from '../types';
import {
  Plus, Search, Calendar, User as UserIcon, Briefcase,
  Loader2, CheckCircle2, AlertCircle, X, ChevronRight,
  TextQuote, AlignLeft, Info, Clock, Target, Building,
  Sparkles, CheckSquare, BarChart3, Users, FileText
} from 'lucide-react';

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    consultant_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('missions').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').in('role', ['CONSULTANT', 'MENTOR'])
    ]);
    if (mRes.data) setMissions(mRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // Tentative d'insertion
    const { error: insertError } = await supabase.from('missions').insert([formData]);

    if (insertError) {
      console.error("Erreur Supabase:", insertError);
      setError(`Erreur : ${insertError.message}. Vérifiez vos politiques RLS sur la table missions.`);
    } else {
      setIsModalOpen(false);
      setFormData({ title: '', description: '', consultant_id: '', start_date: '', end_date: '' });
      fetchData();
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 md:p-8">
      {/* Header avec effets de profondeur */}
      <div className="relative mb-8">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
        <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(31,41,55,0.04)] rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Briefcase className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Gestion des Missions
                  </h1>
                  <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" />
                    Structurez et assignez les contrats FORCE-N
                  </p>
                </div>
              </div>

              {/* Stats cards */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Missions actives</p>
                    <p className="text-xl font-bold text-slate-900">{missions.filter(m => m.status === 'active').length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-xl border border-emerald-100">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Consultants</p>
                    <p className="text-xl font-bold text-slate-900">{profiles.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-2xl font-semibold flex items-center gap-3 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] min-w-fit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center gap-3">
                <Plus size={22} strokeWidth={2.5} />
                <span className="tracking-wide">Nouvelle Mission</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="text-blue-600 animate-pulse" size={24} />
              </div>
            </div>
            <p className="mt-6 text-slate-600 font-medium">Chargement des missions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {missions.map((m) => {
              const user = profiles.find(p => p.id === m.consultant_id);
              const isActive = m.status === 'active';
              const daysLeft = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={m.id}
                  className="group relative bg-white/80 backdrop-blur-sm border border-white/40 shadow-[0_4px_24px_rgba(31,41,55,0.08)] hover:shadow-[0_12px_48px_rgba(31,41,55,0.12)] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/60 overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16" />

                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3.5 rounded-xl ${isActive ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border ${isActive ? 'border-blue-100' : 'border-slate-200'} group-hover:scale-105 transition-transform duration-300`}>
                          <Briefcase size={22} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{m.title}</h3>
                              <p className="text-slate-600 text-sm mt-1 line-clamp-2">{m.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                {m.status}
                              </span>
                            </div>
                          </div>

                          {/* Consultant info */}
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50/50 to-slate-50/30 rounded-xl border border-slate-100">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <UserIcon size={16} className="text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'Non assigné'}</p>
                              <p className="text-xs text-slate-500">{user?.role || 'Aucun rôle'}</p>
                            </div>
                          </div>

                          {/* Dates and info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="p-1.5 bg-blue-50 rounded-lg">
                                <Calendar size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-700">Début</p>
                                <p className="text-slate-600 text-sm">{new Date(m.start_date).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="p-1.5 bg-amber-50 rounded-lg">
                                <Target size={14} className="text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-700">Échéance</p>
                                <p className="text-slate-600 text-sm">{new Date(m.end_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button className="flex items-center justify-center p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors self-start group/btn">
                        <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Progression</span>
                        <span className="font-semibold">{daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminé'}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                          style={{ width: `${Math.max(0, Math.min(100, (daysLeft > 0 ? (30 - daysLeft) / 30 * 100 : 100)))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PROFESSIONNELLE AVEC FLOURISH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          {/* Overlay avec effet de verre */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-blue-900/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal container */}
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-white via-white to-slate-50/90 rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/40 overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Header du modal avec gradient */}
            <div className="relative px-8 py-6 border-b border-white/40 bg-gradient-to-r from-white via-white to-blue-50/30">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl blur-sm" />
                    <div className="relative p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <Briefcase size={22} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Nouvelle Mission
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Créez et assignez un nouveau contrat FORCE-N</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50/90 to-red-50/50 border border-red-200 rounded-xl flex items-start gap-3 animate-[shake_0.5s_ease-in-out]">
                  <div className="p-2 bg-red-100 rounded-lg shrink-0">
                    <AlertCircle size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Erreur de création</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Grid des champs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <TextQuote size={14} />
                    Titre de la mission
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                    <input
                      required
                      placeholder="Ex: Audit financier Q4 - Transformation digitale"
                      type="text"
                      className="relative w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft size={14} />
                    Description détaillée
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                    <textarea
                      placeholder="Détails du contrat, objectifs spécifiques, livrables attendus et méthodologie..."
                      className="relative w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-32 font-medium text-slate-900 placeholder-slate-400 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Consultant */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon size={14} />
                    Collaborateur assigné
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                    <select
                      required
                      className="relative w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-medium text-slate-900 cursor-pointer"
                      value={formData.consultant_id}
                      onChange={e => setFormData({...formData, consultant_id: e.target.value})}
                    >
                      <option value="" className="text-slate-400">Sélectionner un profil...</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id} className="text-slate-900">
                          {p.full_name} — {p.role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={14} />
                      Date Début
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                      <input
                        required
                        type="date"
                        className="relative w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        value={formData.start_date}
                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Target size={14} />
                      Échéance Fin
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                      <input
                        required
                        type="date"
                        className="relative w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        value={formData.end_date}
                        onChange={e => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer du modal */}
            <div className="px-8 py-6 bg-gradient-to-r from-white via-white to-slate-50/50 border-t border-white/40 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-all duration-200 border border-slate-200 hover:border-slate-300"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={processing}
                className="relative group flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-3">
                  {processing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckSquare size={18} />
                      Créer le contrat
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ajout des animations CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}