import { createContext, useContext, useState } from 'react';

import { useI18n } from 'next-localization';

import { OutpostMap, Outcome } from '../preview/decode';
import { icon, Option } from './options';

// Unstyled building blocks shared by the tools. A page passes its CSS module
// and its state through KitProvider; these components only agree on class
// names, so the look lives entirely in the stylesheet.

type Styles = { readonly [key: string]: string };

// What a tool's state hook hands to the fields. Values are loosely typed
// here because each tool has its own settings.
export type ToolApi = {
  values: any;
  set: (key: string, value: any) => void;
  patch: (changes: { [key: string]: any }) => void;
  reset: () => void;
  isDefault: boolean;
  shareUrl: string;
  outcome: Outcome | null;
  map: OutpostMap | null;
  stale: boolean;
  ore: string;
  // the blueprint string to copy
  output: () => string;
  setSide?: (side: number) => void;
  manual?: { w: number; h: number };
  setManual?: (changes: { w?: number; h?: number }) => void;
};

type Params = { [name: string]: string | number };

type Kit = {
  s: Styles;
  o: ToolApi;
  // Translate a localisation key, or fall back to English. Texts can hold
  // {{name}} placeholders, filled from params.
  t: (key: string | undefined, fallback: string, params?: Params) => string;
  // The same, with every filled-in value set in bold.
  rich: (key: string | undefined, fallback: string, params: Params) => React.ReactNode;
};

const fill = (text: string, params?: Params) =>
  params ? text.replace(/{{\s*(\w+)\s*}}/g, (_, name) => String(params[name] ?? '')) : text;

const KitContext = createContext<Kit | null>(null);

export function KitProvider({
  styles,
  tool,
  children,
}: {
  styles: Styles;
  tool: ToolApi;
  children: React.ReactNode;
}) {
  const i18n = useI18n();
  const t = (key: string | undefined, fallback: string, params?: Params) =>
    (key && i18n.t(key, params)) || fill(fallback, params);
  const rich = (key: string | undefined, fallback: string, params: Params) => {
    // mark where each value goes, translate, then swap the marks for bold text
    const marks: Params = {};
    Object.keys(params).forEach((name) => (marks[name] = `\u0001${name}\u0001`));
    return t(key, fallback, marks)
      .split('\u0001')
      .map((part, i) => (i % 2 ? <strong key={i}>{params[part]}</strong> : part));
  };
  return (
    <KitContext.Provider value={{ s: styles, o: tool, t, rich }}>{children}</KitContext.Provider>
  );
}

export function useKit() {
  const kit = useContext(KitContext);
  if (!kit) throw new Error('useKit must be used inside a KitProvider');
  return kit;
}

export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(' ');

// Combines CSS modules: a class defined in several of them gets all of their
// generated names, so a second module can restyle what the first laid out.
export function mergeStyles(...modules: Styles[]): Styles {
  const merged: { [key: string]: string } = {};
  modules.forEach((styles) => {
    Object.keys(styles).forEach((name) => {
      merged[name] = merged[name] ? `${merged[name]} ${styles[name]}` : styles[name];
    });
  });
  return merged;
}

export function optionLabel(kit: Kit, option: Option<any>) {
  return kit.t(option.key, option.label) + (option.suffix || '');
}

type ChoiceProps = {
  value: string | number;
  options: Option<any>[];
  onChange: (value: any) => void;
  label?: string;
  className?: string;
};

