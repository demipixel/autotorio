const browserify = require('browserify');
const fs = require('fs');

if (!fs.existsSync('assets/build')) {
  fs.mkdirSync('assets/build');
}

browserify('node_modules/factorio-generators', {
  standalone: 'factorioGenerators'
})
  .transform('babelify', { presets: ['es2015'] })
  .transform(require('aliasify'), {
    aliases: {
      zlib: 'browserify-zlib-next'
    }
  })
  // .transform({ global: true }, 'uglifyify')
  .bundle()
  .pipe(fs.createWriteStream('assets/build/factorio-generators.js'));