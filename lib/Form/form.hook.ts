import { useState } from 'react';

import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

import { SelectChangeEvent } from '@mui/material';

import { FormElem } from './form.type';

export function useForm(content: FormElem[]) {
  const { query } = useRouter();
  const [values, setValues] = useState<{ [key: string]: any }>(
    getInitialValuesFromDefaults(content, query),
  );

  const [activators, setActivators] = useState<{ [key: string]: boolean }>(
    content.reduce((obj, elem) => {
      if ('checkbox' in elem && elem.checkbox.checked) {
        obj[elem.checkbox.name] = true;
      }

      return obj;
    }, {} as { [key: string]: boolean }),
  );

  const handleInputChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [name]: event.target.value });
    };

  const handleCheckboxChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [name]: event.target.checked });
      if ((activators[name] || false) !== event.target.checked) {
        setActivators({ ...activators, [name]: event.target.checked });
      }
    };

  const handleSelectChange = (name: string) => (event: SelectChangeEvent) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleReplacerChange =
    (name: string) => (val: { from: string; to: string }[]) => {
      setValues({ ...values, [name]: val });
    };

  return {
    values,
    activators,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChange,
    handleReplacerChange,
  };
}

function getInitialValuesFromDefaults(
  content: FormElem[],
  query: ParsedUrlQuery,
) {
  const values = {};
  content.forEach((elem) => {
    if ('checkbox' in elem) {
      values[elem.checkbox.name] = query[elem.checkbox.name]
        ? query[elem.checkbox.name] === 'true'
        : elem.checkbox.checked || false;
    }

    if (elem.type === 'input' || elem.type === 'textarea') {
      values[elem.name] = query[elem.name]?.toString() || '';
    } else if (elem.type === 'select') {
      let def = query[elem.name]?.toString() ?? elem.default ?? 0;
      if (!elem.options[def]) {
        def = 0;
      }

      values[elem.name] =
        typeof elem.options[def] === 'string'
          ? elem.options[def]
          : elem.options[def][0];
    }
  });
  return values;
}
