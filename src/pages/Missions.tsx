import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mission } from '../types';
import ReportModal from '../components/ReportModal';
import { Briefcase, Calendar, Clock, AlertCircle, Loader2, ChevronRight, CheckCircle2, Upload, Target } from 'lucide-react';

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
        .eq('consultant_id', user.id) // FILTRE CRITIQUE : SEULEMENT SES MISSIONS
        .order('created_at', { ascending: false });

      setMissions(data || []);
      setLoading(false);
    }
    fetchMissions();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <>
      <div className="space-y-6 animate-[fadeIn_0.5s]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"><Briefcase className="text-white" size={24} /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Missions</h1>
            <p className="text-slate-500">Suivi des contrats et soumission de rapports</p>
          </div>
        </div>

        {missions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border-dashed border-2 text-center text-slate-500">
            <Briefcase size={40} className="mx-auto text-slate-300 mb-3"/>
            <p>Aucune mission ne vous est assignée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={20} /></div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{mission.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{mission.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{mission.description}</p>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Target size={14}/> {new Date(mission.end_date).toLocaleDateString()}</span>
                  <button onClick={() => setSelectedMission(mission)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md">
                    <Upload size={14} /> Envoyer Rapport
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMission && (
        <ReportModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onSuccess={() => {
            setSelectedMission(null);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
          }}
        />
      )}

      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle2 size={20} /> <span className="font-bold">Rapport envoyé !</span>
        </div>
      )}
    </>
  );
}