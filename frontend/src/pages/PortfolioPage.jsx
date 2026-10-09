import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import PortfolioMedia from '../components/PortfolioMedia';
import RightsPresetPicker, { RIGHTS_PRESETS } from '../components/RightsPresetPicker';

const initialForm = {
  title: '',
  description: '',
  media_url: '',
  thumbnail_url: '',
  content_type: '',
  tools: '',
  models: '',
  skills: '',
  specialization: '',
  workflow: '',
  aspect_ratio: '',
  duration: '',
  commercial_use: '',
  licensing_notes: '',
  usage_rights: '',
};

export default function PortfolioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);

  const loadPortfolio = async () => {
    try {
      const { data } = await api.get('/creators');
      const creators = data.creators || [];
      const me = creators.find((item) => item.user_id === user?.id);
      setCreatorProfile(me || null);
      if (me) {
        const response = await api.get(`/creators/${me.id}/portfolio`);
        setItems(response.data.portfolio || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [user?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      tools: form.tools.split(',').map((item) => item.trim()).filter(Boolean),
      models: form.models.split(',').map((item) => item.trim()).filter(Boolean),
      skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
      workflow: form.workflow.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/portfolio/${editingId}`, payload);
      } else {
        await api.post('/portfolio', payload);
      }
      setForm(initialForm);
      setEditingId(null);
      loadPortfolio();
    } catch (error) {
      alert(error.response?.data?.detail || 'Unable to save portfolio item.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...item,
      usage_rights: item.usage_rights || '',
      tools: item.tools?.join(', ') || '',
      models: item.models?.join(', ') || '',
      skills: item.skills?.join(', ') || '',
      workflow: item.workflow?.join(', ') || '',
    });
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/portfolio/${itemId}`);
      loadPortfolio();
    } catch (error) {
      alert(error.response?.data?.detail || 'Unable to delete item.');
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary">Back</button>
          <div>
            <div className="eyebrow">Portfolio</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">My portfolio</h1>
          </div>
        </div>
      </div>

      {!creatorProfile && !loading && (
        <div className="surface-card mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">Create your creator profile first</h2>
            <p className="mt-1 text-sm text-slate-600">Portfolio work is attached to a creator profile so brands can discover it.</p>
          </div>
          <button onClick={() => navigate('/profile')} className="btn-primary">Set up profile</button>
        </div>
      )}

      {creatorProfile && (
        <div className="surface-card mb-8 p-5 md:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-shrink-0">
              {creatorProfile.profile_image ? <img src={creatorProfile.profile_image} alt={creatorProfile.name || 'Creator'} className="h-44 w-44 rounded-2xl object-cover shadow-sm ring-2 ring-white" /> : <div className="h-44 w-44 rounded-2xl bg-[var(--ct-panel-alt)]" aria-hidden="true" />}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">{creatorProfile.name}</h2>
                  {creatorProfile.availability && <span className="badge">{creatorProfile.availability}</span>}
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{creatorProfile.bio || 'Add a short introduction so brands can understand your creative approach.'}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Location</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{creatorProfile.location || 'Not added'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Rate</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{creatorProfile.rate || 'Quote on request'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Availability</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{creatorProfile.availability || 'Not added'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Languages</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{(creatorProfile.languages || []).join(', ') || 'Not added'}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(creatorProfile.specializations || []).slice(0, 6).map((tag) => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          {loading ? (
            <div className="text-slate-600">Loading portfolio...</div>
          ) : items.length === 0 ? (
            <EmptyState title="No portfolio items yet." description="Add your first AI project to start attracting briefs." actionLabel="Add Portfolio" onAction={() => document.getElementById('portfolio-form')?.scrollIntoView({ behavior: 'smooth' })} />
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="surface-card overflow-hidden">
                  <PortfolioMedia item={item} />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">{item.title}</h3>
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.content_type && <span className="badge">{item.content_type}</span>}
                        {item.verification?.status === 'demo' && <span className="badge">Demo sample</span>}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tools?.map((tool) => <span key={tool} className="badge">{tool}</span>)}
                      {item.models?.map((model) => <span key={model} className="badge">{model}</span>)}
                    </div>
                    {item.workflow?.length > 0 && <p className="mt-3 text-xs leading-5 text-slate-600"><strong>Workflow:</strong> {item.workflow.join(' → ')}</p>}
                    <p className="mt-3 text-xs text-slate-600">{[item.aspect_ratio, item.duration, item.commercial_use].filter(Boolean).join(' · ')}</p>
                    {item.usage_rights && <p className="mt-2 text-xs leading-5 text-slate-600"><strong>Usage rights:</strong> {item.usage_rights}</p>}
                    {item.licensing_notes && <p className="mt-2 text-xs leading-5 text-slate-600">{item.licensing_notes}</p>}
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => handleEdit(item)} className="btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn-secondary text-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form id="portfolio-form" className="surface-card p-6" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">{editingId ? 'Edit portfolio item' : 'Create portfolio item'}</h2>
          <div className="mt-6 space-y-4">
            <div><label className="label" htmlFor="title">Title</label><input id="title" className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label className="label" htmlFor="description">Description</label><textarea id="description" className="field min-h-[110px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div><label className="label" htmlFor="media_url">Media URL</label><input id="media_url" className="field" placeholder="Paste a public image or video URL" value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} required /><p className="mt-1 text-xs text-slate-500">Use a real project image or video. Video URLs ending in .mp4, .webm, or .ogg play inline.</p></div>
            <div><label className="label" htmlFor="thumbnail_url">Thumbnail URL</label><input id="thumbnail_url" className="field" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></div>
            <div><label className="label" htmlFor="content_type">Content type</label><input id="content_type" className="field" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} /></div>
            <div><label className="label" htmlFor="tools">Tools used</label><input id="tools" className="field" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} /></div>
            <div><label className="label" htmlFor="models">Models used</label><input id="models" className="field" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} /></div>
            <div><label className="label" htmlFor="skills">Skills demonstrated</label><input id="skills" className="field" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
            <div><label className="label" htmlFor="specialization">Specialization</label><input id="specialization" className="field" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            <div><label className="label" htmlFor="workflow">Workflow</label><input id="workflow" className="field" value={form.workflow} onChange={(e) => setForm({ ...form, workflow: e.target.value })} /></div>
            <div><label className="label" htmlFor="aspect_ratio">Aspect ratio</label><input id="aspect_ratio" className="field" value={form.aspect_ratio} onChange={(e) => setForm({ ...form, aspect_ratio: e.target.value })} /></div>
            <div><label className="label" htmlFor="duration">Duration</label><input id="duration" className="field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            <div>
              <label className="label" htmlFor="commercial_use">Commercial use</label>
              <input id="commercial_use" className="field" value={form.commercial_use} onChange={(e) => setForm({ ...form, commercial_use: e.target.value })} />
              <RightsPresetPicker label="commercial use" options={RIGHTS_PRESETS.commercialUse} onSelect={(value) => setForm({ ...form, commercial_use: value })} />
            </div>
            <div>
              <label className="label" htmlFor="licensing_notes">Licensing notes</label>
              <textarea id="licensing_notes" className="field min-h-[80px]" value={form.licensing_notes} onChange={(e) => setForm({ ...form, licensing_notes: e.target.value })} />
              <RightsPresetPicker label="licensing" options={RIGHTS_PRESETS.licensing} onSelect={(value) => setForm({ ...form, licensing_notes: value })} />
            </div>
            <div>
              <label className="label" htmlFor="usage_rights">Usage rights</label>
              <textarea id="usage_rights" className="field min-h-[80px]" value={form.usage_rights} onChange={(e) => setForm({ ...form, usage_rights: e.target.value })} placeholder="Channels, duration, and commercial scope allowed" />
              <RightsPresetPicker label="usage rights" options={RIGHTS_PRESETS.usageRights} onSelect={(value) => setForm({ ...form, usage_rights: value })} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={!creatorProfile} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{editingId ? 'Update item' : 'Add item'}</button>
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="btn-secondary">Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
