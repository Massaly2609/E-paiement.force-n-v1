import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Briefcase,
  FileText, CheckCircle, Clock, AlertCircle, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => {
  const colorClasses: any = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', decor: 'bg-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', decor: 'bg-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', decor: 'bg-orange-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', decor: 'bg-purple-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', decor: 'bg-red-600' },
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Définition des Rôles pour la lisibilité
  const isInternal = user?.role === 'ADMIN' || user?.role === 'VALIDATION';
  const isConsultant = user?.role === 'CONSULTANT' || user?.role === 'MENTOR';

  useEffect(() => {
    // Simulation des données selon le rôle (A remplacer par des appels Supabase réels plus tard)
    const loadStats = () => {
      if (user?.role === 'ADMIN') {
        setStats([
          { title: "Trésorerie Globale", value: "24.5M FCFA", icon: DollarSign, color: "green", trend: 12 },
          { title: "Validations en attente", value: "12", icon: Clock, color: "orange", trend: 5 },
          { title: "Missions Actives", value: "34", icon: Briefcase, color: "blue" },
          { title: "Utilisateurs Total", value: "128", icon: Users, color: "purple", trend: 8 },
        ]);
      } else if (user?.role === 'VALIDATION') {
        setStats([
          { title: "À Valider (Urgent)", value: "8", icon: AlertCircle, color: "orange", trend: 2 },
          { title: "Paiements du mois", value: "4.2M FCFA", icon: DollarSign, color: "green" },
          { title: "Rapports Traités", value: "156", icon: CheckCircle, color: "blue", trend: 14 },
          { title: "Rejets", value: "3", icon: FileText, color: "red", trend: -1 },
        ]);
      } else {
        // Consultant & Mentor
        setStats([
          { title: "Mon Solde", value: (user?.balance || 0).toLocaleString('fr-FR') + " FCFA", icon: DollarSign, color: "green" },
          { title: "Mes Rapports", value: "12", icon: FileText, color: "purple" },
          { title: "Missions en cours", value: "2", icon: Briefcase, color: "blue" },
          { title: "En attente paiement", value: "150 000 F", icon: Clock, color: "orange" },
        ]);
      }
      setLoading(false);
    };

    loadStats();
  }, [user]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s]">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isInternal ? "Vue d'ensemble" : "Mon Espace"}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Bonjour {user?.full_name}, voici ce qu'il se passe aujourd'hui.
          </p>
        </div>
        {isConsultant && (
          <button
            onClick={() => navigate('/missions')}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition flex items-center gap-2"
          >
            <Plus size={16} /> Nouveau Rapport
          </button>
        )}
      </div>

      {/* Cartes Statistiques Dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Tableau des Transactions */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800">
              {isInternal ? "Derniers virements effectués" : "Mes derniers paiements"}
            </h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">TOUT VOIR</button>
          </div>
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
               <tr>
                 <th className="px-6 py-3">Réf</th>
                 <th className="px-6 py-3">{isInternal ? "Bénéficiaire" : "Mission"}</th>
                 <th className="px-6 py-3">Date</th>
                 <th className="px-6 py-3">Montant</th>
                 <th className="px-6 py-3 text-right">Statut</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {[1, 2, 3].map((i) => (
                 <tr key={i} className="hover:bg-slate-50 transition">
                   <td className="px-6 py-3 font-mono text-slate-500">PAY-24-00{i}</td>
                   <td className="px-6 py-3 font-medium text-slate-700">
                     {isInternal ? "Moussa Diop" : "Audit Fin. Q3"}
                   </td>
                   <td className="px-6 py-3 text-slate-500">1{i} Oct 2024</td>
                   <td className="px-6 py-3 font-bold text-slate-800">{(450000 + i*10000).toLocaleString()} F</td>
                   <td className="px-6 py-3 text-right">
                     <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Payé</span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>

        {/* Sidebar Actions & Activité */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} /></div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
               {user?.role === 'ADMIN' && (
                 <>
                   <button onClick={() => navigate('/missions')} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">Nouvelle Mission</button>
                   <button onClick={() => navigate('/users')} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">Gérer Users</button>
                   <button onClick={() => navigate('/validation')} className="col-span-2 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-sm font-bold shadow-lg transition">Centre de Validation</button>
                 </>
               )}
               {(user?.role === 'CONSULTANT' || user?.role === 'MENTOR') && (
                 <>
                   <button onClick={() => navigate('/missions')} className="col-span-2 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-sm font-bold shadow-lg transition flex justify-center items-center gap-2"><Plus size={16}/> Soumettre Rapport</button>
                   <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">Mon Profil</button>
                   <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-xs font-bold transition border border-white/10 backdrop-blur-sm">Support</button>
                 </>
               )}
               {user?.role === 'VALIDATION' && (
                 <button onClick={() => navigate('/validation')} className="col-span-2 bg-orange-600 hover:bg-orange-500 p-3 rounded-lg text-sm font-bold shadow-lg transition">Commencer les validations</button>
               )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Fil d'actualité</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
               <div className="relative pl-8">
                 <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                 <p className="text-sm font-medium text-slate-800">Rapport "Mission Alpha" soumis</p>
                 <span className="text-[10px] text-slate-400 block mt-1">Il y a 2h</span>
               </div>
               <div className="relative pl-8">
                 <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                 <p className="text-sm font-medium text-slate-800">Virement reçu (Ref: TRX-99)</p>
                 <span className="text-[10px] text-slate-400 block mt-1">Hier</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}