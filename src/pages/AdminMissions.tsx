import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Mission } from '../types';
import {
  Plus, Calendar, User as UserIcon, Briefcase, Loader2,
  AlertCircle, X, TextQuote, AlignLeft, Edit, Trash2, Save,
  Search, Filter, ChevronDown, Clock, CheckCircle, MoreVertical,
  Eye, Download, TrendingUp, Users, BarChart3, Settings
} from 'lucide-react';

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');

  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '', description: '', consultant_id: '', start_date: '', end_date: ''
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = [...missions];

    if (searchQuery) {
      result = result.filter(mission =>
        mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(mission => mission.status === statusFilter);
    }

    result.sort((a, b) => {
      if (dateSort === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

    setFilteredMissions(result);
  }, [missions, searchQuery, statusFilter, dateSort]);

  async function fetchData() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('missions').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').in('role', ['CONSULTANT', 'MENTOR'])
    ]);
    if (mRes.data) {
      setMissions(mRes.data);
      setFilteredMissions(mRes.data);
    }
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  }

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', consultant_id: '', start_date: '', end_date: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (mission: Mission) => {
    setEditingId(mission.id);
    setFormData({
      title: mission.title,
      description: mission.description || '',
      consultant_id: mission.consultant_id,
      start_date: mission.start_date,
      end_date: mission.end_date
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) return;

    setLoading(true);
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
    } else {
      fetchData();
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("La date de fin ne peut pas être antérieure à la date de début.");
      setProcessing(false);
      return;
    }

    let errorResult = null;

    if (editingId) {
      const { error } = await supabase
        .from('missions')
        .update({
          title: formData.title,
          description: formData.description,
          consultant_id: formData.consultant_id,
          start_date: formData.start_date,
          end_date: formData.end_date
        })
        .eq('id', editingId);

      errorResult = error;
    } else {
      const { error } = await supabase
        .from('missions')
        .insert([formData]);

      errorResult = error;
    }

    if (errorResult) {
      console.error("Erreur Supabase:", errorResult);
      setError(`Erreur : ${errorResult.message}`);
    } else {
      setIsModalOpen(false);
      fetchData();
    }
    setProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={12} className="text-emerald-500" />;
      case 'paused': return <Clock size={12} className="text-amber-500" />;
      case 'completed': return <CheckCircle size={12} className="text-blue-500" />;
      default: return <Clock size={12} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Missions</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez les missions et affectations des consultants</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={16} />
                Exporter
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Nouvelle mission
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Missions actives</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {missions.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total missions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{missions.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Briefcase size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Consultants</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{profiles.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {missions.filter(m => new Date(m.start_date) > new Date()).length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Calendar size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une mission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all text-gray-900 font-medium cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminées</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              <div className="relative">
                <select
                  value={dateSort}
                  onChange={(e) => setDateSort(e.target.value as any)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all text-gray-900 font-medium cursor-pointer"
                >
                  <option value="newest">Plus récentes</option>
                  <option value="oldest">Plus anciennes</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Missions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 size={32} className="text-gray-400 animate-spin" />
            </div>
            <p className="mt-4 text-gray-500">Chargement des missions...</p>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission trouvée</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucune mission ne correspond à vos critères.'
                : 'Commencez par créer votre première mission.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Créer une mission
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMissions.map((mission) => {
              const consultant = profiles.find(p => p.id === mission.consultant_id);
              const daysLeft = Math.ceil((new Date(mission.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={mission.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Briefcase size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mission.status)}`}>
                              {getStatusIcon(mission.status)}
                              {mission.status}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {mission.description || 'Aucune description fournie.'}
                          </p>

                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon size={14} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Consultant</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {consultant?.full_name || 'Non assigné'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar size={14} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Période</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(mission.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(mission.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Clock size={14} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Temps restant</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {daysLeft > 0 ? `${daysLeft} jours` : 'Terminée'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(mission)}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(mission.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl animate-[slideUp_0.3s]">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Modifier la mission' : 'Nouvelle mission'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Mettez à jour les détails de la mission' : 'Remplissez les informations pour créer une nouvelle mission'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-3">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la mission
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Audit stratégique Q1 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigner à
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all cursor-pointer"
                    value={formData.consultant_id}
                    onChange={e => setFormData({...formData, consultant_id: e.target.value})}
                  >
                    <option value="">Sélectionner un consultant...</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role === 'CONSULTANT' ? 'Consultant' : 'Mentor'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez les objectifs, livrables et spécificités de la mission..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    required
                    type="date"
                    min={formData.start_date}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? 'Mettre à jour' : 'Créer la mission'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}