import { useI18n } from 'next-localization';

import {
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import { FormElem } from './form.type';
import FormReplacer from './FormReplacer';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

type Props = {
  elem: FormElem;
  value: any;
  checkboxValue?: any;
  activated: boolean;
  handleInputChange: (
    name: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (
    name: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (
    name: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleReplacerChange: (
    name: string,
  ) => (val: { from: string; to: string }[]) => void;
};

export default function FormElement(props: Props) {
  const i18n = useI18n();

  const {
    elem,
    value,
    checkboxValue,
    activated,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChange,
    handleReplacerChange,
  } = props;

  let innerElem;
  if (elem.type === 'textarea') {
    innerElem = (
      <FormTextarea
        elem={elem}
        value={value}
        onChange={handleInputChange(elem.name)}
      />
    );
  } else if (elem.type === 'select') {
    innerElem = (
      <FormSelect
        elem={elem}
        value={value}
        onChange={handleSelectChange(elem.name)}
      />
    );
  } else if (elem.type === 'input') {
    innerElem = (
      <TextField
        type="text"
        name={elem.name}
        placeholder={i18n.t(elem.placeholder) || elem.placeholder}
        helperText={elem.info && i18n.t(elem.info)}
        value={value}
        onChange={handleInputChange(elem.name)}
      />
    );
  } else if (elem.type === 'hr') {
    innerElem = <Divider variant="fullWidth" />;
  } else if (elem.type === 'replacer') {
    innerElem = (
      <FormReplacer
        replacerType={elem.replacer}
        onChange={handleReplacerChange(elem.name)}
        value={value}
        items={elem.items}
      />
    );
  }

  const error = 'name' in elem ? getError(elem, value) : false;

  return (
    <div
      css={{
        overflow: 'hidden',
        transition: 'max-height 0.5s ease-in-out',
      }}
      className={
        elem.type !== 'textarea' && elem.type !== 'replacer'
          ? activated
            ? 'activated'
            : 'not-activated'
          : ''
      }
    >
      <Grid container spacing={5} css={{ marginBottom: '20px' }}>
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            textAlign: { md: 'right' },
            marginLeft: { xs: '15px', md: '' },
          }}
        >
          <Typography
            variant={elem.type === 'header' ? 'h6' : 'body2'}
            css={{
              opacity: '70%',
              marginTop: '11px',
            }}
          >
            {'title' in elem ? i18n.t(elem.title) : ''}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            marginLeft: { xs: '15px', md: '' },
            marginRight: '15px',
            // paddingTop: { xs: '5px !important', md: '' },
          }}
        >
          <FormControl sx={{ minWidth: 120 }} error={!!error} fullWidth>
            {innerElem}
            {'checkbox' in elem && (
              <div css={{ display: 'flex', alignItems: 'center' }}>
                <div
                  id={
                    elem.checkbox.name.startsWith('flip')
                      ? elem.checkbox.name
                      : undefined
                  }
                  className={checkboxValue ? 'checked' : ''}
                >
                  <Checkbox
                    name={elem.checkbox.name}
                    checked={checkboxValue}
                    onChange={handleCheckboxChange(elem.checkbox.name)}
                  />
                </div>
                {elem.checkbox.info && (
                  <Typography variant="body2">
                    {i18n.t(elem.checkbox.info)}
                  </Typography>
                )}
              </div>
            )}
            <FormLabel error>{error}</FormLabel>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
}

function getError(elem: FormElem, value: any) {
  if (elem.type === 'input' && elem.number) {
    if (value === '' && elem.placeholder !== undefined) {
      return false;
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return 'You must enter a number!';
    } else if (elem.minimum !== undefined && num < elem.minimum) {
      return `This number cannot be less than ${elem.minimum}!`;
    } else if (elem.maximum !== undefined && num > elem.maximum) {
      return `This number cannot be greater than ${elem.maximum}!`;
    }
  }

  return false;
}
