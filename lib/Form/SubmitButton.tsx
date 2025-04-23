import { createRef, useState } from 'react';

import { useI18n } from 'next-localization';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { SlideTransition } from '../util/SlideTransition';

type Props = {
  values: { [key: string]: any };
  submitButtonText: string;
  generatorFunc: (values: { [key: string]: any }) => string;
};

export default function SubmitButton({
  values,
  submitButtonText,
  generatorFunc,
}: Props) {
  const i18n = useI18n();
  const [open, setOpen] = useState(false);
  const inputRef = createRef<HTMLInputElement>();
  const [[error, bpToCopy], setBpToCopy] = useState<[string | null, string]>([
    null,
    '',
  ]);

  const handleClickOpen = () => {
    setOpen(true);
    setBpToCopy((): [string | null, string] => {
      if (!values.blueprint) {
        return ['You must provide a blueprint to get started.', ''];
      }

      try {
        return [null, generatorFunc(values)];
      } catch (e) {
        console.error(e);
        return [e.message, ''];
      }
    });

    setTimeout(() => {
      navigator.clipboard.writeText(bpToCopy);
      inputRef.current?.select();
    }, 0);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ marginRight: '10px' }}>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {i18n.t(submitButtonText)}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Final Blueprint</DialogTitle>
        <DialogContent style={{ minWidth: '500px' }}>
          {bpToCopy ? (
            <div>
              <TextField
                autoFocus
                fullWidth
                value={bpToCopy}
                inputRef={inputRef}
              />
            </div>
          ) : error ? (
            <div
              style={{
                color: 'rgb(255, 38, 38)',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          ) : (
            // Loading
            <div>
              <div style={{ marginTop: '10px', opacity: '70%' }}>
                Loading...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
