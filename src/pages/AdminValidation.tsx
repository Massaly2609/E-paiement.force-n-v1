import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  FileText, Loader2, ExternalLink, CheckCircle, XCircle,
  CreditCard, Smartphone, Banknote, X, User, Calendar,
  Clock, Eye, ChevronRight, Filter, Search, Download,
  TrendingUp, DollarSign, AlertCircle, Shield
} from 'lucide-react';

export default function AdminValidation() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('ORANGE_MONEY');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchSubmittedReports(); }, []);

  async function fetchSubmittedReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles (full_name, id, balance, phone, avatar_url),
        missions (title, start_date, end_date)
      `)
      .eq('status', 'SUBMITTED')
      .order('submitted_at', { ascending: false });

    if (error) console.error("Erreur chargement:", error);
    setReports(data || []);
    setLoading(false);
  }

  const openPaymentModal = (report: any) => {
    setSelectedReport(report);
    setPaymentModalOpen(true);
  };

  const handleReject = async (reportId: string) => {
    if(!window.confirm("Voulez-vous rejeter ce rapport ?")) return;

    setProcessing(true);
    await supabase.from('reports').update({ status: 'REJECTED' }).eq('id', reportId);
    setProcessing(false);
    fetchSubmittedReports();
  };

  const handlePaymentConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setProcessing(true);

    try {
      const paymentAmount = 250000;

      const { error: payError } = await supabase.from('payments').insert([{
        amount: paymentAmount,
        status: 'COMPLETED',
        method: paymentMethod,
        created_at: new Date().toISOString(),
      }]);

      if (payError) throw payError;

      const currentBalance = selectedReport.profiles?.balance || 0;
      await supabase.from('profiles')
        .update({ balance: currentBalance + paymentAmount })
        .eq('id', selectedReport.consultant_id);

      await supabase.from('reports')
        .update({ status: 'APPROVED' })
        .eq('id', selectedReport.id);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery ?
      report.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.missions?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.period?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

    const matchesFilter = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    pending: reports.length,
    paid: 0,
    total: reports.length,
    amount: reports.length * 250000
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-gray-400 mx-auto" size={32} />
          <p className="mt-4 text-gray-500">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Validation & Paiements</h1>
              <p className="text-sm text-gray-500 mt-1">Validez les rapports et effectuez les paiements</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={16} />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Montant total</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {stats.amount.toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Payés</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.paid}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle size={20} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total rapports</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <FileText size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un rapport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all text-gray-900 font-medium cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="SUBMITTED">En attente</option>
                  <option value="APPROVED">Approuvés</option>
                  <option value="REJECTED">Rejetés</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucun rapport ne correspond à vos critères.'
                : 'Tous les rapports ont été traités.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const consultant = report.profiles;
              const mission = report.missions;
              const daysSince = Math.ceil((new Date().getTime() - new Date(report.submitted_at).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={report.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{mission?.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {report.status === 'SUBMITTED' ? 'En attente' :
                               report.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-600">{consultant?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar size={12} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-600">{report.period}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <Clock size={12} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-600">
                                Soumis il y a {daysSince} jour{daysSince !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                              Voir le rapport
                              <ExternalLink size={12} />
                            </a>
                            <div className="text-sm font-medium text-gray-900">
                              250 000 FCFA
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(report.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Rejeter"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          onClick={() => openPaymentModal(report)}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Payer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-[slideUp_0.3s]">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Effectuer le paiement</h3>
                <p className="text-sm text-gray-500 mt-1">Confirmez les détails du paiement</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handlePaymentConfirm} className="p-8 space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Bénéficiaire</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedReport.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Smartphone size={14} />
                      {selectedReport.profiles?.phone || "Numéro non renseigné"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Moyen de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ORANGE_MONEY')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      OM
                    </div>
                    <span className="text-sm font-medium">Orange Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WAVE')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'WAVE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      W
                    </div>
                    <span className="text-sm font-medium">Wave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VISA')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'VISA'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="text-sm font-medium">Carte Visa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Banknote size={24} />
                    <span className="text-sm font-medium">Espèces</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à verser
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono font-semibold text-gray-900 text-lg flex justify-between items-center">
                  <span>250 000</span>
                  <span className="text-gray-600 text-sm">FCFA</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirmer le paiement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}