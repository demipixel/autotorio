import React, { useEffect, useState } from 'react';

import { useI18n } from 'next-localization';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

import { ArrowDropDown } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { GlobalStyles } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const pages = [
  {
    name: 'navbar.outpost_generator',
    path: '/outpost',
  },
  {
    name: 'navbar.blueprint_tool',
    path: '/blueprint',
  },
  {
    name: 'navbar.oil_outpost_generator',
    path: '/oil',
  },
];

const languages = [
  ['English', 'en'],
  ['Spanish', 'es'],
  ['Portuguese (Brazilian)', 'pt-br'],
  ['French', 'fr'],
  ['Italian', 'it'],
  ['German', 'de'],
  ['Polish', 'pl'],
  ['中文 (Chinese)', 'cn'],
  ['Русский (Russian)', 'ru'],
];

export default function Header() {
  const i18n = useI18n();
  const [cookie, setCookie] = useCookies(['dark', 'language']);

  useEffect(() => {
    document.body.classList[cookie.dark === 'true' ? 'add' : 'remove'](
      'dark-mode',
    );
  }, [cookie.dark]);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLang(event.currentTarget);
  };
  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };

  return (
    <AppBar position="static" css={{ backgroundColor: '#0c84e4' }}>
      <GlobalStyles styles={{ helperText: { color: '#f00' } }} />
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link href="/outpost">
            <Image
              src="/img/autotorio.png"
              alt="Autotorio"
              width={978 / 5}
              height={201 / 5}
              css={{ cursor: 'pointer' }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                marginLeft: 'auto',
              }}
            >
              {pages.map(({ name, path }) => (
                <Link href={path} key={path}>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{name}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              marginLeft: '20px',
            }}
          >
            {pages.map(({ name, path }) => (
              <HeaderButton key={name} href={path}>
                {i18n.t(name)}
              </HeaderButton>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HeaderButton
              onClick={handleOpenLangMenu}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <div>Language</div>
              <div>
                <ArrowDropDown sx={{ marginTop: '5px' }} />
              </div>
            </HeaderButton>
            <Menu
              anchorEl={anchorElLang}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElLang)}
              onClose={handleCloseLangMenu}
              sx={{
                marginLeft: 'auto',
              }}
            >
              {languages.map(([name, code]) => (
                <MenuItem
                  onClick={() => {
                    handleCloseLangMenu();
                    setCookie('language', code);
                  }}
                  key={code}
                  selected={code === 'en'}
                >
                  <Typography textAlign="center">{name}</Typography>
                </MenuItem>
              ))}
              <a
                href="https://github.com/demipixel/autotorio/blob/master/localisation.json"
                target="_blank"
                rel="noreferrer"
                css={{ all: 'unset' }}
              >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Help out!</Typography>
                </MenuItem>
              </a>
            </Menu>
          </Box>
          <HeaderButton
            onClick={() => {
              const cur = document.body.classList.contains('dark-mode');
              setCookie('dark', !cur);
            }}
          >
            Dark Mode
          </HeaderButton>
          <a
            href="https://www.buymeacoffee.com/DemiPixel"
            target="_blank"
            rel="noreferrer"
            css={{ all: 'unset' }}
          >
            <HeaderButton>Donate</HeaderButton>
          </a>
          <HeaderButton href="/github">Github</HeaderButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

const HeaderButton = ({
  sx,
  ...props
}: ButtonProps & { isSelected?: boolean }) => {
  const router = useRouter();

  return (
    <Button
      sx={{
        color: 'white',
        background: router.pathname === props.href ? '#fff3' : '',
        display: 'block',
        paddingX: '10px',
        marginX: '5px',
        ...sx,
      }}
      {...props}
    />
  );
};
