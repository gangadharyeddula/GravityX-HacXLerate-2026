import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

export default function BriefsPage() {
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBriefs = async () => {
    try {
      const { data } = await api.get('/briefs');
      setBriefs(data.briefs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefs();
  }, []);

  return (
    <div className="container-shell py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Briefs</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Campaign briefs</h1>
        </div>
        <button onClick={() => navigate('/briefs/create')} className="btn-primary">Create Brief</button>
      </div>

      {loading ? (
        <div className="text-slate-600">Loading briefs...</div>
      ) : briefs.length === 0 ? (
        <EmptyState title="No briefs available." description="Create one to start matching creators." actionLabel="Create Brief" onAction={() => navigate('/briefs/create')} />
      ) : (
        <div className="space-y-4">
          {briefs.map((brief) => (
            <div key={brief.id} className="surface-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">{brief.campaign_name}</h2>
                  <div className="mt-1 text-sm text-slate-600">{brief.brand_name}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge">{brief.status}</span>
                  <button onClick={() => navigate(`/briefs/${brief.id}/matches`)} className="btn-primary">View Matches</button>
                </div>
              </div>
              <p className="mt-4 text-slate-700">{brief.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {brief.required_specialization?.map((item) => <span key={item} className="badge">{item}</span>)}
                {brief.required_skills?.map((item) => <span key={item} className="badge">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
