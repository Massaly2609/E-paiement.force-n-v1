import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Report, Profile, Mission } from '../types';
import { CheckCircle, XCircle, FileText, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminValidation() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { fetchSubmittedReports(); }, []);

  async function fetchSubmittedReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*, profiles(full_name), missions(title)')
      .eq('status', 'SUBMITTED')
      .order('submitted_at', { ascending: false });

    if (data) setReports(data);
    setLoading(false);
  }

  const handleAction = async (reportId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setProcessingId(reportId);
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
    if (!error) fetchSubmittedReports();
    setProcessingId(null);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Validations en attente</h1>

      {reports.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed text-center text-slate-500">Aucun rapport en attente de validation.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-lg"><FileText size={24} /></div>
                <div>
                  <h3 className="font-bold text-slate-900">{report.missions?.title}</h3>
                  <p className="text-sm text-slate-500">{report.profiles?.full_name} • Période: {report.period}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href={report.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mr-4">
                  VOIR PDF <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleAction(report.id, 'REJECTED')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                ><XCircle size={22} /></button>
                <button
                  onClick={() => handleAction(report.id, 'APPROVED')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-green-700 transition"
                  disabled={processingId === report.id}
                >
                  {processingId === report.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Approuver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}