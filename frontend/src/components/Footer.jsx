import CreatorTwinLogo from './CreatorTwinLogo';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--ct-border)] bg-[var(--ct-cream)] pt-2">
      <div className="container-shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <CreatorTwinLogo size="md" showText={true} className="mb-2" />
          <p className="max-w-md text-sm text-[var(--ct-slate)]">
            Curating a premium marketplace for brands and AI-native creators to create, match and collaborate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ct-slate)]">
          <a href="/creators" className="transition hover:text-[var(--ct-ink)]">Discover</a>
          <a href="/briefs/create" className="transition hover:text-[var(--ct-ink)]">Create brief</a>
          <a href="/dashboard" className="transition hover:text-[var(--ct-ink)]">Dashboard</a>
          <a href="/login" className="transition hover:text-[var(--ct-ink)]">Log in</a>
        </div>
      </div>
    </footer>
  );
}
