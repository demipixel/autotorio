import { createRef, useMemo, useState } from 'react';

import { useI18n } from 'next-localization';
import { useRouter } from 'next/router';

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
};

export default function SettingsUrlButton({ values }: Props) {
  const i18n = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  const handleClickOpen = () => {
    setOpen(true);
    setTimeout(() => {
      navigator.clipboard.writeText(urlToCopy);
      inputRef.current?.select();
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const urlToCopy = useMemo(() => {
    // let url = document.location.origin + document.location.pathname + '?';
    let url = 'https://autotorio.com' + router.pathname + '?';
    for (const key in values) {
      if (key == 'blueprint') continue;

      if (values[key] !== undefined) {
        url += key + '=' + encodeURIComponent(values[key]) + '&';
      }
    }
    return url.slice(0, -1);
  }, [values, router.pathname]);

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handleClickOpen}>
        {i18n.t('settings_url')}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Copy Settings URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={urlToCopy}
            inputRef={inputRef}
          />
          <div style={{ marginTop: '10px', opacity: '70%' }}>
            Save or share this link to get back to this page with all the same
            settings :)
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
