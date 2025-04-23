import { useMemo } from 'react';

import Image from 'next/image';

import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Button,
  ButtonGroup,
  FormControl,
  TextField,
} from '@mui/material';

type Value = { from: string; to: string }[];
type Props = {
  replacerType: string;
  onChange: (newVal: Value) => void;
  value: Value;
  items: string[];
};

export default function FormReplacer({
  replacerType,
  onChange,
  value = [],
  items,
}: Props) {
  const fromItems = items;
  const toItems = useMemo(
    () => items.filter((item) => !item.startsWith('includes:')),
    [items],
  );
  return (
    <div>
      <ButtonGroup>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onChange([...value, { from: fromItems[0], to: toItems[0] }]);
          }}
        >
          New {replacerType[0].toUpperCase() + replacerType.slice(1)} Replacer
        </Button>
      </ButtonGroup>
      <div style={{ marginTop: '20px' }}>
        {value.map(({ from, to }, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <FactorioItemSelect
              items={fromItems}
              value={from}
              onChange={(newFrom) => {
                const newValue = [...value];
                newValue[index].from = newFrom;
                onChange(newValue);
              }}
            />
            <ArrowRightAltIcon
              style={{ margin: 'auto 20px', fontSize: '50px' }}
            />
            <FactorioItemSelect
              items={toItems}
              value={to}
              onChange={(newTo) => {
                const newValue = [...value];
                newValue[index].to = newTo;
                onChange(newValue);
              }}
            />
            <Button
              style={{ marginLeft: '10px', fontSize: '30px' }}
              onClick={() => {
                const newValue = [...value];
                newValue.splice(index, 1);
                onChange(newValue);
              }}
            >
              <DeleteIcon />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

type FactorioItemSelectProps = {
  items: string[];
  value: string;
  onChange: (newVal: string) => void;
};

const FactorioItemSelect = ({
  items,
  value,
  onChange,
}: FactorioItemSelectProps) => {
  return (
    <FormControl>
      <Autocomplete
        style={{ width: '300px', marginTop: '10px', marginBottom: '10px' }}
        options={items}
        getOptionLabel={(item) => getFactorioItemLabel(item)}
        renderOption={(props, item) => (
          <li style={{ display: 'flex', alignItems: 'center' }} {...props}>
            <FactorioItemIcon items={items} item={item} />
            <div style={{ marginLeft: '10px' }}>
              {getFactorioItemLabel(item)}
            </div>
          </li>
        )}
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            // label="Choose a country"
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: <FactorioItemIcon items={items} item={value} />,
            }}
          />
        )}
      />
    </FormControl>
  );
};

const FactorioItemIcon = ({ item, items }: { item: string; items: string[] }) =>
  !item ? (
    <div></div>
  ) : item.startsWith('includes:') ? (
    <div
      style={{
        position: 'relative',
        width: '40px',
        height: '24px',
      }}
    >
      {items
        .filter(
          (otherItem) =>
            otherItem.includes(item.replace('includes:', '')) &&
            !otherItem.startsWith('includes:'),
        )
        .filter((_, index, arr) => (arr.length > 3 ? index % 3 === 0 : true))
        .reverse()
        .map((otherItem, i) => (
          <div
            key={otherItem}
            style={{
              position: 'absolute',
              top: '0px',
              left: i * 5 + 'px',
            }}
          >
            <Image
              src={'/img/factorio-icons/' + otherItem + '.png'}
              alt=""
              width="24px"
              height="24px"
            />
          </div>
        ))}
    </div>
  ) : (
    <Image
      src={'/img/factorio-icons/' + item + '.png'}
      alt=""
      width="24px"
      height="24px"
    />
  );

const getFactorioItemLabel = (item: string) => {
  const readableName = item
    .replace('includes:', '')
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

  return item.startsWith('includes:')
    ? 'All ' + readableName + 's'
    : readableName;
};
