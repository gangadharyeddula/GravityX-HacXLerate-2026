import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

export default function VerificationReviewPage() {
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/verification/requests');
      setRequests(data.requests || []);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to load the review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (request, status) => {
    setMessage('');
    const reviewNote = (notes[request.id] || '').trim();
    if (status === 'rejected' && !reviewNote) {
      setMessage('Add a short note explaining what evidence is still needed.');
      return;
    }
    try {
      await api.put(`/verification/${request.id}/decision`, { status, review_note: reviewNote });
      setMessage(`Request ${status === 'verified' ? 'approved' : 'returned for evidence'}.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to save this decision.');
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><div className="eyebrow">Trust &amp; review</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Creator verification queue</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review creator submitted evidence before showing a verified signal on their profile.</p></div>
        <span className="badge">{requests.filter((request) => request.status === 'pending').length} awaiting review</span>
      </div>
      {message && <div className="notice-positive mb-5 rounded-lg px-3 py-2 text-sm">{message}</div>}
      {loading ? <div className="text-slate-600">Loading review queue...</div> : requests.length === 0 ? <EmptyState title="No verification submissions yet." description="A creator request will appear here with its claim and evidence link or note." /> : (
        <div className="space-y-4">
          {requests.map((request) => {
            const evidence = request.evidence || '';
            const publicLink = /^https?:\/\//i.test(evidence.trim()) ? evidence.trim() : null;
            return <article key={request.id} className="surface-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="eyebrow">{request.type}</div><h2 className="mt-1 text-xl font-semibold text-slate-900">{request.creator?.name || 'Creator'}</h2><p className="mt-1 text-xs text-slate-500">Submitted {request.submitted_at ? new Date(request.submitted_at).toLocaleString() : 'recently'}</p></div>
                <span className={`badge ${request.status === 'verified' ? 'text-emerald-700' : request.status === 'rejected' ? 'text-rose-700' : ''}`}>{request.status === 'verified' ? 'Verified' : request.status === 'rejected' ? 'Needs evidence' : 'Pending'}</span>
              </div>
              <div className="mt-4 rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence supplied</div>
                {publicLink ? <a className="mt-2 block break-all text-sm font-medium text-teal-800 underline" href={publicLink} target="_blank" rel="noreferrer">{publicLink}</a> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{evidence || 'No evidence provided.'}</p>}
                {request.creator?.id && <Link to={`/creators/${request.creator.id}`} className="mt-3 inline-flex text-sm font-medium text-teal-800 underline">Open creator profile</Link>}
              </div>
              {request.review_note && <p className="mt-3 text-sm text-slate-600"><strong>Reviewer note:</strong> {request.review_note}</p>}
              {request.status === 'pending' && <div className="mt-4">
                <label className="label" htmlFor={`review-note-${request.id}`}>Decision note</label>
                <textarea id={`review-note-${request.id}`} className="field min-h-[80px]" value={notes[request.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Summarize what you reviewed; explain missing evidence if returning this request." />
                <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decide(request, 'verified')} className="btn-primary">Approve verification</button><button onClick={() => decide(request, 'rejected')} disabled={!(notes[request.id] || '').trim()} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">Request more evidence</button></div>
              </div>}
            </article>;
          })}
        </div>
      )}
    </div>
  );
}
