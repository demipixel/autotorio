export type FormElem = {
  activate?: string;
  checkbox?: {
    name: string;
    info?: string;
    checked?: boolean;
  };
  info?: string;
} & (
  | {
      type: 'textarea';
      title: string;
      name: string;
      placeholder?: string;
    }
  | {
      type: 'select';
      title: string;
      name: string;
      options: [number | string, string, string?][] | string[];
      default?: number;
    }
  | {
      type: 'input';
      title: string;
      name: string;
      placeholder?: string;
      number?: boolean;
      minimum?: number;
      maximum?: number;
    }
  | {
      type: 'header';
      title: string;
    }
  | { type: 'hr' }
  | { type: 'replacer'; replacer: string; name: string; items: string[] }
  | {
      type?: 'none';
    }
);
