import Image from 'next/image';

export function Arrow() {
  return <span aria-hidden="true">→</span>;
}

// Official logos go in public/logos, unaltered. Set `file` once a logo has been added;
// until then the chip shows the name as text.
const sources = {
  google: { name: 'Google', file: null as string | null },
  whatsapp: { name: 'WhatsApp', file: null as string | null },
  trustpilot: { name: 'Trustpilot', file: null as string | null },
};

export type Source = keyof typeof sources;

export function SourceChip({ source }: { source: Source }) {
  const { name, file } = sources[source];
  if (file) {
    return <span className="source-chip"><Image src={file} alt={name} width={18} height={18} /></span>;
  }
  return <span className="source-chip is-text">{name}</span>;
}
