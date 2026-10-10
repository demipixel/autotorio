import { useEffect } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

// next.config.js redirects "/" to "/outpost" when running behind a server,
// but redirects are not applied in static exports, so this page covers that case.
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/outpost');
  }, [router]);

  return (
    <Head>
      <title>Autotorio | Factorio Blueprint Tools</title>
      <meta httpEquiv="refresh" content="0;url=/outpost" />
    </Head>
  );
}
