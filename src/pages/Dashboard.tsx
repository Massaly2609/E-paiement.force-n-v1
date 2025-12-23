import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Users, Briefcase, FileText, Wallet, Loader2,
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usersCount: 0,
    activeMissions: 0,
    pendingReports: 0,
    totalPaid: 0,
    myBalance: 0
  });

  const isAdminOrValidation = user?.role === 'ADMIN' || user?.role === 'VALIDATION';

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      try {
        if (isAdminOrValidation) {
          // --- STATISTIQUES POUR L'ADMIN ---

          // 1. Compter les utilisateurs
          const { count: users } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

          // 2. Compter les missions actives
          const { count: missions } = await supabase
            .from('missions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

          // 3. Compter les rapports en attente de validation
          const { count: reports } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'SUBMITTED');

          // 4. Calculer le total payé (Somme de la table payments)
          const { data: payments } = await supabase
            .from('payments')
            .select('amount');

          const totalAmount = payments?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

          setStats({
            usersCount: users || 0,
            activeMissions: missions || 0,
            pendingReports: reports || 0,
            totalPaid: totalAmount,
            myBalance: 0
          });

        } else {
          // --- STATISTIQUES POUR CONSULTANT / MENTOR ---

          // 1. Mes missions actives
          const { count: missions } = await supabase
            .from('missions')
            .select('*', { count: 'exact', head: true })
            .eq('consultant_id', user?.id)
            .eq('status', 'active');

          // 2. Mes rapports en attente
          const { count: reports } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('consultant_id', user?.id)
            .eq('status', 'SUBMITTED');

          // 3. Mon solde (récupéré depuis le profil connecté)
          // Déjà disponible via user?.balance, mais on peut le rafraîchir
          const { data: profile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user?.id)
            .single();

          setStats({
            usersCount: 0,
            activeMissions: missions || 0,
            pendingReports: reports || 0,
            totalPaid: 0,
            myBalance: profile?.balance || 0
          });
        }
      } catch (error) {
        console.error("Erreur stats dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user, isAdminOrValidation]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      {/* SECTION 1 : LES CARTES DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* CARTE 1 : UTILISATEURS (Admin) ou SOLDE (Consultant) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAdminOrValidation ? 'Utilisateurs' : 'Mon Solde'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {isAdminOrValidation ? stats.usersCount : stats.myBalance.toLocaleString() + " F"}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${isAdminOrValidation ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {isAdminOrValidation ? <Users size={24} /> : <Wallet size={24} />}
          </div>
        </div>

        {/* CARTE 2 : MISSIONS ACTIVES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missions en cours</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.activeMissions}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Briefcase size={24} />
          </div>
        </div>

        {/* CARTE 3 : RAPPORTS EN ATTENTE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAdminOrValidation ? 'Validations en attente' : 'Rapports envoyés'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingReports}</h3>
          </div>
          <div className={`p-3 rounded-xl ${stats.pendingReports > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <FileText size={24} />
          </div>
        </div>

        {/* CARTE 4 : TOTAL PAYÉ (Admin uniquement) */}
        {isAdminOrValidation && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Décaissé</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{(stats.totalPaid / 1000000).toFixed(1)}M</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2 : MESSAGE DE BIENVENUE OU ACTIONS RAPIDES */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Bonjour, {user?.full_name} 👋</h2>
          <p className="text-blue-100 mb-6">
            {isAdminOrValidation
              ? "Vous avez des rapports en attente de validation. Vérifiez-les pour maintenir le flux de paiement."
              : "N'oubliez pas de soumettre vos rapports avant le 25 du mois pour assurer un traitement rapide."}
          </p>

          <div className="flex gap-4">
            {isAdminOrValidation ? (
              <a href="#/validation" className="px-5 py-2.5 bg-white text-[#003366] rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                <CheckCircle2 size={18} /> Aller aux validations
              </a>
            ) : (
              <a href="#/missions" className="px-5 py-2.5 bg-white text-[#003366] rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Briefcase size={18} /> Voir mes missions
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 : ACTIVITÉ RÉCENTE (Placeholder visuel pour habiller) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-slate-400" /> Activité récente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-sm text-slate-600">Système mis à jour et opérationnel.</p>
            <span className="text-xs text-slate-400 ml-auto">À l'instant</span>
          </div>
          {stats.pendingReports > 0 && (
            <div className="flex items-center gap-4 py-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <p className="text-sm text-slate-600">
                {isAdminOrValidation
                  ? `Vous avez ${stats.pendingReports} rapports à traiter.`
                  : `Vous avez ${stats.pendingReports} rapports en cours de traitement.`}
              </p>
              <span className="text-xs text-slate-400 ml-auto">Aujourd'hui</span>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}