import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mission } from '../types';
import { X, FileText, UploadCloud, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  mission: Mission;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ mission, onClose, onSuccess }: ReportModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !period) return setError("Veuillez remplir tous les champs.");
    setLoading(true);
    try {

      const cleanName = file.name
        .normalize("NFD") // Décompose les accents (é devient e + ')
        .replace(/[\u0300-\u036f]/g, "") // Supprime les marques d'accents
        .replace(/\s+/g, '_') // Remplace les espaces par des _
        .replace(/[^a-zA-Z0-9_.-]/g, ''); // Supprime tout caractère spécial restant
      // 2. On crée le chemin final
      const fileName = `${user?.id}/${Date.now()}_${cleanName}`;
      // 3. Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, file);
      if (uploadError) throw new Error("Erreur upload : " + uploadError.message);
      const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('reports').insert({
        mission_id: mission.id,
        consultant_id: user?.id,
        period: period,
        file_url: urlData.publicUrl,
        status: 'SUBMITTED'
      });
      if (dbError) throw dbError;
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideUp_0.3s_ease-out]">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Soumettre un rapport</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
        </div>
        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
          <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Période</label><input type="text" placeholder="Ex: Octobre 2024" className="w-full px-4 py-3 bg-slate-50 border rounded-xl" value={period} onChange={e => setPeriod(e.target.value)} /></div>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 border-slate-300">
            {file ? <div className="text-green-600 font-bold flex flex-col items-center"><FileText size={24}/>{file.name}</div> : <div className="text-slate-400 flex flex-col items-center"><UploadCloud size={24}/><span className="text-xs mt-2">Cliquez pour PDF</span></div>}
            <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <button disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex justify-center">{loading ? <Loader2 className="animate-spin"/> : 'Envoyer'}</button>
        </form>
      </div>
    </div>
  );
}