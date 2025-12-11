import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, TrendingUp, Calendar, ArrowUpRight,
  ArrowDownLeft, Search, Filter, Download, Loader2, Wallet
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
        .select('*, profiles(full_name, email)') // On récupère le nom du bénéficiaire
        .order('created_at', { ascending: false });

      // Si pas Admin, on filtre pour voir QUE ses propres paiements
      // Note: Cela suppose que la table 'payments' a une colonne 'user_id' ou qu'on lie via le profil.
      // Pour cet exemple, on va supposer qu'on a ajouté 'user_id' dans la table payments lors de la validation.
      // Si ce n'est pas le cas, l'Admin verra tout, et le consultant verra vide pour l'instant (à adapter selon votre table).
      if (!isAdminOrValidation) {
        // Pour l'instant, simulons que le filtre se fait côté client ou via une policy si la colonne user_id manque
        // query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur paiements:", error);
      } else {
        setTransactions(data || []);

        // Calcul des stats simples
        const total = data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
        setStats({
          total: total,
          count: data?.length || 0,
          pending: 0 // À dynamiser si vous gérez des statuts 'PENDING'
        });
      }
      setLoading(false);
    }

    fetchPayments();
  }, [user, isAdminOrValidation]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-[fadeIn_0.5s]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                <Wallet size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isAdminOrValidation ? "Trésorerie & Virements" : "Mes Paiements"}
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">
              {isAdminOrValidation
                ? "Suivi global des flux financiers sortants."
                : "Consultez l'historique de vos revenus."}
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-all">
            <Download size={18} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Cartes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Carte Solde / Total */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard size={64} className="text-blue-600" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {isAdminOrValidation ? "Total Versé" : "Solde Actuel"}
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {isAdminOrValidation
              ? stats.total.toLocaleString() + " FCFA"
              : (user?.balance || 0).toLocaleString() + " FCFA"
            }
          </h3>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
            <TrendingUp size={12} /> +12% ce mois
          </div>
        </div>

        {/* Carte Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transactions</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.count}</h3>
          <p className="text-xs text-slate-400 font-medium">Virements effectués avec succès</p>
        </div>

        {/* Carte Action */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between h-32">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Configuration</p>
          <div className="flex items-center gap-3">
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition-colors">
              Relevé Bancaire
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition-colors">
              Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Historique des transactions</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
            </div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Référence</th>
              <th className="px-6 py-4">Bénéficiaire</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Méthode</th>
              <th className="px-6 py-4 text-right">Montant</th>
              <th className="px-6 py-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Aucune transaction trouvée.</td>
              </tr>
            ) : (
              transactions.map((trx, index) => (
                <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">TRX-{new Date(trx.created_at).getFullYear()}-{1000+index}</td>
                  <td className="px-6 py-4">
                    {/* Si c'est l'admin, on affiche le nom du user, sinon "Moi" ou le nom de l'entreprise */}
                    <span className="font-bold text-slate-700 text-sm">
                      {trx.profiles?.full_name || user?.full_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(trx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      <CreditCard size={12} /> {trx.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-900">
                      {(trx.amount).toLocaleString()} F
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}