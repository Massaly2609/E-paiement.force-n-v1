import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, Search, Filter, BarChart3, Eye, Download, ChevronRight, TrendingUp, Shield, Award, Sparkles } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          missions (title)
        `)
        .eq('consultant_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) console.error("Erreur:", error);
      setReports(data || []);
      setLoading(false);
    }
    fetchReports();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-gradient-to-r from-rose-50 to-rose-100/50 text-rose-700 border-rose-200';
      default: return 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Validé & Payé';
      case 'REJECTED': return 'Rejeté';
      default: return 'En attente';
    }
  };

  // Calcul des statistiques
  const totalReports = reports.length;
  const approvedReports = reports.filter(r => r.status === 'APPROVED').length;
  const pendingReports = reports.filter(r => r.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="text-blue-600 animate-pulse" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Chargement de vos rapports</h3>
          <p className="text-slate-500 text-sm">Récupération de votre historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-md opacity-70"></div>
                <div className="relative p-3.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl shadow-purple-500/25">
                  <FileText className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historique des Rapports</h1>
                <p className="text-slate-500 font-medium">Suivez l'état de validation de vos soumissions</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{totalReports}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Total rapports</p>
              <p className="text-xs text-slate-500 mt-1">Toutes vos soumissions</p>
            </div>

            <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{approvedReports}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Validés</p>
              <p className="text-xs text-slate-500 mt-1">Rapports approuvés</p>
            </div>

            <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                  <Clock className="text-amber-600" size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{pendingReports}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">En attente</p>
              <p className="text-xs text-slate-500 mt-1">En cours de validation</p>
            </div>
          </div>
        )}
      </div>

      {/* Reports Content */}
      {reports.length === 0 ? (
        <div className="bg-gradient-to-br from-white via-white to-purple-50/30 rounded-3xl border-2 border-dashed border-purple-200/50 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="text-purple-500" size={32} />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun rapport soumis</h3>
            <p className="text-slate-600 mb-6">
              Vous n'avez pas encore soumis de rapports. Une fois vos missions complétées, vous pourrez envoyer vos comptes-rendus ici.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 text-purple-700 font-medium">
              <Clock size={16} />
              <span>En attente de soumission</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/50">
            <div className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Mission / Période</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Date d'envoi</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Statut</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-right">Document</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100/50">
            {reports.map((report) => (
              <div
                key={report.id}
                className="px-6 py-4 hover:bg-slate-50/30 transition-colors duration-200 group"
              >
                <div className="grid grid-cols-4 gap-4 items-center">
                  {/* Mission / Période */}
                  <div className="py-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-100">
                        <Calendar className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                          {report.missions?.title || "Mission supprimée"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-medium">Période :</span>
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {report.period}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date d'envoi */}
                  <div className="py-2">
                    <div className="space-y-1">
                      <span className="text-sm text-slate-600 font-medium">
                        {new Date(report.submitted_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <p className="text-xs text-slate-400">
                        à {new Date(report.submitted_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="py-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(report.status)}">
                      {getStatusIcon(report.status)}
                      {getStatusLabel(report.status)}
                    </div>
                    {report.status === 'APPROVED' && (
                      <p className="text-xs text-emerald-600 mt-1">• Paiement traité</p>
                    )}
                  </div>

                  {/* Document */}
                  <div className="py-2 text-right">
                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-700 hover:from-slate-100 hover:to-slate-200 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all duration-200 border border-slate-200 group-hover:border-slate-300"
                    >
                      <Eye size={14} />
                      Consulter
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Affichage de <span className="font-bold text-slate-900">{reports.length}</span> rapport{reports.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Award size={14} />
                <span className="font-medium">Dernière mise à jour : aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}