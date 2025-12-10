import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mission } from '../types';
import ReportModal from '../components/ReportModal';
import { Briefcase, Calendar, Clock, AlertCircle, Loader2, ChevronRight, CheckCircle } from 'lucide-react';

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    async function fetchMissions() {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('consultant_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMissions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMissions();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-blue-600 gap-4">
      <Loader2 className="animate-spin" size={32} />
      <p className="text-sm font-bold uppercase tracking-widest">Chargement des missions...</p>
    </div>
  );

  return (
    <> {/* Début du fragment obligatoire */}
      <div className="space-y-6 animate-[fadeIn_0.4s]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mes Missions</h1>
            <p className="text-slate-500 font-medium">Consultez vos contrats actifs et envoyez vos rapports.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {missions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">Aucune mission assignée</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6">
                  {/* ... Contenu de la carte identique ... */}
                  <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">{mission.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{mission.description}</p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                    VOIR DÉTAILS <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedMission(mission)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition"
                  >
                    Envoyer Rapport
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL : Rendue à l'intérieur du fragment */}
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

      {/* TOAST : Rendu à l'intérieur du fragment */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeInUp_0.3s] z-[70]">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">Rapport soumis avec succès !</span>
        </div>
      )}
    </>
  );
}