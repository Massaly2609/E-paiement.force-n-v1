import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, TrendingUp, Calendar, ArrowUpRight,
  ArrowDownLeft, Search, Filter, Download, Loader2, Wallet,
  Banknote, DollarSign, CheckCircle2, Clock, AlertCircle,
  TrendingDown, Users, Building, ChevronRight, Sparkles
} from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0, pending: 0 });

  const isAdminOrValidation = user?.role === 'ADMIN' || user?.role === 'VALIDATION';

  useEffect(() => {
    async function fetchPayments() {
      if (!user) return;
      setLoading(true);

      let query = supabase
        .from('payments')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (!isAdminOrValidation) {
        // Pour l'instant, simulons que le filtre se fait côté client ou via une policy si la colonne user_id manque
        // query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur paiements:", error);
      } else {
        setTransactions(data || []);

        const total = data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
        setStats({
          total: total,
          count: data?.length || 0,
          pending: 0
        });
      }
      setLoading(false);
    }

    fetchPayments();
  }, [user, isAdminOrValidation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="text-blue-600 animate-pulse" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Chargement des transactions</h3>
          <p className="text-slate-500 text-sm">Récupération de vos données financières...</p>
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
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-70"></div>
                <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25">
                  <Wallet className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {isAdminOrValidation ? "Trésorerie & Virements" : "Mes Paiements"}
                </h1>
                <p className="text-slate-500 font-medium">
                  {isAdminOrValidation
                    ? "Suivi global des flux financiers sortants"
                    : "Consultez l'historique de vos revenus"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
              <Download size={18} />
              <span>Exporter CSV</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Carte Solde / Total */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl border border-blue-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp size={12} />
                  <span>+12%</span>
                </div>
                <span className="text-xs text-slate-500">ce mois</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">
              {isAdminOrValidation ? "Total Versé" : "Solde Actuel"}
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {isAdminOrValidation
                ? stats.total.toLocaleString() + " FCFA"
                : (user?.balance || 0).toLocaleString() + " FCFA"
              }
            </h3>
          </div>

          {/* Carte Transactions */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
                <CreditCard className="text-slate-600" size={20} />
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-blue-600">+3</span>
                <span className="text-xs text-slate-500 block">ce mois</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Transactions</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.count}</h3>
            <p className="text-xs text-slate-400 mt-1">Virements effectués</p>
          </div>

          {/* Carte Moyenne */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-600">↑ 8%</span>
                <span className="text-xs text-slate-500 block">vs mois dernier</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Moyenne</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {stats.count > 0 ? (stats.total / stats.count).toLocaleString('fr-FR', {
                maximumFractionDigits: 0
              }) + " F" : "0 F"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Par transaction</p>
          </div>

          {/* Carte Action */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
                <Banknote className="text-white" size={20} />
              </div>
              <span className="text-white font-semibold text-sm">Configuration</span>
            </div>
            <div className="space-y-2">
              <button className="w-full text-center bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                Relevé bancaire
              </button>
              <button className="w-full text-center bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Historique des transactions</h3>
              <p className="text-sm text-slate-500">Suivi détaillé de tous les mouvements</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-64"
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Référence
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Bénéficiaire
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl mb-4">
                        <Wallet className="text-slate-400" size={40} />
                      </div>
                      <p className="text-slate-700 font-medium mb-1">Aucune transaction trouvée</p>
                      <p className="text-slate-500 text-sm">
                        {isAdminOrValidation
                          ? "Aucun paiement n'a été effectué pour le moment"
                          : "Vous n'avez pas encore reçu de paiements"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((trx, index) => (
                  <tr
                    key={trx.id}
                    className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50/30"
                  >
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                        TRX-{new Date(trx.created_at).getFullYear()}-{1000+index}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="text-indigo-600" size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {trx.profiles?.full_name || user?.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {trx.profiles?.email || user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="text-sm text-slate-600 font-medium">
                          {new Date(trx.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <p className="text-xs text-slate-400">
                          {new Date(trx.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        <CreditCard size={12} />
                        {trx.method || 'Virement bancaire'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="text-emerald-600" size={16} />
                        <span className="text-lg font-bold text-slate-900">
                          {(trx.amount || 0).toLocaleString()} FCFA
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span className="uppercase font-bold">COMPLETED</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Affichage de <span className="font-bold text-slate-900">{transactions.length}</span> transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Système de paiement opérationnel</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">Dernière mise à jour : aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}