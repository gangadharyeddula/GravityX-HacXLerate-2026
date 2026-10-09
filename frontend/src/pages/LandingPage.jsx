import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();

  const handleExploreCreators = () => {
    if (user) {
      navigate('/creators');
      return;
    }

    navigate('/login');
  };

  const handleDemoLogin = async (role) => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div>
      <section className="bg-[var(--ct-panel)]">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <span className="eyebrow">AI Creator Marketplace</span>
            <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-[-0.07em] text-[var(--ct-ink)] md:text-5xl lg:text-[3.4rem]">
              Find the right AI creator for your next idea.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--ct-slate)] md:text-lg">
              Discover AI creators, compare their workflows and portfolios, then carry your brief through delivery and review.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={handleExploreCreators} className="btn-primary">Find Creators</button>
              <button onClick={() => navigate('/briefs/create')} className="btn-secondary">Post a Brief</button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => handleDemoLogin('brand')} className="btn-secondary">Brand demo</button>
              <button onClick={() => handleDemoLogin('creator')} className="btn-secondary">Creator demo</button>
            </div>
          </div>

          <div className="rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel)] p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
            <div className="flex items-center justify-between pb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--ct-text-muted)]">App motion</div>
                <div className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--ct-ink)]">AI workflow</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(45,212,191,0.25)] bg-[rgba(45,212,191,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ct-teal)]">
                Platform preview
              </span>
            </div>

            <div className="video-showcase mt-5">
              <div className="video-showcase__screen">
                <div className="video-showcase__topbar">
                  <span className="video-showcase__dot" />
                  <span className="video-showcase__dot" />
                  <span className="video-showcase__dot" />
                </div>

                <div className="video-showcase__content">
                  <div className="video-showcase__sidebar">
                    <span className="video-showcase__pill active">Brief</span>
                    <span className="video-showcase__pill">Match</span>
                    <span className="video-showcase__pill">Video</span>
                  </div>

                  <div className="video-showcase__stage">
                    <div className="video-showcase__hero-card">
                      <div className="video-showcase__avatar" />
                      <div className="video-showcase__meta">
                        <div className="video-showcase__line short" />
                        <div className="video-showcase__line" />
                        <div className="video-showcase__line tiny" />
                      </div>
                    </div>

                    <div className="video-showcase__bars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="video-showcase__stats">
                      <div>
                        <small>Portfolio evidence</small>
                        <strong>Tools · workflow</strong>
                      </div>
                      <div>
                        <small>Project path</small>
                        <strong>Brief → delivery</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b1720] text-white" aria-labelledby="matching-preview-heading">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="container-shell relative grid gap-12 py-16 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200">Match intelligence</span>
            <h2 id="matching-preview-heading" className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] text-white md:text-4xl">
              See the thinking behind every match.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              A useful shortlist gives you more than names. Compare the creative skills, tools, formats, and usage details that connect each creator to your brief.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                'Compare skills and specialization against your goals',
                'Check tools, content type, and format together',
                'Bring commercial-use and availability into the picture',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                  {item}
                </li>
              ))}
            </ul>

            <button onClick={handleExploreCreators} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white">
              Explore creators <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <article className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-7" aria-label="Illustrative creator match preview">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Sample brief</span>
                <p className="mt-1 text-sm font-medium text-white">Vertical product launch film</p>
              </div>
              <span className="rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-100">Illustrative preview</span>
            </div>

            <div className="grid gap-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div
                className="h-24 w-24 rounded-full p-[6px]"
                style={{ background: 'conic-gradient(#5eead4 0deg 331deg, rgba(94, 234, 212, 0.18) 331deg 360deg)' }}
                role="img"
                aria-label="Illustrative sample fit score: 92 percent"
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0b1720] text-center">
                  <div className="text-2xl font-semibold tracking-[-0.06em] text-white">92%</div>
                  <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sample fit</div>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">AI motion creator</h3>
                  <span className="rounded-full bg-teal-300/10 px-2.5 py-1 text-[10px] font-medium text-teal-100">Profile preview</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">A sample breakdown of how creator details can line up with a campaign brief.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Creative direction', value: 'Product storytelling' },
                { label: 'Tools', value: 'Runway · After Effects' },
                { label: 'Format', value: '9:16 vertical video' },
                { label: 'Usage', value: 'Commercial terms noted' },
              ].map((signal) => (
                <div key={signal.label} className="rounded-xl border border-white/10 bg-black/15 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{signal.label}</p>
                  <p className="mt-1.5 text-sm font-medium text-white">{signal.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-slate-400">Example data for illustration. Actual fit depends on each brief and creator profile.</p>
          </article>
        </div>
      </section>

      <section className="bg-[var(--ct-cream)]" aria-labelledby="brand-feedback-heading">
        <div className="container-shell py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">The brand experience</span>
            <h2 id="brand-feedback-heading" className="section-heading mt-3">
              More clarity at every step.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--ct-slate)]">
              From the first brief to the final shortlist, keep the details that matter close at hand.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="card flex flex-col justify-between p-6 md:p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="badge-brand">Feedback from completed work</span>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ct-text-muted)]">Engagement linked</span>
                </div>
                <div aria-hidden="true" className="mt-6 text-4xl font-semibold leading-none text-[var(--ct-teal)]">01</div>
                <p className="mt-1 max-w-2xl text-xl font-medium leading-8 tracking-[-0.03em] text-[var(--ct-ink)] md:text-2xl md:leading-9">
                  Reviews open after a brand approves delivery, so each rating is tied to a completed collaboration.
                </p>
              </div>
              <div className="mt-8 pt-5">
                <p className="font-semibold text-[var(--ct-ink)]">Shared accountability</p>
                <p className="mt-1 text-sm text-[var(--ct-text-muted)]">Both brands and creators can leave feedback after approval.</p>
              </div>
            </article>

            <div className="card p-6 md:p-8">
              <span className="eyebrow">A better working experience</span>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--ct-ink)]">What helps brands feel confident</h3>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ct-panel-alt)] text-sm font-semibold text-[var(--ct-teal)]">01</span>
                  <div>
                    <p className="font-semibold text-[var(--ct-ink)]">A clearer creator fit</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ct-slate)]">Compare skills, tools, formats, and availability against the brief.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ct-panel-alt)] text-sm font-semibold text-[var(--ct-teal)]">02</span>
                  <div>
                    <p className="font-semibold text-[var(--ct-ink)]">Usage details up front</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ct-slate)]">See commercial-use preferences and licensing notes while you review portfolios.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ct-panel-alt)] text-sm font-semibold text-[var(--ct-teal)]">03</span>
                  <div>
                    <p className="font-semibold text-[var(--ct-ink)]">One connected workflow</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ct-slate)]">Go from a structured brief to creator conversations in the same place.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--ct-panel)]" aria-labelledby="how-it-works-heading">
        <div className="container-shell py-16 md:py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">From idea to collaboration</span>
              <h2 id="how-it-works-heading" className="section-heading mt-3">A straightforward way to get started.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-[var(--ct-slate)]">
              Keep your goals visible and make each next step easier for your team and your creator.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { number: '01', title: 'Share the brief', copy: 'Set your goals, audience, format, timeline, and usage needs.' },
              { number: '02', title: 'Explore your matches', copy: 'Review creator portfolios and see why each one fits your project.' },
              { number: '03', title: 'Start a conversation', copy: 'Send an engagement request and align on the details together.' },
            ].map((step) => (
              <article key={step.number} className="card p-6 md:p-7">
                <span className="text-sm font-semibold tracking-[0.14em] text-[var(--ct-teal)]">{step.number}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--ct-ink)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ct-slate)]">{step.copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[18px] border border-[var(--ct-border)] bg-[var(--ct-panel-alt)] p-6 md:flex-row md:items-center md:p-8">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--ct-ink)]">Ready to make your next brief easier?</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ct-slate)]">Find a creator who understands the work you want to make.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExploreCreators} className="btn-primary">Find Creators</button>
              <button onClick={() => navigate('/briefs/create')} className="btn-secondary">Post a Brief</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
