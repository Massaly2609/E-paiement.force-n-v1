import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Mission, MissionStatus } from '../types';
import {
  Plus, Search, Calendar, User as UserIcon, Briefcase,
  Loader2, CheckCircle2, AlertCircle, X, ChevronRight,
  Clock, Target, BarChart3, Filter, CheckSquare, Sparkles,
  TrendingUp, Users, FileText, Building, Shield,
  AlignLeft, Zap, Award, Globe, Mail, Phone,
  MapPin, ExternalLink, Eye, Edit, Trash2, MoreVertical
} from 'lucide-react';

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Formulaire de création
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    consultant_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

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
    const { error } = await supabase.from('missions').insert([formData]);

    if (!error) {
      setIsModalOpen(false);
      setFormData({ title: '', description: '', consultant_id: '', start_date: '', end_date: '' });
      fetchData();
    }
    setProcessing(false);
  };

  // Fonction utilitaire pour le statut
  const getStatusConfig = (status: MissionStatus) => {
    const config = {
      active: {
        color: 'bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-700 border-emerald-200/50',
        icon: CheckCircle2,
        label: 'Active'
      },
      pending: {
        color: 'bg-gradient-to-r from-amber-500/10 to-orange-400/10 text-amber-700 border-amber-200/50',
        icon: Clock,
        label: 'En attente'
      },
      completed: {
        color: 'bg-gradient-to-r from-blue-500/10 to-indigo-400/10 text-blue-700 border-blue-200/50',
        icon: CheckSquare,
        label: 'Terminée'
      },
      cancelled: {
        color: 'bg-gradient-to-r from-rose-500/10 to-pink-400/10 text-rose-700 border-rose-200/50',
        icon: X,
        label: 'Annulée'
      }
    };
    return config[status] || config.pending;
  };

  // Calcul des métriques
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const totalConsultants = profiles.length;
  const upcomingMissions = missions.filter(m => {
    const endDate = new Date(m.end_date);
    const today = new Date();
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-4 md:p-6 lg:p-8">
      {/* Header principal avec navigation */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <Briefcase className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Missions
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Gérez et assignez les contrats de vos collaborateurs
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              <Filter size={18} />
              <span>Filtrer</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              <BarChart3 size={18} />
              <span>Rapports</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus size={20} strokeWidth={2.5} />
              <span>Nouvelle Mission</span>
            </button>
          </div>
        </div>

        {/* Métriques en dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <FileText className="text-blue-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full">
                {missions.length}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Total Missions</h3>
            <p className="text-slate-500 text-sm">Toutes les missions créées</p>
          </div>

          <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                <Zap className="text-emerald-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full">
                {activeMissions}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Missions Actives</h3>
            <p className="text-slate-500 text-sm">En cours d'exécution</p>
          </div>

          <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl">
                <Users className="text-amber-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-amber-600 px-3 py-1 bg-amber-50 rounded-full">
                {totalConsultants}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Collaborateurs</h3>
            <p className="text-slate-500 text-sm">Consultants & Mentors</p>
          </div>
        </div>
      </div>

      {/* Contenu principal - Liste des missions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Toutes les Missions</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="text-blue-500" size={24} />
              </div>
            </div>
            <p className="text-slate-600 font-medium">Chargement des missions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const assignee = profiles.find(p => p.id === mission.consultant_id);
              const statusConfig = getStatusConfig(mission.status as MissionStatus);
              const StatusIcon = statusConfig.icon;
              const daysLeft = Math.ceil((new Date(mission.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const progressPercentage = Math.max(0, Math.min(100, daysLeft > 0 ? (30 - daysLeft) / 30 * 100 : 100));

              return (
                <div
                  key={mission.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Section gauche - Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${mission.status === 'active' ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border ${mission.status === 'active' ? 'border-blue-100' : 'border-slate-200'}`}>
                            <Briefcase size={22} className={mission.status === 'active' ? 'text-blue-600' : 'text-slate-500'} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-900">{mission.title}</h3>
                              <div className="flex items-center gap-2">
                                <StatusIcon size={16} className={statusConfig.color.includes('emerald') ? 'text-emerald-500' : statusConfig.color.includes('amber') ? 'text-amber-500' : statusConfig.color.includes('blue') ? 'text-blue-500' : 'text-rose-500'} />
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                            {mission.description && (
                              <p className="text-slate-600 mb-4">{mission.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Détails de la mission */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informations assigné */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-50/50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <UserIcon size={18} className="text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Assigné à</p>
                              <p className="text-lg font-semibold text-slate-900">{assignee?.full_name || 'Non assigné'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-slate-500">{assignee?.role || '—'}</span>
                                {assignee?.company && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                      <Building size={14} />
                                      {assignee.company}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dates et timeline */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-50/50 rounded-xl p-4 border border-slate-100">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Date de début</p>
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                <span className="font-semibold text-slate-900">{new Date(mission.start_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Date de fin</p>
                              <div className="flex items-center gap-2">
                                <Target size={16} className="text-amber-500" />
                                <span className="font-semibold text-slate-900">{new Date(mission.end_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-600 font-medium">Progression</span>
                              <span className={`font-semibold ${daysLeft > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                                {daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminé'}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${mission.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section droite - Actions */}
                    <div className="lg:w-48 flex flex-col gap-3">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 border border-blue-100">
                        <Eye size={18} />
                        <span>Voir détails</span>
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors duration-200 border border-slate-200">
                        <Edit size={18} />
                        <span>Modifier</span>
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-colors duration-200 border border-rose-200">
                        <Trash2 size={18} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Créer une nouvelle mission</h3>
                    <p className="text-slate-500 mt-1">Remplissez les détails pour assigner une mission</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Titre de la mission *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Audit financier trimestriel"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Décrivez les objectifs, livrables et détails de la mission..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-32 font-medium text-slate-900 placeholder-slate-400 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Assignation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assigner à *
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-medium text-slate-900 cursor-pointer"
                      value={formData.consultant_id}
                      onChange={e => setFormData({...formData, consultant_id: e.target.value})}
                    >
                      <option value="" className="text-slate-400">Sélectionner un collaborateur</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id} className="text-slate-900">
                          {p.full_name} ({p.role})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronRight size={20} className="text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                      value={formData.start_date}
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                      value={formData.end_date}
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                        Création...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        Créer la mission
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}