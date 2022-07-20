import { useI18n } from 'next-localization';

import { TextField } from '@mui/material';

import { FormElem } from './form.type';

type Props = {
  elem: FormElem & { type: 'textarea' };
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FormTextarea({ elem, value, onChange }: Props) {
  const i18n = useI18n();

  return (
    <TextField
      multiline
      fullWidth
      rows={3}
      placeholder={i18n.t(elem.placeholder) || elem.placeholder}
      name={elem.name}
      helperText={
        elem.info &&
        i18n
          .t(elem.info)
          .split('<br>')
          .map((line, index, arr) => (
            <>
              {line
                .split('**')
                .filter((part) => !!part)
                .map((part, index) =>
                  index % 2 === 1 ? (
                    <b key={index}>{part}</b>
                  ) : (
                    <span key={index}>{part}</span>
                  ),
                )}
              {index !== arr.length - 1 && <br />}
            </>
          ))
      }
      value={value}
      onChange={onChange}
    />
  );
}
