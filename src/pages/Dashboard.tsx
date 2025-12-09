import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, FileText, ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => {
  const colorClasses: any = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', decor: 'bg-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', decor: 'bg-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', decor: 'bg-orange-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', decor: 'bg-purple-600' },
  };
  const theme = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute right-0 top-0 w-24 h-24 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity ${theme.decor}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text}`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
             {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
             {Math.abs(trend)}%
           </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">{title}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    pending: 0,
    missions: 0,
    reports: 0
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchData = async () => {
       // In a real scenario, use supabase.rpc or specific queries
       setStats({
         balance: user?.balance || 2450000,
         pending: 3,
         missions: 12,
         reports: 5
       });
    };
    fetchData();
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdmin ? "Vue d'ensemble de la plateforme et des performances." : "Suivez vos activités et vos revenus en temps réel."}
          </p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition">
          Télécharger le rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={isAdmin ? "Trésorerie" : "Mon Solde"} value={stats.balance.toLocaleString('fr-FR') + " FCFA"} icon={DollarSign} color="green" trend={12} />
        <StatCard title="En attente" value={stats.pending} icon={TrendingUp} color="orange" trend={-2} />
        <StatCard title={isAdmin ? "Missions Actives" : "Mes Missions"} value={stats.missions} icon={Briefcase} color="blue" />
        <StatCard title={isAdmin ? "Utilisateurs" : "Rapports"} value={isAdmin ? 48 : stats.reports} icon={isAdmin ? Users : FileText} color="purple" trend={8} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800">Dernières transactions</h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">VOIR TOUT</button>
          </div>
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
               <tr>
                 <th className="px-6 py-3">Réf</th>
                 <th className="px-6 py-3">Bénéficiaire</th>
                 <th className="px-6 py-3">Date</th>
                 <th className="px-6 py-3">Montant</th>
                 <th className="px-6 py-3 text-right">Statut</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {[1,2,3,4].map((i) => (
                 <tr key={i} className="hover:bg-slate-50 transition">
                   <td className="px-6 py-3 font-mono text-slate-500">TRX-2024-00{i}</td>
                   <td className="px-6 py-3 font-medium text-slate-700">Moussa Diop</td>
                   <td className="px-6 py-3 text-slate-500">12 Oct 2024</td>
                   <td className="px-6 py-3 font-bold text-slate-800">450 000 F</td>
                   <td className="px-6 py-3 text-right">
                     <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Payé</span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} /></div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
               <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">
                 Nouvelle Mission
               </button>
               <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">
                 Inviter User
               </button>
               <button className="col-span-2 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-sm font-bold shadow-lg transition">
                 Gérer les Paiements
               </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Activité récente</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
               {[1,2,3].map((i) => (
                 <div key={i} className="relative pl-8">
                   <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                   <p className="text-sm font-medium text-slate-800">Nouveau rapport soumis</p>
                   <p className="text-xs text-slate-500 mt-0.5">Par Jean Diop pour la mission Alpha.</p>
                   <span className="text-[10px] text-slate-400 block mt-1">Il y a 2h</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
