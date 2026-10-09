import { useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const workflow = [
  ['pending', 'Request'],
  ['accepted', 'Accepted'],
  ['in_progress', 'In production'],
  ['delivered', 'Delivered'],
  ['completed', 'Complete'],
];

function humanStatus(status) {
  return ({ pending: 'Request sent', accepted: 'Accepted', in_progress: 'In production', delivered: 'Delivered for review', revision_requested: 'Revision requested', completed: 'Completed', rejected: 'Declined', cancelled: 'Cancelled' })[status] || status;
}

export default function EngagementsPage() {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState([]);
  const [reviewsSubmitted, setReviewsSubmitted] = useState({});
  const [reviewForms, setReviewForms] = useState({});
  const [deliveryForms, setDeliveryForms] = useState({});
  const [revisionForms, setRevisionForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const isBrand = user?.role === 'brand';

  const load = async () => {
    try {
      const { data } = await api.get('/engagements');
      const base = data.engagements || [];
      const enriched = await Promise.all(base.map(async (item) => {
        const [briefResult, creatorResult] = await Promise.all([
          api.get(`/briefs/${item.brief_id}`).catch(() => null),
          api.get(`/creators/${item.creator_id}`).catch(() => null),
        ]);
        return {
          ...item,
          brief: briefResult?.data?.brief || null,
          creator: creatorResult?.data?.creator || null,
        };
      }));
      setEngagements(enriched);

      const completed = enriched.filter((item) => item.status === 'completed');
      const reviewChecks = await Promise.all(completed.map(async (item) => {
        const reviewUrl = isBrand ? `/creators/${item.creator_id}/reviews` : `/brands/${item.brand_id}/reviews`;
        const response = await api.get(reviewUrl).catch(() => ({ data: { reviews: [] } }));
        const submitted = (response.data.reviews || []).some((review) => review.engagement_id === item.id && review.reviewer_id === user?.id);
        return [item.id, submitted];
      }));
      setReviewsSubmitted(Object.fromEntries(reviewChecks));
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to load engagements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const updateStatus = async (item, status) => {
    setMessage('');
    try {
      await api.put(`/engagements/${item.id}/status?status=${status}`);
      await load();
      setMessage(`Project updated: ${humanStatus(status)}.`);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to update this project.');
    }
  };

  const updateProjectForm = (setter, item, field, value) => setter((current) => ({
    ...current,
    [item.id]: { ...current[item.id], [field]: value },
  }));

  const submitDelivery = async (item) => {
    const form = deliveryForms[item.id] || {};
    try {
      await api.post(`/engagements/${item.id}/deliveries`, { delivery_url: form.url, delivery_note: form.note });
      await load();
      setMessage('Delivery attached and sent to the brand for review.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to submit this delivery.');
    }
  };

  const requestRevision = async (item) => {
    const form = revisionForms[item.id] || {};
    try {
      await api.post(`/engagements/${item.id}/revisions`, { revision_notes: form.notes });
      await load();
      setMessage('Revision notes sent to the creator.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to request this revision.');
    }
  };

  const submitReview = async (item) => {
    const form = reviewForms[item.id] || { rating: '5', review_title: '', review_text: '' };
    const revieweeId = isBrand ? item.creator_id : item.brand_id;
    const revieweeRole = isBrand ? 'creator' : 'brand';
    try {
      await api.post('/reviews', {
        engagement_id: item.id,
        reviewee_id: revieweeId,
        reviewee_role: revieweeRole,
        rating: Number(form.rating),
        review_title: form.review_title,
        review_text: form.review_text,
      });
      setReviewsSubmitted((current) => ({ ...current, [item.id]: true }));
      setMessage('Review submitted.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to submit review.');
    }
  };

  const reviewField = (item, field, value) => setReviewForms((current) => ({
    ...current,
    [item.id]: { rating: '5', review_title: '', review_text: '', ...current[item.id], [field]: value },
  }));

  const progressIndex = (status) => status === 'revision_requested' ? 2 : workflow.findIndex(([key]) => key === status);

  return (
    <div className="container-shell py-12">
      <div className="mb-6">
        <div className="eyebrow">Project delivery</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Engagements</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Track each project from request through delivery, revisions, approval, and feedback.</p>
      </div>

      {message && <div className="notice-positive mb-4 rounded-lg px-3 py-2 text-sm">{message}</div>}

      {loading ? (
        <div className="text-slate-600">Loading engagements...</div>
      ) : engagements.length === 0 ? (
        <EmptyState title="No engagement requests yet." description="Create a brief or match with a creator to start a project." />
      ) : (
        <div className="space-y-5">
          {engagements.map((item) => {
            const currentStep = progressIndex(item.status);
            const terminal = ['rejected', 'cancelled'].includes(item.status);
            const form = reviewForms[item.id] || { rating: '5', review_title: '', review_text: '' };
            return (
              <article key={item.id} className="surface-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="eyebrow">{item.brief?.brand_name || 'Campaign'}</div>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{item.brief?.campaign_name || `Brief ${item.brief_id}`}</h2>
                    <p className="mt-1 text-sm text-slate-600">{isBrand ? `Creator: ${item.creator?.name || item.creator_id}` : `Brand: ${item.brief?.brand_name || 'Project partner'}`}</p>
                  </div>
                  <span className="badge capitalize">{humanStatus(item.status)}</span>
                </div>

                {!terminal && (
                  <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Project progress">
                    {workflow.map(([key, label], index) => {
                      const complete = currentStep >= index;
                      return <li key={key} className={`rounded-xl border p-3 text-center text-xs ${complete ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-[var(--ct-border)] bg-[var(--ct-panel-alt)] text-slate-500'}`}>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em]">0{index + 1}</span>
                        <span className="mt-1 block font-medium">{label}</span>
                      </li>;
                    })}
                  </ol>
                )}

                <p className="mt-4 text-sm leading-6 text-slate-700">{item.message || 'No message attached.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge">Budget: {item.budget || 'To discuss'}</span>
                  <span className="badge">Deadline: {item.deadline || 'To agree'}</span>
                  {item.brief?.content_type && <span className="badge">{item.brief.content_type}</span>}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {item.status === 'pending' && !isBrand && <>
                    <button onClick={() => updateStatus(item, 'accepted')} className="btn-primary">Accept request</button>
                    <button onClick={() => updateStatus(item, 'rejected')} className="btn-secondary">Decline</button>
                  </>}
                  {item.status === 'pending' && isBrand && <button onClick={() => updateStatus(item, 'cancelled')} className="btn-secondary">Withdraw request</button>}
                  {item.status === 'accepted' && !isBrand && <button onClick={() => updateStatus(item, 'in_progress')} className="btn-primary">Start production</button>}
                  {item.status === 'in_progress' && !isBrand && <div className="w-full rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                    <h3 className="font-semibold text-slate-900">Submit a delivery</h3>
                    <p className="mt-1 text-xs text-slate-600">Attach a reviewable file link and describe what you are submitting.</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div><label className="label" htmlFor={`delivery-url-${item.id}`}>Delivery URL</label><input id={`delivery-url-${item.id}`} type="url" className="field" value={deliveryForms[item.id]?.url || ''} onChange={(event) => updateProjectForm(setDeliveryForms, item, 'url', event.target.value)} placeholder="https://..." required /></div>
                      <div><label className="label" htmlFor={`delivery-note-${item.id}`}>Delivery notes</label><textarea id={`delivery-note-${item.id}`} className="field min-h-[44px]" value={deliveryForms[item.id]?.note || ''} onChange={(event) => updateProjectForm(setDeliveryForms, item, 'note', event.target.value)} placeholder="Version, format, and what is ready to review" required /></div>
                    </div>
                    <button onClick={() => submitDelivery(item)} disabled={!(deliveryForms[item.id]?.url || '').trim() || (deliveryForms[item.id]?.note || '').trim().length < 8} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-50">Send delivery for review</button>
                  </div>}
                  {item.status === 'delivered' && isBrand && <>
                    <button onClick={() => updateStatus(item, 'completed')} className="btn-primary">Approve delivery</button>
                    <div className="w-full rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                      <label className="label" htmlFor={`revision-notes-${item.id}`}>Revision notes</label>
                      <textarea id={`revision-notes-${item.id}`} className="field min-h-[88px]" value={revisionForms[item.id]?.notes || ''} onChange={(event) => updateProjectForm(setRevisionForms, item, 'notes', event.target.value)} placeholder="List the specific updates needed before approval." />
                      <button onClick={() => requestRevision(item)} disabled={(revisionForms[item.id]?.notes || '').trim().length < 8} className="btn-secondary mt-3 disabled:cursor-not-allowed disabled:opacity-50">Send revision request</button>
                    </div>
                  </>}
                  {item.status === 'revision_requested' && !isBrand && <button onClick={() => updateStatus(item, 'in_progress')} className="btn-primary">Resume revisions</button>}
                  {terminal && <p className="text-sm text-slate-500">This request is closed.</p>}
                </div>

                {item.deliveries?.length > 0 && <section className="mt-5 rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Delivery history</h3>
                  <div className="mt-3 space-y-3">{[...item.deliveries].reverse().map((delivery) => <div key={`${item.id}-delivery-${delivery.version}`} className="border-l-2 border-teal-500 pl-3">
                    <div className="text-xs font-semibold text-slate-700">Version {delivery.version} · {delivery.submitted_at ? new Date(delivery.submitted_at).toLocaleString() : 'Submitted'}</div>
                    <a href={delivery.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-medium text-teal-800 underline">Open submitted work</a>
                    {delivery.notes && <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-600">{delivery.notes}</p>}
                  </div>)}</div>
                </section>}

                {item.revision_requests?.length > 0 && <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-950">Revision history</h3>
                  <div className="mt-2 space-y-3">{[...item.revision_requests].reverse().map((revision) => <div key={`${item.id}-revision-${revision.round}`}>
                    <div className="text-xs font-semibold text-amber-900">Round {revision.round} · {revision.requested_at ? new Date(revision.requested_at).toLocaleString() : 'Requested'}</div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-amber-950">{revision.notes}</p>
                  </div>)}</div>
                </section>}

                {item.status === 'delivered' && isBrand && item.deliveries?.length === 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This older demo delivery has no attached review link. New deliveries include the submitted work.</p>}

                {item.status === 'completed' && (
                  <div className="mt-6 rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                    {reviewsSubmitted[item.id] ? <p className="text-sm font-medium text-teal-800">Your feedback is on the {isBrand ? 'creator' : 'brand'} profile.</p> : (
                      <>
                        <h3 className="font-semibold text-slate-900">Leave collaboration feedback</h3>
                        <p className="mt-1 text-xs text-slate-600">Only completed engagements can receive a review.</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                          <div><label className="label" htmlFor={`rating-${item.id}`}>Rating</label><select id={`rating-${item.id}`} className="field" value={form.rating} onChange={(event) => reviewField(item, 'rating', event.target.value)}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></div>
                          <div><label className="label" htmlFor={`review-title-${item.id}`}>Review title</label><input id={`review-title-${item.id}`} className="field" value={form.review_title} onChange={(event) => reviewField(item, 'review_title', event.target.value)} placeholder="What stood out?" /></div>
                          <div className="sm:col-span-2"><label className="label" htmlFor={`review-text-${item.id}`}>Your feedback</label><textarea id={`review-text-${item.id}`} className="field min-h-[80px]" value={form.review_text} onChange={(event) => reviewField(item, 'review_text', event.target.value)} placeholder="Share useful, specific feedback..." required /></div>
                        </div>
                        <button onClick={() => submitReview(item)} disabled={!form.review_text.trim()} className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-50">Submit review</button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
