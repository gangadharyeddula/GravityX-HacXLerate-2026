import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const fitFactors = [
  ['Specialization', 'specialization_score'],
  ['Skills', 'skills_score'],
  ['Tools', 'tools_score'],
  ['Content type', 'content_type_score'],
  ['Format', 'format_score'],
  ['Language', 'language_score'],
  ['Rights & licensing', 'commercial_use_score'],
];

export default function BriefMatchesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [requestStatuses, setRequestStatuses] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [matchesResponse, engagementResponse, briefResponse] = await Promise.all([
          api.get(`/briefs/${id}/matches`),
          api.get('/engagements'),
          api.get(`/briefs/${id}`),
        ]);
        if (!active) return;
        const nextStatuses = {};
        for (const item of engagementResponse.data.engagements || []) {
          if (item.brief_id === id && item.creator_id) nextStatuses[item.creator_id] = item.status || 'pending';
        }
        setMatches(matchesResponse.data.matches || []);
        setBrief(briefResponse.data.brief);
        setRequestStatuses(nextStatuses);
      } catch (error) {
        if (active) setMessage(error.response?.data?.detail || 'Unable to load brief matches.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  const sendRequest = async (creatorId) => {
    try {
      const { data } = await api.post('/engagements', {
        brief_id: id,
        creator_id: creatorId,
        message: 'I would like to discuss this project.',
        proposed_budget: brief?.budget || '',
        proposed_deadline: brief?.deadline || null,
      });
      setRequestStatuses((current) => ({ ...current, [creatorId]: data?.engagement?.status || 'pending' }));
      setMessage('Engagement request sent. Track the next steps in Engagements.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to send request.');
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Brief match breakdown</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Creator matches</h1>
          {brief && <p className="mt-2 text-sm text-slate-600">{brief.campaign_name} · {brief.content_type}{brief.aspect_ratio ? ` · ${brief.aspect_ratio}` : ''}</p>}
        </div>
        <button onClick={() => navigate('/briefs')} className="btn-secondary">Back to briefs</button>
      </div>

      {message && <div className="notice-positive mb-4 rounded-lg px-3 py-2 text-sm">{message}</div>}

      {loading ? (
        <div className="text-slate-600">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="card p-8 text-center text-slate-600">No matching creators found. Try broadening the skills, tools, or format in your brief.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((creator) => (
            <article key={creator.id} className="surface-card overflow-hidden">
              {creator.profile_image ? <img src={creator.profile_image} alt={creator.name} className="h-48 w-full object-cover" /> : <div aria-label={creator.name} className="flex h-48 items-center justify-center bg-[var(--ct-panel-alt)] text-4xl font-semibold text-[var(--ct-teal)]">{creator.name?.slice(0, 1) || '?'}</div>}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">{creator.name}</h2>
                  <span className="badge-brand">{Math.round(creator.match_score || 0)}% fit</span>
                </div>
                <div className="mt-3 text-sm text-slate-600">{creator.specializations?.join(', ') || 'Specialization not listed'}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(creator.tools || []).slice(0, 4).map((tool) => <span key={tool} className="badge">{tool}</span>)}
                </div>
                <div className="mt-5 rounded-xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Why this match</div>
                  <ul className="mt-2 space-y-2 text-sm leading-5 text-slate-700">
                    {(creator.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {fitFactors.filter(([, key]) => creator[key] !== null && creator[key] !== undefined).map(([label, key]) => (
                      <div key={key}>
                        <div className="flex justify-between gap-2 text-[10px] text-slate-600"><span>{label}</span><span>{Math.round(creator[key])}%</span></div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[var(--ct-teal)]" style={{ width: `${Math.max(0, Math.min(100, creator[key]))}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="badge">{creator.portfolio_count || 0} portfolio projects</span>
                  <span className="badge">{creator.commercial_use || 'Commercial terms not listed'}</span>
                  {creator.availability && <span className="badge">{creator.availability}</span>}
                </div>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => navigate(`/creators/${creator.id}`)} className="btn-secondary flex-1">View Profile</button>
                  {creator.external_profile ? (
                    <a href={creator.source_url} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-center">Open {creator.source_platform || 'source'}</a>
                  ) : requestStatuses[creator.id] ? (
                    <button disabled className="flex-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium capitalize text-emerald-700">{requestStatuses[creator.id].replace('_', ' ')}</button>
                  ) : (
                    <button onClick={() => sendRequest(creator.id)} className="btn-primary flex-1">Send Request</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
