import Link from 'next/link';

import { Frame, s, Shell } from '../lib/site/Shell';

export default function NotFound() {
  return (
    <Shell title="Page Not Found" kind="doc">
      <Frame title="Page Not Found">
        <p className={s.note}>There is nothing at this address.</p>
        <Link href="/outpost" className={s.secondary}>
          Go to the Outpost Generator
        </Link>
      </Frame>
    </Shell>
  );
}
