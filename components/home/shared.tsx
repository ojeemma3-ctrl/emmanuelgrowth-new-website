import Image from 'next/image';

export function Arrow() {
  return <span aria-hidden="true">→</span>;
}

// Official logos go in public/logos, unaltered. Set `file` once a logo has been added;
// until then the chip shows a generic icon and the name as text.
const sources = {
  google: { name: 'Google', file: null as string | null, icon: 'search' },
  whatsapp: { name: 'WhatsApp', file: null as string | null, icon: 'chat' },
  trustpilot: { name: 'Trustpilot', file: null as string | null, icon: 'star' },
} as const;

export type Source = keyof typeof sources;

const icons = {
  search: <><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" /></>,
  chat: <path d="M3 13.5V4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5A1.5 1.5 0 0 1 11.5 11H6Z" />,
  star: <path d="m8 2.5 1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5Z" />,
};

export function SourceChip({ source }: { source: Source }) {
  const { name, file, icon } = sources[source];
  if (file) {
    return <span className="source-chip"><Image src={file} alt={name} width={16} height={16} />{name}</span>;
  }
  return (
    <span className="source-chip">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[icon]}</svg>
      {name}
    </span>
  );
}
