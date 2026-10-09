import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RightsPresetPicker, { RIGHTS_PRESETS } from '../components/RightsPresetPicker';

const emptyProfile = {
  name: '', bio: '', location: '', languages: '', specializations: '', skills: '', tools: '',
  content_types: '', formats: '', availability: '', commercial_use: '', licensing_notes: '', usage_rights: '',
  rate: '', profile_image: '',
};

const asList = (value) => (value || []).join(', ');
const splitList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [existingId, setExistingId] = useState(null);
  const [verificationState, setVerificationState] = useState('No verification request submitted');
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ type: 'Tool verification', evidence: '' });
  const [verificationNote, setVerificationNote] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/creators');
        const mine = data.creators?.find((item) => item.user_id === user?.id);
        if (mine && active) {
          setExistingId(mine.id);
          setProfile({
            ...emptyProfile,
            ...mine,
            languages: asList(mine.languages),
            specializations: asList(mine.specializations),
            skills: asList(mine.skills),
            tools: asList(mine.tools),
            content_types: asList(mine.content_types),
            formats: asList(mine.formats),
          });
          try {
            const verificationResponse = await api.get(`/creators/${mine.id}/verification`);
            const latest = verificationResponse.data.verification?.at(-1);
            if (latest && active) {
              setVerificationState(latest.status === 'pending' ? 'Submitted · awaiting review' : latest.status === 'verified' ? 'Verified' : latest.status === 'rejected' ? 'Needs more evidence' : 'Demo signal');
              setVerificationPending(latest.status === 'pending');
              setVerificationNote(latest.review_note || '');
            }
          } catch {
            // Keep the profile usable when verification history is unavailable.
          }
        }
      } catch (error) {
        if (active) setMessage(error.response?.data?.detail || 'Unable to load creator profile.');
      } finally {
        if (active) setLoading(false);
      }
    }
    if (user?.id) load();
    else setLoading(false);
    return () => { active = false; };
  }, [user?.id]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, profile_image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...profile,
      languages: splitList(profile.languages),
      specializations: splitList(profile.specializations),
      skills: splitList(profile.skills),
      tools: splitList(profile.tools),
      content_types: splitList(profile.content_types),
      formats: splitList(profile.formats),
    };
    try {
      if (existingId) {
        await api.put(`/creators/${existingId}`, payload);
        setMessage('Profile updated.');
      } else {
        const { data } = await api.post('/creators', payload);
        setExistingId(data.creator.id);
        setMessage('Profile created. Add portfolio examples to complete your profile.');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to save profile.');
    }
  };

  const submitVerification = async () => {
    if (!existingId || verificationPending) return;
    setVerificationPending(true);
    try {
      await api.post('/verification', {
        type: verificationForm.type,
        evidence: verificationForm.evidence,
      });
      setVerificationState('Submitted · awaiting review');
      setVerificationPending(true);
      setVerificationNote('');
      setMessage('Verification request submitted.');
    } catch (error) {
      setVerificationPending(false);
      setMessage(error.response?.data?.detail || 'Unable to submit verification request.');
    }
  };

  if (loading) return <div className="container-shell py-12 text-slate-600">Loading profile...</div>;

  return (
    <div className="container-shell py-12">
      <div className="mb-6">
        <div className="eyebrow">Profile</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">Creator profile</h1>
      </div>

      <form className="surface-card p-6" onSubmit={handleSubmit}>
        {message && <div className="notice-positive mb-4 rounded-lg px-3 py-2 text-sm">{message}</div>}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.profile_image ? <img src={profile.profile_image} alt={profile.name || 'Creator'} className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-sm" /> : <div aria-hidden="true" className="h-16 w-16 rounded-full bg-[var(--ct-border)]" />}
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Verification</div>
              <div className="mt-1 text-sm font-medium text-slate-700">{verificationState}</div>
              {verificationNote && <div className="mt-2 max-w-xl text-xs leading-5 text-slate-600"><strong>Reviewer note:</strong> {verificationNote}</div>}
            </div>
          </div>
          <div className="grid w-full gap-3 md:max-w-2xl md:grid-cols-[1fr_1.4fr_auto] md:items-end">
            <div><label className="label" htmlFor="verification-type">What should be reviewed?</label><select id="verification-type" className="field" value={verificationForm.type} onChange={(event) => setVerificationForm((current) => ({ ...current, type: event.target.value }))}><option>Tool verification</option><option>Workflow verification</option><option>Portfolio verification</option><option>Commercial rights review</option></select></div>
            <div><label className="label" htmlFor="verification-evidence">Evidence note or public link</label><input id="verification-evidence" className="field" value={verificationForm.evidence} onChange={(event) => setVerificationForm((current) => ({ ...current, evidence: event.target.value }))} placeholder="Public sample URL or what a reviewer should inspect" /></div>
            <button type="button" onClick={submitVerification} disabled={!existingId || verificationPending || verificationForm.evidence.trim().length < 8} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">{verificationPending ? 'Request submitted' : 'Submit for review'}</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="name">Name</label><input id="name" className="field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="location">Location</label><input id="location" className="field" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="bio">Bio</label><textarea id="bio" className="field min-h-[120px]" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
          <div><label className="label" htmlFor="languages">Languages</label><input id="languages" className="field" value={profile.languages} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} /></div>
          <div><label className="label" htmlFor="availability">Availability</label><input id="availability" className="field" value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })} /></div>
          <div><label className="label" htmlFor="rate">Rate</label><input id="rate" className="field" value={profile.rate} onChange={(e) => setProfile({ ...profile, rate: e.target.value })} /></div>
          <div><label className="label" htmlFor="profile_image">Profile image</label><input id="profile_image" type="file" accept="image/*" className="field" onChange={handleImageUpload} /><div className="mt-2 text-xs text-slate-500">Upload an image that represents your creator profile.</div></div>
          <div><label className="label" htmlFor="specializations">Specializations</label><input id="specializations" className="field" value={profile.specializations} onChange={(e) => setProfile({ ...profile, specializations: e.target.value })} /></div>
          <div><label className="label" htmlFor="skills">Skills</label><input id="skills" className="field" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} /></div>
          <div><label className="label" htmlFor="tools">Tools</label><input id="tools" className="field" value={profile.tools} onChange={(e) => setProfile({ ...profile, tools: e.target.value })} /></div>
          <div><label className="label" htmlFor="content_types">Content types</label><input id="content_types" className="field" value={profile.content_types} onChange={(e) => setProfile({ ...profile, content_types: e.target.value })} /></div>
          <div><label className="label" htmlFor="formats">Formats</label><input id="formats" className="field" value={profile.formats} onChange={(e) => setProfile({ ...profile, formats: e.target.value })} /></div>
          <div>
            <label className="label" htmlFor="commercial_use">Commercial use</label>
            <input id="commercial_use" className="field" value={profile.commercial_use} onChange={(e) => setProfile({ ...profile, commercial_use: e.target.value })} />
            <RightsPresetPicker label="commercial use" options={RIGHTS_PRESETS.commercialUse} onSelect={(value) => setProfile({ ...profile, commercial_use: value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="licensing_notes">Licensing notes</label>
            <textarea id="licensing_notes" className="field min-h-[80px]" value={profile.licensing_notes} onChange={(e) => setProfile({ ...profile, licensing_notes: e.target.value })} />
            <RightsPresetPicker label="licensing" options={RIGHTS_PRESETS.licensing} onSelect={(value) => setProfile({ ...profile, licensing_notes: value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="usage_rights">Usage rights</label>
            <textarea id="usage_rights" className="field min-h-[80px]" value={profile.usage_rights} onChange={(e) => setProfile({ ...profile, usage_rights: e.target.value })} placeholder="State the media, channels, and campaign use you can license." />
            <RightsPresetPicker label="usage rights" options={RIGHTS_PRESETS.usageRights} onSelect={(value) => setProfile({ ...profile, usage_rights: value })} />
          </div>
        </div>
        <div className="mt-6 flex gap-3"><button type="submit" className="btn-primary">Save profile</button></div>
      </form>
    </div>
  );
}
