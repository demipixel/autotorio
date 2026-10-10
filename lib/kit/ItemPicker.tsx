import { useEffect, useMemo, useRef, useState } from 'react';

import { cx, useKit } from './controls';
import { icon } from './options';

// Picks a Factorio item the way the game does: a slot showing the current
// item, which opens a searchable grid of item slots.
//
// Items are internal names such as "fast-transport-belt". An entry written
// "includes:belt" stands for every item whose name contains "belt".

type Props = {
  items: string[];
  value: string;
  onChange: (item: string) => void;
  label: string;
};

export function itemLabel(item: string) {
  if (!item) return '';
  const words = item
    .replace('includes:', '')
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
  return item.startsWith('includes:') ? `All ${words}s` : words;
}

// the icon for a group is one of its members
function iconOf(item: string, items: string[]) {
  if (!item.startsWith('includes:')) return item;
  const part = item.replace('includes:', '');
  return items.find((other) => !other.startsWith('includes:') && other.includes(part)) ?? part;
}

export default function ItemPicker({ items, value, onChange, label }: Props) {
  const { s, t } = useKit();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/[\s-]+/).filter(Boolean);
    return items.filter((item) => words.every((word) => itemLabel(item).toLowerCase().includes(word)));
  }, [items, query]);

  const choose = (item: string) => {
    onChange(item);
    setOpen(false);
    setQuery('');
  };

  // a name that is not in the list, for modded or newer items
  const custom = query.trim().toLowerCase().replace(/[\s_]+/g, '-');

  return (
    <div className={s.itemPick} ref={ref}>
      <button
        type="button"
        className={cx(s.itemBtn, open && s.on)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${itemLabel(value)}`}
        onClick={() => setOpen(!open)}
      >
        <span className={s.itemSlot}>
          {value && (
            <img
              src={icon(iconOf(value, items))}
              alt=""
              draggable={false}
              onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
            />
          )}
        </span>
        <span className={s.itemName}>{itemLabel(value)}</span>
      </button>
      {open && (
        <div className={s.itemPop}>
          <input
            ref={search}
            className={s.input}
            type="text"
            value={query}
            placeholder={t('ui.search_items', 'Search, or type an internal name')}
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (shown.length) choose(shown[0]);
              else if (custom) choose(custom);
            }}
          />
          <div className={s.itemGrid} role="listbox" aria-label={label}>
            {shown.map((item) => (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={item === value}
                title={itemLabel(item)}
                className={cx(s.pickOpt, item === value && s.on, item.startsWith('includes:') && s.itemGroup)}
                onClick={() => choose(item)}
              >
                <img className={s.pickIcon} src={icon(iconOf(item, items))} alt={itemLabel(item)} draggable={false} />
              </button>
            ))}
          </div>
          {!shown.length && custom && (
            <button type="button" className={s.linkBtn} onClick={() => choose(custom)}>
              {t('ui.use_name', 'Use "{{name}}"', { name: custom })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
