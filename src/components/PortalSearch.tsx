import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BookOpen, ClipboardList, LayoutGrid, School, Search, Users } from "lucide-react";

export type PortalSearchItem = {
  id: string;
  label: string;
  hint?: string;
  category: string;
  keywords?: string[];
  onSelect: () => void;
};

type Props = {
  items: PortalSearchItem[];
};

const CATEGORY_ICON: Record<string, typeof Search> = {
  Pages: LayoutGrid,
  Students: Users,
  Classmates: Users,
  Classes: School,
  Teachers: School,
  Tasks: ClipboardList,
  "Word of the Day": BookOpen,
  Labs: BookOpen,
};

function itemMatches(item: PortalSearchItem, query: string) {
  const haystack = [item.label, item.hint ?? "", item.category, ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function PortalSearch({ items }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return items.filter((item) => itemMatches(item, q)).slice(0, 12);
    const pages = items.filter((item) => item.category === "Pages");
    const rest = items.filter((item) => item.category !== "Pages").slice(0, 6);
    return [...pages, ...rest].slice(0, 14);
  }, [items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, PortalSearchItem[]>();
    for (const item of results) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (item: PortalSearchItem) => {
    item.onSelect();
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[activeIndex];
      if (item) choose(item);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="portal-search-wrap" ref={wrapRef}>
      <label className={`portal-search ${open ? "is-open" : ""}`}>
        <Search size={16} />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search classes, students, tasks..."
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <kbd>Ctrl K</kbd>
      </label>
      {open && (
        <div className="portal-search-menu" role="listbox">
          {!results.length && (
            <p className="portal-search-empty">
              {query.trim() ? `No matches for “${query.trim()}”` : "Type a name, class, or task"}
            </p>
          )}
          {groups.map(([category, groupItems]) => {
            const Icon = CATEGORY_ICON[category] ?? Search;
            return (
              <div key={category} className="portal-search-group">
                <p className="portal-search-group-title">{category}</p>
                {groupItems.map((item) => {
                  const index = results.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`portal-search-option ${index === activeIndex ? "is-active" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(item)}
                    >
                      <span className="portal-search-option-icon">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-bold text-slate-800">
                          <Highlight text={item.label} query={query.trim()} />
                        </span>
                        {item.hint && <span className="block truncate text-[11px] font-semibold text-slate-400">{item.hint}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