// Text options in a row.
export function Seg({ value, options, onChange, label, className }: ChoiceProps) {
  const kit = useKit();
  const { s } = kit;
  return (
    <div className={cx(s.seg, className)} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const on = String(opt.value) === String(value);
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx(s.segOpt, on && s.on)}
            onClick={() => onChange(opt.value)}
          >
            <span className={s.segLabel}>{optionLabel(kit, opt)}</span>
            {opt.sub && <span className={s.segSub}>{kit.t(opt.subKey, opt.sub)}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Options shown as Factorio item icons.
export function Pick({ value, options, onChange, label, className }: ChoiceProps) {
  const kit = useKit();
  const { s } = kit;
  return (
    <div className={cx(s.pick, className)} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const on = String(opt.value) === String(value);
        const text = optionLabel(kit, opt);
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={text}
            title={text}
            className={cx(s.pickOpt, on && s.on)}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon ? (
              <img className={s.pickIcon} src={icon(opt.icon)} alt="" draggable={false} />
            ) : (
              <span className={s.pickNone} aria-hidden="true" />
            )}
            <span className={s.pickLabel}>{text}</span>
            {opt.sub && <span className={s.pickSub}>{kit.t(opt.subKey, opt.sub)}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  iconName,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  iconName?: string;
  className?: string;
}) {
  const { s } = useKit();
  return (
    <label className={cx(s.toggle, checked && s.on, className)}>
      {iconName && (
        <img className={s.toggleIcon} src={icon(iconName)} alt="" draggable={false} />
      )}
      <span className={s.toggleText}>
        <span className={s.toggleLabel}>{label}</span>
        {hint && <span className={s.toggleHint}>{hint}</span>}
      </span>
      <input
        type="checkbox"
        className={s.toggleInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={s.switch} aria-hidden="true">
        <span className={s.switchThumb} />
      </span>
    </label>
  );
}

// Number input that tolerates half-typed values and commits valid ones.
export function NumberBox({
  value,
  min,
  max,
  onChange,
  label,
  className,
}: {
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  // when the value changes from outside, the text follows it
  const [shown, setShown] = useState(value);
  if (shown !== value) {
    setShown(value);
    setDraft(String(value));
  }

  return (
    <input
      className={className}
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={draft}
      onChange={(e) => {
        const text = e.target.value.replace(/[^0-9]/g, '');
        setDraft(text);
        const num = parseInt(text, 10);
        if (!isNaN(num) && num >= min && (max === undefined || num <= max)) {
          onChange(num);
        }
      }}
      onBlur={() => setDraft(String(value))}
      onFocus={(e) => e.target.select()}
    />
  );
}

// Slider for the usual range plus a number box that accepts larger values.
export function Range({
  value,
  min,
  max,
  onChange,
  label,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}) {
  const { s } = useKit();
  const shown = Math.min(Math.max(value, min), max);
  const fill = ((shown - min) / (max - min)) * 100;
  return (
    <div className={cx(s.range, className)}>
      <input
        type="range"
        className={s.rangeInput}
        min={min}
        max={max}
        step={1}
        value={shown}
        aria-label={label}
        style={{ ['--fill' as any]: `${fill}%` }}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <NumberBox
        className={s.rangeNum}
        value={value}
        min={min}
        onChange={onChange}
        label={label}
      />
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  className,
}: {
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}) {
  const { s } = useKit();
  return (
    <div className={cx(s.stepper, className)}>
      <button
        type="button"
        className={s.stepBtn}
        aria-label={`Decrease ${label ?? ''}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <NumberBox
        className={s.stepVal}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        label={label}
      />
      <button
        type="button"
        className={s.stepBtn}
        aria-label={`Increase ${label ?? ''}`}
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7M6 2.5v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function Field({
  label,
  value,
  hint,
  children,
  className,
}: {
  label: string;
  // current choice, shown next to the label for icon-only controls
  value?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { s } = useKit();
  return (
    <div className={cx(s.field, className)}>
      <div className={s.fieldHead}>
        <span className={s.fieldLabel}>{label}</span>
        {value && <span className={s.fieldValue}>{value}</span>}
      </div>
      {children}
      {hint && <div className={s.fieldHint}>{hint}</div>}
    </div>
  );
}

export function TextBox({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const { s } = useKit();
  return (
    <input
      type="text"
      className={cx(s.input, className)}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      spellCheck={false}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
