import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Card = ({ label, value, hint }) => (
  <div className="surface-card p-5">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">{value}</div>
    {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Find a premium skincare launch campaign for creators in India on Instagram.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const endpoint = user?.role === 'brand' ? '/dashboard/brand' : '/dashboard/creator';
        const { data } = await api.get(endpoint);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load dashboard.');
      }
    }
    if (user) loadData();
  }, [user]);

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError('');

    try {
      const { data } = await api.post('/ai/agent-chat', { message: aiPrompt });
      setAiResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to generate AI suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiBrief = () => {
    if (!aiResult?.full_brief) return;
    navigate('/briefs/create', { state: { generatedBrief: aiResult.full_brief } });
  };

  if (!user) return null;

  return (
    <div className="container-shell py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Welcome back, {user.name}</h1>
        </div>
        {user.role === 'brand' ? (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/briefs/create')} className="btn-primary">Create Brief</button>
            <button onClick={() => navigate('/creators')} className="btn-secondary">Find Creators</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/profile')} className="btn-primary">Edit Profile</button>
            <button onClick={() => navigate('/portfolio')} className="btn-secondary">Add Portfolio</button>
          </div>
        )}
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {user.role === 'brand' && data && (
        <>
          <div className="surface-card mb-8 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">AI assistant</div>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ct-ink)]">What are you creating?</h2>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="field flex-1"
                placeholder="Describe your product, audience, and platform..."
              />
              <button onClick={handleAiSearch} disabled={aiLoading} className="btn-primary md:min-w-[160px]">
                {aiLoading ? 'Thinking...' : 'Generate ideas'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-5 rounded-[16px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                <div className="text-sm font-medium text-[var(--ct-ink)]">AI suggestion</div>
                <div className="mt-2 text-base text-[var(--ct-slate)]">{aiResult.reply}</div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Campaign', aiResult.brief_preview?.campaign_name],
                    ['Platform', aiResult.brief_preview?.platform],
                    ['Format', aiResult.brief_preview?.content_type],
                    ['Style', aiResult.brief_preview?.style],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[12px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ct-slate)]">{label}</div>
                      <div className="mt-1 font-semibold text-[var(--ct-ink)]">{value || '—'}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={applyAiBrief} className="btn-primary" disabled={!aiResult.full_brief}>Use in brief builder</button>
                  <button onClick={() => navigate('/briefs/create')} className="btn-secondary">Open brief</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card label="My Briefs" value={data.total_briefs || 0} />
            <Card label="Published briefs" value={data.published_briefs || 0} />
            <Card label="Requests" value={data.engagement_requests || 0} />
            <Card label="Accepted engagements" value={data.accepted_engagements || 0} />
            <Card label="Drafts" value={data.draft_briefs || 0} />
          </div>

          <div className="mt-8 surface-card p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--ct-ink)]">Recent briefs</h2>
              <Link to="/briefs" className="text-sm font-medium text-[var(--ct-teal)]">View all</Link>
            </div>
            {data.recent_briefs?.length ? (
              <div className="space-y-3">
                {data.recent_briefs.map((brief) => (
                  <div key={brief.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--ct-border)] p-4">
                    <div>
                      <div className="font-semibold text-[var(--ct-ink)]">{brief.campaign_name}</div>
                      <div className="text-sm text-[var(--ct-slate)]">{brief.status}</div>
                    </div>
                    <Link to={`/briefs/${brief.id}/matches`} className="text-sm font-medium text-[var(--ct-teal)]">Matching creators</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--ct-slate)]">No briefs yet. Create a brief to get started.</div>
            )}
          </div>
        </>
      )}

      {user.role === 'creator' && data && (
        <>
          <div className="surface-card mb-8 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">AI assistant</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Find your next best opportunity</h2>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="field flex-1"
                placeholder="Ask for the best brief match, creator positioning, or portfolio growth idea..."
              />
              <button onClick={handleAiSearch} disabled={aiLoading} className="btn-primary md:min-w-[150px]">
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-5 rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                <div className="text-sm font-medium text-[var(--ct-teal)]">AI opportunity match</div>
                <div className="mt-2 text-base text-slate-700">{aiResult.reply}</div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Campaign', aiResult.brief_preview?.campaign_name],
                    ['Platform', aiResult.brief_preview?.platform],
                    ['Format', aiResult.brief_preview?.content_type],
                    ['Audience', aiResult.brief_preview?.target_audience],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
                      <div className="mt-1 font-semibold text-slate-900">{value || '—'}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => navigate('/briefs')} className="btn-primary">Browse matching briefs</button>
                  <button onClick={() => navigate('/profile')} className="btn-secondary">Improve profile</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card label="Profile completion" value={`${data.profile_completion || 0}%`} />
            <Card label="Portfolio count" value={data.portfolio_count || 0} />
            <Card label="Matching briefs" value={data.matching_briefs || 0} />
            <Card label="Pending requests" value={data.pending_requests || 0} />
            <Card label="Accepted engagements" value={data.accepted_engagements || 0} />
          </div>

          <div className="mt-8 surface-card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Profile completeness</h2>
            <div className="mt-4 text-lg font-medium text-slate-800">{data.profile_completion || 0}%</div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${data.profile_completion || 0}%` }} />
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              {['Basic information', 'Skills', 'Tools', 'Portfolio', 'Workflow', 'Commercial rights'].map((item) => {
                const missing = (data.missing_fields || []).includes(item);
                return (
                  <div key={item} className="flex items-center gap-2">
                    <span>{missing ? '⚠' : '✓'}</span>
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate('/profile')} className="btn-primary">Edit Profile</button>
              <button onClick={() => navigate('/portfolio')} className="btn-secondary">Add Portfolio</button>
              <button onClick={() => navigate('/briefs')} className="btn-secondary">Browse Matching Briefs</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
