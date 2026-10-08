/** Escape a user string so it can be dropped into a RegExp safely. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps every case-insensitive match of `query` in a <mark>, so a search result
 * shows exactly which word matched (titles, tags, descriptions).
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (!term) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));
  const lower = term.toLowerCase();

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === lower ? (
          <mark key={index} className="hl">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
