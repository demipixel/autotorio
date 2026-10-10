// Settings of a tool: defaults, cleaning up loosely typed input (links,
// saved state), and links that carry the settings.

export type Spec<V> = {
  defaults: V;
  // allowed values for settings that are a choice
  enums?: { [K in keyof V]?: (string | number)[] };
  // settings where "0" means none and anything else is a name
  zeroOrName?: (keyof V)[];
  // never saved or put in a link (the pasted blueprint)
  transient?: (keyof V)[];
  // rewrites input that was saved or linked before a setting changed shape
  upgrade?: (raw: { [key: string]: unknown }) => { [key: string]: unknown };
  // last word on a cleaned-up settings object
  fix?: (values: V) => V;
};

// Builds a full settings object from loosely typed input, falling back to
// the default for anything missing or odd.
export function coerce<V>(spec: Spec<V>, raw: { [key: string]: unknown }): V {
  const out: { [key: string]: any } = { ...spec.defaults };
  if (spec.upgrade) raw = spec.upgrade(raw);

  (Object.keys(spec.defaults) as (keyof V & string)[]).forEach((key) => {
    const input = raw[key];
    if (input === undefined || input === null) return;
    const fallback = spec.defaults[key];
    let value: any = input;

    if (typeof fallback === 'boolean') {
      value = input === true || input === 'true';
    } else if (spec.zeroOrName?.includes(key)) {
      value = input === 0 || input === '0' || input === '' ? 0 : String(input);
    } else if (typeof fallback === 'number') {
      const num = parseInt(String(input), 10);
      value = isNaN(num) ? fallback : num;
    } else {
      value = String(input);
    }

    const allowed = spec.enums?.[key];
    if (allowed && !allowed.includes(value)) value = fallback;
    out[key] = value;
  });

  return spec.fix ? spec.fix(out as V) : (out as V);
}

export function fromQuery<V>(spec: Spec<V>, search: string): V | null {
  const params = new URLSearchParams(search);
  const raw: { [key: string]: string } = {};
  let found = false;
  params.forEach((value, key) => {
    if (key in (spec.defaults as object)) {
      raw[key] = value;
      found = true;
    }
  });
  return found ? coerce(spec, raw) : null;
}

// A link that opens the page with these settings. Only what differs from
// the defaults is written, so links stay short; anything left out falls back
// to the default when the link is opened.
export function settingsUrl<V>(spec: Spec<V>, path: string, values: V) {
  const params = (Object.keys(spec.defaults) as (keyof V & string)[])
    .filter((key) => !spec.transient?.includes(key) && values[key] !== spec.defaults[key])
    .map((key) => `${key}=${encodeURIComponent(String(values[key]))}`);
  return `https://autotorio.com${path}${params.length ? '?' + params.join('&') : ''}`;
}

export function isDefault<V>(spec: Spec<V>, values: V) {
  return (Object.keys(spec.defaults) as (keyof V)[]).every(
    (key) => spec.transient?.includes(key) || values[key] === spec.defaults[key],
  );
}
