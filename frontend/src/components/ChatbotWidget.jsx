import { useEffect, useState } from 'react';
import api from '../services/api';

const starterPrompts = [
  'Suggest creators for a skincare launch',
  'Find a premium video creator in India',
  'Recommend AI creators for TikTok ads',
];

const buildCreatorSuggestionText = (creators) => {
  if (!creators?.length) return 'No creator profiles matched those keywords. Try a broader niche, tool, or content format.';

  const names = creators
    .slice(0, 3)
    .map((creator) => `${creator.name} (${creator.specializations?.[0] || 'AI creator'})`)
    .join(', ');

  return `Creator profiles with overlapping skills, tools, or specialties: ${names}. Open a profile to check portfolio details and licensing before shortlisting.`;
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelMode, setModelMode] = useState('checking');
  const [provider, setProvider] = useState('OmniRoute');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I can help with creator recommendations, campaign ideas, and brand brief strategy.',
    },
  ]);

  useEffect(() => {
    api.get('/ai/status')
      .then(({ data }) => {
        setModelMode(data.mode || 'unavailable');
        setProvider(data.provider || 'OmniRoute');
      })
      .catch(() => setModelMode('unavailable'));
  }, []);

  const fetchSuggestedCreators = async (prompt) => {
    const lower = prompt.toLowerCase();
    const categories = [
      { pattern: /skincare|beauty|cosmetic|makeup|wellness/, terms: ['beauty', 'skincare', 'cosmetic', 'wellness'] },
      { pattern: /fashion|style|apparel|clothing|lifestyle/, terms: ['fashion', 'style', 'lifestyle', 'apparel'] },
      { pattern: /tech|technology|product|startup|saas/, terms: ['product', 'technology', 'tech', 'startup', 'saas'] },
      { pattern: /food|restaurant|cafe|drink|beverage/, terms: ['food', 'restaurant', 'cafe', 'drink', 'beverage'] },
      { pattern: /travel|hotel|hospitality|tourism/, terms: ['travel', 'hotel', 'hospitality'] },
      { pattern: /video|film|reel|tiktok|youtube|advert|commercial/, terms: ['video', 'film', 'advertisement', 'ai filmmaking'] },
      { pattern: /image|art|design|graphic|illustration/, terms: ['image', 'art', 'design', 'generative art'] },
      { pattern: /animation|motion|animated/, terms: ['animation', 'motion'] },
    ];
    const ignored = new Set(['suggest', 'recommend', 'creator', 'creators', 'talent', 'find', 'match', 'please', 'help', 'with', 'for', 'the', 'and', 'from', 'that', 'this', 'brand', 'campaign']);
    const promptTerms = lower.match(/[a-z0-9+#]+/g)?.filter((term) => term.length > 2 && !ignored.has(term)) || [];
    const { data } = await api.get('/creators');
    const ranked = (data.creators || []).map((creator) => {
      const profileText = [
        creator.name, creator.bio, creator.location,
        ...(creator.specializations || []), ...(creator.skills || []),
        ...(creator.tools || []), ...(creator.content_types || []), ...(creator.formats || []),
      ].join(' ').toLowerCase();
      let score = 0;
      for (const category of categories) {
        if (category.pattern.test(lower) && category.terms.some((term) => profileText.includes(term))) score += 3;
      }
      for (const term of promptTerms) {
        if (profileText.includes(term)) score += 1;
      }
      return { creator, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    return ranked.slice(0, 3).map((item) => item.creator);
  };

  const sendMessage = async (promptOverride) => {
    const value = (promptOverride ?? input).trim();
    if (!value || loading) return;

    setMessages((current) => [...current, { role: 'user', text: value }]);
    setInput('');
    setLoading(true);

    try {
      const wantsCreators = /\b(creator|creators|talent|influencer|filmmaker|animator|artist)\b/i.test(value)
        && /\b(recommend|suggest|match|find|search|shortlist|discover|hire|source|which|best)\b/i.test(value);
      const history = messages
        .slice(1)
        .slice(-8)
        .map(({ role, text }) => ({ role, content: text }));
      const creatorRequest = wantsCreators
        ? fetchSuggestedCreators(value).catch(() => [])
        : Promise.resolve([]);
      const [creatorMatches, agentResponse] = await Promise.all([
        creatorRequest,
        api.post('/ai/agent-chat', { message: value, history }),
      ]);
      const { data } = agentResponse;
      const reply = data.reply || 'I can help refine that strategy for you.';
      setModelMode(data.model_mode || 'unavailable');
      if (data.provider) setProvider(data.provider);
      setMessages((current) => [...current, { role: 'assistant', text: reply }]);

      if (wantsCreators) {
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            text: buildCreatorSuggestionText(creatorMatches),
          },
        ]);
      }
    } catch (error) {
      setModelMode('unavailable');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error.response?.data?.detail || 'I hit a temporary issue. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[360px] overflow-hidden rounded-[24px] border border-[var(--ct-border)] bg-[var(--ct-panel)] shadow-[0_20px_60px_rgba(15,23,42,0.3)]">
          <div className="flex items-center justify-between border-b border-[var(--ct-border)] bg-[#0b1720] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">AI</div>
              <div>
                <div className="text-sm font-semibold">CreatorTwin AI</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                  {modelMode === 'live' ? `${provider} live model` : modelMode === 'live_configured' ? `${provider} configured` : modelMode === 'local_fallback' ? `Local fallback · add ${provider} key` : modelMode === 'checking' ? 'Checking model...' : 'Model unavailable'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-sm text-slate-300 hover:text-white">Close</button>
          </div>

          <div className="max-h-[380px] space-y-3 overflow-y-auto bg-[var(--ct-bg)] p-4">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    msg.role === 'user'
                      ? 'bg-[var(--ct-teal)] text-[var(--ct-cream)]'
                      : 'border border-[var(--ct-border)] bg-[var(--ct-panel)] text-[var(--ct-ink)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel)] px-3 py-2 text-sm text-[var(--ct-slate)]">Thinking...</div>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--ct-border)] bg-[var(--ct-panel)] p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[11px] text-[var(--ct-ink)] transition hover:border-[var(--ct-teal)] hover:bg-[var(--ct-panel)]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
                placeholder="Describe your campaign, creator search, or follow-up..."
                className="field flex-1 border-slate-200 bg-slate-50"
              />
              <button onClick={() => sendMessage()} className="btn-primary px-4 py-2" disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl text-white shadow-[0_20px_40px_rgba(15,23,42,0.2)] transition hover:scale-105"
          aria-label="Open AI assistant"
        >
          ✦
        </button>
      )}
    </div>
  );
}
