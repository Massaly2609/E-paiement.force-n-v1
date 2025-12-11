import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mission } from '../types';
import ReportModal from '../components/ReportModal';
import { Briefcase, Calendar, Clock, AlertCircle, ChevronRight, CheckCircle2, Upload, Target, FileText, Users, TrendingUp, Sparkles, ArrowUpRight, Shield, Zap, BarChart3, Award } from 'lucide-react';

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    async function fetchMissions() {
      if (!user) return;
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('consultant_id', user.id)
        .order('created_at', { ascending: false });

      setMissions(data || []);
      setLoading(false);
    }
    fetchMissions();
  }, [user]);

  // Calcul des statistiques
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const totalMissions = missions.length;

  // Élément de chargement amélioré
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="text-blue-600 animate-pulse" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Chargement de vos missions</h3>
          <p className="text-slate-500 text-sm">Récupération de vos contrats en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
        {/* Header avec statistiques */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-md opacity-70"></div>
                <div className="relative p-3.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/25">
                  <Briefcase className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Missions</h1>
                <p className="text-slate-500 font-medium">Suivez et gérez vos contrats professionnels</p>
              </div>
            </div>

            {missions.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {activeMissions} mission{activeMissions !== 1 ? 's' : ''} active{activeMissions !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {missions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <Target className="text-blue-600" size={20} />
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{totalMissions}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">Total missions</p>
                <p className="text-xs text-slate-500 mt-1">Tous vos contrats</p>
              </div>

              <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                    <Zap className="text-emerald-600" size={20} />
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{activeMissions}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">En cours</p>
                <p className="text-xs text-slate-500 mt-1">Missions actives</p>
              </div>

              <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl">
                    <CheckCircle2 className="text-violet-600" size={20} />
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{completedMissions}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">Terminées</p>
                <p className="text-xs text-slate-500 mt-1">Contrats finalisés</p>
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        {missions.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl border-2 border-dashed border-blue-200/50 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Briefcase className="text-blue-500" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune mission assignée</h3>
              <p className="text-slate-600 mb-6">
                Vous n'avez pas encore de missions en cours. Votre responsable vous assignera des contrats prochainement.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 text-blue-700 font-medium">
                <Clock size={16} />
                <span>En attente d'assignation</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {missions.map((mission) => {
              const daysLeft = Math.ceil((new Date(mission.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isActive = mission.status === 'active';
              const isUrgent = daysLeft <= 3 && daysLeft > 0;

              return (
                <div
                  key={mission.id}
                  className="group relative bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-6 hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Background decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16" />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'
                            : 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200'
                        }`}>
                          <Briefcase size={20} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{mission.title}</h3>
                            {isUrgent && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1">
                                <AlertCircle size={10} />
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Référence: {mission.id.slice(0, 8)}</p>
                        </div>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200'
                          : 'bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600 border-slate-200'
                      }`}>
                        {mission.status}
                      </span>
                    </div>

                    {/* Description */}
                    {mission.description && (
                      <div className="mb-6">
                        <p className="text-slate-600 text-sm line-clamp-2">{mission.description}</p>
                      </div>
                    )}

                    {/* Timeline & Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-blue-500" />
                            <span className="font-medium">Échéance:</span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            {new Date(mission.end_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className={`font-semibold ${isUrgent ? 'text-amber-600' : 'text-blue-600'}`}>
                          {daysLeft > 0 ? `${daysLeft} jours restants` : 'Échéance dépassée'}
                        </span>
                      </div>

                      <div className="h-2 bg-gradient-to-r from-slate-100 to-slate-100/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          }`}
                          style={{
                            width: `${Math.max(0, Math.min(100, daysLeft > 0 ? (30 - daysLeft) / 30 * 100 : 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <FileText size={14} />
                        <span className="font-medium">Rapport attendu</span>
                      </div>
                      <button
                        onClick={() => setSelectedMission(mission)}
                        className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-2">
                          <Upload size={16} />
                          Envoyer le rapport
                          <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de rapport */}
      {selectedMission && (
        <ReportModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onSuccess={() => {
            setSelectedMission(null);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 4000);
          }}
        />
      )}

      {/* Toast de succès amélioré */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-[slideInUp_0.4s_ease-out]">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-emerald-500/25 border border-emerald-400/30 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold">Rapport envoyé avec succès !</p>
              <p className="text-sm text-emerald-100 opacity-90">Il sera examiné par votre responsable.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}