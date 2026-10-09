import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AIAgentPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('Create a launch brief for my skincare line on TikTok with a premium, high-conversion brand story.');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const runAgent = async () => {
    if (!prompt.trim()) {
      setError('Tell the agent what you want to create or launch.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/ai/agent-chat', { message: prompt, history: chatHistory });
      setResponse(data);
      setChatHistory((current) => [
        ...current,
        { role: 'user', content: prompt },
        { role: 'assistant', content: data.reply || '' },
      ].slice(-6));
    } catch (err) {
      setError(err.response?.data?.detail || 'The AI agent could not respond right now.');
    } finally {
      setLoading(false);
    }
  };

  const applyGeneratedBrief = () => {
    if (!response?.full_brief) return;
    const brief = response.full_brief;
    navigate('/briefs/create', { state: { generatedBrief: brief } });
  };

  return (
    <div className="container-shell py-12 pb-16">
      <div className="mb-8">
        <div className="eyebrow">AI agent</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Launch a smarter creative workflow</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6">
          <label className="label" htmlFor="agent-prompt">Describe your campaign</label>
          <textarea
            id="agent-prompt"
            className="field min-h-[180px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a launch brief for my skincare line on TikTok..."
          />
          <p className="mt-2 text-xs leading-5 text-[var(--ct-slate)]">Add any details you know: product, audience, platform, format, style, runtime, budget, or usage rights. Partial prompts are fine; the agent will call out what still needs your input.</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={runAgent} className="btn-primary" disabled={loading}>
              {loading ? 'Thinking...' : 'Run AI Agent'}
            </button>
            <button onClick={() => setPrompt('Create a launch brief for my skincare line on TikTok with a premium, high-conversion brand story.')} className="btn-secondary">
              Use sample prompt
            </button>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        <div className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="eyebrow">Agent output</div>
            {response?.model_mode && (
              <span className="badge-brand">
                {response.model_mode === 'live' ? 'OmniRoute live model' : 'Local fallback · configure OmniRoute'}
              </span>
            )}
          </div>
          {response ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-2xl border border-[rgba(39,224,195,0.25)] bg-[rgba(39,224,195,0.08)] p-4 text-sm text-slate-700">
                {response.reply}
              </div>

              {!!response.actions?.length && (
                <div>
                  <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Suggested actions</div>
                  <div className="space-y-2">
                    {response.actions.map((action) => (
                      <div key={action.label} className="rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-3 py-2 text-sm text-slate-700">
                        {action.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Run the agent to generate a brief, creative direction, and recommendation plan.</div>
          )}
        </div>
      </div>

      {response?.can_create_brief && response?.brief_preview && (
        <div className="mt-8 surface-card p-6">
          <div className="eyebrow">Brief preview</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Campaign', response.brief_preview.campaign_name],
              ['Platform', response.brief_preview.platform],
              ['Content type', response.brief_preview.content_type],
              ['Style', response.brief_preview.style],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{value || 'Not specified yet'}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Objective</div>
            <div className="mt-2">{response.brief_preview.objective}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={applyGeneratedBrief} className="btn-primary" disabled={!response?.full_brief}>
              Apply to brief builder
            </button>
            <button onClick={() => navigate('/briefs/create')} className="btn-secondary">
              Open brief builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
