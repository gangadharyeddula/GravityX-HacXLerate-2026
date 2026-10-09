import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

const skillOptions = ['Prompt Engineering', 'Text-to-Image', 'Product Art Direction', 'Motion Art Direction', 'Video Editing', 'Storyboarding', 'AI Voice'];
const specializationOptions = ['AI Filmmaking', 'Generative Art', 'AI Advertising', 'AI Storytelling'];
const toolOptions = ['OpenAI Codex', 'Runway', 'Kling', 'Midjourney', 'Sora', 'Veo'];
const contentTypeOptions = ['Video', 'Image', 'Animation', 'Short-form video', 'Advertisement'];
const formatOptions = ['9:16', '16:9', '1:1', '4:5', '2:3'];
const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];
const locationOptions = ['Bengaluru, India', 'Mumbai, India', 'Delhi, India', 'Hyderabad, India', 'Guntur, India', 'Guntur-associated, India'];

function verificationLabel(record) {
  if (record.status === 'demo') return 'Demo signal';
  if (record.status === 'pending' || record.status === 'in_review') return 'In review';
  if (record.status === 'verified' || record.status === 'approved') return 'Verified';
  if (record.status === 'rejected') return 'Evidence needed';
  return null;
}

export default function CreatorsPage() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    specialization: '',
    tool: '',
    content_type: '',
    format: '',
    language: '',
    location: '',
    commercial_use: '',
    availability: '',
  });
  const [loading, setLoading] = useState(true);
  const [requestStatuses, setRequestStatuses] = useState({});

  const fetchCreators = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const { data } = await api.get('/creators', { params });
      setCreators(data.creators || []);
    } catch (error) {
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators(filters);
    const loadRequests = async () => {
      try {
        const { data } = await api.get('/engagements');
        const next = {};
        for (const item of data.engagements || []) {
          if (item.creator_id) next[item.creator_id] = item.status || 'pending';
        }
        setRequestStatuses(next);
      } catch (error) {
        setRequestStatuses({});
      }
    };
    loadRequests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
    fetchCreators(next);
  };

  const clearFilters = () => {
    const empty = {
      search: '', skill: '', specialization: '', tool: '', content_type: '', format: '', language: '', location: '', commercial_use: '', availability: '',
    };
    setFilters(empty);
    fetchCreators(empty);
  };

  return (
    <div className="container-shell py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Discover creators</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--ct-ink)] md:text-4xl">AI creators</h1>
        </div>
        <button onClick={clearFilters} className="btn-secondary">Clear filters</button>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[16px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-4">
          <div className="mb-4 text-sm font-semibold text-[var(--ct-ink)]">Filters</div>
          <div className="space-y-4">
            <div>
              <label className="label">Search</label>
              <input name="search" className="field" placeholder="Name or keyword" value={filters.search} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Skill</label>
              <select name="skill" className="field" value={filters.skill} onChange={handleChange}>
                <option value="">Any</option>
                {skillOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Specialization</label>
              <select name="specialization" className="field" value={filters.specialization} onChange={handleChange}>
                <option value="">Any</option>
                {specializationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tools</label>
              <select name="tool" className="field" value={filters.tool} onChange={handleChange}>
                <option value="">Any</option>
                {toolOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Content type</label>
              <select name="content_type" className="field" value={filters.content_type} onChange={handleChange}>
                <option value="">Any</option>
                {contentTypeOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Format</label>
              <select name="format" className="field" value={filters.format} onChange={handleChange}>
                <option value="">Any</option>
                {formatOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Commercial use</label>
              <select name="commercial_use" className="field" value={filters.commercial_use} onChange={handleChange}>
                <option value="">Any</option>
                <option value="Commercial work available">Commercial work available</option>
                <option value="Commercial licensing required">Commercial licensing required</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select name="language" className="field" value={filters.language} onChange={handleChange}>
                <option value="">Any</option>
                {languageOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Country</label>
              <select name="location" className="field" value={filters.location} onChange={handleChange}>
                <option value="">Any</option>
                {locationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Availability</label>
              <select name="availability" className="field" value={filters.availability} onChange={handleChange}>
                <option value="">Any</option>
                <option value="Available this month">Available this month</option>
                <option value="Available within 7 days">Available within 7 days</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {loading ? (
            <div className="rounded-[16px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-6 text-[var(--ct-slate)]">Loading creators...</div>
          ) : creators.length === 0 ? (
            <EmptyState title="No creators match these requirements." description="Try broadening your filters or create a new brief to match more talent." actionLabel="Clear Filters" onAction={clearFilters} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              {creators.map((creator) => (
                <article key={creator.id} className="overflow-hidden rounded-[16px] border border-[var(--ct-border)] bg-[var(--ct-panel)]">
                  <div className="flex gap-4 p-4">
                    {creator.profile_image ? <img src={creator.profile_image} alt={creator.name} className="h-20 w-20 rounded-full object-cover" /> : <div aria-label={creator.name} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--ct-panel-alt)] text-2xl font-semibold text-[var(--ct-teal)]">{creator.name?.slice(0, 1) || '?'}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-[var(--ct-ink)]">{creator.name}</h3>
                            {(creator.verification || []).slice(0, 2).map((record) => {
                              const label = verificationLabel(record);
                              return label ? <span key={record.id} className="brand-positive">{label}</span> : null;
                            })}
                            {creator.external_profile ? <><span className="badge">External · not joined</span><span className="badge">Not verified</span></> : !(creator.verification || []).length && <span className="badge">No verification data</span>}
                          </div>
                          <div className="mt-1 text-sm text-[var(--ct-slate)]">{creator.location}</div>
                        </div>
                        <span className="inline-flex rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[10px] font-medium text-[var(--ct-ink)]">{creator.availability}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(creator.specializations || []).slice(0, 2).map((item) => (
                          <span key={item} className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2.5 py-1 text-[11px] text-[var(--ct-ink)]">{item}</span>
                        ))}
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ct-slate)]">{creator.bio}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(creator.tools || []).slice(0, 4).map((tool) => (
                          <span key={tool} className="rounded-full border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] px-2 py-1 text-[10px] font-medium text-[var(--ct-slate)]">{tool}</span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--ct-border)] pt-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--ct-slate)]">AI portfolio</div>
                          <div className="mt-1 text-base font-semibold text-[var(--ct-ink)]">{creator.portfolio_count || 0} project{creator.portfolio_count === 1 ? '' : 's'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--ct-slate)]">Starting</div>
                          <div className="mt-1 text-base font-semibold text-[var(--ct-ink)]">{creator.rate || 'Quote on request'}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button onClick={() => navigate(`/creators/${creator.id}`)} className="btn-secondary flex-1">View Profile</button>
                        {requestStatuses[creator.id] ? (
                          <button className="btn-accent flex-1">
                            {requestStatuses[creator.id] === 'accepted' ? 'Accepted' : requestStatuses[creator.id] === 'rejected' ? 'Rejected' : 'Requested'}
                          </button>
                        ) : creator.external_profile ? (
                          <a href={creator.source_url} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-center">Open {creator.source_platform || 'source'}</a>
                        ) : (
                          <button onClick={() => navigate('/briefs')} className="btn-primary flex-1">Start from a brief</button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
