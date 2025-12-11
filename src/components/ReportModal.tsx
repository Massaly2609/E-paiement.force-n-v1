import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mission } from '../types';
import { X, FileText, UploadCloud, Loader2, Calendar, FileUp } from 'lucide-react';

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
    if (!file || !period) {
      setError("Veuillez sélectionner un fichier et spécifier une période");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '');

      const fileName = `${user?.id}/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('reports').insert({
        mission_id: mission.id,
        consultant_id: user?.id,
        period: period,
        file_url: urlData.publicUrl,
        status: 'SUBMITTED'
      });

      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop avec flou subtil */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-100 animate-in fade-in-0 zoom-in-95">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Soumettre un rapport
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Mission: {mission.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleUpload} className="p-8 space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Champ Période */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-slate-400" />
                Période du rapport
              </div>
            </label>
            <input
              type="text"
              placeholder="Ex: Octobre 2024"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                       placeholder:text-slate-400 text-slate-700 transition-all"
              disabled={loading}
            />
          </div>

          {/* Zone de dépôt de fichier */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <FileUp size={16} className="text-slate-400" />
                Fichier PDF
              </div>
            </label>

            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-200 ${
                loading
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                  : file
                  ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <FileText size={24} className="text-emerald-600" />
                  </div>
                  <p className="font-medium text-emerald-700">{file.name}</p>
                  <p className="text-sm text-emerald-600">
                    Cliquez pour changer de fichier
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <UploadCloud size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">
                      Déposer votre PDF ici
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Formats acceptés: .pdf uniquement
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || !file || !period}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold
                     hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50
                     disabled:cursor-not-allowed transition-all duration-200
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                <span>Soumettre le rapport</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}