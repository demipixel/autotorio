import { useI18n } from 'next-localization';

import { FormHelperText, MenuItem, Select } from '@mui/material';

import { FormElem } from './form.type';

type Props = {
  elem: FormElem & { type: 'select' };
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FormSelect({ elem, value, onChange }: Props) {
  const i18n = useI18n();

  return (
    <div>
      <Select name={elem.name} value={value} onChange={onChange}>
        {elem.options.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <MenuItem key={index} value={option}>
                {i18n.t(option) || option}
              </MenuItem>
            );
          }
          return (
            <MenuItem key={index} value={option[0]}>
              {i18n.t(option[1]) + (option[2] || '')}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText css={{ marginX: '7px' }}>
        {elem.info && i18n.t(elem.info)}
      </FormHelperText>
    </div>
  );
}
