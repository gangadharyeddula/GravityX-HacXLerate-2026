import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PortfolioMedia from '../components/PortfolioMedia';

function verificationLabel(record) {
  if (record.status === 'demo' || record.evidence === 'Demo Verified Signal') return 'Demo signal';
  if (record.status === 'pending' || record.status === 'in_review') return 'In review';
  if (record.status === 'rejected') return 'Needs more evidence';
  if (record.status === 'verified' || record.status === 'approved') return 'Verified';
  return 'Submitted';
}

export default function CreatorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviewData, setReviewData] = useState({ reviews: [], count: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [creatorResponse, portfolioResponse, reviewResponse] = await Promise.all([
          api.get(`/creators/${id}`),
          api.get(`/creators/${id}/portfolio`).catch(() => ({ data: { portfolio: [] } })),
          api.get(`/creators/${id}/reviews`).catch(() => ({ data: { reviews: [], count: 0, average_rating: 0 } })),
        ]);
        if (!active) return;
        setCreator(creatorResponse.data.creator);
        setPortfolio(portfolioResponse.data.portfolio || []);
        setReviewData(reviewResponse.data);
      } catch {
        if (active) setCreator(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="container-shell py-12 text-slate-600">Loading creator profile...</div>;
  if (!creator) return <div className="container-shell py-12 text-red-600">Creator not found.</div>;

  const verification = Array.isArray(creator.verification) ? creator.verification : [];

  return (
    <div className="container-shell py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="eyebrow">Creator profile</div>
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-5">
          {creator.profile_image ? <img src={creator.profile_image} alt={creator.name} className="h-[360px] w-full rounded-[14px] object-cover xl:h-[420px]" /> : <div aria-label={creator.name} className="flex h-[360px] w-full items-center justify-center rounded-[14px] bg-[var(--ct-panel-alt)] text-6xl font-semibold text-[var(--ct-teal)] xl:h-[420px]">{creator.name?.slice(0, 1) || '?'}</div>}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ct-ink)]">{creator.name}</h1>
            {verification.length > 0 && verification.map((record) => (
              <span key={record.id} className="badge-brand">{verificationLabel(record)} &middot; {record.type}</span>
            ))}
            {creator.external_profile ? <span className="badge">Public source · not verified</span> : !verification.length && <span className="badge">No verification data</span>}
          </div>

          <div className="mt-2 text-sm text-[var(--ct-slate)]">{[creator.location, creator.availability].filter(Boolean).join(' · ') || 'Location and availability not added'}</div>

          <div className="mt-5 border-t border-[var(--ct-border)] pt-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">Specialization</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(creator.specializations || []).map((item) => <span key={item} className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[11px] text-[var(--ct-ink)]">{item}</span>)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ct-slate)]">Client rating</div>
              <div className="mt-2 text-lg font-semibold text-[var(--ct-ink)]">
                {reviewData.count ? `${reviewData.average_rating} / 5` : 'No reviews yet'}
              </div>
              {reviewData.count > 0 && <div className="mt-1 text-xs text-[var(--ct-slate)]">{reviewData.count} completed collaboration{reviewData.count === 1 ? '' : 's'}</div>}
            </div>
            <div className="rounded-[12px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ct-slate)]">Starting rate</div>
              <div className="mt-2 text-lg font-semibold text-[var(--ct-ink)]">{creator.rate || 'Ask for a quote'}</div>
            </div>
          </div>

          {creator.external_profile ? (
            <a href={creator.source_url} target="_blank" rel="noreferrer" className="btn-primary mt-5 block w-full text-center">Open {creator.source_platform || 'public'} profile ↗</a>
          ) : (
            <button onClick={() => navigate('/briefs')} className="btn-primary mt-5 w-full">Discuss a project</button>
          )}
        </aside>

        <div className="space-y-6">
          {creator.external_profile && (
            <section className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--ct-ink)]">Public portfolio preview · creator has not joined CreatorTwin</div>
                  <p className="mt-1 text-sm leading-6 text-[var(--ct-slate)]">{creator.source_note} Rights and profile details have not been independently verified. Contact the creator for permission before reuse.</p>
                </div>
                <a href={creator.source_url} target="_blank" rel="noreferrer" className="btn-secondary shrink-0">View {creator.source_platform} ↗</a>
              </div>
            </section>
          )}

          <section className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-6">
            <div className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">About</div>
            <p className="text-base leading-7 text-[var(--ct-ink)]">{creator.bio || 'This creator has not added a bio yet.'}</p>
            {(creator.commercial_use || creator.licensing_notes || creator.usage_rights) && <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {creator.commercial_use && <div className="rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-3"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ct-slate)]">Commercial use</div><p className="mt-1 text-sm leading-5 text-[var(--ct-ink)]">{creator.commercial_use}</p></div>}
              {creator.licensing_notes && <div className="rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-3"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ct-slate)]">Licensing</div><p className="mt-1 text-sm leading-5 text-[var(--ct-ink)]">{creator.licensing_notes}</p></div>}
              {creator.usage_rights && <div className="rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-3"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ct-slate)]">Usage rights</div><p className="mt-1 text-sm leading-5 text-[var(--ct-ink)]">{creator.usage_rights}</p></div>}
            </div>}
          </section>

          <section className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-6">
            <div className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">Skills & tools</div>
            <div className="flex flex-wrap gap-2">
              {(creator.skills || []).map((skill) => <span key={skill} className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[11px] text-[var(--ct-ink)]">{skill}</span>)}
              {(creator.tools || []).map((tool) => <span key={tool} className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[11px] text-[var(--ct-slate)]">{tool}</span>)}
            </div>
          </section>

          <section className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">{creator.external_profile ? 'Public portfolio' : 'Selected AI work'}</div>
              <span className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[10px] font-medium text-[var(--ct-ink)]">{portfolio.length} project{portfolio.length === 1 ? '' : 's'}</span>
            </div>

            {portfolio.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--ct-slate)]">No portfolio projects have been published yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {portfolio.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[14px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)]">
                    <PortfolioMedia item={item} />
                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-[var(--ct-ink)]">{item.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {item.content_type && <span className="badge">{item.content_type}</span>}
                          {item.verification?.status === 'demo' && <span className="badge">Illustrative demo item</span>}
                          {item.rights_status === 'unverified' && <span className="badge">Rights unverified</span>}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ct-slate)]">{item.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[...(item.models || []), ...(item.tools || [])].map((tool) => <span key={`${item.id}-${tool}`} className="badge">{tool}</span>)}
                        {item.ai_provenance === 'not_disclosed' && <span className="badge">AI use not disclosed</span>}
                        {item.ai_provenance === 'creator_described' && <span className="badge">AI use creator-described</span>}
                        {!(item.models || []).length && <span className="badge">Model not disclosed</span>}
                        {!(item.tools || []).length && <span className="badge">Project tools not disclosed</span>}
                      </div>
                      {item.workflow?.length > 0 && (
                        <p className="mt-3 text-xs leading-5 text-[var(--ct-slate)]"><strong className="text-[var(--ct-ink)]">Workflow:</strong> {item.workflow.join(' → ')}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--ct-slate)]">
                        {item.aspect_ratio && <span>{item.aspect_ratio}</span>}
                        {item.duration && <span>{item.duration}</span>}
                        {item.commercial_use && <span>{item.commercial_use}</span>}
                      </div>
                      {item.usage_rights && <p className="mt-2 text-xs leading-5 text-[var(--ct-slate)]"><strong className="text-[var(--ct-ink)]">Usage rights:</strong> {item.usage_rights}</p>}
                      {item.licensing_notes && <p className="mt-2 text-xs leading-5 text-[var(--ct-slate)]">{item.licensing_notes}</p>}
                      {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-[var(--ct-teal)] hover:underline">View original work on {item.source_platform || 'source'} ↗</a>}
                      {item.creator_attribution && <div className="mt-2 text-xs text-[var(--ct-slate)]">Creator attribution: {item.creator_attribution}</div>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">Client feedback</div>
              <span className="text-xs text-[var(--ct-slate)]">Completed collaborations</span>
            </div>
            {reviewData.reviews?.length ? (
              <div className="space-y-4">
                {reviewData.reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[var(--ct-ink)]">{review.review_title || 'Client review'}</h3>
                      <span className="badge-brand">{review.rating} / 5</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ct-slate)]">{review.review_text}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--ct-slate)]">Reviews appear here after a project is delivered and approved.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
