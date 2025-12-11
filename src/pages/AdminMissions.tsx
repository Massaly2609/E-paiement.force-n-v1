import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Mission } from '../types';
import {
  Plus, Calendar, User as UserIcon, Briefcase, Loader2,
  AlertCircle, X, TextQuote, AlignLeft, Edit, Trash2, Save
} from 'lucide-react';

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour savoir si on modifie une mission existante
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '', description: '', consultant_id: '', start_date: '', end_date: ''
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('missions').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').in('role', ['CONSULTANT', 'MENTOR'])
    ]);
    if (mRes.data) setMissions(mRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  }

  // Ouvrir le modal en mode "Création"
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', consultant_id: '', start_date: '', end_date: '' });
    setIsModalOpen(true);
  };

  // Ouvrir le modal en mode "Modification"
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

  // Gestion de la suppression
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

  // Gestion de la soumission (Création OU Mise à jour)
  // Remplacer toute la fonction handleSubmit par celle-ci :
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    console.log("Tentative de sauvegarde...", { editingId, formData }); // Pour voir dans la console

    // Validation dates
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("La date de fin ne peut pas être antérieure à la date de début.");
      setProcessing(false);
      return;
    }

    let errorResult = null;

    if (editingId) {
      // --- MODE MISE À JOUR ---
      const { error } = await supabase
        .from('missions')
        .update({
          title: formData.title,
          description: formData.description,
          consultant_id: formData.consultant_id,
          start_date: formData.start_date,
          end_date: formData.end_date
        })
        .eq('id', editingId); // Très important : on cible l'ID

      errorResult = error;
    } else {
      // --- MODE CRÉATION ---
      const { error } = await supabase
        .from('missions')
        .insert([formData]);

      errorResult = error;
    }

    if (errorResult) {
      console.error("Erreur Supabase:", errorResult);
      setError(`Erreur : ${errorResult.message}`);
    } else {
      // Succès
      setIsModalOpen(false);
      fetchData(); // Rafraîchir la liste
    }
    setProcessing(false);
  };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setProcessing(true);
  //   setError(null);

  //   // Validation basique des dates
  //   if (new Date(formData.end_date) < new Date(formData.start_date)) {
  //     setError("La date de fin ne peut pas être antérieure à la date de début.");
  //     setProcessing(false);
  //     return;
  //   }

  //   let result;
  //   if (editingId) {
  //     // Mode Mise à jour
  //     result = await supabase
  //       .from('missions')
  //       .update(formData)
  //       .eq('id', editingId);
  //   } else {
  //     // Mode Création
  //     result = await supabase
  //       .from('missions')
  //       .insert([formData]);
  //   }

  //   if (result.error) {
  //     setError(`Erreur : ${result.error.message}.`);
  //   } else {
  //     setIsModalOpen(false);
  //     fetchData();
  //   }
  //   setProcessing(false);
  // };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-[fadeIn_0.5s]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion Missions</h1>
          <p className="text-slate-500">Espace Administrateur</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all">
          <Plus size={20} /> Nouvelle Mission
        </button>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto text-blue-600" size={40} /> : (
        <div className="grid grid-cols-1 gap-4">
          {missions.map((m) => {
            const user = profiles.find(p => p.id === m.consultant_id);
            return (
              <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 w-full">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Briefcase size={24}/></div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 text-lg truncate">{m.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1"><UserIcon size={14}/> {user?.full_name || 'Non assigné'}</span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(m.start_date).toLocaleDateString()} → {new Date(m.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${m.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                     {m.status}
                   </span>

                   <div className="flex items-center border-l border-slate-100 pl-3 ml-1 gap-2">
                     <button
                       onClick={() => openEditModal(m)}
                       className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                       title="Modifier"
                     >
                       <Edit size={18} />
                     </button>
                     <button
                       onClick={() => handleDelete(m.id)}
                       className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       title="Supprimer"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-[slideUp_0.3s]">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-900">
                {editingId ? 'Modifier la Mission' : 'Créer une Mission'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-red-500"/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex gap-2"><AlertCircle size={16}/> {error}</div>}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><TextQuote size={12}/> Titre</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Audit Q1 2024" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><AlignLeft size={12}/> Description</label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails de la mission..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><UserIcon size={12}/> Assigner à</label>
                <select required className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.consultant_id} onChange={e => setFormData({...formData, consultant_id: e.target.value})}>
                  <option value="">Sélectionner...</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Début</label>
                  <input required type="date" className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Fin</label>
                  <input
                    required
                    type="date"
                    // CONTROLE DE DATE : Impossible de choisir une date avant le début
                    min={formData.start_date}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <button disabled={processing} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors flex justify-center items-center gap-2">
                {processing ? <Loader2 className="animate-spin"/> : <><Save size={16}/> {editingId ? 'Enregistrer les modifications' : 'Créer le contrat'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}