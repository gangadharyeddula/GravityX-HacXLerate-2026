import { useState } from 'react';

export const RIGHTS_PRESETS = {
  commercialUse: [
    'Commercial work available',
    'Commercial licensing required',
    'Not cleared for commercial use',
    'Demo presentation only; not cleared for client use',
  ],
  licensing: [
    'Commercial licensing required',
    'Commercial licensing for client usage',
    'Paid advertising license',
    'Owned media license',
    'Exclusive license',
    'Non-exclusive license',
    'Licensing varies by project scope',
    'Prototype-only usage',
  ],
  usageRights: [
    'Campaign rights for owned channels',
    'Full usage rights for owned media',
    'Paid social and digital advertising',
    'Worldwide, perpetual, exclusive usage',
    'Prototype display only',
  ],
};

export default function RightsPresetPicker({ label, options, onSelect }) {
  const [selected, setSelected] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    if (value) onSelect(value);
    setSelected('');
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`rights-preset-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>Suggested {label} terms</label>
      <select
        id={`rights-preset-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
        className="rounded-lg border border-[var(--ct-border)] bg-[var(--ct-panel)] px-3 py-2 text-xs text-[var(--ct-slate)]"
        value={selected}
        onChange={handleChange}
        aria-label={`Suggested ${label} terms`}
      >
        <option value="">Choose a suggested {label.toLowerCase()} term...</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <span className="text-xs text-[var(--ct-slate)]">You can also enter a custom term.</span>
    </div>
  );
}
