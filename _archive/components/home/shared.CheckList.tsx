// Moved from components/home/shared.tsx in phase 4 (only used by the old service sections).
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <span aria-hidden="true">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
