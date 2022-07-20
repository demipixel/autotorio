import Image from 'next/image';

import { Link } from '@mui/material';

export default function Footer() {
  return (
    <div
      css={{
        marginTop: '50px',
        marginBottom: '50px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        fontSize: '12px',
      }}
    >
      <Link
        href="https://www.reddit.com/user/DemiPixel"
        target="_blank"
        css={{ paddingRight: '15px', display: 'flex', alignItems: 'center' }}
      >
        <Image
          src="/img/reddit.png"
          alt="Reddit"
          width="16px"
          height="16px"
          className="invert-color"
        />{' '}
        <div css={{ marginLeft: '5px' }}>/u/DemiPixel</div>
      </Link>
      <div css={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/img/discord.png"
          alt="Discord"
          width="16px"
          height="16px"
          className="invert-color"
        />
        <div css={{ marginLeft: '5px' }}>DemiPixel#5243</div>
      </div>
    </div>
  );
}
