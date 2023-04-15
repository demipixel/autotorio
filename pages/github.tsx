import Footer from '../lib/Footer';
import Header from '../lib/Header';

export default function Github() {
  return (
    <div>
      <Header />
      <div style={{ padding: '0px 30px' }}>
        <h1> Github Links </h1>

        <h4>
          All the source code for this site and everything this site uses is
          public and open source!
        </h4>

        <hr />

        <h3>
          <a href="https://github.com/demipixel/autotorio">This website</a>{' '}
          (Report issues with the site itself here)
        </h3>

        <h3>
          <a href="https://github.com/demipixel/factorio-generators">
            Generators used on this website
          </a>{' '}
          (Report issues or feature requests for the tools)
        </h3>

        <h3>
          <a href="https://github.com/demipixel/factorio-blueprint">
            Blueprint library used by generators
          </a>{' '}
          (Probably only developers care about this)
        </h3>
      </div>
      <Footer />
    </div>
  );
}
