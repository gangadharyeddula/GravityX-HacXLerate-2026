import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COUNTRY_OPTIONS, COUNTRY_CURRENCY_MAP, formatLocalCurrencyDisplay } from '../services/currency';
import RightsPresetPicker, { RIGHTS_PRESETS } from '../components/RightsPresetPicker';

const initialBrief = {
  campaign_name: '',
  brand_name: 'Demo Brand',
  description: '',
  objective: '',
  content_type: 'Video',
  style: 'Cinematic',
  target_audience: '',
  location: 'India',
  language: 'English',
  platform: 'Instagram',
  aspect_ratio: '9:16',
  duration: '30 seconds',
  required_tools: ['Runway', 'ChatGPT'],
  required_skills: ['Prompt Engineering', 'Video Editing'],
  required_specialization: ['AI Filmmaking'],
  budget: '$1500',
  country: 'India',
  currency: 'INR',
  project_type: 'Video',
  deadline: '',
  commercial_use_required: 'Commercial work available',
  licensing_requirement: 'Commercial licensing required',
  usage_rights: '',
  reference_links: [],
  additional_requirements: '',
  status: 'published',
};

export default function BriefCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [idea, setIdea] = useState('I need a 30 second cinematic AI advertisement for a new energy drink targeting college students in India for Instagram.');
  const [brief, setBrief] = useState(initialBrief);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatReply, setChatReply] = useState('');
  const [chatModelMode, setChatModelMode] = useState('');

  useEffect(() => {
    const generatedBrief = location.state?.generatedBrief;
    if (generatedBrief) {
      setBrief((current) => ({ ...current, ...generatedBrief }));
      if (generatedBrief.description) setIdea(generatedBrief.description);
    }
  }, [location.state]);

  const estimatedLocalPrice = useMemo(() => {
    const baseValue = Number(String(brief.budget || '1500').replace(/[^0-9.]/g, '')) || 1500;
    return formatLocalCurrencyDisplay(baseValue, brief.country || 'India');
  }, [brief.budget, brief.country]);

  const generateBrief = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/brief-builder', { idea });
      const generated = { ...initialBrief, ...data.brief, description: idea };
      setBrief(generated);
      setMessage('Structured brief generated successfully.');
    } catch (error) {
      setMessage('AI generation is unavailable right now. Your idea is still here; you can continue editing the brief manually.');
      setBrief((current) => ({ ...current, description: idea }));
    } finally {
      setLoading(false);
    }
  };

  const askCreativeChat = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    try {
      const history = chatHistory.length
        ? chatHistory
        : (idea.trim() ? [{ role: 'user', content: idea }] : []);
      const { data } = await api.post('/ai/creative-chat', { message: chatInput, history });
      const reply = data.reply || 'I can shape that direction into a strong creative brief.';
      setChatReply(reply);
      setChatModelMode(data.model_mode || 'unavailable');
      setChatHistory([...history, { role: 'user', content: chatInput }, { role: 'assistant', content: reply }].slice(-6));
      if (data.suggested_fields) {
        setBrief((current) => ({ ...current, ...data.suggested_fields }));
      }
      setMessage('Creative direction updated from the AI assistant.');
    } catch (error) {
      setChatModelMode('unavailable');
      setChatReply('The AI assistant is temporarily unavailable. Your current brief is unchanged; please try again shortly.');
      setMessage('Your brief details are still saved in the form.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/briefs', brief);
      navigate('/briefs');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to save brief.');
    }
  };

  const updateField = (field, value) => setBrief((current) => ({ ...current, [field]: value }));

  return (
    <div className="container-shell py-12 pb-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Brief builder</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Create brief</h1>
        </div>
        <button onClick={() => navigate('/briefs')} className="btn-secondary">Back to briefs</button>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between gap-3">
          <label className="label mb-0" htmlFor="idea">Describe your idea</label>
          <span className="badge-brand">AI assistant</span>
        </div>
        <textarea id="idea" className="field mt-3 min-h-[120px]" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="I need a 30 second cinematic AI advertisement..." />
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <input className="field" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(event) => event.key === 'Enter' && askCreativeChat()} placeholder="Ask for a change or refine your campaign idea..." />
          <button onClick={askCreativeChat} className="btn-secondary" disabled={loading || !chatInput.trim()}>Refine with AI</button>
        </div>
        {chatReply && <div className="mt-4 rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4 text-sm text-slate-700">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ct-slate)]">{chatModelMode === 'live' ? 'OmniRoute live model' : chatModelMode === 'local_fallback' ? 'Local fallback · configure OmniRoute' : 'Model unavailable'}</div>
          {chatReply}
        </div>}
        <div className="mt-4">
          <button onClick={generateBrief} className="btn-primary" disabled={loading}>{loading ? 'Generating...' : 'Generate Structured Brief'}</button>
        </div>
        {message && <div className="mt-4 text-sm text-slate-700">{message}</div>}
      </div>

      <div className="mt-8 surface-card p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Edit generated brief</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="campaign_name">Campaign name</label><input id="campaign_name" className="field" value={brief.campaign_name} onChange={(e) => updateField('campaign_name', e.target.value)} /></div>
          <div><label className="label" htmlFor="brand_name">Brand name</label><input id="brand_name" className="field" value={brief.brand_name} onChange={(e) => updateField('brand_name', e.target.value)} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="description">Description</label><textarea id="description" className="field min-h-[100px]" value={brief.description} onChange={(e) => updateField('description', e.target.value)} /></div>
          <div><label className="label" htmlFor="objective">Objective</label><input id="objective" className="field" value={brief.objective} onChange={(e) => updateField('objective', e.target.value)} /></div>
          <div><label className="label" htmlFor="content_type">Content type</label><input id="content_type" className="field" value={brief.content_type} onChange={(e) => updateField('content_type', e.target.value)} /></div>
          <div><label className="label" htmlFor="style">Style</label><input id="style" className="field" value={brief.style} onChange={(e) => updateField('style', e.target.value)} /></div>
          <div><label className="label" htmlFor="target_audience">Target audience</label><input id="target_audience" className="field" value={brief.target_audience} onChange={(e) => updateField('target_audience', e.target.value)} /></div>
          <div><label className="label" htmlFor="platform">Platform</label><input id="platform" className="field" value={brief.platform} onChange={(e) => updateField('platform', e.target.value)} /></div>
          <div><label className="label" htmlFor="language">Language</label><input id="language" className="field" value={brief.language} onChange={(e) => updateField('language', e.target.value)} /></div>
          <div><label className="label" htmlFor="aspect_ratio">Aspect ratio</label><input id="aspect_ratio" className="field" value={brief.aspect_ratio} onChange={(e) => updateField('aspect_ratio', e.target.value)} /></div>
          <div><label className="label" htmlFor="duration">Duration</label><input id="duration" className="field" value={brief.duration} onChange={(e) => updateField('duration', e.target.value)} /></div>
          <div><label className="label" htmlFor="budget">Budget (USD)</label><input id="budget" className="field" value={brief.budget} onChange={(e) => updateField('budget', e.target.value)} /></div>
          <div><label className="label" htmlFor="country">Brand country</label>
            <select id="country" className="field" value={brief.country} onChange={(e) => {
              const country = e.target.value;
              const currency = COUNTRY_CURRENCY_MAP[country]?.currency || 'USD';
              updateField('country', country);
              updateField('currency', currency);
            }}>
              {COUNTRY_OPTIONS.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </div>
          <div><label className="label" htmlFor="currency">Display currency</label><input id="currency" className="field" value={brief.currency || COUNTRY_CURRENCY_MAP[brief.country]?.currency || 'USD'} readOnly /></div>
          <div><label className="label" htmlFor="project_type">Project type</label><input id="project_type" className="field" value={brief.project_type} onChange={(e) => updateField('project_type', e.target.value)} /></div>
          <div><label className="label" htmlFor="deadline">Deadline</label><input id="deadline" type="date" className="field" value={brief.deadline} onChange={(e) => updateField('deadline', e.target.value)} /></div>
          <div className="md:col-span-2 rounded-[16px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ct-slate)]">Estimated local price</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--ct-ink)]">{estimatedLocalPrice}</div>
            <div className="mt-2 text-sm text-[var(--ct-slate)]">Final price may vary based on project scope, licensing and creator negotiation.</div>
          </div>
          <div className="md:col-span-2"><label className="label" htmlFor="required_skills">Required skills</label><input id="required_skills" className="field" value={brief.required_skills.join(', ')} onChange={(e) => updateField('required_skills', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="required_tools">Required tools</label><input id="required_tools" className="field" value={brief.required_tools.join(', ')} onChange={(e) => updateField('required_tools', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="required_specialization">Required specialization</label><input id="required_specialization" className="field" value={brief.required_specialization.join(', ')} onChange={(e) => updateField('required_specialization', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></div>
          <div>
            <label className="label" htmlFor="commercial_use_required">Commercial use requirement</label>
            <input id="commercial_use_required" className="field" value={brief.commercial_use_required} onChange={(e) => updateField('commercial_use_required', e.target.value)} />
            <RightsPresetPicker label="commercial use" options={RIGHTS_PRESETS.commercialUse} onSelect={(value) => updateField('commercial_use_required', value)} />
          </div>
          <div>
            <label className="label" htmlFor="licensing_requirement">Licensing requirement</label>
            <input id="licensing_requirement" className="field" value={brief.licensing_requirement} onChange={(e) => updateField('licensing_requirement', e.target.value)} />
            <RightsPresetPicker label="licensing" options={RIGHTS_PRESETS.licensing} onSelect={(value) => updateField('licensing_requirement', value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="usage_rights">Usage rights</label>
            <textarea id="usage_rights" className="field min-h-[80px]" value={brief.usage_rights || ''} onChange={(e) => updateField('usage_rights', e.target.value)} placeholder="Specify channels, territory, duration, and exclusivity." />
            <RightsPresetPicker label="usage rights" options={RIGHTS_PRESETS.usageRights} onSelect={(value) => updateField('usage_rights', value)} />
          </div>
          <div className="md:col-span-2"><label className="label" htmlFor="additional_requirements">Additional requirements</label><textarea id="additional_requirements" className="field min-h-[100px]" value={brief.additional_requirements} onChange={(e) => updateField('additional_requirements', e.target.value)} /></div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} className="btn-primary">Save Brief</button>
          <button onClick={() => navigate('/briefs')} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
