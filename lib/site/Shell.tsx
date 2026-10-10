import { createContext, useContext } from 'react';

import { useI18n } from 'next-localization';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { cx, mergeStyles } from '../kit/controls';
import { LogoMark } from '../Logo';
import skin from '../../styles/factorio.module.css';
import layout from '../../styles/layout.module.css';
import { LanguageMenu, useChrome } from './chrome';
import { GitHubIcon, HeartIcon } from './Icons';

// Every page is one Factorio-style window: a title bar with the site's name,
// the tools as tabs, and the page's frames inside.

// class names of the site's look plus the page layouts
export const s = mergeStyles(skin, layout);

const TitleContext = createContext('');

export function Shell({
  title,
  // "workbench" fills the screen with a settings panel and a stage;
  // "doc" is a plain column of frames
  kind = 'workbench',
  children,
}: {
  title: string;
  kind?: 'workbench' | 'doc';
  children: React.ReactNode;
}) {
  return (
    <TitleContext.Provider value={title}>
      <Head>
        <title>{`${title} | Autotorio`}</title>
        {/* page colour behind the window, including overscroll */}
        <style>{`html,body{background:#161514}`}</style>
      </Head>
      <div className={cx(s.root, kind === 'workbench' ? s.app : s.doc)}>
        <div className={s.window}>
          <TitleBar />
          <Tabs />
          <div className={s.content}>{children}</div>
        </div>
      </div>
    </TitleContext.Provider>
  );
}

export const usePageTitle = () => useContext(TitleContext);

function TitleBar() {
  const i18n = useI18n();
  return (
    <div className={s.titlebar}>
      <Link href="/outpost" className={s.brand}>
        <LogoMark size={24} />
        <span>Autotorio</span>
      </Link>
      <span className={s.grooves} aria-hidden="true" />
      <LanguageMenu s={s} />
      <Link
        href="/github"
        className={s.chromeBtn}
        title={i18n.t('ui.source_code') || 'Source code'}
      >
        <GitHubIcon size={16} />
        <span>GitHub</span>
      </Link>
      <a
        className={s.chromeBtn}
        href="https://www.buymeacoffee.com/DemiPixel"
        target="_blank"
        rel="noreferrer"
      >
        <HeartIcon size={14} />
        <span>{i18n.t('navbar.donate') || 'Donate'}</span>
      </a>
    </div>
  );
}

// The site's tools as the tabs of the window.
function Tabs() {
  const { nav } = useChrome();
  const router = useRouter();
  return (
    <nav className={s.tabs}>
      {nav.map((page) => (
        <Link
          href={page.href}
          key={page.href}
          className={cx(s.tab, router.pathname === page.href && s.on)}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}

export function Frame({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cx(s.frame, className)}>
      <header className={s.subheader}>
        <h2>{title}</h2>
        {aside}
      </header>
      <div className={s.frameBody}>{children}</div>
    </section>
  );
}

export function Disclaimer() {
  const i18n = useI18n();
  return (
    <p className={s.disclaimer}>
      {i18n.t('ui.disclaimer') ||
        'Not affiliated with Wube Software. Factorio is a trademark of Wube Software.'}
    </p>
  );
}
