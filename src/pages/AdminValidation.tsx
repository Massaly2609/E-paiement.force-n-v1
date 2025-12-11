import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  FileText, Loader2, ExternalLink, CheckCircle, XCircle,
  CreditCard, Smartphone, Banknote, X
} from 'lucide-react';

export default function AdminValidation() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la Modal de Paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('ORANGE_MONEY'); // 'WAVE', 'VISA', 'CASH'
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchSubmittedReports(); }, []);

  async function fetchSubmittedReports() {
    setLoading(true);
    // Requête simplifiée pour éviter les erreurs de jointure
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles (full_name, id, balance, phone),
        missions (title)
      `)
      .eq('status', 'SUBMITTED')
      .order('submitted_at', { ascending: false });

    if (error) console.error("Erreur chargement:", error);
    setReports(data || []);
    setLoading(false);
  }

  // Étape 1 : Ouvrir la fenêtre de paiement
  const openPaymentModal = (report: any) => {
    setSelectedReport(report);
    setPaymentModalOpen(true);
  };

  // Étape 2 : Exécuter le rejet (Pas de paiement)
  const handleReject = async (reportId: string) => {
    if(!window.confirm("Voulez-vous rejeter ce rapport ?")) return;

    setProcessing(true);
    await supabase.from('reports').update({ status: 'REJECTED' }).eq('id', reportId);
    setProcessing(false);
    fetchSubmittedReports();
  };

  // Étape 3 : Exécuter le Paiement et la Validation
  const handlePaymentConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setProcessing(true);

    try {
      const paymentAmount = 250000; // À dynamiser selon la mission

      // 1. Enregistrer le paiement dans l'historique
      const { error: payError } = await supabase.from('payments').insert([{
        amount: paymentAmount,
        status: 'COMPLETED',
        method: paymentMethod, // Wave, OM, etc.
        created_at: new Date().toISOString(),
        // On pourrait ajouter profile_id ici si votre table le permet
      }]);

      if (payError) throw payError;

      // 2. Mettre à jour le solde du consultant
      const currentBalance = selectedReport.profiles?.balance || 0;
      await supabase.from('profiles')
        .update({ balance: currentBalance + paymentAmount })
        .eq('id', selectedReport.consultant_id);

      // 3. Passer le rapport en APPROVED
      await supabase.from('reports')
        .update({ status: 'APPROVED' })
        .eq('id', selectedReport.id);

      // Succès
      setPaymentModalOpen(false);
      fetchSubmittedReports();
      alert(`Paiement de ${paymentAmount} FCFA effectué via ${paymentMethod} !`);

    } catch (err: any) {
      console.error("Erreur paiement:", err);
      alert("Erreur : " + err.message);
    } finally {
      setProcessing(false);
    }
  };



  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      <h1 className="text-2xl font-extrabold text-slate-900">Validations & Paiements</h1>

      {reports.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-slate-300" size={32} />
          </div>
          <h3 className="text-slate-800 font-bold">Tout est à jour</h3>
          <p className="text-slate-500 text-sm">Aucun rapport en attente de validation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 text-orange-600 p-4 rounded-xl"><FileText size={24} /></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{report.missions?.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{report.profiles?.full_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{report.period}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <a href={report.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                  <ExternalLink size={16} /> Voir PDF
                </a>

                <button onClick={() => handleReject(report.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                  <XCircle size={24} />
                </button>

                <button onClick={() => openPaymentModal(report)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all">
                  <CheckCircle size={18} /> <span>Payer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE PAIEMENT */}
      {paymentModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideUp_0.3s]">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Effectuer le paiement</h3>
              <button onClick={() => setPaymentModalOpen(false)}><X size={20} className="text-slate-400"/></button>
            </div>

            <form onSubmit={handlePaymentConfirm} className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Bénéficiaire</p>
                <p className="font-bold text-slate-900 text-lg">{selectedReport.profiles?.full_name}</p>
                <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                  <Smartphone size={14}/> {selectedReport.profiles?.phone || "Numéro non renseigné"}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">Moyen de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('ORANGE_MONEY')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500 hover:border-orange-200'}`}>
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">OM</div>
                    <span className="text-xs font-bold">Orange Money</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('WAVE')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'WAVE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-200'}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">W</div>
                    <span className="text-xs font-bold">Wave</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('VISA')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'VISA' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}>
                    <CreditCard size={20} />
                    <span className="text-xs font-bold">Carte Visa</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('CASH')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-emerald-200'}`}>
                    <Banknote size={20} />
                    <span className="text-xs font-bold">Espèces</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Montant à verser</label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-lg flex justify-between items-center">
                  <span>250 000</span>
                  <span className="text-slate-500 text-sm">FCFA</span>
                </div>
              </div>

              <button disabled={processing} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex justify-center items-center gap-2">
                {processing ? <Loader2 className="animate-spin" /> : 'Confirmer le paiement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}